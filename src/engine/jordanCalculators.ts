import Decimal from 'decimal.js';
import { RegulatoryRatesStore } from '../services/config/RegulatoryRatesStore';

Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP });

export interface TaxCalculationParams {
  grossAnnualIncome: number | string;
  isMarried: boolean;
  dependentsCount: number; // بحد أقصى 3 معالين (1,000 د.أ لكل معال)
  medicalAndEducationExpenses: number | string; // فواتير علاج وتعليم وإيجار وفوائد قروض سكنية موثقة
  deductEmployeeSscFromTax?: boolean; // خيار تنزيل مساهمة الموظف بالضمان الاجتماعي
  annualEmployeeSscAmount?: number | string;
}

export interface SscCalculationParams {
  monthlyGrossSalary: number | string;
  isHazardousOccupation: boolean;
}

export class JordanIncomeTaxEngine {
  public static calculatePersonalTax(params: TaxCalculationParams) {
    const dbConfig = RegulatoryRatesStore.getConfig();
    const ex = dbConfig.incomeTaxExemptions;

    const personalExemptionDec = new Decimal(ex.personalExemptionJod || 9000);
    const familyExemptionDec = new Decimal(ex.familyExemptionJod || 9000);
    const dependentAllowanceDec = new Decimal(ex.dependentExemptionPerChildJod || 1000);
    const maxExpenseSingleDec = new Decimal(ex.maxExpenseExemptionSingleJod || 1000);
    const maxAddFamilyDec = new Decimal(ex.maxAdditionalFamilyExemptionsJod || 5000);
    const maxTotalFamilyCapDec = new Decimal(ex.maxTotalFamilyExemptionCapJod || 23000);
    const maxTotalSingleCapDec = new Decimal(ex.maxTotalSingleExemptionCapJod || 10000);

    const gross = Decimal.max(0, new Decimal(params.grossAnnualIncome || 0)).toDecimalPlaces(3);
    let baseExemption = personalExemptionDec;
    let additionalAllowed = new Decimal(0);

    if (params.isMarried) {
      baseExemption = baseExemption.plus(familyExemptionDec);
      const maxDeps = Math.max(0, ex.maxDependentsCount ?? 3);
      const deps = Math.min(Math.max(Math.floor(params.dependentsCount || 0), 0), maxDeps);
      const depExemption = dependentAllowanceDec.times(deps);
      const documentedExp = Decimal.max(0, new Decimal(params.medicalAndEducationExpenses || 0));
      additionalAllowed = Decimal.min(depExemption.plus(documentedExp), maxAddFamilyDec);
    } else {
      const documentedExp = Decimal.max(0, new Decimal(params.medicalAndEducationExpenses || 0));
      additionalAllowed = Decimal.min(documentedExp, maxExpenseSingleDec);
    }

    const statutoryExemptionCap = params.isMarried ? maxTotalFamilyCapDec : maxTotalSingleCapDec;

    let totalExemptions = Decimal.min(
      baseExemption.plus(additionalAllowed),
      statutoryExemptionCap
    ).toDecimalPlaces(3);

    if (params.deductEmployeeSscFromTax && params.annualEmployeeSscAmount) {
      const sscDed = Decimal.max(0, new Decimal(params.annualEmployeeSscAmount || 0)).toDecimalPlaces(3);
      totalExemptions = totalExemptions.plus(sscDed);
    }

    const taxableIncome = Decimal.max(0, gross.minus(totalExemptions)).toDecimalPlaces(3);
    let remaining = new Decimal(taxableIncome);
    let totalBracketTax = new Decimal(0);

    const brackets = dbConfig.incomeTaxBrackets.map((b) => ({
      label: `${b.labelAr} (${new Decimal(b.rateDecimal).times(100).toFixed(1)}%)`,
      cap: new Decimal(b.sliceCapJod),
      rate: new Decimal(b.rateDecimal),
    }));

    const bracketBreakdown: Array<{ label: string; taxableAmount: string; taxAmount: string; rate: string }> = [];

    for (const b of brackets) {
      if (remaining.lessThanOrEqualTo(0)) {
        bracketBreakdown.push({
          label: b.label,
          taxableAmount: '0.000',
          taxAmount: '0.000',
          rate: `${b.rate.times(100).toFixed(1)}%`,
        });
        continue;
      }
      const chunk = Decimal.min(remaining, b.cap).toDecimalPlaces(3);
      const chunkTax = chunk.times(b.rate).toDecimalPlaces(3);
      totalBracketTax = totalBracketTax.plus(chunkTax);
      remaining = remaining.minus(chunk);
      bracketBreakdown.push({
        label: b.label,
        taxableAmount: chunk.toFixed(3),
        taxAmount: chunkTax.toFixed(3),
        rate: `${b.rate.times(100).toFixed(1)}%`,
      });
    }

    const natThreshold = new Decimal(ex.individualNatContribThresholdJod || 200000);
    const natRate = new Decimal(ex.individualNatContribRateDecimal || 0.01);

    const nationalContribution = taxableIncome.greaterThan(natThreshold)
      ? taxableIncome.minus(natThreshold).times(natRate).toDecimalPlaces(3)
      : new Decimal(0);

    const finalTax = totalBracketTax.plus(nationalContribution).toDecimalPlaces(3);
    const monthlyWithholding = finalTax.dividedBy(12).toDecimalPlaces(3);

    return {
      grossIncome: gross.toFixed(3),
      baseExemptionJod: baseExemption.toFixed(3),
      additionalExemptionJod: additionalAllowed.toFixed(3),
      statutoryExemptionCapJod: statutoryExemptionCap.toFixed(3),
      totalExemptions: totalExemptions.toFixed(3),
      taxableIncome: taxableIncome.toFixed(3),
      incomeTaxBeforeNatContribJod: totalBracketTax.toFixed(3),
      nationalContributionJod: nationalContribution.toFixed(3),
      totalTaxDue: finalTax.toFixed(3),
      effectiveRate:
        gross.greaterThan(0) && finalTax.greaterThan(0)
          ? finalTax.dividedBy(gross).times(100).toDecimalPlaces(2).toFixed(2) + '%'
          : '0.00%',
      monthlyWithholding: monthlyWithholding.toFixed(3),
      bracketBreakdown,
      regulatoryVersionTag: dbConfig.versionTag,
    };
  }

