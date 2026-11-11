import Decimal from 'decimal.js';

Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP });

export interface ClosingAccountLine {
  accountCode: string;
  accountName: string;
  type: 'REVENUE' | 'EXPENSE';
  balance: number | string;
}

export interface YearEndClosingSummary {
  fiscalYear: number;
  totalRevenuesJod: string;
  totalExpensesJod: string;
  netIncomeBeforeTaxAndReservesJod: string;
  corporateTaxRateAppliedPct: string;
  incomeTaxEstimatedJod: string;
  netIncomeAfterTaxJod: string;
  statutoryReserve10PercentJod: string;
  voluntaryReserveJod: string;
  retainedEarningsTransferredJod: string;
  closingJournalEntries: Array<{
    entryNo: string;
    description: string;
    totalDebitJod: string;
    totalCreditJod: string;
    lines: Array<{ account: string; debit: string; credit: string }>;
  }>;
}

export class YearEndClosingEngine {
  private static readonly STATUTORY_RESERVE_RATE = new Decimal('0.10');

  public static executeClosing(
    fiscalYear: number,
    accounts: ClosingAccountLine[],
    voluntaryReserveRatePercent: number = 0,
    corporateTaxRatePercent: number = 21 // 20% ضريبة دخل الشركات + 1% مساهمة وطنية
  ): YearEndClosingSummary {
    let revTotal = new Decimal(0);
    let expTotal = new Decimal(0);

    const revenueLines: Array<{ account: string; debit: string; credit: string }> = [];
    const expenseLines: Array<{ account: string; debit: string; credit: string }> = [];

    accounts.forEach((acc) => {
      const bal = Decimal.max(0, new Decimal(acc.balance || 0).abs()).toDecimalPlaces(3, Decimal.ROUND_HALF_UP);
      if (acc.type === 'REVENUE') {
        revTotal = revTotal.plus(bal).toDecimalPlaces(3);
        revenueLines.push({
          account: `${acc.accountCode} - ${acc.accountName}`,
          debit: bal.toFixed(3),
          credit: '0.000',
        });
      } else {
        expTotal = expTotal.plus(bal).toDecimalPlaces(3);
        expenseLines.push({
          account: `${acc.accountCode} - ${acc.accountName}`,
          debit: '0.000',
          credit: bal.toFixed(3),
        });
      }
    });

    const netProfitBeforeTax = revTotal.minus(expTotal).toDecimalPlaces(3);
    const corpTaxRateDec = Decimal.max(0, new Decimal(corporateTaxRatePercent || 0)).dividedBy(100);

    let taxEst = new Decimal(0);
    let netProfitAfterTax = new Decimal(0);
    let statutoryReserve = new Decimal(0);
    let voluntaryReserve = new Decimal(0);
    let retainedEarnings = new Decimal(0);

    if (netProfitBeforeTax.greaterThan(0)) {
      taxEst = netProfitBeforeTax.times(corpTaxRateDec).toDecimalPlaces(3, Decimal.ROUND_HALF_UP);
      netProfitAfterTax = netProfitBeforeTax.minus(taxEst).toDecimalPlaces(3);
      // قانون الشركات الأردني رقم 22 لسنة 1997: اقتطاع 10% احتياطي إجباري من الأرباح الصافية
      statutoryReserve = netProfitAfterTax.times(this.STATUTORY_RESERVE_RATE).toDecimalPlaces(3, Decimal.ROUND_HALF_UP);
      voluntaryReserve = netProfitAfterTax
        .times(new Decimal(voluntaryReserveRatePercent || 0).dividedBy(100))
        .toDecimalPlaces(3, Decimal.ROUND_HALF_UP);
      retainedEarnings = netProfitAfterTax
        .minus(statutoryReserve)
        .minus(voluntaryReserve)
        .toDecimalPlaces(3, Decimal.ROUND_HALF_UP);
    } else {
      netProfitAfterTax = netProfitBeforeTax;
      retainedEarnings = netProfitBeforeTax;
    }

    const entry3Lines: Array<{ account: string; debit: string; credit: string }> = netProfitBeforeTax.greaterThanOrEqualTo(0)
      ? [
          {
            account: '30901 - حساب ملخص الدخل والأرباح والخسائر',
            debit: netProfitBeforeTax.toFixed(3),
            credit: '0.000',
          },
          {
            account: `20301 - مخصص ضريبة الدخل والمساهمة الوطنية (${corporateTaxRatePercent}%)`,
            debit: '0.000',
            credit: taxEst.toFixed(3),
          },
          {
            account: '30201 - الاحتياطي الإجباري القانوني (10%)',
            debit: '0.000',
            credit: statutoryReserve.toFixed(3),
          },
          ...(voluntaryReserve.greaterThan(0)
            ? [
                {
                  account: `30202 - الاحتياطي الاختياري (${voluntaryReserveRatePercent}%)`,
                  debit: '0.000',
                  credit: voluntaryReserve.toFixed(3),
                },
              ]
            : []),
          {
            account: '30301 - الأرباح المدورة (المرحلة للميزانية العمومية)',
            debit: '0.000',
            credit: retainedEarnings.toFixed(3),
          },
        ]
      : [
          {
            account: '30301 - الخسائر المتراكمة المدورة',
            debit: retainedEarnings.abs().toFixed(3),
            credit: '0.000',
          },
          {
            account: '30901 - حساب ملخص الدخل والأرباح والخسائر',
            debit: '0.000',
            credit: netProfitBeforeTax.abs().toFixed(3),
          },
        ];

    const closingJournalEntries = [
      {
        entryNo: 'CLOSE-01',
        description: `قفل حسابات الإيرادات لعام ${fiscalYear} في حساب ملخص الدخل`,
        totalDebitJod: revTotal.toFixed(3),
        totalCreditJod: revTotal.toFixed(3),
        lines: [
          ...revenueLines,
          {
            account: '30901 - حساب ملخص الدخل والأرباح والخسائر',
            debit: '0.000',
            credit: revTotal.toFixed(3),
          },
        ],
      },
      {
        entryNo: 'CLOSE-02',
        description: `قفل حسابات المصاريف لعام ${fiscalYear} في حساب ملخص الدخل`,
        totalDebitJod: expTotal.toFixed(3),
        totalCreditJod: expTotal.toFixed(3),
        lines: [
          {
            account: '30901 - حساب ملخص الدخل والأرباح والخسائر',
            debit: expTotal.toFixed(3),
            credit: '0.000',
          },
          ...expenseLines,
        ],
      },
      {
        entryNo: 'CLOSE-03',
        description: `توزيع صافي الدخل واحتساب الضريبة والاحتياطي الإجباري والأرباح المدورة لعام ${fiscalYear}`,
        totalDebitJod: netProfitBeforeTax.abs().toFixed(3),
        totalCreditJod: netProfitBeforeTax.abs().toFixed(3),
        lines: entry3Lines,
      },
    ];

    return {
      fiscalYear,
      totalRevenuesJod: revTotal.toFixed(3),
      totalExpensesJod: expTotal.toFixed(3),
      netIncomeBeforeTaxAndReservesJod: netProfitBeforeTax.toFixed(3),
      corporateTaxRateAppliedPct: `${corporateTaxRatePercent}%`,
      incomeTaxEstimatedJod: taxEst.toFixed(3),
      netIncomeAfterTaxJod: netProfitAfterTax.toFixed(3),
      statutoryReserve10PercentJod: statutoryReserve.toFixed(3),
      voluntaryReserveJod: voluntaryReserve.toFixed(3),
      retainedEarningsTransferredJod: retainedEarnings.toFixed(3),
      closingJournalEntries,
    };
  }
}

