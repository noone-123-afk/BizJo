import Decimal from 'decimal.js';
import { SystemGovernanceService } from '../governance/SystemGovernanceService';

Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP });

export type AccountCategory = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'COGS' | 'EXPENSE';
export type NormalBalanceSide = 'DEBIT' | 'CREDIT';
export type CashFlowActivity = 'OPERATING' | 'INVESTING' | 'FINANCING' | 'CASH_EQUIVALENT';

export interface ChartOfAccountItem {
  code: string;
  nameAr: string;
  category: AccountCategory;
  normalSide: NormalBalanceSide;
  subCategoryAr: string;
  cashFlowActivity: CashFlowActivity;
  openingDebitJod: number;
  openingCreditJod: number;
}

export interface JournalEntryLine {
  accountCode: string;
  accountNameAr: string;
  debitJod: number;
  creditJod: number;
  subLedgerPartyId?: string;
  subLedgerPartyName?: string;
}

export type CommercialVoucherType =
  | 'JOFOTARA_SALES_INVOICE'
  | 'CREDIT_NOTE'
  | 'DEBIT_NOTE'
  | 'RECEIPT_VOUCHER'
  | 'PAYMENT_VOUCHER'
  | 'PURCHASE_INVOICE'
  | 'PAYROLL_AND_SSC'
  | 'PAYMENT_RECEIPT'
  | 'MANUAL_JV';

export interface JournalVoucherRecord {
  id: string;
  voucherNo: string;
  dateIso: string;
  sourceType: CommercialVoucherType;
  sourceReference: string;
  descriptionAr: string;
  lines: JournalEntryLine[];
}

export interface CommercialPartyRecord {
  partyId: string;
  partyName: string;
  partyType: 'CUSTOMER_AR' | 'VENDOR_AP';
  taxNumber: string;
  phone: string;
  cityAr: string;
  openingBalanceJod: number;
}

export interface SubLedgerStatementMovement {
  voucherNo: string;
  dateIso: string;
  docTypeLabelAr: string;
  sourceReference: string;
  descriptionAr: string;
  debitJod: string;
  creditJod: string;
  runningBalanceJod: string;
}

export interface SubLedgerPartySummary {
  partyId: string;
  partyName: string;
  partyType: 'CUSTOMER_AR' | 'VENDOR_AP';
  taxNumber: string;
  phone: string;
  cityAr: string;
  openingBalanceJod: string;
  totalDebitJod: string;
  totalCreditJod: string;
  closingBalanceJod: string;
  movements: SubLedgerStatementMovement[];
}

export interface GeneralLedgerAccountReport {
  account: ChartOfAccountItem;
  openingDebitJod: string;
  openingCreditJod: string;
  periodDebitJod: string;
  periodCreditJod: string;
  totalDebitJod: string;
  totalCreditJod: string;
  closingDebitBalanceJod: string;
  closingCreditBalanceJod: string;
  netSignedBalanceJod: string;
  movements: Array<{
    voucherNo: string;
    dateIso: string;
    sourceReference: string;
    descriptionAr: string;
    debitJod: string;
    creditJod: string;
    runningBalanceJod: string;
  }>;
}

const STORAGE_KEY = 'JO_ERP_ACCOUNTING_CYCLE_STORE_V2';
const PARTIES_STORAGE_KEY = 'JO_ERP_COMMERCIAL_PARTIES_V2';
const CYCLE_EVENT = 'jo-accounting-cycle-updated';

export const INITIAL_COMMERCIAL_PARTIES: CommercialPartyRecord[] = [
  {
    partyId: 'CUST-01',
    partyName: 'شركة الاتصالات المتقدمة ذ.م.م',
    partyType: 'CUSTOMER_AR',
    taxNumber: '170088214',
    phone: '0795544110',
    cityAr: 'عمّان - العبدلي',
    openingBalanceJod: 32000,
  },
  {
    partyId: 'CUST-02',
    partyName: 'مجموعة الفوسفات والصناعات التحويلية المساهمة',
    partyType: 'CUSTOMER_AR',
    taxNumber: '170044912',
    phone: '0796611220',
    cityAr: 'عمّان - الشميساني',
    openingBalanceJod: 0,
  },
  {
    partyId: 'CUST-03',
    partyName: 'مستشفى الأردن التخصصي للرعاية الطبية',
    partyType: 'CUSTOMER_AR',
    taxNumber: '170019283',
    phone: '0778899001',
    cityAr: 'عمّان - الدوار الرابع',
    openingBalanceJod: 0,
  },
  {
    partyId: 'VEND-01',
    partyName: 'شركة الخوادم والحوسبة الأردنية',
    partyType: 'VENDOR_AP',
    taxNumber: '988123456',
    phone: '0791122334',
    cityAr: 'عمّان - شارع مكة',
    openingBalanceJod: 28500,
  },
  {
    partyId: 'VEND-02',
    partyName: 'مؤسسة الشرق الأوسط للتجهيزات الصناعية',
    partyType: 'VENDOR_AP',
    taxNumber: '944556677',
    phone: '0785566778',
    cityAr: 'الزرقاء - المنطقة الحرة',
    openingBalanceJod: 0,
  },
];

