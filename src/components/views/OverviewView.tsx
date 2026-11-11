import React, { useState, useEffect } from 'react';
import Decimal from 'decimal.js';
import {
  Calculator,
  TrendingUp,
  ArrowLeft,
  CheckCircle2,
  Plus,
  Trash2,
  Layers,
  Building2,
  Database,
  RotateCcw,
  Save,
  AlertTriangle,
} from 'lucide-react';
import { JordanIncomeTaxEngine } from '../../engine/jordanCalculators';
import { FeasibilityEngine } from '../../engine/feasibilityEngine';
import ExecutiveFinancialDashboard from '../overview/ExecutiveFinancialDashboard';
import CompanyAndTaxProfileForms from '../profile/CompanyAndTaxProfileForms';
import { SystemGovernanceService } from '../../services/governance/SystemGovernanceService';
import {
  RegulatoryRatesStore,
  RegulatoryDatabaseConfig,
} from '../../services/config/RegulatoryRatesStore';
import ammanHeroImg from '../../assets/images/amman_financial_district_hero_1794306426838.jpg';

interface OverviewViewProps {
  onNavigateToTab: (tab: string, subTab?: string) => void;
}

export default function OverviewView({ onNavigateToTab }: OverviewViewProps) {
  // Dynamic Regulatory Database Config State (للشرائح الضريبية والإعفاءات ونسب الضمان القابلة للتحديث)
  const [regConfig, setRegConfig] = useState<RegulatoryDatabaseConfig>(() =>
    RegulatoryRatesStore.getConfig()
  );
  const [showRegDbEditor, setShowRegDbEditor] = useState<boolean>(false);
  const [regSaveBanner, setRegSaveBanner] = useState<string | null>(null);

  useEffect(() => {
    return RegulatoryRatesStore.subscribe(() => {
      setRegConfig(RegulatoryRatesStore.getConfig());
    });
  }, []);

  // Personal Income Tax & SSC State
  const [monthlySalary, setMonthlySalary] = useState<number>(1850);
  const [annualBonus, setAnnualBonus] = useState<number>(1500);
  const [isMarried, setIsMarried] = useState<boolean>(true);
  const [dependentsCount, setDependentsCount] = useState<number>(2);
  const [documentedExpenses, setDocumentedExpenses] = useState<number>(2000);
  const [isHazardousJob, setIsHazardousJob] = useState<boolean>(false);
  const [deductEmployeeSscFromTax, setDeductEmployeeSscFromTax] = useState<boolean>(false);

  // SME SaaS Subscription Plans State
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');
  const [selectedSaasPlan, setSelectedSaasPlan] = useState<string>('SME_GROWTH');
  const [saasActivationNotice, setSaasActivationNotice] = useState<string | null>(null);

  // Feasibility Study State
  const [projectName, setProjectName] = useState<string>('مصنع تعبئة وتغليف غذائي - القسطل الصناعية');
  const [capex, setCapex] = useState<number>(120000);
  const [discountRate, setDiscountRate] = useState<number>(11);
  const [cashFlows, setCashFlows] = useState<number[]>([32000, 38000, 44000, 50000, 58000]);

  // Calculate Tax & SSC using exact Decimal.js + dynamic RegulatoryRatesStore
  const grossAnnualDec = new Decimal(monthlySalary || 0).times(12).plus(new Decimal(annualBonus || 0));
  const sscResult = JordanIncomeTaxEngine.calculateSocialSecurity({
    monthlyGrossSalary: monthlySalary,
    isHazardousOccupation: isHazardousJob,
  });

  const taxResult = JordanIncomeTaxEngine.calculatePersonalTax({
    grossAnnualIncome: grossAnnualDec.toNumber(),
    isMarried,
    dependentsCount,
    medicalAndEducationExpenses: documentedExpenses,
    deductEmployeeSscFromTax,
    annualEmployeeSscAmount: Number(sscResult.annualEmployeeSscJod),
  });

  const netMonthlySalaryAfterSscAndTaxDec = Decimal.max(
    0,
    new Decimal(monthlySalary || 0)
      .minus(new Decimal(sscResult.employeeShareJod))
      .minus(new Decimal(taxResult.monthlyWithholding))
  ).toDecimalPlaces(3, Decimal.ROUND_HALF_UP);

  // Calculate Feasibility
  const feasibilityResult = FeasibilityEngine.evaluateProject({
    projectName,
    initialInvestmentCapex: capex,
    discountRatePercent: discountRate,
    projectLifetimeYears: cashFlows.length,
    projectedAnnualCashFlows: cashFlows,
  });

  const updateCashFlow = (index: number, val: number) => {
    const updated = [...cashFlows];
    updated[index] = val;
    setCashFlows(updated);
  };

  const addCashFlowYear = () => {
    if (cashFlows.length >= 12) return;
    const lastVal = cashFlows[cashFlows.length - 1] || 40000;
    setCashFlows([...cashFlows, lastVal + 5000]);
  };

  const removeCashFlowYear = () => {
    if (cashFlows.length <= 2) return;
    setCashFlows(cashFlows.slice(0, -1));
  };

  const saasPlans = [
    {
      id: 'STARTER',
      name: 'باقة المنشآت الناشئة (Starter SME)',
      monthlyJod: '25.000',
      annualJod: '240.000',
      desc: 'مناسبة للمؤسسات الفردية والشركات الناشئة في الأردن',
      features: [
        'إصدار وأرشفة حتى 300 فاتورة إلكترونية شهرياً (TLV QR & SHA-256)',
        'حاسبات ضريبة الدخل والضمان الاجتماعي وضريبة المبيعات بدقة الفلس',
        'توثيق تلقائي لسجل الموافقات (Consent Log) وسجل النشاط (Audit Log)',
      ],
    },
    {
      id: 'SME_GROWTH',
      name: 'باقة الشركات الصغيرة والمتوسطة (SME Growth)',
      monthlyJod: '59.000',
      annualJod: '566.000',
      desc: 'النموذج المتكامل للشركات ذات المسؤولية المحدودة والمصانع والتجارة',
      features: [
        'فواتير إلكترونية غير محدودة + محاكي فحص التشفير والربط التقني',
        'نظام الجرد المستمر للمخزون (WAC / FIFO) والتسوية البنكية الآلية (CliQ)',
        'تقدير الإقرار الضريبي السنوي (PDF) وتصدير حزمة التدقيق (SAF-T)',
      ],
    },
    {
      id: 'ENTERPRISE_FIRM',
      name: 'باقة المجموعات ومكاتب المحاسبة (Multi-Entity)',
      monthlyJod: '129.000',
      annualJod: '1238.000',
      desc: 'لإدارة عدة منشآت وملفات ضريبية وصلاحيات متعددة للمفوضين',
      features: [
        'إدارة حتى 15 شركة وملف ضريبي مستقل ضمن مساحة عمل سحابية واحدة',
        'محرك فحص الأسعار التحويلية للأطراف ذات العلاقة واقتطاع المنبع (و/1)',
        'خزنة أرشيف مشفرة (AES-256-GCM) مع صلاحيات تدقيق وسجل رقابي شامل',
      ],
    },
  ];

  const handleSelectSaasPlan = (planName: string, priceStr: string) => {
    SystemGovernanceService.recordAuditAction({
      actorName: 'مدير المنشأة',
      moduleName: 'اشتراكات منصة SaaS',
      actionLabel: `تغيير باقة الاشتراك السحابي إلى (${planName})`,
      oldValue: selectedSaasPlan,
      newValue: `${planName} (${priceStr} د.أ)`,
    });
    setSaasActivationNotice(
      `تم اختيار وتفعيل «${planName}» بقيمة ${priceStr} د.أ (${
        billingCycle === 'MONTHLY' ? 'اشتراك شهري' : 'اشتراك سنوي بخصم 20%'
      }) وتوثيق العملية في سجل النشاط.`
    );
    setTimeout(() => setSaasActivationNotice(null), 5000);
  };

  return (
    <div className="space-y-12">
      {/* Hero Split Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-10">
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 font-bold">
              <Building2 className="w-4 h-4 shrink-0" />
              <span>منصة SaaS أردنية للمحاسبة والفوترة الإلكترونية والامتثال الضريبي للشركات الصغيرة والمتوسطة</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              منصة الأعمال والمحاسبة والامتثال الضريبي الأردنية
            </h1>

            <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              منصة رقمية سحابية (SaaS) متكاملة تساعد الشركات الصغيرة والمتوسطة ورواد الأعمال على إدارة الحسابات والضرائب والفواتير الإلكترونية وتوثيق سجلات النشاط والموافقات وتحليل الأداء المالي وفق التشريعات والأنظمة المعمول بها في المملكة الأردنية الهاشمية.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => {
                const el = document.getElementById('company-tax-profile-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>ابدأ الآن</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('sme-saas-pricing-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 font-semibold text-sm rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              باقات اشتراك الشركات (SaaS)
            </button>
            <button
              onClick={() => onNavigateToTab('tax', 'jofotara-pos')}
              className="px-5 py-3 border border-slate-300 dark:border-slate-700 hover:border-slate-400 text-slate-700 dark:text-slate-300 font-semibold text-sm rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              الدخول إلى المنصة
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('services-overview-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-5 py-3 border border-emerald-600/40 text-emerald-600 dark:text-emerald-400 font-semibold text-sm rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              استكشف الخدمات
            </button>
          </div>
        </div>

        <div className="lg:col-span-5 relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 min-h-[280px]">
          <img
            src={ammanHeroImg}
            alt="منطقة العبدلي المالية والتجارية في العاصمة الأردنية عمان"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent flex flex-col justify-end p-6">
            <div className="text-xs text-emerald-300 font-medium mb-1">
              حلول برمجية سحابية (SaaS) للمحاسبة والضرائب والفوترة الإلكترونية للشركات الصغيرة والمتوسطة في الأردن.
            </div>
            <p className="text-sm font-bold text-white">
              يدعم التكامل الإلكتروني مع الأنظمة والمنصات المتاحة وفق المتطلبات الفنية المعلنة من الجهات المعنية.
            </p>
          </div>
        </div>
      </section>

      {/* قسم الخدمات (4 بطاقات رئيسية) */}
      <section id="services-overview-section" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigateToTab('accounting')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/60 rounded-xl p-5 cursor-pointer transition space-y-2"
        >
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">01. قسم الخدمات</div>
          <div className="text-lg font-bold text-slate-900 dark:text-white">المحاسبة</div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            إدارة مالية متكاملة تساعدك على تنظيم الحسابات وتتبع الإيرادات والمصروفات وإعداد التقارير المالية بسهولة ودقة.
          </p>
        </div>

        <div
          onClick={() => onNavigateToTab('tax')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/60 rounded-xl p-5 cursor-pointer transition space-y-2"
        >
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">02. قسم الخدمات</div>
          <div className="text-lg font-bold text-slate-900 dark:text-white">الضرائب</div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            أدوات متخصصة لمساعدة الأفراد والشركات على فهم واحتساب الالتزامات الضريبية وفق القوانين والتعليمات الأردنية المعلنة.
          </p>
        </div>

        <div
          onClick={() => onNavigateToTab('tax', 'jofotara-pos')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/60 rounded-xl p-5 cursor-pointer transition space-y-2"
        >
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">03. قسم الخدمات</div>
          <div className="text-lg font-bold text-slate-900 dark:text-white">الفوترة الإلكترونية</div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            حلول ذكية لإدارة الفواتير الإلكترونية وتنظيم عمليات الإصدار والأرشفة والتتبع بما يتوافق مع المتطلبات الفنية المتاحة.
          </p>
        </div>

        <div
          onClick={() => onNavigateToTab('audit')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/60 rounded-xl p-5 cursor-pointer transition space-y-2"
        >
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">04. قسم الخدمات</div>
          <div className="text-lg font-bold text-slate-900 dark:text-white">تحليل الأعمال</div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            تقارير ولوحات معلومات تفاعلية تساعدك على متابعة الأداء المالي واتخاذ قرارات أكثر دقة وفعالية.
          </p>
        </div>
      </section>

      {/* قسم الآلات الحاسبة التفاعلية (تفاعلي بالكامل) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => {
            const el = document.getElementById('income-tax-ssc-calculator');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/60 rounded-xl p-5 space-y-2 cursor-pointer transition flex flex-col justify-between"
        >
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">حاسبة ضريبة الدخل</div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-1">
              أداة تقديرية تساعد على احتساب ضريبة الدخل استناداً إلى البيانات التي يقوم المستخدم بإدخالها.
            </p>
          </div>
          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 pt-2">
            <span>انتقل إلى حاسبة ضريبة الدخل</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </div>
        </div>

        <div
          onClick={() => {
            const el = document.getElementById('income-tax-ssc-calculator');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/60 rounded-xl p-5 space-y-2 cursor-pointer transition flex flex-col justify-between"
        >
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">حاسبة الضمان الاجتماعي</div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-1">
              احسب الاشتراكات والمستحقات التقديرية وفق النسب والتعليمات المعلنة من الجهات المختصة.
            </p>
          </div>
          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 pt-2">
            <span>انتقل إلى حاسبة الضمان الاجتماعي</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </div>
        </div>

        <div
          onClick={() => onNavigateToTab('tax', 'jofotara-pos')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/60 rounded-xl p-5 space-y-2 cursor-pointer transition flex flex-col justify-between"
        >
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">حاسبة المبيعات</div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-1">
              احسب ضريبة المبيعات والتكاليف والالتزامات المرتبطة بها بسرعة وسهولة.
            </p>
          </div>
          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 pt-2">
            <span>فتح حاسبة المبيعات والفوترة</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </div>
        </div>
      </section>

      {/* Live Executive Financial Dashboard (مركز التحليلات والمؤشرات المالية) */}
      <ExecutiveFinancialDashboard />

      {/* باقات اشتراك منصة SaaS الأردنية للشركات الصغيرة والمتوسطة */}
      <section
        id="sme-saas-pricing-section"
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mb-1">
              نموذج الأعمال السحابي (Jordanian SME Accounting & E-Invoicing SaaS)
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-6 h-6 text-emerald-500 shrink-0" />
              <span>باقات اشتراك منصة SaaS للمحاسبة والفوترة الإلكترونية للشركات الصغيرة والمتوسطة</span>
            </h2>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setBillingCycle('MONTHLY')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                billingCycle === 'MONTHLY'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              اشتراك شهري
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('ANNUAL')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                billingCycle === 'ANNUAL'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              اشتراك سنوي (وفر 20%)
            </button>
          </div>
        </div>

        {saasActivationNotice && (
          <div className="p-4 bg-emerald-950/20 border border-emerald-600/40 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{saasActivationNotice}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {saasPlans.map((plan) => {
            const isSelected = selectedSaasPlan === plan.id;
            const price = billingCycle === 'MONTHLY' ? plan.monthlyJod : plan.annualJod;
            return (
              <div
                key={plan.id}
                className={`p-6 rounded-2xl border flex flex-col justify-between space-y-5 transition ${
                  isSelected
                    ? 'border-2 border-emerald-500 bg-emerald-950/10'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                  </div>
                  <p className="text-xs text-slate-500">{plan.desc}</p>
                  <div className="pt-2 pb-3 border-b border-slate-200 dark:border-slate-800 font-mono">
                    <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                      {price} د.أ
                    </span>
                    <span className="text-xs font-sans text-slate-500 mr-1.5">
                      / {billingCycle === 'MONTHLY' ? 'شهرياً' : 'سنوياً'}
                    </span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedSaasPlan(plan.id);
                    handleSelectSaasPlan(plan.name, price);
                  }}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white'
                  }`}
                >
                  {isSelected ? 'الباقة المختارة حالياً — تفعيل الاشتراك' : 'اختيار هذه الباقة للمنشأة'}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* نماذج معلومات المنشأة والملف الضريبي وبيانات المالك والمفوض بالتوقيع */}
      <CompanyAndTaxProfileForms />

      {/* Interactive Engine 1.1: Jordan Income Tax & Social Security Calculator + Dynamic Regulatory Database Editor */}
      <section
        id="income-tax-ssc-calculator"
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-1">
              حاسبة ضريبة الدخل وحاسبة الضمان الاجتماعي التقديرية (مرتبطة بقاعدة بيانات تشريعية قابلة للتحديث — الإصدار: {regConfig.versionTag})
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
              <Calculator className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>حاسبة ضريبة الدخل وحاسبة الضمان الاجتماعي التفصيلية</span>
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowRegDbEditor(!showRegDbEditor)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition cursor-pointer"
            >
              <Database className="w-3.5 h-3.5" />
              <span>
                {showRegDbEditor
                  ? 'إغلاق محرر قاعدة بيانات الشرائح والنسب'
                  : 'قاعدة بيانات الشرائح الضريبية ونسب الضمان (قابلة للتعديل)'}
              </span>
            </button>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
              الدخل السنوي الإجمالي: <strong className="text-slate-900 dark:text-white">{taxResult.grossIncome} د.أ</strong>
            </div>
          </div>
        </div>

        {regSaveBanner && (
          <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/40 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{regSaveBanner}</span>
          </div>
        )}

        {/* محرر قاعدة بيانات الشرائح الضريبية والإعفاءات ونسب الضمان الاجتماعي */}
        {showRegDbEditor && (
          <div className="p-5 bg-slate-50 dark:bg-slate-950 border-2 border-emerald-500/40 rounded-2xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-500" />
                  <span>قاعدة البيانات التشريعية المرنة للشرائح الضريبية والإعفاءات ونسب الضمان الاجتماعي</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  صُممت هذه القاعدة استجابةً لتوصية الخبير الضريبي بحيث تكون جميع الشرائح والإعفاءات ونسب التأمينات الفرعية مخزنة في سجل مركزي قابل للتحديث الفوري عند صدور أي تعديل قانوني.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    RegulatoryRatesStore.saveConfig(regConfig);
                    setRegSaveBanner('تم حفظ وتطبيق الشرائح الضريبية والإعفاءات ونسب الضمان الاجتماعي في قاعدة البيانات وتوثيقها في سجل النشاط.');
                    setTimeout(() => setRegSaveBanner(null), 5000);
                  }}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>حفظ التعديلات التشريعية</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const def = RegulatoryRatesStore.resetToDefaults();
                    setRegConfig(def);
                    setRegSaveBanner('تمت استعادة الشرائح والنسب المعيارية المعتمدة وفق قانون ضريبة الدخل رقم 38 لسنة 2018 وقانون الضمان رقم 1 لسنة 2014.');
                    setTimeout(() => setRegSaveBanner(null), 5000);
                  }}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>استعادة القيم القانونية القياسية</span>
                </button>
              </div>
            </div>

            {/* 1. الإعفاءات الضريبية السنوية */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                أولاً: معلمات الإعفاءات الضريبية السنوية للأفراد والمعيلين (المادة 9)
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">الإعفاء الشخصي (د.أ)</label>
                  <input
                    type="number"
                    value={regConfig.incomeTaxExemptions.personalExemptionJod}
                    onChange={(e) =>
                      setRegConfig({
                        ...regConfig,
                        incomeTaxExemptions: {
                          ...regConfig.incomeTaxExemptions,
                          personalExemptionJod: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">إعفاء الإعالة الزوجية (د.أ)</label>
                  <input
                    type="number"
                    value={regConfig.incomeTaxExemptions.familyExemptionJod}
                    onChange={(e) =>
                      setRegConfig({
                        ...regConfig,
                        incomeTaxExemptions: {
                          ...regConfig.incomeTaxExemptions,
                          familyExemptionJod: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">إعفاء كل معال (د.أ)</label>
                  <input
                    type="number"
                    value={regConfig.incomeTaxExemptions.dependentExemptionPerChildJod}
                    onChange={(e) =>
                      setRegConfig({
                        ...regConfig,
                        incomeTaxExemptions: {
                          ...regConfig.incomeTaxExemptions,
                          dependentExemptionPerChildJod: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">سقف إعفاء الأعزب (د.أ)</label>
                  <input
                    type="number"
                    value={regConfig.incomeTaxExemptions.maxTotalSingleExemptionCapJod}
                    onChange={(e) =>
                      setRegConfig({
                        ...regConfig,
                        incomeTaxExemptions: {
                          ...regConfig.incomeTaxExemptions,
                          maxTotalSingleExemptionCapJod: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">سقف إعفاء الأسرة الكلي (د.أ)</label>
                  <input
                    type="number"
                    value={regConfig.incomeTaxExemptions.maxTotalFamilyExemptionCapJod}
                    onChange={(e) =>
                      setRegConfig({
                        ...regConfig,
                        incomeTaxExemptions: {
                          ...regConfig.incomeTaxExemptions,
                          maxTotalFamilyExemptionCapJod: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* 2. شرائح ضريبة الدخل التصاعدية */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                ثانياً: جدول الشرائح الضريبية التصاعدية للأفراد (المادة 11/أ — تعديل النسبة المئوية أو سقف الشريحة)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
                {regConfig.incomeTaxBrackets.map((brk, idx) => (
                  <div
                    key={brk.id}
                    className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5"
                  >
                    <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate" title={brk.labelAr}>
                      {brk.labelAr}
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">النسبة (%)</span>
                      <input
                        type="number"
                        step={0.5}
                        value={Number((brk.rateDecimal * 100).toFixed(2))}
                        onChange={(e) => {
                          const next = [...regConfig.incomeTaxBrackets];
                          next[idx] = { ...brk, rateDecimal: Number(e.target.value) / 100 };
                          setRegConfig({ ...regConfig, incomeTaxBrackets: next });
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded px-2 py-1 font-mono text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">سعة الشريحة (د.أ)</span>
                      <input
                        type="number"
                        step={1000}
                        value={brk.sliceCapJod}
                        onChange={(e) => {
                          const next = [...regConfig.incomeTaxBrackets];
                          next[idx] = { ...brk, sliceCapJod: Number(e.target.value) };
                          setRegConfig({ ...regConfig, incomeTaxBrackets: next });
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded px-2 py-1 font-mono text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. نسب فروع الضمان الاجتماعي */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-sky-600 dark:text-sky-400">
                ثالثاً: نسب فروع تأمينات الضمان الاجتماعي وسقف الأجر الخاضع (قانون الضمان الاجتماعي رقم 1 لسنة 2014)
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 text-xs">
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">سقف الأجر الشهري (د.أ)</label>
                  <input
                    type="number"
                    value={regConfig.socialSecurity.insurableSalaryCeilingMonthlyJod}
                    onChange={(e) =>
                      setRegConfig({
                        ...regConfig,
                        socialSecurity: {
                          ...regConfig.socialSecurity,
                          insurableSalaryCeilingMonthlyJod: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">شيخوخة موظف (%)</label>
                  <input
                    type="number"
                    step={0.25}
                    value={Number((regConfig.socialSecurity.employeeOldAgeDisabilityDeathRate * 100).toFixed(2))}
                    onChange={(e) =>
                      setRegConfig({
                        ...regConfig,
                        socialSecurity: {
                          ...regConfig.socialSecurity,
                          employeeOldAgeDisabilityDeathRate: Number(e.target.value) / 100,
                        },
                      })
                    }
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">تعطل موظف (%)</label>
                  <input
                    type="number"
                    step={0.25}
                    value={Number((regConfig.socialSecurity.employeeUnemploymentRate * 100).toFixed(2))}
                    onChange={(e) =>
                      setRegConfig({
                        ...regConfig,
                        socialSecurity: {
                          ...regConfig.socialSecurity,
                          employeeUnemploymentRate: Number(e.target.value) / 100,
                        },
                      })
                    }
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">شيخوخة منشأة (%)</label>
                  <input
                    type="number"
                    step={0.25}
                    value={Number((regConfig.socialSecurity.employerOldAgeDisabilityDeathRate * 100).toFixed(2))}
                    onChange={(e) =>
                      setRegConfig({
                        ...regConfig,
                        socialSecurity: {
                          ...regConfig.socialSecurity,
                          employerOldAgeDisabilityDeathRate: Number(e.target.value) / 100,
                        },
                      })
                    }
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">إصابات عمل منشأة (%)</label>
                  <input
                    type="number"
                    step={0.25}
                    value={Number((regConfig.socialSecurity.employerWorkInjuryRate * 100).toFixed(2))}
                    onChange={(e) =>
                      setRegConfig({
                        ...regConfig,
                        socialSecurity: {
                          ...regConfig.socialSecurity,
                          employerWorkInjuryRate: Number(e.target.value) / 100,
                        },
                      })
                    }
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">أمومة منشأة (%)</label>
                  <input
                    type="number"
                    step={0.05}
                    value={Number((regConfig.socialSecurity.employerMaternityRate * 100).toFixed(2))}
                    onChange={(e) =>
                      setRegConfig({
                        ...regConfig,
                        socialSecurity: {
                          ...regConfig.socialSecurity,
                          employerMaternityRate: Number(e.target.value) / 100,
                        },
                      })
                    }
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">تعطل منشأة (%)</label>
                  <input
                    type="number"
                    step={0.25}
                    value={Number((regConfig.socialSecurity.employerUnemploymentRate * 100).toFixed(2))}
                    onChange={(e) =>
                      setRegConfig({
                        ...regConfig,
                        socialSecurity: {
                          ...regConfig.socialSecurity,
                          employerUnemploymentRate: Number(e.target.value) / 100,
                        },
                      })
                    }
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">مهن خطرة إضافي (%)</label>
                  <input
                    type="number"
                    step={0.25}
                    value={Number((regConfig.socialSecurity.employerHazardousExtraRate * 100).toFixed(2))}
                    onChange={(e) =>
                      setRegConfig({
                        ...regConfig,
                        socialSecurity: {
                          ...regConfig.socialSecurity,
                          employerHazardousExtraRate: Number(e.target.value) / 100,
                        },
                      })
                    }
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2 py-1.5 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls */}
          <div className="lg:col-span-5 space-y-5">
            <div>
              <div className="flex justify-between items-center text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                <label htmlFor="salary-range">الراتب الشهري الإجمالي (د.أ)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={50000}
                    step={25}
                    value={monthlySalary}
                    onChange={(e) => setMonthlySalary(Math.max(0, Number(e.target.value)))}
                    className="w-28 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 text-left"
                  />
                  <span className="text-[11px] text-slate-500">د.أ</span>
                </div>
              </div>
              <input
                id="salary-range"
                type="range"
                min={290}
                max={6000}
                step={25}
                value={Math.min(6000, Math.max(290, monthlySalary))}
                onChange={(e) => setMonthlySalary(Number(e.target.value))}
                className="w-full accent-emerald-600 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1">
                <span>الحد الأدنى: {sscResult.minimumWageFloorJod} د.أ</span>
                <span>سقف الضمان: {sscResult.insurableCeilingJod} د.أ</span>
                <span>6,000 د.أ</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  المكافآت السنوية الإضافية (د.أ)
                </label>
                <input
                  type="number"
                  min={0}
                  value={annualBonus}
                  onChange={(e) => setAnnualBonus(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white font-mono tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  فواتير علاج وتعليم موثقة (د.أ)
                </label>
                <input
                  type="number"
                  min={0}
                  max={10000}
                  value={documentedExpenses}
                  onChange={(e) => setDocumentedExpenses(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white font-mono tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                الحالة الاجتماعية والإعالة القانونية (سقف الإعفاءات: {regConfig.incomeTaxExemptions.maxTotalSingleExemptionCapJod} د.أ للأعزب / {regConfig.incomeTaxExemptions.maxTotalFamilyExemptionCapJod} د.أ للأسرة)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsMarried(false)}
                  className={`py-2.5 px-3 text-xs rounded-xl font-bold border transition cursor-pointer whitespace-nowrap ${
                    !isMarried
                      ? 'border-emerald-600 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  أعزب (إعفاء {regConfig.incomeTaxExemptions.personalExemptionJod} د.أ)
                </button>
                <button
                  type="button"
                  onClick={() => setIsMarried(true)}
                  className={`py-2.5 px-3 text-xs rounded-xl font-bold border transition cursor-pointer whitespace-nowrap ${
                    isMarried
                      ? 'border-emerald-600 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  معيل / متزوج ({regConfig.incomeTaxExemptions.personalExemptionJod + regConfig.incomeTaxExemptions.familyExemptionJod} د.أ)
                </button>
              </div>
            </div>

            {isMarried && (
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  عدد المعالين الإضافيين (بحد أقصى {regConfig.incomeTaxExemptions.maxDependentsCount} معالين — {regConfig.incomeTaxExemptions.dependentExemptionPerChildJod} د.أ لكل معال)
                </label>
                <div className="flex gap-2">
                  {[0, 1, 2, 3].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setDependentsCount(cnt)}
                      className={`flex-1 py-2 text-xs font-mono font-bold rounded-xl border transition cursor-pointer ${
                        dependentsCount === cnt
                          ? 'border-emerald-600 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-500'
                      }`}
                    >
                      {cnt} معالين
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-1 space-y-2.5">
              <label className="flex items-center gap-3 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={isHazardousJob}
                  onChange={(e) => setIsHazardousJob(e.target.checked)}
                  className="w-4 h-4 rounded accent-emerald-600"
                />
                <span>تصنيف المهنة ضمن المهن الخطرة (+{sscResult.subInsuranceBreakdown.employerHazardousRatePct || '1.00%'} مساهمة ضمان إضافية على صاحب العمل)</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={deductEmployeeSscFromTax}
                  onChange={(e) => setDeductEmployeeSscFromTax(e.target.checked)}
                  className="w-4 h-4 rounded accent-emerald-600"
                />
                <span>خصم مساهمة الموظف بالضمان الاجتماعي ({sscResult.annualEmployeeSscJod} د.أ سنوياً) من الوعاء</span>
              </label>
            </div>
          </div>

          {/* Results & Bracket Table + Detailed SSC Sub-Insurance Breakdown */}
          <div className="lg:col-span-7 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">الدخل الخاضع للضريبة</span>
                <span className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                  {taxResult.taxableIncome} د.أ
                </span>
                <span className="text-[11px] text-slate-500 block mt-1">
                  الإعفاءات: {taxResult.totalExemptions} د.أ
                </span>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">ضريبة الدخل السنوية</span>
                <span className="text-lg font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                  {taxResult.totalTaxDue} د.أ
                </span>
                <span className="text-[11px] text-slate-500 block mt-1">
                  شهرياً: {taxResult.monthlyWithholding} د.أ ({taxResult.effectiveRate})
                </span>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">اشتراك الضمان الشهري ({sscResult.totalRatePercent})</span>
                <span className="text-lg font-bold font-mono tabular-nums text-sky-600 dark:text-sky-400">
                  {sscResult.totalMonthlySscJod} د.أ
                </span>
                <span className="text-[11px] text-slate-500 block mt-1">
                  الموظف ({sscResult.employeeRatePercent}): {sscResult.employeeShareJod} · المنشأة ({sscResult.employerRatePercent}): {sscResult.employerShareJod}
                </span>
              </div>

              <div className="p-4 bg-emerald-950/15 border border-emerald-600/30 rounded-xl">
                <span className="text-xs text-emerald-700 dark:text-emerald-300 block mb-1">صافي الراتب الشهري</span>
                <span className="text-lg font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                  {netMonthlySalaryAfterSscAndTaxDec.toFixed(3)} د.أ
                </span>
                <span className="text-[11px] text-slate-500 block mt-1">
                  بعد خصم الضمان واقتطاع الضريبة
                </span>
              </div>
            </div>

            {/* Progressive Brackets Table */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">الشريحة الضريبية القانونية</th>
                    <th className="py-2.5 px-4 font-semibold">النسبة</th>
                    <th className="py-2.5 px-4 font-semibold text-left">المبلغ الخاضع (د.أ)</th>
                    <th className="py-2.5 px-4 font-semibold text-left">الضريبة المستحقة (د.أ)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/70">
                  {taxResult.bracketBreakdown.map((b, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="py-2.5 px-4 text-slate-800 dark:text-slate-200">{b.label}</td>
                      <td className="py-2.5 px-4 font-mono tabular-nums text-slate-500">{b.rate}</td>
                      <td className="py-2.5 px-4 font-mono tabular-nums text-left text-slate-700 dark:text-slate-300">
                        {b.taxableAmount}
                      </td>
                      <td className="py-2.5 px-4 font-mono tabular-nums text-left font-semibold text-emerald-600 dark:text-emerald-400">
                        {b.taxAmount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* جدول التفصيل الدقيق لتأمينات الضمان الاجتماعي الأردني (الشيخوخة، إصابات العمل، الأمومة، التعطل) */}
            <div className="border border-sky-500/30 bg-sky-950/5 rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 bg-sky-950/15 border-b border-sky-500/20 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-bold text-slate-900 dark:text-white">
                  تفصيل اشتراكات فروع الضمان الاجتماعي الشهرية على الأجر الخاضع ({sscResult.insurableSalaryJod} د.أ)
                </span>
                <span className="font-mono text-[11px] text-sky-600 dark:text-sky-400">
                  سقف الأجر الخاضع: {sscResult.insurableCeilingJod} د.أ
                </span>
              </div>
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100/70 dark:bg-slate-950/70 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2 px-3">فرع التأمين الاجتماعي (قانون رقم 1 لسنة 2014)</th>
                    <th className="py-2 px-3 text-left">حصة الموظف (%)</th>
                    <th className="py-2 px-3 text-left">اقتطاع الموظف (د.أ)</th>
                    <th className="py-2 px-3 text-left">حصة المنشأة (%)</th>
                    <th className="py-2 px-3 text-left">مساهمة المنشأة (د.أ)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-mono tabular-nums">
                  <tr>
                    <td className="py-2 px-3 font-sans text-slate-800 dark:text-slate-200">
                      1. تأمين الشيخوخة والعجز والوفاة
                    </td>
                    <td className="py-2 px-3 text-left text-slate-500">
                      {sscResult.subInsuranceBreakdown.employeeOldAgeRatePct}
                    </td>
                    <td className="py-2 px-3 text-left text-slate-800 dark:text-slate-200">
                      {sscResult.subInsuranceBreakdown.employeeOldAgeJod}
                    </td>
                    <td className="py-2 px-3 text-left text-slate-500">
                      {sscResult.subInsuranceBreakdown.employerOldAgeRatePct}
                    </td>
                    <td className="py-2 px-3 text-left text-sky-600 dark:text-sky-400 font-semibold">
                      {sscResult.subInsuranceBreakdown.employerOldAgeJod}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans text-slate-800 dark:text-slate-200">
                      2. تأمين إصابات العمل
                    </td>
                    <td className="py-2 px-3 text-left text-slate-400">0.00%</td>
                    <td className="py-2 px-3 text-left text-slate-400">0.000</td>
                    <td className="py-2 px-3 text-left text-slate-500">
                      {sscResult.subInsuranceBreakdown.employerWorkInjuryRatePct}
                    </td>
                    <td className="py-2 px-3 text-left text-sky-600 dark:text-sky-400 font-semibold">
                      {sscResult.subInsuranceBreakdown.employerWorkInjuryJod}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans text-slate-800 dark:text-slate-200">
                      3. تأمين الأمومة
                    </td>
                    <td className="py-2 px-3 text-left text-slate-400">0.00%</td>
                    <td className="py-2 px-3 text-left text-slate-400">0.000</td>
                    <td className="py-2 px-3 text-left text-slate-500">
                      {sscResult.subInsuranceBreakdown.employerMaternityRatePct}
                    </td>
                    <td className="py-2 px-3 text-left text-sky-600 dark:text-sky-400 font-semibold">
                      {sscResult.subInsuranceBreakdown.employerMaternityJod}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans text-slate-800 dark:text-slate-200">
                      4. تأمين التعطل عن العمل (ادخاري للموظف)
                    </td>
                    <td className="py-2 px-3 text-left text-slate-500">
                      {sscResult.subInsuranceBreakdown.employeeUnemploymentRatePct}
                    </td>
                    <td className="py-2 px-3 text-left text-slate-800 dark:text-slate-200">
                      {sscResult.subInsuranceBreakdown.employeeUnemploymentJod}
                    </td>
                    <td className="py-2 px-3 text-left text-slate-500">
                      {sscResult.subInsuranceBreakdown.employerUnemploymentRatePct}
                    </td>
                    <td className="py-2 px-3 text-left text-sky-600 dark:text-sky-400 font-semibold">
                      {sscResult.subInsuranceBreakdown.employerUnemploymentJod}
                    </td>
                  </tr>
                  {isHazardousJob && (
                    <tr className="bg-amber-950/15">
                      <td className="py-2 px-3 font-sans font-bold text-amber-600 dark:text-amber-400">
                        5. إضافي المهن الخطرة (على صاحب العمل)
                      </td>
                      <td className="py-2 px-3 text-left text-slate-400">0.00%</td>
                      <td className="py-2 px-3 text-left text-slate-400">0.000</td>
                      <td className="py-2 px-3 text-left text-amber-500">
                        {sscResult.subInsuranceBreakdown.employerHazardousRatePct}
                      </td>
                      <td className="py-2 px-3 text-left text-amber-500 font-bold">
                        {sscResult.subInsuranceBreakdown.employerHazardousJod}
                      </td>
                    </tr>
                  )}
                  <tr className="bg-slate-100 dark:bg-slate-950 font-bold">
                    <td className="py-2 px-3 font-sans text-slate-900 dark:text-white">الإجمالي الشهري المورد للضمان</td>
                    <td className="py-2 px-3 text-left text-emerald-600 dark:text-emerald-400">
                      {sscResult.employeeRatePercent}
                    </td>
                    <td className="py-2 px-3 text-left text-emerald-600 dark:text-emerald-400">
                      {sscResult.employeeShareJod} د.أ
                    </td>
                    <td className="py-2 px-3 text-left text-sky-600 dark:text-sky-400">
                      {sscResult.employerRatePercent}
                    </td>
                    <td className="py-2 px-3 text-left text-sky-600 dark:text-sky-400">
                      {sscResult.employerShareJod} د.أ
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Engine 1.2: Investment Feasibility & Capital Budgeting Engine (NPV / IRR / MIRR / Multi-Sign Cash Flows) */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-1">
              02. محرك التقييم الاستثماري ودراسات الجدوى الاقتصادية (NPV / IRR / MIRR / Payback) — معالجة التدفقات السالبة وتغير الإشارة المتعدد
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
              <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>محاكي التدفقات النقدية المخصومة ومؤشر الربحية للمشاريع الأردنية</span>
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold">
            {feasibilityResult.isEconomicallyViable ? (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>المشروع مجدٍ اقتصادياً (NPV موجب والعائد يتجاوز كلفة رأس المال)</span>
              </span>
            ) : (
              <span className="text-rose-500 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>المشروع غير مجدٍ اقتصادياً بالمعطيات الحالية</span>
              </span>
            )}
          </div>
        </div>

        {/* سيناريوهات اختبار الضغط المالي (Stress Testing Scenarios) حسب ملاحظة المستشار المالي */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
          <span className="font-bold text-slate-700 dark:text-slate-300">
            اختبار السيناريوهات الحرجة (Stress Testing):
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setProjectName('مصنع تعبئة وتغليف غذائي - القسطل الصناعية');
                setCapex(120000);
                setDiscountRate(11);
                setCashFlows([32000, 38000, 44000, 50000, 58000]);
              }}
              className="px-3 py-1.5 bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 rounded-lg font-bold cursor-pointer"
            >
              1. تدفقات تقليدية موجبة (قياسي)
            </button>
            <button
              type="button"
              onClick={() => {
                setProjectName('مشروع خط إنتاج صيدلاني (إحلال رأسمالي بالسنة 3 - تغير إشارة متعدد)');
                setCapex(120000);
                setDiscountRate(11);
                setCashFlows([55000, 62000, -35000, 72000, 80000]);
              }}
              className="px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/30 rounded-lg font-bold cursor-pointer"
            >
              2. تغير الإشارة النقدية أكثر من مرة (تفعيل MIRR)
            </button>
            <button
              type="button"
              onClick={() => {
                setProjectName('مشروع متعثر تشغيلياً (تدفقات نقدية سالبة)');
                setCapex(120000);
                setDiscountRate(11);
                setCashFlows([-15000, -8000, 5000, 12000, 15000]);
              }}
              className="px-3 py-1.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-700 dark:text-rose-300 border border-rose-500/30 rounded-lg font-bold cursor-pointer"
            >
              3. تدفقات سالبة / عدم استرداد رأس المال
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">اسم المشروع الاستثماري</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  رأس المال التأسيسي CAPEX (د.أ)
                </label>
                <input
                  type="number"
                  min={1000}
                  step={5000}
                  value={capex}
                  onChange={(e) => setCapex(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white font-mono tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  معدل الخصم / الفائدة WACC (%)
                </label>
                <input
                  type="number"
                  min={1}
                  max={40}
                  step={0.5}
                  value={discountRate}
                  onChange={(e) => setDiscountRate(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white font-mono tabular-nums"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  التدفقات النقدية الصافية المتوقعة لـ {cashFlows.length} سنوات (تقبل القيم الموجبة والسالبة د.أ / سنة)
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={addCashFlowYear}
                    className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>سنة</span>
                  </button>
                  <button
                    type="button"
                    onClick={removeCashFlowYear}
                    className="px-2 py-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>حذف</span>
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {cashFlows.map((cf, idx) => (
                  <div key={idx}>
                    <span className="block text-[11px] text-slate-500 mb-1 text-center">سنة {idx + 1}</span>
                    <input
                      type="number"
                      step={1000}
                      value={cf}
                      onChange={(e) => updateCashFlow(idx, Number(e.target.value))}
                      className={`w-full bg-slate-50 dark:bg-slate-950 border rounded-lg px-2 py-1.5 text-xs text-center font-mono tabular-nums ${
                        cf < 0
                          ? 'border-rose-500/60 text-rose-500 font-bold'
                          : 'border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white'
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Diagnostic Banner for Multi-Sign or Negative Cash Flows */}
            <div
              className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                feasibilityResult.isNonConventionalCashFlow
                  ? 'bg-amber-950/20 border-amber-500/40 text-amber-700 dark:text-amber-300'
                  : feasibilityResult.signChangesCount === 0
                  ? 'bg-rose-950/20 border-rose-500/40 text-rose-600 dark:text-rose-300'
                  : 'bg-emerald-950/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
              }`}
            >
              <div className="font-bold mb-1">
                تشخيص هيكل التدفقات النقدية (عدد تغيرات الإشارة: {feasibilityResult.signChangesCount}):
              </div>
              <div>{feasibilityResult.cashFlowDiagnosticNoteAr}</div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                <span className="text-[11px] text-slate-500 block mb-1">صافي القيمة الحالية (NPV)</span>
                <span
                  className={`text-sm font-bold font-mono tabular-nums ${
                    Number(feasibilityResult.netPresentValueNpv) >= 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-500'
                  }`}
                >
                  {feasibilityResult.netPresentValueNpv} د.أ
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                <span className="text-[11px] text-slate-500 block mb-1">العائد الداخلي (IRR)</span>
                <span className="text-sm font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                  {feasibilityResult.internalRateOfReturnIrr}
                </span>
              </div>
              <div className="p-3 bg-sky-950/15 border border-sky-500/30 rounded-xl">
                <span className="text-[11px] text-sky-600 dark:text-sky-400 font-semibold block mb-1">
                  العائد المعدل (MIRR)
                </span>
                <span className="text-sm font-bold font-mono tabular-nums text-sky-600 dark:text-sky-400">
                  {feasibilityResult.modifiedInternalRateOfReturnMirr}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                <span className="text-[11px] text-slate-500 block mb-1">الاسترداد الاسمي</span>
                <span className="text-sm font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                  {feasibilityResult.paybackPeriodYears}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                <span className="text-[11px] text-slate-500 block mb-1">الاسترداد المخصوم</span>
                <span className="text-sm font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400">
                  {feasibilityResult.discountedPaybackPeriodYears}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                <span className="text-[11px] text-slate-500 block mb-1">مؤشر الربحية (PI)</span>
                <span className="text-sm font-bold font-mono tabular-nums text-sky-600 dark:text-sky-400">
                  {feasibilityResult.profitabilityIndexPi}x
                </span>
              </div>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2 px-3">السنة</th>
                    <th className="py-2 px-3 text-left">التدفق الاسمي (د.أ)</th>
                    <th className="py-2 px-3 text-left">معامل الخصم</th>
                    <th className="py-2 px-3 text-left">القيمة الحالية (PV)</th>
                    <th className="py-2 px-3 text-left">التراكمي المخصوم</th>
                    <th className="py-2 px-3 text-left">صافي NPV التراكمي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/70 font-mono tabular-nums">
                  {feasibilityResult.yearlyDiscountedCashFlows.map((row) => (
                    <tr key={row.year} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="py-2 px-3 font-sans font-medium text-slate-800 dark:text-slate-200">السنة {row.year}</td>
                      <td
                        className={`py-2 px-3 text-left ${
                          Number(row.nominalCashFlow) < 0
                            ? 'text-rose-500 font-bold'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {row.nominalCashFlow}
                      </td>
                      <td className="py-2 px-3 text-left text-slate-500">{row.discountFactor}</td>
                      <td
                        className={`py-2 px-3 text-left font-semibold ${
                          Number(row.presentValue) < 0
                            ? 'text-rose-500'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {row.presentValue}
                      </td>
                      <td className="py-2 px-3 text-left text-slate-800 dark:text-slate-200">{row.cumulativePresentValue}</td>
                      <td className="py-2 px-3 text-left font-bold text-sky-600 dark:text-sky-400">{row.netCumulativeNpv}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Architecture: Quick Access to Specialized Sections */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">الأقسام المتخصصة في المنصة</div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">استكشف الخدمات والأدوات الرقمية</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            onClick={() => onNavigateToTab('tax', 'jofotara-pos')}
            className="md:col-span-2 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/60 rounded-2xl transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                الفوترة الإلكترونية · حاسبة المبيعات · الإقرارات الضريبية
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                الفوترة الإلكترونية والضرائب
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-2">
                حلول ذكية لإدارة الفواتير الإلكترونية وتنظيم عمليات الإصدار والأرشفة والتتبع بما يتوافق مع المتطلبات الفنية المتاحة.
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                يدعم التكامل الإلكتروني مع الأنظمة والمنصات المتاحة وفق المتطلبات الفنية المعلنة من الجهات المعنية.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span>استكشف الخدمات</span>
              <ArrowLeft className="w-4 h-4" />
            </div>
          </div>

          <div
            onClick={() => onNavigateToTab('accounting', 'bank-reconciliation')}
            className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/60 rounded-2xl transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                مركز التحليلات والمؤشرات المالية
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                مركز التحليلات والمؤشرات المالية
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                متابعة المؤشرات المالية والاقتصادية وتحليل البيانات لدعم أصحاب الأعمال ورواد المشاريع في اتخاذ القرارات المناسبة.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span>فتح المحاسبة والتحليلات</span>
              <ArrowLeft className="w-4 h-4" />
            </div>
          </div>

          <div
            onClick={() => onNavigateToTab('audit', 'anomaly-detector')}
            className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/60 rounded-2xl transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                المساعد الذكي للأعمال والضرائب
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                المساعد الذكي للأعمال والضرائب
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                مساعد رقمي يعتمد على تقنيات الذكاء الاصطناعي للإجابة عن الأسئلة العامة وتقديم المعلومات والتوضيحات المتعلقة بالأعمال والمحاسبة والضرائب.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span>فتح التدقيق والمساعد الذكي</span>
              <ArrowLeft className="w-4 h-4" />
            </div>
          </div>

          <div
            onClick={() => onNavigateToTab('legal', 'governance-logs')}
            className="md:col-span-2 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/60 rounded-2xl transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                قسم الحوكمة والمكتبة القانونية
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                المكتبة القانونية، سجل الموافقات (Consent Log)، وسجل النشاط (Audit Log)
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                مجموعة من المعلومات والنماذج الاسترشادية وسجلات توثيق الموافقات والتعديلات المحاسبية والضريبية لحماية حقوق المنشأة.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span>فتح سجل الموافقات والنشاط والمكتبة القانونية</span>
              <ArrowLeft className="w-4 h-4" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
