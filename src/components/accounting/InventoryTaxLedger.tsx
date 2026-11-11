import React, { useState, useMemo } from 'react';
import Decimal from 'decimal.js';
import {
  Package,
  AlertTriangle,
  ArrowRightLeft,
  Calculator,
  CheckCircle2,
  TrendingDown,
  FileSpreadsheet,
  Percent,
  Layers,
  ShieldCheck,
  Plus,
  RotateCcw,
} from 'lucide-react';
import { SystemGovernanceService } from '../../services/governance/SystemGovernanceService';

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export type VatCategory = 'STANDARD_16' | 'REDUCED_10' | 'REDUCED_4' | 'ZERO_0' | 'EXEMPT';
export type CostingMethod = 'WAC' | 'FIFO';

export interface FifoBatch {
  batchId: string;
  receiptDate: string;
  quantity: number;
  unitCostJod: string;
}

export interface InventorySkuItem {
  id: string;
  skuCode: string;
  nameAr: string;
  categoryAr: string;
  vatCategory: VatCategory;
  vatRatePercent: number;
  quantityOnHand: number;
  weightedAvgUnitCostJod: string;
  sellingPriceExclTaxJod: string;
  fifoBatches: FifoBatch[];
}

const INITIAL_INVENTORY_SKUS: InventorySkuItem[] = [
  {
    id: 'sku-1',
    skuCode: 'SKU-ELEC-101',
    nameAr: 'محول طاقة صناعي ثلاثي الطور (3-Phase Inverter)',
    categoryAr: 'معدات كهربائية وصناعية',
    vatCategory: 'STANDARD_16',
    vatRatePercent: 16,
    quantityOnHand: 45,
    weightedAvgUnitCostJod: '210.500',
    sellingPriceExclTaxJod: '285.000',
    fifoBatches: [
      { batchId: 'B-2025-01', receiptDate: '2025-01-12', quantity: 20, unitCostJod: '205.000' },
      { batchId: 'B-2025-02', receiptDate: '2025-02-18', quantity: 25, unitCostJod: '214.900' },
    ],
  },
  {
    id: 'sku-2',
    skuCode: 'SKU-AGR-204',
    nameAr: 'أسمدة زراعية مركبة ومستلزمات إنتاج زراعي',
    categoryAr: 'مدخلات زراعية خاضعة للنسبة المخفضة (الجدول رقم 2)',
    vatCategory: 'REDUCED_4',
    vatRatePercent: 4,
    quantityOnHand: 120,
    weightedAvgUnitCostJod: '42.250',
    sellingPriceExclTaxJod: '55.000',
    fifoBatches: [
      { batchId: 'B-2025-03', receiptDate: '2025-01-20', quantity: 50, unitCostJod: '40.150' },
      { batchId: 'B-2025-04', receiptDate: '2025-03-01', quantity: 70, unitCostJod: '43.750' },
    ],
  },
  {
    id: 'sku-3',
    skuCode: 'SKU-EXP-309',
    nameAr: 'برمجيات وأنظمة سحابية مصدرة للمنطقة الحرة (العقبة ASEZA)',
    categoryAr: 'صادرات وخدمات مناطق حرة خاضعة لنسبة الصفر',
    vatCategory: 'ZERO_0',
    vatRatePercent: 0,
    quantityOnHand: 30,
    weightedAvgUnitCostJod: '150.000',
    sellingPriceExclTaxJod: '240.000',
    fifoBatches: [
      { batchId: 'B-2025-05', receiptDate: '2025-02-01', quantity: 30, unitCostJod: '150.000' },
    ],
  },
  {
    id: 'sku-4',
    skuCode: 'SKU-MED-412',
    nameAr: 'مستلزمات طبية وأجهزة مخبرية معفاة من الضريبة',
    categoryAr: 'سلع معفاة بموجب الجدول (3) الملحق بقانون الضريبة العامة على المبيعات',
    vatCategory: 'EXEMPT',
    vatRatePercent: 0,
    quantityOnHand: 80,
    weightedAvgUnitCostJod: '68.000',
    sellingPriceExclTaxJod: '92.000',
    fifoBatches: [
      { batchId: 'B-2025-06', receiptDate: '2025-01-15', quantity: 80, unitCostJod: '68.000' },
    ],
  },
];

