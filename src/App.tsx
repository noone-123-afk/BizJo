/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Sun,
  Moon,
  Globe,
  Building2,
  ShieldAlert,
  Briefcase,
  Calculator,
  Receipt,
  Users,
  BarChart3,
  FolderKanban,
  HelpCircle,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import JordanLocalBusinessSchema from './components/seo/JordanLocalBusinessSchema';
import BizJoLogo from './components/brand/BizJoLogo';
import SimpleHomeDashboard, { SidebarItemId } from './components/erp/SimpleHomeDashboard';
import ErpModulesWorkspace from './components/erp/ErpModulesWorkspace';
import StrategicPhaseTwoWorkspace, {
  PhaseTwoTabId,
} from './components/erp/StrategicPhaseTwoWorkspace';
import FullAccountingCycleWorkspace, {
  CycleViewMode,
} from './components/accounting/FullAccountingCycleWorkspace';
import TaxAndJoFotaraView from './components/views/TaxAndJoFotaraView';
import AccountingLedgersView from './components/views/AccountingLedgersView';
import AuditAndComplianceView from './components/views/AuditAndComplianceView';
import LegalAndVaultView from './components/views/LegalAndVaultView';
import PlatformPoliciesAndAboutSection from './components/legal/PlatformPoliciesAndAboutSection';
import { LOCALES, Language } from './data/locales';

export function DisclaimerBanner() {
  return (
    <div className="bg-amber-600 text-white px-4 py-2 text-center text-xs sm:text-sm font-medium shadow-md flex items-center justify-center gap-2">
      <span>⚠️</span>
      <span>
        <strong>تنبيه هام وإخلاء مسؤولية:</strong> المعلومات والنتائج والاحتسابات والبيانات المعروضة داخل هذه المنصة هي لأغراض المساعدة والتجربة فقط، ولا تعتبر استشارة قانونية أو محاسبية أو ضريبية معتمدة، ولا تمثل أي جهة حكومية.
      </span>
    </div>
  );
}

export function CompanyInfoFooter() {
  return (
    <div className="bg-slate-900 text-slate-300 p-6 rounded-xl border border-slate-800 mt-6 text-sm">
      <h3 className="text-white font-bold text-base mb-2">معلومات التشغيل والإشراف الفني</h3>
      <p className="mb-2">
        الموقع والمرافق التقنية للمنصة مُشرفة ومدارة بالكامل من قِبل مجموعة من المهندسين المتخصصين في الأردن - عمّان.
      </p>
      <p className="mb-1">
        <strong>العنوان:</strong> المملكة الأردنية الهاشمية، عمّان
      </p>
      <p>
        <strong>للتواصل وإرسال الملاحظات أو الاستفسارات:</strong>{' '}
        <a href="mailto:one497303@gmail.com" className="text-emerald-400 underline hover:text-emerald-300">
          one497303@gmail.com
        </a>
      </p>
    </div>
  );
}

interface SidebarGroup {
  id: string;
  groupTitle: string;
  icon: React.ComponentType<{ className?: string }>;
  items: { id: SidebarItemId; label: string }[];
}

