import Decimal from 'decimal.js';
import { AccountingCycleStore } from '../accounting/AccountingCycleStore';

Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP });

export interface CompanyEntityRecord {
  id: number;
  user_id: number;
  company_name: string;
  trade_name: string;
  registration_number: string;
  national_number: string;
  tax_number: string;
  legal_type: string;
  industry: string;
  established_date: string;
  phone: string;
  email: string;
  address: string;
  status: 'active' | 'suspended';
}

/**
 * 1. جدول الباعة / الموردين (vendors) — مرتبط بجدول companies عبر المفتاح الخارجي company_id
 */
export interface VendorTableRecord {
  id: number;
  company_id: number; // FOREIGN KEY (company_id) REFERENCES companies(id)
  vendor_code: string;
  vendor_type: 'Company' | 'Individual' | 'International';
  vendor_name: string;
  trade_name: string;
  tax_number: string;
  national_number: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  payment_terms: number;
  withholding_tax_rate: number; // 0% | 5% | 10%
  ap_gl_account_code: string; // '2101'
  opening_balance_jod: number;
  status: 'active' | 'inactive';
  created_at: string;
}

/**
 * 2. جدول المنتجات والخدمات (products_services) — مرتبط بجدول companies و vendors والدليل المحاسبي
 */
export interface ProductServiceTableRecord {
  id: number;
  company_id: number; // FOREIGN KEY (company_id) REFERENCES companies(id)
  default_vendor_id?: number; // FOREIGN KEY (default_vendor_id) REFERENCES vendors(id)
  sku_code: string;
  item_type: 'Product' | 'Service';
  item_name: string;
  description: string;
  unit_price: number;
  cost_price: number;
  tax_rate: number; // 16 | 4 | 0
  jofotara_classification_code: string;
  revenue_gl_account_code: string; // '4101' or '4102'
  cogs_gl_account_code: string; // '5101'
  inventory_gl_account_code: string; // '1105'
  stock_quantity: number;
  status: 'active' | 'archived';
  created_at: string;
}

/**
 * 3. جدول عروض الأسعار / يقتبس (quotes) — مرتبط بجدول companies و customers و products_services
 */
export interface QuoteTableRecord {
  id: number;
  company_id: number; // FOREIGN KEY (company_id) REFERENCES companies(id)
  customer_id: string; // FOREIGN KEY (customer_id) REFERENCES customers(id)
  customer_name: string;
  product_service_id: number; // FOREIGN KEY (product_service_id) REFERENCES products_services(id)
  quote_number: string;
  issue_date: string;
  valid_until: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  status: 'Draft' | 'Sent' | 'Accepted' | 'ConvertedToInvoice' | 'Expired';
  converted_invoice_number?: string;
  notes: string;
  created_at: string;
}

/**
 * 4. جدول العقود والاتفاقيات (contracts) — مرتبط بجدول companies و customers/vendors و quotes
 */
export interface ContractTableRecord {
  id: number;
  company_id: number; // FOREIGN KEY (company_id) REFERENCES companies(id)
  party_type: 'Customer' | 'Vendor';
  party_id: string; // FOREIGN KEY REFERENCES customers(id) OR vendors(id)
  party_name: string;
  source_quote_id?: number; // FOREIGN KEY (source_quote_id) REFERENCES quotes(id)
  contract_number: string;
  contract_title: string;
  start_date: string;
  end_date: string;
  contract_value: number;
  billed_amount: number;
  remaining_amount: number;
  billing_cycle: 'Monthly' | 'Quarterly' | 'Annual' | 'Milestone';
  stamp_duty_paid: number; // رسوم طوابع الواردات الأردنية (0.003 أو 0.006)
  status: 'Active' | 'Completed' | 'Terminated';
  created_at: string;
}

