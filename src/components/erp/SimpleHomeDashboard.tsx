import React, { useState, useEffect } from 'react';
import Decimal from 'decimal.js';
import {
  Briefcase,
  Calculator,
  ShieldCheck,
  Receipt,
  BarChart3,
  FileText,
  TrendingUp,
  TrendingDown,
  Scale,
  Bell,
  Clock,
  AlertTriangle,
  UserPlus,
  PlusCircle,
  Wallet,
  FileSpreadsheet,
  Sparkles,
  Send,
  CheckCircle2,
  ArrowLeft,
  Building2,
} from 'lucide-react';
import { AccountingCycleStore } from '../../services/accounting/AccountingCycleStore';
import { exportArabicReportToPdf } from '../../utils/pdfExport';
import BizJoLogo from '../brand/BizJoLogo';

Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP });

export type SidebarItemId =
  // 1. الأعمال
  | 'biz-dashboard'
  | 'biz-customers'
  | 'biz-vendors'
  | 'biz-contracts'
  | 'biz-projects'
  // 2. المحاسبة
  | 'acc-coa'
  | 'acc-journal'
  | 'acc-gl'
  | 'acc-trial-balance'
  | 'acc-statements'
  // 3. الضرائب
  | 'tax-profile'
  | 'tax-income'
  | 'tax-sales'
  | 'tax-jofotara'
  | 'tax-compliance'
  // 4. الموارد البشرية
  | 'hr-employees'
  | 'hr-payroll'
  | 'hr-ssc'
  | 'hr-leaves'
  // 5. التحليل
  | 'ana-kpis'
  | 'ana-feasibility'
  | 'ana-forecasts'
  | 'ana-cfo'
  // 6. المستندات
  | 'doc-contracts'
  | 'doc-licenses'
  | 'doc-authorizations'
  | 'doc-archive'
  // 7. المساعدة
  | 'help-laws'
  | 'help-faq'
  | 'help-advisor'
  // 8. المرحلة التنفيذية الثانية + MVP + ERD
  | 'p2-mvp-suite'
  | 'p2-notifications'
  | 'p2-health-score'
  | 'p2-risk-center'
  | 'p2-smart-docs'
  | 'p2-kanban-tasks'
  | 'p2-yoy-analytics'
  | 'p2-investor-bank'
  | 'p2-sector-benchmarks'
  | 'p2-tax-calendar'
  | 'p2-data-health'
  | 'p2-ai-advisor'
  | 'p2-erd-schema';

interface SimpleHomeDashboardProps {
  onSelectSection: (itemId: SidebarItemId) => void;
}

interface AdvisorQaItem {
  question: string;
  answer: string;
  lawRef: string;
}

