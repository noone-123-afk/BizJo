import React, { useState } from 'react';
import {
  Bell,
  HeartPulse,
  ShieldAlert,
  FileCheck2,
  Kanban,
  TrendingUp,
  Landmark,
  BarChart4,
  CalendarClock,
  Activity,
  Sparkles,
  Database,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  Upload,
  Plus,
  Mail,
  Calendar,
  ArrowRight,
  Copy,
  Check,
  Search,
  Building2,
  Layers,
} from 'lucide-react';
import { AccountingCycleStore } from '../../services/accounting/AccountingCycleStore';
import {
  BizJoRelationalSchemaStore,
  DEFAULT_COMPANY_RECORD,
  VendorTableRecord,
  ProductServiceTableRecord,
  QuoteTableRecord,
  ContractTableRecord,
} from '../../services/db/BizJoRelationalSchemaStore';
import { exportArabicReportToPdf } from '../../utils/pdfExport';
import { SidebarItemId } from './SimpleHomeDashboard';

export type PhaseTwoTabId =
  | 'MVP_FLOW'
  | 'STAGE_1_NOTIFICATIONS'
  | 'STAGE_2_HEALTH_SCORE'
  | 'STAGE_3_RISK_CENTER'
  | 'STAGE_4_SMART_DOCS'
  | 'STAGE_5_KANBAN_TASKS'
  | 'STAGE_6_YOY_ANALYTICS'
  | 'STAGE_7_INVESTOR_BANK'
  | 'STAGE_8_SECTOR_BENCHMARKS'
  | 'STAGE_9_TAX_CALENDAR'
  | 'STAGE_10_DATA_HEALTH'
  | 'STAGE_11_AI_ADVISOR'
  | 'ERD_SQL_SCHEMA';

interface StrategicPhaseTwoWorkspaceProps {
  initialStage?: PhaseTwoTabId;
  onNavigateSidebar?: (itemId: SidebarItemId) => void;
}

interface SmartNotificationItem {
  id: string;
  companyId: number;
  type: 'TAX' | 'DOCUMENT' | 'FINANCIAL';
  typeLabelAr: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  message: string;
  status: 'UNREAD' | 'READ';
  dueDate: string;
  createdAt: string;
}

interface KanbanTaskItem {
  id: string;
  category: 'ضريبية' | 'مالية' | 'إدارية' | 'قانونية';
  title: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  priority: 'عالية جداً' | 'عالية' | 'متوسطة';
  status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'OVERDUE';
}

interface SmartDocRecord {
  id: string;
  docTypeCode:
    | 'commercial_registration'
    | 'municipality_license'
    | 'tax_certificate'
    | 'social_security'
    | 'authorization'
    | 'id_card';
  docTypeAr: string;
  docName: string;
  issueDate: string;
  expiryDate: string;
  status: 'VALID' | 'EXPIRING_SOON' | 'EXPIRED';
  autoReminder: boolean;
}

interface TaxCalendarEvent {
  id: string;
  monthName: string;
  monthNum: number;
  category: 'الإقرارات' | 'الضمان' | 'الرخص' | 'الضرائب';
  title: string;
  dueDate: string;
  priority: 'عالية جداً' | 'عالية' | 'متوسطة';
  status: 'مجدول' | 'مستحق قريباً' | 'مكتمل';
}

const INITIAL_NOTIFICATIONS: SmartNotificationItem[] = [
  // تنبيهات ضريبية
  {
    id: 'NOTIF-101',
    companyId: 1,
    type: 'TAX',
    typeLabelAr: 'تنبيهات ضريبية',
    severity: 'CRITICAL',
    title: 'تبقى 10 أيام على الإقرار الضريبي.',
    message: 'يستحق تقديم إقرار الضريبة العامة على المبيعات للفترة الضريبية الحالية وتوريد الرصيد المستحق لدائرة ضريبة الدخل والمبيعات (ISTD).',
    status: 'UNREAD',
    dueDate: '2026-11-20',
    createdAt: '2026-11-10',
  },
  {
    id: 'NOTIF-102',
    companyId: 1,
    type: 'TAX',
    typeLabelAr: 'تنبيهات ضريبية',
    severity: 'WARNING',
    title: 'الإقرار السنوي مستحق خلال 30 يوماً.',
    message: 'يرجى استكمال مطابقة ميزان المراجعة والقوائم المالية المدققة تمهيداً لرفع إقرار ضريبة الدخل السنوي.',
    status: 'UNREAD',
    dueDate: '2026-12-10',
    createdAt: '2026-11-10',
  },
  {
    id: 'NOTIF-103',
    companyId: 1,
    type: 'TAX',
    typeLabelAr: 'تنبيهات ضريبية',
    severity: 'WARNING',
    title: 'يوجد فاتورة تحتاج للمراجعة الضريبية.',
    message: 'الفاتورة رقم INV-2026-108 تحتاج التحقق من الرقم الضريبي للمورد ورمز QR الخاص بمنظومة JoFotara.',
    status: 'UNREAD',
    dueDate: '2026-11-14',
    createdAt: '2026-11-10',
  },
  // تنبيهات الوثائق
  {
    id: 'NOTIF-201',
    companyId: 1,
    type: 'DOCUMENT',
    typeLabelAr: 'تنبيهات الوثائق',
    severity: 'WARNING',
    title: 'تنتهي رخصة المهن خلال 20 يوماً.',
    message: 'رخصة مهن المقر الرئيسي الصادرة عن أمانة عمّان الكبرى تستحق التجديد قبل تاريخ 2026-11-30.',
    status: 'UNREAD',
    dueDate: '2026-11-30',
    createdAt: '2026-11-10',
  },
  {
    id: 'NOTIF-202',
    companyId: 1,
    type: 'DOCUMENT',
    typeLabelAr: 'تنبيهات الوثائق',
    severity: 'INFO',
    title: 'تنتهي شهادة التسجيل الضريبي خلال 60 يوماً.',
    message: 'تذكير استباقي لتحديث شهادة براءة الذمة والتسجيل الضريبي السنوي للمنشأة.',
    status: 'READ',
    dueDate: '2027-01-10',
    createdAt: '2026-11-10',
  },
  {
    id: 'NOTIF-203',
    companyId: 1,
    type: 'DOCUMENT',
    typeLabelAr: 'تنبيهات الوثائق',
    severity: 'CRITICAL',
    title: 'انتهى تفويض المستخدم أحمد.',
    message: 'انتهت صلاحية كتاب التفويض الضريبي والبنكي للمستخدم (أحمد) — يرجى تجديد التفويض أو إيقاف الصلاحية.',
    status: 'UNREAD',
    dueDate: '2026-11-05',
    createdAt: '2026-11-10',
  },
  // تنبيهات مالية
  {
    id: 'NOTIF-301',
    companyId: 1,
    type: 'FINANCIAL',
    typeLabelAr: 'تنبيهات مالية',
    severity: 'WARNING',
    title: 'انخفضت السيولة بنسبة 15%.',
    message: 'انخفض رصيد النقدية السائلة مقارنة بالمتوسط الشهري نتيجة سداد دفعات الموردين والرواتب.',
    status: 'UNREAD',
    dueDate: '2026-11-12',
    createdAt: '2026-11-10',
  },
  {
    id: 'NOTIF-302',
    companyId: 1,
    type: 'FINANCIAL',
    typeLabelAr: 'تنبيهات مالية',
    severity: 'WARNING',
    title: 'ارتفعت المصروفات بنسبة 22%.',
    message: 'سجلت المصاريف التشغيلية والإدارية ارتفاعاً بنسبة 22% هذا الشهر مقارنة بالشهر السابق.',
    status: 'UNREAD',
    dueDate: '2026-11-15',
    createdAt: '2026-11-10',
  },
  {
    id: 'NOTIF-303',
    companyId: 1,
    type: 'FINANCIAL',
    typeLabelAr: 'تنبيهات مالية',
    severity: 'CRITICAL',
    title: 'يوجد عميل متأخر بالسداد أكثر من 90 يوماً.',
    message: 'رصيد مستحق على عميل تجاري تجاوز فترة الائتمان المسموحة (90 يوماً) ويحتاج متابعة تحصيل فورية.',
    status: 'UNREAD',
    dueDate: '2026-11-11',
    createdAt: '2026-11-10',
  },
];

const INITIAL_KANBAN_TASKS: KanbanTaskItem[] = [
  {
    id: 'TSK-01',
    category: 'ضريبية',
    title: 'مراجعة وإرسال إقرار ضريبة المبيعات الدوري',
    description: 'مطابقة ضريبة المخرجات (2104) مع ضريبة المدخلات (1108) ورفع الإقرار عبر بوابة ضريبة الدخل والمبيعات.',
    assignedTo: 'أ. سامر المجالي (JCPA)',
    dueDate: '2026-11-20',
    priority: 'عالية جداً',
    status: 'TODO',
  },
  {
    id: 'TSK-02',
    category: 'قانونية',
    title: 'تجديد كتاب تفويض المستخدم أحمد ورخصة المهن',
    description: 'تحديث كتاب المفوضين بالتوقيع لدى مراقبة الشركات وتجديد رخصة المهن في أمانة عمّان.',
    assignedTo: 'أ. ريم العبداللات',
    dueDate: '2026-11-15',
    priority: 'عالية جداً',
    status: 'OVERDUE',
  },
  {
    id: 'TSK-03',
    category: 'مالية',
    title: 'تحصيل الذمم المتأخرة لأكثر من 90 يوماً',
    description: 'التواصل مع قسم المالية لدى العملاء المتأخرين وإرسال كشف حساب رسمي وسند مطالبة.',
    assignedTo: 'أ. دانا الزعبي',
    dueDate: '2026-11-18',
    priority: 'عالية',
    status: 'IN_PROGRESS',
  },
  {
    id: 'TSK-04',
    category: 'إدارية',
    title: 'اعتماد مسير الرواتب وكشف الضمان الاجتماعي الشهري',
    description: 'مراجعة اقتطاعات الضمان الاجتماعي (21.75%) وتحويل صافي الرواتب عبر CliQ.',
    assignedTo: 'م. طارق الكيلاني (CFO)',
    dueDate: '2026-11-28',
    priority: 'متوسطة',
    status: 'DONE',
  },
];

const INITIAL_SMART_DOCS: SmartDocRecord[] = [
  {
    id: 'SDOC-1',
    docTypeCode: 'commercial_registration',
    docTypeAr: 'السجل التجاري',
    docName: 'شهادة تسجيل شركة ذات مسؤولية محدودة - مراقبة الشركات',
    issueDate: '2024-01-10',
    expiryDate: '2027-01-10',
    status: 'VALID',
    autoReminder: true,
  },
  {
    id: 'SDOC-2',
    docTypeCode: 'municipality_license',
    docTypeAr: 'الرخصة',
    docName: 'رخصة مهن أمانة عمّان الكبرى - الشميساني',
    issueDate: '2025-11-30',
    expiryDate: '2026-11-30',
    status: 'EXPIRING_SOON',
    autoReminder: true,
  },
  {
    id: 'SDOC-3',
    docTypeCode: 'tax_certificate',
    docTypeAr: 'شهادة الضريبة',
    docName: 'شهادة التسجيل في ضريبة الدخل والمبيعات (ISTD)',
    issueDate: '2026-01-10',
    expiryDate: '2027-01-10',
    status: 'EXPIRING_SOON',
    autoReminder: true,
  },
  {
    id: 'SDOC-4',
    docTypeCode: 'social_security',
    docTypeAr: 'شهادة الضمان',
    docName: 'شهادة التزام وبراءة ذمة - المؤسسة العامة للضمان الاجتماعي',
    issueDate: '2026-03-01',
    expiryDate: '2027-03-01',
    status: 'VALID',
    autoReminder: true,
  },
  {
    id: 'SDOC-5',
    docTypeCode: 'authorization',
    docTypeAr: 'التفويضات',
    docName: 'تفويض المستخدم أحمد (التمثيل الضريبي والبنكي)',
    issueDate: '2025-11-05',
    expiryDate: '2026-11-05',
    status: 'EXPIRED',
    autoReminder: true,
  },
];

