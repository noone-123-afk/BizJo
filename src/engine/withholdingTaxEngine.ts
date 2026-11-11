import Decimal from 'decimal.js';

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export type WithholdingCategory =
  | 'PROFESSIONAL_SERVICES_LOCAL'
  | 'RENTAL_RESIDENTIAL_COMMERCIAL'
  | 'NON_RESIDENT_SERVICES'
  | 'INTEREST_AND_DEPOSITS'
  | 'BROKERAGE_COMMISSIONS';

export interface WithholdingCalculationInput {
  beneficiaryName: string;
  beneficiaryNationalOrTaxId: string;
  category: WithholdingCategory;
  grossInvoiceAmount: number | string;
  isRegisteredForSalesTax?: boolean;
}

export interface WithholdingCalculationResult {
  category: WithholdingCategory;
  categoryLabelAr: string;
  rateAppliedPercentage: string;
  grossAmountJod: string;
  withholdingTaxAmountJod: string;
  netPayableToBeneficiaryJod: string;
  remittanceDeadline: string;
  accountingJournalEntry: {
    debitExpenseAccount: string;
    creditLiabilityWhtAccount: string;
    creditCashOrPayableAccount: string;
  };
}

export class WithholdingTaxEngine {
  private static readonly RATES: Record<WithholdingCategory, Decimal> = {
    PROFESSIONAL_SERVICES_LOCAL: new Decimal('0.05'),
    RENTAL_RESIDENTIAL_COMMERCIAL: new Decimal('0.10'),
    NON_RESIDENT_SERVICES: new Decimal('0.10'),
    INTEREST_AND_DEPOSITS: new Decimal('0.05'),
    BROKERAGE_COMMISSIONS: new Decimal('0.05'),
  };

  public static readonly LABELS: Record<WithholdingCategory, string> = {
    PROFESSIONAL_SERVICES_LOCAL: 'أتعاب مهن واستشارات حرة محلية - محاماة/هندسة/تدقيق (5%)',
    RENTAL_RESIDENTIAL_COMMERCIAL: 'بدل إيجار عقارات لغير المسجلين (10%)',
    NON_RESIDENT_SERVICES: 'خدمات وإتاوات جهات غير مقيمة خارج المملكة (10%)',
    INTEREST_AND_DEPOSITS: 'فوائد وأرباح ودائع وائتمان لشركات (5%)',
    BROKERAGE_COMMISSIONS: 'عمولات وساطة ووكالات تجارية (5%)',
  };

  public static calculateWHT(input: WithholdingCalculationInput): WithholdingCalculationResult {
    const gross = new Decimal(input.grossInvoiceAmount || 0);
    const rate = this.RATES[input.category] || new Decimal('0.05');

    const taxAmount = gross.times(rate);
    const netPayable = gross.minus(taxAmount);

    return {
      category: input.category,
      categoryLabelAr: this.LABELS[input.category],
      rateAppliedPercentage: `${rate.times(100).toFixed(0)}%`,
      grossAmountJod: gross.toFixed(3),
      withholdingTaxAmountJod: taxAmount.toFixed(3),
      netPayableToBeneficiaryJod: netPayable.toFixed(3),
      remittanceDeadline: 'خلال ثلاثين يوماً من انتهاء الشهر الذي تم فيه الدفع أو الاستحقاق (نموذج و/1)',
      accountingJournalEntry: {
        debitExpenseAccount: `50301 - مصروفات ${this.LABELS[input.category]} (${gross.toFixed(3)} د.أ)`,
        creditLiabilityWhtAccount: `20305 - أمانات ضريبة الدخل المقتطعة من المنبع (${taxAmount.toFixed(3)} د.أ)`,
        creditCashOrPayableAccount: `10101/20101 - الصندوق/الذمم الدائنة - ${input.beneficiaryName} (${netPayable.toFixed(3)} د.أ)`,
      },
    };
  }
}
