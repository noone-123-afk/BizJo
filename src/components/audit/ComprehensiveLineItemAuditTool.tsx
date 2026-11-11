import React, { useState } from 'react';
import Decimal from 'decimal.js';
import { jsPDF } from 'jspdf';
import {
  Calculator,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Plus,
  Trash2,
  Printer,
  FileJson,
  Eye,
  Layers,
  Scale,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP });

export type JoSalesTaxRateKey = 'RATE_16' | 'RATE_10' | 'RATE_4' | 'RATE_0' | 'EXEMPT';
export type PricingTaxMode = 'EXCLUSIVE' | 'INCLUSIVE';
export type WhtRateKey = 'WHT_0' | 'WHT_5' | 'WHT_7' | 'WHT_10';
export type WhtApplicationBase = 'ON_OPEX' | 'ON_SALES';
export type SectorBenchmarkKey =
  | 'RETAIL_TRADING'
  | 'INDUSTRIAL_MANUFACTURING'
  | 'PROFESSIONAL_SERVICES'
  | 'CONTRACTING_CONSTRUCTION';

export interface SectorBenchmarkConfig {
  key: SectorBenchmarkKey;
  labelAr: string;
  minGrossMarginPct: Decimal;
  maxGrossMarginPct: Decimal;
  maxOpexToSalesPct: Decimal;
  standardIncomeTaxRate: Decimal;
  istdGuideRef: string;
}

export const SECTOR_BENCHMARKS: Record<SectorBenchmarkKey, SectorBenchmarkConfig> = {
  RETAIL_TRADING: {
    key: 'RETAIL_TRADING',
    labelAr: 'تجارة التجزئة والجملة العامة (هامش معياري 12% – 35%)',
    minGrossMarginPct: new Decimal('12'),
    maxGrossMarginPct: new Decimal('35'),
    maxOpexToSalesPct: new Decimal('22'),
    standardIncomeTaxRate: new Decimal('0.21'), // 20% + 1% Nat Contrib
    istdGuideRef: 'الدليل الإرشادي للفحص القطاعي التجاري — ISTD',
  },
  INDUSTRIAL_MANUFACTURING: {
    key: 'INDUSTRIAL_MANUFACTURING',
    labelAr: 'القطاع الصناعي والإنتاجي التحويلي (هامش معياري 18% – 45%)',
    minGrossMarginPct: new Decimal('18'),
    maxGrossMarginPct: new Decimal('45'),
    maxOpexToSalesPct: new Decimal('26'),
    standardIncomeTaxRate: new Decimal('0.21'),
    istdGuideRef: 'معايير تدقيق الكلف الصناعية والمخصصات — المادة (9)',
  },
  PROFESSIONAL_SERVICES: {
    key: 'PROFESSIONAL_SERVICES',
    labelAr: 'الخدمات المهنية والاستشارية والتقنية (هامش معياري 40% – 85%)',
    minGrossMarginPct: new Decimal('40'),
    maxGrossMarginPct: new Decimal('85'),
    maxOpexToSalesPct: new Decimal('42'),
    standardIncomeTaxRate: new Decimal('0.21'),
    istdGuideRef: 'تعليمات تدقيق قطاعات الخدمات والأتعاب المهنية — المادة (12)',
  },
  CONTRACTING_CONSTRUCTION: {
    key: 'CONTRACTING_CONSTRUCTION',
    labelAr: 'المقاولات والإنشاءات الهندسية (هامش معياري 10% – 30%)',
    minGrossMarginPct: new Decimal('10'),
    maxGrossMarginPct: new Decimal('30'),
    maxOpexToSalesPct: new Decimal('18'),
    standardIncomeTaxRate: new Decimal('0.21'),
    istdGuideRef: 'معيار المحاسبة الدولي IAS 11 / IFRS 15 وتعليمات المقاولات',
  },
};

export const SALES_TAX_RATES: Record<
  JoSalesTaxRateKey,
  { labelAr: string; rate: Decimal; isExempt: boolean; lawArticle: string }
> = {
  RATE_16: {
    labelAr: 'خاضع للنسبة العامة القياسية (16%)',
    rate: new Decimal('0.16'),
    isExempt: false,
    lawArticle: 'المادة (6/أ) — قانون الضريبة العامة على المبيعات رقم 6 لسنة 1994',
  },
  RATE_10: {
    labelAr: 'خاضع للنسبة المخفضة (10%)',
    rate: new Decimal('0.10'),
    isExempt: false,
    lawArticle: 'الجدول الملحق — السلع والخدمات الخاضعة لنسبة 10%',
  },
  RATE_4: {
    labelAr: 'خاضع للنسبة المخفضة للسلع الأساسية (4%)',
    rate: new Decimal('0.04'),
    isExempt: false,
    lawArticle: 'الجدول رقم (3) — السلع الأساسية والمدخلات الزراعية (4%)',
  },
  RATE_0: {
    labelAr: 'خاضع لنسبة الصفر — تصدير / العقبة ASEZA (0%)',
    rate: new Decimal('0.00'),
    isExempt: false,
    lawArticle: 'المادة (7) — الصادرات ومنطقة العقبة الاقتصادية الخاصة (خصم كامل للمدخلات)',
  },
  EXEMPT: {
    labelAr: 'معفى من الضريبة (إعفاء كامل — جدول 2)',
    rate: new Decimal('0.00'),
    isExempt: true,
    lawArticle: 'الجدول رقم (2) والمادة (19) — معفى (لا تُخصم ضريبة المدخلات وتُرسمل للتكلفة)',
  },
};

export const WHT_RATES: Record<WhtRateKey, { labelAr: string; rate: Decimal; lawRef: string }> = {
  WHT_0: {
    labelAr: 'بدون اقتطاع ضريبة منبع (0%)',
    rate: new Decimal('0.00'),
    lawRef: 'بند غير خاضع لاقتطاع المنبع المباشر',
  },
  WHT_5: {
    labelAr: 'اقتطاع خدمات وأتعاب مهنية ومقاولات محلية (5%)',
    rate: new Decimal('0.05'),
    lawRef: 'المادة (12/أ) — تعليمات اقتطاع ضريبة الدخل بنسبة 5% (نموذج و/1)',
  },
  WHT_7: {
    labelAr: 'اقتطاع فوائد وعمولات لغير البنوك (7%)',
    rate: new Decimal('0.07'),
    lawRef: 'المادة (12) — اقتطاع عوائد الودائع والعمولات المالية',
  },
  WHT_10: {
    labelAr: 'اقتطاع إيجارات عقارات أو خدمات غير مقيمين (10%)',
    rate: new Decimal('0.10'),
    lawRef: 'المادة (12/ب) — اقتطاع الإيجارات والمبالغ المدفوعة لغير المقيمين (10%)',
  },
};

export interface AuditDeviationAlert {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  title: string;
  measuredValue: string;
  benchmarkRange: string;
  explanation: string;
  correctiveAction: string;
  legalReference: string;
}

export interface AuditedLineItemRecord {
  id: string;
  itemCode: string;
  itemName: string;
  accountCode: string;
  sectorKey: SectorBenchmarkKey;
  salesAmountInput: number;
  pricingMode: PricingTaxMode;
  salesTaxRateKey: JoSalesTaxRateKey;
  cogsAmountInput: number;
  inputTaxRatePct: number;
  opexAmountInput: number;
  unverifiedOpexInput: number;
  whtRateKey: WhtRateKey;
  whtBase: WhtApplicationBase;
}