export const DEFAULT_COMPANY_RECORD: CompanyEntityRecord = {
  id: 1,
  user_id: 1,
  company_name: 'شركة الرواد للحلول الرقمية والأنظمة المالية ذ.م.م',
  trade_name: 'BizJo Enterprise Solutions',
  registration_number: '200184992',
  national_number: '2001849920',
  tax_number: '17489201',
  legal_type: 'شركة ذات مسؤولية محدودة (ذ.م.م)',
  industry: 'تقنية المعلومات والأنظمة المحاسبية',
  established_date: '2021-04-12',
  phone: '065500000',
  email: 'one497303@gmail.com',
  address: 'المملكة الأردنية الهاشمية، عمّان - الشميساني',
  status: 'active',
};

const INITIAL_VENDORS: VendorTableRecord[] = [
  {
    id: 1,
    company_id: 1,
    vendor_code: 'VEND-01',
    vendor_type: 'Company',
    vendor_name: 'شركة الخوادم والحوسبة الأردنية ذ.م.م',
    trade_name: 'Jordan Cloud Servers Co.',
    tax_number: '988123456',
    national_number: '2001554433',
    email: 'billing@jocloud.jo',
    phone: '0791122334',
    city: 'عمّان - شارع مكة',
    address: 'مجمع الأعمال التقني، الطابق الرابع',
    payment_terms: 30,
    withholding_tax_rate: 5,
    ap_gl_account_code: '2101',
    opening_balance_jod: 28500,
    status: 'active',
    created_at: '2026-01-05',
  },
  {
    id: 2,
    company_id: 1,
    vendor_code: 'VEND-02',
    vendor_type: 'Company',
    vendor_name: 'مؤسسة الشرق الأوسط للتجهيزات الصناعية والمكتبية',
    trade_name: 'ME Industrial Supplies',
    tax_number: '944556677',
    national_number: '2001998877',
    email: 'sales@mesupplies.jo',
    phone: '0785566778',
    city: 'الزرقاء - المنطقة الحرة',
    address: 'الشارع الرئيسي - بوابة رقم 2',
    payment_terms: 45,
    withholding_tax_rate: 0,
    ap_gl_account_code: '2101',
    opening_balance_jod: 12400,
    status: 'active',
    created_at: '2026-01-12',
  },
  {
    id: 3,
    company_id: 1,
    vendor_code: 'VEND-03',
    vendor_type: 'Individual',
    vendor_name: 'مكتب المستشار القانوني والمدقق الخارجي المعتمد',
    trade_name: 'مكتب الاستشارات القانونية والضريبية',
    tax_number: '911223344',
    national_number: '9811022334',
    email: 'legal@auditfirm.jo',
    phone: '0779988776',
    city: 'عمّان - العبدلي',
    address: 'بوليفارد العبدلي - برج الأعمال',
    payment_terms: 15,
    withholding_tax_rate: 5,
    ap_gl_account_code: '2101',
    opening_balance_jod: 3200,
    status: 'active',
    created_at: '2026-02-01',
  },
];

const INITIAL_PRODUCTS_SERVICES: ProductServiceTableRecord[] = [
  {
    id: 1,
    company_id: 1,
    default_vendor_id: 1,
    sku_code: 'PRD-POS-001',
    item_type: 'Product',
    item_name: 'منظومة أجهزة نقاط البيع المتكاملة مع JoFotara',
    description: 'جهاز كاشير شاشة لمس + طابعة فواتير حرارية QR + قارئ باركود',
    unit_price: 850,
    cost_price: 490,
    tax_rate: 16,
    jofotara_classification_code: 'JO-8471-POS',
    revenue_gl_account_code: '4101',
    cogs_gl_account_code: '5101',
    inventory_gl_account_code: '1105',
    stock_quantity: 45,
    status: 'active',
    created_at: '2026-01-10',
  },
  {
    id: 2,
    company_id: 1,
    default_vendor_id: 1,
    sku_code: 'SRV-ERP-002',
    item_type: 'Service',
    item_name: 'رخصة نظام BizJo السحابي السنوية للشركات (Enterprise)',
    description: 'اشتراك سنوي شامل المحاسبة والفوترة الإلكترونية والامتثال الضريبي',
    unit_price: 1200,
    cost_price: 250,
    tax_rate: 16,
    jofotara_classification_code: 'JO-6201-SAAS',
    revenue_gl_account_code: '4101',
    cogs_gl_account_code: '5101',
    inventory_gl_account_code: '1105',
    stock_quantity: 999,
    status: 'active',
    created_at: '2026-01-15',
  },
  {
    id: 3,
    company_id: 1,
    default_vendor_id: 3,
    sku_code: 'SRV-TAX-003',
    item_type: 'Service',
    item_name: 'خدمة التأهيل والربط الضريبي وإعداد ملف SAF-T الأردني',
    description: 'مراجعة الحسابات وتدقيق الفواتير وإعداد ملف الفحص الضريبي القياسي',
    unit_price: 650,
    cost_price: 180,
    tax_rate: 16,
    jofotara_classification_code: 'JO-6920-TAX',
    revenue_gl_account_code: '4101',
    cogs_gl_account_code: '5101',
    inventory_gl_account_code: '1105',
    stock_quantity: 999,
    status: 'active',
    created_at: '2026-02-01',
  },
];