const TAX_CALENDAR_EVENTS: TaxCalendarEvent[] = [
  {
    id: 'CAL-JAN-1',
    monthName: 'يناير (كانون الثاني)',
    monthNum: 1,
    category: 'الرخص',
    title: 'تجديد رخصة المهن السنوية لدى أمانة عمّان والبلديات دون غرامات',
    dueDate: '2026-01-31',
    priority: 'عالية',
    status: 'مكتمل',
  },
  {
    id: 'CAL-JAN-2',
    monthName: 'يناير (كانون الثاني)',
    monthNum: 1,
    category: 'الإقرارات',
    title: 'تقديم إقرار ضريبة المبيعات عن فترة (نوفمبر - ديسمبر)',
    dueDate: '2026-01-31',
    priority: 'عالية جداً',
    status: 'مكتمل',
  },
  {
    id: 'CAL-FEB-1',
    monthName: 'فبراير (شباط)',
    monthNum: 2,
    category: 'الضمان',
    title: 'توريد اشتراكات الضمان الاجتماعي الشهرية (21.75%) وتحديث الأجور السنوية',
    dueDate: '2026-02-15',
    priority: 'عالية جداً',
    status: 'مكتمل',
  },
  {
    id: 'CAL-FEB-2',
    monthName: 'فبراير (شباط)',
    monthNum: 2,
    category: 'الضرائب',
    title: 'توريد اقتطاعات ضريبة الدخل من المنبع (نموذج و/1) عن الشهر السابق',
    dueDate: '2026-02-28',
    priority: 'عالية',
    status: 'مكتمل',
  },
  {
    id: 'CAL-MAR-1',
    monthName: 'مارس (آذار)',
    monthNum: 3,
    category: 'الإقرارات',
    title: 'الموعد القانوني النهائي لتقديم إقرار ضريبة الدخل السنوي للشركات والمنشآت',
    dueDate: '2026-03-31',
    priority: 'عالية جداً',
    status: 'مستحق قريباً',
  },
  {
    id: 'CAL-MAR-2',
    monthName: 'مارس (آذار)',
    monthNum: 3,
    category: 'الإقرارات',
    title: 'تقديم إقرار ضريبة المبيعات الدوري عن فترة (يناير - فبراير)',
    dueDate: '2026-03-31',
    priority: 'عالية جداً',
    status: 'مستحق قريباً',
  },
];

const SECTOR_BENCHMARKS_DATA: Record<
  'مطاعم' | 'تجارة' | 'خدمات' | 'صناعة' | 'تقنية',
  {
    avgProfitMarginPct: number;
    companyProfitMarginPct: number;
    avgWageJod: number;
    companyWageJod: number;
    avgLiquidityRatio: number;
    companyLiquidityRatio: number;
    avgExpenseRatioPct: number;
    companyExpenseRatioPct: number;
    percentileRank: number;
  }
> = {
  تقنية: {
    avgProfitMarginPct: 19.5,
    companyProfitMarginPct: 26.4,
    avgWageJod: 1150,
    companyWageJod: 1420,
    avgLiquidityRatio: 1.35,
    companyLiquidityRatio: 1.82,
    avgExpenseRatioPct: 38.0,
    companyExpenseRatioPct: 31.5,
    percentileRank: 72,
  },
  تجارة: {
    avgProfitMarginPct: 14.0,
    companyProfitMarginPct: 18.5,
    avgWageJod: 680,
    companyWageJod: 790,
    avgLiquidityRatio: 1.25,
    companyLiquidityRatio: 1.55,
    avgExpenseRatioPct: 24.0,
    companyExpenseRatioPct: 20.2,
    percentileRank: 74,
  },
  خدمات: {
    avgProfitMarginPct: 21.0,
    companyProfitMarginPct: 25.8,
    avgWageJod: 850,
    companyWageJod: 960,
    avgLiquidityRatio: 1.4,
    companyLiquidityRatio: 1.75,
    avgExpenseRatioPct: 34.0,
    companyExpenseRatioPct: 29.0,
    percentileRank: 72,
  },
  صناعة: {
    avgProfitMarginPct: 16.2,
    companyProfitMarginPct: 21.0,
    avgWageJod: 740,
    companyWageJod: 860,
    avgLiquidityRatio: 1.3,
    companyLiquidityRatio: 1.62,
    avgExpenseRatioPct: 28.5,
    companyExpenseRatioPct: 24.1,
    percentileRank: 76,
  },
  مطاعم: {
    avgProfitMarginPct: 12.5,
    companyProfitMarginPct: 17.2,
    avgWageJod: 520,
    companyWageJod: 610,
    avgLiquidityRatio: 1.15,
    companyLiquidityRatio: 1.48,
    avgExpenseRatioPct: 42.0,
    companyExpenseRatioPct: 36.4,
    percentileRank: 72,
  },
};

export const FULL_21_TABLES_SQL_DDL = `-- ============================================================================
-- مخطط قاعدة البيانات الشامل لمنصة BizJo للأعمال والمحاسبة والامتثال الضريبي
-- يشمل 21 جدولاً مترابطاً (ERD كامل من MVP حتى ERP المتكامل)
-- مع ربط جداول (vendors, products_services, quotes, contracts) بجدول (companies)
-- عبر المفاتيح الخارجية (FOREIGN KEYS) لتمهيد الطريق للدورة المحاسبية الكاملة
-- ============================================================================

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(30),
  password_hash TEXT NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  status VARCHAR(20) DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE companies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  trade_name VARCHAR(255),
  registration_number VARCHAR(100),
  national_number VARCHAR(100),
  tax_number VARCHAR(100),
  legal_type VARCHAR(100),
  industry VARCHAR(150),
  established_date DATE,
  phone VARCHAR(50),
  email VARCHAR(255),
  website VARCHAR(255),
  address TEXT,
  status VARCHAR(30) DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE company_owners (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  full_name VARCHAR(255),
  national_id VARCHAR(100),
  nationality VARCHAR(100),
  birth_date DATE,
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  ownership_percentage DECIMAL(5,2),
  legal_capacity VARCHAR(100),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE company_authorized_persons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  full_name VARCHAR(255),
  national_id VARCHAR(100),
  position VARCHAR(150),
  phone VARCHAR(50),
  email VARCHAR(255),
  authorization_number VARCHAR(100),
  authorization_start DATE,
  authorization_end DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE tax_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  taxpayer_number VARCHAR(100),
  tax_registration_number VARCHAR(100),
  tax_status VARCHAR(100),
  filing_frequency VARCHAR(50),
  sales_tax_registered BOOLEAN,
  sales_tax_rate DECIMAL(5,2),
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE company_documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  document_type VARCHAR(100), -- commercial_registration | tax_certificate | municipality_license | social_security | authorization | id_card | other
  document_name VARCHAR(255),
  file_url TEXT,
  issue_date DATE,
  expiry_date DATE,
  status VARCHAR(50),
  uploaded_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  customer_type VARCHAR(50), -- Individual | Company | Government | NonProfit
  customer_name VARCHAR(255),
  trade_name VARCHAR(255),
  tax_number VARCHAR(100),
  national_number VARCHAR(100),
  registration_number VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(50),
  mobile VARCHAR(50),
  country VARCHAR(100) DEFAULT 'الأردن',
  city VARCHAR(100),
  address TEXT,
  credit_limit DECIMAL(18,3),
  payment_terms INTEGER,
  status VARCHAR(50),
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- ============================================================================
-- الجداول الأربعة الأساسية التمهيدية للدورة المحاسبية الكاملة:
-- 1. الباعة / الموردون (vendors)
-- 2. المنتجات والخدمات (products_services)
-- 3. عروض الأسعار / يقتبس (quotes)
-- 4. العقود والاتفاقيات (contracts)
-- مرتبطة بجدول الشركات (companies) عبر المفاتيح الخارجية (FOREIGN KEYS)
-- ============================================================================

CREATE TABLE vendors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  vendor_code VARCHAR(50) UNIQUE,
  vendor_type VARCHAR(50) DEFAULT 'Company', -- Company | Individual | International
  vendor_name VARCHAR(255) NOT NULL,
  trade_name VARCHAR(255),
  tax_number VARCHAR(100),
  national_number VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(50),
  city VARCHAR(100),
  address TEXT,
  payment_terms INTEGER DEFAULT 30,
  withholding_tax_rate DECIMAL(5,2) DEFAULT 0.00,
  ap_gl_account_code VARCHAR(20) DEFAULT '2101', -- حساب ذمم الموردين في الأستاذ العام
  opening_balance_jod DECIMAL(18,3) DEFAULT 0.000,
  status VARCHAR(50) DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_vendors_company FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE products_services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  default_vendor_id INTEGER,
  sku_code VARCHAR(100) UNIQUE,
  item_type VARCHAR(50) NOT NULL, -- Product | Service
  item_name VARCHAR(255) NOT NULL,
  description TEXT,
  unit_price DECIMAL(18,3) NOT NULL,
  cost_price DECIMAL(18,3) DEFAULT 0.000,
  tax_rate DECIMAL(6,2) DEFAULT 16.00,
  jofotara_classification_code VARCHAR(100),
  revenue_gl_account_code VARCHAR(20) DEFAULT '4101', -- حساب إيرادات المبيعات في الأستاذ العام
  cogs_gl_account_code VARCHAR(20) DEFAULT '5101', -- حساب تكلفة البضاعة المباعة
  inventory_gl_account_code VARCHAR(20) DEFAULT '1105', -- حساب المخزون السلعي
  stock_quantity DECIMAL(18,3) DEFAULT 0.000,
  status VARCHAR(30) DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_services_company FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE,
  CONSTRAINT fk_products_services_vendor FOREIGN KEY(default_vendor_id) REFERENCES vendors(id) ON DELETE SET NULL
);

CREATE TABLE quotes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  customer_id INTEGER NOT NULL,
  product_service_id INTEGER,
  quote_number VARCHAR(100) UNIQUE NOT NULL,
  issue_date DATE NOT NULL,
  valid_until DATE,
  subtotal DECIMAL(18,3) NOT NULL,
  tax_rate DECIMAL(6,2) DEFAULT 16.00,
  tax_amount DECIMAL(18,3) NOT NULL,
  discount_amount DECIMAL(18,3) DEFAULT 0.000,
  total_amount DECIMAL(18,3) NOT NULL,
  status VARCHAR(50) DEFAULT 'Sent', -- Draft | Sent | Accepted | ConvertedToInvoice | Expired
  converted_invoice_number VARCHAR(100),
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_quotes_company FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE,
  CONSTRAINT fk_quotes_customer FOREIGN KEY(customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
  CONSTRAINT fk_quotes_product_service FOREIGN KEY(product_service_id) REFERENCES products_services(id) ON DELETE SET NULL
);

CREATE TABLE contracts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  party_type VARCHAR(50) NOT NULL, -- Customer | Vendor
  customer_id INTEGER,
  vendor_id INTEGER,
  source_quote_id INTEGER,
  contract_number VARCHAR(100) UNIQUE NOT NULL,
  contract_title VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  contract_value DECIMAL(18,3) NOT NULL,
  billed_amount DECIMAL(18,3) DEFAULT 0.000,
  remaining_amount DECIMAL(18,3) NOT NULL,
  billing_cycle VARCHAR(50) DEFAULT 'Quarterly', -- Monthly | Quarterly | Annual | Milestone
  stamp_duty_paid DECIMAL(18,3) DEFAULT 0.000, -- رسوم طوابع الواردات الأردنية
  status VARCHAR(50) DEFAULT 'Active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_contracts_company FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE,
  CONSTRAINT fk_contracts_customer FOREIGN KEY(customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  CONSTRAINT fk_contracts_vendor FOREIGN KEY(vendor_id) REFERENCES vendors(id) ON DELETE SET NULL,
  CONSTRAINT fk_contracts_quote FOREIGN KEY(source_quote_id) REFERENCES quotes(id) ON DELETE SET NULL
);

CREATE TABLE invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  customer_id INTEGER NOT NULL,
  invoice_number VARCHAR(100) UNIQUE,
  invoice_type VARCHAR(50), -- Sales | Credit Note | Debit Note | Proforma
  invoice_date DATE,
  due_date DATE,
  subtotal DECIMAL(18,3),
  tax_amount DECIMAL(18,3),
  discount_amount DECIMAL(18,3),
  total_amount DECIMAL(18,3),
  paid_amount DECIMAL(18,3) DEFAULT 0,
  remaining_amount DECIMAL(18,3),
  currency VARCHAR(10) DEFAULT 'JOD',
  status VARCHAR(50), -- Draft | Issued | PartiallyPaid | Paid | Overdue | Cancelled
  notes TEXT,
  created_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(company_id) REFERENCES companies(id),
  FOREIGN KEY(customer_id) REFERENCES customers(id)
);

CREATE TABLE invoice_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id INTEGER NOT NULL,
  item_name VARCHAR(255),
  description TEXT,
  quantity DECIMAL(18,3),
  unit_price DECIMAL(18,3),
  discount DECIMAL(18,3),
  tax_rate DECIMAL(6,2),
  tax_amount DECIMAL(18,3),
  line_total DECIMAL(18,3),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(invoice_id) REFERENCES invoices(id)
);

CREATE TABLE payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER,
  customer_id INTEGER,
  invoice_id INTEGER,
  payment_date DATE,
  payment_method VARCHAR(50), -- Cash | Bank | Cheque | Card | Transfer
  amount DECIMAL(18,3),
  reference_number VARCHAR(100),
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customer_statements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER,
  reference_type VARCHAR(50),
  reference_id INTEGER,
  debit DECIMAL(18,3),
  credit DECIMAL(18,3),
  balance DECIMAL(18,3),
  transaction_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER,
  assigned_to INTEGER,
  title VARCHAR(255),
  description TEXT,
  priority VARCHAR(30),
  status VARCHAR(30),
  due_date DATE,
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER,
  type VARCHAR(50),
  severity VARCHAR(50),
  title VARCHAR(255),
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  due_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE compliance_calendar (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER,
  title VARCHAR(255),
  event_type VARCHAR(100),
  due_date DATE,
  priority VARCHAR(50),
  status VARCHAR(50),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE risks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER,
  risk_type VARCHAR(50), -- tax | liquidity | collection | legal | operational
  risk_level VARCHAR(50),
  risk_reason TEXT,
  recommendation TEXT,
  status VARCHAR(50),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE business_health_scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER,
  liquidity_score DECIMAL(5,2),
  profitability_score DECIMAL(5,2),
  debt_score DECIMAL(5,2),
  cashflow_score DECIMAL(5,2),
  compliance_score DECIMAL(5,2),
  collection_score DECIMAL(5,2),
  total_score DECIMAL(5,2),
  grade VARCHAR(20),
  snapshot_date DATE
);

CREATE TABLE audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER,
  user_id INTEGER,
  action VARCHAR(255),
  table_name VARCHAR(100),
  record_id INTEGER,
  old_value TEXT,
  new_value TEXT,
  ip_address VARCHAR(100),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);`;

