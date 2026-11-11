import React, { useState, useMemo, useEffect } from 'react';
import Decimal from 'decimal.js';
import {
  QrCode,
  FileSpreadsheet,
  Percent,
  Globe,
  ShieldCheck,
  AlertTriangle,
  Plus,
  Trash2,
  Download,
  Calculator,
  Sparkles,
  CheckCircle2,
  Receipt,
  Terminal,
  Copy,
  RefreshCw,
  Save,
  ArrowLeftRight,
} from 'lucide-react';
import { TlvQrGenerator, JoFotaraInvoicePayload } from '../../services/jofotara/TlvQrGenerator';
import {
  SalesTaxReturnGenerator,
  SalesInvoiceRecord,
  PurchaseInvoiceRecord,
} from '../../services/tax/SalesTaxReturnGenerator';
import {
  calculateWhtAndReverseCharge,
  WhtServiceCategory,
  JORDAN_GENERAL_SALES_TAX_RATE,
} from '../../engine/jordanCalculators';
import {
  evaluateTransferPricingCompliance,
  RelatedPartyTransaction,
} from '../../engine/transferPricingEngine';
import JoFotaraSandboxSimulator from '../jofotara/JoFotaraSandboxSimulator';
import { SystemGovernanceService } from '../../services/governance/SystemGovernanceService';
import { AccountingCycleStore } from '../../services/accounting/AccountingCycleStore';

// Configure Decimal for strict 3-decimal Jordanian Dinar (Fils) precision
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

type QuickVatCategory = 'STANDARD_16' | 'REDUCED_10' | 'REDUCED_4' | 'EXEMPT_0';

interface QuickVatRateConfig {
  id: QuickVatCategory;
  ratePercent: number;
  badgeText: string;
  titleAr: string;
  legalScopeAr: string;
}

const JORDAN_VAT_RATES_CONFIG: QuickVatRateConfig[] = [
  {
    id: 'STANDARD_16',
    ratePercent: 16,
    badgeText: '16%',
    titleAr: 'النسبة العامة القياسية (16%)',
    legalScopeAr: 'تُطبق على غالبية السلع والخدمات الاستهلاكية والتجارية في المملكة (المادة 6 من قانون الضريبة العامة على المبيعات).',
  },
  {
    id: 'REDUCED_10',
    ratePercent: 10,
    badgeText: '10%',
    titleAr: 'النسبة المخفضة للجدول الأول (10%)',
    legalScopeAr: 'تُطبق على سلع وخدمات محددة بموجب الجداول الملحقة بالقانون (مثل بعض المواد الغذائية والحديد والخدمات السياحية والفندقية المؤهلة).',
  },
  {
    id: 'REDUCED_4',
    ratePercent: 4,
    badgeText: '4%',
    titleAr: 'النسبة المخفضة للجدول الثاني (4%)',
    legalScopeAr: 'تُطبق على مدخلات الإنتاج الزراعي والأسمدة وبعض السلع الغذائية والمدرسية الأساسية المدرجة في الجدول رقم (2).',
  },
  {
    id: 'EXEMPT_0',
    ratePercent: 0,
    badgeText: 'معفى / 0%',
    titleAr: 'معفى من الضريبة أو خاضع لنسبة الصفر (0%)',
    legalScopeAr: 'تُطبق على الصادرات والمنطقة الحرة ومدينة العقبة الاقتصادية الخاصة (0%) أو السلع والخدمات الطبية والتعليمية المعفاة (جدول 3).',
  },
];

interface SavedWhtCertificate {
  id: string;
  certificateNumber: string;
  date: string;
  beneficiaryName: string;
  categoryLabel: string;
  grossAmountJod: string;
  whtDeductedJod: string;
  netPayableJod: string;
  reverseChargeVatJod: string;
}

const INITIAL_SALES_INVOICES: SalesInvoiceRecord[] = [
  {
    invoiceId: 'INV-2026-001',
    issueDate: '2026-01-15',
    customerName: 'شركة الاتصالات المتقدمة ذ.م.م',
    category: 'DOMESTIC_STANDARD_16',
    netAmount: 18500,
    taxRate: 0.16,
  },
  {
    invoiceId: 'INV-2026-002',
    issueDate: '2026-01-22',
    customerName: 'مؤسسة التوريد الزراعي والغذائي',
    category: 'DOMESTIC_REDUCED_4',
    netAmount: 6200,
    taxRate: 0.04,
  },
  {
    invoiceId: 'INV-2026-003',
    issueDate: '2026-02-03',
    customerName: 'شركة تطوير العقبة اللوجستية (ASEZA)',
    category: 'EXPORT_AND_FREE_ZONES_0',
    netAmount: 12000,
    taxRate: 0.0,
  },
  {
    invoiceId: 'INV-2026-004',
    issueDate: '2026-02-14',
    customerName: 'أكاديمية التعليم الحديث (معفى)',
    category: 'EXEMPT_SUPPLIES',
    netAmount: 4500,
    taxRate: 0.0,
  },
];

const INITIAL_PURCHASE_INVOICES: PurchaseInvoiceRecord[] = [
  {
    invoiceId: 'PUR-2026-101',
    supplierTaxId: '988123456',
    supplierName: 'شركة الخوادم والحوسبة الأردنية',
    category: 'LOCAL_TAXABLE_PURCHASES',
    netAmount: 9400,
    paidTaxAmount: 1504,
    isDirectlyAttributedToExempt: false,
    isCommonOverheadInput: true,
    hasValidJoFotaraQr: true,
  },
  {
    invoiceId: 'PUR-2026-102',
    supplierTaxId: 'CUSTOMS-JOD-77',
    supplierName: 'دائرة الجمارك الأردنية - بيان جمركي استيراد أجهزة',
    category: 'IMPORTED_GOODS_CUSTOMS',
    netAmount: 5000,
    paidTaxAmount: 800,
    isDirectlyAttributedToExempt: false,
    isCommonOverheadInput: false,
    hasValidJoFotaraQr: true,
  },
  {
    invoiceId: 'PUR-2026-103',
    supplierTaxId: 'NON-RESIDENT',
    supplierName: 'AWS Cloud Services (Reverse Charge)',
    category: 'REVERSE_CHARGE_SERVICES',
    netAmount: 2200,
    paidTaxAmount: 352,
    isDirectlyAttributedToExempt: false,
    isCommonOverheadInput: true,
    hasValidJoFotaraQr: true,
  },
];

const INITIAL_TP_TRANSACTIONS: RelatedPartyTransaction[] = [
  {
    id: 'TP-01',
    counterpartyName: 'TechCorp Holding Ltd (UAE)',
    counterpartyCountry: 'الإمارات العربية المتحدة',
    relationshipType: 'FOREIGN_PARENT_OR_AFFILIATE',
    natureOfTransaction: 'ROYALTIES_AND_IP',
    pricingMethod: 'CUP',
    transactionValueJod: 320000,
    reportedMarginOrRatePercent: 8.5,
    armsLengthMinPercent: 3.0,
    armsLengthMaxPercent: 6.0,
    isInboundExpenseOrPurchase: true,
  },
  {
    id: 'TP-02',
    counterpartyName: 'شركة اللوجستيات الشقيقة (منطقة الزرقاء الحرة)',
    counterpartyCountry: 'الأردن - منطقة حرة',
    relationshipType: 'FREE_ZONE_SISTER_ENTITY',
    natureOfTransaction: 'MANAGEMENT_AND_IT_SERVICES',
    pricingMethod: 'TNMM',
    transactionValueJod: 195000,
    reportedMarginOrRatePercent: 7.2,
    armsLengthMinPercent: 5.0,
    armsLengthMaxPercent: 9.0,
    isInboundExpenseOrPurchase: true,
  },
  {
    id: 'TP-03',
    counterpartyName: 'فرع التوزيع الإقليمي (الرياض)',
    counterpartyCountry: 'المملكة العربية السعودية',
    relationshipType: 'FOREIGN_PARENT_OR_AFFILIATE',
    natureOfTransaction: 'SALE_OR_PURCHASE_OF_GOODS',
    pricingMethod: 'COST_PLUS',
    transactionValueJod: 260000,
    reportedMarginOrRatePercent: 12.0,
    armsLengthMinPercent: 10.0,
    armsLengthMaxPercent: 15.0,
    isInboundExpenseOrPurchase: false,
  },
];

export interface TaxAndJoFotaraViewProps {
  initialSubTab?: string;
}

type TaxSubTabId =
  | 'jofotara-pos'
  | 'jofotara-sandbox'
  | 'sales-tax-istd'
  | 'wht-calculator'
  | 'transfer-pricing';