const INITIAL_QUOTES: QuoteTableRecord[] = [
  {
    id: 1,
    company_id: 1,
    customer_id: 'CUST-01',
    customer_name: 'شركة الاتصالات المتقدمة ذ.م.م',
    product_service_id: 1,
    quote_number: 'QT-2026-001',
    issue_date: '2026-10-25',
    valid_until: '2026-11-25',
    subtotal: 8500,
    tax_rate: 16,
    tax_amount: 1360,
    discount_amount: 0,
    total_amount: 9860,
    status: 'Accepted',
    notes: 'توريد وتركيب 10 أنظمة نقاط بيع مرتبطة بنظام الفوترة الوطني JoFotara',
    created_at: '2026-10-25',
  },
  {
    id: 2,
    company_id: 1,
    customer_id: 'CUST-02',
    customer_name: 'مجموعة الفوسفات والصناعات التحويلية المساهمة',
    product_service_id: 2,
    quote_number: 'QT-2026-002',
    issue_date: '2026-11-01',
    valid_until: '2026-12-01',
    subtotal: 12000,
    tax_rate: 16,
    tax_amount: 1920,
    discount_amount: 0,
    total_amount: 13920,
    status: 'Sent',
    notes: 'ترخيص منظومة BizJo ERP لـ 10 فروع ومستودعات مع التدريب الميداني',
    created_at: '2026-11-01',
  },
];

const INITIAL_CONTRACTS: ContractTableRecord[] = [
  {
    id: 1,
    company_id: 1,
    party_type: 'Customer',
    party_id: 'CUST-01',
    party_name: 'شركة الاتصالات المتقدمة ذ.م.م',
    source_quote_id: 1,
    contract_number: 'CNT-2026-101',
    contract_title: 'عقد توريد وصيانة أنظمة الفوترة الإلكترونية والمحاسبة السنوي',
    start_date: '2026-01-01',
    end_date: '2026-12-31',
    contract_value: 36000,
    billed_amount: 24000,
    remaining_amount: 12000,
    billing_cycle: 'Quarterly',
    stamp_duty_paid: 108, // 0.003 رسوم طوابع واردات
    status: 'Active',
    created_at: '2026-01-01',
  },
  {
    id: 2,
    company_id: 1,
    party_type: 'Vendor',
    party_id: 'VEND-01',
    party_name: 'شركة الخوادم والحوسبة الأردنية ذ.م.م',
    contract_number: 'CNT-2026-202',
    contract_title: 'اتفاقية استضافة الخوادم السحابية والنسخ الاحتياطي المشفر',
    start_date: '2026-01-01',
    end_date: '2026-12-31',
    contract_value: 18000,
    billed_amount: 13500,
    remaining_amount: 4500,
    billing_cycle: 'Quarterly',
    stamp_duty_paid: 54,
    status: 'Active',
    created_at: '2026-01-01',
  },
];