  public static calculateSocialSecurity(params: SscCalculationParams) {
    const dbConfig = RegulatoryRatesStore.getConfig();
    const ssc = dbConfig.socialSecurity;

    const salary = Decimal.max(0, new Decimal(params.monthlyGrossSalary || 0)).toDecimalPlaces(3);
    const ceilingDec = new Decimal(ssc.insurableSalaryCeilingMonthlyJod || 3612);
    const floorDec = new Decimal(ssc.insurableSalaryFloorMonthlyJod || 290);
    const insurableSalary = Decimal.min(salary, ceilingDec).toDecimalPlaces(3);

    // تفصيل نسب المؤمن عليه (الموظف)
    const empOldAgeRate = new Decimal(ssc.employeeOldAgeDisabilityDeathRate ?? 0.065);
    const empUnempRate = new Decimal(ssc.employeeUnemploymentRate ?? 0.01);
    const employeeShareRate = empOldAgeRate.plus(empUnempRate);

    // تفصيل نسب المنشأة (صاحب العمل)
    const emprOldAgeRate = new Decimal(ssc.employerOldAgeDisabilityDeathRate ?? 0.11);
    const emprWorkInjuryRate = new Decimal(ssc.employerWorkInjuryRate ?? 0.02);
    const emprMaternityRate = new Decimal(ssc.employerMaternityRate ?? 0.0075);
    const emprUnempRate = new Decimal(ssc.employerUnemploymentRate ?? 0.005);
    const employerRegularRate = emprOldAgeRate
      .plus(emprWorkInjuryRate)
      .plus(emprMaternityRate)
      .plus(emprUnempRate);

    const hazardExtraRate = params.isHazardousOccupation
      ? new Decimal(ssc.employerHazardousExtraRate ?? 0.01)
      : new Decimal(0);
    const totalEmployerRate = employerRegularRate.plus(hazardExtraRate);

    // المبالغ التفصيلية لكل فرع تأميني شهرياً (بدقة 3 خانات عشرية - فلس)
    const oldAgeEmployeeJod = insurableSalary.times(empOldAgeRate).toDecimalPlaces(3);
    const unemploymentEmployeeJod = insurableSalary.times(empUnempRate).toDecimalPlaces(3);
    const employeeDeduction = oldAgeEmployeeJod.plus(unemploymentEmployeeJod).toDecimalPlaces(3);

    const oldAgeEmployerJod = insurableSalary.times(emprOldAgeRate).toDecimalPlaces(3);
    const workInjuryEmployerJod = insurableSalary.times(emprWorkInjuryRate).toDecimalPlaces(3);
    const maternityEmployerJod = insurableSalary.times(emprMaternityRate).toDecimalPlaces(3);
    const unemploymentEmployerJod = insurableSalary.times(emprUnempRate).toDecimalPlaces(3);
    const hazardousEmployerJod = insurableSalary.times(hazardExtraRate).toDecimalPlaces(3);

    const employerContribution = oldAgeEmployerJod
      .plus(workInjuryEmployerJod)
      .plus(maternityEmployerJod)
      .plus(unemploymentEmployerJod)
      .plus(hazardousEmployerJod)
      .toDecimalPlaces(3);

    const totalSscRemittance = employeeDeduction.plus(employerContribution).toDecimalPlaces(3);

    return {
      insurableSalaryJod: insurableSalary.toFixed(3),
      insurableCeilingJod: ceilingDec.toFixed(3),
      minimumWageFloorJod: floorDec.toFixed(3),
      isBelowMinimumWage: salary.gt(0) && salary.lt(floorDec),
      employeeShareJod: employeeDeduction.toFixed(3),
      employerShareJod: employerContribution.toFixed(3),
      totalMonthlySscJod: totalSscRemittance.toFixed(3),
      annualEmployeeSscJod: employeeDeduction.times(12).toDecimalPlaces(3).toFixed(3),
      annualEmployerSscJod: employerContribution.times(12).toDecimalPlaces(3).toFixed(3),
      annualTotalSscJod: totalSscRemittance.times(12).toDecimalPlaces(3).toFixed(3),
      netSalaryBeforeTaxJod: salary.minus(employeeDeduction).toDecimalPlaces(3).toFixed(3),
      employeeRatePercent: `${employeeShareRate.times(100).toFixed(2)}%`,
      employerRatePercent: `${totalEmployerRate.times(100).toFixed(2)}%`,
      totalRatePercent: `${employeeShareRate.plus(totalEmployerRate).times(100).toFixed(2)}%`,
      subInsuranceBreakdown: {
        employeeOldAgeJod: oldAgeEmployeeJod.toFixed(3),
        employeeOldAgeRatePct: `${empOldAgeRate.times(100).toFixed(2)}%`,
        employeeUnemploymentJod: unemploymentEmployeeJod.toFixed(3),
        employeeUnemploymentRatePct: `${empUnempRate.times(100).toFixed(2)}%`,
        employerOldAgeJod: oldAgeEmployerJod.toFixed(3),
        employerOldAgeRatePct: `${emprOldAgeRate.times(100).toFixed(2)}%`,
        employerWorkInjuryJod: workInjuryEmployerJod.toFixed(3),
        employerWorkInjuryRatePct: `${emprWorkInjuryRate.times(100).toFixed(2)}%`,
        employerMaternityJod: maternityEmployerJod.toFixed(3),
        employerMaternityRatePct: `${emprMaternityRate.times(100).toFixed(2)}%`,
        employerUnemploymentJod: unemploymentEmployerJod.toFixed(3),
        employerUnemploymentRatePct: `${emprUnempRate.times(100).toFixed(2)}%`,
        employerHazardousJod: hazardousEmployerJod.toFixed(3),
        employerHazardousRatePct: `${hazardExtraRate.times(100).toFixed(2)}%`,
      },
    };
  }
}