export interface ComputedLineItemAudit {
  netSalesDec: Decimal;
  outputSalesTaxDec: Decimal;
  grossSalesWithTaxDec: Decimal;
  rawInputTaxOnCogsDec: Decimal;
  recoverableInputTaxDec: Decimal;
  nonRecoverableInputTaxDec: Decimal;
  netSalesTaxPayableDec: Decimal;
  effectiveCogsDec: Decimal;
  grossProfitDec: Decimal;
  grossMarginPctDec: Decimal;
  opexDec: Decimal;
  unverifiedOpexDec: Decimal;
  opexToSalesPctDec: Decimal;
  operatingProfitDec: Decimal;
  operatingMarginPctDec: Decimal;
  whtAmountDec: Decimal;
  adjustedTaxableIncomeDec: Decimal;
  estimatedIncomeTaxOnItemDec: Decimal;
  netCashFlowImpactDec: Decimal;
  deviations: AuditDeviationAlert[];
  complianceStatus: 'COMPLIANT' | 'REVIEW_REQUIRED' | 'HIGH_RISK';
  complianceScore: number;
}

function safeDec(value: number | string): Decimal {
  try {
    const d = new Decimal(value || 0);
    return d.isFinite() && d.gte(0) ? d : new Decimal(0);
  } catch {
    return new Decimal(0);
  }
}

