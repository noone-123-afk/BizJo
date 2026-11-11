import Decimal from 'decimal.js';

Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP });

export type RelatedPartyTransactionType = 'MANAGEMENT_FEES' | 'INTERCOMPANY_LOAN' | 'GOODS_SUPPLY' | 'ROYALTIES';
export type TransactionDirection = 'EXPENSE_PAID' | 'REVENUE_EARNED';

export interface RelatedPartyTransactionInput {
  transactionId: string;
  relatedPartyName: string;
  jurisdictionCountry: string;
  transactionType: RelatedPartyTransactionType;
  direction?: TransactionDirection;
  actualTransactionAmountJod: number | string;
  benchmarkArmLengthRatePercent?: number;
  appliedMarginPercent?: number;
}

export interface TransferPricingComplianceResult {
  totalRelatedPartyVolumeJod: string;
  totalTaxAdjustmentAdditionJod: string;
  isLocalFileRequired: boolean;
  isMasterFileRequired: boolean;
  isDisclosureFormMandatory: boolean;
  transactionsAudited: Array<{
    id: string;
    party: string;
    country: string;
    type: string;
    typeLabelAr: string;
    directionLabelAr: string;
    recordedAmountJod: string;
    appliedRatePct: string;
    benchmarkRatePct: string;
    armLengthVarianceJod: string;
    taxAdjustmentRisk: 'NONE' | 'POSSIBLE_INCOME_ADDITION';
  }>;
}

export class TransferPricingEngine {
  private static readonly TP_DISCLOSURE_THRESHOLD = new Decimal('500000');

  public static readonly TYPE_LABELS_AR: Record<RelatedPartyTransactionType, string> = {
    MANAGEMENT_FEES: 'أتعاب خدمات إدارية واستشارية مركزية',
    INTERCOMPANY_LOAN: 'تمويل وفوائد قروض بين الشركات الشقيقة',
    GOODS_SUPPLY: 'توريد بضائع ومواد أولية دولية',
    ROYALTIES: 'حقوق ملكية فكرية وعلامات تجارية (إتاوات)',
  };

  public static evaluateCompliance(
    annualGrossRevenue: number | string,
    transactions: RelatedPartyTransactionInput[]
  ): TransferPricingComplianceResult {
    let totalRelatedPartyVolume = new Decimal(0);
    let totalTaxAdjustmentAddition = new Decimal(0);

    const evaluatedList = transactions.map((tx) => {
      const amount = Decimal.max(0, new Decimal(tx.actualTransactionAmountJod || 0)).toDecimalPlaces(3);
      totalRelatedPartyVolume = totalRelatedPartyVolume.plus(amount).toDecimalPlaces(3);

      const applied = new Decimal(tx.appliedMarginPercent ?? 0);
      const benchmark = new Decimal(tx.benchmarkArmLengthRatePercent ?? 0);
      const direction: TransactionDirection =
        tx.direction || (tx.transactionType === 'GOODS_SUPPLY' ? 'REVENUE_EARNED' : 'EXPENSE_PAID');

      let variance = new Decimal(0);
      let risk: 'NONE' | 'POSSIBLE_INCOME_ADDITION' = 'NONE';

      if (tx.appliedMarginPercent !== undefined && tx.benchmarkArmLengthRatePercent !== undefined) {
        if (direction === 'EXPENSE_PAID') {
          // في حالة مصروف مدفوع لطرف ذي علاقة: المخاطرة الضريبية تنشأ إذا كانت النسبة المطبقة أعلى من السعر المحايد (تضخيم مصاريف)، أو إذا كان هامش الربح المتبقي للمنشأة أقل من المعيار
          const diff = applied.minus(benchmark).abs();
          if (!applied.equals(benchmark)) {
            // إذا كانت النسبة تمثل هامش ربح تشغيلي للمنشأة أقل من السعر المحايد أو رسم إداري يتجاوز المعيار
            if (applied.lessThan(benchmark) || applied.greaterThan(benchmark)) {
              // نتحقق: في حال هامش ربح المنشأة أقل من المعيار، أو في حال مصروف يتجاوز المعيار
              const isUnderMarginOrOverFee =
                (tx.transactionType === 'GOODS_SUPPLY' && applied.lessThan(benchmark)) ||
                (tx.transactionType !== 'GOODS_SUPPLY' && !applied.equals(benchmark));
              if (isUnderMarginOrOverFee) {
                variance = amount.times(diff.dividedBy(100)).toDecimalPlaces(3, Decimal.ROUND_HALF_UP);
                totalTaxAdjustmentAddition = totalTaxAdjustmentAddition.plus(variance).toDecimalPlaces(3);
                risk = 'POSSIBLE_INCOME_ADDITION';
              }
            }
          }
        } else {
          // في حالة إيراد أو بيع لطرف ذي علاقة: المخاطرة الضريبية تنشأ إذا كان الهامش المطبق أقل من السعر المحايد (تخفيض الإيراد)
          if (applied.lessThan(benchmark)) {
            const diff = benchmark.minus(applied);
            variance = amount.times(diff.dividedBy(100)).toDecimalPlaces(3, Decimal.ROUND_HALF_UP);
            totalTaxAdjustmentAddition = totalTaxAdjustmentAddition.plus(variance).toDecimalPlaces(3);
            risk = 'POSSIBLE_INCOME_ADDITION';
          }
        }
      }

      return {
        id: tx.transactionId,
        party: tx.relatedPartyName,
        country: tx.jurisdictionCountry,
        type: tx.transactionType,
        typeLabelAr: this.TYPE_LABELS_AR[tx.transactionType] || tx.transactionType,
        directionLabelAr: direction === 'EXPENSE_PAID' ? 'مصروف / أتعاب لطرف مرتبط' : 'إيراد / توريد لطرف مرتبط',
        recordedAmountJod: amount.toFixed(3),
        appliedRatePct: `${applied.toFixed(2)}%`,
        benchmarkRatePct: `${benchmark.toFixed(2)}%`,
        armLengthVarianceJod: variance.toFixed(3),
        taxAdjustmentRisk: risk,
      };
    });

    const isExceedingThreshold = totalRelatedPartyVolume.greaterThanOrEqualTo(this.TP_DISCLOSURE_THRESHOLD);

    return {
      totalRelatedPartyVolumeJod: totalRelatedPartyVolume.toFixed(3),
      totalTaxAdjustmentAdditionJod: totalTaxAdjustmentAddition.toFixed(3),
      isDisclosureFormMandatory: isExceedingThreshold,
      isLocalFileRequired: isExceedingThreshold,
      isMasterFileRequired: new Decimal(annualGrossRevenue || 0).greaterThan(new Decimal('100000000')),
      transactionsAudited: evaluatedList,
    };
  }
}