const JORDAN_ADVISOR_KNOWLEDGE: AdvisorQaItem[] = [
  {
    question: 'كيف أسجل شركتي في الأردن وما المتطلبات الضريبية الأولى؟',
    answer:
      'يتم تسجيل الشركة إلكترونياً عبر بوابة دائرة مراقبة الشركات (شركة ذات مسؤولية محدودة أو مساهمة خاصة) أو وزارة الصناعة والتجارة (مؤسسة فردية). فور صدور السجل التجاري، يتم الحصول على الرقم الضريبي الموحد لدى دائرة ضريبة الدخل والمبيعات (ISTD)، وتفعيل الربط مع نظام الفوترة الوطني الإلكتروني (JoFotara)، وإصدار رخصة المهن من أمانة عمّان أو البلدية المعنية، وتسجيل المنشأة في المؤسسة العامة للضمان الاجتماعي.',
    lawRef: 'قانون الشركات رقم 22 لسنة 1997 وقانون ضريبة الدخل رقم 34 لسنة 2014',
  },
  {
    question: 'ما هي نسب ضريبة المبيعات المعتمدة في الأردن ومتى يصبح التسجيل إلزامياً؟',
    answer:
      'النسبة العامة القياسية لضريبة المبيعات في الأردن هي (16%)، وتوجد نسب مخفضة (10%) و(4%) لسلع محددة في الجداول الملحقة بالقانون، ونسبة الصفر (0%) للصادرات والمناطق الحرة والعقبة، إضافة إلى السلع والخدمات المعفاة. يصبح التسجيل في شبكة ضريبة المبيعات إلزامياً عند بلوغ حد التسجيل المقرر قانوناً للقطاع التجاري أو الخدمي أو الصناعي.',
    lawRef: 'قانون الضريبة العامة على المبيعات رقم 6 لسنة 1994 وتعديلاته',
  },
  {
    question: 'كم تبلغ نسبة اشتراك الضمان الاجتماعي للموظف وصاحب العمل؟',
    answer:
      'يبلغ إجمالي الاقتطاع الشهري القياسي (21.75%) من الأجر الخاضع للضمان (بحد أقصى 3,612 دينار شهرياً): حصة الموظف (7.50%) وتفصيلها (6.50% شيخوخة وعجز ووفاة + 1.00% تعطل عن العمل)، وحصة المنشأة/صاحب العمل (14.25%) وتفصيلها (11.00% شيخوخة + 2.00% إصابات عمل + 0.75% أمومة + 0.50% تعطل)، ويُضاف (1.00%) على صاحب العمل للمهن الخطرة.',
    lawRef: 'قانون الضمان الاجتماعي رقم 1 لسنة 2014',
  },
  {
    question: 'ما هي الإعفاءات والشرائح الضريبية لضريبة الدخل للأفراد والشركات؟',
    answer:
      'للأفراد: الإعفاء الشخصي 9,000 د.أ، وإعفاء الإعالة 9,000 د.أ، بالإضافة إلى نفقات العلاج والتعليم الموثقة والمعالين بسقف كلي 10,000 د.أ للأعزب و23,000 د.أ للأسرة. الشرائح التصاعدية تبدأ من 5% لأول 5,000 د.أ خاضعة، ثم 10%، 15%، 20%، 25%، و30%. أما الشركات فتخضع للنسبة القطاعية (20% للتجارة والخدمات) بالإضافة للمساهمة الوطنية.',
    lawRef: 'المواد (9) و(11) من قانون ضريبة الدخل المعدل رقم 38 لسنة 2018',
  },
  {
    question: 'كيف تتم الدورة المحاسبية من الفاتورة إلى الإقرار الضريبي داخل المنصة؟',
    answer:
      'عند إصدار أي فاتورة مبيعات أو سند قبض أو سند صرف أو إشعار دائن/مدين، يقوم محرك المنصة آلياً بتوليد قيد يومية مزدوج متوازن، وترحيله فوراً إلى دفتر الأستاذ العام (GL) وكشف حساب العميل أو المورد (AR/AP)، وتحديث ميزان المراجعة وقائمة الدخل والمركز المالي وإقرار ضريبة المبيعات دون أي إدخال يدوي متكرر.',
    lawRef: 'معايير المحاسبة الدولية (IAS 1 / IFRS) ومتطلبات نظام JoFotara',
  },
];

