import Decimal from 'decimal.js';

Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP });

export interface FeasibilityStudyInput {
  projectName: string;
  initialInvestmentCapex: number | string;
  discountRatePercent: number | string;
  projectLifetimeYears: number;
  projectedAnnualCashFlows: Array<number | string>;
}

export interface FeasibilityStudyResult {
  projectName: string;
  initialInvestmentJod: string;
  discountRate: string;
  totalPresentValuePv: string;
  netPresentValueNpv: string;
  internalRateOfReturnIrr: string;
  modifiedInternalRateOfReturnMirr: string;
  signChangesCount: number;
  isNonConventionalCashFlow: boolean;
  cashFlowDiagnosticNoteAr: string;
  paybackPeriodYears: string;
  discountedPaybackPeriodYears: string;
  profitabilityIndexPi: string;
  isEconomicallyViable: boolean;
  yearlyDiscountedCashFlows: Array<{
    year: number;
    nominalCashFlow: string;
    discountFactor: string;
    presentValue: string;
    cumulativePresentValue: string;
    netCumulativeNpv: string;
  }>;
}

export class FeasibilityEngine {
  public static evaluateProject(input: FeasibilityStudyInput): FeasibilityStudyResult {
    const capex = Decimal.max(0, new Decimal(input.initialInvestmentCapex || 0)).toDecimalPlaces(3);
    const ratePct = Decimal.max(0, new Decimal(input.discountRatePercent || 0));
    const r = ratePct.dividedBy(100);

    let npvSum = new Decimal(0);
    let cumulativePv = new Decimal(0);
    let cumulativeNominal = new Decimal(0);
    let nominalPayback = -1;
    let discountedPayback = -1;

    const schedule: FeasibilityStudyResult['yearlyDiscountedCashFlows'] = [];
    const yearsCount = Math.max(1, input.projectLifetimeYears || input.projectedAnnualCashFlows.length);
    const numericFlows: number[] = [];

    for (let t = 1; t <= yearsCount; t++) {
      const cfNominal = new Decimal(input.projectedAnnualCashFlows[t - 1] || 0).toDecimalPlaces(3);
      numericFlows.push(cfNominal.toNumber());
      const prevCumulativeNominal = cumulativeNominal;
      cumulativeNominal = cumulativeNominal.plus(cfNominal).toDecimalPlaces(3);

      const discountFactor = new Decimal(1).dividedBy(new Decimal(1).plus(r).pow(t));
      const pv = cfNominal.times(discountFactor).toDecimalPlaces(3, Decimal.ROUND_HALF_UP);
      const prevCumulativePv = cumulativePv;
      npvSum = npvSum.plus(pv).toDecimalPlaces(3);
      cumulativePv = cumulativePv.plus(pv).toDecimalPlaces(3);

      if (
        nominalPayback === -1 &&
        prevCumulativeNominal.lessThan(capex) &&
        cumulativeNominal.greaterThanOrEqualTo(capex) &&
        cfNominal.greaterThan(0)
      ) {
        const needed = capex.minus(prevCumulativeNominal);
        const fraction = needed.dividedBy(cfNominal);
        nominalPayback = t - 1 + fraction.toNumber();
      }

      if (
        discountedPayback === -1 &&
        prevCumulativePv.lessThan(capex) &&
        cumulativePv.greaterThanOrEqualTo(capex) &&
        pv.greaterThan(0)
      ) {
        const neededPv = capex.minus(prevCumulativePv);
        const fractionPv = neededPv.dividedBy(pv);
        discountedPayback = t - 1 + fractionPv.toNumber();
      }

      schedule.push({
        year: t,
        nominalCashFlow: cfNominal.toFixed(3),
        discountFactor: discountFactor.toFixed(6),
        presentValue: pv.toFixed(3),
        cumulativePresentValue: cumulativePv.toFixed(3),
        netCumulativeNpv: cumulativePv.minus(capex).toDecimalPlaces(3).toFixed(3),
      });
    }

    const netPresentValue = npvSum.minus(capex).toDecimalPlaces(3);
    const profitabilityIndex = capex.isZero()
      ? new Decimal(0)
      : npvSum.dividedBy(capex).toDecimalPlaces(3);

    // فحص عدد مرات تغير الإشارة النقدية (Descartes' Rule of Signs)
    const fullSeries = [-capex.toNumber(), ...numericFlows];
    let signChangesCount = 0;
    let lastNonZeroSign = fullSeries[0] < 0 ? -1 : fullSeries[0] > 0 ? 1 : 0;
    for (let i = 1; i < fullSeries.length; i++) {
      const val = fullSeries[i];
      if (val === 0) continue;
      const currentSign = val < 0 ? -1 : 1;
      if (lastNonZeroSign !== 0 && currentSign !== lastNonZeroSign) {
        signChangesCount++;
      }
      lastNonZeroSign = currentSign;
    }

    const isNonConventionalCashFlow = signChangesCount > 1;

    const irrValue = this.calculateIRR(capex.toNumber(), numericFlows);
    const mirrValue = this.calculateMIRR(capex.toNumber(), numericFlows, r.toNumber());

    let cashFlowDiagnosticNoteAr =
      'تدفقات نقدية تقليدية (تغير إشارة واحد من سالب عند التأسيس إلى موجب تشغيلي) — معيارا NPV و IRR متطابقان.';
    if (signChangesCount === 0) {
      cashFlowDiagnosticNoteAr =
        'تحذير ائتماني: جميع التدفقات النقدية سالبة أو صفرية (لا يوجد استرداد لرأس المال). المشروع يحقق خسارة صافية.';
    } else if (isNonConventionalCashFlow) {
      cashFlowDiagnosticNoteAr = `تنبيه فني للمحلل المالي: تغيرت إشارة التدفق النقدي (${signChangesCount}) مرات (تدفقات غير تقليدية). وفق المعايير المالية الدولية، يُعتمد هنا صافي القيمة الحالية (NPV) ومعدل العائد الداخلي المعدل (MIRR = ${
        mirrValue !== null ? (mirrValue * 100).toFixed(2) + '%' : 'N/A'
      }) بدلاً من IRR التقليدي لتجنب ازدواجية الجذور الرياضية.`;
    }

    const effectiveReturnRate = isNonConventionalCashFlow && mirrValue !== null ? mirrValue : irrValue;

    return {
      projectName: input.projectName,
      initialInvestmentJod: capex.toFixed(3),
      discountRate: `${ratePct.toFixed(2)}%`,
      totalPresentValuePv: npvSum.toFixed(3),
      netPresentValueNpv: netPresentValue.toFixed(3),
      internalRateOfReturnIrr:
        irrValue !== null ? `${(irrValue * 100).toFixed(2)}%` : 'غير قابل للتحقق (تدفقات سالبة)',
      modifiedInternalRateOfReturnMirr:
        mirrValue !== null ? `${(mirrValue * 100).toFixed(2)}%` : 'غير قابل للتحقق (لا توجد تدفقات موجبة)',
      signChangesCount,
      isNonConventionalCashFlow,
      cashFlowDiagnosticNoteAr,
      paybackPeriodYears: nominalPayback >= 0 ? `${nominalPayback.toFixed(2)} سنة` : 'أطول من عمر المشروع',
      discountedPaybackPeriodYears:
        discountedPayback >= 0 ? `${discountedPayback.toFixed(2)} سنة` : 'أطول من عمر المشروع',
      profitabilityIndexPi: profitabilityIndex.toFixed(3),
      isEconomicallyViable:
        netPresentValue.greaterThan(0) &&
        effectiveReturnRate !== null &&
        effectiveReturnRate > r.toNumber(),
      yearlyDiscountedCashFlows: schedule,
    };
  }

