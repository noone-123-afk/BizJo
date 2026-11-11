import Decimal from 'decimal.js';

Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP });

export interface EmployeeProvisionInput {
  employeeId: string;
  employeeName: string;
  hireDate: string;
  calculationDate: string;
  lastGrossMonthlySalary: number | string;
  unusedLeaveDaysBalance: number;
  isCoveredBySscPension: boolean;
}

export interface ProvisionCalculationResult {
  employeeId: string;
  employeeName: string;
  serviceDurationDays: number;
  serviceDurationYears: string;
  serviceDurationMonths: string;
  dailyWageJod: string;
  endOfServiceBenefitJod: string;
  leaveEncashmentJod: string;
  totalSettlementLiabilityJod: string;
  accountingJournalEntry: {
    debitExpenseAccount: string;
    creditProvisionAccount: string;
    amountJod: string;
  };
}

export class LabourLawProvisionEngine {
  public static calculateProvision(input: EmployeeProvisionInput): ProvisionCalculationResult {
    const salary = Decimal.max(0, new Decimal(input.lastGrossMonthlySalary || 0)).toDecimalPlaces(3);
    const start = new Date(input.hireDate);
    const end = new Date(input.calculationDate);

    const diffTime = Math.max(0, end.getTime() - start.getTime());
    const exactDays = Math.round(diffTime / (1000 * 3600 * 24));
    const totalDaysDec = new Decimal(exactDays);

    // وفق قانون العمل الأردني رقم 8 لسنة 1996 (المادة 32): السنة المعيّرة 365 يوماً، والشهر 30 يوماً لاحتساب الأجر اليومي
    const totalYears = totalDaysDec.dividedBy(365);
    const totalMonths = totalYears.times(12);

    let endOfServiceBenefit = new Decimal(0);
    // المادة 32 من قانون العمل الأردني: راتب شهر عن كل سنة خدمة (وتحتسب كسور السنة بنسبة ما قضاه في العمل) لغير المشمولين بالضمان
    if (!input.isCoveredBySscPension && exactDays > 0) {
      endOfServiceBenefit = salary.times(totalYears).toDecimalPlaces(3, Decimal.ROUND_HALF_UP);
    }

    const dailyWage = salary.dividedBy(30).toDecimalPlaces(3, Decimal.ROUND_HALF_UP);
    const leaveDays = Decimal.max(0, new Decimal(input.unusedLeaveDaysBalance || 0));
    // المادة 61: بدل رصيد الإجازات السنوية غير المستعملة على أساس الأجر اليومي (الراتب ÷ 30 × عدد الأيام)
    const leaveEncashment = salary
      .dividedBy(30)
      .times(leaveDays)
      .toDecimalPlaces(3, Decimal.ROUND_HALF_UP);

    const totalLiability = endOfServiceBenefit.plus(leaveEncashment).toDecimalPlaces(3, Decimal.ROUND_HALF_UP);

    return {
      employeeId: input.employeeId,
      employeeName: input.employeeName,
      serviceDurationDays: exactDays,
      serviceDurationYears: totalYears.toFixed(3),
      serviceDurationMonths: totalMonths.toFixed(1),
      dailyWageJod: dailyWage.toFixed(3),
      endOfServiceBenefitJod: endOfServiceBenefit.toFixed(3),
      leaveEncashmentJod: leaveEncashment.toFixed(3),
      totalSettlementLiabilityJod: totalLiability.toFixed(3),
      accountingJournalEntry: {
        debitExpenseAccount: '50109 - مصاريف منافع ومخصصات نهاية الخدمة وإجازات العاملين',
        creditProvisionAccount: '20308 - مخصص التزامات ومكافآت نهاية الخدمة المتراكمة',
        amountJod: totalLiability.toFixed(3),
      },
    };
  }
}

export interface EmployeeServiceInput {
  employeeId: string;
  employeeName: string;
  hireDateIso: string;
  calculationDateIso: string;
  lastGrossMonthlySalaryJod: number;
  isSubjectToSocialSecurity: boolean;
  unusedAnnualLeaveDays: number;
  terminationScenario: 'ACTIVE_SERVICE' | 'MUTUAL_OR_LAWFUL_END' | 'ARBITRARY_DISMISSAL_ART_25';
}

export function calculateEmployeeLabourProvisions(input: EmployeeServiceInput) {
  const salaryDec = Decimal.max(0, new Decimal(input.lastGrossMonthlySalaryJod || 0)).toDecimalPlaces(3);
  const start = new Date(input.hireDateIso);
  const end = new Date(input.calculationDateIso);
  const diffMs = Math.max(0, end.getTime() - start.getTime());
  const exactDays = Math.round(diffMs / (1000 * 3600 * 24));
  const yearsDec = new Decimal(exactDays).dividedBy(365);

  const dailyWageDec = salaryDec.dividedBy(30).toDecimalPlaces(3);
  const leaveDaysDec = Decimal.max(0, new Decimal(input.unusedAnnualLeaveDays || 0));
  const leaveEncashmentDec = dailyWageDec.times(leaveDaysDec).toDecimalPlaces(3);

  // Article 32 End of Service Indemnity: 1 month per year of service if NOT covered by Social Security
  const endOfServiceDec = !input.isSubjectToSocialSecurity
    ? salaryDec.times(yearsDec).toDecimalPlaces(3)
    : new Decimal(0);

  // Article 25 Arbitrary Dismissal: half month per year of service (minimum 2 months) + 1 month notice (Art 23)
  let arbitraryDismissalDec = new Decimal(0);
  let noticePeriodDec = new Decimal(0);
  if (input.terminationScenario === 'ARBITRARY_DISMISSAL_ART_25') {
    const halfMonthPerYearDec = salaryDec.times('0.5').times(yearsDec);
    const minTwoMonthsDec = salaryDec.times(2);
    arbitraryDismissalDec = Decimal.max(minTwoMonthsDec, halfMonthPerYearDec).toDecimalPlaces(3);
    noticePeriodDec = salaryDec.toDecimalPlaces(3);
  }

  const taxDeductibilityNoteAr =
    'بموجب قانون ضريبة الدخل الأردني رقم (34) لسنة 2014، فإن المخصصات المحاسبية التقديرية (مثل مخصص الإجازات ومكافأة نهاية الخدمة غير المسددة فعلياً) تُعد مصاريف غير مقبولة ضريبياً في سنة تكوينها وتُرد للوعاء الضريبي، ولا يُسمح بتنزيلها إلا عند الدفع الفعلي للموظف أو التوريد للمؤسسة العامة للضمان الاجتماعي.';

  return {
    exactServiceDays: exactDays,
    yearsOfService: Number(yearsDec.toFixed(2)),
    dailyWageJod: dailyWageDec.toNumber(),
    endOfServiceIndemnityJod: endOfServiceDec.toNumber(),
    leaveEncashmentProvisionJod: leaveEncashmentDec.toNumber(),
    arbitraryDismissalCompensationJod: arbitraryDismissalDec.toNumber(),
    noticePeriodPayJod: noticePeriodDec.toNumber(),
    taxDeductibilityNoteAr,
  };
}

