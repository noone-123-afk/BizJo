import React, { useState } from 'react';
import {
  Search,
  Globe,
  FolderTree,
  CheckCircle2,
  FileCode2,
  Link2,
  Image as ImageIcon,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  ArrowUpRight,
  BookOpen,
} from 'lucide-react';
import { SidebarItemId } from '../erp/SimpleHomeDashboard';
import { SEO_PAGE_REGISTRY, SeoPageMetadata } from '../../services/seo/BizJoSeoEngine';
import BizJoLogo from '../brand/BizJoLogo';

interface SeoSearchCentralHubProps {
  onSelectSection: (sectionId: SidebarItemId) => void;
}

export default function SeoSearchCentralHub({ onSelectSection }: SeoSearchCentralHubProps) {
  const allSeoPages = Object.values(SEO_PAGE_REGISTRY);
  const [selectedPageId, setSelectedPageId] = useState<SidebarItemId>('biz-dashboard');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const selectedMeta: SeoPageMetadata =
    SEO_PAGE_REGISTRY[selectedPageId] || SEO_PAGE_REGISTRY['biz-dashboard'];

  const filteredPages = allSeoPages.filter((p) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.trim().toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.metaDescription.toLowerCase().includes(q) ||
      p.canonicalPath.toLowerCase().includes(q) ||
      p.directoryNameAr.toLowerCase().includes(q) ||
      p.beginnerSearchTerms.some((t) => t.toLowerCase().includes(q)) ||
      p.expertSearchTerms.some((t) => t.toLowerCase().includes(q))
    );
  });

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const directoriesSummary = [
    {
      dir: '/business/*',
      nameAr: 'مجلد الأعمال والفواتير والعقود',
      freq: 'daily (يتغير يومياً)',
      reason: 'يضم الفواتير وعروض الأسعار والعملاء والموردين المتجددة باستمرار.',
      sampleUrls: ['/business/dashboard', '/business/customers', '/business/vendors', '/business/contracts'],
    },
    {
      dir: '/accounting/*',
      nameAr: 'مجلد الدورة المحاسبية والقوائم المالية',
      freq: 'daily / weekly (يتغير باستمرار)',
      reason: 'يضم قيود اليومية والأستاذ العام وميزان المراجعة والقوائم المالية.',
      sampleUrls: ['/accounting/chart-of-accounts', '/accounting/general-journal', '/accounting/financial-statements'],
    },
    {
      dir: '/taxes/*',
      nameAr: 'مجلد الضرائب الأردنية وJoFotara',
      freq: 'daily / weekly',
      reason: 'يضم فواتير JoFotara وإقرارات ضريبة الدخل والمبيعات (16%) ودرجة الامتثال (92%).',
      sampleUrls: ['/taxes/jofotara-einvoicing', '/taxes/sales-tax-vat', '/taxes/income-tax', '/taxes/tax-compliance'],
    },
    {
      dir: '/hr/*',
      nameAr: 'مجلد الموارد البشرية والضمان الاجتماعي',
      freq: 'monthly (يتغير شهرياً)',
      reason: 'يضم مسيرات الرواتب الشهرية واشتراكات الضمان الاجتماعي (21.75%) والإجازات.',
      sampleUrls: ['/hr/employees', '/hr/payroll', '/hr/social-security', '/hr/leaves'],
    },
    {
      dir: '/policies/*',
      nameAr: 'مجلد السياسات القانونية والخصوصية',
      freq: 'yearly (نادراً ما يتغير)',
      reason: 'وفق دليل Google Search Central، فصل السياسات في مجلد مستقل يساعد الزاحف على معرفة أنها نادرة التغير.',
      sampleUrls: ['/policies/legal-and-privacy'],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-lg flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>تطبيق شامل لدليل Google Search Central SEO Starter Guide</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold">
            مركز تحسين محركات البحث (SEO) وبنية الموقع القياسية لمنصة BizJo
          </h1>
          <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
            تم تطبيق جميع توصيات دليل المبتدئين في تحسين محركات البحث (Google Search Central) على كامل المنصة:
            الروابط الوصفية المجمعة في مجلدات، المسارات التفصيلية (Breadcrumbs)، العناوين الفريدة (`&lt;title&gt;`)، المقتطفات الوصفية (`Meta Description Snippets`)، البيانات المنظمة (`JSON-LD`)، النصوص البديلة للصور (`alt`)، ومصطلحات البحث للمبتدئين والخبراء.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5"
          >
            <FileCode2 className="w-4 h-4 text-emerald-400" />
            <span>معاينة ملف sitemap.xml</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="/robots.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5"
          >
            <Globe className="w-4 h-4" />
            <span>معاينة ملف robots.txt</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Google Search Console Direct Connection Card */}
      <section className="bg-emerald-950/30 border border-emerald-500/40 rounded-2xl p-5 space-y-3 text-xs">
        <div className="font-extrabold text-emerald-400 text-sm flex items-center gap-2">
          <Globe className="w-4 h-4" />
          <span>روابط الربط المباشر مع Google Search Console (بادئة عنوان URL / URL Prefix)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
            <div className="overflow-hidden">
              <div className="text-[11px] text-slate-400 font-bold mb-1">1. رابط الموقع العام (لإضافته في خانة URL Prefix):</div>
              <div dir="ltr" className="font-mono text-emerald-300 font-bold truncate">
                https://ais-pre-fg46wb64rhuxuizt5hohvg-551936965486.europe-west2.run.app
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                handleCopy(
                  'gsc-site-url',
                  'https://ais-pre-fg46wb64rhuxuizt5hohvg-551936965486.europe-west2.run.app'
                )
              }
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold shrink-0 flex items-center gap-1 cursor-pointer"
            >
              {copiedKey === 'gsc-site-url' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'gsc-site-url' ? 'تم النسخ' : 'نسخ الرابط'}</span>
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
            <div className="overflow-hidden">
              <div className="text-[11px] text-slate-400 font-bold mb-1">2. رابط خريطة الموقع (لإضافته في قسم Sitemaps):</div>
              <div dir="ltr" className="font-mono text-sky-300 font-bold truncate">
                https://ais-pre-fg46wb64rhuxuizt5hohvg-551936965486.europe-west2.run.app/sitemap.xml
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                handleCopy(
                  'gsc-sitemap-url',
                  'https://ais-pre-fg46wb64rhuxuizt5hohvg-551936965486.europe-west2.run.app/sitemap.xml'
                )
              }
              className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold shrink-0 flex items-center gap-1 cursor-pointer"
            >
              {copiedKey === 'gsc-sitemap-url' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'gsc-sitemap-url' ? 'تم النسخ' : 'نسخ Sitemap'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 1. LIVE GOOGLE SEARCH RESULT (SERP) VISUAL SIMULATOR */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-emerald-600" />
              <span>1. معاينة ظهور صفحات BizJo في نتائج بحث Google (Title Link &amp; Snippet &amp; Breadcrumb)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              اختر أي قسم من أقسام المنصة الـ {allSeoPages.length} لمعاينة كيف يظهر عنوانه الفريد ومساره التفصيلي ومقتطفه في محرك بحث Google.
            </p>
          </div>

          <select
            value={selectedPageId}
            onChange={(e) => setSelectedPageId(e.target.value as SidebarItemId)}
            aria-label="اختر صفحة لمعاينة ظهورها في بحث Google"
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
          >
            {allSeoPages.map((p) => (
              <option key={p.sectionId} value={p.sectionId}>
                [{p.directoryNameAr}] {p.breadcrumbLabelAr} ({p.canonicalPath})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Google SERP Preview Card */}
          <div className="lg:col-span-7 p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                محاكاة نتيجة بحث Google القياسية (Visual Elements Gallery)
              </span>
              <span dir="ltr" className="font-mono">
                site:bizjo.jo{selectedMeta.canonicalPath}
              </span>
            </div>

            {/* Domain + Breadcrumb row */}
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-slate-900 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black text-xs">
                B
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <span>BizJo</span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px]">
                    Domain
                  </span>
                </div>
                <div dir="ltr" className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                  <span>https://bizjo.jo</span>
                  <span>›</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    {selectedMeta.directorySlug}
                  </span>
                  <span>›</span>
                  <span className="text-slate-700 dark:text-slate-300">{selectedMeta.pageSlug}</span>
                  <span className="ml-1 px-1.5 py-0.2 rounded bg-sky-500/15 text-sky-600 dark:text-sky-400 text-[10px] font-sans">
                    Breadcrumb
                  </span>
                </div>
              </div>
            </div>

            {/* Title Link */}
            <div>
              <a
                href={selectedMeta.canonicalPath}
                onClick={(e) => {
                  e.preventDefault();
                  onSelectSection(selectedMeta.sectionId);
                }}
                className="text-lg font-extrabold text-blue-600 dark:text-sky-400 hover:underline inline-block leading-snug"
              >
                {selectedMeta.title}
              </a>
              <span className="mr-2 px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-sky-300 text-[10px] font-bold">
                Title Link ({selectedMeta.title.length} حرف)
              </span>
            </div>

            {/* Snippet (Meta Description) */}
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {selectedMeta.metaDescription}
              <span className="mr-2 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                Snippet ({selectedMeta.metaDescription.length} حرف)
              </span>
            </p>

            {/* Action to navigate with descriptive anchor text */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <a
                href={selectedMeta.canonicalPath}
                onClick={(e) => {
                  e.preventDefault();
                  onSelectSection(selectedMeta.sectionId);
                }}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>الانتقال إلى صفحة «{selectedMeta.breadcrumbLabelAr}» وتطبيق وسم العنوان والوصف</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={() =>
                  handleCopy(
                    'html-head',
                    `<title>${selectedMeta.title}</title>\n<meta name="description" content="${selectedMeta.metaDescription}" />\n<link rel="canonical" href="https://bizjo.jo${selectedMeta.canonicalPath}" />`
                  )
                }
                className="px-2.5 py-1 rounded-lg bg-slate-200/70 dark:bg-slate-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
              >
                {copiedKey === 'html-head' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'html-head' ? 'تم النسخ' : 'نسخ وسوم HTML'}</span>
              </button>
            </div>
          </div>

          {/* Reader Search Terms (Beginner vs Expert) for the selected page */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
            <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>توقع مصطلحات بحث القراء (Expect your readers&apos; search terms)</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              وفق دليل Google Search Central، يبحث المستخدم المبتدئ بعبارات مختلفة عن المحاسب أو المدير المالي الخبير. يغطي محتوى هذه الصفحة الفئتين طبيعياً دون حشو للكلمات المفتاحية:
            </p>

            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="font-bold text-amber-600 dark:text-amber-400 mb-1">
                  عبارات يبحث بها المبتدئون وأصحاب المشاريع الجديدة:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMeta.beginnerSearchTerms.map((term) => (
                    <span
                      key={term}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-800 dark:text-amber-300 font-semibold text-[11px]"
                    >
                      &ldquo;{term}&rdquo;
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                  عبارات يبحث بها المحاسبون والمدققون والخبراء:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMeta.expertSearchTerms.map((term) => (
                    <span
                      key={term}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-semibold text-[11px]"
                    >
                      &ldquo;{term}&rdquo;
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ORGANIZE YOUR SITE: GROUP TOPICALLY SIMILAR PAGES IN DIRECTORIES */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-emerald-600" />
            <span>2. تنظيم الموقع وتجميع الصفحات المتشابهة موضوعياً في مجلدات (Directory Grouping &amp; Crawl Frequency)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            يساعد تجميع المسارات في مجلدات موضوعية (`/business/*`, `/accounting/*`, `/taxes/*`, `/policies/*`) زاحف Google على تعلّم وتيرة تغيّر المحتوى في كل مجلد.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {directoriesSummary.map((d) => (
            <div
              key={d.dir}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div dir="ltr" className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                  {d.dir}
                </div>
                <div className="font-bold text-slate-900 dark:text-white">{d.nameAr}</div>
                <div className="inline-block px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[10px] font-bold">
                  وتيرة الزحف: {d.freq}
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">{d.reason}</p>
              </div>
              <div dir="ltr" className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1 font-mono text-[10px] text-slate-500">
                {d.sampleUrls.map((u) => (
                  <div key={u} className="truncate">
                    {u}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. IMAGE ALT TEXT, DESCRIPTIVE ANCHOR TEXT, & THINGS NOT TO FOCUS ON */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Image Optimization & Anchor Text Best Practices */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4 text-xs">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-emerald-600" />
            <span>3. تحسين الصور والرسومات (`alt` / `role=&quot;img&quot;`) والنصوص الرابطة الوصفية</span>
          </h2>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
            <BizJoLogo size="md" showTagline={true} />
            <div className="space-y-1">
              <div className="font-bold text-slate-900 dark:text-white">
                شعار BizJo المدمج مع نص بديل وصفي (`alt` / `aria-label` / `&lt;title&gt;`)
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                يحتوي شعار المنصة وجميع الرسوم البيانية المدمجة على وصف نصي دقيق بجوار سياق نصي مرتبط بها، مما يمكّن بحث صور Google وقارئات الشاشة من فهم علاقة الصورة بالمحتوى المحاسبي والضريبي.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Link2 className="w-4 h-4 text-emerald-500" />
              <span>أمثلة الروابط الداخلية الوصفية (Write good link text) في المنصة:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <a
                href="/taxes/jofotara-einvoicing"
                onClick={(e) => {
                  e.preventDefault();
                  onSelectSection('tax-jofotara');
                }}
                className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold hover:underline flex items-center justify-between"
              >
                <span>إصدار فاتورة ضريبية إلكترونية عبر نظام JoFotara</span>
                <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
              </a>
              <a
                href="/accounting/financial-statements"
                onClick={(e) => {
                  e.preventDefault();
                  onSelectSection('acc-statements');
                }}
                className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold hover:underline flex items-center justify-between"
              >
                <span>استخراج قائمة الدخل وقائمة المركز المالي للشركة</span>
                <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
              </a>
              <a
                href="/help/jordan-laws"
                onClick={(e) => {
                  e.preventDefault();
                  onSelectSection('help-laws');
                }}
                className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold hover:underline flex items-center justify-between"
              >
                <span>مراجعة مواد قانون ضريبة الدخل وقانون الشركات الأردني</span>
                <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
              </a>
              <a
                href="/phase-two/erd-sql-schema"
                onClick={(e) => {
                  e.preventDefault();
                  onSelectSection('p2-erd-schema');
                }}
                className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold hover:underline flex items-center justify-between"
              >
                <span>استعراض مخطط قاعدة البيانات العلائقية (21 جدول SQL)</span>
                <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
              </a>
            </div>
          </div>
        </section>

        {/* Things Google Search Central says you shouldn't focus on */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4 text-xs">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>4. الالتزام بما ينصح دليل Google بعدم التركيز الخاطئ عليه</span>
          </h2>

          <div className="space-y-2.5">
            {[
              {
                title: 'إلغاء وسم meta keywords وتجنب حشو الكلمات (No Keyword Stuffing)',
                desc: 'لا يستخدم بحث Google وسم meta keywords، ويزيل محرك BizJo أي وسم keywords قديم تلقائياً مع كتابة المحتوى بلغة عربية طبيعية واضحة للمستخدم.',
              },
              {
                title: 'عدم وجود إعلانات مزعجة أو نوافذ اعتراضية (No Distracting Ads / Interstitials)',
                desc: 'تم تصميم واجهة BizJo بدون أي إعلانات أو نوافذ منبثقة تحجب المحتوى المحاسبي والضريبي عن المستخدم أو عن زاحف Google.',
              },
              {
                title: 'توحيد العناوين القياسية (Canonical URLs) بدلاً من القلق من المحتوى المكرر',
                desc: 'تحدد كل صفحة في المنصة رابطاً قياسياً واحداً عبر <link rel="canonical"> لتسهيل الفهرسة وتوفير موارد الزحف.',
              },
              {
                title: 'تمييز الروابط الخارجية بـ rel="nofollow noopener noreferrer" عند اللزوم',
                desc: 'جميع الروابط المرجعية الخارجية مهيأة بسمات الأمان وتأهيل الروابط لمنع ربط الموقع بمصادر خارجية غير موثوقة.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">{item.title}</div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 5. COMPLETE DIRECTORY & CANONICAL URL REGISTRY TABLE */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              5. سجل الصفحات والروابط الوصفية الكامل لمنصة BizJo ({filteredPages.length} صفحة مفهرسة)
            </h2>
            <p className="text-xs text-slate-500">
              ابحث في عناوين الصفحات، المسارات الوصفية، أو مصطلحات بحث القراء وانتقل لأي صفحة مباشرة.
            </p>
          </div>
          <input
            type="search"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="ابحث عن صفحة أو مصطلح بحثي..."
            className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs w-full sm:w-72"
          />
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-xs text-right border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 bg-slate-50 dark:bg-slate-950 sticky top-0">
                <th className="py-2.5 px-3">المجلد الموضوعي</th>
                <th className="py-2.5 px-3">الرابط الوصفي (Canonical URL)</th>
                <th className="py-2.5 px-3">عنوان الصفحة في بحث Google (&lt;title&gt;)</th>
                <th className="py-2.5 px-3">وتيرة التحديث</th>
                <th className="py-2.5 px-3">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredPages.map((page) => (
                <tr key={page.sectionId} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-bold text-emerald-700 dark:text-emerald-400">
                    {page.directoryNameAr}
                  </td>
                  <td dir="ltr" className="py-2.5 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                    {page.canonicalPath}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{page.title}</td>
                  <td className="py-2.5 px-3 font-mono text-[11px]">{page.changeFrequency}</td>
                  <td className="py-2.5 px-3">
                    <a
                      href={page.canonicalPath}
                      onClick={(e) => {
                        e.preventDefault();
                        onSelectSection(page.sectionId);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold inline-block"
                    >
                      فتح الصفحة
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