export interface TrialBalanceAccount {
  accountCode: string;
  accountNameAr: string;
  category: 'REVENUE' | 'COST_OF_SALES' | 'OPERATING_EXPENSE';
  balanceJod: number;
}

export function generateYearEndClosingPlan(
  trialBalance: TrialBalanceAccount[],
  taxNonDeductibleAddBacksJod: number,
  corporateTaxRate: number = 0.20,
  includeNationalContribution1Percent: boolean = true
) {
  let totalRevDec = new Decimal(0);
  let totalExpDec = new Decimal(0);

  const revClosingLines: Array<{ accountCode: string; accountNameAr: string; debitJod: number; creditJod: number }> = [];
  const expClosingLines: Array<{ accountCode: string; accountNameAr: string; debitJod: number; creditJod: number }> = [];

  trialBalance.forEach((acc) => {
    const balDec = Decimal.max(0, new Decimal(acc.balanceJod || 0)).toDecimalPlaces(3);
    if (acc.category === 'REVENUE') {
      totalRevDec = totalRevDec.plus(balDec);
      revClosingLines.push({
        accountCode: acc.accountCode,
        accountNameAr: acc.accountNameAr,
        debitJod: balDec.toNumber(),
        creditJod: 0,
      });
    } else {
      totalExpDec = totalExpDec.plus(balDec);
      expClosingLines.push({
        accountCode: acc.accountCode,
        accountNameAr: acc.accountNameAr,
        debitJod: 0,
        creditJod: balDec.toNumber(),
      });
    }
  });

  const accountingProfitBeforeTaxDec = totalRevDec.minus(totalExpDec).toDecimalPlaces(3);
  const addBacksDec = Decimal.max(0, new Decimal(taxNonDeductibleAddBacksJod || 0)).toDecimalPlaces(3);
  const taxableIncomeDec = Decimal.max(0, accountingProfitBeforeTaxDec.plus(addBacksDec)).toDecimalPlaces(3);

  const effectiveTaxRateDec = new Decimal(corporateTaxRate || 0.20).plus(
    includeNationalContribution1Percent ? new Decimal('0.01') : new Decimal(0)
  );
  const totalTaxProvisionDec = taxableIncomeDec.times(effectiveTaxRateDec).toDecimalPlaces(3);
  const netProfitAfterTaxDec = accountingProfitBeforeTaxDec.minus(totalTaxProvisionDec).toDecimalPlaces(3);

  // Statutory Reserve 10% under Article 186 of Jordanian Companies Law No. 22 of 1997
  const statutoryReserve10PercentDec = netProfitAfterTaxDec.gt(0)
    ? netProfitAfterTaxDec.times('0.10').toDecimalPlaces(3)
    : new Decimal(0);
  const netTransferToRetainedEarningsDec = netProfitAfterTaxDec
    .minus(statutoryReserve10PercentDec)
    .toDecimalPlaces(3);

  const closingEntries = [
    {
      voucherNumber: 'JV-CLOSE-2026-01',
      dateIso: '2026-12-31',
      descriptionAr: 'قيد إقفال حسابات الإيرادات والمبيعات في حساب ملخص الدخل',
      lines: [
        ...revClosingLines,
        {
          accountCode: '3901',
          accountNameAr: 'حساب ملخص الدخل والأرباح والخسائر',
          debitJod: 0,
          creditJod: totalRevDec.toNumber(),
        },
      ],
    },
    {
      voucherNumber: 'JV-CLOSE-2026-02',
      dateIso: '2026-12-31',
      descriptionAr: 'قيد إقفال تكلفة المبيعات والمصاريف التشغيلية في حساب ملخص الدخل',
      lines: [
        {
          accountCode: '3901',
          accountNameAr: 'حساب ملخص الدخل والأرباح والخسائر',
          debitJod: totalExpDec.toNumber(),
          creditJod: 0,
        },
        ...expClosingLines,
      ],
    },
    {
      voucherNumber: 'JV-CLOSE-2026-03',
      dateIso: '2026-12-31',
      descriptionAr: 'إثبات مخصص ضريبة الدخل والوطنية والاحتياطي الإجباري (10%) والأرباح المدورة',
      lines: [
        {
          accountCode: '3901',
          accountNameAr: 'حساب ملخص الدخل والأرباح والخسائر',
          debitJod: Decimal.max(0, accountingProfitBeforeTaxDec).toNumber(),
          creditJod: 0,
        },
        {
          accountCode: '2305',
          accountNameAr: 'مخصص ضريبة الدخل والمساهمة الوطنية المستحقة (ISTD)',
          debitJod: 0,
          creditJod: totalTaxProvisionDec.toNumber(),
        },
        {
          accountCode: '3201',
          accountNameAr: 'الاحتياطي الإجباري القانوني (10% - مادة 186 شركات)',
          debitJod: 0,
          creditJod: statutoryReserve10PercentDec.toNumber(),
        },
        {
          accountCode: '3301',
          accountNameAr: 'الأرباح المدورة القابلة للتوزيع (Retained Earnings)',
          debitJod: netTransferToRetainedEarningsDec.lt(0)
            ? netTransferToRetainedEarningsDec.abs().toNumber()
            : 0,
          creditJod: netTransferToRetainedEarningsDec.gt(0)
            ? netTransferToRetainedEarningsDec.toNumber()
            : 0,
        },
      ],
    },
  ];

  return {
    accountingProfitBeforeTaxJod: accountingProfitBeforeTaxDec.toNumber(),
    taxableIncomeJod: taxableIncomeDec.toNumber(),
    totalTaxProvisionJod: totalTaxProvisionDec.toNumber(),
    statutoryReserve10PercentJod: statutoryReserve10PercentDec.toNumber(),
    netTransferToRetainedEarningsJod: netTransferToRetainedEarningsDec.toNumber(),
    closingEntries,
  };
}

