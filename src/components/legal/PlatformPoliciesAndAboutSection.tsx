import React, { useState, useEffect } from 'react';
import {
  Info,
  Shield,
  FileCheck,
  Scale,
  Sparkles,
  Database,
  AlertOctagon,
  Copyright,
  CheckSquare,
  History,
  Download,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import {
  SystemGovernanceService,
  ConsentLogEntry,
  AuditLogEntry,
} from '../../services/governance/SystemGovernanceService';

export type PolicyTabId =
  | 'about'
  | 'privacy'
  | 'data-consent'
  | 'terms'
  | 'disclaimer-page'
  | 'ip-rights-page'
  | 'consent-log'
  | 'audit-log';

export default function PlatformPoliciesAndAboutSection() {
  const [activePolicyTab, setActivePolicyTab] = useState<PolicyTabId>('about');

  // Reactive Consent & Audit Logs from SystemGovernanceService
  const [consentLogs, setConsentLogs] = useState<ConsentLogEntry[]>(() =>
    SystemGovernanceService.getConsentLogs()
  );
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() =>
    SystemGovernanceService.getAuditLogs()
  );

  // Interactive Consent Log Recording Form State
  const [newConsentUserId, setNewConsentUserId] = useState<string>('USR-JO-982104');
  const [newConsentUserName, setNewConsentUserName] = useState<string>('أحمد عبدالكريم العبدالله');
  const [newConsentIp, setNewConsentIp] = useState<string>('176.29.142.88');
  const [newConsentVersion, setNewConsentVersion] = useState<string>('v2.4-2026.11');
  const [chkPrivacy, setChkPrivacy] = useState<boolean>(true);
  const [chkTerms, setChkTerms] = useState<boolean>(true);
  const [chkProcessing, setChkProcessing] = useState<boolean>(true);
  const [consentSavedNotice, setConsentSavedNotice] = useState<string | null>(null);

  // Interactive Audit Log Recording Form State
  const [newAuditActor, setNewAuditActor] = useState<string>('أحمد');
  const [newAuditModule, setNewAuditModule] = useState<string>('الملف الضريبي للمنشأة');
  const [newAuditAction, setNewAuditAction] = useState<string>('تعديل الرقم الضريبي');
  const [newAuditOldVal, setNewAuditOldVal] = useState<string>('2001584900');
  const [newAuditNewVal, setNewAuditNewVal] = useState<string>('2001584920');
  const [auditSavedNotice, setAuditSavedNotice] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => {
      setConsentLogs(SystemGovernanceService.getConsentLogs());
      setAuditLogs(SystemGovernanceService.getAuditLogs());
    };
    return SystemGovernanceService.subscribe(refresh);
  }, []);

  const handleRecordNewConsent = (e: React.FormEvent) => {
    e.preventDefault();
    const policies: Array<'الخصوصية' | 'الشروط' | 'معالجة البيانات'> = [];
    if (chkPrivacy) policies.push('الخصوصية');
    if (chkTerms) policies.push('الشروط');
    if (chkProcessing) policies.push('معالجة البيانات');
    if (policies.length === 0) return;

    const entry = SystemGovernanceService.recordConsent({
      userId: newConsentUserId,
      userName: newConsentUserName,
      ipAddress: newConsentIp,
      policyVersion: newConsentVersion,
      consentedPolicies: policies,
    });
    setConsentLogs(SystemGovernanceService.getConsentLogs());
    setConsentSavedNotice(
      `تم توثيق وحفظ الموافقة بنجاح (${entry.consentId}) — User ID: ${entry.userId} | IP: ${entry.ipAddress} | ${entry.date} ${entry.time}`
    );
    setTimeout(() => setConsentSavedNotice(null), 5000);
  };

  const handleRecordNewAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuditActor.trim() || !newAuditAction.trim()) return;
    const entry = SystemGovernanceService.recordAuditAction({
      actorName: newAuditActor,
      moduleName: newAuditModule,
      actionLabel: newAuditAction,
      oldValue: newAuditOldVal,
      newValue: newAuditNewVal,
    });
    setAuditLogs(SystemGovernanceService.getAuditLogs());
    setAuditSavedNotice(entry.summarySentence);
    setTimeout(() => setAuditSavedNotice(null), 5000);
  };

  const handleExportConsentJson = () => {
    const blob = new Blob([JSON.stringify(consentLogs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Consent_Log_Proof_Jordan_SaaS_2026.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportAuditJson = () => {
    const blob = new Blob([JSON.stringify(auditLogs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Audit_Activity_Log_Jordan_SaaS_2026.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="platform-legal-governance-hub" className="mt-10 space-y-6">
      {/* Interactive Tabs for About Us, Privacy, Data Consent, Terms, Standalone Disclaimer, IP Rights, Consent Log, and Audit Log */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              منظومة السياسات القانونية، إخلاء المسؤولية، الملكية الفكرية، وسجلات الموافقات والنشاط
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              منصة SaaS أردنية للمحاسبة والفوترة الإلكترونية والامتثال الضريبي للشركات الصغيرة والمتوسطة — خدمة تقنية خاصة ومستقلة.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
            {[
              { id: 'about', label: 'من نحن (SaaS)', icon: Info },
              { id: 'privacy', label: 'صفحة الخصوصية', icon: Shield },
              { id: 'data-consent', label: 'معالجة البيانات', icon: Database },
              { id: 'terms', label: 'شروط الاستخدام', icon: FileCheck },
              { id: 'disclaimer-page', label: 'صفحة إخلاء المسؤولية', icon: AlertOctagon },
              { id: 'ip-rights-page', label: 'حقوق الملكية الفكرية', icon: Copyright },
              { id: 'consent-log', label: `سجل الموافقات (${consentLogs.length})`, icon: CheckSquare },
              { id: 'audit-log', label: `سجل النشاط (${auditLogs.length})`, icon: History },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActivePolicyTab(t.id as PolicyTabId)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                    activePolicyTab === t.id
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 1. من نحن ونموذج SaaS للشركات الصغيرة والمتوسطة */}
        {activePolicyTab === 'about' && (
          <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <h4 className="font-bold text-slate-900 dark:text-white">
              من نحن — منصة SaaS أردنية للمحاسبة والفوترة الإلكترونية والامتثال الضريبي للشركات الصغيرة والمتوسطة
            </h4>
            <p>
              منصة الأعمال والمحاسبة والامتثال الضريبي الأردنية هي منصة برمجيات سحابية (SaaS) تقنية خاصة ومستقلة، مصممة خصيصاً لمساعدة الشركات الصغيرة والمتوسطة (SMEs) ورواد الأعمال في الأردن على إدارة الدفاتر المحاسبية، تنظيم الفواتير الإلكترونية، ومتابعة الالتزامات الضريبية بكفاءة وسهولة.
            </p>
            <p>
              نعمل على تطوير حلول تقنية سحابية حديثة بنموذج الاشتراك الشهري والسنوي تساعد المنشآت على أتمتة العمليات المالية، توثيق سجلات النشاط والموافقات، وتبسيط الوصول إلى الأدوات التحليلية اللازمة لإدارة الأعمال دون الحاجة إلى بنية تقنية معقدة.
            </p>
          </div>
        )}

        {/* 2. صفحة الخصوصية */}
        {activePolicyTab === 'privacy' && (
          <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-1">صفحة الخصوصية — مقدمة</h4>
              <p>
                تحترم المنصة خصوصية مستخدميها وتلتزم بحماية البيانات الشخصية والمالية وفق أفضل الممارسات التقنية والإجرائية المتاحة وبما ينسجم مع تشريعات حماية البيانات الشخصية في المملكة الأردنية الهاشمية.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                <h5 className="font-bold text-slate-900 dark:text-white mb-2 text-xs">يتم جمع البيانات التالية:</h5>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>بيانات الحساب.</li>
                  <li>بيانات التواصل.</li>
                  <li>البيانات المالية التي يقوم المستخدم بإدخالها.</li>
                  <li>بيانات الاستخدام الفنية وعنوان IP وتوقيت الموافقة.</li>
                </ul>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                <h5 className="font-bold text-slate-900 dark:text-white mb-2 text-xs">استخدام البيانات:</h5>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>تقديم الخدمات السحابية للمنشأة.</li>
                  <li>تحسين جودة المنصة.</li>
                  <li>دعم المستخدمين.</li>
                  <li>تطوير الميزات الجديدة.</li>
                  <li>الامتثال للمتطلبات القانونية والتنظيمية.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 3. سياسة الموافقة على جمع ومعالجة البيانات */}
        {activePolicyTab === 'data-consent' && (
          <div className="space-y-5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                سياسة الموافقة على جمع ومعالجة البيانات
              </h4>
              <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
                إصدار السياسة: v2.4-2026.11 | آخر تحديث: 10 نوفمبر 2026
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                <h5 className="font-bold text-slate-900 dark:text-white">1. مقدمة</h5>
                <p>
                  نلتزم في منصة الأعمال والمحاسبة والامتثال الضريبي الأردنية بحماية خصوصية المستخدمين والتعامل مع البيانات الشخصية والتجارية بمسؤولية وشفافية. ومن خلال التسجيل أو استخدام المنصة، فإنك توافق على جمع ومعالجة واستخدام البيانات وفقاً لهذه السياسة.
                </p>

                <h5 className="font-bold text-slate-900 dark:text-white pt-2">2. البيانات التي نقوم بجمعها</h5>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>بيانات الهوية الشخصية وبيانات المالك والمفوض.</li>
                  <li>بيانات المنشأة والشركاء وبيانات الاتصال والتواصل.</li>
                  <li>البيانات المحاسبية والمالية والضريبية المدخلة.</li>
                  <li>الفواتير والمستندات المرفوعة وسجلات الدخول والاستخدام.</li>
                  <li>بيانات الأجهزة والمتصفح وعنوان IP وإصدار السياسة.</li>
                </ul>

                <h5 className="font-bold text-slate-900 dark:text-white pt-2">3. الغرض من معالجة البيانات</h5>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>إنشاء وإدارة حساب المستخدم والمنشأة.</li>
                  <li>تقديم الخدمات المحاسبية والضريبية والإدارية وإصدار التقارير.</li>
                  <li>دعم التكامل مع الأنظمة والخدمات المتاحة والتحقق من الصلاحيات.</li>
                  <li>توثيق سجل الموافقات وسجل النشاط لحماية حقوق الأطراف.</li>
                </ul>

                <h5 className="font-bold text-slate-900 dark:text-white pt-2">4. موافقة المستخدم</h5>
                <ul className="space-y-1">
                  <li>✓ أن البيانات المقدمة صحيحة وكاملة وحديثة.</li>
                  <li>✓ أن لديك الصلاحية القانونية لإدخال البيانات أو رفع المستندات الخاصة بمنشأتك.</li>
                  <li>✓ السماح للمنصة بمعالجة وتخزين البيانات اللازمة لتقديم الخدمات المطلوبة.</li>
                </ul>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                <h5 className="font-bold text-slate-900 dark:text-white">5. مشاركة البيانات وحمايتها</h5>
                <p>
                  لا يتم بيع بيانات المستخدمين لأي طرف ثالث. يجوز مشاركة البيانات فقط بناءً على طلب أو موافقة المستخدم، أو إذا تطلب ذلك القانون أو قرار قضائي، أو مع مزودي الخدمات التقنية اللازمين لتشغيل المنصة مع الالتزام بمتطلبات السرية.
                </p>

                <h5 className="font-bold text-slate-900 dark:text-white pt-2">6. الاحتفاظ بالبيانات وحقوق المستخدم</h5>
                <p>
                  يتم الاحتفاظ بالبيانات طوال فترة استخدام الخدمة أو للمدة التي تقتضيها المتطلبات القانونية أو المحاسبية. ويحق للمستخدم الاطلاع على بياناته، طلب تحديثها أو تصحيحها، أو طلب نسخة منها.
                </p>

                <h5 className="font-bold text-slate-900 dark:text-white pt-2">7. الذكاء الاصطناعي والتعديلات</h5>
                <p>
                  نتائج الذكاء الاصطناعي والحسابات الآلية قد تحتوي على أخطاء أو معلومات غير مكتملة ولا تعتبر استشارة قانونية أو ضريبية أو محاسبية معتمدة. ويجوز للمنصة تحديث هذه السياسة من وقت لآخر وتصبح النسخة المحدثة نافذة اعتباراً من تاريخ نشرها داخل المنصة.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 4. شروط الاستخدام */}
        {activePolicyTab === 'terms' && (
          <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <h4 className="font-bold text-slate-900 dark:text-white">شروط الاستخدام</h4>
            <p>
              باستخدامك للمنصة فإنك توافق على الالتزام بشروط الاستخدام والسياسات المعلنة داخل المنصة، وتقر بأنك المسؤول عن صحة البيانات المدخلة وعن أي قرارات مالية أو ضريبية يتم اتخاذها بناءً على النتائج أو المعلومات المعروضة داخل المنصة.
            </p>
            <p>
              تُقدم المنصة كخدمة برمجية سحابية (SaaS) مساعدة للشركات الصغيرة والمتوسطة والأفراد، ويتعين على المستخدم مراجعة كافة المخرجات والقيود المحاسبية والتأكد من مطابقتها للأنظمة والتعليمات السارية قبل تقديمها لأي جهة.
            </p>
          </div>
        )}

        {/* 5. صفحة إخلاء المسؤولية (مستقلة عن الشروط والخصوصية) */}
        {activePolicyTab === 'disclaimer-page' && (
          <div className="p-5 bg-amber-950/15 border border-amber-600/40 rounded-2xl space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
            <div className="flex items-center justify-between border-b border-amber-600/30 pb-3">
              <h4 className="font-bold text-base text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 shrink-0" />
                <span>صفحة إخلاء المسؤولية القانونية والمهنية (وثيقة مستقلة)</span>
              </h4>
              <span className="font-mono text-[11px] text-slate-500">وثيقة مستقلة عن الشروط والخصوصية</span>
            </div>

            <div className="p-4 bg-white dark:bg-slate-950 border border-amber-500/40 rounded-xl font-bold text-slate-900 dark:text-white">
              المعلومات والنتائج والاحتسابات المعروضة داخل المنصة لأغراض المساعدة فقط، ولا تعتبر استشارة قانونية أو محاسبية أو ضريبية معتمدة.
            </div>

            <ul className="list-disc list-inside space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <li>
                <strong>استقلالية المنصة:</strong> هذه المنصة عبارة عن نظام برمجي سحابي (SaaS) خاص ومستقل، ولا تتبع أو تمثل دائرة ضريبة الدخل والمبيعات أو المؤسسة العامة للضمان الاجتماعي أو أي جهة حكومية أو رسمية في المملكة الأردنية الهاشمية.
              </li>
              <li>
                <strong>الطبيعة الإرشادية والتقديرية للحسابات:</strong> جميع الحاسبات الضريبية، أدوات محاكاة الفواتير الإلكترونية، ونماذج تقدير الإقرارات مبنية على معادلات رياضية إرشادية وفق التشريعات المعلنة، ولا تغني عن مراجعة المختصين أو التحقق المباشر عبر البوابات الحكومية المعنية.
              </li>
              <li>
                <strong>حدود المسؤولية:</strong> لا تتحمل إدارة المنصة أو فريق تطويرها أي مسؤولية قانونية أو مالية عن أي غرامات أو فروقات تقدير أو أضرار مباشرة أو غير مباشرة قد تنشأ نتيجة الاعتماد المنفرد على مخرجات المنصة أو إدخال بيانات غير مكتملة من قِبل المستخدم.
              </li>
            </ul>
          </div>
        )}

        {/* 6. صفحة حقوق الملكية الفكرية (مستقلة) */}
        {activePolicyTab === 'ip-rights-page' && (
          <div className="p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h4 className="font-bold text-base text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <Copyright className="w-5 h-5 shrink-0" />
                <span>صفحة حقوق الملكية الفكرية وحماية البرمجيات</span>
              </h4>
              <span className="font-mono text-[11px] text-slate-500">محمية بموجب التشريعات الأردنية</span>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-emerald-500/40 rounded-xl font-bold text-slate-900 dark:text-white">
              جميع المحتويات والتصاميم وقواعد البيانات والبرمجيات والعلامات التجارية الخاصة بالمنصة محمية بموجب قوانين الملكية الفكرية، ولا يجوز نسخها أو إعادة استخدامها دون إذن خطي مسبق.
            </div>

            <ul className="list-disc list-inside space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <li>
                <strong>حماية الشيفرة البرمجية والخوارزميات:</strong> تخضع كافة محركات الحسابات العشرية، هياكل قواعد البيانات، واجهات المستخدم، والتصاميم الهندسية للحماية القانونية بموجب قانون حماية حق المؤلف والحقوق المجاورة الأردني.
              </li>
              <li>
                <strong>ترخيص الاستخدام لعملاء SaaS:</strong> يمنح الاشتراك في المنصة للمنشأة المشتركة ترخيص استخدام غير حصري وغير قابل للتحويل للانتفاع بخدمات المنصة ضمن نطاق أعمالها الداخلية فقط.
              </li>
              <li>
                <strong>حظر الهندسة العكسية أو إعادة النشر:</strong> يُحظر نسخ أو اقتباس أو إعادة بيع أو تأجير أو إجراء هندسة عكسية لأي جزء من برمجيات المنصة أو نماذجها دون الحصول على موافقة خطية مسبقة من إدارة المنصة.
              </li>
            </ul>
          </div>
        )}

        {/* 7. سجل الموافقات القانونية (Consent Log) */}
        {activePolicyTab === 'consent-log' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-emerald-500" />
                  <span>سجل الموافقات القانونية الموثق (Consent Log — إثبات الموافقة عند النزاعات)</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  يخزن تلقائياً: User ID · IP Address · Date · Time · Policy Version عند موافقة المستخدم على الخصوصية والشروط ومعالجة البيانات
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportConsentJson}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تصدير سجل الموافقات (JSON)</span>
              </button>
            </div>

            {consentSavedNotice && (
              <div className="p-3 bg-emerald-950/20 border border-emerald-600/40 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{consentSavedNotice}</span>
              </div>
            )}

            {/* Form to Record / Test a New Consent Proof */}
            <form
              onSubmit={handleRecordNewConsent}
              className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl items-end text-xs"
            >
              <div className="sm:col-span-2">
                <label className="block text-[11px] text-slate-500 mb-1">User ID</label>
                <input
                  type="text"
                  value={newConsentUserId}
                  onChange={(e) => setNewConsentUserId(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 font-mono text-slate-900 dark:text-white"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-[11px] text-slate-500 mb-1">اسم المستخدم / المفوض</label>
                <input
                  type="text"
                  value={newConsentUserName}
                  onChange={(e) => setNewConsentUserName(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] text-slate-500 mb-1">IP Address</label>
                <input
                  type="text"
                  dir="ltr"
                  value={newConsentIp}
                  onChange={(e) => setNewConsentIp(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 font-mono text-slate-900 dark:text-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] text-slate-500 mb-1">Policy Version</label>
                <input
                  type="text"
                  dir="ltr"
                  value={newConsentVersion}
                  onChange={(e) => setNewConsentVersion(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 font-mono text-slate-900 dark:text-white"
                />
              </div>
              <div className="sm:col-span-3 flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-[11px]">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" checked={chkPrivacy} onChange={(e) => setChkPrivacy(e.target.checked)} className="accent-emerald-600" />
                    <span>الخصوصية</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" checked={chkTerms} onChange={(e) => setChkTerms(e.target.checked)} className="accent-emerald-600" />
                    <span>الشروط</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" checked={chkProcessing} onChange={(e) => setChkProcessing(e.target.checked)} className="accent-emerald-600" />
                    <span>معالجة البيانات</span>
                  </label>
                </div>
                <button
                  type="submit"
                  className="w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>توثيق الموافقة بالسجل</span>
                </button>
              </div>
            </form>

            {/* Consent Log Table */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 dark:bg-slate-950 text-slate-500 border-b border-slate-200 dark:border-slate-800 font-mono">
                  <tr>
                    <th className="py-2.5 px-3">User ID</th>
                    <th className="py-2.5 px-3 font-sans">المستخدم</th>
                    <th className="py-2.5 px-3">IP Address</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Time</th>
                    <th className="py-2.5 px-3">Policy Version</th>
                    <th className="py-2.5 px-3 font-sans">السياسات الموافق عليها</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/70 font-mono tabular-nums">
                  {consentLogs.map((c) => (
                    <tr key={c.consentId} className="hover:bg-slate-50 dark:hover:bg-slate-950/60">
                      <td className="py-2.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">{c.userId}</td>
                      <td className="py-2.5 px-3 font-sans font-semibold text-slate-900 dark:text-white">{c.userName}</td>
                      <td className="py-2.5 px-3 text-sky-600 dark:text-sky-400">{c.ipAddress}</td>
                      <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">{c.date}</td>
                      <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">{c.time}</td>
                      <td className="py-2.5 px-3 font-bold text-amber-600 dark:text-amber-400">{c.policyVersion}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-600 dark:text-slate-300">
                        {c.consentedPolicies.join(' + ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 8. سجل النشاط والتعديلات المحاسبية والضريبية (Audit Log) */}
        {activePolicyTab === 'audit-log' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-emerald-500" />
                  <span>سجل النشاط والتعديلات للنظام المحاسبي والضريبي (System Audit Trail)</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  يوثق بدقة: من؟ · متى؟ · ماذا عدّل؟ · ما القيمة القديمة؟ · ما القيمة الجديدة؟ لجميع العمليات الحساسة
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportAuditJson}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تصدير سجل النشاط (JSON)</span>
              </button>
            </div>

            {auditSavedNotice && (
              <div className="p-3 bg-emerald-950/20 border border-emerald-600/40 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>تم التسجيل في سجل النشاط: {auditSavedNotice}</span>
              </div>
            )}

            {/* Interactive Form to Record / Simulate an Audit Trail Event */}
            <form
              onSubmit={handleRecordNewAudit}
              className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl items-end text-xs"
            >
              <div className="sm:col-span-2">
                <label className="block text-[11px] text-slate-500 mb-1">من؟ (اسم المستخدم)</label>
                <input
                  type="text"
                  value={newAuditActor}
                  onChange={(e) => setNewAuditActor(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-[11px] text-slate-500 mb-1">ماذا عدّل؟ (البيان)</label>
                <input
                  type="text"
                  value={newAuditAction}
                  onChange={(e) => setNewAuditAction(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] text-slate-500 mb-1">القسم</label>
                <input
                  type="text"
                  value={newAuditModule}
                  onChange={(e) => setNewAuditModule(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] text-slate-500 mb-1">القيمة القديمة</label>
                <input
                  type="text"
                  value={newAuditOldVal}
                  onChange={(e) => setNewAuditOldVal(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 font-mono text-slate-900 dark:text-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] text-slate-500 mb-1">القيمة الجديدة</label>
                <input
                  type="text"
                  value={newAuditNewVal}
                  onChange={(e) => setNewAuditNewVal(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 font-mono text-slate-900 dark:text-white"
                />
              </div>
              <div className="sm:col-span-1">
                <button
                  type="submit"
                  className="w-full py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center justify-center cursor-pointer"
                  title="إضافة لسجل النشاط"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Audit Trail Table */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 dark:bg-slate-950 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">من؟ (المستخدم)</th>
                    <th className="py-2.5 px-3">متى؟ (التاريخ والوقت)</th>
                    <th className="py-2.5 px-3">ماذا عدّل؟</th>
                    <th className="py-2.5 px-3">القيمة القديمة</th>
                    <th className="py-2.5 px-3">القيمة الجديدة</th>
                    <th className="py-2.5 px-3">ملخص التوثيق الرقابي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/70">
                  {auditLogs.map((log) => (
                    <tr key={log.auditId} className="hover:bg-slate-50 dark:hover:bg-slate-950/60">
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{log.actorName}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-400">
                        {log.date} · {log.time}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-emerald-600 dark:text-emerald-400">
                        {log.actionLabel}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-rose-500">{log.oldValue}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-sky-600 dark:text-sky-400">{log.newValue}</td>
                      <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">{log.summarySentence}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Main Legal Disclaimer & AI Disclaimer (Always visible at bottom of all pages) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7 p-5 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-300 leading-relaxed space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Scale className="w-4 h-4 shrink-0" />
            <span>إخلاء المسؤولية القانونية وحقوق الملكية الفكرية:</span>
          </div>
          <p>
            المعلومات والنتائج والاحتسابات المعروضة داخل المنصة لأغراض المساعدة فقط، ولا تعتبر استشارة قانونية أو محاسبية أو ضريبية معتمدة. وهذه المنصة خدمة تقنية خاصة ومستقلة ولا تتبع أو تمثل أي جهة حكومية أو رسمية في المملكة الأردنية الهاشمية.
          </p>
          <p className="text-slate-400">
            جميع المحتويات والتصاميم وقواعد البيانات والبرمجيات والعلامات التجارية الخاصة بالمنصة محمية بموجب قوانين الملكية الفكرية، ولا يجوز نسخها أو إعادة استخدامها دون إذن خطي مسبق.
          </p>
        </div>

        <div className="lg:col-span-5 p-5 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-300 leading-relaxed space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>تنويه الذكاء الاصطناعي والمساعد الذكي للأعمال والضرائب:</span>
          </div>
          <p className="text-slate-400">
            <strong>المساعد الذكي للأعمال والضرائب:</strong> مساعد رقمي يعتمد على تقنيات الذكاء الاصطناعي للإجابة عن الأسئلة العامة وتقديم المعلومات والتوضيحات المتعلقة بالأعمال والمحاسبة والضرائب.
          </p>
          <p>
            قد تعتمد بعض الخدمات داخل المنصة على تقنيات الذكاء الاصطناعي لتوليد محتوى أو تحليلات أو توصيات. وقد تحتوي المخرجات على معلومات غير مكتملة أو غير محدثة، لذلك يجب مراجعتها والتحقق منها قبل الاعتماد عليها في أي إجراء مالي أو قانوني أو ضريبي.
          </p>
        </div>
      </div>
    </div>
  );
}