const STORAGE_KEYS = {
  VENDORS: 'BIZJO_DB_VENDORS_V1',
  PRODUCTS: 'BIZJO_DB_PRODUCTS_SERVICES_V1',
  QUOTES: 'BIZJO_DB_QUOTES_V1',
  CONTRACTS: 'BIZJO_DB_CONTRACTS_V1',
};

export class BizJoRelationalSchemaStore {
  public static getCompany(): CompanyEntityRecord {
    return DEFAULT_COMPANY_RECORD;
  }

  public static getVendors(): VendorTableRecord[] {
    if (typeof window === 'undefined') return INITIAL_VENDORS;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEYS.VENDORS);
      return raw ? (JSON.parse(raw) as VendorTableRecord[]) : INITIAL_VENDORS;
    } catch {
      return INITIAL_VENDORS;
    }
  }

  public static addVendor(input: {
    vendor_name: string;
    tax_number: string;
    city: string;
    phone: string;
    payment_terms: number;
    withholding_tax_rate: number;
    opening_balance_jod: number;
  }): VendorTableRecord {
    const existing = this.getVendors();
    const nextId = existing.length + 1;
    const created: VendorTableRecord = {
      id: nextId,
      company_id: DEFAULT_COMPANY_RECORD.id,
      vendor_code: `VEND-0${nextId + 2}`,
      vendor_type: 'Company',
      vendor_name: input.vendor_name,
      trade_name: input.vendor_name,
      tax_number: input.tax_number || '977112233',
      national_number: '2001776655',
      email: 'vendor@company.jo',
      phone: input.phone || '0790000000',
      city: input.city || 'عمّان',
      address: input.city || 'عمّان',
      payment_terms: input.payment_terms || 30,
      withholding_tax_rate: input.withholding_tax_rate || 0,
      ap_gl_account_code: '2101',
      opening_balance_jod: input.opening_balance_jod || 0,
      status: 'active',
      created_at: new Date().toISOString().slice(0, 10),
    };
    const updated = [created, ...existing];
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(updated));
    }
    // Also register in AccountingCycleStore sub-ledger
    AccountingCycleStore.addParty({
      partyType: 'VENDOR_AP',
      partyName: created.vendor_name,
      taxNumber: created.tax_number,
      phone: created.phone,
      cityAr: created.city,
      openingBalanceJod: created.opening_balance_jod,
    });
    return created;
  }

  public static getProductsServices(): ProductServiceTableRecord[] {
    if (typeof window === 'undefined') return INITIAL_PRODUCTS_SERVICES;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return raw ? (JSON.parse(raw) as ProductServiceTableRecord[]) : INITIAL_PRODUCTS_SERVICES;
    } catch {
      return INITIAL_PRODUCTS_SERVICES;
    }
  }

  public static addProductService(input: {
    item_type: 'Product' | 'Service';
    item_name: string;
    sku_code: string;
    unit_price: number;
    cost_price: number;
    tax_rate: number;
    default_vendor_id?: number;
  }): ProductServiceTableRecord {
    const existing = this.getProductsServices();
    const nextId = existing.length + 1;
    const created: ProductServiceTableRecord = {
      id: nextId,
      company_id: DEFAULT_COMPANY_RECORD.id,
      default_vendor_id: input.default_vendor_id || 1,
      sku_code: input.sku_code || `SKU-2026-0${nextId}`,
      item_type: input.item_type,
      item_name: input.item_name,
      description: `${input.item_type === 'Product' ? 'منتج سلعي' : 'خدمة أعمال'} مرتبط بحساب الإيرادات (4101) والتكلفة (5101)`,
      unit_price: input.unit_price,
      cost_price: input.cost_price,
      tax_rate: input.tax_rate,
      jofotara_classification_code: input.item_type === 'Product' ? 'JO-8471-PRD' : 'JO-6201-SRV',
      revenue_gl_account_code: input.tax_rate > 0 ? '4101' : '4102',
      cogs_gl_account_code: '5101',
      inventory_gl_account_code: '1105',
      stock_quantity: input.item_type === 'Product' ? 25 : 999,
      status: 'active',
      created_at: new Date().toISOString().slice(0, 10),
    };
    const updated = [created, ...existing];
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
    }
    return created;
  }

  public static getQuotes(): QuoteTableRecord[] {
    if (typeof window === 'undefined') return INITIAL_QUOTES;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEYS.QUOTES);
      return raw ? (JSON.parse(raw) as QuoteTableRecord[]) : INITIAL_QUOTES;
    } catch {
      return INITIAL_QUOTES;
    }
  }

  public static addQuote(input: {
    customer_id: string;
    customer_name: string;
    product_service_id: number;
    subtotal: number;
    tax_rate: number;
    notes: string;
  }): QuoteTableRecord {
    const existing = this.getQuotes();
    const nextId = existing.length + 1;
    const subDec = new Decimal(input.subtotal || 0).toDecimalPlaces(3);
    const taxDec = subDec.times(new Decimal(input.tax_rate || 0).div(100)).toDecimalPlaces(3);
    const totDec = subDec.plus(taxDec).toDecimalPlaces(3);

    const created: QuoteTableRecord = {
      id: nextId,
      company_id: DEFAULT_COMPANY_RECORD.id,
      customer_id: input.customer_id || 'CUST-01',
      customer_name: input.customer_name,
      product_service_id: input.product_service_id || 1,
      quote_number: `QT-2026-00${nextId}`,
      issue_date: new Date().toISOString().slice(0, 10),
      valid_until: '2026-12-31',
      subtotal: subDec.toNumber(),
      tax_rate: input.tax_rate,
      tax_amount: taxDec.toNumber(),
      discount_amount: 0,
      total_amount: totDec.toNumber(),
      status: 'Sent',
      notes: input.notes,
      created_at: new Date().toISOString().slice(0, 10),
    };
    const updated = [created, ...existing];
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(updated));
    }
    return created;
  }

  /**
   * تحويل عرض السعر (quote) مباشرة إلى فاتورة ضريبية وترحيلها للدورة المحاسبية الكاملة:
   * عرض سعر (quotes) ➔ فاتورة (invoices) ➔ قيد يومية (JV) ➔ الأستاذ العام ➔ ميزان المراجعة ➔ القوائم المالية ➔ الامتثال الضريبي
   */
  public static convertQuoteToInvoiceAndLedger(quoteId: number): {
    invoiceNumber: string;
    voucherNo: string;
  } | null {
    const quotes = this.getQuotes();
    const products = this.getProductsServices();
    const target = quotes.find((q) => q.id === quoteId);
    if (!target) return null;

    const linkedProduct = products.find((p) => p.id === target.product_service_id);
    const estimatedCogs = linkedProduct
      ? new Decimal(target.subtotal).times(0.45).toDecimalPlaces(3).toNumber()
      : new Decimal(target.subtotal).times(0.5).toDecimalPlaces(3).toNumber();

    const invoiceNumber = `INV-QT-${target.quote_number}`;
    const voucher = AccountingCycleStore.postJoFotaraSalesInvoiceToLedger({
      invoiceNumber,
      customerId: target.customer_id,
      customerName: target.customer_name,
      netAmountJod: target.subtotal,
      vatAmountJod: target.tax_amount,
      grossAmountJod: target.total_amount,
      paymentMethod: 'CREDIT_AR',
      estimatedCogsJod: estimatedCogs,
    });

    const updated = quotes.map((q) =>
      q.id === quoteId
        ? { ...q, status: 'ConvertedToInvoice' as const, converted_invoice_number: invoiceNumber }
        : q
    );
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(updated));
    }

    return {
      invoiceNumber,
      voucherNo: voucher.voucherNo,
    };
  }

  public static getContracts(): ContractTableRecord[] {
    if (typeof window === 'undefined') return INITIAL_CONTRACTS;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEYS.CONTRACTS);
      return raw ? (JSON.parse(raw) as ContractTableRecord[]) : INITIAL_CONTRACTS;
    } catch {
      return INITIAL_CONTRACTS;
    }
  }

  public static addContract(input: {
    party_type: 'Customer' | 'Vendor';
    party_id: string;
    party_name: string;
    contract_title: string;
    contract_value: number;
    billing_cycle: 'Monthly' | 'Quarterly' | 'Annual' | 'Milestone';
    source_quote_id?: number;
  }): ContractTableRecord {
    const existing = this.getContracts();
    const nextId = existing.length + 1;
    const valDec = new Decimal(input.contract_value || 0).toDecimalPlaces(3);
    const stampDuty = valDec.times('0.003').toDecimalPlaces(3).toNumber();

    const created: ContractTableRecord = {
      id: nextId,
      company_id: DEFAULT_COMPANY_RECORD.id,
      party_type: input.party_type,
      party_id: input.party_id,
      party_name: input.party_name,
      source_quote_id: input.source_quote_id,
      contract_number: `CNT-2026-${100 + nextId}`,
      contract_title: input.contract_title,
      start_date: new Date().toISOString().slice(0, 10),
      end_date: '2027-12-31',
      contract_value: valDec.toNumber(),
      billed_amount: 0,
      remaining_amount: valDec.toNumber(),
      billing_cycle: input.billing_cycle,
      stamp_duty_paid: stampDuty,
      status: 'Active',
      created_at: new Date().toISOString().slice(0, 10),
    };
    const updated = [created, ...existing];
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(updated));
    }
    return created;
  }

  /**
   * فوترة دفعة استحقاق من عقد (contracts) وترحيلها مباشرة للدورة المحاسبية الكاملة
   */
  public static billContractMilestoneToLedger(contractId: number, milestoneNetJod: number): {
    docNo: string;
    voucherNo: string;
  } | null {
    const contracts = this.getContracts();
    const target = contracts.find((c) => c.id === contractId);
    if (!target) return null;

    const netDec = new Decimal(milestoneNetJod || 3000).toDecimalPlaces(3);
    const vatDec = netDec.times('0.16').toDecimalPlaces(3);
    const grossDec = netDec.plus(vatDec).toDecimalPlaces(3);

    let voucherNo = '';
    let docNo = '';

    if (target.party_type === 'Customer') {
      docNo = `INV-${target.contract_number}-${Math.floor(10 + Math.random() * 89)}`;
      const v = AccountingCycleStore.postJoFotaraSalesInvoiceToLedger({
        invoiceNumber: docNo,
        customerId: target.party_id,
        customerName: target.party_name,
        netAmountJod: netDec.toNumber(),
        vatAmountJod: vatDec.toNumber(),
        grossAmountJod: grossDec.toNumber(),
        paymentMethod: 'CREDIT_AR',
        estimatedCogsJod: netDec.times('0.40').toDecimalPlaces(3).toNumber(),
      });
      voucherNo = v.voucherNo;
    } else {
      docNo = `PV-${target.contract_number}-${Math.floor(10 + Math.random() * 89)}`;
      const v = AccountingCycleStore.postPaymentVoucherToLedger({
        paymentNo: docNo,
        targetType: 'VENDOR_AP',
        partyId: target.party_id,
        partyName: target.party_name,
        amountJod: netDec.toNumber(),
        whtRatePercent: 5,
        notesAr: `دفعة عقد مورد (${target.contract_title})`,
      });
      voucherNo = v.voucherNo;
    }

    const updated = contracts.map((c) => {
      if (c.id !== contractId) return c;
      const newBilled = new Decimal(c.billed_amount).plus(netDec).toNumber();
      const newRem = Decimal.max(0, new Decimal(c.contract_value).minus(newBilled)).toNumber();
      return { ...c, billed_amount: newBilled, remaining_amount: newRem };
    });

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(updated));
    }

    return { docNo, voucherNo };
  }
}