export const STANDARD_JORDAN_COA: ChartOfAccountItem[] = [
  // 1. الأصول (Assets)
  {
    code: '1101',
    nameAr: 'النقدية لدى البنوك المحلية والصندوق (البنك العربي / CliQ)',
    category: 'ASSET',
    normalSide: 'DEBIT',
    subCategoryAr: 'أصول متداولة — نقدية وبنوك',
    cashFlowActivity: 'CASH_EQUIVALENT',
    openingDebitJod: 85000,
    openingCreditJod: 0,
  },
  {
    code: '1102',
    nameAr: 'ذمم العملاء التجارية (الأستاذ المساعد للعملاء AR)',
    category: 'ASSET',
    normalSide: 'DEBIT',
    subCategoryAr: 'أصول متداولة — ذمم مدينة',
    cashFlowActivity: 'OPERATING',
    openingDebitJod: 32000,
    openingCreditJod: 0,
  },
  {
    code: '1105',
    nameAr: 'مخزون البضاعة الجاهزة (تقييم WAC / IAS 2)',
    category: 'ASSET',
    normalSide: 'DEBIT',
    subCategoryAr: 'أصول متداولة — مخزون سلعي',
    cashFlowActivity: 'OPERATING',
    openingDebitJod: 54600,
    openingCreditJod: 0,
  },
  {
    code: '1108',
    nameAr: 'أمانات ضريبة المبيعات القابلة للرد (ضريبة مدخلات)',
    category: 'ASSET',
    normalSide: 'DEBIT',
    subCategoryAr: 'أصول متداولة — أرصدة ضريبية مدينة',
    cashFlowActivity: 'OPERATING',
    openingDebitJod: 1200,
    openingCreditJod: 0,
  },
  {
    code: '1201',
    nameAr: 'الأصول الثابتة — مباني ومعدات وخوادم (بالصافي IAS 16)',
    category: 'ASSET',
    normalSide: 'DEBIT',
    subCategoryAr: 'أصول غير متداولة — ممتلكات ومعدات',
    cashFlowActivity: 'INVESTING',
    openingDebitJod: 210000,
    openingCreditJod: 0,
  },
  // 2. الالتزامات (Liabilities)
  {
    code: '2101',
    nameAr: 'ذمم الموردين التجارية (الأستاذ المساعد للموردين AP)',
    category: 'LIABILITY',
    normalSide: 'CREDIT',
    subCategoryAr: 'التزامات متداولة — ذمم دائنة',
    cashFlowActivity: 'OPERATING',
    openingDebitJod: 0,
    openingCreditJod: 28500,
  },
  {
    code: '2104',
    nameAr: 'أمانات الضريبة العامة على المبيعات المستحقة (ضريبة مخرجات ISTD)',
    category: 'LIABILITY',
    normalSide: 'CREDIT',
    subCategoryAr: 'التزامات متداولة — ضرائب مستحقة',
    cashFlowActivity: 'OPERATING',
    openingDebitJod: 0,
    openingCreditJod: 4300,
  },
  {
    code: '2105',
    nameAr: 'أمانات ضريبة الدخل المقتطعة من المنبع (نموذج و/1)',
    category: 'LIABILITY',
    normalSide: 'CREDIT',
    subCategoryAr: 'التزامات متداولة — اقتطاعات ضريبية',
    cashFlowActivity: 'OPERATING',
    openingDebitJod: 0,
    openingCreditJod: 1500,
  },
  {
    code: '2106',
    nameAr: 'أمانات المؤسسة العامة للضمان الاجتماعي المستحقة (21.75%)',
    category: 'LIABILITY',
    normalSide: 'CREDIT',
    subCategoryAr: 'التزامات متداولة — ضمان اجتماعي',
    cashFlowActivity: 'OPERATING',
    openingDebitJod: 0,
    openingCreditJod: 3500,
  },
  {
    code: '2201',
    nameAr: 'قروض وتمويلات بنكية طويلة الأجل',
    category: 'LIABILITY',
    normalSide: 'CREDIT',
    subCategoryAr: 'التزامات غير متداولة — تمويل بنكي',
    cashFlowActivity: 'FINANCING',
    openingDebitJod: 0,
    openingCreditJod: 45000,
  },
  // 3. حقوق الملكية (Equity)
  {
    code: '3101',
    nameAr: 'رأس المال المصرح والمدفوع (شركة ذات مسؤولية محدودة)',
    category: 'EQUITY',
    normalSide: 'CREDIT',
    subCategoryAr: 'حقوق الملكية — رأس المال',
    cashFlowActivity: 'FINANCING',
    openingDebitJod: 0,
    openingCreditJod: 250000,
  },
  {
    code: '3201',
    nameAr: 'الاحتياطي الإجباري القانوني المتراكم (مادة 186 شركات)',
    category: 'EQUITY',
    normalSide: 'CREDIT',
    subCategoryAr: 'حقوق الملكية — احتياطيات قانونية',
    cashFlowActivity: 'FINANCING',
    openingDebitJod: 0,
    openingCreditJod: 22000,
  },
  {
    code: '3301',
    nameAr: 'الأرباح المدورة من سنوات سابقة',
    category: 'EQUITY',
    normalSide: 'CREDIT',
    subCategoryAr: 'حقوق الملكية — أرباح مدورة',
    cashFlowActivity: 'FINANCING',
    openingDebitJod: 0,
    openingCreditJod: 28000,
  },
  // 4. الإيرادات (Revenues)
  {
    code: '4101',
    nameAr: 'إيرادات المبيعات والخدمات الخاضعة لضريبة المبيعات (JoFotara)',
    category: 'REVENUE',
    normalSide: 'CREDIT',
    subCategoryAr: 'إيرادات النشاط التشغيلي',
    cashFlowActivity: 'OPERATING',
    openingDebitJod: 0,
    openingCreditJod: 0,
  },
  {
    code: '4102',
    nameAr: 'إيرادات الصادرات والمناطق الحرة الخاضعة لنسبة الصفر (0%)',
    category: 'REVENUE',
    normalSide: 'CREDIT',
    subCategoryAr: 'إيرادات التصدير والعقبة',
    cashFlowActivity: 'OPERATING',
    openingDebitJod: 0,
    openingCreditJod: 0,
  },
  // 5. تكلفة المبيعات والمصاريف التشغيلية (COGS & Operating Expenses)
  {
    code: '5101',
    nameAr: 'تكلفة البضاعة المباعة والخدمات المباشرة (COGS)',
    category: 'COGS',
    normalSide: 'DEBIT',
    subCategoryAr: 'تكلفة المبيعات المباشرة',
    cashFlowActivity: 'OPERATING',
    openingDebitJod: 0,
    openingCreditJod: 0,
  },
  {
    code: '5201',
    nameAr: 'مصاريف الرواتب والأجور وحصة الشركة بالضمان الاجتماعي',
    category: 'EXPENSE',
    normalSide: 'DEBIT',
    subCategoryAr: 'مصاريف إدارية وعمومية',
    cashFlowActivity: 'OPERATING',
    openingDebitJod: 0,
    openingCreditJod: 0,
  },
  {
    code: '5202',
    nameAr: 'مصاريف الإيجارات والمرافق والاتصالات والاستشارات',
    category: 'EXPENSE',
    normalSide: 'DEBIT',
    subCategoryAr: 'مصاريف تشغيلية وإدارية',
    cashFlowActivity: 'OPERATING',
    openingDebitJod: 0,
    openingCreditJod: 0,
  },
];