export const InventoryTaxLedger: React.FC = () => {
  const [skus, setSkus] = useState<InventorySkuItem[]>(INITIAL_INVENTORY_SKUS);
  const [costingMethod, setCostingMethod] = useState<CostingMethod>('WAC');
  const [selectedSkuId, setSelectedSkuId] = useState<string>('sku-1');

  // Stock Receiving Form State (توريد بضاعة جديدة للمستودع)
  const [receiptSkuId, setReceiptSkuId] = useState<string>('sku-1');
  const [receiptQty, setReceiptQty] = useState<string>('15');
  const [receiptUnitCost, setReceiptUnitCost] = useState<string>('220.000');
  const [receiptBatchCode, setReceiptBatchCode] = useState<string>('B-2026-07');
  const [receiptNotice, setReceiptNotice] = useState<string | null>(null);

  // Deemed Supply / Inventory Adjustment Simulator State (تعديلات الجرد والتوريد الحكمي)
  const [adjustmentType, setAdjustmentType] = useState<
    'SELF_CONSUMPTION' | 'UNJUSTIFIED_SHORTAGE' | 'PROMOTIONAL_SAMPLES' | 'OFFICIAL_DESTRUCTION'
  >('UNJUSTIFIED_SHORTAGE');
  const [adjustmentQuantity, setAdjustmentQuantity] = useState<string>('5');
  const [hasIstdDestructionCommitteeApproval, setHasIstdDestructionCommitteeApproval] =
    useState<boolean>(false);

  const selectedSku = useMemo(
    () => skus.find((s) => s.id === selectedSkuId) || skus[0],
    [skus, selectedSkuId]
  );

  const computeSkuBookValue = (sku: InventorySkuItem, method: CostingMethod): Decimal => {
    if (method === 'FIFO') {
      return sku.fifoBatches.reduce(
        (acc, b) => acc.plus(new Decimal(b.quantity).times(new Decimal(b.unitCostJod))),
        new Decimal(0)
      );
    }
    return new Decimal(sku.quantityOnHand).times(new Decimal(sku.weightedAvgUnitCostJod));
  };

  // Portfolio Valuation Totals
  const portfolioSummary = useMemo(() => {
    let totalCostDec = new Decimal(0);
    let totalMarketExclTaxDec = new Decimal(0);
    let taxableBookValueDec = new Decimal(0);
    let exemptBookValueDec = new Decimal(0);

    skus.forEach((sku) => {
      const qty = new Decimal(sku.quantityOnHand);
      const bookVal = computeSkuBookValue(sku, costingMethod);
      const marketVal = qty.times(new Decimal(sku.sellingPriceExclTaxJod));

      totalCostDec = totalCostDec.plus(bookVal);
      totalMarketExclTaxDec = totalMarketExclTaxDec.plus(marketVal);

      if (sku.vatCategory === 'EXEMPT') {
        exemptBookValueDec = exemptBookValueDec.plus(bookVal);
      } else {
        taxableBookValueDec = taxableBookValueDec.plus(bookVal);
      }
    });

    const totalPortfolioDec = taxableBookValueDec.plus(exemptBookValueDec);
    const inputVatApportionmentRatio = totalPortfolioDec.greaterThan(0)
      ? taxableBookValueDec.dividedBy(totalPortfolioDec).times(100)
      : new Decimal(100);

    return {
      totalCostJod: totalCostDec.toFixed(3),
      totalMarketExclTaxJod: totalMarketExclTaxDec.toFixed(3),
      expectedGrossProfitJod: totalMarketExclTaxDec.minus(totalCostDec).toFixed(3),
      taxableBookValueJod: taxableBookValueDec.toFixed(3),
      exemptBookValueJod: exemptBookValueDec.toFixed(3),
      inputVatApportionmentRatio: inputVatApportionmentRatio.toFixed(2),
    };
  }, [skus, costingMethod]);

  const handleReceiveStock = (e: React.FormEvent) => {
    e.preventDefault();
    const qtyNum = Math.max(0, Math.floor(Number(receiptQty) || 0));
    const unitCostDec = Decimal.max(0, new Decimal(receiptUnitCost || '0'));

    if (qtyNum <= 0 || unitCostDec.lte(0)) {
      return;
    }

    const targetSku = skus.find((s) => s.id === receiptSkuId);
    if (!targetSku) return;

    const oldQty = new Decimal(targetSku.quantityOnHand);
    const oldWac = new Decimal(targetSku.weightedAvgUnitCostJod);
    const oldTotalCost = oldQty.times(oldWac);

    const addedCost = new Decimal(qtyNum).times(unitCostDec);
    const newQty = oldQty.plus(qtyNum);
    const newWac = newQty.greaterThan(0)
      ? oldTotalCost.plus(addedCost).dividedBy(newQty)
      : unitCostDec;

    const newBatch: FifoBatch = {
      batchId: receiptBatchCode.trim() || `B-${Date.now().toString().slice(-4)}`,
      receiptDate: new Date().toISOString().slice(0, 10),
      quantity: qtyNum,
      unitCostJod: unitCostDec.toFixed(3),
    };

    setSkus((prev) =>
      prev.map((sku) =>
        sku.id === receiptSkuId
          ? {
              ...sku,
              quantityOnHand: newQty.toNumber(),
              weightedAvgUnitCostJod: newWac.toFixed(3),
              fifoBatches: [...sku.fifoBatches, newBatch],
            }
          : sku
      )
    );

    SystemGovernanceService.recordAuditAction({
      actorName: 'أمين المستودع / المحاسب المالي',
      actorRole: 'إدارة المخزون والتكاليف',
      moduleName: 'دفتر المخزون والتصنيف الضريبي (WAC / FIFO)',
      actionLabel: `توريد مخزني للصنف (${targetSku.skuCode}) وتحديث التكلفة المرجحة`,
      oldValue: `الكمية: ${targetSku.quantityOnHand} | WAC: ${targetSku.weightedAvgUnitCostJod} د.أ`,
      newValue: `الكمية: ${newQty.toNumber()} | WAC: ${newWac.toFixed(3)} د.أ (دفعة ${newBatch.batchId})`,
    });

    setReceiptNotice(
      `تم توريد ${qtyNum} وحدة من الصنف (${targetSku.skuCode}) بتكلفة إفرادية ${unitCostDec.toFixed(3)} د.أ. تم تحديث متوسط التكلفة المرجح (WAC) إلى ${newWac.toFixed(3)} د.أ وإضافة طبقة FIFO جديدة.`
    );
  };

  const handleResetInventory = () => {
    setSkus(INITIAL_INVENTORY_SKUS);
    setReceiptNotice(null);
  };

  // Deemed Supply & Inventory Adjustment Calculation (المادة 6 و المادة 9 من قانون ضريبة المبيعات الأردني)
  const adjustmentSimulation = useMemo(() => {
    const qtyDec = Decimal.max(0, new Decimal(adjustmentQuantity || '0'));

    // Calculate unit cost under selected Costing Method (WAC vs FIFO)
    let unitCostDec = new Decimal(selectedSku.weightedAvgUnitCostJod);
    let totalCostWithdrawalDec = qtyDec.times(unitCostDec);

    if (costingMethod === 'FIFO' && selectedSku.fifoBatches.length > 0) {
      let remainingToWithdraw = qtyDec;
      let fifoTotalCost = new Decimal(0);

      for (const batch of selectedSku.fifoBatches) {
        if (remainingToWithdraw.lte(0)) break;
        const batchQty = new Decimal(batch.quantity);
        const takeQty = Decimal.min(remainingToWithdraw, batchQty);
        fifoTotalCost = fifoTotalCost.plus(takeQty.times(new Decimal(batch.unitCostJod)));
        remainingToWithdraw = remainingToWithdraw.minus(takeQty);
      }
      if (remainingToWithdraw.gt(0)) {
        // Fallback to last batch cost if exceeding available batches
        const lastCost = new Decimal(
          selectedSku.fifoBatches[selectedSku.fifoBatches.length - 1].unitCostJod
        );
        fifoTotalCost = fifoTotalCost.plus(remainingToWithdraw.times(lastCost));
      }
      totalCostWithdrawalDec = fifoTotalCost;
      unitCostDec = qtyDec.gt(0) ? fifoTotalCost.dividedBy(qtyDec) : unitCostDec;
    }

    const marketValueWithdrawalDec = qtyDec.times(new Decimal(selectedSku.sellingPriceExclTaxJod));
    const vatRateDec = new Decimal(selectedSku.vatRatePercent).dividedBy(100);

    let deemedTaxBaseDec = new Decimal(0);
    let deemedOutputVatDueDec = new Decimal(0);
    let incomeTaxNonDeductibleExpenseDec = new Decimal(0);
    let legalBasisAr = '';
    let accountingTreatmentAr = '';
    let isTaxExemptEvent = false;

    if (adjustmentType === 'OFFICIAL_DESTRUCTION') {
      if (hasIstdDestructionCommitteeApproval) {
        deemedTaxBaseDec = new Decimal(0);
        deemedOutputVatDueDec = new Decimal(0);
        incomeTaxNonDeductibleExpenseDec = new Decimal(0);
        isTaxExemptEvent = true;
        legalBasisAr =
          'إتلاف بضاعة تالفة أو منتهية الصلاحية بموجب محضر إتلاف بحضورمندوب دائرة ضريبة الدخل والمبيعات (معفى من التوريد الحكمي وتُقبل التكلفة كمصروف ضريبي).';
        accountingTreatmentAr =
          'من حـ/ خسائر إتلاف مخزون معتمد ضريبياً إلى حـ/ المخزون (بسعر التكلفة دون ضريبة مبيعات).';
      } else {
        // Unapproved destruction is treated as unjustified shortage / deemed supply
        deemedTaxBaseDec = totalCostWithdrawalDec;
        deemedOutputVatDueDec = deemedTaxBaseDec.times(vatRateDec);
        incomeTaxNonDeductibleExpenseDec = totalCostWithdrawalDec.plus(deemedOutputVatDueDec);
        legalBasisAr =
          'تحذير امتثال: إتلاف بضاعة دون إشعار مسبق أو محضر لجنة إتلاف ضريبية يُعامل كـ «نقص غير مبرر / توريد حكمي» وتُفرض عليه ضريبة المبيعات ولا يُقبل كمصروف لغايات ضريبة الدخل!';
        accountingTreatmentAr =
          'من حـ/ مصاريف غير مقبولة ضريبياً (تكلفة + ضريبة مبيعات) إلى مذكورين: حـ/ المخزون، حـ/ أمانات ضريبة المبيعات المستحقة.';
      }
    } else if (adjustmentType === 'UNJUSTIFIED_SHORTAGE') {
      // Unjustified inventory shortage (عجز المخزون غير المبرر): taxed on market selling price or cost (strictly enforced by ISTD on selling price if suspected unrecorded sale)
      deemedTaxBaseDec = marketValueWithdrawalDec;
      deemedOutputVatDueDec = deemedTaxBaseDec.times(vatRateDec);
      incomeTaxNonDeductibleExpenseDec = totalCostWithdrawalDec;
      legalBasisAr =
        'العجز المخزني غير المبرر (فروقات الجرد السالبة) يُعد بحكم المبيع الخاضع للضريبة استناداً للمادة (6) من قانون الضريبة العامة على المبيعات، ويُحتسب الوعاء الضريبي على القيمة السوقية العادلة.';
      accountingTreatmentAr =
        'من حـ/ ذمم أمين المستودع أو خسائر فروقات جرد غير مقبولة ضريبياً إلى مذكورين: حـ/ المخزون (بالتكلفة)، حـ/ أمانات ضريبة المبيعات (على السعر السوقي).';
    } else if (adjustmentType === 'SELF_CONSUMPTION') {
      // Self-consumption / non-business use (الاستخدام الخاص أو سحب الشركاء): taxed on cost
      deemedTaxBaseDec = totalCostWithdrawalDec;
      deemedOutputVatDueDec = deemedTaxBaseDec.times(vatRateDec);
      incomeTaxNonDeductibleExpenseDec = new Decimal(0);
      legalBasisAr =
        'استعمال السلع الخاضعة للضريبة لأغراض خاصة أو شخصية أو سحب المساهمين يُعد «توريداً حكمياً» يخضع لضريبة المبيعات على أساس التكلفة أو القيمة السوقية أيهما أنسب وفق التعليمات التنفيذية.';
      accountingTreatmentAr =
        'من حـ/ جاري الشريك أو المسحوبات الشخصية إلى مذكورين: حـ/ المخزون (بالتكلفة)، حـ/ أمانات ضريبة المبيعات المستحقة.';
    } else if (adjustmentType === 'PROMOTIONAL_SAMPLES') {
      // Promotional gifts & samples
      deemedTaxBaseDec = totalCostWithdrawalDec;
      deemedOutputVatDueDec = deemedTaxBaseDec.times(vatRateDec);
      incomeTaxNonDeductibleExpenseDec = new Decimal(0);
      legalBasisAr =
        'الهدايا والعينات الترويجية المجانية التي تتجاوز الحدود المعفاة تخضع لضريبة المبيعات على أساس التكلفة الفعلية للبضاعة المسحوبة.';
      accountingTreatmentAr =
        'من حـ/ مصاريف الدعاية والترويج والعينات إلى مذكورين: حـ/ المخزون (بالتكلفة)، حـ/ أمانات ضريبة المبيعات المستحقة.';
    }

    return {
      qty: qtyDec.toNumber(),
      unitCostJod: unitCostDec.toFixed(3),
      totalCostWithdrawalJod: totalCostWithdrawalDec.toFixed(3),
      marketValueWithdrawalJod: marketValueWithdrawalDec.toFixed(3),
      deemedTaxBaseJod: deemedTaxBaseDec.toFixed(3),
      deemedOutputVatDueJod: deemedOutputVatDueDec.toFixed(3),
      incomeTaxNonDeductibleExpenseJod: incomeTaxNonDeductibleExpenseDec.toFixed(3),
      legalBasisAr,
      accountingTreatmentAr,
      isTaxExemptEvent,
    };
  }, [
    selectedSku,
    costingMethod,
    adjustmentType,
    adjustmentQuantity,
    hasIstdDestructionCommitteeApproval,
  ]);

  const getVatBadge = (cat: VatCategory, rate: number) => {
    switch (cat) {
      case 'STANDARD_16':
        return (
          <span className="bg-blue-950/80 text-blue-300 border border-blue-700/60 px-2.5 py-0.5 text-xs font-mono">
            خاضع قياسي ({rate}%)
          </span>
        );
      case 'REDUCED_10':
      case 'REDUCED_4':
        return (
          <span className="bg-amber-950/80 text-amber-300 border border-amber-700/60 px-2.5 py-0.5 text-xs font-mono">
            نسبة مخفضة ({rate}%)
          </span>
        );
      case 'ZERO_0':
        return (
          <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 px-2.5 py-0.5 text-xs font-mono">
            نسبة الصفر (0%)
          </span>
        );
      case 'EXEMPT':
        return (
          <span className="bg-slate-800 text-slate-300 border border-slate-600 px-2.5 py-0.5 text-xs font-mono">
            معفى (جدول 3)
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-1">
            <Package className="w-4 h-4" />
            <span>منظومة الجرد المستمر والتصنيف الضريبي للسلع (IAS 2 & Jordan GST Law)</span>
          </div>
          <h3 className="text-xl font-bold text-white">
            دفتر الأستاذ المساعد للمخزون، التكلفة المرجحة (WAC/FIFO)، والتوريد الحكمي
          </h3>
          <p className="text-slate-400 text-xs mt-1 max-w-3xl leading-relaxed">
            يربط هذا الدفتر كل صنف مخزني (SKU) بنسب الضريبة العامة على المبيعات الأردنية (16%، 4%، 0%، معفى)، ويحسب معادلة رد ضريبة المدخلات العامة (Apportionment Ratio) والآثار الضريبية لفروقات الجرد والإتلاف والمسحوبات.
          </p>
        </div>

        {/* Costing Method Switcher */}
        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 p-1.5 self-start">
          <button
            type="button"
            onClick={() => setCostingMethod('WAC')}
            className={`px-3 py-1.5 text-xs font-bold transition-colors ${
              costingMethod === 'WAC'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            المتوسط المرجح للتكلفة (WAC)
          </button>
          <button
            type="button"
            onClick={() => setCostingMethod('FIFO')}
            className={`px-3 py-1.5 text-xs font-bold transition-colors ${
              costingMethod === 'FIFO'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            الوارد أولاً صادر أولاً (FIFO)
          </button>
        </div>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>إجمالي القيمة الدفترية للمخزون ({costingMethod})</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-white" dir="ltr">
            {portfolioSummary.totalCostJod} JOD
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            مقيّم بالتكلفة التاريخية أو صافي القيمة القابلة للتحقق (IAS 2)
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>القيمة السوقية المقدرة (قبل الضريبة)</span>
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-emerald-400" dir="ltr">
            {portfolioSummary.totalMarketExclTaxJod} JOD
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            هامش الربح الإجمالي المتوقع: <span className="font-mono text-slate-200">{portfolioSummary.expectedGrossProfitJod} JOD</span>
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>مخزون خاضع (16%، 4%، 0%) مقابل معفى</span>
            <ArrowRightLeft className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-sm font-mono font-bold text-blue-300 mt-1" dir="ltr">
            Taxable: {portfolioSummary.taxableBookValueJod} JOD
          </div>
          <div className="text-xs font-mono text-slate-400 mt-0.5" dir="ltr">
            Exempt: {portfolioSummary.exemptBookValueJod} JOD
          </div>
        </div>

        <div className="bg-slate-900 border border-amber-500/40 p-4">
          <div className="flex items-center justify-between text-xs text-amber-300 mb-1">
            <span>نسبة خصم ضريبة المدخلات المشتركة</span>
            <Percent className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-amber-400" dir="ltr">
            {portfolioSummary.inputVatApportionmentRatio}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            نسبة الضريبة القابلة للرد على المصاريف العمومية المشتركة
          </p>
        </div>
      </div>

      {/* Interactive Stock Receiving Form (توريد بضاعة جديدة للمستودع) */}
      <div className="bg-slate-900 border border-slate-800 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 border-b border-slate-800 pb-3">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>توريد بضاعة جديدة للمستودع (إدخال مشتريات وتحديث WAC / FIFO)</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              يُعيد احتساب المتوسط المرجح للتكلفة (WAC) تلقائياً ويُدرج دفعة (Layer) جديدة في سجل الوارد أولاً صادر أولاً (FIFO) مع التوثيق في سجل النشاط.
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetInventory}
            className="text-xs text-slate-400 hover:text-white border border-slate-700 px-3 py-1.5 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إعادة ضبط الأرصدة الافتتاحية</span>
          </button>
        </div>

        <form onSubmit={handleReceiveStock} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          <div className="md:col-span-2">
            <label className="block text-xs text-slate-400 mb-1">الصنف المستلم (SKU)</label>
            <select
              value={receiptSkuId}
              onChange={(e) => setReceiptSkuId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
            >
              {skus.map((sku) => (
                <option key={sku.id} value={sku.id}>
                  {sku.skuCode} — {sku.nameAr}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">الكمية الواردة (وحدة)</label>
            <input
              type="number"
              min="1"
              step="1"
              value={receiptQty}
              onChange={(e) => setReceiptQty(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 px-3 py-2 text-xs font-mono text-white focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">تكلفة الوحدة (JOD)</label>
            <input
              type="number"
              min="0.001"
              step="0.001"
              value={receiptUnitCost}
              onChange={(e) => setReceiptUnitCost(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 px-3 py-2 text-xs font-mono text-white focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs text-slate-400 mb-1">رقم الدفعة (Batch)</label>
              <input
                type="text"
                value={receiptBatchCode}
                onChange={(e) => setReceiptBatchCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 px-2.5 py-2 text-xs font-mono text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 self-end transition-colors cursor-pointer"
            >
              توريد
            </button>
          </div>
        </form>

        {receiptNotice && (
          <div className="mt-3 bg-emerald-950/40 border border-emerald-700/50 px-3.5 py-2 text-xs text-emerald-200 flex items-center justify-between">
            <span>{receiptNotice}</span>
            <button
              type="button"
              onClick={() => setReceiptNotice(null)}
              className="text-emerald-400 hover:text-white text-[11px] font-bold"
            >
              إغلاق
            </button>
          </div>
        )}
      </div>

      {/* Inventory Master Table */}
      <div className="bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h4 className="font-bold text-white text-sm">
            بطاقات الأصناف المخزنية والتصنيف الضريبي (انقر على الصنف لمحاكاة التعديلات الجردية)
          </h4>
          <span className="text-xs text-slate-400 font-mono">
            Precision: 3 Decimals (Fils) | Method: {costingMethod}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-950 text-slate-400 text-xs uppercase border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">رمز الصنف (SKU)</th>
                <th className="py-3 px-4">وصف الصنف والبيان الجمركي/الضريبي</th>
                <th className="py-3 px-4">التصنيف الضريبي (GST)</th>
                <th className="py-3 px-4 text-left">الكمية المتوفرة</th>
                <th className="py-3 px-4 text-left">متوسط التكلفة (WAC)</th>
                <th className="py-3 px-4 text-left">إجمالي القيمة الدفترية ({costingMethod})</th>
                <th className="py-3 px-4 text-left">سعر البيع (قبل الضريبة)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {skus.map((sku) => {
                const totalBookVal = computeSkuBookValue(sku, costingMethod).toFixed(3);
                const isSelected = sku.id === selectedSkuId;

                return (
                  <tr
                    key={sku.id}
                    onClick={() => setSelectedSkuId(sku.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-amber-500/10' : 'hover:bg-slate-800/60'
                    }`}
                  >
                    <td className="py-3 px-4 font-mono text-xs font-bold text-amber-400">
                      {sku.skuCode}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{sku.nameAr}</div>
                      <div className="text-xs text-slate-400">{sku.categoryAr}</div>
                      {costingMethod === 'FIFO' && (
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {sku.fifoBatches.map((b) => (
                            <span
                              key={b.batchId}
                              className="bg-slate-950 border border-slate-700 text-[10px] font-mono px-1.5 py-0.5 text-slate-300"
                            >
                              {b.batchId}: {b.quantity} × {b.unitCostJod} JOD
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {getVatBadge(sku.vatCategory, sku.vatRatePercent)}
                    </td>
                    <td className="py-3 px-4 font-mono text-left text-white">
                      {sku.quantityOnHand}
                    </td>
                    <td className="py-3 px-4 font-mono text-left text-slate-300" dir="ltr">
                      {sku.weightedAvgUnitCostJod} JOD
                    </td>
                    <td className="py-3 px-4 font-mono text-left font-bold text-white" dir="ltr">
                      {totalBookVal} JOD
                    </td>
                    <td className="py-3 px-4 font-mono text-left text-emerald-400" dir="ltr">
                      {sku.sellingPriceExclTaxJod} JOD
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deemed Supply & Inventory Discrepancy Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-5 space-y-4">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm border-b border-slate-800 pb-3">
            <Calculator className="w-4 h-4" />
            <span>محاكي التسويات الجردية والتوريد الحكمي (المادة 6 و 9 مبيعات)</span>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">الصنف المختار للمعالجة</label>
            <select
              value={selectedSkuId}
              onChange={(e) => setSelectedSkuId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
            >
              {skus.map((sku) => (
                <option key={sku.id} value={sku.id}>
                  {sku.skuCode} - {sku.nameAr} ({sku.vatRatePercent}%)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">طبيعة الحركة / التسوية المخزنية</label>
            <select
              value={adjustmentType}
              onChange={(e) => setAdjustmentType(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
            >
              <option value="UNJUSTIFIED_SHORTAGE">
                عجز مخزني غير مبرر عند الجرد الفعلي (Unjustified Shortage)
              </option>
              <option value="SELF_CONSUMPTION">
                مسحوبات شخصية للشركاء أو استخدام غير متعلق بالنشاط (Self-Consumption)
              </option>
              <option value="PROMOTIONAL_SAMPLES">
                عينات ترويجية وهدايا مجانية للعملاء (Promotional Samples)
              </option>
              <option value="OFFICIAL_DESTRUCTION">
                إتلاف بضاعة تالفة أو منتهية الصلاحية (Inventory Destruction)
              </option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">الكمية المسحوبة / الناقصة / المتلفة</label>
            <input
              type="number"
              min="1"
              max={selectedSku.quantityOnHand}
              value={adjustmentQuantity}
              onChange={(e) => setAdjustmentQuantity(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 px-3 py-2 text-sm font-mono text-white focus:border-amber-500 focus:outline-none"
            />
          </div>

          {adjustmentType === 'OFFICIAL_DESTRUCTION' && (
            <div className="bg-slate-950 border border-slate-800 p-3">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasIstdDestructionCommitteeApproval}
                  onChange={(e) => setHasIstdDestructionCommitteeApproval(e.target.checked)}
                  className="mt-1 accent-amber-500"
                />
                <span className="text-xs text-slate-300 leading-relaxed">
                  توفر محضر إتلاف موثق بحضور مندوب دائرة ضريبة الدخل والمبيعات (ISTD) والجهات الرقابية المختصة (الغذاء والدواء / البيئة).
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Simulation Output */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h4 className="font-bold text-white text-sm">
                نتائج الاحتساب الضريبي والقيد المحاسبي للتسوية المخزنية
              </h4>
              {adjustmentSimulation.isTaxExemptEvent ? (
                <span className="flex items-center gap-1 text-xs bg-emerald-950 text-emerald-300 border border-emerald-700 px-2.5 py-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  معفى من ضريبة التوريد الحكمي
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs bg-amber-950 text-amber-300 border border-amber-700 px-2.5 py-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  واقعة منشئة لضريبة التوريد الحكمي
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div className="bg-slate-950 border border-slate-800 p-3">
                <div className="text-[11px] text-slate-400">تكلفة البضاعة الخارجة ({costingMethod})</div>
                <div className="text-lg font-mono font-bold text-white mt-1" dir="ltr">
                  {adjustmentSimulation.totalCostWithdrawalJod} JOD
                </div>
                <div className="text-[10px] text-slate-400 font-mono" dir="ltr">
                  ({adjustmentSimulation.qty} × {adjustmentSimulation.unitCostJod} JOD)
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-3">
                <div className="text-[11px] text-slate-400">الوعاء الضريبي للتوريد الحكمي</div>
                <div className="text-lg font-mono font-bold text-amber-400 mt-1" dir="ltr">
                  {adjustmentSimulation.deemedTaxBaseJod} JOD
                </div>
                <div className="text-[10px] text-slate-400">
                  نسبة ضريبة الصنف: {selectedSku.vatRatePercent}%
                </div>
              </div>

              <div className="bg-slate-950 border border-rose-500/40 p-3">
                <div className="text-[11px] text-rose-300">ضريبة المبيعات المستحقة (إقرار مبيعات)</div>
                <div className="text-lg font-mono font-bold text-rose-400 mt-1" dir="ltr">
                  {adjustmentSimulation.deemedOutputVatDueJod} JOD
                </div>
                <div className="text-[10px] text-slate-400">
                  تُدرج في خانة تسويات الضريبة المستحقة
                </div>
              </div>
            </div>

            {/* Legal Basis & Accounting Entry */}
            <div className="space-y-3">
              <div className="bg-slate-950 border-r-2 border-amber-500 p-3">
                <div className="text-xs font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>التكييف القانوني والضريبي (ISTD):</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {adjustmentSimulation.legalBasisAr}
                </p>
              </div>

              <div className="bg-slate-950 border-r-2 border-blue-500 p-3">
                <div className="text-xs font-bold text-blue-400 mb-1 flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4" />
                  <span>التوجيه المحاسبي (قيد اليومية المزدوج):</span>
                </div>
                <p className="text-xs text-slate-300 font-mono leading-relaxed">
                  {adjustmentSimulation.accountingTreatmentAr}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              أثر ضريبة الدخل (مصاريف غير مقبولة ضريبياً تُرد للوعاء):{' '}
              <strong className="font-mono text-rose-400" dir="ltr">
                {adjustmentSimulation.incomeTaxNonDeductibleExpenseJod} JOD
              </strong>
            </span>
            <span>متوافق مع متطلبات الفوترة الإلكترونية (JoFotara)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryTaxLedger;