export const JORDAN_GENERAL_SALES_TAX_RATE = 0.16;

export type WhtServiceCategory =
  | 'NON_RESIDENT_SERVICE_10'
  | 'RESIDENT_PROFESSIONAL_5'
  | 'CONTRACTING_AND_COMMISSION_2'
  | 'BANK_DEPOSIT_INTEREST_INDIVIDUAL_5'
  | 'BANK_DEPOSIT_INTEREST_CORPORATE_7';

export function calculateWhtAndReverseCharge(
  grossInvoiceAmount: number,
  category: WhtServiceCategory,
  applyReverseChargeVat: boolean
) {
  const grossDec = Decimal.max(0, new Decimal(grossInvoiceAmount || 0)).toDecimalPlaces(3);
  const rateMap: Record<WhtServiceCategory, Decimal> = {
    NON_RESIDENT_SERVICE_10: new Decimal('0.10'),
    RESIDENT_PROFESSIONAL_5: new Decimal('0.05'),
    CONTRACTING_AND_COMMISSION_2: new Decimal('0.02'),
    BANK_DEPOSIT_INTEREST_INDIVIDUAL_5: new Decimal('0.05'),
    BANK_DEPOSIT_INTEREST_CORPORATE_7: new Decimal('0.07'),
  };

  const whtRateDec = rateMap[category] || new Decimal('0.05');
  const whtDeductedDec = grossDec.times(whtRateDec).toDecimalPlaces(3);
  const netPayableDec = grossDec.minus(whtDeductedDec).toDecimalPlaces(3);
  const reverseVatDec =
    category === 'NON_RESIDENT_SERVICE_10' && applyReverseChargeVat
      ? grossDec.times(new Decimal('0.16')).toDecimalPlaces(3)
      : new Decimal(0);
  const totalTaxRemittanceDec = whtDeductedDec.plus(reverseVatDec).toDecimalPlaces(3);

  return {
    grossInvoiceAmount: grossDec.toNumber(),
    whtRate: whtRateDec.toNumber(),
    whtDeductedAmount: whtDeductedDec.toNumber(),
    netPayableToVendor: netPayableDec.toNumber(),
    reverseChargeSalesTax16: reverseVatDec.toNumber(),
    totalTaxRemittanceToIstd: totalTaxRemittanceDec.toNumber(),
  };
}