export const INITIAL_JOURNAL_VOUCHERS: JournalVoucherRecord[] = [
  {
    id: 'jv-1',
    voucherNo: 'JV-2026-001',
    dateIso: '2026-01-15',
    sourceType: 'JOFOTARA_SALES_INVOICE',
    sourceReference: 'INV-2026-001',
    descriptionAr: 'إثبات فاتورة مبيعات إلكترونية (JoFotara) — شركة الاتصالات المتقدمة ذ.م.م (آجل + ضريبة 16%)',
    lines: [
      {
        accountCode: '1102',
        accountNameAr: 'ذمم العملاء التجارية (الأستاذ المساعد للعملاء AR)',
        debitJod: 40600.0,
        creditJod: 0,
        subLedgerPartyId: 'CUST-01',
        subLedgerPartyName: 'شركة الاتصالات المتقدمة ذ.م.م',
      },
      {
        accountCode: '4101',
        accountNameAr: 'إيرادات المبيعات والخدمات الخاضعة لضريبة المبيعات (JoFotara)',
        debitJod: 0,
        creditJod: 35000.0,
      },
      {
        accountCode: '2104',
        accountNameAr: 'أمانات الضريبة العامة على المبيعات المستحقة (ضريبة مخرجات ISTD)',
        debitJod: 0,
        creditJod: 5600.0,
      },
      {
        accountCode: '5101',
        accountNameAr: 'تكلفة البضاعة المباعة والخدمات المباشرة (COGS)',
        debitJod: 18500.0,
        creditJod: 0,
      },
      {
        accountCode: '1105',
        accountNameAr: 'مخزون البضاعة الجاهزة (تقييم WAC / IAS 2)',
        debitJod: 0,
        creditJod: 18500.0,
      },
    ],
  },
  {
    id: 'jv-2',
    voucherNo: 'JV-2026-002',
    dateIso: '2026-01-22',
    sourceType: 'PURCHASE_INVOICE',
    sourceReference: 'PUR-2026-101',
    descriptionAr: 'توريد بضاعة ومعدات للمستودع بموجب فاتورة مشتريات ضريبية موثقة بـ QR — شركة الخوادم الأردنية',
    lines: [
      {
        accountCode: '1105',
        accountNameAr: 'مخزون البضاعة الجاهزة (تقييم WAC / IAS 2)',
        debitJod: 12000.0,
        creditJod: 0,
      },
      {
        accountCode: '1108',
        accountNameAr: 'أمانات ضريبة المبيعات القابلة للرد (ضريبة مدخلات)',
        debitJod: 1920.0,
        creditJod: 0,
      },
      {
        accountCode: '2101',
        accountNameAr: 'ذمم الموردين التجارية (الأستاذ المساعد للموردين AP)',
        debitJod: 0,
        creditJod: 13920.0,
        subLedgerPartyId: 'VEND-01',
        subLedgerPartyName: 'شركة الخوادم والحوسبة الأردنية',
      },
    ],
  },
  {
    id: 'jv-3',
    voucherNo: 'JV-2026-003',
    dateIso: '2026-01-28',
    sourceType: 'RECEIPT_VOUCHER',
    sourceReference: 'RV-2026-101',
    descriptionAr: 'سند قبض: تحصيل دفعة من شركة الاتصالات المتقدمة عبر نظام كليك (CliQ) في حساب البنك',
    lines: [
      {
        accountCode: '1101',
        accountNameAr: 'النقدية لدى البنوك المحلية والصندوق (البنك العربي / CliQ)',
        debitJod: 25000.0,
        creditJod: 0,
      },
      {
        accountCode: '1102',
        accountNameAr: 'ذمم العملاء التجارية (الأستاذ المساعد للعملاء AR)',
        debitJod: 0,
        creditJod: 25000.0,
        subLedgerPartyId: 'CUST-01',
        subLedgerPartyName: 'شركة الاتصالات المتقدمة ذ.م.م',
      },
    ],
  },
  {
    id: 'jv-4',
    voucherNo: 'JV-2026-004',
    dateIso: '2026-01-31',
    sourceType: 'PAYROLL_AND_SSC',
    sourceReference: 'PAY-2026-JAN',
    descriptionAr: 'قيد استحقاق وصرف الرواتب والأجور واقتطاعات الضمان الاجتماعي وضريبة الدخل لشهر كانون الثاني',
    lines: [
      {
        accountCode: '5201',
        accountNameAr: 'مصاريف الرواتب والأجور وحصة الشركة بالضمان الاجتماعي',
        debitJod: 6855.0,
        creditJod: 0,
      },
      {
        accountCode: '1101',
        accountNameAr: 'النقدية لدى البنوك المحلية والصندوق (البنك العربي / CliQ)',
        debitJod: 0,
        creditJod: 5380.0,
      },
      {
        accountCode: '2106',
        accountNameAr: 'أمانات المؤسسة العامة للضمان الاجتماعي المستحقة (21.75%)',
        debitJod: 0,
        creditJod: 1305.0,
      },
      {
        accountCode: '2105',
        accountNameAr: 'أمانات ضريبة الدخل المقتطعة من المنبع (نموذج و/1)',
        debitJod: 0,
        creditJod: 170.0,
      },
    ],
  },
  {
    id: 'jv-5',
    voucherNo: 'JV-2026-005',
    dateIso: '2026-02-05',
    sourceType: 'PAYMENT_VOUCHER',
    sourceReference: 'PV-2026-204',
    descriptionAr: 'سند صرف: دفع بدل إيجار المقر وأتعاب استشارات مع اقتطاع ضريبة المنبع (5% و 10%)',
    lines: [
      {
        accountCode: '5202',
        accountNameAr: 'مصاريف الإيجارات والمرافق والاتصالات والاستشارات',
        debitJod: 3000.0,
        creditJod: 0,
      },
      {
        accountCode: '1101',
        accountNameAr: 'النقدية لدى البنوك المحلية والصندوق (البنك العربي / CliQ)',
        debitJod: 0,
        creditJod: 2775.0,
      },
      {
        accountCode: '2105',
        accountNameAr: 'أمانات ضريبة الدخل المقتطعة من المنبع (نموذج و/1)',
        debitJod: 0,
        creditJod: 225.0,
      },
    ],
  },
];