export const TaxAndJoFotaraView: React.FC<TaxAndJoFotaraViewProps> = ({ initialSubTab }) => {
  const [activeSubTab, setActiveSubTab] = useState<TaxSubTabId>('jofotara-pos');

  useEffect(() => {
    if (
      initialSubTab &&
      [
        'jofotara-pos',
        'jofotara-sandbox',
        'sales-tax-istd',
        'wht-calculator',
        'transfer-pricing',
      ].includes(initialSubTab)
    ) {
      setActiveSubTab(initialSubTab as TaxSubTabId);
    }
  }, [initialSubTab]);

  // --- Interactive Quick Sales Tax Calculator State (16%, 10%, 4%, Exempt) ---
  const [quickCalcAmount, setQuickCalcAmount] = useState<string>('1250.000');
  const [quickCalcCategory, setQuickCalcCategory] = useState<QuickVatCategory>('STANDARD_16');
  const [quickCalcMode, setQuickCalcMode] = useState<'EXCLUSIVE' | 'INCLUSIVE'>('EXCLUSIVE');
  const [quickSpecialTaxAmount, setQuickSpecialTaxAmount] = useState<string>('0.000');
  const [quickDiscountPercent, setQuickDiscountPercent] = useState<string>('0');

  const selectedQuickRateObj = useMemo(
    () =>
      JORDAN_VAT_RATES_CONFIG.find((r) => r.id === quickCalcCategory) ||
      JORDAN_VAT_RATES_CONFIG[0],
    [quickCalcCategory]
  );

  const quickVatCalculation = useMemo(() => {
    const rawAmountDec = Decimal.max(0, new Decimal(quickCalcAmount || '0'));
    const discountPctDec = Decimal.min(
      100,
      Decimal.max(0, new Decimal(quickDiscountPercent || '0'))
    );
    const specialTaxDec = Decimal.max(0, new Decimal(quickSpecialTaxAmount || '0'));
    const rateDec = new Decimal(selectedQuickRateObj.ratePercent).dividedBy(100);

    const discountValueDec = rawAmountDec.times(discountPctDec.dividedBy(100));
    const amountAfterDiscountDec = rawAmountDec.minus(discountValueDec);

    let netExclTaxDec: Decimal;
    let taxableBaseWithSpecialDec: Decimal;
    let vatDueDec: Decimal;
    let grossInclTaxDec: Decimal;

    if (quickCalcMode === 'EXCLUSIVE') {
      netExclTaxDec = amountAfterDiscountDec;
      taxableBaseWithSpecialDec = netExclTaxDec.plus(specialTaxDec);
      vatDueDec = taxableBaseWithSpecialDec.times(rateDec);
      grossInclTaxDec = taxableBaseWithSpecialDec.plus(vatDueDec);
    } else {
      grossInclTaxDec = amountAfterDiscountDec;
      const divisor = new Decimal(1).plus(rateDec);
      taxableBaseWithSpecialDec = divisor.gt(0)
        ? grossInclTaxDec.dividedBy(divisor)
        : grossInclTaxDec;
      vatDueDec = grossInclTaxDec.minus(taxableBaseWithSpecialDec);
      netExclTaxDec = Decimal.max(0, taxableBaseWithSpecialDec.minus(specialTaxDec));
    }

    const effectiveTaxRatePct = netExclTaxDec.gt(0)
      ? vatDueDec.plus(specialTaxDec).dividedBy(netExclTaxDec).times(100)
      : new Decimal(selectedQuickRateObj.ratePercent);

    return {
      rawAmountJod: rawAmountDec.toFixed(3),
      discountValueJod: discountValueDec.toFixed(3),
      netExclTaxJod: netExclTaxDec.toFixed(3),
      specialTaxJod: specialTaxDec.toFixed(3),
      taxableBaseWithSpecialJod: taxableBaseWithSpecialDec.toFixed(3),
      vatDueJod: vatDueDec.toFixed(3),
      grossInclTaxJod: grossInclTaxDec.toFixed(3),
      effectiveTaxRatePct: effectiveTaxRatePct.toFixed(2),
    };
  }, [
    quickCalcAmount,
    quickDiscountPercent,
    quickSpecialTaxAmount,
    quickCalcMode,
    selectedQuickRateObj,
  ]);

  // --- Sub-tab 1: JoFotara POS & TLV State ---
  const [sellerName, setSellerName] = useState('شركة الحلول المتقدمة للتقنية ذ.م.م');
  const [taxNumber, setTaxNumber] = useState('170054892');
  const [invoiceNumber, setInvoiceNumber] = useState('JOF-2026-00842');
  const [paymentMethod, setPaymentMethod] = useState<'CLIQ' | 'CASH' | 'CARD'>('CLIQ');
  const [copyToast, setCopyToast] = useState<string | null>(null);
  const [posItems, setPosItems] = useState([
    { id: '1', description: 'تطوير منظومة سحابية متكاملة (ERP)', qty: 1, unitPrice: 2500, vatRate: 0.16 },
    { id: '2', description: 'أجهزة قارئ باركود صناعي (معفى جمركياً - منطقة حرة)', qty: 4, unitPrice: 120, vatRate: 0.0 },
  ]);

  const handleTransferToJoFotaraPos = () => {
    const netPriceNumber = Number(quickVatCalculation.taxableBaseWithSpecialJod);
    const vatDecimalRate = selectedQuickRateObj.ratePercent / 100;

    setPosItems((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        description: `بند محول من حاسبة ضريبة المبيعات (${selectedQuickRateObj.titleAr})`,
        qty: 1,
        unitPrice: netPriceNumber,
        vatRate: vatDecimalRate,
      },
    ]);
    setActiveSubTab('jofotara-pos');
  };

  const handleCopyText = (label: string, value: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(value).catch(() => {});
    }
    setCopyToast(`تم نسخ ${label} إلى الحافظة بنجاح`);
    setTimeout(() => setCopyToast(null), 2500);
  };

  const handleGenerateNewInvoiceSerial = () => {
    const randomSeq = Math.floor(10000 + Math.random() * 89999);
    setInvoiceNumber(`JOF-2026-${randomSeq}`);
  };

  const posTotals = useMemo(() => {
    let netTotalDec = new Decimal(0);
    let vatTotalDec = new Decimal(0);
    posItems.forEach((item) => {
      const lineNetDec = new Decimal(item.qty).times(new Decimal(item.unitPrice));
      const lineVatDec = lineNetDec.times(new Decimal(item.vatRate));
      netTotalDec = netTotalDec.plus(lineNetDec);
      vatTotalDec = vatTotalDec.plus(lineVatDec);
    });
    const grossTotalDec = netTotalDec.plus(vatTotalDec);
    return {
      netTotal: netTotalDec.toDecimalPlaces(3).toNumber(),
      vatTotal: vatTotalDec.toDecimalPlaces(3).toNumber(),
      grossTotal: grossTotalDec.toDecimalPlaces(3).toNumber(),
    };
  }, [posItems]);

  const jofotaraResult = useMemo(() => {
    const payload: JoFotaraInvoicePayload = {
      sellerName,
      taxNumber,
      invoiceTimestampIso: '2026-04-02T12:30:00Z',
      invoiceTotalWithTax: posTotals.grossTotal.toFixed(3),
      vatTotalAmount: posTotals.vatTotal.toFixed(3),
      invoiceNumber,
    };
    const encoded = TlvQrGenerator.generateJoFotaraQrPayload(payload);
    const decodedTags = TlvQrGenerator.decodeTlvBase64(encoded.tlvBase64);
    const ublXml = TlvQrGenerator.generateUblXmlPreview(payload);
    return { encoded, decodedTags, ublXml };
  }, [sellerName, taxNumber, invoiceNumber, posTotals]);

  const handleAddPosItem = () => {
    setPosItems([
      ...posItems,
      {
        id: String(Date.now()),
        description: 'بند خدمات استشارية فنية جديد',
        qty: 1,
        unitPrice: 350,
        vatRate: JORDAN_GENERAL_SALES_TAX_RATE,
      },
    ]);
  };

  const handleRemovePosItem = (id: string) => {
    if (posItems.length <= 1) return;
    setPosItems(posItems.filter((i) => i.id !== id));
  };

  // --- Sub-tab 2: Sales Tax Return State (Interactive) ---
  const [salesInvoices, setSalesInvoices] = useState<SalesInvoiceRecord[]>(INITIAL_SALES_INVOICES);
  const [purchaseInvoices, setPurchaseInvoices] = useState<PurchaseInvoiceRecord[]>(INITIAL_PURCHASE_INVOICES);
  const [carriedForwardCredit, setCarriedForwardCredit] = useState<number>(420);

  // New Sales Invoice Form State
  const [newSaleCustomer, setNewSaleCustomer] = useState('شركة المشرق للتجارة والتوزيع');
  const [newSaleCategory, setNewSaleCategory] = useState<SalesInvoiceRecord['category']>('DOMESTIC_STANDARD_16');
  const [newSaleNetAmount, setNewSaleNetAmount] = useState('5000');

  // New Purchase Invoice Form State
  const [newPurSupplier, setNewPurSupplier] = useState('شركة التجهيزات المكتبية الحديثة');
  const [newPurTaxId, setNewPurTaxId] = useState('170099112');
  const [newPurCategory, setNewPurCategory] = useState<PurchaseInvoiceRecord['category']>('LOCAL_TAXABLE_PURCHASES');
  const [newPurNetAmount, setNewPurNetAmount] = useState('2000');
  const [newPurVatAmount, setNewPurVatAmount] = useState('320');
  const [newPurIsCommonOverhead, setNewPurIsCommonOverhead] = useState(true);
  const [newPurHasQr, setNewPurHasQr] = useState(true);

  const handleAddSalesInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const netVal = Math.max(0, Number(newSaleNetAmount) || 0);
    if (netVal <= 0 || !newSaleCustomer.trim()) return;

    const rateMap: Record<SalesInvoiceRecord['category'], number> = {
      DOMESTIC_STANDARD_16: 0.16,
      DOMESTIC_REDUCED_10: 0.10,
      DOMESTIC_REDUCED_4: 0.04,
      EXPORT_AND_FREE_ZONES_0: 0.0,
      EXEMPT_SUPPLIES: 0.0,
    };

    const newInv: SalesInvoiceRecord = {
      invoiceId: `INV-2026-00${salesInvoices.length + 1}`,
      issueDate: new Date().toISOString().slice(0, 10),
      customerName: newSaleCustomer.trim(),
      category: newSaleCategory,
      netAmount: netVal,
      taxRate: rateMap[newSaleCategory],
    };

    setSalesInvoices((prev) => [...prev, newInv]);
    SystemGovernanceService.recordAuditAction({
      actorName: 'محاسب الضرائب',
      actorRole: 'قسم ضريبة المبيعات',
      moduleName: 'إقرار الضريبة العامة على المبيعات (نموذج 4)',
      actionLabel: `إدراج فاتورة مبيعات (${newInv.invoiceId}) في إقرار الفترة`,
      oldValue: `عدد فواتير المبيعات: ${salesInvoices.length}`,
      newValue: `${newInv.customerName} — الصافي: ${netVal.toFixed(3)} د.أ`,
    });
  };

  const handleDeleteSalesInvoice = (invoiceId: string) => {
    if (salesInvoices.length <= 1) return;
    setSalesInvoices((prev) => prev.filter((s) => s.invoiceId !== invoiceId));
  };

  const handleAddPurchaseInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const netVal = Math.max(0, Number(newPurNetAmount) || 0);
    const vatVal = Math.max(0, Number(newPurVatAmount) || 0);
    if (netVal <= 0 || !newPurSupplier.trim()) return;

    const newPur: PurchaseInvoiceRecord = {
      invoiceId: `PUR-2026-10${purchaseInvoices.length + 1}`,
      supplierTaxId: newPurTaxId.trim() || '170000000',
      supplierName: newPurSupplier.trim(),
      category: newPurCategory,
      netAmount: netVal,
      paidTaxAmount: vatVal,
      isDirectlyAttributedToExempt: false,
      isCommonOverheadInput: newPurIsCommonOverhead,
      hasValidJoFotaraQr: newPurHasQr,
    };

    setPurchaseInvoices((prev) => [...prev, newPur]);
    SystemGovernanceService.recordAuditAction({
      actorName: 'محاسب الضرائب',
      actorRole: 'قسم ضريبة المبيعات',
      moduleName: 'إقرار الضريبة العامة على المبيعات (نموذج 4)',
      actionLabel: `إدراج فاتورة مشتريات (${newPur.invoiceId}) في إقرار الفترة`,
      oldValue: `عدد فواتير المشتريات: ${purchaseInvoices.length}`,
      newValue: `${newPur.supplierName} — ضريبة مدخلات: ${vatVal.toFixed(3)} د.أ`,
    });
  };

  const handleDeletePurchaseInvoice = (invoiceId: string) => {
    if (purchaseInvoices.length <= 1) return;
    setPurchaseInvoices((prev) => prev.filter((p) => p.invoiceId !== invoiceId));
  };

  const istdReturnJson = useMemo(() => {
    return SalesTaxReturnGenerator.generateBiMonthlyReturn(
      taxNumber,
      sellerName,
      '2026-P1 (كانون الثاني - شباط)',
      salesInvoices,
      purchaseInvoices,
      carriedForwardCredit
    );
  }, [taxNumber, sellerName, salesInvoices, purchaseInvoices, carriedForwardCredit]);

  // --- Sub-tab 3: WHT & Reverse Charge State ---
  const [whtAmount, setWhtAmount] = useState<number>(15000);
  const [whtCategory, setWhtCategory] = useState<WhtServiceCategory>('NON_RESIDENT_SERVICE_10');
  const [applyReverseChargeVat, setApplyReverseChargeVat] = useState<boolean>(true);
  const [beneficiaryName, setBeneficiaryName] = useState<string>('شركة الاستشارات الهندسية الدولية (لندن)');
  const [savedWhtCertificates, setSavedWhtCertificates] = useState<SavedWhtCertificate[]>([
    {
      id: 'wht-init-1',
      certificateNumber: 'WHT-2026-001',
      date: '2026-02-15',
      beneficiaryName: 'مكتب المحاماة والتحكيم التجاري (مقيم)',
      categoryLabel: 'مقدم خدمة مقيم (5%)',
      grossAmountJod: '4000.000',
      whtDeductedJod: '200.000',
      netPayableJod: '3800.000',
      reverseChargeVatJod: '0.000',
    },
  ]);

  const whtResult = useMemo(() => {
    return calculateWhtAndReverseCharge(whtAmount, whtCategory, applyReverseChargeVat);
  }, [whtAmount, whtCategory, applyReverseChargeVat]);

  const handleSaveWhtCertificate = () => {
    const catLabels: Record<WhtServiceCategory, string> = {
      RESIDENT_PROFESSIONAL_5: 'أتعاب مهنية لمقيم (5%)',
      NON_RESIDENT_SERVICE_10: 'خدمات غير مقيم وإتاوات (10%)',
      CONTRACTING_AND_COMMISSION_2: 'مقاولات وسمسرة (2%)',
      BANK_DEPOSIT_INTEREST_INDIVIDUAL_5: 'فوائد ودائع أفراد (5%)',
      BANK_DEPOSIT_INTEREST_CORPORATE_7: 'فوائد ودائع شركات (7%)',
    };

    const cert: SavedWhtCertificate = {
      id: `wht-${Date.now()}`,
      certificateNumber: `WHT-2026-00${savedWhtCertificates.length + 1}`,
      date: new Date().toISOString().slice(0, 10),
      beneficiaryName: beneficiaryName.trim() || 'مورد خاضع للاقتطاع',
      categoryLabel: catLabels[whtCategory],
      grossAmountJod: whtResult.grossInvoiceAmount.toFixed(3),
      whtDeductedJod: whtResult.whtDeductedAmount.toFixed(3),
      netPayableJod: whtResult.netPayableToVendor.toFixed(3),
      reverseChargeVatJod: whtResult.reverseChargeSalesTax16.toFixed(3),
    };

    setSavedWhtCertificates((prev) => [...prev, cert]);
    SystemGovernanceService.recordAuditAction({
      actorName: 'المدير المالي',
      actorRole: 'قسم الضرائب والاقتطاع',
      moduleName: 'كشف ضريبة الدخل المقتطعة من المنبع (نموذج و/1)',
      actionLabel: `إصدار شهادة اقتطاع ضريبي رقم (${cert.certificateNumber})`,
      oldValue: `إجمالي الشهادات: ${savedWhtCertificates.length}`,
      newValue: `${cert.beneficiaryName} — ضريبة مقتطعة: ${cert.whtDeductedJod} د.أ`,
    });
  };

  // --- Sub-tab 4: Transfer Pricing State (Interactive) ---
  const [annualCompanyRevenue, setAnnualCompanyRevenue] = useState<number>(6200000);
  const [tpTransactions, setTpTransactions] = useState<RelatedPartyTransaction[]>(INITIAL_TP_TRANSACTIONS);
  const [newTpCounterparty, setNewTpCounterparty] = useState('شركة التقنية الإقليمية القابضة (دبي)');
  const [newTpValue, setNewTpValue] = useState('180000');
  const [newTpReportedRate, setNewTpReportedRate] = useState('9.5');
  const [newTpMinRate, setNewTpMinRate] = useState('4.0');
  const [newTpMaxRate, setNewTpMaxRate] = useState('7.0');

  const handleAddTpTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Math.max(0, Number(newTpValue) || 0);
    if (val <= 0 || !newTpCounterparty.trim()) return;

    const newTx: RelatedPartyTransaction = {
      id: `TP-0${tpTransactions.length + 1}`,
      counterpartyName: newTpCounterparty.trim(),
      counterpartyCountry: 'خارج الأردن / منطقة حرة',
      relationshipType: 'FOREIGN_PARENT_OR_AFFILIATE',
      natureOfTransaction: 'MANAGEMENT_AND_IT_SERVICES',
      pricingMethod: 'TNMM',
      transactionValueJod: val,
      reportedMarginOrRatePercent: Number(newTpReportedRate) || 0,
      armsLengthMinPercent: Number(newTpMinRate) || 0,
      armsLengthMaxPercent: Number(newTpMaxRate) || 0,
      isInboundExpenseOrPurchase: true,
    };

    setTpTransactions((prev) => [...prev, newTx]);
  };

  const handleDeleteTpTransaction = (id: string) => {
    if (tpTransactions.length <= 1) return;
    setTpTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const tpAssessment = useMemo(() => {
    return evaluateTransferPricingCompliance(annualCompanyRevenue, tpTransactions, false);
  }, [annualCompanyRevenue, tpTransactions]);

  const handleDownloadJson = (filename: string, data: unknown) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header & Sub-navigation */}
      <div className="bg-slate-900 border border-slate-800 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
              <QrCode className="w-4 h-4" />
              <span>الإدارة الضريبية والفوترة الإلكترونية</span>
            </div>
            <h2 className="text-2xl font-bold text-white">
              أدوات احتساب الضرائب، الفوترة الإلكترونية (JoFotara)، والاقتطاع من المنبع
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              أدوات متخصصة لمساعدة الأفراد والشركات على فهم واحتساب الالتزامات الضريبية وإدارة الفواتير الإلكترونية وفق القوانين والتعليمات الأردنية المعلنة.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-700/50 px-3.5 py-2 text-xs text-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>متوافق مع مواصفات الفوترة الإلكترونية ونماذج الإقرارات الضريبية</span>
          </div>
        </div>

        {/* Sub-Tabs */}
        <div className="flex flex-wrap gap-2 pt-5">
          <button
            type="button"
            onClick={() => setActiveSubTab('jofotara-pos')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'jofotara-pos'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>1. الفوترة الإلكترونية ومولد TLV QR</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('jofotara-sandbox')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'jofotara-sandbox'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-amber-500/30'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>2. بوابة محاكاة الربط المباشر (JoFotara Sandbox)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('sales-tax-istd')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'sales-tax-istd'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>3. إقرار الضريبة العامة على المبيعات (نموذج 4)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('wht-calculator')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'wht-calculator'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Percent className="w-4 h-4" />
            <span>4. ضريبة الاقتطاع من المنبع (WHT) والتوريد العكسي</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('transfer-pricing')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'transfer-pricing'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>5. التسعير التحويلي والأطراف ذات العلاقة</span>
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* INTERACTIVE TOOL: حاسبة ضريبة المبيعات الأردنية السريعة للفواتير     */}
      {/* ===================================================================== */}
      <div className="bg-slate-900 border-2 border-amber-500/40 p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-800 pb-4 mb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 px-2.5 py-1 text-[11px] font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>أداة تفاعلية فورية — قانون الضريبة العامة على المبيعات الأردني رقم (6) لسنة 1994 وتعديلاته</span>
            </div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-amber-400" />
              <span>حاسبة ضريبة المبيعات المستحقة على الفواتير (16%، 10%، 4%، أو معفى)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              احتساب فوري ودقيق (بدقة الفلس الأردني - 3 خانات عشرية) لقيمة الفاتورة الصافية، الخصومات التجارية، الضريبة الخاصة (إن وجدت)، وضريبة المبيعات المستحقة مع إمكانية الترحيل المباشر إلى فاتورة JoFotara.
            </p>
          </div>

          {/* Calculation Mode Toggle: Exclusive vs Inclusive */}
          <div className="flex items-center bg-slate-950 border border-slate-800 p-1 self-start">
            <button
              type="button"
              onClick={() => setQuickCalcMode('EXCLUSIVE')}
              className={`px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                quickCalcMode === 'EXCLUSIVE'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              المبلغ غير شامل للضريبة (+ الضريبة)
            </button>
            <button
              type="button"
              onClick={() => setQuickCalcMode('INCLUSIVE')}
              className={`px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                quickCalcMode === 'INCLUSIVE'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              المبلغ شامل للضريبة (استخراج الضريبة عكسياً)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Inputs & Rate Selector */}
          <div className="lg:col-span-7 space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                1. اختر نسبة ضريبة المبيعات المقررة قانوناً في الأردن:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {JORDAN_VAT_RATES_CONFIG.map((rateItem) => {
                  const isSelected = quickCalcCategory === rateItem.id;
                  return (
                    <button
                      key={rateItem.id}
                      type="button"
                      onClick={() => setQuickCalcCategory(rateItem.id)}
                      className={`p-3 text-right border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-400 text-white shadow-sm'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1.5">
                        <span
                          className={`text-base font-mono font-extrabold ${
                            isSelected ? 'text-amber-400' : 'text-slate-300'
                          }`}
                        >
                          {rateItem.badgeText}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                      </div>
                      <div className="text-[11px] font-bold leading-snug text-slate-200">
                        {rateItem.id === 'STANDARD_16' && 'النسبة العامة'}
                        {rateItem.id === 'REDUCED_10' && 'نسبة مخفضة (10%)'}
                        {rateItem.id === 'REDUCED_4' && 'نسبة مخفضة (4%)'}
                        {rateItem.id === 'EXEMPT_0' && 'معفى / صفرية'}
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-2 bg-slate-950 border border-slate-800/80 px-3 py-2 text-[11px] text-slate-300 flex items-start gap-2">
                <Receipt className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-amber-400">{selectedQuickRateObj.titleAr}:</strong>{' '}
                  {selectedQuickRateObj.legalScopeAr}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  {quickCalcMode === 'EXCLUSIVE'
                    ? 'قيمة الفاتورة قبل الضريبة (JOD)'
                    : 'إجمالي الفاتورة شامل الضريبة (JOD)'}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.001"
                  value={quickCalcAmount}
                  onChange={(e) => setQuickCalcAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 text-sm font-mono font-bold text-white focus:border-amber-500 focus:outline-none"
                  placeholder="0.000"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  نسبة الخصم التجاري الممنوح (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={quickDiscountPercent}
                  onChange={(e) => setQuickDiscountPercent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 text-sm font-mono text-white focus:border-amber-500 focus:outline-none"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  ضريبة خاصة / رسوم إضافية (JOD)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.001"
                  value={quickSpecialTaxAmount}
                  onChange={(e) => setQuickSpecialTaxAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 text-sm font-mono text-white focus:border-amber-500 focus:outline-none"
                  placeholder="0.000"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Live Calculation Output Card */}
          <div className="lg:col-span-5 bg-slate-950 border border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-xs font-bold text-slate-300">
                ملخص الاحتساب الضريبي للفاتورة
              </span>
              <span className="text-[11px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5">
                النسبة المطبقة: {selectedQuickRateObj.badgeText}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>القيمة الأساسية المدخلة:</span>
                <span className="font-mono text-slate-200" dir="ltr">
                  {quickVatCalculation.rawAmountJod} JOD
                </span>
              </div>

              {Number(quickVatCalculation.discountValueJod) > 0 && (
                <div className="flex items-center justify-between text-emerald-400">
                  <span>يُطرح: الخصم التجاري ({quickDiscountPercent}%):</span>
                  <span className="font-mono" dir="ltr">
                    -{quickVatCalculation.discountValueJod} JOD
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-slate-300 pt-1 border-t border-slate-900">
                <span>صافي القيمة قبل الضريبة:</span>
                <span className="font-mono font-bold text-white" dir="ltr">
                  {quickVatCalculation.netExclTaxJod} JOD
                </span>
              </div>

              {Number(quickVatCalculation.specialTaxJod) > 0 && (
                <div className="flex items-center justify-between text-amber-300">
                  <span>يُضاف: الضريبة الخاصة (تدخل في وعاء المبيعات):</span>
                  <span className="font-mono" dir="ltr">
                    +{quickVatCalculation.specialTaxJod} JOD
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between bg-amber-950/30 border border-amber-700/40 px-3 py-2 text-amber-300">
                <span className="font-bold">
                  ضريبة المبيعات المستحقة ({selectedQuickRateObj.ratePercent}%):
                </span>
                <span className="font-mono text-base font-extrabold text-amber-400" dir="ltr">
                  {quickVatCalculation.vatDueJod} JOD
                </span>
              </div>

              <div className="flex items-center justify-between bg-emerald-950/30 border border-emerald-700/40 px-3 py-2.5 text-emerald-300">
                <span className="font-bold">الإجمالي النهائي للفاتورة (شامل الضريبة):</span>
                <span className="font-mono text-lg font-extrabold text-emerald-400" dir="ltr">
                  {quickVatCalculation.grossInclTaxJod} JOD
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-800">
              <span className="text-[11px] text-slate-400 font-mono">
                العبء الضريبي الفعلي: {quickVatCalculation.effectiveTaxRatePct}%
              </span>
              <button
                type="button"
                onClick={handleTransferToJoFotaraPos}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3.5 py-2 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إدراج كبند في فاتورة JoFotara وتوليد QR</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-tab 1: JoFotara POS & TLV QR Generator */}
      {activeSubTab === 'jofotara-pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Invoice Input Panel */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">
                بيانات الفاتورة الضريبية الإلكترونية (JoFotara POS)
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGenerateNewInvoiceSerial}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 px-2.5 py-1 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>توليد رقم تسلسلي جديد</span>
                </button>
                <span className="text-xs font-mono text-amber-400 bg-amber-950/50 border border-amber-700/50 px-2.5 py-1">
                  Tag 1 - Tag 6 TLV Standard
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">اسم المورد المسجل (Tag 1)</label>
                <input
                  type="text"
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">الرقم الضريبي للمنشأة (Tag 2)</label>
                <input
                  type="text"
                  value={taxNumber}
                  onChange={(e) => setTaxNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 text-sm font-mono text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">الرقم التسلسلي للفاتورة</label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 text-sm font-mono text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 uppercase">بنود الفاتورة</h4>
                <button
                  type="button"
                  onClick={handleAddPosItem}
                  className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-amber-400 px-3 py-1.5 border border-slate-700 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة بند</span>
                </button>
              </div>

              <div className="overflow-x-auto border border-slate-800">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-2.5">البيان</th>
                      <th className="p-2.5 w-20">الكمية</th>
                      <th className="p-2.5 w-28">سعر الوحدة (د.أ)</th>
                      <th className="p-2.5 w-28">نسبة الضريبة</th>
                      <th className="p-2.5 w-28 text-left">الإجمالي شامل</th>
                      <th className="p-2.5 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-900/50">
                    {posItems.map((item, idx) => {
                      const lineGross = new Decimal(item.qty)
                        .times(new Decimal(item.unitPrice))
                        .times(new Decimal(1).plus(new Decimal(item.vatRate)))
                        .toFixed(3);
                      return (
                        <tr key={item.id}>
                          <td className="p-2">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => {
                                const updated = [...posItems];
                                updated[idx].description = e.target.value;
                                setPosItems(updated);
                              }}
                              className="w-full bg-slate-950 border border-slate-800 px-2 py-1 text-white"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="1"
                              value={item.qty}
                              onChange={(e) => {
                                const updated = [...posItems];
                                updated[idx].qty = Number(e.target.value) || 1;
                                setPosItems(updated);
                              }}
                              className="w-full bg-slate-950 border border-slate-800 px-2 py-1 font-mono text-white"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              value={item.unitPrice}
                              onChange={(e) => {
                                const updated = [...posItems];
                                updated[idx].unitPrice = Number(e.target.value) || 0;
                                setPosItems(updated);
                              }}
                              className="w-full bg-slate-950 border border-slate-800 px-2 py-1 font-mono text-white"
                            />
                          </td>
                          <td className="p-2">
                            <select
                              value={item.vatRate}
                              onChange={(e) => {
                                const updated = [...posItems];
                                updated[idx].vatRate = Number(e.target.value);
                                setPosItems(updated);
                              }}
                              className="w-full bg-slate-950 border border-slate-800 px-2 py-1 font-mono text-white"
                            >
                              <option value={0.16}>16% (قياسي)</option>
                              <option value={0.10}>10% (مخفض)</option>
                              <option value={0.04}>4% (زراعي/مخفض)</option>
                              <option value={0.0}>0% (صادرات/معفى)</option>
                            </select>
                          </td>
                          <td className="p-2 font-mono text-left font-bold text-emerald-400" dir="ltr">
                            {lineGross} JOD
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemovePosItem(item.id)}
                              className="text-slate-500 hover:text-rose-400 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="bg-slate-950 border border-slate-800 p-3 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-bold text-slate-300">وسيلة التسديد المعتمدة في الفاتورة:</span>
              <div className="flex items-center gap-2">
                {(
                  [
                    { id: 'CLIQ', label: 'التحويل الفوري CliQ (JoPACC)' },
                    { id: 'CASH', label: 'نقدي (Cash)' },
                    { id: 'CARD', label: 'بطاقة بنكية / ذمم (Card)' },
                  ] as const
                ).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={`px-3 py-1.5 text-xs font-bold border transition-colors cursor-pointer ${
                      paymentMethod === m.id
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Totals Summary */}
            <div className="grid grid-cols-3 gap-4 bg-slate-950 border border-slate-800 p-4">
              <div>
                <span className="text-xs text-slate-400 block">الصافي قبل الضريبة</span>
                <span className="text-lg font-mono font-bold text-white" dir="ltr">
                  {posTotals.netTotal.toFixed(3)} JOD
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">ضريبة المبيعات (Tag 5)</span>
                <span className="text-lg font-mono font-bold text-amber-400" dir="ltr">
                  {posTotals.vatTotal.toFixed(3)} JOD
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">الإجمالي الشامل (Tag 4)</span>
                <span className="text-lg font-mono font-bold text-emerald-400" dir="ltr">
                  {posTotals.grossTotal.toFixed(3)} JOD
                </span>
              </div>
            </div>

            {/* UBL 2.1 XML Preview */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-400">
                  معاينة هيكل الفاتورة الإلكترونية (UBL 2.1 XML Envelope)
                </span>
                <button
                  type="button"
                  onClick={() => handleDownloadJson(`${invoiceNumber}-jofotara.json`, jofotaraResult)}
                  className="text-xs text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تصدير حزمة التشفير JSON</span>
                </button>
              </div>
              <pre
                dir="ltr"
                className="bg-slate-950 border border-slate-800 p-3 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-44"
              >
                {jofotaraResult.ublXml}
              </pre>
            </div>
          </div>

          {/* Right Panel: TLV Base64 & Visual Receipt Preview */}
          <div className="lg:col-span-5 space-y-5">
            {copyToast && (
              <div className="bg-emerald-950 border border-emerald-600 px-3 py-2 text-xs text-emerald-200 flex items-center justify-between">
                <span>{copyToast}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
            )}

            {/* Thermal Receipt Card */}
            <div className="bg-slate-900 border border-slate-800 p-6">
              <div className="border-b border-dashed border-slate-700 pb-4 mb-4 text-center">
                <div className="text-xs text-amber-400 font-bold mb-1">
                  فاتورة ضريبية إلكترونية — JoFotara
                </div>
                <h4 className="text-base font-bold text-white">{sellerName}</h4>
                <div className="text-xs font-mono text-slate-400 mt-1">
                  الرقم الضريبي: {taxNumber} | رقم الفاتورة: {invoiceNumber}
                </div>
              </div>

              {/* SVG QR Code Representation + Cryptographic Stamp */}
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-950 border border-slate-800 p-4 mb-4">
                <div className="w-28 h-28 bg-white p-2 shrink-0 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full fill-slate-950">
                    <rect x="5" y="5" width="25" height="25" />
                    <rect x="10" y="10" width="15" height="15" fill="white" />
                    <rect x="13" y="13" width="9" height="9" />
                    <rect x="70" y="5" width="25" height="25" />
                    <rect x="75" y="10" width="15" height="15" fill="white" />
                    <rect x="78" y="13" width="9" height="9" />
                    <rect x="5" y="70" width="25" height="25" />
                    <rect x="10" y="75" width="15" height="15" fill="white" />
                    <rect x="13" y="78" width="9" height="9" />
                    <rect x="40" y="10" width="8" height="8" />
                    <rect x="52" y="18" width="10" height="10" />
                    <rect x="38" y="35" width="14" height="14" />
                    <rect x="12" y="42" width="18" height="8" />
                    <rect x="62" y="45" width="22" height="10" />
                    <rect x="42" y="65" width="12" height="22" />
                    <rect x="68" y="72" width="20" height="18" />
                  </svg>
                </div>
                <div className="text-xs space-y-1.5 overflow-hidden w-full">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-400">TLV Base64 Payload:</span>
                    <button
                      type="button"
                      onClick={() => handleCopyText('TLV Base64', jofotaraResult.encoded.tlvBase64)}
                      className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>نسخ</span>
                    </button>
                  </div>
                  <div
                    dir="ltr"
                    className="font-mono text-[11px] text-slate-300 bg-slate-900 p-2 border border-slate-800 break-all"
                  >
                    {jofotaraResult.encoded.tlvBase64}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono" dir="ltr">
                    <span>SHA-256: {jofotaraResult.encoded.cryptographicStamp.slice(0, 20)}...</span>
                    <button
                      type="button"
                      onClick={() => handleCopyText('بصمة SHA-256', jofotaraResult.encoded.cryptographicStamp)}
                      className="text-amber-400 hover:underline cursor-pointer"
                    >
                      نسخ البصمة
                    </button>
                  </div>
                </div>
              </div>

              {/* Decoded TLV Tags Inspector */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-300">
                  فاحص الحقول المشفرة داخل رمز الاستجابة (Decoded TLV Tags):
                </div>
                <div className="divide-y divide-slate-800 border border-slate-800 bg-slate-950 text-xs">
                  {jofotaraResult.decodedTags.map((t) => (
                    <div key={t.tagNumber} className="p-2 flex items-center justify-between gap-2">
                      <span className="text-slate-400">
                        <strong className="text-amber-400 font-mono">Tag {t.tagNumber}:</strong>{' '}
                        {t.tagNameAr}
                      </span>
                      <span className="font-mono text-white truncate max-w-[200px]" dir="ltr">
                        {t.valueUtf8} ({t.byteLength}B)
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Direct ERP Ledger Posting Button (الربط المباشر مع اليومية والأستاذ العام والقوائم المالية) */}
              <div className="mt-4 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    const jv = AccountingCycleStore.postJoFotaraSalesInvoiceToLedger({
                      invoiceNumber,
                      customerName: `عميل فوترة (${sellerName})`,
                      netAmountJod: posTotals.netTotal,
                      vatAmountJod: posTotals.vatTotal,
                      grossAmountJod: posTotals.grossTotal,
                      paymentMethod,
                    });
                    setCopyToast(
                      `تم ترحيل الفاتورة (${invoiceNumber}) آلياً بقيد يومية مزدوج (${jv.voucherNo}) إلى الأستاذ العام وميزان المراجعة والقوائم المالية!`
                    );
                    setTimeout(() => setCopyToast(null), 5000);
                  }}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                  <span>ترحيل الفاتورة آلياً إلى دفتر اليومية والأستاذ العام والقوائم المالية (ERP Sync)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 2: JoFotara Live Sandbox Simulator */}
      {activeSubTab === 'jofotara-sandbox' && <JoFotaraSandboxSimulator />}

      {/* Sub-tab 3: Sales Tax Return Generator (ISTD Form 4) */}
      {activeSubTab === 'sales-tax-istd' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4">
              <div className="text-xs text-slate-400">إجمالي ضريبة المخرجات (المبيعات)</div>
              <div className="text-2xl font-mono font-bold text-amber-400 mt-1" dir="ltr">
                {istdReturnJson.outputTaxSchedule.totalOutputTaxDue.toFixed(3)} JOD
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                إجمالي المبيعات: {istdReturnJson.outputTaxSchedule.totalSalesTurnover.toFixed(3)} JOD
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4">
              <div className="text-xs text-slate-400">ضريبة المدخلات القابلة للخصم</div>
              <div className="text-2xl font-mono font-bold text-emerald-400 mt-1" dir="ltr">
                {istdReturnJson.inputTaxSchedule.netRecoverableInputTax.toFixed(3)} JOD
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                نسبة الرد التناسبي: {istdReturnJson.inputTaxSchedule.apportionmentRatioPercent}%
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4">
              <div className="text-xs text-slate-400">ضريبة مدخلات مستبعدة (للمبيعات المعفاة)</div>
              <div className="text-2xl font-mono font-bold text-rose-400 mt-1" dir="ltr">
                {istdReturnJson.inputTaxSchedule.disallowedCommonInputTax.toFixed(3)} JOD
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                تُحمل على التكلفة بموجب معادلة التخصيص التناسبي
              </div>
            </div>

            <div className="bg-slate-900 border border-amber-500/50 p-4">
              <div className="text-xs text-amber-300">صافي الضريبة الواجبة التوريد لـ ISTD</div>
              <div className="text-2xl font-mono font-bold text-white mt-1" dir="ltr">
                {istdReturnJson.summary.netPayableToIstd.toFixed(3)} JOD
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                <span>رصيد دائن مدور سابق (د.أ):</span>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={carriedForwardCredit}
                  onChange={(e) => setCarriedForwardCredit(Math.max(0, Number(e.target.value) || 0))}
                  className="w-20 bg-slate-950 border border-slate-700 px-1.5 py-0.5 text-xs font-mono text-amber-300"
                />
              </div>
            </div>
          </div>

          {/* Interactive Invoices Manager for ISTD Form 4 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Invoices Box */}
            <div className="bg-slate-900 border border-slate-800 p-5 space-y-4">
              <h4 className="font-bold text-white text-sm border-b border-slate-800 pb-2">
                سجل فواتير المبيعات المدرجة في الإقرار ({salesInvoices.length})
              </h4>

              <form onSubmit={handleAddSalesInvoice} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  value={newSaleCustomer}
                  onChange={(e) => setNewSaleCustomer(e.target.value)}
                  placeholder="اسم العميل"
                  className="bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-xs text-white"
                />
                <select
                  value={newSaleCategory}
                  onChange={(e) => setNewSaleCategory(e.target.value as SalesInvoiceRecord['category'])}
                  className="bg-slate-950 border border-slate-700 px-2 py-1.5 text-xs text-white"
                >
                  <option value="DOMESTIC_STANDARD_16">محلي 16%</option>
                  <option value="DOMESTIC_REDUCED_10">مخفض 10%</option>
                  <option value="DOMESTIC_REDUCED_4">مخفض 4%</option>
                  <option value="EXPORT_AND_FREE_ZONES_0">تصدير / حرة 0%</option>
                  <option value="EXEMPT_SUPPLIES">معفى</option>
                </select>
                <div className="flex gap-1.5">
                  <input
                    type="number"
                    min="1"
                    value={newSaleNetAmount}
                    onChange={(e) => setNewSaleNetAmount(e.target.value)}
                    placeholder="الصافي د.أ"
                    className="w-full bg-slate-950 border border-slate-700 px-2 py-1.5 text-xs font-mono text-white"
                  />
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3 py-1.5 cursor-pointer"
                  >
                    إضافة
                  </button>
                </div>
              </form>

              <div className="max-h-48 overflow-y-auto divide-y divide-slate-800 border border-slate-800 bg-slate-950 text-xs">
                {salesInvoices.map((inv) => (
                  <div key={inv.invoiceId} className="p-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-mono text-amber-400 font-bold">{inv.invoiceId}</span> —{' '}
                      <span className="text-white">{inv.customerName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-slate-300" dir="ltr">
                        {inv.netAmount.toFixed(3)} JOD ({Math.round(inv.taxRate * 100)}%)
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteSalesInvoice(inv.invoiceId)}
                        className="text-slate-500 hover:text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Purchase Invoices Box */}
            <div className="bg-slate-900 border border-slate-800 p-5 space-y-4">
              <h4 className="font-bold text-white text-sm border-b border-slate-800 pb-2">
                سجل فواتير المشتريات وضريبة المدخلات ({purchaseInvoices.length})
              </h4>

              <form onSubmit={handleAddPurchaseInvoice} className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newPurSupplier}
                    onChange={(e) => setNewPurSupplier(e.target.value)}
                    placeholder="اسم المورد"
                    className="bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-xs text-white"
                  />
                  <input
                    type="text"
                    value={newPurTaxId}
                    onChange={(e) => setNewPurTaxId(e.target.value)}
                    placeholder="الرقم الضريبي"
                    className="bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-xs font-mono text-white"
                  />
                  <select
                    value={newPurCategory}
                    onChange={(e) => setNewPurCategory(e.target.value as PurchaseInvoiceRecord['category'])}
                    className="bg-slate-950 border border-slate-700 px-2 py-1.5 text-xs text-white"
                  >
                    <option value="LOCAL_TAXABLE_PURCHASES">مشتريات محلية</option>
                    <option value="IMPORTED_GOODS_CUSTOMS">بيان جمركي استيراد</option>
                    <option value="REVERSE_CHARGE_SERVICES">توريد عكسي</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                  <input
                    type="number"
                    min="1"
                    value={newPurNetAmount}
                    onChange={(e) => setNewPurNetAmount(e.target.value)}
                    placeholder="الصافي د.أ"
                    className="bg-slate-950 border border-slate-700 px-2 py-1.5 text-xs font-mono text-white"
                  />
                  <input
                    type="number"
                    min="0"
                    value={newPurVatAmount}
                    onChange={(e) => setNewPurVatAmount(e.target.value)}
                    placeholder="الضريبة د.أ"
                    className="bg-slate-950 border border-slate-700 px-2 py-1.5 text-xs font-mono text-white"
                  />
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-300">
                    <input
                      type="checkbox"
                      checked={newPurHasQr}
                      onChange={(e) => setNewPurHasQr(e.target.checked)}
                      className="accent-amber-500"
                    />
                    <span>موثقة بـ QR</span>
                  </label>
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-1.5 cursor-pointer"
                  >
                    إضافة فاتورة
                  </button>
                </div>
              </form>

              <div className="max-h-44 overflow-y-auto divide-y divide-slate-800 border border-slate-800 bg-slate-950 text-xs">
                {purchaseInvoices.map((pur) => (
                  <div key={pur.invoiceId} className="p-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-mono text-emerald-400 font-bold">{pur.invoiceId}</span> —{' '}
                      <span className="text-white">{pur.supplierName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-slate-300" dir="ltr">
                        VAT: {pur.paidTaxAmount.toFixed(3)} JOD
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeletePurchaseInvoice(pur.invoiceId)}
                        className="text-slate-500 hover:text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">
                  ملخص إقرار الضريبة العامة على المبيعات (نموذج 4 - الفترة الضريبية الشهرين)
                </h3>
                <p className="text-xs text-slate-400">
                  يُقدم خلال الشهر التالي لانتهاء الفترة الضريبية (المادة 16 من قانون الضريبة العامة على المبيعات)
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleDownloadJson('ISTD-SalesTax-Return-2026-P1.json', istdReturnJson)
                }
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>تصدير ملف الإقرار الإلكتروني (ISTD JSON)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Schedule A: Output Tax */}
              <div className="bg-slate-950 border border-slate-800 p-4 space-y-3">
                <h4 className="font-bold text-amber-400 text-sm border-b border-slate-800 pb-2">
                  أولاً: جدول المبيعات وضريبة المخرجات
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">مبيعات محلية خاضعة للنسبة العامة (16%):</span>
                    <span className="font-mono text-white" dir="ltr">
                      {istdReturnJson.outputTaxSchedule.standard16Base.toFixed(3)} JOD (Tax:{' '}
                      {istdReturnJson.outputTaxSchedule.standard16Tax.toFixed(3)})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">مبيعات خاضعة للنسبة المخفضة (10% / 4%):</span>
                    <span className="font-mono text-white" dir="ltr">
                      {(
                        istdReturnJson.outputTaxSchedule.reduced10Base +
                        istdReturnJson.outputTaxSchedule.reduced4Base
                      ).toFixed(3)}{' '}
                      JOD (Tax:{' '}
                      {(
                        istdReturnJson.outputTaxSchedule.reduced10Tax +
                        istdReturnJson.outputTaxSchedule.reduced4Tax
                      ).toFixed(3)}
                      )
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">صادرات ومبيعات مناطق حرة وعقبة (0%):</span>
                    <span className="font-mono text-emerald-400" dir="ltr">
                      {istdReturnJson.outputTaxSchedule.zeroRatedExportsBase.toFixed(3)} JOD
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">توريدات معفاة من الضريبة (جدول 3):</span>
                    <span className="font-mono text-slate-300" dir="ltr">
                      {istdReturnJson.outputTaxSchedule.exemptSuppliesBase.toFixed(3)} JOD
                    </span>
                  </div>
                </div>
              </div>

              {/* Schedule B: Input Tax & Apportionment */}
              <div className="bg-slate-950 border border-slate-800 p-4 space-y-3">
                <h4 className="font-bold text-emerald-400 text-sm border-b border-slate-800 pb-2">
                  ثانياً: جدول المشتريات ورد ضريبة المدخلات
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">ضريبة المشتريات المحلية الموثقة بـ JoFotara:</span>
                    <span className="font-mono text-white" dir="ltr">
                      {istdReturnJson.inputTaxSchedule.localPurchasesTax.toFixed(3)} JOD
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">ضريبة البيانات الجمركية للاستيراد:</span>
                    <span className="font-mono text-white" dir="ltr">
                      {istdReturnJson.inputTaxSchedule.importsCustomsTax.toFixed(3)} JOD
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">ضريبة الخدمات المستوردة (توريد عكسي):</span>
                    <span className="font-mono text-white" dir="ltr">
                      {istdReturnJson.inputTaxSchedule.reverseChargeInputTax.toFixed(3)} JOD
                    </span>
                  </div>
                  <div className="flex justify-between text-amber-300 pt-1 border-t border-slate-800">
                    <span>إجمالي الرديات والرصيد المدور القابل للخصم:</span>
                    <span className="font-mono font-bold" dir="ltr">
                      {istdReturnJson.summary.totalDeductionsAndCredits.toFixed(3)} JOD
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 4: Withholding Tax (WHT) & Reverse Charge */}
      {activeSubTab === 'wht-calculator' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-6 space-y-4">
              <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
                حاسبة ضريبة الاقتطاع من المنبع (المادة 12 من قانون ضريبة الدخل رقم 34 لسنة 2014)
              </h3>

              <div>
                <label className="block text-xs text-slate-400 mb-1">اسم المستفيد / المورد الخاضع للاقتطاع</label>
                <input
                  type="text"
                  value={beneficiaryName}
                  onChange={(e) => setBeneficiaryName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  قيمة المطالبة / الفاتورة الإجمالية قبل الاقتطاع (JOD)
                </label>
                <input
                  type="number"
                  min="0"
                  value={whtAmount}
                  onChange={(e) => setWhtAmount(Number(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 text-sm font-mono text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">فئة الخدمة ومعدل الاقتطاع القانوني</label>
                <select
                  value={whtCategory}
                  onChange={(e) => setWhtCategory(e.target.value as WhtServiceCategory)}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white"
                >
                  <option value="NON_RESIDENT_SERVICE_10">
                    10% - دفعات لغير المقيمين (خدمات استشارية، تقنية، إتاوات، حقوق ملكية)
                  </option>
                  <option value="RESIDENT_PROFESSIONAL_5">
                    5% - أتعاب الأطباء والمحامين والمهندسين ومدققي الحسابات والخبراء المقيمين
                  </option>
                  <option value="CONTRACTING_AND_COMMISSION_2">
                    2% - عقود المقاولات الإنشائية والعمولات والسمسرة التجارية المحلية
                  </option>
                  <option value="BANK_DEPOSIT_INTEREST_INDIVIDUAL_5">
                    5% - فوائد الودائع وأرباح الحسابات المصرفية للأفراد
                  </option>
                  <option value="BANK_DEPOSIT_INTEREST_CORPORATE_7">
                    7% - فوائد الودائع للشركات والأشخاص الاعتباريين
                  </option>
                </select>
              </div>

              {whtCategory === 'NON_RESIDENT_SERVICE_10' && (
                <div className="bg-slate-950 border border-slate-800 p-3">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={applyReverseChargeVat}
                      onChange={(e) => setApplyReverseChargeVat(e.target.checked)}
                      className="mt-1 accent-amber-500"
                    />
                    <span className="text-xs text-slate-300">
                      احتساب ضريبة المبيعات بالتكليف العكسي (16% Reverse Charge VAT) على استيراد الخدمات من خارج المملكة.
                    </span>
                  </label>
                </div>
              )}

              <button
                type="button"
                onClick={handleSaveWhtCertificate}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2.5 px-4 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>حفظ وإدراج في كشف الاقتطاع الشهري (نموذج و/1)</span>
              </button>
            </div>

            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-6 space-y-4">
              <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
                نتائج الاحتساب الضريبي والتوريد خلال 30 يوماً (نموذج اقتطاع و/1)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-950 border border-slate-800 p-4">
                  <span className="text-xs text-slate-400 block">ضريبة الدخل المقتطعة ({(whtResult.whtRate * 100).toFixed(0)}%)</span>
                  <span className="text-xl font-mono font-bold text-rose-400 mt-1 block" dir="ltr">
                    {whtResult.whtDeductedAmount.toFixed(3)} JOD
                  </span>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-4">
                  <span className="text-xs text-slate-400 block">الصافي المحول للمورد</span>
                  <span className="text-xl font-mono font-bold text-emerald-400 mt-1 block" dir="ltr">
                    {whtResult.netPayableToVendor.toFixed(3)} JOD
                  </span>
                </div>

                <div className="bg-slate-950 border border-amber-500/40 p-4">
                  <span className="text-xs text-amber-300 block">ضريبة مبيعات التكليف العكسي (16%)</span>
                  <span className="text-xl font-mono font-bold text-amber-400 mt-1 block" dir="ltr">
                    {whtResult.reverseChargeSalesTax16.toFixed(3)} JOD
                  </span>
                </div>
              </div>

              <div className="bg-slate-950 border-r-2 border-amber-500 p-4 text-xs text-slate-300 space-y-2">
                <div className="font-bold text-amber-400">القاعدة التشريعية والمهلة القانونية:</div>
                <p>
                  يلتزم دافع المبلغ باقتطاع الضريبة وتوريدها إلى دائرة ضريبة الدخل والمبيعات خلال <strong>30 يوماً</strong> من تاريخ الدفع أو الاستحقاق أيهما أسبق. في حال التخلف عن الاقتطاع، تُحصل الضريبة من الدافع نفسه كما لو كانت مستحقة عليه أصلاً مع غرامة تأخير بواقع 0.4% عن كل أسبوع تأخير.
                </p>
                <div className="font-mono text-white pt-1" dir="ltr">
                  Total Cash Outflow (Vendor + ISTD WHT + Reverse VAT): {whtResult.totalTaxRemittanceToIstd + whtResult.netPayableToVendor} JOD
                </div>
              </div>
            </div>
          </div>

          {/* Saved WHT Certificates Register */}
          <div className="bg-slate-900 border border-slate-800 p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-white">
                سجل شهادات الاقتطاع المصدرة خلال الشهر ({savedWhtCertificates.length})
              </h4>
              <button
                type="button"
                onClick={() => handleDownloadJson('WHT-Monthly-Schedule-W1.json', savedWhtCertificates)}
                className="text-xs text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تصدير كشف الاقتطاع الشهري (JSON)</span>
              </button>
            </div>
            <div className="overflow-x-auto border border-slate-800">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-2.5">رقم الشهادة</th>
                    <th className="p-2.5">التاريخ</th>
                    <th className="p-2.5">اسم المستفيد</th>
                    <th className="p-2.5">فئة الاقتطاع</th>
                    <th className="p-2.5 text-left">إجمالي الفاتورة</th>
                    <th className="p-2.5 text-left">الضريبة المقتطعة</th>
                    <th className="p-2.5 text-left">الصافي للمورد</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {savedWhtCertificates.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-800/40">
                      <td className="p-2.5 font-mono text-amber-400 font-bold">{c.certificateNumber}</td>
                      <td className="p-2.5 font-mono text-slate-400">{c.date}</td>
                      <td className="p-2.5 text-white font-semibold">{c.beneficiaryName}</td>
                      <td className="p-2.5 text-slate-300">{c.categoryLabel}</td>
                      <td className="p-2.5 font-mono text-left text-white" dir="ltr">{c.grossAmountJod} JOD</td>
                      <td className="p-2.5 font-mono text-left text-rose-400 font-bold" dir="ltr">{c.whtDeductedJod} JOD</td>
                      <td className="p-2.5 font-mono text-left text-emerald-400" dir="ltr">{c.netPayableJod} JOD</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 5: Transfer Pricing Engine */}
      {activeSubTab === 'transfer-pricing' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4">
              <div className="text-xs text-slate-400">إجمالي معاملات الأطراف المرتبطة</div>
              <div className="text-2xl font-mono font-bold text-white mt-1" dir="ltr">
                {tpAssessment.totalRelatedPartyVolumeJod.toLocaleString()} JOD
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                <span>إيراد المنشأة السنوي:</span>
                <input
                  type="number"
                  step="100000"
                  value={annualCompanyRevenue}
                  onChange={(e) => setAnnualCompanyRevenue(Math.max(0, Number(e.target.value) || 0))}
                  className="w-28 bg-slate-950 border border-slate-700 px-1.5 py-0.5 text-xs font-mono text-amber-300"
                />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4">
              <div className="text-xs text-slate-400">إلزامية نموذج الإفصاح والملف المحلي</div>
              <div className="text-sm font-bold text-amber-400 mt-1">
                {tpAssessment.requiresLocalAndMasterFile
                  ? 'ملزم بنموذج الإفصاح + الملف المحلي (تجاوز 500,000 د.أ)'
                  : 'غير ملزم بالملف المحلي'}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                نظام التسعير التحويلي رقم (40) لسنة 2021
              </div>
            </div>

            <div className="bg-slate-900 border border-rose-500/40 p-4">
              <div className="text-xs text-rose-300">تعديل الوعاء الضريبي (المادة 20/أ)</div>
              <div className="text-2xl font-mono font-bold text-rose-400 mt-1" dir="ltr">
                +{tpAssessment.totalTaxableIncomeAdjustmentJod.toLocaleString()} JOD
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                فروقات السعر المحايد المضافة للربح الخاضع
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4">
              <div className="text-xs text-slate-400">مستوى مخاطر التدقيق الدولي</div>
              <div className="text-xl font-bold text-amber-400 mt-1">
                {tpAssessment.riskRating}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                فحص تحويل الأرباح للمناطق الحرة والخارج
              </div>
            </div>
          </div>

          {/* Add Related-Party Transaction Form */}
          <div className="bg-slate-900 border border-slate-800 p-5">
            <h4 className="text-xs font-bold text-amber-400 mb-3">
              إضافة معاملة جديدة مع طرف ذي علاقة لاختبار السعر المحايد (Arm&apos;s Length Range)
            </h4>
            <form onSubmit={handleAddTpTransaction} className="grid grid-cols-1 md:grid-cols-6 gap-2.5 items-end">
              <div className="md:col-span-2">
                <label className="block text-[11px] text-slate-400 mb-1">اسم الطرف المرتبط والدولة</label>
                <input
                  type="text"
                  value={newTpCounterparty}
                  onChange={(e) => setNewTpCounterparty(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">قيمة المعاملة (JOD)</label>
                <input
                  type="number"
                  min="1000"
                  value={newTpValue}
                  onChange={(e) => setNewTpValue(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">الهامش المطبق (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newTpReportedRate}
                  onChange={(e) => setNewTpReportedRate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">المدى المحايد (من% - إلى%)</label>
                <div className="flex gap-1">
                  <input
                    type="number"
                    step="0.5"
                    value={newTpMinRate}
                    onChange={(e) => setNewTpMinRate(e.target.value)}
                    className="w-1/2 bg-slate-950 border border-slate-700 px-2 py-1.5 text-xs font-mono text-white"
                  />
                  <input
                    type="number"
                    step="0.5"
                    value={newTpMaxRate}
                    onChange={(e) => setNewTpMaxRate(e.target.value)}
                    className="w-1/2 bg-slate-950 border border-slate-700 px-2 py-1.5 text-xs font-mono text-white"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3 py-2 cursor-pointer"
              >
                إضافة وفحص
              </button>
            </form>
          </div>

          <div className="bg-slate-900 border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm">
                جدول اختبار السعر المحايد (Arm&apos;s Length Range) لمعاملات الأطراف ذات العلاقة
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3">الطرف المرتبط والدولة</th>
                    <th className="p-3">طبيعة المعاملة</th>
                    <th className="p-3">منهجية التسعير</th>
                    <th className="p-3 text-left">قيمة المعاملة (JOD)</th>
                    <th className="p-3 text-left">الهامش المطبق</th>
                    <th className="p-3 text-left">المدى الربعي المحايد (IQR)</th>
                    <th className="p-3">الحالة والتعديل الضريبي</th>
                    <th className="p-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {tpAssessment.transactionEvaluations.map((ev) => (
                    <tr key={ev.transaction.id} className="hover:bg-slate-800/40">
                      <td className="p-3">
                        <div className="font-bold text-white">{ev.transaction.counterpartyName}</div>
                        <div className="text-slate-400">{ev.transaction.counterpartyCountry}</div>
                      </td>
                      <td className="p-3 text-slate-300">{ev.transaction.natureOfTransaction}</td>
                      <td className="p-3 font-mono text-amber-400">{ev.transaction.pricingMethod}</td>
                      <td className="p-3 font-mono text-left text-white" dir="ltr">
                        {ev.transaction.transactionValueJod.toLocaleString()} JOD
                      </td>
                      <td className="p-3 font-mono text-left font-bold text-white" dir="ltr">
                        {ev.transaction.reportedMarginOrRatePercent}%
                      </td>
                      <td className="p-3 font-mono text-left text-slate-300" dir="ltr">
                        [{ev.transaction.armsLengthMinPercent}% - {ev.transaction.armsLengthMaxPercent}%] (Med: {ev.medianBenchmarkPercent}%)
                      </td>
                      <td className="p-3">
                        {ev.isWithinArmsLengthRange ? (
                          <span className="text-emerald-400 font-bold">ضمن المدى المحايد (مقبول)</span>
                        ) : (
                          <div className="text-rose-400">
                            <div className="font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>خارج المدى (+{ev.proposedTaxableIncomeAdjustmentJod.toLocaleString()} JOD)</span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">{ev.findingAr}</div>
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteTpTransaction(ev.transaction.id)}
                          className="text-slate-500 hover:text-rose-400 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
};

export default TaxAndJoFotaraView;

