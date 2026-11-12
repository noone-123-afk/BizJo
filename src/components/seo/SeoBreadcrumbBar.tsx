import React from 'react';
import { ChevronLeft, Globe, SearchCheck, Link2 } from 'lucide-react';
import { SidebarItemId } from '../erp/SimpleHomeDashboard';
import { BizJoSeoEngine } from '../../services/seo/BizJoSeoEngine';

interface SeoBreadcrumbBarProps {
  activeSection: SidebarItemId;
  onSelectSection: (sectionId: SidebarItemId) => void;
}

const DIRECTORY_DEFAULT_SECTION: Record<string, SidebarItemId> = {
  business: 'biz-dashboard',
  accounting: 'acc-statements',
  taxes: 'tax-jofotara',
  hr: 'hr-payroll',
  analysis: 'ana-cfo',
  documents: 'doc-contracts',
  help: 'help-laws',
  'phase-two': 'p2-mvp-suite',
};

export default function SeoBreadcrumbBar({
  activeSection,
  onSelectSection,
}: SeoBreadcrumbBarProps) {
  const meta = BizJoSeoEngine.getMetadataForSection(activeSection);
  const directoryLandingSection = DIRECTORY_DEFAULT_SECTION[meta.directorySlug] || 'biz-dashboard';

  return (
    <nav
      aria-label="مسار التنقل التفصيلي Breadcrumb"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs"
    >
      {/* Semantic Breadcrumb Trail with Descriptive Anchor Text */}
      <ol className="flex flex-wrap items-center gap-1.5 text-slate-600 dark:text-slate-400">
        <li className="flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
          <a
            href="/business/dashboard"
            onClick={(e) => {
              e.preventDefault();
              onSelectSection('biz-dashboard');
            }}
            className="font-bold text-slate-800 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            BizJo الرئيسية
          </a>
        </li>

        <li aria-hidden="true">
          <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
        </li>

        <li>
          <a
            href={`/${meta.directorySlug}`}
            onClick={(e) => {
              e.preventDefault();
              onSelectSection(directoryLandingSection);
            }}
            className="font-semibold hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            {meta.directoryNameAr}
          </a>
        </li>

        <li aria-hidden="true">
          <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
        </li>

        <li aria-current="page" className="font-extrabold text-emerald-700 dark:text-emerald-400">
          {meta.breadcrumbLabelAr}
        </li>
      </ol>

      {/* Descriptive Canonical URL Path + Quick SEO Preview Trigger */}
      <div className="flex flex-wrap items-center gap-2">
        <span
          dir="ltr"
          title="الرابط الوصفي القياسي (Canonical URL) لتقليل المحتوى المكرر وتوضيح بنية المجلدات لمحرك بحث Google"
          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
        >
          <Link2 className="w-3 h-3 text-emerald-500 shrink-0" />
          <span>bizjo.jo{meta.canonicalPath}</span>
        </span>

        {activeSection !== 'help-seo' && (
          <a
            href="/help/seo-search-central"
            onClick={(e) => {
              e.preventDefault();
              onSelectSection('help-seo');
            }}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] flex items-center gap-1 transition-colors"
          >
            <SearchCheck className="w-3.5 h-3.5" />
            <span>معاينة نتيجة بحث Google</span>
          </a>
        )}
      </div>
    </nav>
  );
}