const DOC_TYPE_LABELS_AR: Record<CommercialVoucherType, string> = {
  JOFOTARA_SALES_INVOICE: 'فاتورة مبيعات ضريبية (JoFotara)',
  CREDIT_NOTE: 'إشعار دائن (Credit Note)',
  DEBIT_NOTE: 'إشعار مدين (Debit Note)',
  RECEIPT_VOUCHER: 'سند قبض مالي (Receipt Voucher)',
  PAYMENT_VOUCHER: 'سند صرف مالي (Payment Voucher)',
  PURCHASE_INVOICE: 'فاتورة مشتريات وتوريد',
  PAYROLL_AND_SSC: 'مسير رواتب وضمان اجتماعي',
  PAYMENT_RECEIPT: 'سند تحصيل / دفع بنكي',
  MANUAL_JV: 'قيد يومية مزدوج (Manual JV)',
};

export class AccountingCycleStore {
  public static getParties(): CommercialPartyRecord[] {
    if (typeof window === 'undefined') return INITIAL_COMMERCIAL_PARTIES;
    try {
      const raw = window.localStorage.getItem(PARTIES_STORAGE_KEY);
      if (!raw) return INITIAL_COMMERCIAL_PARTIES;
      const parsed = JSON.parse(raw) as CommercialPartyRecord[];
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_COMMERCIAL_PARTIES;
    } catch {
      return INITIAL_COMMERCIAL_PARTIES;
    }
  }