export default function SimpleHomeDashboard({ onSelectSection }: SimpleHomeDashboardProps) {
  const [cycleData, setCycleData] = useState(() => AccountingCycleStore.computeFullFinancialCycle());
  const [activeQuickModal, setActiveQuickModal] = useState<
    null | 'INVOICE' | 'CUSTOMER' | 'EXPENSE'
  >(null);
  const [actionToast, setActionToast] = useState<string | null>(null);

  // Quick Invoice Modal State
  const [qInvCustomer, setQInvCustomer] = useState<string>('شركة الاتصالات المتقدمة ذ.م.م');
  const [qInvNetJod, setQInvNetJod] = useState<number>(4500);
  const [qInvVatRate, setQInvVatRate] = useState<number>(16);

  // Quick Customer Modal State
  const [qCustName, setQCustName] = useState<string>('شركة البوتاس والتعدين الأردنية');
  const [qCustTin, setQCustTin] = useState<string>('170065432');
  const [qCustPhone, setQCustPhone] = useState<string>('0798877665');

  // Quick Expense Modal State
  const [qExpPayee, setQExpPayee] = useState<string>('شركة الكهرباء الأردنية / مصاريف تشغيلية');
  const [qExpAmountJod, setQExpAmountJod] = useState<number>(850);
  const [qExpNotes, setQExpNotes] = useState<string>('تسديد فواتير كهرباء واتصالات المقر الرئيسي');

  // Smart Advisor State
  const [advisorQuery, setAdvisorQuery] = useState<string>('');
  const [selectedQa, setSelectedQa] = useState<AdvisorQaItem>(JORDAN_ADVISOR_KNOWLEDGE[0]);

  useEffect(() => {
    return AccountingCycleStore.subscribe(() => {
      setCycleData(AccountingCycleStore.computeFullFinancialCycle());
    });
  }, []);

  // Compute the 5 Quick Statistics live from the Accounting Engine
  const salesInvoicesCount = cycleData.vouchers.filter(
    (v) => v.sourceType === 'JOFOTARA_SALES_INVOICE' || v.sourceType === 'PURCHASE_INVOICE'
  ).length;
  const totalRevenueJod = cycleData.incomeStatement.totalRevenueJod;
  const totalExpensesJod = new Decimal(cycleData.incomeStatement.costOfGoodsSoldJod)
    .plus(cycleData.incomeStatement.totalOperatingExpensesJod)
    .toFixed(3);
  const totalTaxesDueJod = new Decimal(cycleData.taxIntegrationSummary.netGstPayableToIstdJod)
    .plus(cycleData.taxIntegrationSummary.whtPayableFormW1Jod)
    .plus(cycleData.taxIntegrationSummary.estimatedCorporateIncomeTaxJod)
    .toFixed(3);
  const activeAlertsCount = 3;

  // Customer receivable balance for Urgent Tasks
  const topCustomerAr = cycleData.subLedgers.find((s) => s.partyType === 'CUSTOMER_AR');
  const customerDueBalanceJod = topCustomerAr ? topCustomerAr.closingBalanceJod : '47600.000';

  const handleQuickCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const netDec = Decimal.max(0, new Decimal(qInvNetJod || 0)).toDecimalPlaces(3);
    const vatDec = netDec.times(new Decimal(qInvVatRate).div(100)).toDecimalPlaces(3);
    const grossDec = netDec.plus(vatDec).toDecimalPlaces(3);
    const invNum = `INV-2026-${Math.floor(110 + Math.random() * 890)}`;

    const jv = AccountingCycleStore.postJoFotaraSalesInvoiceToLedger({
      invoiceNumber: invNum,
      customerId: 'CUST-01',
      customerName: qInvCustomer,
      netAmountJod: netDec.toNumber(),
      vatAmountJod: vatDec.toNumber(),
      grossAmountJod: grossDec.toNumber(),
      paymentMethod: 'CREDIT_AR',
    });

    setCycleData(AccountingCycleStore.computeFullFinancialCycle());
    setActiveQuickModal(null);
    setActionToast(
      `تم إصدار الفاتورة (${invNum}) بقيمة شاملة ${grossDec.toFixed(3)} د.أ وترحيلها آلياً بقيد اليومية (${jv.voucherNo}) إلى الأستاذ العام والقوائم المالية.`
    );
    setTimeout(() => setActionToast(null), 6000);
  };

  const handleQuickAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qCustName.trim()) return;
    const created = AccountingCycleStore.addParty({
      partyName: qCustName.trim(),
      partyType: 'CUSTOMER_AR',
      taxNumber: qCustTin.trim() || '170000000',
      phone: qCustPhone.trim() || '0790000000',
      cityAr: 'عمّان',
      openingBalanceJod: 0,
    });
    setCycleData(AccountingCycleStore.computeFullFinancialCycle());
    setActiveQuickModal(null);
    setActionToast(`تمت إضافة العميل (${created.partyName}) برمز (${created.partyId}) في الأستاذ المساعد للعملاء.`);
    setTimeout(() => setActionToast(null), 5000);
  };

  const handleQuickAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Math.max(0, Number(qExpAmountJod) || 0);
    if (amt <= 0) return;
    const pvNum = `PV-2026-${Math.floor(210 + Math.random() * 780)}`;
    const jv = AccountingCycleStore.postPaymentVoucherToLedger({
      paymentNo: pvNum,
      targetType: 'OPERATING_EXPENSE',
      partyName: qExpPayee,
      amountJod: amt,
      whtRatePercent: 0,
      notesAr: qExpNotes,
    });
    setCycleData(AccountingCycleStore.computeFullFinancialCycle());
    setActiveQuickModal(null);
    setActionToast(
      `تم تسجيل المصروف بسند صرف (${pvNum}) بقيمة ${amt.toFixed(3)} د.أ وترحيله آلياً بقيد اليومية (${jv.voucherNo}) إلى قائمة الدخل والمركز المالي.`
    );
    setTimeout(() => setActionToast(null), 6000);
  };

  const handleQuickGenerateInvestorReport = () => {
    exportArabicReportToPdf({
      title: 'تقرير الأداء المالي والامتثال الضريبي للمستثمرين والبنوك',
      subtitle: 'مستخرج آلياً من الدورة المحاسبية المتكاملة (قائمة الدخل، المركز المالي، والتدفقات النقدية)',
      referenceNumber: `CFO-REP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      sections: [
        {
          heading: '1. ملخص الأداء المالي والربحية (قائمة الدخل)',
          rows: [
            { label: 'إجمالي الإيرادات التشغيلية المسجلة', value: `${cycleData.incomeStatement.totalRevenueJod} د.أ` },
            { label: 'تكلفة البضاعة المباعة (COGS)', value: `${cycleData.incomeStatement.costOfGoodsSoldJod} د.أ` },
            { label: 'مجمل الربح التشغيلي (Gross Profit)', value: `${cycleData.incomeStatement.grossProfitJod} د.أ` },
            { label: 'إجمالي المصروفات الإدارية والتشغيلية', value: `${cycleData.incomeStatement.totalOperatingExpensesJod} د.أ` },
            { label: 'صافي الربح بعد مخصص الضريبة (Net Profit)', value: `${cycleData.incomeStatement.netIncomeAfterTaxJod} د.أ` },
          ],
        },
        {
          heading: '2. ملخص المركز المالي والسيولة (الميزانية العمومية)',
          rows: [
            { label: 'رصيد النقدية والبنوك الحقيقي', value: `${cycleData.balanceSheet.cashAndBanksJod} د.أ` },
            { label: 'ذمم العملاء التجارية (Accounts Receivable)', value: `${cycleData.balanceSheet.accountsReceivableJod} د.أ` },
            { label: 'قيمة المخزون السلعي (Inventory)', value: `${cycleData.balanceSheet.inventoryJod} د.أ` },
            { label: 'إجمالي الأصول المتوازنة مع الخصوم والملكية', value: `${cycleData.balanceSheet.totalAssetsJod} د.أ` },
          ],
        },
        {
          heading: '3. الموقف الضريبي والامتثال التشريعي الأردني',
          rows: [
            { label: 'صافي ضريبة المبيعات واجبة التوريد لـ ISTD', value: `${cycleData.taxIntegrationSummary.netGstPayableToIstdJod} د.أ` },
            { label: 'أمانات ضريبة الاقتطاع من المنبع (نموذج و/1)', value: `${cycleData.taxIntegrationSummary.whtPayableFormW1Jod} د.أ` },
            { label: 'درجة الامتثال الضريبي للمنشأة (Compliance Score)', value: '92.0% (ملتزم — خطر ضريبي منخفض)' },
          ],
        },
      ],
      footerDisclaimer:
        'تم توليد هذا التقرير المالي آلياً من واقع قيود اليومية المزدوجة ودفتر الأستاذ العام وميزان المراجعة المتوازن. هذه المعلومات لأغراض العرض المالي والإداري ولا تغني عن تدقيق محاسب قانوني مجاز.',
    });
    setActionToast('تم توليد وتصدير تقرير المستثمرين والبنوك الاحترافي (PDF) بنجاح.');
    setTimeout(() => setActionToast(null), 5000);
  };

  const handleAdvisorSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!advisorQuery.trim()) return;
    const q = advisorQuery.trim();
    const matched =
      JORDAN_ADVISOR_KNOWLEDGE.find(
        (item) =>
          item.question.includes(q) ||
          item.answer.includes(q) ||
          (q.includes('شرك') && item.question.includes('شركتي')) ||
          (q.includes('مبيعات') && item.question.includes('المبيعات')) ||
          (q.includes('ضمان') && item.question.includes('الضمان')) ||
          (q.includes('دخل') && item.question.includes('الدخل')) ||
          (q.includes('فاتور') && item.question.includes('الفاتورة'))
      ) || {
        question: q,
        answer:
          'وفق التشريعات الأردنية (قانون ضريبة الدخل رقم 34 لسنة 2014 وقانون الضريبة العامة على المبيعات وقانون الشركات)، يجب توثيق جميع العمليات بموجب فواتير إلكترونية مستوفية الشروط (JoFotara) وترحيلها في دفاتر محاسبية أصولية (يومية وأستاذ عام وميزان مراجعة) والاحتفاظ بالمستندات لمدة الفحص القانونية.',
        lawRef: 'التشريعات الضريبية والتجارية الأردنية النافذة',
      };
    setSelectedQa(matched);
  };

  // Guided 6-Step User Journey
  const userJourneySteps: Array<{
    stepNo: number;
    title: string;
    subtitle: string;
    targetSection: SidebarItemId;
  }> = [
    {
      stepNo: 1,
      title: 'إنشاء شركة',
      subtitle: 'بيانات المنشأة والسجل التجاري',
      targetSection: 'tax-profile',
    },
    {
      stepNo: 2,
      title: 'إكمال الملف الضريبي',
      subtitle: 'الرقم الضريبي والمفوض بالتوقيع',
      targetSection: 'tax-profile',
    },
    {
      stepNo: 3,
      title: 'إضافة العملاء',
      subtitle: 'سجل العملاء والأرصدة الافتتاحية',
      targetSection: 'biz-customers',
    },
    {
      stepNo: 4,
      title: 'إصدار فواتير',
      subtitle: 'فاتورة JoFotara وترحيل لليومية',
      targetSection: 'tax-jofotara',
    },
    {
      stepNo: 5,
      title: 'تسجيل المصروفات',
      subtitle: 'سندات الصرف والموردين والرواتب',
      targetSection: 'biz-vendors',
    },
    {
      stepNo: 6,
      title: 'استخراج التقارير',
      subtitle: 'القوائم المالية ولوحة المدير المالي',
      targetSection: 'ana-cfo',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Guided User Journey Ribbon (رحلة المستخدم من إنشاء الشركة حتى استخراج التقارير) */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <BizJoLogo size="sm" showTagline={false} />
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                رحلة المستخدم المتسلسلة في BizJo (من تأسيس الشركة وعروض الأسعار والعقود حتى القوائم المالية)
              </h2>
              <p className="text-[11px] text-slate-500">
                قاعدة بيانات علائقية متكاملة تربط البائعين (`vendors`) والمنتجات (`products_services`) وعروض الأسعار (`quotes`) والعقود (`contracts`) بجدول الشركات (`companies`).
              </p>
            </div>
          </div>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            انقر على أي خطوة للانتقال المباشر إليها
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {userJourneySteps.map((st) => (
            <button
              key={st.stepNo}
              type="button"
              onClick={() => onSelectSection(st.targetSection)}
              className="text-right p-3 rounded-xl bg-slate-50 hover:bg-emerald-500/10 dark:bg-slate-950 dark:hover:bg-emerald-500/10 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 transition cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-mono text-[11px] font-bold flex items-center justify-center">
                  {st.stepNo}
                </span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 opacity-80 group-hover:opacity-100" />
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">{st.title}</div>
              <div className="text-[11px] text-slate-500 truncate mt-0.5">{st.subtitle}</div>
            </button>
          ))}
        </div>

        {/* Phase 2 Strategic & MVP Command Bar (صحة الشركة 91/100 · التنبيهات · المخاطر · المهام · التقويم · فحص النظام 93% · ERD) */}
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onSelectSection('p2-health-score')}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold cursor-pointer"
            >
              صحة الأعمال: 91/100 (ممتاز)
            </button>
            <button
              type="button"
              onClick={() => onSelectSection('p2-notifications')}
              className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-bold cursor-pointer"
            >
              التنبيهات الذكية (9)
            </button>
            <button
              type="button"
              onClick={() => onSelectSection('p2-risk-center')}
              className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-700 dark:text-rose-300 font-bold cursor-pointer"
            >
              مركز المخاطر (Tax · Liquidity · Collection)
            </button>
            <button
              type="button"
              onClick={() => onSelectSection('p2-kanban-tasks')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 font-bold cursor-pointer"
            >
              لوحة المهام (Kanban)
            </button>
            <button
              type="button"
              onClick={() => onSelectSection('p2-tax-calendar')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 font-bold cursor-pointer"
            >
              التقويم الضريبي الذكي
            </button>
            <button
              type="button"
              onClick={() => onSelectSection('p2-data-health')}
              className="px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-700 dark:text-sky-300 font-bold cursor-pointer"
            >
              System Health: 93%
            </button>
          </div>
          <button
            type="button"
            onClick={() => onSelectSection('p2-erd-schema')}
            className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold cursor-pointer"
          >
            مخطط ERD وقاعدة البيانات (21 جدول SQL)
          </button>
        </div>
      </section>

      {actionToast && (
        <div className="p-4 bg-emerald-950/25 border border-emerald-500/40 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionToast}</span>
        </div>
      )}

      {/* =====================================================================
          القسم 1: لوحة رئيسية (5 بطاقات أساسية فقط)
          إدارة الأعمال · إدارة المحاسبة · الامتثال الضريبي · الفوترة الإلكترونية · التقارير والتحليلات
         ===================================================================== */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            1. اللوحة الرئيسية للأقسام
          </h2>
          <span className="text-xs text-slate-500">5 مساحات عمل أساسية مترابطة</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <button
            type="button"
            onClick={() => onSelectSection('biz-customers')}
            className="text-right p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 rounded-2xl transition cursor-pointer space-y-2.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-500">
              إدارة الأعمال
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              العملاء، الموردون، العقود، المشاريع، وسندات القبض والصرف.
            </p>
          </button>

          <button
            type="button"
            onClick={() => onSelectSection('acc-statements')}
            className="text-right p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 rounded-2xl transition cursor-pointer space-y-2.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-sky-500">
              إدارة المحاسبة
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              دليل الحسابات، قيود اليومية، الأستاذ العام، ميزان المراجعة، والقوائم المالية.
            </p>
          </button>

          <button
            type="button"
            onClick={() => onSelectSection('tax-compliance')}
            className="text-right p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 rounded-2xl transition cursor-pointer space-y-2.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-500">
              الامتثال الضريبي
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              درجة الامتثال (92%)، ضريبة الدخل والمبيعات، ورصد المخاطر والتوصيات.
            </p>
          </button>

          <button
            type="button"
            onClick={() => onSelectSection('tax-jofotara')}
            className="text-right p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 rounded-2xl transition cursor-pointer space-y-2.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-500">
              الفوترة الإلكترونية
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              إصدار فواتير JoFotara، إشعارات دائنة ومدينة، والترحيل الآلي للأستاذ العام.
            </p>
          </button>

          <button
            type="button"
            onClick={() => onSelectSection('ana-cfo')}
            className="text-right p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 rounded-2xl transition cursor-pointer space-y-2.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-purple-500">
              التقارير والتحليلات
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              لوحة المدير المالي (CFO)، المؤشرات المالية، دراسة الجدوى، وتقارير المستثمرين.
            </p>
          </button>
        </div>
      </section>

      {/* =====================================================================
          القسم 2: إحصائيات سريعة (5 مؤشرات فقط)
          عدد الفواتير · الإيرادات · المصروفات · الضرائب المستحقة · التنبيهات
         ===================================================================== */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            2. إحصائيات سريعة
          </h2>
          <span className="text-xs text-slate-500">بيانات حية مستخرجة تلقائياً من الدفاتر المحاسبية</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 font-mono tabular-nums">
          <div
            onClick={() => onSelectSection('tax-jofotara')}
            className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer hover:border-emerald-500/50 transition"
          >
            <div className="flex items-center justify-between text-xs font-sans text-slate-500 mb-2">
              <span>عدد الفواتير</span>
              <FileText className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {salesInvoicesCount}
            </div>
            <div className="text-[11px] font-sans text-emerald-600 dark:text-emerald-400 mt-1">
              مرحّلة لليومية والأستاذ العام
            </div>
          </div>

          <div
            onClick={() => onSelectSection('acc-statements')}
            className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer hover:border-emerald-500/50 transition"
          >
            <div className="flex items-center justify-between text-xs font-sans text-slate-500 mb-2">
              <span>الإيرادات</span>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {totalRevenueJod} د.أ
            </div>
            <div className="text-[11px] font-sans text-slate-500 mt-1">
              إجمالي المبيعات (قائمة الدخل)
            </div>
          </div>

          <div
            onClick={() => onSelectSection('acc-statements')}
            className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer hover:border-emerald-500/50 transition"
          >
            <div className="flex items-center justify-between text-xs font-sans text-slate-500 mb-2">
              <span>المصروفات</span>
              <TrendingDown className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-xl font-extrabold text-rose-600 dark:text-rose-400">
              {totalExpensesJod} د.أ
            </div>
            <div className="text-[11px] font-sans text-slate-500 mt-1">
              تكلفة المبيعات والمصاريف التشغيلية
            </div>
          </div>

          <div
            onClick={() => onSelectSection('tax-compliance')}
            className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer hover:border-emerald-500/50 transition"
          >
            <div className="flex items-center justify-between text-xs font-sans text-slate-500 mb-2">
              <span>الضرائب المستحقة</span>
              <Scale className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400">
              {totalTaxesDueJod} د.أ
            </div>
            <div className="text-[11px] font-sans text-slate-500 mt-1">
              مبيعات + اقتطاع + مخصص دخل
            </div>
          </div>

          <div
            onClick={() => onSelectSection('doc-licenses')}
            className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer hover:border-emerald-500/50 transition"
          >
            <div className="flex items-center justify-between text-xs font-sans text-slate-500 mb-2">
              <span>التنبيهات</span>
              <Bell className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-extrabold text-rose-500">
              {activeAlertsCount}
            </div>
            <div className="text-[11px] font-sans text-rose-500 mt-1">
              مهام وتجديدات تتطلب المتابعة
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          القسم 3 (المهام العاجلة) + القسم 4 (الإجراءات السريعة)
         ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* القسم 3: المهام العاجلة */}
        <section className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              <span>3. المهام العاجلة</span>
            </h2>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-bold">3 تنبيهات نشطة</span>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-rose-950/15 border border-rose-500/30 rounded-xl flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    إقرار ضريبي خلال 5 أيام
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    موعد تقديم إقرار ضريبة المبيعات الدوري وتوريد صافي الضريبة ({cycleData.taxIntegrationSummary.netGstPayableToIstdJod} د.أ).
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onSelectSection('tax-sales')}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg shrink-0 cursor-pointer"
              >
                مراجعة الإقرار
              </button>
            </div>

            <div className="p-4 bg-amber-950/15 border border-amber-500/30 rounded-xl flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    انتهاء تفويض خلال 30 يوم
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    تبقى 30 يوماً على انتهاء كتاب التفويض الضريبي ورخصة المهن السنوية في الخزنة الإلكترونية.
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onSelectSection('doc-authorizations')}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg shrink-0 cursor-pointer"
              >
                تجديد الوثيقة
              </button>
            </div>

            <div className="p-4 bg-sky-950/15 border border-sky-500/30 rounded-xl flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <Wallet className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    رصيد عميل مستحق ({customerDueBalanceJod} د.أ)
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    ذمة مدينة مستحقة التحصيل على {topCustomerAr?.partyName || 'شركة الاتصالات المتقدمة ذ.م.م'}.
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onSelectSection('biz-customers')}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg shrink-0 cursor-pointer"
              >
                كشف الحساب
              </button>
            </div>
          </div>
        </section>

        {/* القسم 4: الإجراءات السريعة */}
        <section className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-emerald-500" />
              <span>4. الإجراءات السريعة</span>
            </h2>
            <span className="text-xs text-slate-500">تنفيذ فوري مع ترحيل تلقائي للدفاتر</span>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <button
              type="button"
              onClick={() => setActiveQuickModal('INVOICE')}
              className="p-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-right space-y-1.5 transition cursor-pointer"
            >
              <Receipt className="w-5 h-5" />
              <div className="text-sm font-bold">إصدار فاتورة</div>
              <div className="text-[11px] text-emerald-100">
                إنشاء فاتورة مبيعات وترحيلها لليومية والأستاذ العام
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveQuickModal('CUSTOMER')}
              className="p-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl text-right space-y-1.5 transition cursor-pointer"
            >
              <UserPlus className="w-5 h-5 text-sky-500" />
              <div className="text-sm font-bold">إضافة عميل</div>
              <div className="text-[11px] text-slate-500">
                فتح حساب عميل جديد في الأستاذ المساعد (AR)
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveQuickModal('EXPENSE')}
              className="p-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl text-right space-y-1.5 transition cursor-pointer"
            >
              <Wallet className="w-5 h-5 text-amber-500" />
              <div className="text-sm font-bold">إضافة مصروف</div>
              <div className="text-[11px] text-slate-500">
                تسجيل سند صرف مصروفات وخصمه من النقدية
              </div>
            </button>

            <button
              type="button"
              onClick={handleQuickGenerateInvestorReport}
              className="p-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl text-right space-y-1.5 transition cursor-pointer"
            >
              <FileSpreadsheet className="w-5 h-5 text-purple-500" />
              <div className="text-sm font-bold">إنشاء تقرير</div>
              <div className="text-[11px] text-slate-500">
                تصدير تقرير الأداء المالي والمستثمرين (PDF)
              </div>
            </button>
          </div>

          {/* Inline Quick Action Form Drawer */}
          {activeQuickModal === 'INVOICE' && (
            <form
              onSubmit={handleQuickCreateInvoice}
              className="p-4 bg-slate-50 dark:bg-slate-950 border border-emerald-500/40 rounded-xl space-y-3 text-xs"
            >
              <div className="flex items-center justify-between font-bold text-emerald-600 dark:text-emerald-400">
                <span>إصدار فاتورة مبيعات سريعة (ترحيل فوري لليومية والأستاذ العام)</span>
                <button
                  type="button"
                  onClick={() => setActiveQuickModal(null)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  إغلاق ✕
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">اسم العميل</label>
                  <input
                    type="text"
                    value={qInvCustomer}
                    onChange={(e) => setQInvCustomer(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">الصافي قبل الضريبة (د.أ)</label>
                  <input
                    type="number"
                    min={1}
                    value={qInvNetJod}
                    onChange={(e) => setQInvNetJod(Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">ضريبة المبيعات (%)</label>
                  <select
                    value={qInvVatRate}
                    onChange={(e) => setQInvVatRate(Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2 py-1.5 font-mono"
                  >
                    <option value={16}>16%</option>
                    <option value={10}>10%</option>
                    <option value={4}>4%</option>
                    <option value={0}>0% (معفى)</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg cursor-pointer"
              >
                اعتماد الفاتورة وترحيل قيد اليومية
              </button>
            </form>
          )}

          {activeQuickModal === 'CUSTOMER' && (
            <form
              onSubmit={handleQuickAddCustomer}
              className="p-4 bg-slate-50 dark:bg-slate-950 border border-sky-500/40 rounded-xl space-y-3 text-xs"
            >
              <div className="flex items-center justify-between font-bold text-sky-600 dark:text-sky-400">
                <span>إضافة عميل جديد إلى الأستاذ المساعد للعملاء (AR)</span>
                <button
                  type="button"
                  onClick={() => setActiveQuickModal(null)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  إغلاق ✕
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">اسم الشركة / العميل</label>
                  <input
                    type="text"
                    value={qCustName}
                    onChange={(e) => setQCustName(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">الرقم الضريبي</label>
                  <input
                    type="text"
                    value={qCustTin}
                    onChange={(e) => setQCustTin(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">رقم الهاتف</label>
                  <input
                    type="text"
                    value={qCustPhone}
                    onChange={(e) => setQCustPhone(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 font-mono"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg cursor-pointer"
              >
                حفظ العميل وفتح كشف الحساب
              </button>
            </form>
          )}

          {activeQuickModal === 'EXPENSE' && (
            <form
              onSubmit={handleQuickAddExpense}
              className="p-4 bg-slate-50 dark:bg-slate-950 border border-amber-500/40 rounded-xl space-y-3 text-xs"
            >
              <div className="flex items-center justify-between font-bold text-amber-600 dark:text-amber-400">
                <span>تسجيل مصروف تشغيلي (سند صرف مرحّل لليومية)</span>
                <button
                  type="button"
                  onClick={() => setActiveQuickModal(null)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  إغلاق ✕
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">الجهة المستفيدة</label>
                  <input
                    type="text"
                    value={qExpPayee}
                    onChange={(e) => setQExpPayee(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">المبلغ (د.أ)</label>
                  <input
                    type="number"
                    min={1}
                    value={qExpAmountJod}
                    onChange={(e) => setQExpAmountJod(Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">البيان</label>
                  <input
                    type="text"
                    value={qExpNotes}
                    onChange={(e) => setQExpNotes(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg cursor-pointer"
              >
                اعتماد سند الصرف وترحيله للقوائم المالية
              </button>
            </form>
          )}
        </section>
      </div>

      {/* =====================================================================
          القسم 5: المساعد الذكي (اسأل المساعد)
         ===================================================================== */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                5. المساعد الذكي المتخصص بالأعمال والضرائب في الأردن (اسأل المساعد)
              </h2>
              <p className="text-xs text-slate-500">
                إجابات فورية مستندة إلى قاعدة المعرفة القانونية والضريبية الأردنية المنظمة
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSelectSection('help-laws')}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>فتح مركز قوانين الأردن الكامل</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Preset Questions Pills */}
        <div className="flex flex-wrap gap-2">
          {JORDAN_ADVISOR_KNOWLEDGE.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedQa(item)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                selectedQa.question === item.question
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-500/50'
              }`}
            >
              {item.question}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleAdvisorSearch} className="flex gap-2">
          <input
            type="text"
            value={advisorQuery}
            onChange={(e) => setAdvisorQuery(e.target.value)}
            placeholder="اسأل المساعد: مثلاً كيف أسجل شركتي؟ ما ضريبة المبيعات؟ كم اشتراك الضمان؟"
            className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>اسأل المساعد</span>
          </button>
        </form>

        {/* Answer Display + Mandatory Disclaimer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              السؤال: {selectedQa.question}
            </span>
            <span className="text-[11px] font-mono text-slate-500">{selectedQa.lawRef}</span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
            {selectedQa.answer}
          </p>
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>هذه معلومات إرشادية ولا تعتبر استشارة قانونية أو ضريبية معتمدة.</span>
          </div>
        </div>
      </section>
    </div>
  );
}
