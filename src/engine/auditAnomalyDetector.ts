import Decimal from 'decimal.js';

Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP });

export interface AccountingPeriodData {
  totalRevenuePerBooks: number;
  totalRevenueReportedSalesTax: number;
  totalWithholdingTaxPaid: number;
  grossPayrollExpense: number;
  hazardousStaffCount: number;
  hazardousSscContributionPaid: number;
  avgMonthlySalaryPerHazardousWorker?: number;
}

export interface AuditAnomalyResult {
  hasCriticalAnomalies: boolean;
  warningsCount: number;
  revenueVarianceJod: string;
  expectedSalesTaxOnVarianceJod: string;
  expectedHazardousSscJod: string;
  anomalies: Array<{
    code: string;
    severity: 'HIGH' | 'MEDIUM';
    title: string;
    description: string;
    recommendation: string;
  }>;
}

export class AuditAnomalyDetector {
  public static inspectPeriod(data: AccountingPeriodData): AuditAnomalyResult {
    const anomalies: AuditAnomalyResult['anomalies'] = [];

    const revBooks = Decimal.max(0, new Decimal(data.totalRevenuePerBooks || 0)).toDecimalPlaces(3);
    const revSalesTax = Decimal.max(0, new Decimal(data.totalRevenueReportedSalesTax || 0)).toDecimalPlaces(3);

    const revVariance = revBooks.minus(revSalesTax).abs().toDecimalPlaces(3);
    const expectedTaxOnVariance = revVariance.times(new Decimal('0.16')).toDecimalPlaces(3);

    if (revVariance.greaterThan(1)) {
      anomalies.push({
        code: 'REV_MISMATCH',
        severity: 'HIGH',
        title: 'فارق جوهري بين إيراد الدفاتر وإيراد إقرارات ضريبة المبيعات',
        description: `يوجد فارق مقداره (${revVariance.toFixed(
          3
        )} د.أ) بين قيود المبيعات المحاسبية وإجمالي المبيعات المصرح عنها بإقرارات ضريبة المبيعات، ما قد يرتب فروقات ضريبية محتملة بقيمة (${expectedTaxOnVariance.toFixed(
          3
        )} د.أ) بنسبة 16%.`,
        recommendation:
          'إعداد كشف تسوية يوضح الإيرادات غير الخاضعة أو المعفاة أو فروقات التوقيت الزمني ومطابقته مع فواتير نظام JoFotara قبل الفحص الضريبي.',
      });
    }

    const payroll = Decimal.max(0, new Decimal(data.grossPayrollExpense || 0)).toDecimalPlaces(3);
    const minEstimatedTaxRatio = new Decimal('0.02');
    const withholding = Decimal.max(0, new Decimal(data.totalWithholdingTaxPaid || 0)).toDecimalPlaces(3);
    const minExpectedWithholding = payroll.times(minEstimatedTaxRatio).toDecimalPlaces(3);

    if (payroll.greaterThan(18000) && withholding.lessThan(minExpectedWithholding)) {
      anomalies.push({
        code: 'PAYROLL_WITHHOLDING_LOW',
        severity: 'MEDIUM',
        title: 'انخفاض في ضريبة الدخل المقتطعة من الرواتب والأجور',
        description: `مجموع ضريبة الرواتب المقتطعة والموردة (${withholding.toFixed(
          3
        )} د.أ) يقل عن الحد المعياري المتوقع لكتلة الرواتب المسجلة (${minExpectedWithholding.toFixed(3)} د.أ).`,
        recommendation:
          'التحقق من كشوفات الرواتب السنوية والتأكد من عدم منح إعفاءات تتجاوز السقف القانوني (10,000 د.أ للأعزب و 23,000 د.أ للمعيل شاملاً الفواتير الموثقة).',
      });
    }

    // حساب مساهمة المهن الخطرة (1% من الأجور الخاضعة للعاملين في المهن الخطرة)
    const hazCount = Math.max(0, Math.floor(data.hazardousStaffCount || 0));
    const avgHazMonthlyWage = new Decimal(data.avgMonthlySalaryPerHazardousWorker || 650);
    // الأجر السنوي التقديري لعمال المهن الخطرة (أو بما لا يتجاوز كتلة الرواتب الكلية)
    const estimatedHazardousAnnualPayroll = Decimal.min(
      payroll,
      avgHazMonthlyWage.times(12).times(hazCount)
    ).toDecimalPlaces(3);
    const hazardousExpectedExtra =
      hazCount > 0 ? estimatedHazardousAnnualPayroll.times(new Decimal('0.01')).toDecimalPlaces(3) : new Decimal(0);

    const actualPaid = Decimal.max(0, new Decimal(data.hazardousSscContributionPaid || 0)).toDecimalPlaces(3);
    if (hazCount > 0 && actualPaid.lessThan(hazardousExpectedExtra)) {
      const deficit = hazardousExpectedExtra.minus(actualPaid).toDecimalPlaces(3);
      anomalies.push({
        code: 'SSC_HAZARD_DEFICIT',
        severity: 'HIGH',
        title: 'نقص في توريد مساهمة المهن الخطرة الإضافية بالضمان الاجتماعي (1%)',
        description: `المنشأة لديها (${hazCount}) عمال في مهن خطرة بكتلة أجور خاضعة مقدرة (${estimatedHazardousAnnualPayroll.toFixed(
          3
        )} د.أ)، والمساهمة الإضافية المستحقة (1%) تبلغ (${hazardousExpectedExtra.toFixed(
          3
        )} د.أ) بينما المسدد فعلياً (${actualPaid.toFixed(3)} د.أ) بعجز مقداره (${deficit.toFixed(3)} د.أ).`,
        recommendation:
          'توريد فرق مساهمة المهن الخطرة (1%) للمؤسسة العامة للضمان الاجتماعي لتجنب غرامة التأخير القانونية (1% شهرياً).',
      });
    }

    return {
      hasCriticalAnomalies: anomalies.some((a) => a.severity === 'HIGH'),
      warningsCount: anomalies.length,
      revenueVarianceJod: revVariance.toFixed(3),
      expectedSalesTaxOnVarianceJod: expectedTaxOnVariance.toFixed(3),
      expectedHazardousSscJod: hazardousExpectedExtra.toFixed(3),
      anomalies,
    };
  }
}