const SIDEBAR_GROUPS: SidebarGroup[] = [
  {
    id: 'group-business',
    groupTitle: 'الأعمال',
    icon: Briefcase,
    items: [
      { id: 'biz-dashboard', label: 'لوحة التحكم' },
      { id: 'biz-customers', label: 'العملاء' },
      { id: 'biz-vendors', label: 'الموردون' },
      { id: 'biz-contracts', label: 'العقود' },
      { id: 'biz-projects', label: 'المشاريع' },
    ],
  },
  {
    id: 'group-accounting',
    groupTitle: 'المحاسبة',
    icon: Calculator,
    items: [
      { id: 'acc-coa', label: 'دليل الحسابات' },
      { id: 'acc-journal', label: 'قيود اليومية' },
      { id: 'acc-gl', label: 'الأستاذ العام' },
      { id: 'acc-trial-balance', label: 'ميزان المراجعة' },
      { id: 'acc-statements', label: 'القوائم المالية' },
    ],
  },
  {
    id: 'group-taxes',
    groupTitle: 'الضرائب',
    icon: Receipt,
    items: [
      { id: 'tax-profile', label: 'الملف الضريبي' },
      { id: 'tax-income', label: 'ضريبة الدخل' },
      { id: 'tax-sales', label: 'ضريبة المبيعات' },
      { id: 'tax-jofotara', label: 'JoFotara' },
      { id: 'tax-compliance', label: 'الامتثال الضريبي' },
    ],
  },
  {
    id: 'group-hr',
    groupTitle: 'الموارد البشرية',
    icon: Users,
    items: [
      { id: 'hr-employees', label: 'الموظفون' },
      { id: 'hr-payroll', label: 'الرواتب' },
      { id: 'hr-ssc', label: 'الضمان الاجتماعي' },
      { id: 'hr-leaves', label: 'الإجازات' },
    ],
  },
  {
    id: 'group-analysis',
    groupTitle: 'التحليل',
    icon: BarChart3,
    items: [
      { id: 'ana-kpis', label: 'المؤشرات المالية' },
      { id: 'ana-feasibility', label: 'دراسة الجدوى' },
      { id: 'ana-forecasts', label: 'التنبؤات' },
      { id: 'ana-cfo', label: 'لوحة المدير المالي' },
    ],
  },
  {
    id: 'group-documents',
    groupTitle: 'المستندات',
    icon: FolderKanban,
    items: [
      { id: 'doc-contracts', label: 'العقود' },
      { id: 'doc-licenses', label: 'الرخص' },
      { id: 'doc-authorizations', label: 'التفويضات' },
      { id: 'doc-archive', label: 'الأرشيف' },
    ],
  },
  {
    id: 'group-help',
    groupTitle: 'المساعدة',
    icon: HelpCircle,
    items: [
      { id: 'help-laws', label: 'المركز القانوني' },
      { id: 'help-faq', label: 'الأسئلة الشائعة' },
      { id: 'help-advisor', label: 'المساعد الذكي' },
    ],
  },
  {
    id: 'group-phase-two',
    groupTitle: 'المرحلة 2 والـ MVP الذكي',
    icon: Sparkles,
    items: [
      { id: 'p2-mvp-suite', label: 'إطلاق الـ MVP (7 خطوات)' },
      { id: 'p2-notifications', label: '1. التنبيهات الذكية' },
      { id: 'p2-health-score', label: '2. صحة الأعمال (91/100)' },
      { id: 'p2-risk-center', label: '3. مركز المخاطر' },
      { id: 'p2-smart-docs', label: '4. مركز الوثائق الذكي' },
      { id: 'p2-kanban-tasks', label: '5. نظام المهام (Kanban)' },
      { id: 'p2-yoy-analytics', label: '6. المقارنات السنوية' },
      { id: 'p2-investor-bank', label: '7. المستثمر والبنوك' },
      { id: 'p2-sector-benchmarks', label: '8. مؤشرات القطاع (72%)' },
      { id: 'p2-tax-calendar', label: '9. التقويم الضريبي الذكي' },
      { id: 'p2-data-health', label: '10. فحص البيانات (93%)' },
      { id: 'p2-ai-advisor', label: '11. المستشار الذكي' },
      { id: 'p2-erd-schema', label: 'مخطط ERD (21 جدول SQL)' },
    ],
  },
];