export const JORDAN_TAX_DEPRECIATION_RATES = {
  BUILDINGS_CONCRETE: 0.02,
  BUILDINGS_INDUSTRIAL: 0.04,
  MACHINERY_AND_EQUIPMENT: 0.10,
  VEHICLES_AND_TRANSPORT: 0.15,
  COMPUTERS_AND_SOFTWARE: 0.25,
  FURNITURE_AND_FIXTURES: 0.10,
} as const;

export function calculateTaxDepreciationDifference(
  cost: number,
  salvage: number,
  bookRate: number,
  taxCategory: keyof typeof JORDAN_TAX_DEPRECIATION_RATES,
  monthsInServiceThisYear: number = 12
) {
  const costDec = Decimal.max(0, new Decimal(cost || 0));
  const salvageDec = Decimal.max(0, new Decimal(salvage || 0));
  const depreciableBaseDec = Decimal.max(0, costDec.minus(salvageDec)).toDecimalPlaces(3);
  const monthsRatioDec = Decimal.min(12, Decimal.max(1, new Decimal(monthsInServiceThisYear || 12))).dividedBy(12);

  const bookRateDec = Decimal.max(0, new Decimal(bookRate || 0));
  const maxTaxRateDec = new Decimal(JORDAN_TAX_DEPRECIATION_RATES[taxCategory] || 0.10);

  const bookDepDec = depreciableBaseDec.times(bookRateDec).times(monthsRatioDec).toDecimalPlaces(3);
  const taxAllowedDepDec = depreciableBaseDec.times(maxTaxRateDec).times(monthsRatioDec).toDecimalPlaces(3);
  const disallowedDiffDec = Decimal.max(0, bookDepDec.minus(taxAllowedDepDec)).toDecimalPlaces(3);

  return {
    depreciableBase: depreciableBaseDec.toNumber(),
    bookDepreciation: bookDepDec.toNumber(),
    maxTaxRate: maxTaxRateDec.toNumber(),
    taxAllowedDepreciation: taxAllowedDepDec.toNumber(),
    disallowedDepreciationExpense: disallowedDiffDec.toNumber(),
  };
}

