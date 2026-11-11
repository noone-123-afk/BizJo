import Decimal from 'decimal.js';

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export interface ForeignTransactionInput {
  foreignCurrency: 'USD' | 'EUR' | 'GBP' | 'SAR' | 'AED';
  foreignAmount: number | string;
  transactionDate: string;
  customFxRate?: number | string;
}

export interface FxConversionResult {
  currency: string;
  foreignAmount: string;
  officialFxRateToJod: string;
  convertedAmountJod: string;
  accountingJournalEntry: {
    debitAccount: string;
    creditAccount: string;
    amountJod: string;
  };
}

export class CbjCurrencyEngine {
  private static readonly OFFICIAL_CBJ_PEGGED_RATES: Record<string, Decimal> = {
    USD: new Decimal('0.7090'),
    SAR: new Decimal('0.1890'),
    AED: new Decimal('0.1930'),
    EUR: new Decimal('0.7680'),
    GBP: new Decimal('0.9150'),
  };

  public static convertToJod(input: ForeignTransactionInput): FxConversionResult {
    const amount = new Decimal(input.foreignAmount || 0);
    const rate = input.customFxRate
      ? new Decimal(input.customFxRate)
      : this.OFFICIAL_CBJ_PEGGED_RATES[input.foreignCurrency] || new Decimal('1.000');

    const convertedJod = amount.times(rate);

    return {
      currency: input.foreignCurrency,
      foreignAmount: amount.toFixed(2),
      officialFxRateToJod: rate.toFixed(4),
      convertedAmountJod: convertedJod.toFixed(3),
      accountingJournalEntry: {
        debitAccount: '10101 - حساب البنك / العملات الأجنبية',
        creditAccount: '40102 - إيرادات مبيعات التصدير الخارجية',
        amountJod: convertedJod.toFixed(3),
      },
    };
  }

  public static calculateYearEndUnrealizedFxGainLoss(
    originalCostJod: number | string,
    currentForeignBalance: number | string,
    yearEndRate: number | string
  ) {
    const original = new Decimal(originalCostJod || 0);
    const currentVal = new Decimal(currentForeignBalance || 0).times(new Decimal(yearEndRate || 0));
    const variance = currentVal.minus(original);
    const isGain = variance.greaterThanOrEqualTo(0);

    return {
      originalValueJod: original.toFixed(3),
      revaluedValueJod: currentVal.toFixed(3),
      varianceJod: variance.abs().toFixed(3),
      type: isGain ? 'UNREALIZED_FX_GAIN (أرباح فروقات عملة غير متحققة)' : 'UNREALIZED_FX_LOSS (خسائر فروقات عملة)',
      entry: isGain
        ? {
            debit: '10101 - حساب النقد الأجنبي',
            credit: '50201 - إيرادات فروقات تقييم عملات أجنبية',
            amount: variance.abs().toFixed(3),
          }
        : {
            debit: '60301 - مصاريف وخسائر فروقات تقييم عملات أجنبية',
            credit: '10101 - حساب النقد الأجنبي',
            amount: variance.abs().toFixed(3),
          },
    };
  }
}