export interface RelatedPartyTransaction {
  id: string;
  counterpartyName: string;
  counterpartyCountry: string;
  relationshipType: string;
  natureOfTransaction: string;
  pricingMethod: 'CUP' | 'COST_PLUS' | 'RESALE_MINUS' | 'TNMM' | 'PROFIT_SPLIT';
  transactionValueJod: number;
  reportedMarginOrRatePercent: number;
  armsLengthMinPercent: number;
  armsLengthMaxPercent: number;
  isInboundExpenseOrPurchase: boolean;
}

export function evaluateTransferPricingCompliance(
  annualCompanyRevenueJod: number,
  transactions: RelatedPartyTransaction[],
  isMultinationalGroupOverThreshold: boolean = false
) {
  let totalVolumeDec = new Decimal(0);
  let totalAdjustmentDec = new Decimal(0);

  const transactionEvaluations = transactions.map((tx) => {
    const valDec = Decimal.max(0, new Decimal(tx.transactionValueJod || 0));
    totalVolumeDec = totalVolumeDec.plus(valDec);

    const minDec = new Decimal(tx.armsLengthMinPercent || 0);
    const maxDec = new Decimal(tx.armsLengthMaxPercent || 0);
    const medianDec = minDec.plus(maxDec).dividedBy(2).toDecimalPlaces(2);
    const reportedDec = new Decimal(tx.reportedMarginOrRatePercent || 0);

    const isWithinRange = reportedDec.gte(minDec) && reportedDec.lte(maxDec);
    let adjustmentDec = new Decimal(0);
    let findingAr = 'متوافق مع مبدأ السعر المحايد (Arm’s Length Principle)';

    if (!isWithinRange) {
      if (tx.isInboundExpenseOrPurchase && reportedDec.gt(maxDec)) {
        // Paid above arm's length median/max to related party -> excess disallowed & added back to median
        const excessRateDec = reportedDec.minus(medianDec).dividedBy(100);
        adjustmentDec = valDec.times(excessRateDec).toDecimalPlaces(3);
        findingAr = `نسبة المصروف/الإتاوة (${reportedDec.toFixed(1)}%) تتجاوز المدى المحايد؛ يُرد الفارق عن الوسيط (${medianDec.toFixed(2)}%) للوعاء الضريبي.`;
      } else if (!tx.isInboundExpenseOrPurchase && reportedDec.lt(minDec)) {
        // Sold below arm's length min -> shortfall added back to median
        const shortfallRateDec = medianDec.minus(reportedDec).dividedBy(100);
        adjustmentDec = valDec.times(shortfallRateDec).toDecimalPlaces(3);
        findingAr = `هامش البيع لطرف مرتبط (${reportedDec.toFixed(1)}%) يقل عن الحد الأدنى المحايد؛ يُضاف الفارق عن الوسيط (${medianDec.toFixed(2)}%) للربح الخاضع.`;
      } else {
        const diffRateDec = reportedDec.minus(medianDec).abs().dividedBy(100);
        adjustmentDec = valDec.times(diffRateDec).toDecimalPlaces(3);
        findingAr = `انحراف عن مدى السعر المحايد؛ يتطلب تسوية إلى نقطة الوسيط (${medianDec.toFixed(2)}%).`;
      }
      totalAdjustmentDec = totalAdjustmentDec.plus(adjustmentDec);
    }

    return {
      transaction: tx,
      medianBenchmarkPercent: medianDec.toNumber(),
      isWithinArmsLengthRange: isWithinRange,
      proposedTaxableIncomeAdjustmentJod: adjustmentDec.toNumber(),
      findingAr,
    };
  });

  const requiresLocalAndMasterFile =
    totalVolumeDec.gte(500000) || annualCompanyRevenueJod >= 5000000 || isMultinationalGroupOverThreshold;

  const riskRating = totalAdjustmentDec.gt(10000)
    ? 'مرتفع (High Audit Risk)'
    : totalAdjustmentDec.gt(0)
    ? 'متوسط (Medium Risk)'
    : 'منخفض / ملتزم (Compliant)';

  return {
    totalRelatedPartyVolumeJod: totalVolumeDec.toDecimalPlaces(3).toNumber(),
    requiresLocalAndMasterFile,
    totalTaxableIncomeAdjustmentJod: totalAdjustmentDec.toDecimalPlaces(3).toNumber(),
    riskRating,
    transactionEvaluations,
  };
}