  /**
   * حساب معدل العائد الداخلي المعدل (Modified IRR - MIRR)
   * يعالج مشكلة تغير الإشارة النقدية أكثر من مرة (Non-Conventional Cash Flows)
   * عبر خصم التدفقات السالبة إلى السنة 0 بمعدل التمويل، ومراكمة التدفقات الموجبة لنهاية المشروع بمعدل إعادة الاستثمار.
   */
  private static calculateMIRR(
    initialCost: number,
    cashFlows: number[],
    financeAndReinvestRate: number
  ): number | null {
    const n = cashFlows.length;
    if (initialCost < 0 || n === 0) return null;

    let pvNegativeOutflows = initialCost; // السنة 0
    let fvPositiveInflows = 0;

    for (let t = 0; t < n; t++) {
      const cf = cashFlows[t];
      const year = t + 1;
      if (cf < 0) {
        pvNegativeOutflows += Math.abs(cf) / Math.pow(1 + financeAndReinvestRate, year);
      } else if (cf > 0) {
        fvPositiveInflows += cf * Math.pow(1 + financeAndReinvestRate, n - year);
      }
    }

    if (pvNegativeOutflows <= 0 || fvPositiveInflows <= 0) {
      return null;
    }

    const mirr = Math.pow(fvPositiveInflows / pvNegativeOutflows, 1 / n) - 1;
    return Number.isFinite(mirr) ? mirr : null;
  }

  /**
   * Robust multi-bracket scanning + Bisection solver for Internal Rate of Return (IRR)
   * Handles negative and non-conventional cash flows safely without crashing or NaN.
   */
  private static calculateIRR(initialCost: number, cashFlows: number[]): number | null {
    if (initialCost <= 0 || cashFlows.length === 0) return null;
    const hasPositive = cashFlows.some((v) => v > 0);
    if (!hasPositive) return null;

    const npvAtRate = (rate: number): number => {
      let sum = -initialCost;
      for (let t = 0; t < cashFlows.length; t++) {
        sum += cashFlows[t] / Math.pow(1 + rate, t + 1);
      }
      return sum;
    };

    // المسح المتدرج لاكتشاف أول فترة يتغير فيها اتجاه دالة NPV (يدعم التدفقات السالبة وتغير الإشارة المتعدد)
    const scanPoints = [
      -0.9, -0.75, -0.5, -0.25, -0.1, 0.0, 0.05, 0.1, 0.15, 0.2, 0.3, 0.5, 0.75, 1.0, 1.5, 2.0, 3.0, 5.0, 10.0, 20.0,
    ];
    let bracketLow: number | null = null;
    let bracketHigh: number | null = null;

    for (let i = 0; i < scanPoints.length - 1; i++) {
      const r1 = scanPoints[i];
      const r2 = scanPoints[i + 1];
      const f1 = npvAtRate(r1);
      const f2 = npvAtRate(r2);
      if (Math.abs(f1) < 1e-7) return r1;
      if (f1 * f2 < 0) {
        bracketLow = r1;
        bracketHigh = r2;
        break;
      }
    }

    if (bracketLow === null || bracketHigh === null) {
      return null;
    }

    let low = bracketLow;
    let high = bracketHigh;
    let fLow = npvAtRate(low);
    let mid = (low + high) / 2;

    for (let iter = 0; iter < 120; iter++) {
      mid = (low + high) / 2;
      const fMid = npvAtRate(mid);
      if (Math.abs(fMid) < 1e-7 || (high - low) / 2 < 1e-7) {
        return mid;
      }
      if (fLow * fMid < 0) {
        high = mid;
      } else {
        low = mid;
        fLow = fMid;
      }
    }
    return mid;
  }
}