export function evaluateLineItemAudit(item: AuditedLineItemRecord): ComputedLineItemAudit {
  const sector = SECTOR_BENCHMARKS[item.sectorKey];
  const taxCfg = SALES_TAX_RATES[item.salesTaxRateKey];
  const whtCfg = WHT_RATES[item.whtRateKey];

  const salesInputDec = safeDec(item.salesAmountInput);
  const cogsInputDec = safeDec(item.cogsAmountInput);
  const inputTaxRateDec = safeDec(item.inputTaxRatePct).div(100);
  const opexDec = safeDec(item.opexAmountInput);
  const unverifiedOpexDec = Decimal.min(opexDec, safeDec(item.unverifiedOpexInput));

  // 1. Sales & Output Sales Tax (3 decimal places - Jordanian Fils)
  let netSalesDec: Decimal;
  let outputSalesTaxDec: Decimal;
  let grossSalesWithTaxDec: Decimal;

  if (item.pricingMode === 'EXCLUSIVE') {
    netSalesDec = salesInputDec.toDecimalPlaces(3, Decimal.ROUND_HALF_UP);
    outputSalesTaxDec = netSalesDec.times(taxCfg.rate).toDecimalPlaces(3, Decimal.ROUND_HALF_UP);
    grossSalesWithTaxDec = netSalesDec.plus(outputSalesTaxDec).toDecimalPlaces(3, Decimal.ROUND_HALF_UP);
  } else {
    grossSalesWithTaxDec = salesInputDec.toDecimalPlaces(3, Decimal.ROUND_HALF_UP);
    netSalesDec = grossSalesWithTaxDec
      .div(new Decimal(1).plus(taxCfg.rate))
      .toDecimalPlaces(3, Decimal.ROUND_HALF_UP);
    outputSalesTaxDec = grossSalesWithTaxDec.minus(netSalesDec).toDecimalPlaces(3, Decimal.ROUND_HALF_UP);
  }

  // 2. Input Tax on COGS & Article 19 Exempt Apportionment Rule
  const rawInputTaxOnCogsDec = cogsInputDec.times(inputTaxRateDec).toDecimalPlaces(3, Decimal.ROUND_HALF_UP);
  const recoverableInputTaxDec = taxCfg.isExempt ? new Decimal(0) : rawInputTaxOnCogsDec;
  const nonRecoverableInputTaxDec = taxCfg.isExempt ? rawInputTaxOnCogsDec : new Decimal(0);
  const netSalesTaxPayableDec = outputSalesTaxDec
    .minus(recoverableInputTaxDec)
    .toDecimalPlaces(3, Decimal.ROUND_HALF_UP);

  // 3. Effective COGS, Gross Profit, and Operating Profit
  const effectiveCogsDec = cogsInputDec.plus(nonRecoverableInputTaxDec).toDecimalPlaces(3, Decimal.ROUND_HALF_UP);
  const grossProfitDec = netSalesDec.minus(effectiveCogsDec).toDecimalPlaces(3, Decimal.ROUND_HALF_UP);
  const grossMarginPctDec = netSalesDec.gt(0)
    ? grossProfitDec.div(netSalesDec).times(100).toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
    : new Decimal(0);

  const operatingProfitDec = grossProfitDec.minus(opexDec).toDecimalPlaces(3, Decimal.ROUND_HALF_UP);
  const operatingMarginPctDec = netSalesDec.gt(0)
    ? operatingProfitDec.div(netSalesDec).times(100).toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
    : new Decimal(0);

  const opexToSalesPctDec = netSalesDec.gt(0)
    ? opexDec.div(netSalesDec).times(100).toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
    : new Decimal(0);

  // 4. Withholding Tax (WHT) Calculation
  const whtBaseAmountDec = item.whtBase === 'ON_SALES' ? netSalesDec : opexDec;
  const whtAmountDec = whtBaseAmountDec.times(whtCfg.rate).toDecimalPlaces(3, Decimal.ROUND_HALF_UP);

  // 5. Adjusted Taxable Income (Adding back unverified non-JoFotara expenses per Article 9)
  const adjustedTaxableIncomeDec = Decimal.max(
    0,
    operatingProfitDec.plus(unverifiedOpexDec)
  ).toDecimalPlaces(3, Decimal.ROUND_HALF_UP);

  const estimatedIncomeTaxOnItemDec = adjustedTaxableIncomeDec
    .times(sector.standardIncomeTaxRate)
    .toDecimalPlaces(3, Decimal.ROUND_HALF_UP);

  const netCashFlowImpactDec = grossSalesWithTaxDec
    .minus(cogsInputDec.plus(rawInputTaxOnCogsDec))
    .minus(opexDec)
    .minus(netSalesTaxPayableDec)
    .minus(estimatedIncomeTaxOnItemDec)
    .toDecimalPlaces(3, Decimal.ROUND_HALF_UP);

  // 6. Normative Deviations & Discrepancy Detection Engine
  const deviations: AuditDeviationAlert[] = [];

  if (netSalesDec.gt(0) && grossProfitDec.lt(0)) {
    deviations.push({
      id: 'DEV-COGS-LOSS',
      severity: 'CRITICAL',
      title: 'بيع بأقل من التكلفة الفعلية (مجمل ربح سالب)',
      measuredValue: `${grossMarginPctDec.toFixed(2)}% (${grossProfitDec.toFixed(3)} د.أ)`,
      benchmarkRange: `${sector.minGrossMarginPct.toFixed(0)}% – ${sector.maxGrossMarginPct.toFixed(0)}%`,
      explanation:
        'تكلفة البضاعة المباعة تتجاوز صافي قيمة البيع. يعتبر البيع بأقل من التكلفة دون محضر إتلاف موثق أو تنزيلات معلنة قرينة على تخفيض الوعاء الضريبي.',
      correctiveAction:
        'توثيق مبررات البيع بأقل من التكلفة أو إعادة تسعير البند وفق القيمة السوقية العادلة (سعر المثل) لتجنب التقدير الإداري.',
      legalReference: 'المادة (20) من قانون الضريبة العامة على المبيعات والمادة (23) من قانون ضريبة الدخل',
    });
  } else if (netSalesDec.gt(0) && grossMarginPctDec.lt(sector.minGrossMarginPct)) {
    deviations.push({
      id: 'DEV-GM-LOW',
      severity: 'HIGH',
      title: 'انحراف هامش مجمل الربح دون الحد الأدنى المعياري للقطاع',
      measuredValue: `${grossMarginPctDec.toFixed(2)}%`,
      benchmarkRange: `الحد الأدنى المعياري: ${sector.minGrossMarginPct.toFixed(0)}%`,
      explanation: `هامش مجمل الربح المحقق (${grossMarginPctDec.toFixed(2)}%) يقل عن النسبة المعيارية الدنيا المعلنة لدى دائرة ضريبة الدخل والمبيعات لهذا القطاع (${sector.minGrossMarginPct.toFixed(0)}%).`,
      correctiveAction:
        'مراجعة فواتير الشراء وقيود جرد المخزون (IAS 2) وإعداد كشف مطابقة كمي يبرر ارتفاع التكلفة المباشرة أمام المدقق الضريبي.',
      legalReference: sector.istdGuideRef,
    });
  } else if (netSalesDec.gt(0) && grossMarginPctDec.gt(sector.maxGrossMarginPct)) {
    deviations.push({
      id: 'DEV-GM-HIGH',
      severity: 'MEDIUM',
      title: 'تجاوز هامش مجمل الربح للسقف القطاعي المعتاد (شبهة نقص قيد التكاليف)',
      measuredValue: `${grossMarginPctDec.toFixed(2)}%`,
      benchmarkRange: `النطاق المعتاد: ${sector.minGrossMarginPct.toFixed(0)}% – ${sector.maxGrossMarginPct.toFixed(0)}%`,
      explanation:
        'ارتفاع هامش مجمل الربح بشكل غير اعتيادي قد يشير إلى عدم إثبات كافة فواتير المشتريات أو تكاليف البضاعة المباعة الخاصة بالفترة.',
      correctiveAction:
        'التحقق من اكتمال ترحيل فواتير المشتريات المحلية وبيانات الاستيراد الجمركية وفق مبدأ مقابلة الإيرادات بالمصروفات.',
      legalReference: 'معيار المحاسبة الدولي IAS 2 — اكتمال قيود التكلفة',
    });
  }

  if (netSalesDec.gt(0) && opexToSalesPctDec.gt(sector.maxOpexToSalesPct)) {
    deviations.push({
      id: 'DEV-OPEX-HIGH',
      severity: 'HIGH',
      title: 'تجاوز المصاريف التشغيلية للسقف النسبي المتعارف عليه للإيرادات',
      measuredValue: `${opexToSalesPctDec.toFixed(2)}% من صافي المبيعات`,
      benchmarkRange: `السقف المعياري: <= ${sector.maxOpexToSalesPct.toFixed(0)}%`,
      explanation: `المصاريف التشغيلية المحملة على البند تمثل (${opexToSalesPctDec.toFixed(2)}%) من المبيعات، وهو ما يتجاوز الحد المعياري للقطاع (${sector.maxOpexToSalesPct.toFixed(0)}%).`,
      correctiveAction:
        'فصل المصاريف الرأسمالية أو الشخصية غير المرتبطة بإنتاج الدخل وتجهيز العقود والمستندات المؤيدة لكل مصروف تشغيلي.',
      legalReference: 'المادة (9/أ) من قانون ضريبة الدخل رقم 34 لسنة 2014',
    });
  }

  if (unverifiedOpexDec.gt(0)) {
    deviations.push({
      id: 'DEV-UNVERIFIED-JOFOTARA',
      severity: 'CRITICAL',
      title: 'وجود مصاريف غير مؤيدة بفواتير ضريبية إلكترونية (JoFotara)',
      measuredValue: `${unverifiedOpexDec.toFixed(3)} د.أ`,
      benchmarkRange: 'المعيار الإلزامي: 0.000 د.أ غير مؤيد',
      explanation: `تم رصد مصاريف بقيمة (${unverifiedOpexDec.toFixed(3)} د.أ) تفتقر لفواتير ضريبية صادرة عبر نظام الفوترة الإلكتروني، مما يوجب ردّها للوعاء الضريبي.`,
      correctiveAction:
        'تمت إضافة المبلغ تلقائياً إلى الوعاء الضريبي المعدل للبند؛ يُوصى بمطالبة الموردين بإصدار فواتير JoFotara إلكترونية قبل إغلاق الفترة.',
      legalReference: 'نظام الفوترة الإلكتروني رقم (2) لسنة 2019 والمادة (9) من قانون ضريبة الدخل',
    });
  }

  if (taxCfg.isExempt && rawInputTaxOnCogsDec.gt(0)) {
    deviations.push({
      id: 'DEV-EXEMPT-INPUT-DISALLOWED',
      severity: 'MEDIUM',
      title: 'حظر خصم ضريبة المدخلات للبند المعفى ورسملتها ضمن التكلفة',
      measuredValue: `${rawInputTaxOnCogsDec.toFixed(3)} د.أ ضريبة مدخلات غير قابلة للرد`,
      benchmarkRange: 'خصم المدخلات المسموح للمعفي: 0.000 د.أ',
      explanation:
        'نظراً لأن البند معفى من ضريبة المبيعات، لا يجوز استرداد أو خصم ضريبة المدخلات المدفوعة على مشترياته ومستلزماته.',
      correctiveAction:
        'قام المحرك تلقائياً باستبعاد ضريبة المدخلات من الإقرار الضريبي وإضافتها إلى التكلفة الفعلية للبند (Effective COGS).',
      legalReference: 'المادة (19/ج) من قانون الضريبة العامة على المبيعات رقم 6 لسنة 1994',
    });
  }

  if (whtAmountDec.gt(0)) {
    deviations.push({
      id: 'DEV-WHT-OBLIGATION',
      severity: 'MEDIUM',
      title:
        item.whtBase === 'ON_OPEX'
          ? 'التزام اقتطاع وتوريد ضريبة المنبع على المصاريف (نموذج و/1)'
          : 'رصيد ضريبة دخل مقتطعة من المنبع لصالح المنشأة على المقبوضات',
      measuredValue: `${whtAmountDec.toFixed(3)} د.أ (${whtCfg.rate.times(100).toFixed(0)}%)`,
      benchmarkRange: 'توريد خلال 30 يوماً من الدفع/الاستحقاق',
      explanation:
        item.whtBase === 'ON_OPEX'
          ? 'يترتب على دفع هذا المصروف اقتطاع ضريبة دخل من المنبع وتوريدها لدائرة الضريبة خلال المهلة القانونية.'
          : 'يتم خصم هذا المبلغ من قبل العميل الدافع ويسجل كدفعة ضريبية مقدمة قابلة للتقاص في الإقرار السنوي للمنشأة.',
      correctiveAction:
        item.whtBase === 'ON_OPEX'
          ? 'إصدار شهادة اقتطاع ضريبي للمورد وتوريد المبلغ عبر البوابة الإلكترونية لدائرة الضريبة تجنباً لغرامة 0.4% أسبوعياً.'
          : 'الحصول على شهادة اقتطاع مصدقة من العميل لإثبات الرصيد الدائن في حساب أمانات ضريبة الدخل.',
      legalReference: whtCfg.lawRef,
    });
  }

  const criticalCount = deviations.filter((d) => d.severity === 'CRITICAL').length;
  const highCount = deviations.filter((d) => d.severity === 'HIGH').length;
  const mediumCount = deviations.filter((d) => d.severity === 'MEDIUM').length;

  const rawScore = 100 - criticalCount * 35 - highCount * 20 - mediumCount * 8;
  const complianceScore = Math.max(15, Math.min(100, rawScore));

  const complianceStatus: 'COMPLIANT' | 'REVIEW_REQUIRED' | 'HIGH_RISK' =
    criticalCount > 0 ? 'HIGH_RISK' : highCount > 0 ? 'REVIEW_REQUIRED' : 'COMPLIANT';

  return {
    netSalesDec,
    outputSalesTaxDec,
    grossSalesWithTaxDec,
    rawInputTaxOnCogsDec,
    recoverableInputTaxDec,
    nonRecoverableInputTaxDec,
    netSalesTaxPayableDec,
    effectiveCogsDec,
    grossProfitDec,
    grossMarginPctDec,
    opexDec,
    unverifiedOpexDec,
    opexToSalesPctDec,
    operatingProfitDec,
    operatingMarginPctDec,
    whtAmountDec,
    adjustedTaxableIncomeDec,
    estimatedIncomeTaxOnItemDec,
    netCashFlowImpactDec,
    deviations,
    complianceStatus,
    complianceScore,
  };
}