export default function StrategicPhaseTwoWorkspace({
  initialStage = 'MVP_FLOW',
  onNavigateSidebar,
}: StrategicPhaseTwoWorkspaceProps) {
  const [activeStage, setActiveStage] = useState<PhaseTwoTabId>(initialStage);
  const [notifications, setNotifications] = useState<SmartNotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [notifFilter, setNotifFilter] = useState<'ALL' | 'TAX' | 'DOCUMENT' | 'FINANCIAL'>('ALL');
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState<boolean>(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Stage 2: Business Health Score (Default 91/100 as specified)
  const [appliedOptimizations, setAppliedOptimizations] = useState<{
    collectReceivables: boolean;
    reduceDebt: boolean;
    boostMargin: boolean;
  }>({
    collectReceivables: false,
    reduceDebt: false,
    boostMargin: false,
  });

  // Stage 4: Smart Documents
  const [smartDocs, setSmartDocs] = useState<SmartDocRecord[]>(INITIAL_SMART_DOCS);
  const [newDocName, setNewDocName] = useState<string>('');
  const [newDocType, setNewDocType] = useState<SmartDocRecord['docTypeCode']>('commercial_registration');
  const [newDocExpiry, setNewDocExpiry] = useState<string>('2027-06-30');

  // Stage 5: Kanban Tasks
  const [tasks, setTasks] = useState<KanbanTaskItem[]>(INITIAL_KANBAN_TASKS);
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [newTaskCategory, setNewTaskCategory] = useState<KanbanTaskItem['category']>('ضريبية');
  const [newTaskAssignee, setNewTaskAssignee] = useState<string>('أ. سامر المجالي');
  const [newTaskDue, setNewTaskDue] = useState<string>('2026-11-25');

  // Stage 6: YoY Comparison Mode
  const [yoyPair, setYoyPair] = useState<'2026_VS_2025' | '2025_VS_2024'>('2026_VS_2025');

  // Stage 8: Jordan Sector Benchmarks
  const [selectedSector, setSelectedSector] = useState<'مطاعم' | 'تجارة' | 'خدمات' | 'صناعة' | 'تقنية'>('تقنية');

  // Stage 11: Golden Feature AI Financial & Tax Advisor
  const [selectedAdvisorScenario, setSelectedAdvisorScenario] = useState<'PROFIT_DROP' | 'FINANCIAL_HEALTH' | 'LIVE_LEDGER'>('PROFIT_DROP');
  const [customAdvisorQuestion, setCustomAdvisorQuestion] = useState<string>('');

  // SQL Copy state & Relational 4-Table Explorer State
  const [sqlCopied, setSqlCopied] = useState<boolean>(false);
  const [schemaEntityTab, setSchemaEntityTab] = useState<'vendors' | 'products_services' | 'quotes' | 'contracts'>('vendors');
  const [vendorsList, setVendorsList] = useState<VendorTableRecord[]>(() => BizJoRelationalSchemaStore.getVendors());
  const [productsList, setProductsList] = useState<ProductServiceTableRecord[]>(() => BizJoRelationalSchemaStore.getProductsServices());
  const [quotesList, setQuotesList] = useState<QuoteTableRecord[]>(() => BizJoRelationalSchemaStore.getQuotes());
  const [contractsList, setContractsList] = useState<ContractTableRecord[]>(() => BizJoRelationalSchemaStore.getContracts());

  // Quick-add form states for the 4 tables
  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorTaxNo, setNewVendorTaxNo] = useState('');
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('450');
  const [newQuoteCustomer, setNewQuoteCustomer] = useState('شركة الفجر للاتصالات ذ.م.م');
  const [newQuoteQty, setNewQuoteQty] = useState('2');
  const [newContractTitle, setNewContractTitle] = useState('');
  const [newContractValue, setNewContractValue] = useState('12000');

  const refreshRelationalLists = () => {
    setVendorsList(BizJoRelationalSchemaStore.getVendors());
    setProductsList(BizJoRelationalSchemaStore.getProductsServices());
    setQuotesList(BizJoRelationalSchemaStore.getQuotes());
    setContractsList(BizJoRelationalSchemaStore.getContracts());
  };

  const cycleData = AccountingCycleStore.computeFullFinancialCycle();

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 5000);
  };

  // Compute dynamic Business Health Score (Base = 91/100)
  const baseScores = {
    liquidity: 19, // out of 20
    profitability: 18, // out of 20
    debt: 13, // out of 15
    cashflow: 14, // out of 15
    compliance: 14, // out of 15
    collection: 13, // out of 15
  };
  const bonusPoints =
    (appliedOptimizations.collectReceivables ? 4 : 0) +
    (appliedOptimizations.reduceDebt ? 7 : 0) +
    (appliedOptimizations.boostMargin ? 3 : 0);
  const totalHealthScore = Math.min(100, 91 + bonusPoints);

  const getHealthGrade = (score: number) => {
    if (score >= 90) return { label: '90-100 ممتاز', color: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300' };
    if (score >= 80) return { label: '80-89 جيد جداً', color: 'text-sky-400', badge: 'bg-sky-500/20 text-sky-300' };
    if (score >= 70) return { label: '70-79 جيد', color: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-300' };
    if (score >= 60) return { label: '60-69 يحتاج تحسين', color: 'text-orange-400', badge: 'bg-orange-500/20 text-orange-300' };
    return { label: 'أقل من 60 خطر', color: 'text-rose-400', badge: 'bg-rose-500/20 text-rose-300' };
  };

  const healthGrade = getHealthGrade(totalHealthScore);

  const handleUploadSmartDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim()) return;
    const typeMap: Record<SmartDocRecord['docTypeCode'], string> = {
      commercial_registration: 'السجل التجاري',
      municipality_license: 'الرخصة',
      tax_certificate: 'شهادة الضريبة',
      social_security: 'شهادة الضمان',
      authorization: 'التفويضات',
      id_card: 'الهوية الشخصية',
    };
    const created: SmartDocRecord = {
      id: `SDOC-${smartDocs.length + 1}`,
      docTypeCode: newDocType,
      docTypeAr: typeMap[newDocType],
      docName: newDocName.trim(),
      issueDate: new Date().toISOString().slice(0, 10),
      expiryDate: newDocExpiry,
      status: 'VALID',
      autoReminder: true,
    };
    setSmartDocs([created, ...smartDocs]);
    setNewDocName('');
    triggerToast(`تم رفع وأرشفة الوثيقة (${created.docName}) وتفعيل التذكير التلقائي قبل الانتهاء.`);
  };

  const handleAddKanbanTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const created: KanbanTaskItem = {
      id: `TSK-0${tasks.length + 1}`,
      category: newTaskCategory,
      title: newTaskTitle.trim(),
      description: `مهمة ${newTaskCategory} مجدولة ضمن نظام الامتثال والعمليات.`,
      assignedTo: newTaskAssignee,
      dueDate: newTaskDue,
      priority: 'عالية',
      status: 'TODO',
    };
    setTasks([created, ...tasks]);
    setNewTaskTitle('');
    triggerToast(`تمت إضافة المهمة (${created.title}) إلى عمود To Do في لوحة المهام.`);
  };

  const moveKanbanTask = (taskId: string, nextStatus: KanbanTaskItem['status']) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t)));
    triggerToast('تم تحديث حالة المهمة في لوحة Kanban بنجاح.');
  };

  const handleExportIcsCalendar = (target: 'OUTLOOK' | 'GOOGLE') => {
    const icsLines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Jordan ERP Tax & Compliance Calendar//AR',
      ...TAX_CALENDAR_EVENTS.flatMap((ev) => [
        'BEGIN:VEVENT',
        `UID:${ev.id}@jordan-erp.local`,
        `DTSTAMP:20261110T090000Z`,
        `DTSTART;VALUE=DATE:${ev.dueDate.replace(/-/g, '')}`,
        `SUMMARY:[${ev.category}] ${ev.title}`,
        `DESCRIPTION:الأولوية: ${ev.priority} - الحالة: ${ev.status}`,
        'END:VEVENT',
      ]),
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsLines], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = target === 'OUTLOOK' ? 'Jordan_Tax_Calendar_Outlook.ics' : 'Jordan_Tax_Calendar_Google.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerToast(
      target === 'OUTLOOK'
        ? 'تم تصدير ملف التقويم الضريبي بصيغة Outlook (.ics) بنجاح.'
        : 'تم تصدير ملف التقويم الضريبي المتوافق مع Google Calendar (.ics) بنجاح.'
    );
  };

  const handleDownloadSqlSchema = () => {
    const blob = new Blob([FULL_21_TABLES_SQL_DDL], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jordan_erp_saas_21_tables_schema.sql';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerToast('تم تنزيل ملف هيكل قاعدة البيانات الكامل (21 جدول SQL DDL) بنجاح.');
  };

  const stageTabs: Array<{ id: PhaseTwoTabId; label: string; badge?: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'MVP_FLOW', label: 'مسار إطلاق الـ MVP (7 خطوات)', badge: 'إطلاق سريع', icon: Layers },
    { id: 'STAGE_1_NOTIFICATIONS', label: '1. التنبيهات الذكية', badge: `${notifications.filter((n) => n.status === 'UNREAD').length}`, icon: Bell },
    { id: 'STAGE_2_HEALTH_SCORE', label: '2. صحة الأعمال', badge: `${totalHealthScore}/100`, icon: HeartPulse },
    { id: 'STAGE_3_RISK_CENTER', label: '3. مركز المخاطر', badge: '3 مؤشرات', icon: ShieldAlert },
    { id: 'STAGE_4_SMART_DOCS', label: '4. الوثائق الذكية', icon: FileCheck2 },
    { id: 'STAGE_5_KANBAN_TASKS', label: '5. نظام المهام (Kanban)', icon: Kanban },
    { id: 'STAGE_6_YOY_ANALYTICS', label: '6. المقارنات السنوية', badge: '2026 vs 2025', icon: TrendingUp },
    { id: 'STAGE_7_INVESTOR_BANK', label: '7. المستثمر والبنوك', badge: 'Bank Pack', icon: Landmark },
    { id: 'STAGE_8_SECTOR_BENCHMARKS', label: '8. مؤشرات القطاع الأردني', badge: '72%', icon: BarChart4 },
    { id: 'STAGE_9_TAX_CALENDAR', label: '9. التقويم الضريبي الذكي', icon: CalendarClock },
    { id: 'STAGE_10_DATA_HEALTH', label: '10. فحص صحة البيانات', badge: '93%', icon: Activity },
    { id: 'STAGE_11_AI_ADVISOR', label: '11. المستشار الذكي (الميزة الذهبية)', icon: Sparkles },
    { id: 'ERD_SQL_SCHEMA', label: 'مخطط ERD وقاعدة البيانات (21 جدول)', badge: 'SQL', icon: Database },
  ];

  return (
    <div className="space-y-6">
      {toastMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 flex items-center gap-3 text-xs font-bold">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Executive Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>المرحلة التنفيذية الثانية + MVP الإطلاق التجاري + معمارية ERP المتكاملة</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold">
              منصة ERP وأعمال وامتثال ضريبي وذكاء مالي للشركات الأردنية
            </h1>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              تجمع هذه الوحدة بين مسار الـ MVP السريع (الشركة ➔ الملف ➔ الوثائق ➔ المخاطر ➔ التنبيهات ➔ التقويم ➔ درجة صحة الشركة 91/100) والمراحل الـ 11 المتقدمة ومخطط قاعدة البيانات الكامل (21 جدول SQL).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="px-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-center">
              <div className="text-[10px] text-slate-400 font-bold">Business Health</div>
              <div className="text-lg font-black font-mono text-emerald-400">{totalHealthScore}/100</div>
            </div>
            <div className="px-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-center">
              <div className="text-[10px] text-slate-400 font-bold">System Health</div>
              <div className="text-lg font-black font-mono text-sky-400">93%</div>
            </div>
            <div className="px-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-center">
              <div className="text-[10px] text-slate-400 font-bold">تفوق القطاع</div>
              <div className="text-lg font-black font-mono text-amber-400">72%</div>
            </div>
          </div>
        </div>

        {/* Navigation Pills for the 11 Stages + MVP + ERD */}
        <div className="flex flex-wrap items-center gap-1.5 mt-5 pt-4 border-t border-slate-800">
          {stageTabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeStage === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveStage(tab.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  active
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                      active ? 'bg-white/20 text-white' : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ==========================================================================
          TAB 0: MVP LAUNCH FLOW & EXECUTIVE SUMMARY DASHBOARD (الأولويات 1-7)
         ========================================================================== */}
      {activeStage === 'MVP_FLOW' && (
        <div className="space-y-6">
          {/* 7-Step MVP Flow Ribbon */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  مسار إطلاق الـ MVP النهائي (8 - 12 أسبوعاً — 6 Sprints)
                </span>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                  شركة ➔ إدخال الملف ➔ رفع الوثائق ➔ معرفة المخاطر ➔ التنبيهات ➔ التقويم ➔ درجة صحة الشركة
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-xs">
              {[
                { step: 1, title: 'شركة', sub: 'Companies & Users', action: () => onNavigateSidebar?.('tax-profile') },
                { step: 2, title: 'إدخال الملف', sub: 'Owners & Signatories', action: () => onNavigateSidebar?.('tax-profile') },
                { step: 3, title: 'رفع الوثائق', sub: 'Smart Documents', action: () => setActiveStage('STAGE_4_SMART_DOCS') },
                { step: 4, title: 'معرفة المخاطر', sub: 'Risk Center', action: () => setActiveStage('STAGE_3_RISK_CENTER') },
                { step: 5, title: 'التنبيهات', sub: 'Notification Center', action: () => setActiveStage('STAGE_1_NOTIFICATIONS') },
                { step: 6, title: 'التقويم', sub: 'Tax Calendar', action: () => setActiveStage('STAGE_9_TAX_CALENDAR') },
                { step: 7, title: 'درجة صحة الشركة', sub: 'Score: 91/100', action: () => setActiveStage('STAGE_2_HEALTH_SCORE') },
              ].map((item) => (
                <button
                  key={item.step}
                  onClick={item.action}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-500/10 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 text-right transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center font-mono">
                      {item.step}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 rotate-180" />
                  </div>
                  <div className="font-extrabold text-slate-900 dark:text-white">{item.title}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{item.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Priority 2 Mandatory Professional MVP Dashboard (5 Core Blocks Only) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 1. صحة الشركة */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">1. صحة الشركة (Business Health Score)</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                    {healthGrade.label}
                  </span>
                </div>
                <div className="flex items-baseline gap-3 my-3">
                  <span className="text-4xl font-black font-mono text-slate-900 dark:text-white">{totalHealthScore}/100</span>
                  <span className="text-xs text-slate-500">نقطة البيع الأساسية للمنصة</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">السيولة (20) والربحية (20)</span>
                    <span className="font-mono font-bold">37 / 40</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">المديونية (15) والتدفقات (15)</span>
                    <span className="font-mono font-bold">27 / 30</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">الامتثال الضريبي (15) والتحصيل (15)</span>
                    <span className="font-mono font-bold">27 / 30</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActiveStage('STAGE_2_HEALTH_SCORE')}
                className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
              >
                فتح تفاصيل معادلة صحة الأعمال والتوصيات
              </button>
            </div>

            {/* 2. التنبيهات الذكية */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400">2. مركز التنبيهات الذكية</span>
                  <span className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-600 dark:text-rose-400 text-[11px] font-bold">
                    9 تنبيهات نشطة
                  </span>
                </div>
                <ul className="space-y-2 text-xs">
                  <li className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 font-bold text-rose-800 dark:text-rose-200">
                    • إقرار مستحق: تبقى 10 أيام على الإقرار الضريبي.
                  </li>
                  <li className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 font-bold text-amber-800 dark:text-amber-200">
                    • وثيقة منتهية: انتهى تفويض المستخدم أحمد + رخصة المهن خلال 20 يوماً.
                  </li>
                  <li className="p-2.5 rounded-lg bg-sky-500/10 border border-sky-500/20 font-bold text-sky-800 dark:text-sky-200">
                    • فاتورة متأخرة: عميل متأخر بالسداد أكثر من 90 يوماً.
                  </li>
                </ul>
              </div>
              <button
                onClick={() => setActiveStage('STAGE_1_NOTIFICATIONS')}
                className="w-full py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer"
              >
                استعراض جميع التنبيهات (ضريبية · وثائق · مالية)
              </button>
            </div>

            {/* 3. المهام + الوثائق + المؤشرات */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-2.5 text-xs">
                <div className="font-extrabold text-slate-900 dark:text-white">
                  3. المهام والوثائق والمؤشرات المالية والتقويم
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 flex justify-between">
                  <span>المهام النشطة (ضريبية / مالية / إدارية)</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{tasks.length} مهام</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 flex justify-between">
                  <span>مركز الوثائق الذكي (ساري / ينتهي قريباً / منتهي)</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">{smartDocs.length} وثائق</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 flex justify-between">
                  <span>فحص صحة النظام والبيانات (System Health)</span>
                  <span className="font-bold font-mono text-sky-600 dark:text-sky-400">93%</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setActiveStage('STAGE_5_KANBAN_TASKS')}
                  className="py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold cursor-pointer"
                >
                  لوحة المهام Kanban
                </button>
                <button
                  onClick={() => setActiveStage('STAGE_11_AI_ADVISOR')}
                  className="py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer"
                >
                  المستشار الذكي
                </button>
              </div>
            </div>
          </div>

          {/* 6 Sprints Execution Roadmap */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              خريطة التنفيذ الهندسي (6 Sprints — مكتملة ومفعّلة بالكامل داخل المنصة)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
              {[
                { sprint: 'Sprint 1', items: ['إعادة تصميم UX', 'إعادة تنظيم القوائم', 'Dashboard جديدة'], target: 'MVP_FLOW' as PhaseTwoTabId },
                { sprint: 'Sprint 2', items: ['التنبيهات الذكية', 'التقويم الضريبي', 'الوثائق الذكية'], target: 'STAGE_1_NOTIFICATIONS' as PhaseTwoTabId },
                { sprint: 'Sprint 3', items: ['Business Health Score', 'مركز المخاطر', 'فحص صحة البيانات'], target: 'STAGE_2_HEALTH_SCORE' as PhaseTwoTabId },
                { sprint: 'Sprint 4', items: ['إدارة المهام Kanban', 'المقارنات السنوية', 'التقارير التنفيذية'], target: 'STAGE_5_KANBAN_TASKS' as PhaseTwoTabId },
                { sprint: 'Sprint 5', items: ['صفحة المستثمر والبنوك', 'مؤشرات القطاع الأردني', 'Bank Package'], target: 'STAGE_7_INVESTOR_BANK' as PhaseTwoTabId },
                { sprint: 'Sprint 6', items: ['المستشار المالي والضريبي الذكي', 'تحليل البيانات الفعلية', 'مخطط 21 جدول SQL'], target: 'STAGE_11_AI_ADVISOR' as PhaseTwoTabId },
              ].map((sp) => (
                <button
                  key={sp.sprint}
                  onClick={() => setActiveStage(sp.target)}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-emerald-500/10 border border-slate-200 dark:border-slate-800 text-right space-y-2 transition cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400">{sp.sprint}</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                    {sp.items.map((i) => (
                      <li key={i}>• {i}</li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================================
          STAGE 1: SMART COMPLIANCE & NOTIFICATIONS CENTER (مركز التنبيهات الذكية)
         ========================================================================== */}
      {activeStage === 'STAGE_1_NOTIFICATIONS' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-emerald-600" />
                <span>المرحلة 1: مركز الامتثال والتنبيهات الذكية (Notification Center & Alerts Dashboard)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                منع نسيان الالتزامات المالية والضريبية والقانونية عبر تنبيهات داخل المنصة (In-App) وتنبيهات البريد الإلكتروني.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setEmailAlertsEnabled(!emailAlertsEnabled);
                  triggerToast(
                    !emailAlertsEnabled
                      ? 'تم تفعيل إرسال التنبيهات الفورية عبر البريد الإلكتروني (Email Notifications).'
                      : 'تم إيقاف إشعارات البريد الإلكتروني المؤقتة.'
                  );
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                  emailAlertsEnabled
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email Notifications: {emailAlertsEnabled ? 'مفعل' : 'متوقف'}</span>
              </button>

              <button
                onClick={() => {
                  setNotifications((prev) => prev.map((n) => ({ ...n, status: 'READ' })));
                  triggerToast('تم تحديد جميع التنبيهات كمقروءة.');
                }}
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold cursor-pointer"
              >
                تحديد الكل كمقروء
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'ALL', label: 'جميع التنبيهات (9)' },
              { id: 'TAX', label: 'تنبيهات ضريبية (3)' },
              { id: 'DOCUMENT', label: 'تنبيهات الوثائق (3)' },
              { id: 'FINANCIAL', label: 'تنبيهات مالية (3)' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setNotifFilter(f.id as typeof notifFilter)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                  notifFilter === f.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {notifications
              .filter((n) => notifFilter === 'ALL' || n.type === notifFilter)
              .map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border space-y-2 text-xs ${
                    item.severity === 'CRITICAL'
                      ? 'bg-rose-500/10 border-rose-500/30'
                      : item.severity === 'WARNING'
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'bg-sky-500/10 border-sky-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-slate-900/10 dark:bg-white/10 font-bold text-[11px]">
                      {item.typeLabelAr}
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">الاستحقاق: {item.dueDate}</span>
                  </div>
                  <div className="text-sm font-extrabold text-slate-900 dark:text-white">{item.title}</div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{item.message}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                    <span className="text-[11px] font-bold">
                      الحالة: {item.status === 'UNREAD' ? 'غير مقروء (جديد)' : 'تمت المراجعة'}
                    </span>
                    {item.status === 'UNREAD' && (
                      <button
                        onClick={() =>
                          setNotifications((prev) =>
                            prev.map((n) => (n.id === item.id ? { ...n, status: 'READ' } : n))
                          )
                        }
                        className="text-emerald-600 dark:text-emerald-400 font-bold underline cursor-pointer"
                      >
                        تأكيد القراءة
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ==========================================================================
          STAGE 2: BUSINESS HEALTH SCORE (نظام صحة الأعمال 91/100)
         ========================================================================== */}
      {activeStage === 'STAGE_2_HEALTH_SCORE' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  المرحلة 2: نظام صحة الأعمال (Business Health Score)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  معادلة قياس فورية من 100 نقطة موزعة على 6 ركائز مالية وضريبية وتشغيلية.
                </p>
              </div>
              <div className="text-left">
                <div className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                  {totalHealthScore}/100
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${healthGrade.badge}`}>
                  التصنيف: {healthGrade.label}
                </span>
              </div>
            </div>

            {/* 6 Pillars Breakdown */}
            <div className="space-y-3 text-xs">
              {[
                { label: '1. السيولة (Liquidity)', score: baseScores.liquidity, max: 20, color: 'bg-emerald-500' },
                { label: '2. الربحية (Profitability)', score: baseScores.profitability + (appliedOptimizations.boostMargin ? 2 : 0), max: 20, color: 'bg-emerald-500' },
                { label: '3. المديونية (Debt Ratio)', score: Math.min(15, baseScores.debt + (appliedOptimizations.reduceDebt ? 2 : 0)), max: 15, color: 'bg-sky-500' },
                { label: '4. التدفقات النقدية (Cash Flow)', score: baseScores.cashflow, max: 15, color: 'bg-sky-500' },
                { label: '5. الامتثال الضريبي (Tax Compliance)', score: baseScores.compliance, max: 15, color: 'bg-amber-500' },
                { label: '6. تحصيل الذمم (AR Collection)', score: Math.min(15, baseScores.collection + (appliedOptimizations.collectReceivables ? 2 : 0)), max: 15, color: 'bg-purple-500' },
              ].map((p) => (
                <div key={p.label} className="space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>{p.label}</span>
                    <span className="font-mono">
                      {p.score} / {p.max} نقطة
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full ${p.color} rounded-full transition-all`}
                      style={{ width: `${Math.round((p.score / p.max) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Grading Scale Reference */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-center font-bold">
              <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">90-100 ممتاز</div>
              <div className="p-2 rounded-lg bg-sky-500/15 text-sky-700 dark:text-sky-300">80-89 جيد جداً</div>
              <div className="p-2 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300">70-79 جيد</div>
              <div className="p-2 rounded-lg bg-orange-500/15 text-orange-700 dark:text-orange-300">60-69 يحتاج تحسين</div>
              <div className="p-2 rounded-lg bg-rose-500/15 text-rose-700 dark:text-rose-300">أقل من 60 خطر</div>
            </div>
          </div>

          {/* Smart Recommendations Simulator */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              التوصيات الذكية لرفع درجة صحة الشركة
            </h3>
            <p className="text-xs text-slate-500">
              فعّل أياً من الإجراءات التصحيحية التالية لمعاينة الأثر الفوري على مؤشر صحة الأعمال:
            </p>

            <div className="space-y-3 text-xs">
              {[
                {
                  key: 'collectReceivables' as const,
                  title: 'سداد الذمم سيضيف 4 نقاط.',
                  desc: 'تحصيل الذمم المتأخرة لأكثر من 60 يوماً وتقليص متوسط فترة التحصيل.',
                },
                {
                  key: 'reduceDebt' as const,
                  title: 'تقليل نسبة الدين سيضيف 7 نقاط.',
                  desc: 'جدولة سداد التسهيلات البنكية قصيرة الأجل وتخفيض الالتزامات المتداولة.',
                },
                {
                  key: 'boostMargin' as const,
                  title: 'رفع هامش الربح سيضيف 3 نقاط.',
                  desc: 'إعادة التفاوض مع الموردين وتخفيض تكلفة البضاعة المباعة (COGS).',
                },
              ].map((rec) => {
                const isApplied = appliedOptimizations[rec.key];
                return (
                  <div
                    key={rec.key}
                    className={`p-4 rounded-xl border transition ${
                      isApplied
                        ? 'bg-emerald-500/10 border-emerald-500/40'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">{rec.title}</span>
                      <button
                        onClick={() =>
                          setAppliedOptimizations((prev) => ({ ...prev, [rec.key]: !prev[rec.key] }))
                        }
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                          isApplied ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700'
                        }`}
                      >
                        {isApplied ? 'تم التطبيق ✓' : 'محاكاة الأثر'}
                      </button>
                    </div>
                    <p className="text-slate-500 mt-1">{rec.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================================
          STAGE 3: RISK CENTER (مركز المخاطر)
         ========================================================================== */}
      {activeStage === 'STAGE_3_RISK_CENTER' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
              المرحلة 3: مركز المخاطر الاستباقي (Risk Center)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              تقييم مستمر لمخاطر الضرائب والسيولة والتحصيل والمخاطر القانونية والتشغيلية.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
            {/* Tax Risk */}
            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono font-black text-sm text-amber-600 dark:text-amber-400">
                  Tax Risk = Medium
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold">
                  مخاطر ضريبية: متوسطة
                </span>
              </div>
              <div className="space-y-1.5 text-slate-700 dark:text-slate-300">
                <div className="font-bold">تعتمد على:</div>
                <ul className="space-y-1 pr-3">
                  <li>• إقرارات متأخرة (تبقى 10 أيام على الإقرار الدوري)</li>
                  <li>• معلومات ناقصة (فاتورة مورد قيد المراجعة الضريبية)</li>
                  <li>• تعارض بيانات (مطابقة ضريبة المخرجات مع اليومية)</li>
                </ul>
              </div>
            </div>

            {/* Liquidity Risk */}
            <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono font-black text-sm text-rose-600 dark:text-rose-400">
                  Liquidity Risk = High
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-700 dark:text-rose-300 font-bold">
                  مخاطر السيولة: مرتفعة
                </span>
              </div>
              <div className="space-y-1.5 text-slate-700 dark:text-slate-300">
                <div className="font-bold">تعتمد على:</div>
                <ul className="space-y-1 pr-3">
                  <li>• Current Ratio (نسبة التداول والسيولة السريعة)</li>
                  <li>• Cash Flow (انخفاض السيولة الشهرية بنسبة 15%)</li>
                  <li>• رصيد البنك ({cycleData.balanceSheet.cashAndBanksJod} د.أ)</li>
                </ul>
              </div>
            </div>

            {/* Collection Risk */}
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono font-black text-sm text-emerald-600 dark:text-emerald-400">
                  Collection Risk = Low
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold">
                  مخاطر التحصيل: منخفضة
                </span>
              </div>
              <div className="space-y-1.5 text-slate-700 dark:text-slate-300">
                <div className="font-bold">تعتمد على:</div>
                <ul className="space-y-1 pr-3">
                  <li>• الديون المتأخرة (عميل واحد فقط تجاوز 90 يوماً)</li>
                  <li>• نسبة التحصيل (89.4% ضمن الآجال التعاقدية)</li>
                  <li>• متوسط فترة التحصيل (42 يوماً)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================================
          STAGE 4: SMART DOCUMENT CENTER (مركز الوثائق الذكي)
         ========================================================================== */}
      {activeStage === 'STAGE_4_SMART_DOCS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>رفع وأرشفة وثيقة جديدة</span>
            </h3>
            <form onSubmit={handleUploadSmartDoc} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 mb-1 font-bold">نوع الوثيقة الرسمية</label>
                <select
                  value={newDocType}
                  onChange={(e) => setNewDocType(e.target.value as SmartDocRecord['docTypeCode'])}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700"
                >
                  <option value="commercial_registration">السجل التجاري (commercial_registration)</option>
                  <option value="municipality_license">الرخصة (municipality_license)</option>
                  <option value="tax_certificate">شهادة الضريبة (tax_certificate)</option>
                  <option value="social_security">شهادة الضمان (social_security)</option>
                  <option value="authorization">التفويضات (authorization)</option>
                  <option value="id_card">بطاقة الأحوال / الهوية (id_card)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-500 mb-1 font-bold">اسم / بيان الوثيقة</label>
                <input
                  type="text"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  placeholder="مثال: رخصة مهن فرع العبدلي 2026"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1 font-bold">تاريخ الانتهاء</label>
                <input
                  type="date"
                  value={newDocExpiry}
                  onChange={(e) => setNewDocExpiry(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 font-mono"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
              >
                رفع الوثيقة وتفعيل التذكير التلقائي
              </button>
            </form>
          </div>

          <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              المرحلة 4: مركز الوثائق الذكي (السجل التجاري · الرخصة · شهادة الضريبة · شهادة الضمان · التفويضات)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500">
                    <th className="p-2.5">النوع</th>
                    <th className="p-2.5">اسم الوثيقة</th>
                    <th className="p-2.5">تاريخ الانتهاء</th>
                    <th className="p-2.5">حالة الوثيقة</th>
                    <th className="p-2.5">إجراءات الأرشفة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {smartDocs.map((d) => (
                    <tr key={d.id}>
                      <td className="p-2.5 font-bold">{d.docTypeAr}</td>
                      <td className="p-2.5 text-slate-700 dark:text-slate-300">{d.docName}</td>
                      <td className="p-2.5 font-mono">{d.expiryDate}</td>
                      <td className="p-2.5 font-bold">
                        {d.status === 'VALID' && <span className="text-emerald-600 dark:text-emerald-400">✅ سارية</span>}
                        {d.status === 'EXPIRING_SOON' && <span className="text-amber-600 dark:text-amber-400">⚠ تنتهي قريباً</span>}
                        {d.status === 'EXPIRED' && <span className="text-rose-600 dark:text-rose-400">❌ منتهية</span>}
                      </td>
                      <td className="p-2.5">
                        <button
                          onClick={() => triggerToast(`جارٍ تحميل نسخة مؤرشفة من: ${d.docName}`)}
                          className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500/20 font-bold text-[11px] cursor-pointer"
                        >
                          تحميل الوثيقة
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

      {/* ==========================================================================
          STAGE 5: KANBAN TASK BOARD (نظام المهام)
         ========================================================================== */}
      {activeStage === 'STAGE_5_KANBAN_TASKS' && (
        <div className="space-y-6">
          <form
            onSubmit={handleAddKanbanTask}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-3 text-xs items-end"
          >
            <div className="md:col-span-4">
              <label className="block text-slate-500 mb-1 font-bold">عنوان المهمة الجديدة</label>
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="مثال: مطابقة كشف اقتطاع ضريبة الدخل للموظفين"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-slate-500 mb-1 font-bold">نوع المهمة</label>
              <select
                value={newTaskCategory}
                onChange={(e) => setNewTaskCategory(e.target.value as KanbanTaskItem['category'])}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700"
              >
                <option value="ضريبية">ضريبية</option>
                <option value="مالية">مالية</option>
                <option value="إدارية">إدارية</option>
                <option value="قانونية">قانونية</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-slate-500 mb-1 font-bold">المسؤول</label>
              <input
                type="text"
                value={newTaskAssignee}
                onChange={(e) => setNewTaskAssignee(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-slate-500 mb-1 font-bold">تاريخ الاستحقاق</label>
              <input
                type="date"
                value={newTaskDue}
                onChange={(e) => setNewTaskDue(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 font-mono"
              />
            </div>
            <button
              type="submit"
              className="md:col-span-2 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة مهمة</span>
            </button>
          </form>

          {/* 3 Kanban Columns: To Do | In Progress | Done */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { colId: 'TODO', title: 'To Do (جديدة / متأخرة)', match: (s: KanbanTaskItem['status']) => s === 'TODO' || s === 'OVERDUE' },
              { colId: 'IN_PROGRESS', title: 'In Progress (قيد التنفيذ)', match: (s: KanbanTaskItem['status']) => s === 'IN_PROGRESS' },
              { colId: 'DONE', title: 'Done (مكتملة)', match: (s: KanbanTaskItem['status']) => s === 'DONE' },
            ].map((col) => (
              <div
                key={col.colId}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3"
              >
                <div className="font-extrabold text-sm text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2.5">
                  {col.title}
                </div>
                <div className="space-y-3">
                  {tasks
                    .filter((t) => col.match(t.status))
                    .map((task) => (
                      <div
                        key={task.id}
                        className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold text-[11px]">
                            {task.category}
                          </span>
                          <span className="font-mono text-[11px] text-slate-500">{task.dueDate}</span>
                        </div>
                        <div className="font-extrabold text-slate-900 dark:text-white">{task.title}</div>
                        <p className="text-slate-500 text-[11px]">{task.description}</p>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px]">
                          <span className="font-bold">{task.assignedTo}</span>
                          <div className="flex gap-1">
                            {task.status !== 'IN_PROGRESS' && (
                              <button
                                onClick={() => moveKanbanTask(task.id, 'IN_PROGRESS')}
                                className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-600 dark:text-sky-300 font-bold cursor-pointer"
                              >
                                قيد التنفيذ
                              </button>
                            )}
                            {task.status !== 'DONE' && (
                              <button
                                onClick={() => moveKanbanTask(task.id, 'DONE')}
                                className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-bold cursor-pointer"
                              >
                                إكمال ✓
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==========================================================================
          STAGE 6: MULTI-YEAR YOY ANALYTICS (التحليلات والمقارنات السنوية)
         ========================================================================== */}
      {activeStage === 'STAGE_6_YOY_ANALYTICS' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                المرحلة 6: التحليلات والمقارنات السنوية (2026 vs 2025 · 2025 vs 2024)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                مقارنة الأداء السنوي لبنود: الإيرادات · الأرباح · المصروفات · النقد · الضرائب.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setYoyPair('2026_VS_2025')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                  yoyPair === '2026_VS_2025' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800'
                }`}
              >
                مقارنة 2026 vs 2025
              </button>
              <button
                onClick={() => setYoyPair('2025_VS_2024')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                  yoyPair === '2025_VS_2024' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800'
                }`}
              >
                مقارنة 2025 vs 2024
              </button>
            </div>
          </div>

          {/* Highlighted Growth Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center">
              <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">+18% مبيعات</div>
              <div className="text-xs text-slate-500 mt-1">نمو مستدام في الإيرادات الخاضعة والصادرات</div>
            </div>
            <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/30 text-center">
              <div className="text-2xl font-black font-mono text-sky-600 dark:text-sky-400">+7% أرباح</div>
              <div className="text-xs text-slate-500 mt-1">تحسن صافي الربح بعد الضريبة والمساهمة الوطنية</div>
            </div>
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center">
              <div className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400">-3% مصروفات</div>
              <div className="text-xs text-slate-500 mt-1">ضبط النفقات الإدارية والعمومية</div>
            </div>
          </div>

          {/* 5 Dimensions Comparison Bars */}
          <div className="space-y-4 text-xs">
            {[
              { metric: 'إيرادات (Revenues)', current: yoyPair === '2026_VS_2025' ? 485000 : 411000, prev: yoyPair === '2026_VS_2025' ? 411000 : 362000, change: '+18%' },
              { metric: 'أرباح صافية (Net Profit)', current: yoyPair === '2026_VS_2025' ? 114945 : 107425, prev: yoyPair === '2026_VS_2025' ? 107425 : 96800, change: '+7%' },
              { metric: 'مصروفات تشغيلية (Expenses)', current: yoyPair === '2026_VS_2025' ? 92400 : 95250, prev: yoyPair === '2026_VS_2025' ? 95250 : 98100, change: '-3%' },
              { metric: 'نقد وسيولة (Cash & Banks)', current: yoyPair === '2026_VS_2025' ? 105200 : 88500, prev: yoyPair === '2026_VS_2025' ? 88500 : 76000, change: '+18.8%' },
              { metric: 'ضرائب موردة (Taxes Paid)', current: yoyPair === '2026_VS_2025' ? 48200 : 42600, prev: yoyPair === '2026_VS_2025' ? 42600 : 38900, change: '+13.1%' },
            ].map((row) => (
              <div key={row.metric} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 font-bold">
                  <span>{row.metric}</span>
                  <div className="flex items-center gap-4 font-mono">
                    <span className="text-emerald-600 dark:text-emerald-400">
                      العام الحالي: {row.current.toLocaleString('en-US')} د.أ
                    </span>
                    <span className="text-slate-500">
                      العام المقارن: {row.prev.toLocaleString('en-US')} د.أ
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      {row.change}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==========================================================================
          STAGE 7: INVESTOR & BANK CENTER (مركز المستثمر والبنوك)
         ========================================================================== */}
      {activeStage === 'STAGE_7_INVESTOR_BANK' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: '1. تقرير تمويل (Financing Report)',
              subtitle: 'مخصص لطلبات التسهيلات الائتمانية وتمويل رأس المال العامل',
              items: ['ملخص الشركة والكيان القانوني', 'الإيرادات والمبيعات المعتمدة', 'الأرباح الصافية والتشغيلية (EBIT)', 'التدفقات النقدية وقدرة السداد', 'مؤشرات الأداء المالي (ROA, ROE, Quick Ratio)'],
              refCode: 'FIN-REP-2026',
            },
            {
              title: '2. تقرير استثماري (Investment Memorandum)',
              subtitle: 'مخصص للمستثمرين وصناديق رأس المال الجريء والشركاء',
              items: ['تحليل SWOT الرباعي للمنشأة', 'مؤشرات النمو السنوية (+18% مبيعات)', 'تقييم المخاطر الضريبية والمالية', 'الفرص التوسعية في السوق الأردني والمنطقة'],
              refCode: 'INV-SWOT-2026',
            },
            {
              title: '3. ملف بنك متكامل (Bank Package)',
              subtitle: 'حزمة الوثائق والبيانات المالية الجاهزة للتقديم للبنوك الأردنية',
              items: ['القوائم المالية المتوازنة (دخل + مركز مالي)', 'السجل التجاري وشهادة الضريبة السارية', 'جدول الالتزامات والذمم القائمة', 'المؤشرات الائتمانية ودرجة صحة الأعمال (91/100)'],
              refCode: 'BANK-PKG-2026',
            },
          ].map((pack) => (
            <div
              key={pack.refCode}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <span className="px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-bold font-mono">
                  {pack.refCode}
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{pack.title}</h3>
                <p className="text-xs text-slate-500">{pack.subtitle}</p>
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-800">
                  {pack.items.map((it) => (
                    <li key={it}>✓ {it}</li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() =>
                  exportArabicReportToPdf({
                    title: pack.title,
                    subtitle: pack.subtitle,
                    referenceNumber: pack.refCode,
                    sections: [
                      {
                        heading: 'البيانات المالية الأساسية المستخرجة من الأستاذ العام',
                        rows: [
                          { label: 'إجمالي الإيرادات', value: `${cycleData.incomeStatement.totalRevenueJod} د.أ` },
                          { label: 'صافي الربح بعد الضريبة', value: `${cycleData.incomeStatement.netIncomeAfterTaxJod} د.أ` },
                          { label: 'إجمالي الأصول المتوازنة', value: `${cycleData.balanceSheet.totalAssetsJod} د.أ` },
                          { label: 'درجة صحة الأعمال (Business Health Score)', value: `${totalHealthScore}/100` },
                        ],
                      },
                    ],
                  })
                }
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>توليد وتنزيل {pack.title}</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ==========================================================================
          STAGE 8: JORDAN SECTOR BENCHMARKS (مؤشرات القطاع الأردني)
         ========================================================================== */}
      {activeStage === 'STAGE_8_SECTOR_BENCHMARKS' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                المرحلة 8: مؤشرات القطاع الأردني (Sector Benchmarks)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                قارن أداء شركتك مع متوسط الشركات المماثلة في السوق الأردني (مطاعم · تجارة · خدمات · صناعة · تقنية).
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {(['مطاعم', 'تجارة', 'خدمات', 'صناعة', 'تقنية'] as const).map((sec) => (
                <button
                  key={sec}
                  onClick={() => setSelectedSector(sec)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                    selectedSector === sec
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  قطاع {sec}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300">نتيجة المقارنة المعيارية في قطاع ({selectedSector})</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                شركتك أفضل من {SECTOR_BENCHMARKS_DATA[selectedSector].percentileRank}% من الشركات المشابهة.
              </div>
            </div>
            <span className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-mono font-black text-lg">
              Top {100 - SECTOR_BENCHMARKS_DATA[selectedSector].percentileRank}%
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {[
              {
                label: 'متوسط الربحية الصافية',
                sectorVal: `${SECTOR_BENCHMARKS_DATA[selectedSector].avgProfitMarginPct}%`,
                compVal: `${SECTOR_BENCHMARKS_DATA[selectedSector].companyProfitMarginPct}%`,
              },
              {
                label: 'متوسط الأجور الشهرية',
                sectorVal: `${SECTOR_BENCHMARKS_DATA[selectedSector].avgWageJod} د.أ`,
                compVal: `${SECTOR_BENCHMARKS_DATA[selectedSector].companyWageJod} د.أ`,
              },
              {
                label: 'متوسط السيولة السريعة',
                sectorVal: `${SECTOR_BENCHMARKS_DATA[selectedSector].avgLiquidityRatio}x`,
                compVal: `${SECTOR_BENCHMARKS_DATA[selectedSector].companyLiquidityRatio}x`,
              },
              {
                label: 'متوسط المصروفات للإيرادات',
                sectorVal: `${SECTOR_BENCHMARKS_DATA[selectedSector].avgExpenseRatioPct}%`,
                compVal: `${SECTOR_BENCHMARKS_DATA[selectedSector].companyExpenseRatioPct}%`,
              },
            ].map((b) => (
              <div
                key={b.label}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2"
              >
                <div className="font-extrabold text-slate-900 dark:text-white">{b.label}</div>
                <div className="flex justify-between text-slate-500">
                  <span>متوسط القطاع:</span>
                  <span className="font-mono font-bold">{b.sectorVal}</span>
                </div>
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                  <span>أداء شركتك:</span>
                  <span className="font-mono">{b.compVal}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==========================================================================
          STAGE 9: SMART TAX CALENDAR (التقويم الضريبي الذكي)
         ========================================================================== */}
      {activeStage === 'STAGE_9_TAX_CALENDAR' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                المرحلة 9: التقويم الضريبي والقانوني الذكي (يناير · فبراير · مارس)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                مواعيد الإقرارات الضريبية، الضمان الاجتماعي، الرخص، واقتطاعات المنبع مع التصدير المباشر لـ Outlook وGoogle Calendar.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleExportIcsCalendar('OUTLOOK')}
                className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>تصدير Outlook (.ics)</span>
              </button>
              <button
                onClick={() => handleExportIcsCalendar('GOOGLE')}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>تصدير Google Calendar</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {['يناير (كانون الثاني)', 'فبراير (شباط)', 'مارس (آذار)'].map((mName) => (
              <div
                key={mName}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3"
              >
                <div className="font-extrabold text-sm text-emerald-700 dark:text-emerald-400 border-b border-slate-200 dark:border-slate-700 pb-2">
                  {mName}
                </div>
                {TAX_CALENDAR_EVENTS.filter((e) => e.monthName === mName).map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold text-[11px]">
                        {ev.category}
                      </span>
                      <span className="font-mono text-[11px] text-slate-500">{ev.dueDate}</span>
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white">{ev.title}</div>
                    <div className="text-[11px] text-slate-500">الأولوية: {ev.priority} · الحالة: {ev.status}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==========================================================================
          STAGE 10: DATA & SYSTEM HEALTH CHECK (فحص صحة البيانات 93%)
         ========================================================================== */}
      {activeStage === 'STAGE_10_DATA_HEALTH' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                المرحلة 10: محرك فحص صحة البيانات والنظام (Data Health Diagnostic)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                فحص آلي شامل للتوازن المحاسبي، سلامة الفواتير الضريبية، وصلاحية المستندات القانونية.
              </p>
            </div>
            <div className="px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-mono font-black text-xl">
              System Health: 93%
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
            {/* 1. الفحص المحاسبي */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">1. الفحص المحاسبي (100% سليم)</div>
              <ul className="space-y-2">
                <li className="flex items-center justify-between">
                  <span>توازن القيود المزدوجة</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </li>
                <li className="flex items-center justify-between">
                  <span>ترحيل القيود للأستاذ العام</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </li>
                <li className="flex items-center justify-between">
                  <span>الأرصدة المدينة ({cycleData.trialBalanceSummary.closingDebitJod} د.أ)</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </li>
                <li className="flex items-center justify-between">
                  <span>الأرصدة الدائنة ({cycleData.trialBalanceSummary.closingCreditJod} د.أ)</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </li>
              </ul>
            </div>

            {/* 2. الفحص الضريبي */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="font-extrabold text-sm text-amber-600 dark:text-amber-400">2. الفحص الضريبي (92% سليم)</div>
              <ul className="space-y-2">
                <li className="flex items-center justify-between">
                  <span>فحص: رقم ضريبي مفقود</span>
                  <span className="text-emerald-600 font-bold">0 مفقود ✓</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>فحص: فواتير ناقصة للمراجعة</span>
                  <span className="text-amber-600 font-bold">1 فاتورة قيد التدقيق ⚠</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>فحص: تواريخ غير صحيحة</span>
                  <span className="text-emerald-600 font-bold">تواريخ متسلسلة ✓</span>
                </li>
              </ul>
            </div>

            {/* 3. الفحص القانوني */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="font-extrabold text-sm text-rose-600 dark:text-rose-400">3. الفحص القانوني (87% سليم)</div>
              <ul className="space-y-2">
                <li className="flex items-center justify-between">
                  <span>فحص: مستندات منتهية أو قريبة الانتهاء</span>
                  <span className="text-amber-600 font-bold">رخصة المهن (20 يوماً) ⚠</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>فحص: تفويض منتهي</span>
                  <span className="text-rose-600 font-bold">تفويض أحمد منتهي ❌</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>فحص: سجل منتهي</span>
                  <span className="text-emerald-600 font-bold">السجل التجاري ساري ✓</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================================
          STAGE 11: GOLDEN FEATURE — DATA-DRIVEN AI FINANCIAL & TAX ADVISOR
         ========================================================================== */}
      {activeStage === 'STAGE_11_AI_ADVISOR' && (
        <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-lg space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-bold text-emerald-400">المرحلة 11 (الميزة الذهبية — الأولوية القصوى)</span>
              <h2 className="text-xl font-extrabold mt-0.5">
                المستشار المالي والضريبي الذكي (يحلل البيانات الفعلية للشركة بدلاً من ChatBot عادي)
              </h2>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
              هذه معلومات إرشادية ولا تعتبر استشارة قانونية أو ضريبية معتمدة.
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedAdvisorScenario('PROFIT_DROP')}
              className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                selectedAdvisorScenario === 'PROFIT_DROP'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              سؤال: لماذا انخفض الربح؟
            </button>
            <button
              onClick={() => setSelectedAdvisorScenario('FINANCIAL_HEALTH')}
              className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                selectedAdvisorScenario === 'FINANCIAL_HEALTH'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              سؤال: هل وضعي المالي جيد؟
            </button>
            <button
              onClick={() => setSelectedAdvisorScenario('LIVE_LEDGER')}
              className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                selectedAdvisorScenario === 'LIVE_LEDGER'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              تحليل أرصدة الأستاذ العام والضرائب الحالية
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={customAdvisorQuestion}
              onChange={(e) => setCustomAdvisorQuestion(e.target.value)}
              placeholder="اطرح سؤالك التحليلي حول ربحية الشركة أو السيولة أو الضرائب..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
            />
            <button
              onClick={() => {
                if (customAdvisorQuestion.includes('ربح')) setSelectedAdvisorScenario('PROFIT_DROP');
                else if (customAdvisorQuestion.includes('وضع') || customAdvisorQuestion.includes('صحة'))
                  setSelectedAdvisorScenario('FINANCIAL_HEALTH');
                else setSelectedAdvisorScenario('LIVE_LEDGER');
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
            >
              تحليل البيانات الفورية
            </button>
          </div>

          {selectedAdvisorScenario === 'PROFIT_DROP' && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs leading-relaxed">
              <div className="text-sm font-extrabold text-emerald-400">سؤال: لماذا انخفض الربح؟</div>
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 font-extrabold text-rose-300">
                انخفض الربح بنسبة 14%.
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="font-bold text-amber-400">السبب الأول:</div>
                  <div>زيادة المصروفات التشغيلية بنسبة 9%.</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="font-bold text-amber-400">السبب الثاني:</div>
                  <div>انخفاض المبيعات بنسبة 5%.</div>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                <strong>التوصية:</strong> إعادة التفاوض مع الموردين وتقليل مصاريف التشغيل.
              </div>
            </div>
          )}

          {selectedAdvisorScenario === 'FINANCIAL_HEALTH' && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs leading-relaxed">
              <div className="text-sm font-extrabold text-emerald-400">سؤال: هل وضعي المالي جيد؟</div>
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 font-extrabold text-emerald-300 text-sm">
                درجة صحة الأعمال: 88/100 (وبعد التحديثات الحالية: {totalHealthScore}/100) — ممتازة.
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="font-bold text-emerald-400">أقوى نقطة:</div>
                  <div>السيولة ({cycleData.balanceSheet.cashAndBanksJod} د.أ).</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="font-bold text-amber-400">أضعف نقطة:</div>
                  <div>تحصيل الذمم ({cycleData.balanceSheet.accountsReceivableJod} د.أ).</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="font-bold text-sky-400">التحسين المتوقع:</div>
                  <div>+5 نقاط عند خفض فترة التحصيل إلى 45 يوماً.</div>
                </div>
              </div>
            </div>
          )}

          {selectedAdvisorScenario === 'LIVE_LEDGER' && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs leading-relaxed">
              <div className="text-sm font-extrabold text-emerald-400">
                قراءة مباشرة من دفتر الأستاذ العام وميزان المراجعة الفعلي للمنشأة:
              </div>
              <p className="text-slate-300">
                • إجمالي الإيرادات المسجلة: <strong>{cycleData.incomeStatement.totalRevenueJod} د.أ</strong> | صافي الربح بعد الضريبة:{' '}
                <strong>{cycleData.incomeStatement.netIncomeAfterTaxJod} د.أ</strong>.
                <br />• صافي ضريبة المبيعات المستحقة للتوريد لدائرة ضريبة الدخل والمبيعات (ISTD):{' '}
                <strong>{cycleData.taxIntegrationSummary.netGstPayableToIstdJod} د.أ</strong>.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ==========================================================================
          TAB 12: FULL ERD & 21-TABLE SQL SCHEMA EXPLORER
         ========================================================================== */}
      {activeStage === 'ERD_SQL_SCHEMA' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-600" />
                <span>المخطط العلائقي الشامل (ERD) وهيكل قاعدة البيانات النهائي (21 جدول SQL)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                يتضمن الجداول الأساسية الـ 17 + الجداول الـ 4 الإضافية لتكامل الـ ERP: (vendors · products_services · quotes · contracts).
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(FULL_21_TABLES_SQL_DDL);
                  setSqlCopied(true);
                  setTimeout(() => setSqlCopied(false), 3000);
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                {sqlCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{sqlCopied ? 'تم نسخ SQL' : 'نسخ كود SQL الكامل'}</span>
              </button>
              <button
                onClick={handleDownloadSqlSchema}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>تنزيل ملف Schema (.sql)</span>
              </button>
            </div>
          </div>

          {/* Visual 21-Table ERD Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5 text-xs">
            {[
              '1. users',
              '2. companies (الجدول الأب)',
              '3. company_owners',
              '4. company_authorized_persons',
              '5. tax_profiles',
              '6. company_documents',
              '7. customers',
              '8. vendors (مرتبط بـ companies)',
              '9. products_services (مرتبط بـ companies)',
              '10. quotes (مرتبط بـ companies)',
              '11. contracts (مرتبط بـ companies)',
              '12. invoices',
              '13. invoice_items',
              '14. payments',
              '15. customer_statements',
              '16. tasks',
              '17. notifications',
              '18. compliance_calendar',
              '19. risks',
              '20. business_health_scores',
              '21. audit_logs',
            ].map((tbl) => (
              <div
                key={tbl}
                className={`p-2.5 rounded-xl border font-mono font-bold text-[11px] ${
                  tbl.includes('مرتبط بـ companies') || tbl.includes('الجدول الأب')
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                }`}
              >
                {tbl}
              </div>
            ))}
          </div>

          {/* Interactive 4 Expanded Tables Explorer (vendors, products_services, quotes, contracts) linked to companies */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-emerald-500/30 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                  البيانات الأساسية الجديدة المرتبطة بجدول الشركات (`companies.id = 1`) والدورة المحاسبية الكاملة
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                  الشركة الأم: {DEFAULT_COMPANY_RECORD.company_name} (الرقم الضريبي: {DEFAULT_COMPANY_RECORD.tax_number})
                </h3>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'vendors' as const, label: `1. البائعين / الموردين (vendors) [${vendorsList.length}]` },
                  { id: 'products_services' as const, label: `2. المنتجات والخدمات (products_services) [${productsList.length}]` },
                  { id: 'quotes' as const, label: `3. عروض الأسعار (quotes) [${quotesList.length}]` },
                  { id: 'contracts' as const, label: `4. العقود (contracts) [${contractsList.length}]` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSchemaEntityTab(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      schemaEntityTab === tab.id
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 1. VENDORS TABLE */}
            {schemaEntityTab === 'vendors' && (
              <div className="space-y-3">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newVendorName.trim()) return;
                    BizJoRelationalSchemaStore.addVendor({
                      vendor_name: newVendorName.trim(),
                      tax_number: newVendorTaxNo.trim() || '200998877',
                      city: 'عمّان',
                      phone: '+962 6 550 9900',
                      payment_terms: 30,
                      withholding_tax_rate: 5,
                      opening_balance_jod: 0,
                    });
                    refreshRelationalLists();
                    setNewVendorName('');
                    setNewVendorTaxNo('');
                    triggerToast('تمت إضافة البائع/المورد بنجاح وربطه بجدول companies (FK: company_id=1) وحساب الذمم الدائنة 2101.');
                  }}
                  className="grid grid-cols-1 sm:grid-cols-4 gap-2"
                >
                  <input
                    type="text"
                    value={newVendorName}
                    onChange={(e) => setNewVendorName(e.target.value)}
                    placeholder="اسم البائع / المورد الجديد..."
                    className="sm:col-span-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                  />
                  <input
                    type="text"
                    value={newVendorTaxNo}
                    onChange={(e) => setNewVendorTaxNo(e.target.value)}
                    placeholder="الرقم الضريبي للمورد (اختياري)..."
                    className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                  >
                    + إضافة بائع (vendors)
                  </button>
                </form>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-right border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                        <th className="py-2 px-2">ID</th>
                        <th className="py-2 px-2">company_id (FK)</th>
                        <th className="py-2 px-2">رمز البائع</th>
                        <th className="py-2 px-2">اسم البائع / المورد</th>
                        <th className="py-2 px-2">الرقم الضريبي</th>
                        <th className="py-2 px-2">اقتطاع WHT</th>
                        <th className="py-2 px-2">حساب الأستاذ (GL)</th>
                        <th className="py-2 px-2">الرصيد الافتتاحي (د.أ)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {vendorsList.map((v) => (
                        <tr key={v.id}>
                          <td className="py-2 px-2 font-mono">{v.id}</td>
                          <td className="py-2 px-2 font-mono text-emerald-600 dark:text-emerald-400">companies#{v.company_id}</td>
                          <td className="py-2 px-2 font-mono font-bold">{v.vendor_code}</td>
                          <td className="py-2 px-2 font-bold">{v.vendor_name}</td>
                          <td className="py-2 px-2 font-mono">{v.tax_number}</td>
                          <td className="py-2 px-2 font-mono">{v.withholding_tax_rate}%</td>
                          <td className="py-2 px-2 font-mono text-sky-600 dark:text-sky-400">{v.ap_gl_account_code} (ذمم دائنة)</td>
                          <td className="py-2 px-2 font-mono font-bold">{v.opening_balance_jod.toFixed(3)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 2. PRODUCTS_SERVICES TABLE */}
            {schemaEntityTab === 'products_services' && (
              <div className="space-y-3">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newProdName.trim()) return;
                    const priceNum = Number(newProdPrice || 100);
                    BizJoRelationalSchemaStore.addProductService({
                      item_type: 'Service',
                      item_name: newProdName.trim(),
                      sku_code: `SKU-JO-00${productsList.length + 1}`,
                      unit_price: priceNum,
                      cost_price: Number((priceNum * 0.4).toFixed(3)),
                      tax_rate: 16,
                      default_vendor_id: vendorsList[0]?.id ?? 1,
                    });
                    refreshRelationalLists();
                    setNewProdName('');
                    triggerToast('تمت إضافة المنتج/الخدمة إلى جدول products_services مع ربطه بجدول companies وحساب الإيرادات 4101.');
                  }}
                  className="grid grid-cols-1 sm:grid-cols-4 gap-2"
                >
                  <input
                    type="text"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    placeholder="اسم المنتج أو الخدمة..."
                    className="sm:col-span-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                  />
                  <input
                    type="number"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    placeholder="سعر الوحدة (د.أ)..."
                    className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                  >
                    + إضافة منتج/خدمة
                  </button>
                </form>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-right border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                        <th className="py-2 px-2">ID</th>
                        <th className="py-2 px-2">company_id (FK)</th>
                        <th className="py-2 px-2">default_vendor_id (FK)</th>
                        <th className="py-2 px-2">SKU</th>
                        <th className="py-2 px-2">اسم المنتج / الخدمة</th>
                        <th className="py-2 px-2">سعر البيع</th>
                        <th className="py-2 px-2">ضريبة المبيعات</th>
                        <th className="py-2 px-2">حساب الإيراد (GL)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {productsList.map((p) => (
                        <tr key={p.id}>
                          <td className="py-2 px-2 font-mono">{p.id}</td>
                          <td className="py-2 px-2 font-mono text-emerald-600 dark:text-emerald-400">companies#{p.company_id}</td>
                          <td className="py-2 px-2 font-mono text-amber-600 dark:text-amber-400">
                            {p.default_vendor_id ? `vendors#${p.default_vendor_id}` : '—'}
                          </td>
                          <td className="py-2 px-2 font-mono font-bold">{p.sku_code}</td>
                          <td className="py-2 px-2 font-bold">{p.item_name}</td>
                          <td className="py-2 px-2 font-mono font-bold">{p.unit_price.toFixed(3)} د.أ</td>
                          <td className="py-2 px-2 font-mono">{p.tax_rate}%</td>
                          <td className="py-2 px-2 font-mono text-sky-600 dark:text-sky-400">{p.revenue_gl_account_code}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. QUOTES TABLE */}
            {schemaEntityTab === 'quotes' && (
              <div className="space-y-3">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const firstProd = productsList[0];
                    if (!firstProd) return;
                    const qtyNum = Math.max(1, Number(newQuoteQty || 1));
                    BizJoRelationalSchemaStore.addQuote({
                      customer_id: 'CUST-01',
                      customer_name: newQuoteCustomer.trim() || 'شركة الفجر للاتصالات ذ.م.م',
                      product_service_id: firstProd.id,
                      subtotal: firstProd.unit_price * qtyNum,
                      tax_rate: firstProd.tax_rate,
                      notes: 'عرض سعر صادر من جدول quotes ومرتبط بجدول companies',
                    });
                    refreshRelationalLists();
                    triggerToast('تم إنشاء عرض السعر (quotes) وربطه بجدول companies و products_services.');
                  }}
                  className="grid grid-cols-1 sm:grid-cols-4 gap-2"
                >
                  <input
                    type="text"
                    value={newQuoteCustomer}
                    onChange={(e) => setNewQuoteCustomer(e.target.value)}
                    placeholder="اسم العميل..."
                    className="sm:col-span-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                  />
                  <input
                    type="number"
                    value={newQuoteQty}
                    onChange={(e) => setNewQuoteQty(e.target.value)}
                    placeholder="الكمية..."
                    className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                  >
                    + إصدار عرض سعر (quotes)
                  </button>
                </form>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-right border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                        <th className="py-2 px-2">رقم العرض</th>
                        <th className="py-2 px-2">company_id (FK)</th>
                        <th className="py-2 px-2">العميل (customer_id)</th>
                        <th className="py-2 px-2">المنتج/الخدمة (FK)</th>
                        <th className="py-2 px-2">الصافي</th>
                        <th className="py-2 px-2">الضريبة (16%)</th>
                        <th className="py-2 px-2">الإجمالي</th>
                        <th className="py-2 px-2">التكامل مع الدورة المحاسبية</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {quotesList.map((q) => (
                        <tr key={q.id}>
                          <td className="py-2 px-2 font-mono font-bold">{q.quote_number}</td>
                          <td className="py-2 px-2 font-mono text-emerald-600 dark:text-emerald-400">companies#{q.company_id}</td>
                          <td className="py-2 px-2 font-bold">{q.customer_name}</td>
                          <td className="py-2 px-2 font-mono text-amber-600 dark:text-amber-400">
                            products_services#{q.product_service_id}
                          </td>
                          <td className="py-2 px-2 font-mono">{q.subtotal.toFixed(3)} د.أ</td>
                          <td className="py-2 px-2 font-mono">{q.tax_amount.toFixed(3)} د.أ</td>
                          <td className="py-2 px-2 font-mono font-bold">{q.total_amount.toFixed(3)} د.أ</td>
                          <td className="py-2 px-2">
                            {q.status === 'ConvertedToInvoice' ? (
                              <span className="px-2 py-1 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-bold">
                                تم الترحيل ({q.converted_invoice_number})
                              </span>
                            ) : (
                              <button
                                onClick={() => {
                                  const res = BizJoRelationalSchemaStore.convertQuoteToInvoiceAndLedger(q.id);
                                  if (res) {
                                    refreshRelationalLists();
                                    triggerToast(
                                      `تم تحويل عرض السعر ${q.quote_number} إلى فاتورة (${res.invoiceNumber}) وترحيل قيد اليومية (${res.voucherNo}) إلى الأستاذ العام!`
                                    );
                                  }
                                }}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold cursor-pointer"
                              >
                                تحويل لفاتورة وقيد يومية ➔
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 4. CONTRACTS TABLE */}
            {schemaEntityTab === 'contracts' && (
              <div className="space-y-3">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newContractTitle.trim()) return;
                    const val = Number(newContractValue || 10000);
                    BizJoRelationalSchemaStore.addContract({
                      party_type: 'Customer',
                      party_id: 'CUST-01',
                      party_name: 'مجموعة الشرق الأوسط للاستثمار',
                      contract_title: newContractTitle.trim(),
                      contract_value: val,
                      billing_cycle: 'Quarterly',
                      source_quote_id: quotesList[0]?.id,
                    });
                    refreshRelationalLists();
                    setNewContractTitle('');
                    triggerToast('تم إبرام العقد في جدول contracts وربطه بجدول companies واحتساب رسوم طوابع الواردات الأردنية.');
                  }}
                  className="grid grid-cols-1 sm:grid-cols-4 gap-2"
                >
                  <input
                    type="text"
                    value={newContractTitle}
                    onChange={(e) => setNewContractTitle(e.target.value)}
                    placeholder="عنوان العقد الجديد..."
                    className="sm:col-span-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                  />
                  <input
                    type="number"
                    value={newContractValue}
                    onChange={(e) => setNewContractValue(e.target.value)}
                    placeholder="قيمة العقد (د.أ)..."
                    className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                  >
                    + إضافة عقد (contracts)
                  </button>
                </form>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-right border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                        <th className="py-2 px-2">رقم العقد</th>
                        <th className="py-2 px-2">company_id (FK)</th>
                        <th className="py-2 px-2">عنوان العقد والطرف</th>
                        <th className="py-2 px-2">قيمة العقد</th>
                        <th className="py-2 px-2">المفوتر</th>
                        <th className="py-2 px-2">المتبقي</th>
                        <th className="py-2 px-2">طوابع الواردات</th>
                        <th className="py-2 px-2">فوترة دفعة العقد</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {contractsList.map((c) => (
                        <tr key={c.id}>
                          <td className="py-2 px-2 font-mono font-bold">{c.contract_number}</td>
                          <td className="py-2 px-2 font-mono text-emerald-600 dark:text-emerald-400">companies#{c.company_id}</td>
                          <td className="py-2 px-2">
                            <div className="font-bold">{c.contract_title}</div>
                            <div className="text-[11px] text-slate-500">{c.party_name} ({c.party_type})</div>
                          </td>
                          <td className="py-2 px-2 font-mono font-bold">{c.contract_value.toFixed(3)} د.أ</td>
                          <td className="py-2 px-2 font-mono text-emerald-600 dark:text-emerald-400">{c.billed_amount.toFixed(3)} د.أ</td>
                          <td className="py-2 px-2 font-mono text-amber-600 dark:text-amber-400">{c.remaining_amount.toFixed(3)} د.أ</td>
                          <td className="py-2 px-2 font-mono">{c.stamp_duty_paid.toFixed(3)} د.أ</td>
                          <td className="py-2 px-2">
                            {c.party_type === 'Customer' && c.remaining_amount > 0 ? (
                              <button
                                onClick={() => {
                                  const res = BizJoRelationalSchemaStore.billContractMilestoneToLedger(c.id, 1500);
                                  if (res) {
                                    refreshRelationalLists();
                                    triggerToast(
                                      `تم فوترة دفعة من العقد ${c.contract_number} بمبلغ 1,500 د.أ (+ضريبة 16%) وإصدار المستند (${res.docNo}) والقيد (${res.voucherNo})!`
                                    );
                                  }
                                }}
                                className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-bold cursor-pointer"
                              >
                                فوترة دفعة لليومية ➔
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-400">عقد مورد / مكتمل</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <pre className="p-4 rounded-2xl bg-slate-950 text-emerald-300 font-mono text-[11px] overflow-x-auto max-h-96 leading-relaxed border border-slate-800" dir="ltr">
            {FULL_21_TABLES_SQL_DDL}
          </pre>
        </div>
      )}
    </div>
  );
}