  public static addParty(party: Omit<CommercialPartyRecord, 'partyId'>): CommercialPartyRecord {
    const existing = this.getParties();
    const prefix = party.partyType === 'CUSTOMER_AR' ? 'CUST' : 'VEND';
    const created: CommercialPartyRecord = {
      ...party,
      partyId: `${prefix}-0${existing.length + 1}`,
    };
    const updated = [...existing, created];
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(PARTIES_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent(CYCLE_EVENT));
    }
    SystemGovernanceService.recordAuditAction({
      actorName: 'مدير الحسابات',
      moduleName: 'إدارة العملاء والموردين (AR/AP)',
      actionLabel: `إضافة ${party.partyType === 'CUSTOMER_AR' ? 'عميل جديد' : 'مورد جديد'} (${created.partyName})`,
      oldValue: `عدد الأطراف: ${existing.length}`,
      newValue: `${created.partyName} — رقم ضريبي: ${created.taxNumber}`,
    });
    return created;
  }

  public static getJournalVouchers(): JournalVoucherRecord[] {
    if (typeof window === 'undefined') return INITIAL_JOURNAL_VOUCHERS;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return INITIAL_JOURNAL_VOUCHERS;
      const parsed = JSON.parse(raw) as JournalVoucherRecord[];
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_JOURNAL_VOUCHERS;
    } catch {
      return INITIAL_JOURNAL_VOUCHERS;
    }
  }

  public static addJournalVoucher(voucher: Omit<JournalVoucherRecord, 'id' | 'voucherNo'>): JournalVoucherRecord {
    const existing = this.getJournalVouchers();
    const nextSeq = existing.length + 1;
    const created: JournalVoucherRecord = {
      ...voucher,
      id: `jv-${Date.now()}`,
      voucherNo: `JV-2026-00${nextSeq}`,
    };
    const updated = [...existing, created];
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent(CYCLE_EVENT));
    }

    const totalDr = created.lines.reduce((acc, l) => acc.plus(l.debitJod), new Decimal(0)).toFixed(3);
    SystemGovernanceService.recordAuditAction({
      actorName: 'المحاسب الرئيسي / محرك الترحيل الآلي',
      actorRole: 'قسم الحسابات العامة (GL)',
      moduleName: 'دفتر اليومية والأستاذ العام (ERP Accounting Cycle)',
      actionLabel: `ترحيل قيد يومية رقم (${created.voucherNo}) — مرجع (${created.sourceReference})`,
      oldValue: `عدد القيود المرحلة: ${existing.length}`,
      newValue: `${created.descriptionAr} | إجمالي القيد المتوازن: ${totalDr} د.أ`,
    });

    return created;
  }

  /**
   * 1. إصدار وترحيل فاتورة مبيعات (Sales Invoice)
   */
  public static postJoFotaraSalesInvoiceToLedger(params: {
    invoiceNumber: string;
    customerId?: string;
    customerName: string;
    netAmountJod: number;
    vatAmountJod: number;
    grossAmountJod: number;
    paymentMethod: 'CLIQ' | 'CASH' | 'CARD' | 'CREDIT_AR';
    estimatedCogsJod?: number;
  }): JournalVoucherRecord {
    const netDec = Decimal.max(0, new Decimal(params.netAmountJod || 0)).toDecimalPlaces(3);
    const vatDec = Decimal.max(0, new Decimal(params.vatAmountJod || 0)).toDecimalPlaces(3);
    const grossDec = netDec.plus(vatDec).toDecimalPlaces(3);
    const cogsDec =
      params.estimatedCogsJod !== undefined
        ? Decimal.max(0, new Decimal(params.estimatedCogsJod)).toDecimalPlaces(3)
        : netDec.times('0.55').toDecimalPlaces(3);

    const isCreditReceivable = params.paymentMethod === 'CARD' || params.paymentMethod === 'CREDIT_AR';
    const debitAccountCode = isCreditReceivable ? '1102' : '1101';
    const debitAccountName = isCreditReceivable
      ? 'ذمم العملاء التجارية (الأستاذ المساعد للعملاء AR)'
      : 'النقدية لدى البنوك المحلية والصندوق (البنك العربي / CliQ)';

    const lines: JournalEntryLine[] = [
      {
        accountCode: debitAccountCode,
        accountNameAr: debitAccountName,
        debitJod: grossDec.toNumber(),
        creditJod: 0,
        subLedgerPartyId: params.customerId || 'CUST-01',
        subLedgerPartyName: params.customerName,
      },
      {
        accountCode: vatDec.gt(0) ? '4101' : '4102',
        accountNameAr: vatDec.gt(0)
          ? 'إيرادات المبيعات والخدمات الخاضعة لضريبة المبيعات (JoFotara)'
          : 'إيرادات الصادرات والمناطق الحرة الخاضعة لنسبة الصفر (0%)',
        debitJod: 0,
        creditJod: netDec.toNumber(),
      },
    ];

    if (vatDec.gt(0)) {
      lines.push({
        accountCode: '2104',
        accountNameAr: 'أمانات الضريبة العامة على المبيعات المستحقة (ضريبة مخرجات ISTD)',
        debitJod: 0,
        creditJod: vatDec.toNumber(),
      });
    }

    if (cogsDec.gt(0)) {
      lines.push(
        {
          accountCode: '5101',
          accountNameAr: 'تكلفة البضاعة المباعة والخدمات المباشرة (COGS)',
          debitJod: cogsDec.toNumber(),
          creditJod: 0,
        },
        {
          accountCode: '1105',
          accountNameAr: 'مخزون البضاعة الجاهزة (تقييم WAC / IAS 2)',
          debitJod: 0,
          creditJod: cogsDec.toNumber(),
        }
      );
    }

    return this.addJournalVoucher({
      dateIso: new Date().toISOString().slice(0, 10),
      sourceType: 'JOFOTARA_SALES_INVOICE',
      sourceReference: params.invoiceNumber,
      descriptionAr: `فاتورة مبيعات إلكترونية (${params.invoiceNumber}) — ${params.customerName}`,
      lines,
    });
  }

  /**
   * 2. إصدار وترحيل إشعار دائن (Credit Note - مردودات مبيعات أو تخفيض قيمة فاتورة)
   */
  public static postCreditNoteToLedger(params: {
    creditNoteNumber: string;
    originalInvoiceNumber: string;
    customerId: string;
    customerName: string;
    netReturnJod: number;
    vatRatePercent: number;
    inventoryCostReturnedJod?: number;
    reasonAr: string;
  }): JournalVoucherRecord {
    const netDec = Decimal.max(0, new Decimal(params.netReturnJod || 0)).toDecimalPlaces(3);
    const vatDec = netDec.times(new Decimal(params.vatRatePercent || 0).div(100)).toDecimalPlaces(3);
    const grossDec = netDec.plus(vatDec).toDecimalPlaces(3);
    const cogsReturnDec =
      params.inventoryCostReturnedJod !== undefined
        ? Decimal.max(0, new Decimal(params.inventoryCostReturnedJod)).toDecimalPlaces(3)
        : netDec.times('0.50').toDecimalPlaces(3);

    const lines: JournalEntryLine[] = [
      {
        accountCode: '4101',
        accountNameAr: 'إيرادات المبيعات والخدمات الخاضعة لضريبة المبيعات (JoFotara)',
        debitJod: netDec.toNumber(),
        creditJod: 0,
      },
    ];

    if (vatDec.gt(0)) {
      lines.push({
        accountCode: '2104',
        accountNameAr: 'أمانات الضريبة العامة على المبيعات المستحقة (ضريبة مخرجات ISTD)',
        debitJod: vatDec.toNumber(),
        creditJod: 0,
      });
    }

    lines.push({
      accountCode: '1102',
      accountNameAr: 'ذمم العملاء التجارية (الأستاذ المساعد للعملاء AR)',
      debitJod: 0,
      creditJod: grossDec.toNumber(),
      subLedgerPartyId: params.customerId,
      subLedgerPartyName: params.customerName,
    });

    if (cogsReturnDec.gt(0)) {
      lines.push(
        {
          accountCode: '1105',
          accountNameAr: 'مخزون البضاعة الجاهزة (تقييم WAC / IAS 2)',
          debitJod: cogsReturnDec.toNumber(),
          creditJod: 0,
        },
        {
          accountCode: '5101',
          accountNameAr: 'تكلفة البضاعة المباعة والخدمات المباشرة (COGS)',
          debitJod: 0,
          creditJod: cogsReturnDec.toNumber(),
        }
      );
    }

    return this.addJournalVoucher({
      dateIso: new Date().toISOString().slice(0, 10),
      sourceType: 'CREDIT_NOTE',
      sourceReference: params.creditNoteNumber,
      descriptionAr: `إشعار دائن (${params.creditNoteNumber}) مرتبط بالفاتورة (${params.originalInvoiceNumber}) — ${params.customerName}: ${params.reasonAr}`,
      lines,
    });
  }

  /**
   * 3. إصدار وترحيل إشعار مدين (Debit Note - فروقات أسعار أو خدمات إضافية على العميل)
   */
  public static postDebitNoteToLedger(params: {
    debitNoteNumber: string;
    originalInvoiceNumber: string;
    customerId: string;
    customerName: string;
    netAdditionJod: number;
    vatRatePercent: number;
    reasonAr: string;
  }): JournalVoucherRecord {
    const netDec = Decimal.max(0, new Decimal(params.netAdditionJod || 0)).toDecimalPlaces(3);
    const vatDec = netDec.times(new Decimal(params.vatRatePercent || 0).div(100)).toDecimalPlaces(3);
    const grossDec = netDec.plus(vatDec).toDecimalPlaces(3);

    const lines: JournalEntryLine[] = [
      {
        accountCode: '1102',
        accountNameAr: 'ذمم العملاء التجارية (الأستاذ المساعد للعملاء AR)',
        debitJod: grossDec.toNumber(),
        creditJod: 0,
        subLedgerPartyId: params.customerId,
        subLedgerPartyName: params.customerName,
      },
      {
        accountCode: '4101',
        accountNameAr: 'إيرادات المبيعات والخدمات الخاضعة لضريبة المبيعات (JoFotara)',
        debitJod: 0,
        creditJod: netDec.toNumber(),
      },
    ];

    if (vatDec.gt(0)) {
      lines.push({
        accountCode: '2104',
        accountNameAr: 'أمانات الضريبة العامة على المبيعات المستحقة (ضريبة مخرجات ISTD)',
        debitJod: 0,
        creditJod: vatDec.toNumber(),
      });
    }

    return this.addJournalVoucher({
      dateIso: new Date().toISOString().slice(0, 10),
      sourceType: 'DEBIT_NOTE',
      sourceReference: params.debitNoteNumber,
      descriptionAr: `إشعار مدين (${params.debitNoteNumber}) على الفاتورة (${params.originalInvoiceNumber}) — ${params.customerName}: ${params.reasonAr}`,
      lines,
    });
  }

  /**
   * 4. إصدار وترحيل سند قبض (Receipt Voucher - تحصيل من عميل نقداً أو عبر CliQ)
   */
  public static postReceiptVoucherToLedger(params: {
    receiptNo: string;
    customerId: string;
    customerName: string;
    amountJod: number;
    channelLabelAr: string;
    notesAr: string;
  }): JournalVoucherRecord {
    const amtDec = Decimal.max(0, new Decimal(params.amountJod || 0)).toDecimalPlaces(3);

    return this.addJournalVoucher({
      dateIso: new Date().toISOString().slice(0, 10),
      sourceType: 'RECEIPT_VOUCHER',
      sourceReference: params.receiptNo,
      descriptionAr: `سند قبض (${params.receiptNo}) من العميل ${params.customerName} عبر (${params.channelLabelAr}) — ${params.notesAr}`,
      lines: [
        {
          accountCode: '1101',
          accountNameAr: 'النقدية لدى البنوك المحلية والصندوق (البنك العربي / CliQ)',
          debitJod: amtDec.toNumber(),
          creditJod: 0,
        },
        {
          accountCode: '1102',
          accountNameAr: 'ذمم العملاء التجارية (الأستاذ المساعد للعملاء AR)',
          debitJod: 0,
          creditJod: amtDec.toNumber(),
          subLedgerPartyId: params.customerId,
          subLedgerPartyName: params.customerName,
        },
      ],
    });
  }

  /**
   * 5. إصدار وترحيل سند صرف (Payment Voucher - سداد لمورد أو صرف مصاريف تشغيلية)
   */
  public static postPaymentVoucherToLedger(params: {
    paymentNo: string;
    targetType: 'VENDOR_AP' | 'OPERATING_EXPENSE';
    partyId?: string;
    partyName: string;
    amountJod: number;
    whtRatePercent?: number;
    notesAr: string;
  }): JournalVoucherRecord {
    const grossDec = Decimal.max(0, new Decimal(params.amountJod || 0)).toDecimalPlaces(3);
    const whtDec = grossDec.times(new Decimal(params.whtRatePercent || 0).div(100)).toDecimalPlaces(3);
    const netBankPaidDec = grossDec.minus(whtDec).toDecimalPlaces(3);

    const debitAccCode = params.targetType === 'VENDOR_AP' ? '2101' : '5202';
    const debitAccName =
      params.targetType === 'VENDOR_AP'
        ? 'ذمم الموردين التجارية (الأستاذ المساعد للموردين AP)'
        : 'مصاريف الإيجارات والمرافق والاتصالات والاستشارات';

    const lines: JournalEntryLine[] = [
      {
        accountCode: debitAccCode,
        accountNameAr: debitAccName,
        debitJod: grossDec.toNumber(),
        creditJod: 0,
        ...(params.targetType === 'VENDOR_AP'
          ? { subLedgerPartyId: params.partyId || 'VEND-01', subLedgerPartyName: params.partyName }
          : {}),
      },
      {
        accountCode: '1101',
        accountNameAr: 'النقدية لدى البنوك المحلية والصندوق (البنك العربي / CliQ)',
        debitJod: 0,
        creditJod: netBankPaidDec.toNumber(),
      },
    ];

    if (whtDec.gt(0)) {
      lines.push({
        accountCode: '2105',
        accountNameAr: 'أمانات ضريبة الدخل المقتطعة من المنبع (نموذج و/1)',
        debitJod: 0,
        creditJod: whtDec.toNumber(),
      });
    }

    return this.addJournalVoucher({
      dateIso: new Date().toISOString().slice(0, 10),
      sourceType: 'PAYMENT_VOUCHER',
      sourceReference: params.paymentNo,
      descriptionAr: `سند صرف (${params.paymentNo}) لأمر ${params.partyName} — ${params.notesAr}`,
      lines,
    });
  }

  public static resetToInitialCycle(): void {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_JOURNAL_VOUCHERS));
      window.localStorage.setItem(PARTIES_STORAGE_KEY, JSON.stringify(INITIAL_COMMERCIAL_PARTIES));
      window.dispatchEvent(new CustomEvent(CYCLE_EVENT));
    }
  }

  public static subscribe(callback: () => void): () => void {
    if (typeof window === 'undefined') return () => {};
    window.addEventListener(CYCLE_EVENT, callback);
    return () => window.removeEventListener(CYCLE_EVENT, callback);
  }

  public static computeFullFinancialCycle() {
    const vouchers = this.getJournalVouchers();
    const parties = this.getParties();
    const glMap = new Map<string, GeneralLedgerAccountReport>();

    STANDARD_JORDAN_COA.forEach((acc) => {
      const openDr = new Decimal(acc.openingDebitJod || 0);
      const openCr = new Decimal(acc.openingCreditJod || 0);
      const initialRunning =
        acc.normalSide === 'DEBIT' ? openDr.minus(openCr) : openCr.minus(openDr);

      glMap.set(acc.code, {
        account: acc,
        openingDebitJod: openDr.toFixed(3),
        openingCreditJod: openCr.toFixed(3),
        periodDebitJod: '0.000',
        periodCreditJod: '0.000',
        totalDebitJod: openDr.toFixed(3),
        totalCreditJod: openCr.toFixed(3),
        closingDebitBalanceJod: openDr.gt(openCr) ? openDr.minus(openCr).toFixed(3) : '0.000',
        closingCreditBalanceJod: openCr.gt(openDr) ? openCr.minus(openDr).toFixed(3) : '0.000',
        netSignedBalanceJod: initialRunning.toFixed(3),
        movements: [],
      });
    });

    // Sub-ledger map for Customer (AR) and Vendor (AP) Statements of Account
    const partyMap = new Map<string, SubLedgerPartySummary>();
    parties.forEach((p) => {
      partyMap.set(p.partyId, {
        partyId: p.partyId,
        partyName: p.partyName,
        partyType: p.partyType,
        taxNumber: p.taxNumber,
        phone: p.phone,
        cityAr: p.cityAr,
        openingBalanceJod: new Decimal(p.openingBalanceJod || 0).toFixed(3),
        totalDebitJod: '0.000',
        totalCreditJod: '0.000',
        closingBalanceJod: new Decimal(p.openingBalanceJod || 0).toFixed(3),
        movements: [],
      });
    });

    vouchers.forEach((v) => {
      v.lines.forEach((line) => {
        const rep = glMap.get(line.accountCode);
        if (rep) {
          const dr = new Decimal(line.debitJod || 0);
          const cr = new Decimal(line.creditJod || 0);
          const newPeriodDr = new Decimal(rep.periodDebitJod).plus(dr);
          const newPeriodCr = new Decimal(rep.periodCreditJod).plus(cr);
          const newTotDr = new Decimal(rep.openingDebitJod).plus(newPeriodDr);
          const newTotCr = new Decimal(rep.openingCreditJod).plus(newPeriodCr);

          const netNormal =
            rep.account.normalSide === 'DEBIT'
              ? newTotDr.minus(newTotCr)
              : newTotCr.minus(newTotDr);

          rep.periodDebitJod = newPeriodDr.toFixed(3);
          rep.periodCreditJod = newPeriodCr.toFixed(3);
          rep.totalDebitJod = newTotDr.toFixed(3);
          rep.totalCreditJod = newTotCr.toFixed(3);
          rep.closingDebitBalanceJod = newTotDr.gt(newTotCr) ? newTotDr.minus(newTotCr).toFixed(3) : '0.000';
          rep.closingCreditBalanceJod = newTotCr.gt(newTotDr) ? newTotCr.minus(newTotDr).toFixed(3) : '0.000';
          rep.netSignedBalanceJod = netNormal.toFixed(3);

          rep.movements.push({
            voucherNo: v.voucherNo,
            dateIso: v.dateIso,
            sourceReference: v.sourceReference,
            descriptionAr: v.descriptionAr,
            debitJod: dr.toFixed(3),
            creditJod: cr.toFixed(3),
            runningBalanceJod: netNormal.toFixed(3),
          });
        }

        // Update Customer (1102) or Vendor (2101) Statement of Account
        if ((line.accountCode === '1102' || line.accountCode === '2101') && line.subLedgerPartyId) {
          let pSummary = partyMap.get(line.subLedgerPartyId);
          if (!pSummary) {
            pSummary = {
              partyId: line.subLedgerPartyId,
              partyName: line.subLedgerPartyName || line.subLedgerPartyId,
              partyType: line.accountCode === '1102' ? 'CUSTOMER_AR' : 'VENDOR_AP',
              taxNumber: '170099000',
              phone: '0790000000',
              cityAr: 'عمّان',
              openingBalanceJod: '0.000',
              totalDebitJod: '0.000',
              totalCreditJod: '0.000',
              closingBalanceJod: '0.000',
              movements: [],
            };
            partyMap.set(line.subLedgerPartyId, pSummary);
          }

          const dr = new Decimal(line.debitJod || 0);
          const cr = new Decimal(line.creditJod || 0);
          const newDr = new Decimal(pSummary.totalDebitJod).plus(dr);
          const newCr = new Decimal(pSummary.totalCreditJod).plus(cr);
          const openBal = new Decimal(pSummary.openingBalanceJod);
          const closingBal =
            pSummary.partyType === 'CUSTOMER_AR'
              ? openBal.plus(newDr).minus(newCr)
              : openBal.plus(newCr).minus(newDr);

          pSummary.totalDebitJod = newDr.toFixed(3);
          pSummary.totalCreditJod = newCr.toFixed(3);
          pSummary.closingBalanceJod = closingBal.toFixed(3);
          pSummary.movements.push({
            voucherNo: v.voucherNo,
            dateIso: v.dateIso,
            docTypeLabelAr: DOC_TYPE_LABELS_AR[v.sourceType] || v.sourceType,
            sourceReference: v.sourceReference,
            descriptionAr: v.descriptionAr,
            debitJod: dr.toFixed(3),
            creditJod: cr.toFixed(3),
            runningBalanceJod: closingBal.toFixed(3),
          });
        }
      });
    });

    const generalLedgerList = Array.from(glMap.values());
    const subLedgers = Array.from(partyMap.values());

    // Trial Balance Totals
    let tbOpeningDr = new Decimal(0);
    let tbOpeningCr = new Decimal(0);
    let tbPeriodDr = new Decimal(0);
    let tbPeriodCr = new Decimal(0);
    let tbClosingDr = new Decimal(0);
    let tbClosingCr = new Decimal(0);

    generalLedgerList.forEach((g) => {
      tbOpeningDr = tbOpeningDr.plus(g.openingDebitJod);
      tbOpeningCr = tbOpeningCr.plus(g.openingCreditJod);
      tbPeriodDr = tbPeriodDr.plus(g.periodDebitJod);
      tbPeriodCr = tbPeriodCr.plus(g.periodCreditJod);
      tbClosingDr = tbClosingDr.plus(g.closingDebitBalanceJod);
      tbClosingCr = tbClosingCr.plus(g.closingCreditBalanceJod);
    });

    // Income Statement (قائمة الدخل)
    const rev4101 = new Decimal(glMap.get('4101')?.netSignedBalanceJod || 0);
    const rev4102 = new Decimal(glMap.get('4102')?.netSignedBalanceJod || 0);
    const totalRevenueDec = rev4101.plus(rev4102);

    const cogs5101 = new Decimal(glMap.get('5101')?.netSignedBalanceJod || 0);
    const grossProfitDec = totalRevenueDec.minus(cogs5101);

    const exp5201 = new Decimal(glMap.get('5201')?.netSignedBalanceJod || 0);
    const exp5202 = new Decimal(glMap.get('5202')?.netSignedBalanceJod || 0);
    const totalOperatingExpensesDec = exp5201.plus(exp5202);

    const operatingProfitEbitDec = grossProfitDec.minus(totalOperatingExpensesDec);
    // Corporate Tax 20% + National Contribution 1% = 21%
    const incomeTaxProvisionDec = operatingProfitEbitDec.gt(0)
      ? operatingProfitEbitDec.times('0.21').toDecimalPlaces(3)
      : new Decimal(0);
    const netIncomeAfterTaxDec = operatingProfitEbitDec.minus(incomeTaxProvisionDec);
    const statutoryReserve10PctDec = netIncomeAfterTaxDec.gt(0)
      ? netIncomeAfterTaxDec.times('0.10').toDecimalPlaces(3)
      : new Decimal(0);
    const retainedProfitForPeriodDec = netIncomeAfterTaxDec.minus(statutoryReserve10PctDec);

    // Balance Sheet (قائمة المركز المالي)
    const cash1101 = new Decimal(glMap.get('1101')?.netSignedBalanceJod || 0);
    const ar1102 = new Decimal(glMap.get('1102')?.netSignedBalanceJod || 0);
    const inv1105 = new Decimal(glMap.get('1105')?.netSignedBalanceJod || 0);
    const inputVat1108 = new Decimal(glMap.get('1108')?.netSignedBalanceJod || 0);
    const totalCurrentAssetsDec = cash1101.plus(ar1102).plus(inv1105).plus(inputVat1108);

    const fixedAssets1201 = new Decimal(glMap.get('1201')?.netSignedBalanceJod || 0);
    const totalAssetsDec = totalCurrentAssetsDec.plus(fixedAssets1201);

    const ap2101 = new Decimal(glMap.get('2101')?.netSignedBalanceJod || 0);
    const outputVat2104 = new Decimal(glMap.get('2104')?.netSignedBalanceJod || 0);
    const wht2105 = new Decimal(glMap.get('2105')?.netSignedBalanceJod || 0);
    const ssc2106 = new Decimal(glMap.get('2106')?.netSignedBalanceJod || 0);
    const totalCurrentLiabilitiesDec = ap2101
      .plus(outputVat2104)
      .plus(wht2105)
      .plus(ssc2106)
      .plus(incomeTaxProvisionDec);

    const longTermLoan2201 = new Decimal(glMap.get('2201')?.netSignedBalanceJod || 0);
    const totalLiabilitiesDec = totalCurrentLiabilitiesDec.plus(longTermLoan2201);

    const capital3101 = new Decimal(glMap.get('3101')?.netSignedBalanceJod || 0);
    const statRes3201 = new Decimal(glMap.get('3201')?.netSignedBalanceJod || 0).plus(statutoryReserve10PctDec);
    const retEarn3301 = new Decimal(glMap.get('3301')?.netSignedBalanceJod || 0).plus(retainedProfitForPeriodDec);
    const totalEquityDec = capital3101.plus(statRes3201).plus(retEarn3301);
    const totalLiabilitiesAndEquityDec = totalLiabilitiesDec.plus(totalEquityDec);

    // Cash Flow Statement
    const openingCashDec = new Decimal(glMap.get('1101')?.openingDebitJod || 85000);
    const closingCashDec = cash1101;
    const netCashChangeDec = closingCashDec.minus(openingCashDec);

    const netGstPayableToIstdDec = outputVat2104.minus(inputVat1108);

    return {
      vouchers,
      parties,
      generalLedgerList,
      subLedgers,
      trialBalanceSummary: {
        openingDebitJod: tbOpeningDr.toFixed(3),
        openingCreditJod: tbOpeningCr.toFixed(3),
        periodDebitJod: tbPeriodDr.toFixed(3),
        periodCreditJod: tbPeriodCr.toFixed(3),
        closingDebitJod: tbClosingDr.toFixed(3),
        closingCreditJod: tbClosingCr.toFixed(3),
        isBalanced: tbClosingDr.equals(tbClosingCr),
      },
      incomeStatement: {
        taxableSalesRevenueJod: rev4101.toFixed(3),
        zeroRatedExportRevenueJod: rev4102.toFixed(3),
        totalRevenueJod: totalRevenueDec.toFixed(3),
        costOfGoodsSoldJod: cogs5101.toFixed(3),
        grossProfitJod: grossProfitDec.toFixed(3),
        payrollAndSscExpenseJod: exp5201.toFixed(3),
        rentAndAdminExpenseJod: exp5202.toFixed(3),
        totalOperatingExpensesJod: totalOperatingExpensesDec.toFixed(3),
        operatingProfitEbitJod: operatingProfitEbitDec.toFixed(3),
        incomeTaxAndNatContrib21PctJod: incomeTaxProvisionDec.toFixed(3),
        netIncomeAfterTaxJod: netIncomeAfterTaxDec.toFixed(3),
        statutoryReserve10PctJod: statutoryReserve10PctDec.toFixed(3),
        retainedProfitForPeriodJod: retainedProfitForPeriodDec.toFixed(3),
      },
      balanceSheet: {
        cashAndBanksJod: cash1101.toFixed(3),
        accountsReceivableJod: ar1102.toFixed(3),
        inventoryJod: inv1105.toFixed(3),
        recoverableInputVatJod: inputVat1108.toFixed(3),
        totalCurrentAssetsJod: totalCurrentAssetsDec.toFixed(3),
        netFixedAssetsJod: fixedAssets1201.toFixed(3),
        totalAssetsJod: totalAssetsDec.toFixed(3),
        accountsPayableJod: ap2101.toFixed(3),
        outputVatPayableJod: outputVat2104.toFixed(3),
        withholdingTaxPayableJod: wht2105.toFixed(3),
        sscPayableJod: ssc2106.toFixed(3),
        incomeTaxProvisionPayableJod: incomeTaxProvisionDec.toFixed(3),
        totalCurrentLiabilitiesJod: totalCurrentLiabilitiesDec.toFixed(3),
        longTermLoansJod: longTermLoan2201.toFixed(3),
        totalLiabilitiesJod: totalLiabilitiesDec.toFixed(3),
        paidInCapitalJod: capital3101.toFixed(3),
        statutoryReserveCumulativeJod: statRes3201.toFixed(3),
        retainedEarningsCumulativeJod: retEarn3301.toFixed(3),
        totalEquityJod: totalEquityDec.toFixed(3),
        totalLiabilitiesAndEquityJod: totalLiabilitiesAndEquityDec.toFixed(3),
        isBalanced: totalAssetsDec.equals(totalLiabilitiesAndEquityDec),
      },
      cashFlowStatement: {
        openingCashBalanceJod: openingCashDec.toFixed(3),
        netOperatingCashFlowJod: netCashChangeDec.toFixed(3),
        netInvestingCashFlowJod: '0.000',
        netFinancingCashFlowJod: '0.000',
        netChangeInCashJod: netCashChangeDec.toFixed(3),
        closingCashBalanceJod: closingCashDec.toFixed(3),
      },
      taxIntegrationSummary: {
        outputVatOnSalesJod: outputVat2104.toFixed(3),
        inputVatOnPurchasesJod: inputVat1108.toFixed(3),
        netGstPayableToIstdJod: netGstPayableToIstdDec.toFixed(3),
        whtPayableFormW1Jod: wht2105.toFixed(3),
        sscMonthlyPayableJod: ssc2106.toFixed(3),
        estimatedCorporateIncomeTaxJod: incomeTaxProvisionDec.toFixed(3),
      },
    };
  }
}
