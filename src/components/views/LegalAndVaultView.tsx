import React, { useState, useEffect } from 'react';
import {
  FileText,
  Lock,
  Activity,
  Database,
  Download,
  Copy,
  Check,
  Plus,
  Shield,
  CheckSquare,
  History,
  CheckCircle2,
} from 'lucide-react';
import { JORDAN_LEGAL_TEMPLATES, PRISMA_DATABASE_SCHEMA } from '../../data/legalTemplates';
import { EncryptedDocumentArchive, TaxDocumentCategory, EncryptedDocumentMeta } from '../../services/dms/EncryptedDocumentArchive';
import {
  SystemGovernanceService,
  ConsentLogEntry,
  AuditLogEntry,
} from '../../services/governance/SystemGovernanceService';

interface LegalAndVaultViewProps {
  initialSubTab?: string;
}

export default function LegalAndVaultView({ initialSubTab = 'legal-memos' }: LegalAndVaultViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<
    'legal-memos' | 'governance-logs' | 'dms-vault' | 'system-status' | 'db-schema'
  >((initialSubTab as any) || 'legal-memos');

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab as any);
    }
  }, [initialSubTab]);

  // --- Governance Logs (Consent Log & Audit Log) State ---
  const [consentLogs, setConsentLogs] = useState<ConsentLogEntry[]>(() =>
    SystemGovernanceService.getConsentLogs()
  );
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() =>
    SystemGovernanceService.getAuditLogs()
  );
  const [auditSearchQuery, setAuditSearchQuery] = useState<string>('');
  const [quickActor, setQuickActor] = useState<string>('أحمد');
  const [quickAction, setQuickAction] = useState<string>('تعديل الرقم الضريبي');
  const [quickOldVal, setQuickOldVal] = useState<string>('2001584900');
  const [quickNewVal, setQuickNewVal] = useState<string>('2001584920');
  const [logBannerMsg, setLogBannerMsg] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => {
      setConsentLogs(SystemGovernanceService.getConsentLogs());
      setAuditLogs(SystemGovernanceService.getAuditLogs());
    };
    return SystemGovernanceService.subscribe(refresh);
  }, []);

  const handleQuickAddAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickActor.trim() || !quickAction.trim()) return;
    const entry = SystemGovernanceService.recordAuditAction({
      actorName: quickActor,
      moduleName: 'الإدارة الضريبية والمحاسبية',
      actionLabel: quickAction,
      oldValue: quickOldVal,
      newValue: quickNewVal,
    });
    setAuditLogs(SystemGovernanceService.getAuditLogs());
    setLogBannerMsg(`تم التوثيق بنجاح: ${entry.summarySentence}`);
    setTimeout(() => setLogBannerMsg(null), 5000);
  };

  const handleQuickAddConsent = () => {
    const entry = SystemGovernanceService.recordConsent({
      userId: `USR-JO-${Math.floor(100000 + Math.random() * 900000)}`,
      userName: quickActor || 'أحمد عبدالكريم العبدالله',
      ipAddress: '176.29.142.88',
      policyVersion: 'v2.4-2026.11',
      consentedPolicies: ['الخصوصية', 'الشروط', 'معالجة البيانات'],
    });
    setConsentLogs(SystemGovernanceService.getConsentLogs());
    setLogBannerMsg(
      `تم تسجيل موافقة جديدة (${entry.consentId}) — User ID: ${entry.userId} | IP: ${entry.ipAddress} | Date: ${entry.date} | Time: ${entry.time} | Policy: ${entry.policyVersion}`
    );
    setTimeout(() => setLogBannerMsg(null), 5000);
  };

  // --- Sub-tab 1: Legal Templates State ---
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(JORDAN_LEGAL_TEMPLATES[0].id);
  const selectedTemplate = JORDAN_LEGAL_TEMPLATES.find((t) => t.id === selectedTemplateId) || JORDAN_LEGAL_TEMPLATES[0];

  const [fieldValues, setFieldValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    JORDAN_LEGAL_TEMPLATES.forEach((tpl) => {
      tpl.editableFields.forEach((f) => {
        initial[`${tpl.id}_${f.key}`] = f.defaultValue;
      });
    });
    return initial;
  });
  const [copiedDoc, setCopiedDoc] = useState(false);

  const currentDocValues: Record<string, string> = {};
  selectedTemplate.editableFields.forEach((f) => {
    currentDocValues[f.key] = fieldValues[`${selectedTemplate.id}_${f.key}`] ?? f.defaultValue;
  });

  const generatedMarkdown = selectedTemplate.buildMarkdown(currentDocValues);

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(generatedMarkdown);
    setCopiedDoc(true);
    setTimeout(() => setCopiedDoc(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([generatedMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTemplate.id}_2026.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // --- Sub-tab 2: Encrypted Document Archive (DMS) State ---
  const [dmsTin, setDmsTin] = useState('2001584920');
  const [dmsCategory, setDmsCategory] = useState<TaxDocumentCategory>('JOFOTARA_INVOICE');
  const [dmsFileName, setDmsFileName] = useState('JoFotara_Batch_Q3_2026_Signed.pdf');
  const [dmsFileSizeKb, setDmsFileSizeKb] = useState<number>(480);
  const [archivedDocs, setArchivedDocs] = useState<EncryptedDocumentMeta[]>([
    {
      documentId: '9f81c2b0-4120-4e11-88a2-7c1928374650',
      fileName: 'Commercial_Lease_Contract_Amman_2026.pdf',
      category: 'LEASE_CONTRACT',
      categoryLabelAr: EncryptedDocumentArchive.CATEGORY_LABELS.LEASE_CONTRACT,
      storagePath: 'r2://jordan-tax-vault/enterprises/2001584920/2026/lease_contract/9f81c2b0.aes256.enc',
      sha256Checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      ivHex: '8f1a2b3c4d5e6f708192a3b4',
      cipherAlgorithm: 'AES-256-GCM',
      fileSizeBytes: 642000,
      uploadedAt: '2026-11-08T14:20:00.000Z',
    },
    {
      documentId: '3a44b190-8821-4c09-91d4-1a2b3c4d5e6f',
      fileName: 'SSC_Monthly_Payroll_Remittance_Oct2026.xlsx',
      category: 'PAYROLL_SSC',
      categoryLabelAr: EncryptedDocumentArchive.CATEGORY_LABELS.PAYROLL_SSC,
      storagePath: 'r2://jordan-tax-vault/enterprises/2001584920/2026/payroll_ssc/3a44b190.aes256.enc',
      sha256Checksum: '7d865e959b2466918c9863afca942d0fb89d7c9ac0c99bafc3749504ded97730',
      ivHex: '1c2d3e4f5a6b7c8d9e0f1a2b',
      cipherAlgorithm: 'AES-256-GCM',
      fileSizeBytes: 318000,
      uploadedAt: '2026-11-09T09:45:00.000Z',
    },
  ]);

  const handleEncryptAndStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dmsFileName.trim()) return;
    const meta = await EncryptedDocumentArchive.storeEncryptedDocument({
      enterpriseTin: dmsTin,
      taxYear: 2026,
      category: dmsCategory,
      fileName: dmsFileName,
      fileSizeBytes: dmsFileSizeKb * 1024,
    });
    setArchivedDocs([meta, ...archivedDocs]);
    SystemGovernanceService.recordAuditAction({
      actorName: 'المستخدم الحالي',
      moduleName: 'الأرشيف المشفر AES-256',
      actionLabel: `إيداع مستند مشفر (${dmsFileName})`,
      oldValue: `${archivedDocs.length} مستندات`,
      newValue: `${archivedDocs.length + 1} مستندات`,
    });
  };

  // --- Sub-tab 3: System Status State ---
  const [statusComponents] = useState([
    {
      name: 'بوابة التوافق الفني للفوترة الإلكترونية (JoFotara Gateway)',
      category: 'التكامل التقني والضريبي',
      latencyMs: 142,
      uptime90Days: '99.95%',
      statusLabel: 'تعمل بكفاءة تامة',
    },
    {
      name: 'محرك احتساب ضريبة الدخل والضمان الاجتماعي (Decimal.js)',
      category: 'المحركات الرياضية والتحليل',
      latencyMs: 18,
      uptime90Days: '100.00%',
      statusLabel: 'تعمل بكفاءة تامة',
    },
    {
      name: 'خدمة مطابقة التحويلات الفورية (نظام CliQ والكشوف البنكية)',
      category: 'المدفوعات والتسويات',
      latencyMs: 95,
      uptime90Days: '99.91%',
      statusLabel: 'تعمل بكفاءة تامة',
    },
    {
      name: 'محرك توثيق سجل الموافقات (Consent Log) وسجل النشاط (Audit Log)',
      category: 'الحوكمة والإثبات القانوني',
      latencyMs: 9,
      uptime90Days: '100.00%',
      statusLabel: 'تعمل بكفاءة تامة',
    },
    {
      name: 'خزنة الأرشيف السحابي المشفر (AES-256-GCM / PostgreSQL)',
      category: 'البنية التحتية والأمن السيبراني',
      latencyMs: 12,
      uptime90Days: '99.99%',
      statusLabel: 'تعمل بكفاءة تامة',
    },
  ]);

  const filteredAuditLogs = auditLogs.filter(
    (a) =>
      !auditSearchQuery.trim() ||
      a.actorName.includes(auditSearchQuery) ||
      a.actionLabel.includes(auditSearchQuery) ||
      a.summarySentence.includes(auditSearchQuery) ||
      a.oldValue.includes(auditSearchQuery) ||
      a.newValue.includes(auditSearchQuery)
  );

  return (
    <div className="space-y-6">
      {/* Sub-navigation Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            المكتبة القانونية، سجل الموافقات والنشاط، والأرشيف المشفر (DMS)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            8 نماذج ومذكرات استرشادية · سجل الموافقات (Consent Log) · سجل النشاط (Audit Log) · خزنة AES-256-GCM
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
          {[
            { id: 'legal-memos', label: 'المذكرات والعقود الاسترشادية (8)', icon: FileText },
            { id: 'governance-logs', label: 'سجل الموافقات وسجل النشاط', icon: CheckSquare },
            { id: 'dms-vault', label: 'الأرشيف المشفر AES-256', icon: Lock },
            { id: 'system-status', label: 'حالة المنظومة الحية', icon: Activity },
            { id: 'db-schema', label: 'مخطط قاعدة البيانات Prisma', icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                  activeSubTab === tab.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SUB-TAB: Consent Log & Audit Log Console */}
      {activeSubTab === 'governance-logs' && (
        <div className="space-y-6">
          {logBannerMsg && (
            <div className="p-4 bg-emerald-950/20 border border-emerald-600/40 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{logBannerMsg}</span>
            </div>
          )}

          {/* Section 1: Consent Log (سجل الموافقات) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-1">
                  توثيق الموافقات القانونية (الخصوصية · الشروط · معالجة البيانات)
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-emerald-500" />
                  <span>سجل الموافقات (Consent Log — لإثبات موافقة المستخدم مستقبلاً عند أي نزاع)</span>
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleQuickAddConsent}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>تسجيل موافقة جديدة الآن</span>
                </button>
              </div>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 dark:bg-slate-950 text-slate-500 border-b border-slate-200 dark:border-slate-800 font-mono">
                  <tr>
                    <th className="py-2.5 px-3">User ID</th>
                    <th className="py-2.5 px-3 font-sans">اسم المستخدم</th>
                    <th className="py-2.5 px-3">IP Address</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Time</th>
                    <th className="py-2.5 px-3">Policy Version</th>
                    <th className="py-2.5 px-3 font-sans">بنود الموافقة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/70 font-mono tabular-nums">
                  {consentLogs.map((item) => (
                    <tr key={item.consentId}>
                      <td className="py-2.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">{item.userId}</td>
                      <td className="py-2.5 px-3 font-sans font-semibold text-slate-900 dark:text-white">{item.userName}</td>
                      <td className="py-2.5 px-3 text-sky-600 dark:text-sky-400">{item.ipAddress}</td>
                      <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">{item.date}</td>
                      <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">{item.time}</td>
                      <td className="py-2.5 px-3 font-bold text-amber-600 dark:text-amber-400">{item.policyVersion}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-600 dark:text-slate-300">
                        {item.consentedPolicies.join('، ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Audit Log (سجل النشاط) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-1">
                  الرقابة الداخلية وتوثيق التعديلات المحاسبية والضريبية
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-emerald-500" />
                  <span>سجل النشاط (Audit Log — من؟ متى؟ ماذا عدّل؟ القيمة القديمة؟ القيمة الجديدة؟)</span>
                </h2>
              </div>

              <input
                type="text"
                value={auditSearchQuery}
                onChange={(e) => setAuditSearchQuery(e.target.value)}
                placeholder="ابحث باسم المستخدم أو الحقل المعدل..."
                className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white w-full sm:w-64"
              />
            </div>

            <form
              onSubmit={handleQuickAddAudit}
              className="grid grid-cols-1 sm:grid-cols-5 gap-3 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl items-end text-xs"
            >
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">من؟ (اسم المستخدم)</label>
                <input
                  type="text"
                  value={quickActor}
                  onChange={(e) => setQuickActor(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">ماذا عدّل؟</label>
                <input
                  type="text"
                  value={quickAction}
                  onChange={(e) => setQuickAction(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">ما القيمة القديمة؟</label>
                <input
                  type="text"
                  value={quickOldVal}
                  onChange={(e) => setQuickOldVal(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 font-mono text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">ما القيمة الجديدة؟</label>
                <input
                  type="text"
                  value={quickNewVal}
                  onChange={(e) => setQuickNewVal(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 font-mono text-slate-900 dark:text-white"
                />
              </div>
              <button
                type="submit"
                className="py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>تسجيل التعديل</span>
              </button>
            </form>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 dark:bg-slate-950 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">من؟</th>
                    <th className="py-2.5 px-3">متى؟</th>
                    <th className="py-2.5 px-3">ماذا عدّل؟</th>
                    <th className="py-2.5 px-3">القيمة القديمة</th>
                    <th className="py-2.5 px-3">القيمة الجديدة</th>
                    <th className="py-2.5 px-3">سجل الحدث التلقائي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/70">
                  {filteredAuditLogs.map((log) => (
                    <tr key={log.auditId}>
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
        </div>
      )}

      {/* SUB-TAB 1: 8 Jordanian Legal & Tax Memos */}
      {activeSubTab === 'legal-memos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Template Selector List */}
          <div className="lg:col-span-4 space-y-2.5">
            {JORDAN_LEGAL_TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => setSelectedTemplateId(tpl.id)}
                className={`w-full text-right p-4 rounded-xl border transition cursor-pointer block ${
                  selectedTemplateId === tpl.id
                    ? 'bg-emerald-600/10 border-emerald-600 text-slate-900 dark:text-white'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                  <span>{tpl.categoryLabelAr}</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">{tpl.code}</span>
                </div>
                <div className="text-xs font-bold mb-1">{tpl.titleAr}</div>
                <div className="text-[11px] text-slate-500 line-clamp-2">{tpl.lawReference}</div>
              </button>
            ))}
          </div>

          {/* Template Customizer & Live Document Preview */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium block">
                  {selectedTemplate.lawReference}
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedTemplate.titleAr}
                </h2>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleCopyMarkdown}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedDoc ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedDoc ? 'تم النسخ' : 'نسخ النص'}</span>
                </button>
                <button
                  onClick={handleDownloadMarkdown}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تنزيل المذكرة (.md)</span>
                </button>
              </div>
            </div>

            {/* Editable Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
              {selectedTemplate.editableFields.map((field) => (
                <div key={field.key}>
                  <label className="block text-[11px] text-slate-500 mb-1">{field.label}</label>
                  <input
                    type="text"
                    value={fieldValues[`${selectedTemplate.id}_${field.key}`] ?? field.defaultValue}
                    onChange={(e) => {
                      const oldVal = fieldValues[`${selectedTemplate.id}_${field.key}`] ?? field.defaultValue;
                      const newVal = e.target.value;
                      setFieldValues({
                        ...fieldValues,
                        [`${selectedTemplate.id}_${field.key}`]: newVal,
                      });
                      if (oldVal !== newVal && newVal.length > 2) {
                        SystemGovernanceService.recordAuditAction({
                          actorName: 'المستخدم الحالي',
                          moduleName: selectedTemplate.titleAr,
                          actionLabel: `تعديل حقل (${field.label})`,
                          oldValue: oldVal,
                          newValue: newVal,
                        });
                      }
                    }}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              ))}
            </div>

            {/* Document Output */}
            <div className="p-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
              <pre className="whitespace-pre-wrap font-sans text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                {generatedMarkdown}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: Encrypted Document Archive (DMS) */}
      {activeSubTab === 'dms-vault' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-500" />
              <span>نظام الأرشيف والمستندات السحابي المشفر (AES-256-GCM Tax Vault)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              حفظ المستندات الضريبية والعقود الجمركية لمدة الفحص القانونية مع توليد متجه تهيئة (IV) وبصمة SHA-256 لكل مستند
            </p>
          </div>

          <form
            onSubmit={handleEncryptAndStore}
            className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl items-end"
          >
            <div>
              <label className="block text-xs text-slate-500 mb-1">اسم المستند المراد تشفيره</label>
              <input
                type="text"
                value={dmsFileName}
                onChange={(e) => setDmsFileName(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">تصنيف الأرشيف الضريبي</label>
              <select
                value={dmsCategory}
                onChange={(e) => setDmsCategory(e.target.value as TaxDocumentCategory)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-900 dark:text-white"
              >
                {Object.entries(EncryptedDocumentArchive.CATEGORY_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">الرقم الضريبي / الحجم (KB)</label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={dmsTin}
                  onChange={(e) => setDmsTin(e.target.value)}
                  className="w-2/3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2 py-2 text-xs font-mono text-slate-900 dark:text-white"
                />
                <input
                  type="number"
                  value={dmsFileSizeKb}
                  onChange={(e) => setDmsFileSizeKb(Number(e.target.value))}
                  className="w-1/3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2 py-2 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>
            </div>
            <button
              type="submit"
              className="py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>تشفير وإيداع بالأرشيف</span>
            </button>
          </form>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100 dark:bg-slate-950 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">اسم المستند</th>
                  <th className="py-2.5 px-3">التصنيف</th>
                  <th className="py-2.5 px-3">خوارزمية التشفير و IV</th>
                  <th className="py-2.5 px-3">بصمة SHA-256</th>
                  <th className="py-2.5 px-3 text-left">الحجم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/70 font-mono tabular-nums">
                {archivedDocs.map((doc) => (
                  <tr key={doc.documentId}>
                    <td className="py-3 px-3 font-sans font-semibold text-slate-900 dark:text-white">{doc.fileName}</td>
                    <td className="py-3 px-3 font-sans text-slate-500">{doc.categoryLabelAr}</td>
                    <td className="py-3 px-3 text-emerald-600 dark:text-emerald-400">
                      {doc.cipherAlgorithm} · IV:{doc.ivHex.slice(0, 8)}
                    </td>
                    <td className="py-3 px-3 text-slate-500 truncate max-w-[180px]">{doc.sha256Checksum}</td>
                    <td className="py-3 px-3 text-left">{(doc.fileSizeBytes / 1024).toFixed(0)} KB</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: Live System Status Page */}
      {activeSubTab === 'system-status' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-200 dark:border-slate-800 gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">حالة المنظومة والربط التقني المباشر</h2>
              <p className="text-xs text-slate-500 mt-1">مؤشرات التوافر وزمن الاستجابة لبوابات الفوترة ومحركات الحسابات</p>
            </div>
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              كافة الأنظمة والخدمات تعمل بكفاءة تامة (SLA 99.95%)
            </div>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100 dark:bg-slate-950 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">الخدمة والربط التقني</th>
                  <th className="py-3 px-4">القطاع التشغيلي</th>
                  <th className="py-3 px-4 text-left">زمن الاستجابة</th>
                  <th className="py-3 px-4 text-left">الجاهزية (90 يوم)</th>
                  <th className="py-3 px-4 text-left">الحالة التشغيلية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/70">
                {statusComponents.map((c, idx) => (
                  <tr key={idx}>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{c.name}</td>
                    <td className="py-3.5 px-4 text-slate-500">{c.category}</td>
                    <td className="py-3.5 px-4 font-mono tabular-nums text-left text-slate-600 dark:text-slate-400">{c.latencyMs} ms</td>
                    <td className="py-3.5 px-4 font-mono tabular-nums text-left text-slate-900 dark:text-white font-semibold">{c.uptime90Days}</td>
                    <td className="py-3.5 px-4 text-left font-semibold text-emerald-600 dark:text-emerald-400">{c.statusLabel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: Prisma PostgreSQL Database Schema */}
      {activeSubTab === 'db-schema' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              مخطط قاعدة البيانات العلائقية القياسي (PostgreSQL / Prisma Schema)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              هيكل جداول المنشآت (Enterprise)، سجل الموافقات (ConsentLog)، سجل النشاط (AuditLog)، الفواتير الإلكترونية (Invoice)، والأصول بدقة Decimal(12,3)
            </p>
          </div>
          <pre className="p-5 bg-slate-950 text-emerald-300 rounded-xl border border-slate-800 text-xs font-mono overflow-x-auto leading-relaxed" dir="ltr">
            {PRISMA_DATABASE_SCHEMA}
          </pre>
        </div>
      )}
    </div>
  );
}