const INITIAL_AUDITED_ITEMS: AuditedLineItemRecord[] = [
  {
    id: 'ITEM-001',
    itemCode: 'INV-2026-401',
    itemName: 'توريد خطوط ومعدات إنتاج صناعية (خاضع 16%)',
    accountCode: '40101',
    sectorKey: 'INDUSTRIAL_MANUFACTURING',
    salesAmountInput: 48500,
    pricingMode: 'EXCLUSIVE',
    salesTaxRateKey: 'RATE_16',
    cogsAmountInput: 33200,
    inputTaxRatePct: 16,
    opexAmountInput: 6400,
    unverifiedOpexInput: 0,
    whtRateKey: 'WHT_0',
    whtBase: 'ON_OPEX',
  },
  {
    id: 'ITEM-002',
    itemCode: 'INV-2026-402',
    itemName: 'عقد خدمات استشارية وتطوير أنظمة محاسبية (مع اقتطاع 5%)',
    accountCode: '40102',
    sectorKey: 'PROFESSIONAL_SERVICES',
    salesAmountInput: 18000,
    pricingMode: 'EXCLUSIVE',
    salesTaxRateKey: 'RATE_16',
    cogsAmountInput: 4500,
    inputTaxRatePct: 16,
    opexAmountInput: 5200,
    unverifiedOpexInput: 850,
    whtRateKey: 'WHT_5',
    whtBase: 'ON_SALES',
  },
  {
    id: 'ITEM-003',
    itemCode: 'INV-2026-403',
    itemName: 'توريد مواد غذائية أساسية ومدخلات زراعية (نسبة مخفضة 4%)',
    accountCode: '40103',
    sectorKey: 'RETAIL_TRADING',
    salesAmountInput: 24000,
    pricingMode: 'EXCLUSIVE',
    salesTaxRateKey: 'RATE_4',
    cogsAmountInput: 19800,
    inputTaxRatePct: 4,
    opexAmountInput: 2100,
    unverifiedOpexInput: 0,
    whtRateKey: 'WHT_0',
    whtBase: 'ON_OPEX',
  },
];