export default function App() {
  const [activeSidebarItem, setActiveSidebarItem] = useState<SidebarItemId>('biz-dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [showPoliciesModal, setShowPoliciesModal] = useState<boolean>(false);
  const [isDark, setIsDark] = useState<boolean>(true);
  const [lang, setLang] = useState<Language>('ar');

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    const root = document.documentElement;
    root.dir = lang === 'ar' ? 'rtl' : 'ltr';
    root.lang = lang;
  }, [lang]);

  const handleSelectSidebar = (itemId: SidebarItemId) => {
    setActiveSidebarItem(itemId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const t = LOCALES[lang];

  const mapAccountingMode = (id: SidebarItemId): CycleViewMode => {
    if (id === 'acc-coa') return 'CHART_OF_ACCOUNTS';
    if (id === 'acc-journal') return 'GENERAL_JOURNAL';
    if (id === 'acc-gl') return 'GENERAL_LEDGER';
    if (id === 'acc-trial-balance') return 'TRIAL_BALANCE';
    return 'FINANCIAL_STATEMENTS';
  };

  const mapPhaseTwoStage = (id: SidebarItemId): PhaseTwoTabId => {
    switch (id) {
      case 'p2-notifications':
        return 'STAGE_1_NOTIFICATIONS';
      case 'p2-health-score':
        return 'STAGE_2_HEALTH_SCORE';
      case 'p2-risk-center':
        return 'STAGE_3_RISK_CENTER';
      case 'p2-smart-docs':
        return 'STAGE_4_SMART_DOCS';
      case 'p2-kanban-tasks':
        return 'STAGE_5_KANBAN_TASKS';
      case 'p2-yoy-analytics':
        return 'STAGE_6_YOY_ANALYTICS';
      case 'p2-investor-bank':
        return 'STAGE_7_INVESTOR_BANK';
      case 'p2-sector-benchmarks':
        return 'STAGE_8_SECTOR_BENCHMARKS';
      case 'p2-tax-calendar':
        return 'STAGE_9_TAX_CALENDAR';
      case 'p2-data-health':
        return 'STAGE_10_DATA_HEALTH';
      case 'p2-ai-advisor':
        return 'STAGE_11_AI_ADVISOR';
      case 'p2-erd-schema':
        return 'ERD_SQL_SCHEMA';
      default:
        return 'MVP_FLOW';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <JordanLocalBusinessSchema />
      <DisclaimerBanner />

      {/* Top Navigation Bar — Clean & Focused */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
              aria-label="القائمة الجانبية"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <a
              href="#dashboard"
              onClick={(e) => {
                e.preventDefault();
                handleSelectSidebar('biz-dashboard');
              }}
              className="shrink-0 focus:outline-none"
              aria-label="BizJo Home"
            >
              <BizJoLogo size="md" showTagline={true} />
            </a>
          </div>

          {/* Quick Top Links matching the 5 Main Dashboard Areas + Phase 2 Suite */}
          <nav className="hidden md:flex items-center gap-5 text-xs font-bold text-slate-600 dark:text-slate-400">
            {[
              { id: 'biz-dashboard' as SidebarItemId, label: 'لوحة التحكم' },
              { id: 'p2-mvp-suite' as SidebarItemId, label: 'صحة الأعمال (91/100) والـ MVP' },
              { id: 'biz-customers' as SidebarItemId, label: 'الأعمال والفواتير' },
              { id: 'acc-statements' as SidebarItemId, label: 'الدورة المحاسبية' },
              { id: 'p2-erd-schema' as SidebarItemId, label: 'مخطط ERD (21 جدول SQL)' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelectSidebar(item.id)}
                className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 cursor-pointer ${
                  activeSidebarItem === item.id
                    ? 'border-emerald-500 text-slate-900 dark:text-white'
                    : 'border-transparent hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Primary Action + Theme/Language */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleSelectSidebar('biz-customers')}
              className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              + إصدار فاتورة
            </button>

            <button
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{lang === 'ar' ? 'EN' : 'عربي'}</span>
            </button>

            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
              aria-label="تبديل المظهر"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main ERP Layout: Structured 7-Group Sidebar + Dedicated Workspace */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Sidebar Navigation (القائمة الجانبية المنظمة - 7 مجموعات) */}
          <aside
            className={`${
              mobileMenuOpen ? 'block' : 'hidden'
            } lg:block lg:col-span-3 xl:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm lg:sticky lg:top-20 space-y-5 max-h-[calc(100vh-6rem)] overflow-y-auto`}
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <BizJoLogo size="sm" showTagline={false} />
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                القائمة
              </span>
            </div>

            {SIDEBAR_GROUPS.map((group) => {
              const GroupIcon = group.icon;
              return (
                <div key={group.id} className="space-y-1.5">
                  <div className="flex items-center gap-1.5 px-2 text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    <GroupIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{group.groupTitle}</span>
                  </div>
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const isActive = activeSidebarItem === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelectSidebar(item.id)}
                          className={`w-full text-right px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                            isActive
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                          }`}
                        >
                          <span>{item.label}</span>
                          {item.id === 'tax-compliance' && (
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                                isActive
                                  ? 'bg-white/20 text-white'
                                  : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                              }`}
                            >
                              92%
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setShowPoliciesModal(!showPoliciesModal)}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
                <span>{showPoliciesModal ? 'إخفاء السياسات القانونية' : 'السياسات وإخلاء المسؤولية'}</span>
              </button>
            </div>
          </aside>

          {/* Main Workspace Area */}
          <main className="lg:col-span-9 xl:col-span-10 space-y-6">
            {/* 1. HOME PAGE: Ultra-Clean 5 Sections + 6-Step User Journey ONLY */}
            {activeSidebarItem === 'biz-dashboard' && (
              <SimpleHomeDashboard onSelectSection={handleSelectSidebar} />
            )}

            {/* 2. ACCOUNTING GROUP: Full Closed-Loop Accounting Engine */}
            {(activeSidebarItem === 'acc-coa' ||
              activeSidebarItem === 'acc-journal' ||
              activeSidebarItem === 'acc-gl' ||
              activeSidebarItem === 'acc-trial-balance' ||
              activeSidebarItem === 'acc-statements') && (
              <div className="space-y-8">
                <FullAccountingCycleWorkspace initialMode={mapAccountingMode(activeSidebarItem)} />
                <AccountingLedgersView />
              </div>
            )}

            {/* 3. TAX GROUP: Tax Profile, Income Tax, Sales Tax, JoFotara, Compliance */}
            {activeSidebarItem === 'tax-profile' && (
              <LegalAndVaultView initialSubTab="entity-onboarding" />
            )}
            {activeSidebarItem === 'tax-income' && (
              <TaxAndJoFotaraView initialSubTab="tax-calculators" />
            )}
            {activeSidebarItem === 'tax-sales' && (
              <TaxAndJoFotaraView initialSubTab="vat-sales" />
            )}
            {activeSidebarItem === 'tax-jofotara' && (
              <TaxAndJoFotaraView initialSubTab="jofotara-pos" />
            )}
            {activeSidebarItem === 'tax-compliance' && (
              <div className="space-y-8">
                <ErpModulesWorkspace
                  sectionId="tax-compliance"
                  onSelectSection={handleSelectSidebar}
                />
                <AuditAndComplianceView initialSubTab="saft-export" />
              </div>
            )}

            {/* 4. ANALYSIS GROUP: Financial KPIs & Feasibility Study */}
            {activeSidebarItem === 'ana-kpis' && (
              <AuditAndComplianceView initialSubTab="saft-export" />
            )}
            {activeSidebarItem === 'ana-feasibility' && (
              <AccountingLedgersView initialSubTab="feasibility-lab" />
            )}

            {/* 5. BUSINESS, HR, CFO, DOCUMENTS & HELP ERP MODULES */}
            {(activeSidebarItem === 'biz-customers' ||
              activeSidebarItem === 'biz-vendors' ||
              activeSidebarItem === 'biz-contracts' ||
              activeSidebarItem === 'biz-projects' ||
              activeSidebarItem === 'hr-employees' ||
              activeSidebarItem === 'hr-payroll' ||
              activeSidebarItem === 'hr-ssc' ||
              activeSidebarItem === 'hr-leaves' ||
              activeSidebarItem === 'ana-forecasts' ||
              activeSidebarItem === 'ana-cfo' ||
              activeSidebarItem === 'doc-contracts' ||
              activeSidebarItem === 'doc-licenses' ||
              activeSidebarItem === 'doc-authorizations' ||
              activeSidebarItem === 'doc-archive' ||
              activeSidebarItem === 'help-laws' ||
              activeSidebarItem === 'help-faq' ||
              activeSidebarItem === 'help-advisor') && (
              <div className="space-y-8">
                <ErpModulesWorkspace
                  sectionId={activeSidebarItem}
                  onSelectSection={handleSelectSidebar}
                />
                {activeSidebarItem === 'doc-archive' && (
                  <LegalAndVaultView initialSubTab="governance-logs" />
                )}
              </div>
            )}

            {/* 6. PHASE 2 STRATEGIC & MVP SUITE + 21-TABLE ERD/SQL SCHEMA */}
            {activeSidebarItem.startsWith('p2-') && (
              <StrategicPhaseTwoWorkspace
                key={activeSidebarItem}
                initialStage={mapPhaseTwoStage(activeSidebarItem)}
                onNavigateSidebar={handleSelectSidebar}
              />
            )}

            {/* Optional Policies Drawer when requested by user */}
            {showPoliciesModal && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <PlatformPoliciesAndAboutSection />
              </div>
            )}

            <CompanyInfoFooter />
          </main>
        </div>
      </div>

      {/* Quiet Institutional Footer */}
      <footer className="mt-8 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-6">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <BizJoLogo size="sm" showTagline={false} />
              <span>·</span>
              <span>{t.common.platformName}</span>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => handleSelectSidebar('biz-dashboard')}
                className="hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                لوحة التحكم الرئيسية
              </button>
              <span aria-hidden="true">·</span>
              <button
                onClick={() => handleSelectSidebar('tax-jofotara')}
                className="hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                الفوترة الإلكترونية JoFotara
              </button>
              <span aria-hidden="true">·</span>
              <button
                onClick={() => handleSelectSidebar('doc-archive')}
                className="hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                سجل القرارات والموافقات
              </button>
              <span aria-hidden="true">·</span>
              <button
                onClick={() => setShowPoliciesModal(!showPoliciesModal)}
                className="hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                السياسات وإخلاء المسؤولية
              </button>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-200/70 dark:border-slate-800/70 text-center text-[11px] text-slate-500 dark:text-slate-400">
            باستخدام هذه المنصة فإنك توافق على سياسة الخصوصية وشروط الاستخدام وسياسة معالجة البيانات وإخلاء المسؤولية وحقوق الملكية الفكرية المعمول بها داخل المنصة.
          </div>
        </div>
      </footer>
    </div>
  );
}
