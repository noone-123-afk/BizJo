import Decimal from 'decimal.js';

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export type AssetCategory = 'BUILDINGS' | 'MACHINERY' | 'COMPUTERS' | 'VEHICLES' | 'FURNITURE';

export interface AssetDepreciationInput {
  assetCode: string;
  assetName: string;
  category: AssetCategory;
  acquisitionCost: number | string;
  salvageValue?: number | string;
  bookDepreciationRate: number | string;
  monthsInServiceThisYear: number;
}

export interface AssetDepreciationResult {
  assetCode: string;
  depreciableBaseJod: string;
  bookDepreciationExpense: string;
  taxDepreciationAllowed: string;
  taxDisallowedDifference: string;
  officialTaxRatePercent: string;
  recommendedJournalEntry: {
    debitAccount: string;
    creditAccount: string;
    amount: string;
  };
}

export class DepreciationEngine {
  private static readonly OFFICIAL_ISTD_RATES: Record<AssetCategory, Decimal> = {
    BUILDINGS: new Decimal('0.04'),
    MACHINERY: new Decimal('0.10'),
    COMPUTERS: new Decimal('0.20'),
    VEHICLES: new Decimal('0.15'),
    FURNITURE: new Decimal('0.10'),
  };

  public static readonly CATEGORY_LABELS_AR: Record<AssetCategory, string> = {
    BUILDINGS: 'المباني والإنشاءات الصناعية (4%)',
    MACHINERY: 'الآلات والمعدات الصناعية (10%)',
    COMPUTERS: 'أجهزة الحاسوب والبرمجيات والشبكات (20%)',
    VEHICLES: 'وسائط النقل والمركبات (15%)',
    FURNITURE: 'الأثاث والمفروشات والتجهيزات المكتبية (10%)',
  };

  public static calculateAssetDepreciation(input: AssetDepreciationInput): AssetDepreciationResult {
    const cost = new Decimal(input.acquisitionCost || 0);
    const salvage = new Decimal(input.salvageValue || 0);
    const depreciableBase = Decimal.max(0, cost.minus(salvage));
    const timeRatio = new Decimal(input.monthsInServiceThisYear || 12).dividedBy(12);

    const bookRate = new Decimal(input.bookDepreciationRate || 0);
    const bookExpense = depreciableBase.times(bookRate).times(timeRatio);

    const taxRate = this.OFFICIAL_ISTD_RATES[input.category] || new Decimal('0.10');
    const taxAllowed = depreciableBase.times(taxRate).times(timeRatio);

    const difference = bookExpense.minus(taxAllowed);
    const taxDisallowed = difference.greaterThan(0) ? difference.toFixed(3) : '0.000';

    return {
      assetCode: input.assetCode,
      depreciableBaseJod: depreciableBase.toFixed(3),
      bookDepreciationExpense: bookExpense.toFixed(3),
      taxDepreciationAllowed: taxAllowed.toFixed(3),
      taxDisallowedDifference: taxDisallowed,
      officialTaxRatePercent: `${taxRate.times(100).toFixed(0)}%`,
      recommendedJournalEntry: {
        debitAccount: `60401 - مصاريف استهلاك أصول (${input.assetName})`,
        creditAccount: `10502 - مجمع استهلاك متراكم (${input.assetName})`,
        amount: bookExpense.toFixed(3),
      },
    };
  }
}