export default function ComprehensiveLineItemAuditTool() {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [showReportPreviewModal, setShowReportPreviewModal] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);

  // Active Line Item State
  const [activeItem, setActiveItem] = useState<AuditedLineItemRecord>({
    id: 'ACTIVE-AUDIT',
    itemCode: 'AUD-2026-901',
    itemName: 'مبيعات أجهزة ومعدات تقنية شاملة التركيب والصيانة',
    accountCode: '40101',
    sectorKey: 'RETAIL_TRADING',
    salesAmountInput: 35000,
    pricingMode: 'EXCLUSIVE',
    salesTaxRateKey: 'RATE_16',
    cogsAmountInput: 24500,
    inputTaxRatePct: 16,
    opexAmountInput: 5800,
    unverifiedOpexInput: 650,
    whtRateKey: 'WHT_5',
    whtBase: 'ON_OPEX',
  });

  // All-Items Register State
  const [auditedItemsList, setAuditedItemsList] = useState<AuditedLineItemRecord[]>(INITIAL_AUDITED_ITEMS);

  const activeAudit = evaluateLineItemAudit(activeItem);
  const activeSectorCfg = SECTOR_BENCHMARKS[activeItem.sectorKey];
  const activeTaxCfg = SALES_TAX_RATES[activeItem.salesTaxRateKey];

  // Aggregate All-Items Register Totals using exact Decimal.js arithmetic
  const registerEvaluations = auditedItemsList.map((item) => ({
    item,
    audit: evaluateLineItemAudit(item),
  }));

  const aggregateTotals = registerEvaluations.reduce(
    (acc, curr) => {
      return {
        netSales: acc.netSales.plus(curr.audit.netSalesDec),
        outputTax: acc.outputTax.plus(curr.audit.outputSalesTaxDec),
        recoverableInputTax: acc.recoverableInputTax.plus(curr.audit.recoverableInputTaxDec),
        netSalesTaxPayable: acc.netSalesTaxPayable.plus(curr.audit.netSalesTaxPayableDec),
        effectiveCogs: acc.effectiveCogs.plus(curr.audit.effectiveCogsDec),
        opex: acc.opex.plus(curr.audit.opexDec),
        operatingProfit: acc.operatingProfit.plus(curr.audit.operatingProfitDec),
        adjustedTaxableIncome: acc.adjustedTaxableIncome.plus(curr.audit.adjustedTaxableIncomeDec),
        whtTotal: acc.whtTotal.plus(curr.audit.whtAmountDec),
        alertsCount: acc.alertsCount + curr.audit.deviations.length,
      };
    },
    {
      netSales: new Decimal(0),
      outputTax: new Decimal(0),
      recoverableInputTax: new Decimal(0),
      netSalesTaxPayable: new Decimal(0),
      effectiveCogs: new Decimal(0),
      opex: new Decimal(0),
      operatingProfit: new Decimal(0),
      adjustedTaxableIncome: new Decimal(0),
      whtTotal: new Decimal(0),
      alertsCount: 0,
    }
  );

  const handleAddOrUpdateItemInRegister = () => {
    const existingIndex = auditedItemsList.findIndex((i) => i.itemCode === activeItem.itemCode);
    if (existingIndex >= 0) {
      const updated = [...auditedItemsList];
      updated[existingIndex] = { ...activeItem, id: auditedItemsList[existingIndex].id };
      setAuditedItemsList(updated);
    } else {
      const newItem: AuditedLineItemRecord = {
        ...activeItem,
        id: `ITEM-${Date.now()}`,
      };
      setAuditedItemsList([newItem, ...auditedItemsList]);
    }
  };

  const handleLoadItemIntoInspector = (record: AuditedLineItemRecord) => {
    setActiveItem({ ...record });
  };

  const handleDeleteItemFromRegister = (id: string) => {
    setAuditedItemsList(auditedItemsList.filter((i) => i.id !== id));
  };

  const handleExportAuditJsonPackage = () => {
    const payload = {
      schemaVersion: 'JO-ISTD-LINE-ITEM-AUDIT-2026.1',
      generatedAt: new Date().toISOString(),
      currency: 'JOD',
      precisionDecimals: 3,
      activeAuditedItem: {
        metadata: activeItem,
        calculations: {
          netSalesJod: activeAudit.netSalesDec.toFixed(3),
          outputSalesTaxJod: activeAudit.outputSalesTaxDec.toFixed(3),
          grossSalesWithTaxJod: activeAudit.grossSalesWithTaxDec.toFixed(3),
          recoverableInputTaxJod: activeAudit.recoverableInputTaxDec.toFixed(3),
          nonRecoverableInputTaxJod: activeAudit.nonRecoverableInputTaxDec.toFixed(3),
          netSalesTaxPayableJod: activeAudit.netSalesTaxPayableDec.toFixed(3),
          effectiveCogsJod: activeAudit.effectiveCogsDec.toFixed(3),
          grossProfitJod: activeAudit.grossProfitDec.toFixed(3),
          grossMarginPct: activeAudit.grossMarginPctDec.toFixed(2),
          operatingExpensesJod: activeAudit.opexDec.toFixed(3),
          unverifiedExpensesAddedBackJod: activeAudit.unverifiedOpexDec.toFixed(3),
          operatingProfitJod: activeAudit.operatingProfitDec.toFixed(3),
          withholdingTaxJod: activeAudit.whtAmountDec.toFixed(3),
          adjustedTaxableIncomeJod: activeAudit.adjustedTaxableIncomeDec.toFixed(3),
          estimatedIncomeTaxJod: activeAudit.estimatedIncomeTaxOnItemDec.toFixed(3),
        },
        complianceStatus: activeAudit.complianceStatus,
        complianceScore: activeAudit.complianceScore,
        detectedDeviations: activeAudit.deviations,
      },
      allAuditedItemsSummary: {
        totalItemsCount: auditedItemsList.length,
        totalNetSalesJod: aggregateTotals.netSales.toFixed(3),
        totalNetSalesTaxPayableJod: aggregateTotals.netSalesTaxPayable.toFixed(3),
        totalOperatingProfitJod: aggregateTotals.operatingProfit.toFixed(3),
        totalAdjustedTaxableIncomeJod: aggregateTotals.adjustedTaxableIncome.toFixed(3),
        totalWithholdingTaxJod: aggregateTotals.whtTotal.toFixed(3),
      },
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ISTD_LineItem_Audit_Report_${activeItem.itemCode}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportAuditPdfReport = () => {
    setIsExportingPdf(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1240;
      canvas.height = 1754; // A4 @ 150 DPI
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Header Banner
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, 170);

      ctx.fillStyle = '#10b981';
      ctx.fillRect(0, 170, canvas.width, 6);

      ctx.direction = 'rtl';
      ctx.textAlign = 'right';

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px Cairo, sans-serif';
      ctx.fillText('تقرير التدقيق الشامل للبند المالي ومطابقة ضريبة المبيعات والدخل (ISTD)', 1170, 65);

      ctx.fillStyle = '#34d399';
      ctx.font = '600 19px Cairo, sans-serif';
      ctx.fillText(
        'مفحوص بدقة الفلس الأردني (3 خانات عشرية) وفق قانون الضريبة العامة على المبيعات رقم (6) وقانون ضريبة الدخل رقم (34)',
        1170,
        108
      );

      ctx.fillStyle = '#94a3b8';
      ctx.font = '15px monospace';
      ctx.fillText(
        `رمز البند: ${activeItem.itemCode}   |   الحساب: ${activeItem.accountCode}   |   درجة الامتثال المعياري: ${activeAudit.complianceScore}%   |   التاريخ: ${new Date().toISOString().split('T')[0]}`,
        1170,
        145
      );

      // Item Metadata Box
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.fillRect(70, 200, 1100, 130);
      ctx.strokeRect(70, 200, 1100, 130);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 20px Cairo, sans-serif';
      ctx.fillText(`بيان البند المدقق: ${activeItem.itemName}`, 1140, 240);

      ctx.fillStyle = '#334155';
      ctx.font = '17px Cairo, sans-serif';
      ctx.fillText(`القطاع المعياري: ${activeSectorCfg.labelAr}`, 1140, 275);
      ctx.fillText(`المعاملة الضريبية للمبيعات: ${activeTaxCfg.labelAr}`, 1140, 310);

      // Financial Breakdown Rows
      const tableRows: Array<{ label: string; sub: string; val: string; highlight?: boolean }> = [
        {
          label: '1. صافي قيمة المبيعات الخاضعة (بعد فصل الضريبة)',
          sub: activeItem.pricingMode === 'INCLUSIVE' ? 'تم استخلاص الصافي من السعر الشامل للضريبة' : 'السعر الأساسي قبل إضافة ضريبة المبيعات',
          val: `${activeAudit.netSalesDec.toFixed(3)} JOD`,
        },
        {
          label: '2. ضريبة المبيعات المستحقة على المخرجات (Output Sales Tax)',
          sub: activeTaxCfg.lawArticle,
          val: `${activeAudit.outputSalesTaxDec.toFixed(3)} JOD`,
        },
        {
          label: '3. ضريبة المدخلات القابلة للخصم والرد على التكلفة (Input Tax Credit)',
          sub: activeTaxCfg.isExempt
            ? 'بند معفى (المادة 19): ضريبة المدخلات غير قابلة للخصم وتمت إضافتها للتكلفة'
            : `ضريبة المدخلات المخصومة بنسبة (${activeItem.inputTaxRatePct}%) على المشتريات المباشرة`,
          val: `- ${activeAudit.recoverableInputTaxDec.toFixed(3)} JOD`,
        },
        {
          label: '4. صافي ضريبة المبيعات المستحقة للتوريد عن البند (Net GST Payable)',
          sub: 'ضريبة المخرجات مطروحاً منها ضريبة المدخلات القابلة للخصم',
          val: `${activeAudit.netSalesTaxPayableDec.toFixed(3)} JOD`,
          highlight: true,
        },
        {
          label: '5. التكلفة الفعلية للبضاعة المباعة (Effective COGS) ومجمل الربح',
          sub: `التكلفة المباشرة: ${activeAudit.effectiveCogsDec.toFixed(3)} د.أ  |  هامش مجمل الربح: ${activeAudit.grossMarginPctDec.toFixed(2)}%`,
          val: `${activeAudit.grossProfitDec.toFixed(3)} JOD`,
        },
        {
          label: '6. المصاريف التشغيلية والربح التشغيلي الصافي للبند',
          sub: `المصاريف التشغيلية: ${activeAudit.opexDec.toFixed(3)} د.أ (${activeAudit.opexToSalesPctDec.toFixed(2)}% من المبيعات)`,
          val: `${activeAudit.operatingProfitDec.toFixed(3)} JOD`,
        },
        {
          label: '7. ضريبة الاقتطاع من المنبع المرتبطة بالبند (Withholding Tax - WHT)',
          sub: WHT_RATES[activeItem.whtRateKey].lawRef,
          val: `${activeAudit.whtAmountDec.toFixed(3)} JOD`,
        },
        {
          label: '8. الوعاء الضريبي المعدل للبند وضريبة الدخل المقدرة',
          sub: `بعد رد المصاريف غير المؤيدة (${activeAudit.unverifiedOpexDec.toFixed(3)} د.أ) — ضريبة الدخل المقدرة: ${activeAudit.estimatedIncomeTaxOnItemDec.toFixed(3)} د.أ`,
          val: `${activeAudit.adjustedTaxableIncomeDec.toFixed(3)} JOD`,
          highlight: true,
        },
      ];

      let y = 355;
      tableRows.forEach((r) => {
        ctx.fillStyle = r.highlight ? '#ecfdf5' : '#ffffff';
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1.5;
        ctx.fillRect(70, y, 1100, 78);
        ctx.strokeRect(70, y, 1100, 78);

        ctx.textAlign = 'right';
        ctx.fillStyle = r.highlight ? '#065f46' : '#0f172a';
        ctx.font = 'bold 18px Cairo, sans-serif';
        ctx.fillText(r.label, 1145, y + 32);

        ctx.fillStyle = '#64748b';
        ctx.font = '14px Cairo, sans-serif';
        ctx.fillText(r.sub, 1145, y + 58);

        ctx.textAlign = 'left';
        ctx.fillStyle = r.highlight ? '#047857' : '#0f172a';
        ctx.font = 'bold 19px monospace';
        ctx.fillText(r.val, 95, y + 46);

        y += 84;
      });

      // Deviations Section in PDF
      ctx.textAlign = 'right';
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 21px Cairo, sans-serif';
      ctx.fillText(`نتائج فحص الانحرافات المعيارية والتناقضات الضريبية (${activeAudit.deviations.length} تنبيه):`, 1170, y + 35);

      y += 55;
      if (activeAudit.deviations.length === 0) {
        ctx.fillStyle = '#ecfdf5';
        ctx.strokeStyle = '#10b981';
        ctx.fillRect(70, y, 1100, 80);
        ctx.strokeRect(70, y, 1100, 80);
        ctx.fillStyle = '#065f46';
        ctx.font = 'bold 18px Cairo, sans-serif';
        ctx.fillText('✓ كافة مؤشرات البند المالي متوافقة 100% مع المعايير المحاسبية والضريبية المعلنة في الأردن.', 1140, y + 48);
      } else {
        activeAudit.deviations.slice(0, 4).forEach((dev) => {
          ctx.fillStyle = dev.severity === 'CRITICAL' ? '#fff1f2' : '#fffbeb';
          ctx.strokeStyle = dev.severity === 'CRITICAL' ? '#f43f5e' : '#f59e0b';
          ctx.fillRect(70, y, 1100, 88);
          ctx.strokeRect(70, y, 1100, 88);

          ctx.fillStyle = dev.severity === 'CRITICAL' ? '#be123c' : '#b45309';
          ctx.font = 'bold 17px Cairo, sans-serif';
          ctx.fillText(`• ${dev.title} [القيمة المسجلة: ${dev.measuredValue} | المعيار: ${dev.benchmarkRange}]`, 1145, y + 32);

          ctx.fillStyle = '#334155';
          ctx.font = '14px Cairo, sans-serif';
          ctx.fillText(`التوصية التصحيحية: ${dev.correctiveAction} (${dev.legalReference})`, 1145, y + 64);

          y += 96;
        });
      }

      // Footer
      ctx.fillStyle = '#475569';
      ctx.font = '15px Cairo, sans-serif';
      ctx.fillText(
        'تم توليد شهادة تدقيق البند المالي آلياً للغرض الميداني وإرفاقها مع حزمة الفحص الضريبي الموحدة (Jordan SAF-T).',
        1170,
        1665
      );
      ctx.fillText('توقيع المدقق الداخلي / المحاسب القانوني (JCPA): ....................................................', 1170, 1710);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
      pdf.save(`ISTD_LineItem_Audit_${activeItem.itemCode}.pdf`);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-2 border-emerald-600/40 dark:border-emerald-500/40 rounded-2xl shadow-sm overflow-hidden">
      {/* Top Pinned Tool Header Banner */}
      <div className="bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                أداة مثبتة للفحص الميداني والتدقيق المعياري · دقة 3 خانات عشرية (فلس أردني)
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white">
              حاسبة المبيعات والتدقيق الشامل للبند المالي وكشف الانحرافات (ISTD & IAS Line-Item Auditor)
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowReportPreviewModal(!showReportPreviewModal)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0"
          >
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            <span>{showReportPreviewModal ? 'إخفاء معاينة التقرير' : 'معاينة شهادة تدقيق البند'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportAuditPdfReport}
            disabled={isExportingPdf}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{isExportingPdf ? 'جاري التصدير...' : 'تصدير تقرير البند (PDF)'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportAuditJsonPackage}
            className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0"
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>إرفاق مع حزمة SAF-T (JSON)</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 cursor-pointer"
            title={isExpanded ? 'طي الأداة' : 'توسيع الأداة'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 sm:p-8 space-y-8">
          {/* Quick Preset Scenario Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 font-semibold">
              <Scale className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>نماذج فحص معيارية جاهزة للتجربة الفورية:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setActiveItem({
                    id: 'PRESET-1',
                    itemCode: 'INV-2026-160',
                    itemName: 'توريد أجهزة ومعدات تجارية محلية (خاضع 16% - متوافق معيارياً)',
                    accountCode: '40101',
                    sectorKey: 'RETAIL_TRADING',
                    salesAmountInput: 25000,
                    pricingMode: 'EXCLUSIVE',
                    salesTaxRateKey: 'RATE_16',
                    cogsAmountInput: 19200,
                    inputTaxRatePct: 16,
                    opexAmountInput: 3100,
                    unverifiedOpexInput: 0,
                    whtRateKey: 'WHT_0',
                    whtBase: 'ON_OPEX',
                  })
                }
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 hover:border-emerald-500 text-slate-700 dark:text-slate-200 transition cursor-pointer whitespace-nowrap"
              >
                بند مبيعات قياسي متوافق (16%)
              </button>

              <button
                type="button"
                onClick={() =>
                  setActiveItem({
                    id: 'PRESET-2',
                    itemCode: 'INV-2026-884',
                    itemName: 'صفقة بيع بضاعة بهامش متدنٍ ومصاريف غير موثقة بـ JoFotara (مخاطرة ضريبية)',
                    accountCode: '40101',
                    sectorKey: 'RETAIL_TRADING',
                    salesAmountInput: 40000,
                    pricingMode: 'INCLUSIVE',
                    salesTaxRateKey: 'RATE_16',
                    cogsAmountInput: 33500,
                    inputTaxRatePct: 16,
                    opexAmountInput: 9800,
                    unverifiedOpexInput: 2400,
                    whtRateKey: 'WHT_5',
                    whtBase: 'ON_OPEX',
                  })
                }
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-950/20 border border-rose-700/40 hover:border-rose-500 text-rose-600 dark:text-rose-300 transition cursor-pointer whitespace-nowrap"
              >
                فحص بند عالي المخاطر (انحراف الهوامش + مصاريف غير مؤيدة)
              </button>

              <button
                type="button"
                onClick={() =>
                  setActiveItem({
                    id: 'PRESET-3',
                    itemCode: 'INV-2026-309',
                    itemName: 'مبيعات معفاة مع ضريبة مدخلات غير قابلة للخصم (المادة 19)',
                    accountCode: '40104',
                    sectorKey: 'INDUSTRIAL_MANUFACTURING',
                    salesAmountInput: 30000,
                    pricingMode: 'EXCLUSIVE',
                    salesTaxRateKey: 'EXEMPT',
                    cogsAmountInput: 21000,
                    inputTaxRatePct: 16,
                    opexAmountInput: 3500,
                    unverifiedOpexInput: 0,
                    whtRateKey: 'WHT_10',
                    whtBase: 'ON_OPEX',
                  })
                }
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-950/20 border border-amber-700/40 hover:border-amber-500 text-amber-600 dark:text-amber-300 transition cursor-pointer whitespace-nowrap"
              >
                بند معفى + رسملة ضريبة المدخلات + اقتطاع إيجار (10%)
              </button>
            </div>
          </div>

          {/* Main 12-Column Interactive Audit Workbench */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* LEFT 5 COLUMNS: Comprehensive Financial Line-Item Inputs */}
            <div className="lg:col-span-5 space-y-4 bg-slate-50/70 dark:bg-slate-950/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  1. إدخال تفاصيل البند المالي والمعاملات الضريبية
                </h3>
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                  Decimal.js (0.001 JOD)
                </span>
              </div>

              {/* Identification & Sector */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">رقم المرجع / الفاتورة</label>
                  <input
                    type="text"
                    value={activeItem.itemCode}
                    onChange={(e) => setActiveItem({ ...activeItem, itemCode: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-2 text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">رمز الحساب (COA)</label>
                  <input
                    type="text"
                    value={activeItem.accountCode}
                    onChange={(e) => setActiveItem({ ...activeItem, accountCode: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-2 text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">التسعير الضريبي</label>
                  <select
                    value={activeItem.pricingMode}
                    onChange={(e) => setActiveItem({ ...activeItem, pricingMode: e.target.value as PricingTaxMode })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2 py-2 text-xs text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="EXCLUSIVE">غير شامل للضريبة</option>
                    <option value="INCLUSIVE">شامل للضريبة</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">بيان البند المالي أو اسم العملية</label>
                <input
                  type="text"
                  value={activeItem.itemName}
                  onChange={(e) => setActiveItem({ ...activeItem, itemName: e.target.value })}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">
                  القطاع المعياري للمنشأة (للمقارنة مع هوامش الربح والمصاريف الاسترشادية لدى ISTD)
                </label>
                <select
                  value={activeItem.sectorKey}
                  onChange={(e) => setActiveItem({ ...activeItem, sectorKey: e.target.value as SectorBenchmarkKey })}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white font-semibold"
                >
                  {Object.values(SECTOR_BENCHMARKS).map((sec) => (
                    <option key={sec.key} value={sec.key}>
                      {sec.labelAr}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sales & Sales Tax Rate */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    قيمة المبيعات / الإيراد للبند (د.أ)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.001"
                    value={activeItem.salesAmountInput}
                    onChange={(e) => setActiveItem({ ...activeItem, salesAmountInput: Number(e.target.value) })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 text-sm font-mono font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    نسبة ضريبة المبيعات الأردنية
                  </label>
                  <select
                    value={activeItem.salesTaxRateKey}
                    onChange={(e) => setActiveItem({ ...activeItem, salesTaxRateKey: e.target.value as JoSalesTaxRateKey })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-900 dark:text-white font-semibold"
                  >
                    {Object.entries(SALES_TAX_RATES).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.labelAr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* COGS & Recoverable Input Tax */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    تكلفة البضاعة المباعة / المباشرة (COGS د.أ)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.001"
                    value={activeItem.cogsAmountInput}
                    onChange={(e) => setActiveItem({ ...activeItem, cogsAmountInput: Number(e.target.value) })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">
                    نسبة ضريبة المدخلات على التكلفة (%)
                  </label>
                  <select
                    value={activeItem.inputTaxRatePct}
                    onChange={(e) => setActiveItem({ ...activeItem, inputTaxRatePct: Number(e.target.value) })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-2 text-xs font-mono text-slate-900 dark:text-white"
                  >
                    <option value={16}>16% (مشتريات محلية/مستوردة قياسية)</option>
                    <option value={10}>10% (مدخلات خاضعة لنسبة 10%)</option>
                    <option value={4}>4% (مدخلات أساسية وزراعية 4%)</option>
                    <option value={0}>0% (مشتريات معفاة أو غير خاضعة)</option>
                  </select>
                </div>
              </div>

              {/* Operating Expenses & Unverified Expenses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    المصاريف التشغيلية والإدارية للبند (د.أ)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.001"
                    value={activeItem.opexAmountInput}
                    onChange={(e) => setActiveItem({ ...activeItem, opexAmountInput: Number(e.target.value) })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-rose-500 dark:text-rose-400 mb-1">
                    منها: مصاريف غير مؤيدة بـ JoFotara (د.أ)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.001"
                    value={activeItem.unverifiedOpexInput}
                    onChange={(e) => setActiveItem({ ...activeItem, unverifiedOpexInput: Number(e.target.value) })}
                    className="w-full bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-900/60 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Withholding Tax (WHT) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">
                    نسبة ضريبة الاقتطاع من المنبع (WHT)
                  </label>
                  <select
                    value={activeItem.whtRateKey}
                    onChange={(e) => setActiveItem({ ...activeItem, whtRateKey: e.target.value as WhtRateKey })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-900 dark:text-white"
                  >
                    {Object.entries(WHT_RATES).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.labelAr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">أساس تطبيق الاقتطاع</label>
                  <select
                    value={activeItem.whtBase}
                    onChange={(e) => setActiveItem({ ...activeItem, whtBase: e.target.value as WhtApplicationBase })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="ON_OPEX">على المصاريف التشغيلية (توريد و/1)</option>
                    <option value="ON_SALES">على مقبوضات المبيعات (مقتطع لصالحنا)</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddOrUpdateItemInRegister}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>تثبيت / تحديث هذا البند في سجل تدقيق جميع البنود المالية أدناه</span>
              </button>
            </div>

            {/* RIGHT 7 COLUMNS: Instant Normative Verification & Deviation Detection */}
            <div className="lg:col-span-7 space-y-5">
              {/* Top 4 KPI Cards with 3-decimal Fils precision */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono tabular-nums">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <span className="text-[11px] font-sans text-slate-500 block mb-1">صافي المبيعات (بدون ضريبة)</span>
                  <span className="text-base font-bold text-slate-900 dark:text-white">
                    {activeAudit.netSalesDec.toFixed(3)} د.أ
                  </span>
                  <span className="text-[10px] font-sans text-slate-400 block mt-0.5">
                    الإجمالي الشامل: {activeAudit.grossSalesWithTaxDec.toFixed(3)}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <span className="text-[11px] font-sans text-slate-500 block mb-1">صافي ضريبة المبيعات للتوريد</span>
                  <span className="text-base font-bold text-amber-600 dark:text-amber-400">
                    {activeAudit.netSalesTaxPayableDec.toFixed(3)} د.أ
                  </span>
                  <span className="text-[10px] font-sans text-slate-400 block mt-0.5">
                    مخرجات {activeAudit.outputSalesTaxDec.toFixed(3)} - مدخلات {activeAudit.recoverableInputTaxDec.toFixed(3)}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <span className="text-[11px] font-sans text-slate-500 block mb-1">مجمل الربح (هامش البند)</span>
                  <span
                    className={`text-base font-bold ${
                      activeAudit.grossProfitDec.lt(0)
                        ? 'text-rose-500'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {activeAudit.grossProfitDec.toFixed(3)} د.أ
                  </span>
                  <span className="text-[10px] font-sans text-slate-400 block mt-0.5">
                    الهامش الفعلي: {activeAudit.grossMarginPctDec.toFixed(2)}%
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <span className="text-[11px] font-sans text-slate-500 block mb-1">الوعاء الضريبي المعدل للبند</span>
                  <span className="text-base font-bold text-sky-600 dark:text-sky-400">
                    {activeAudit.adjustedTaxableIncomeDec.toFixed(3)} د.أ
                  </span>
                  <span className="text-[10px] font-sans text-slate-400 block mt-0.5">
                    اقتطاع منبع WHT: {activeAudit.whtAmountDec.toFixed(3)} د.أ
                  </span>
                </div>
              </div>

              {/* Normative Benchmark Comparison Bar */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>التحقق المعياري الفوري للبند مقابل النسب القطاعية الاسترشادية لدى ISTD</span>
                  </div>
                  <div className="text-xs font-mono">
                    درجة الامتثال المعياري:{' '}
                    <strong
                      className={
                        activeAudit.complianceStatus === 'COMPLIANT'
                          ? 'text-emerald-500'
                          : activeAudit.complianceStatus === 'REVIEW_REQUIRED'
                          ? 'text-amber-500'
                          : 'text-rose-500'
                      }
                    >
                      {activeAudit.complianceScore}% (
                      {activeAudit.complianceStatus === 'COMPLIANT'
                        ? 'متوافق معيارياً'
                        : activeAudit.complianceStatus === 'REVIEW_REQUIRED'
                        ? 'يتطلب مراجعة ضريبية'
                        : 'مخاطرة ضريبية عالية'}
                      )
                    </strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                    <div className="font-sans text-[11px] text-slate-500">هامش مجمل الربح مقابل المعيار</div>
                    <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                      الفعلي: {activeAudit.grossMarginPctDec.toFixed(2)}% | المعيار:{' '}
                      {activeSectorCfg.minGrossMarginPct.toFixed(0)}%–{activeSectorCfg.maxGrossMarginPct.toFixed(0)}%
                    </div>
                  </div>

                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                    <div className="font-sans text-[11px] text-slate-500">نسبة المصاريف التشغيلية للمبيعات</div>
                    <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                      الفعلي: {activeAudit.opexToSalesPctDec.toFixed(2)}% | السقف: &le;{' '}
                      {activeSectorCfg.maxOpexToSalesPct.toFixed(0)}%
                    </div>
                  </div>

                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                    <div className="font-sans text-[11px] text-slate-500">صافي الربح التشغيلي للبند</div>
                    <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                      {activeAudit.operatingProfitDec.toFixed(3)} د.أ ({activeAudit.operatingMarginPctDec.toFixed(2)}%)
                    </div>
                  </div>
                </div>
              </div>

              {/* Proactive Deviation & Discrepancy Alerts */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-emerald-500" />
                    <span>كاشف الانحرافات والتناقضات الضريبية للبند المالي ({activeAudit.deviations.length})</span>
                  </h4>
                  <span className="text-[11px] text-slate-500">{activeSectorCfg.istdGuideRef}</span>
                </div>

                {activeAudit.deviations.length === 0 ? (
                  <div className="p-5 bg-emerald-950/15 border border-emerald-700/40 rounded-xl flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        البند متوافق كلياً مع المعايير المحاسبية والضريبية الأردنية (100% خالٍ من الشوائب)
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        هوامش مجمل الربح، نسبة المصاريف التشغيلية، ومعالجة ضريبة المبيعات تقع جميعها ضمن الحدود المعيارية الآمنة للفحص الضريبي.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {activeAudit.deviations.map((dev) => (
                      <div
                        key={dev.id}
                        className={`p-3.5 rounded-xl border ${
                          dev.severity === 'CRITICAL'
                            ? 'bg-rose-950/15 border-rose-700/50'
                            : dev.severity === 'HIGH'
                            ? 'bg-amber-950/15 border-amber-700/50'
                            : 'bg-sky-950/15 border-sky-700/40'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <AlertTriangle
                              className={`w-4 h-4 shrink-0 ${
                                dev.severity === 'CRITICAL'
                                  ? 'text-rose-500'
                                  : dev.severity === 'HIGH'
                                  ? 'text-amber-500'
                                  : 'text-sky-400'
                              }`}
                            />
                            <span>{dev.title}</span>
                          </span>
                          <span className="text-[11px] font-mono text-slate-500">
                            الفعلي: <strong className="text-slate-800 dark:text-slate-200">{dev.measuredValue}</strong> | المعيار:{' '}
                            {dev.benchmarkRange}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-2">
                          {dev.explanation}
                        </p>
                        <div className="p-2 bg-white/80 dark:bg-slate-950/80 rounded-lg text-[11px] text-emerald-700 dark:text-emerald-300 flex flex-wrap justify-between gap-2">
                          <span>
                            <strong>التوصية التصحيحية:</strong> {dev.correctiveAction}
                          </span>
                          <span className="text-slate-400 font-mono">{dev.legalReference}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preview Certificate Modal/Section (When toggled) */}
          {showReportPreviewModal && (
            <div className="p-6 bg-slate-50 dark:bg-slate-950 border-2 border-emerald-600/40 rounded-2xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-[11px] font-mono text-emerald-500 block">
                    معاينة فورية لشهادة التدقيق الميداني للبند المالي — جاهزة للطباعة أو الإرفاق
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    بطاقة الفحص الضريبي والمحاسبي للبند: {activeItem.itemName} ({activeItem.itemCode})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleExportAuditPdfReport}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>تنزيل نسخة PDF الآن</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono tabular-nums">
                <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="font-sans font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-1.5">
                    أولاً: معادلة ضريبة المبيعات والمدخلات (فلس أردني)
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-500">صافي المبيعات الأساسي:</span>
                    <span>{activeAudit.netSalesDec.toFixed(3)} JOD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-500">ضريبة المخرجات المستحقة:</span>
                    <span className="text-amber-500">+ {activeAudit.outputSalesTaxDec.toFixed(3)} JOD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-500">ضريبة المدخلات القابلة للخصم:</span>
                    <span className="text-sky-500">- {activeAudit.recoverableInputTaxDec.toFixed(3)} JOD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-500">ضريبة مدخلات غير قابلة للرد (مرسملة):</span>
                    <span className="text-rose-400">{activeAudit.nonRecoverableInputTaxDec.toFixed(3)} JOD</span>
                  </div>
                  <div className="flex justify-between font-bold pt-1.5 border-t border-slate-200 dark:border-slate-800 text-emerald-500">
                    <span className="font-sans">صافي ضريبة المبيعات الواجبة التوريد:</span>
                    <span>{activeAudit.netSalesTaxPayableDec.toFixed(3)} JOD</span>
                  </div>
                </div>

                <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="font-sans font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-1.5">
                    ثانياً: معادلة الأرباح، الاقتطاع، والوعاء الضريبي
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-500">التكلفة الفعلية للبضاعة المباعة (COGS):</span>
                    <span>{activeAudit.effectiveCogsDec.toFixed(3)} JOD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-500">مجمل الربح التشغيلي للبند:</span>
                    <span>
                      {activeAudit.grossProfitDec.toFixed(3)} JOD ({activeAudit.grossMarginPctDec.toFixed(2)}%)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-500">صافي الربح التشغيلي بعد المصاريف:</span>
                    <span>{activeAudit.operatingProfitDec.toFixed(3)} JOD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-500">ضريبة الاقتطاع من المنبع (WHT):</span>
                    <span className="text-amber-500">{activeAudit.whtAmountDec.toFixed(3)} JOD</span>
                  </div>
                  <div className="flex justify-between font-bold pt-1.5 border-t border-slate-200 dark:border-slate-800 text-sky-400">
                    <span className="font-sans">الوعاء الضريبي المعدل للبند:</span>
                    <span>{activeAudit.adjustedTaxableIncomeDec.toFixed(3)} JOD</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BOTTOM SECTION: All-Items Financial Audit Ledger (سجل تدقيق جميع البنود المالية) */}
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-500" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    سجل تدقيق جميع البنود المالية المجمعة ({auditedItemsList.length} بنود مفحوصة)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    انقر على أي بند في الجدول لتحميله في المدقق التفاعلي أعلاه ومراجعة تفاصيله أو تصدير شهادته الضريبية
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs font-mono tabular-nums bg-slate-50 dark:bg-slate-950 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
                <span>
                  إجمالي صافي المبيعات: <strong className="text-slate-900 dark:text-white">{aggregateTotals.netSales.toFixed(3)} د.أ</strong>
                </span>
                <span>
                  صافي ضريبة المبيعات: <strong className="text-amber-500">{aggregateTotals.netSalesTaxPayable.toFixed(3)} د.أ</strong>
                </span>
                <span>
                  إجمالي الوعاء المعدل: <strong className="text-emerald-500">{aggregateTotals.adjustedTaxableIncome.toFixed(3)} د.أ</strong>
                </span>
              </div>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 dark:bg-slate-950 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">المرجع / الحساب</th>
                    <th className="py-2.5 px-3">بيان البند المالي</th>
                    <th className="py-2.5 px-3">صافي المبيعات</th>
                    <th className="py-2.5 px-3">صافي ضريبة المبيعات</th>
                    <th className="py-2.5 px-3">التكلفة الفعلية</th>
                    <th className="py-2.5 px-3">هامش مجمل الربح</th>
                    <th className="py-2.5 px-3">الوعاء المعدل</th>
                    <th className="py-2.5 px-3">حالة التدقيق</th>
                    <th className="py-2.5 px-3 text-left">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono tabular-nums">
                  {registerEvaluations.map(({ item, audit }) => (
                    <tr
                      key={item.id}
                      onClick={() => handleLoadItemIntoInspector(item)}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-950/60 transition cursor-pointer ${
                        activeItem.itemCode === item.itemCode ? 'bg-emerald-950/10' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                        {item.itemCode}{' '}
                        <span className="text-[10px] text-slate-400">({item.accountCode})</span>
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-700 dark:text-slate-200">
                        {item.itemName}
                      </td>
                      <td className="py-2.5 px-3 text-slate-900 dark:text-white">
                        {audit.netSalesDec.toFixed(3)}
                      </td>
                      <td className="py-2.5 px-3 text-amber-600 dark:text-amber-400">
                        {audit.netSalesTaxPayableDec.toFixed(3)}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                        {audit.effectiveCogsDec.toFixed(3)}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={
                            audit.grossProfitDec.lt(0)
                              ? 'text-rose-500 font-bold'
                              : 'text-emerald-600 dark:text-emerald-400 font-semibold'
                          }
                        >
                          {audit.grossMarginPctDec.toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-sky-600 dark:text-sky-400 font-semibold">
                        {audit.adjustedTaxableIncomeDec.toFixed(3)}
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        {audit.complianceStatus === 'COMPLIANT' ? (
                          <span className="text-emerald-500 font-bold flex items-center gap-1 whitespace-nowrap">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>متوافق (100%)</span>
                          </span>
                        ) : audit.complianceStatus === 'REVIEW_REQUIRED' ? (
                          <span className="text-amber-500 font-bold flex items-center gap-1 whitespace-nowrap">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>مراجعة ({audit.deviations.length})</span>
                          </span>
                        ) : (
                          <span className="text-rose-500 font-bold flex items-center gap-1 whitespace-nowrap">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>انحراف حرج ({audit.deviations.length})</span>
                          </span>
                        )}
                      </td>
                      <td
                        className="py-2.5 px-3 text-left whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleLoadItemIntoInspector(item)}
                            className="p-1.5 text-emerald-500 hover:bg-emerald-500/10 rounded-lg cursor-pointer"
                            title="فحص هذا البند"
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItemFromRegister(item.id)}
                            className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                            title="حذف البند"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
