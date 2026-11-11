import React, { useState, useEffect } from 'react';
import Decimal from 'decimal.js';
import { jsPDF } from 'jspdf';
import { ShieldAlert, FileCheck2, PackageCheck, UserCheck, MessageSquare, Download, CheckCircle2, AlertTriangle, Send, FileSpreadsheet, Printer, Plus } from 'lucide-react';
import { AuditAnomalyDetector, AccountingPeriodData } from '../../engine/auditAnomalyDetector';
import { JordanTaxAuditFileGenerator } from '../../services/audit/JordanTaxAuditFileGenerator';
import ComprehensiveLineItemAuditTool from '../audit/ComprehensiveLineItemAuditTool';
import { SystemGovernanceService } from '../../services/governance/SystemGovernanceService';
import jcpaAvatarImg from '../../assets/images/jcpa_auditor_avatar_1794306427053.jpg';

interface AuditAndComplianceViewProps {
  initialSubTab?: string;
}

export type CorporateSectorKey = 'STANDARD_COMMERCIAL' | 'INDUSTRIAL' | 'TELECOM_ELECTRICITY' | 'BANKS';

export default function AuditAndComplianceView({ initialSubTab = 'anomaly-detector' }: AuditAndComplianceViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<string>(initialSubTab);

  useEffect(() => {
    if (initialSubTab) setActiveSubTab(initialSubTab);
  }, [initialSubTab]);

  // --- Annual Corporate Income Tax Return Estimator State ---
  const [corpName, setCorpName] = useState<string>('شركة الرواد للصناعات والتجارة ذ.م.م');
  const [corpTin, setCorpTin] = useState<string>('2001584920');
  const [corpFiscalYear, setCorpFiscalYear] = useState<number>(2026);
  const [corpSector, setCorpSector] = useState<CorporateSectorKey>('STANDARD_COMMERCIAL');
  const [operatingProfitJod, setOperatingProfitJod] = useState<number>(185000);
  const [disallowedExpensesJod, setDisallowedExpensesJod] = useState<number>(14500);
  const [exemptRevenuesJod, setExemptRevenuesJod] = useState<number>(8000);
  const [carriedForwardLossesJod, setCarriedForwardLossesJod] = useState<number>(12000);
  const [donationsDeductibleJod, setDonationsDeductibleJod] = useState<number>(3500);
  const [advanceTaxAndWhtCreditsJod, setAdvanceTaxAndWhtCreditsJod] = useState<number>(6200);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);

  const sectorConfig: Record<CorporateSectorKey, { labelAr: string; labelEn: string; incomeTaxRate: Decimal; natContribRate: Decimal }> = {
    STANDARD_COMMERCIAL: {
      labelAr: 'القطاع التجاري والخدمي العام (ضريبة 20% + مساهمة وطنية 1%)',
      labelEn: 'Commercial & Services Sector (20% Income Tax + 1% Nat. Contrib.)',
      incomeTaxRate: new Decimal('0.20'),
      natContribRate: new Decimal('0.01'),
    },
    INDUSTRIAL: {
      labelAr: 'القطاع الصناعي التحويلي (ضريبة 20% + مساهمة وطنية 1%)',
      labelEn: 'Manufacturing & Industrial Sector (20% Income Tax + 1% Nat. Contrib.)',
      incomeTaxRate: new Decimal('0.20'),
      natContribRate: new Decimal('0.01'),
    },
    TELECOM_ELECTRICITY: {
      labelAr: 'الاتصالات وتوزيع الكهرباء والتعدين (ضريبة 24% + مساهمة 3%)',
      labelEn: 'Telecom, Electricity & Mining (24% Income Tax + 3% Nat. Contrib.)',
      incomeTaxRate: new Decimal('0.24'),
      natContribRate: new Decimal('0.03'),
    },
    BANKS: {
      labelAr: 'البنوك والمؤسسات المصرفية (ضريبة 35% + مساهمة وطنية 3%)',
      labelEn: 'Banking Sector (35% Income Tax + 3% Nat. Contrib.)',
      incomeTaxRate: new Decimal('0.35'),
      natContribRate: new Decimal('0.03'),
    },
  };

  const activeSector = sectorConfig[corpSector];
  const opProfitDec = new Decimal(operatingProfitJod || 0);
  const disallowedDec = Decimal.max(0, new Decimal(disallowedExpensesJod || 0));
  const exemptDec = Decimal.max(0, new Decimal(exemptRevenuesJod || 0));
  const lossesDec = Decimal.max(0, new Decimal(carriedForwardLossesJod || 0));
  const donationsDec = Decimal.max(0, new Decimal(donationsDeductibleJod || 0));
  const creditsDec = Decimal.max(0, new Decimal(advanceTaxAndWhtCreditsJod || 0));

  // Adjusted Taxable Income per ISTD Law No. 34 of 2014 (with 25% cap on deductible donations per Article 10/B)
  const netTaxableIncomeBeforeLossesDec = Decimal.max(0, opProfitDec.plus(disallowedDec).minus(exemptDec));
  const taxableAfterLossesDec = Decimal.max(0, netTaxableIncomeBeforeLossesDec.minus(lossesDec));
  const maxAllowedDonationsDec = taxableAfterLossesDec.times('0.25').toDecimalPlaces(3);
  const allowableDonationsDec = Decimal.min(donationsDec, maxAllowedDonationsDec).toDecimalPlaces(3);
  const excessDisallowedDonationsDec = Decimal.max(0, donationsDec.minus(allowableDonationsDec)).toDecimalPlaces(3);
  const netTaxableIncomeDec = Decimal.max(0, taxableAfterLossesDec.minus(allowableDonationsDec));

  const corporateIncomeTaxDueDec = netTaxableIncomeDec.times(activeSector.incomeTaxRate);
  const nationalContributionDueDec = netTaxableIncomeDec.times(activeSector.natContribRate);
  const totalGrossTaxAndContribDec = corporateIncomeTaxDueDec.plus(nationalContributionDueDec);
  const netFinalBalancePayableDec = totalGrossTaxAndContribDec.minus(creditsDec);

  const handleExportIncomeTaxPdf = () => {
    setIsExportingPdf(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1240;
      canvas.height = 1754; // A4 @ 150 DPI
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // White paper background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Top institutional header band
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, 175);

      ctx.fillStyle = '#10b981';
      ctx.fillRect(0, 175, canvas.width, 6);

      ctx.direction = 'rtl';
      ctx.textAlign = 'right';

      // Header Arabic Title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 30px Cairo, sans-serif';
      ctx.fillText('المملكة الأردنية الهاشمية — نموذج تقدير الإقرار الضريبي السنوي', 1170, 68);

      ctx.fillStyle = '#34d399';
      ctx.font = '600 20px Cairo, sans-serif';
      ctx.fillText('وفق أحكام قانون ضريبة الدخل الأردني رقم (34) لسنة 2014 وتعديلاته — دائرة ضريبة الدخل والمبيعات (ISTD)', 1170, 112);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px monospace';
      ctx.fillText(`تاريخ الإصدار: ${new Date().toISOString().split('T')[0]}   |   السنة الضريبية: ${corpFiscalYear}   |   المرجع: ISTD-CORP-${corpFiscalYear}`, 1170, 148);

      // Taxpayer Information Box
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.fillRect(70, 215, 1100, 165);
      ctx.strokeRect(70, 215, 1100, 165);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 22px Cairo, sans-serif';
      ctx.fillText('أولاً: البيانات الأساسية للمكلف والمنشأة', 1140, 255);

      ctx.font = '600 18px Cairo, sans-serif';
      ctx.fillStyle = '#334155';
      ctx.fillText(`اسم المنشأة / المكلف: ${corpName}`, 1140, 300);
      ctx.fillText(`الرقم الضريبي الوطني (TIN): ${corpTin}`, 520, 300);
      ctx.fillText(`القطاع الضريبي: ${activeSector.labelAr}`, 1140, 345);

      // Financial & Tax Computation Table
      const rows: Array<{ label: string; note: string; amount: string; isHighlight?: boolean; isDeduction?: boolean }> = [
        {
          label: '1. صافي الربح التشغيلي المحاسبي قبل الضريبة (حسب قائمة الدخل)',
          note: 'إيرادات الفترة مطروحاً منها المصاريف التشغيلية والإدارية',
          amount: `${opProfitDec.toFixed(3)} د.أ`,
        },
        {
          label: '2. يضاف: المصاريف غير المقبولة ضريبياً وفروقات الإهلاك المردودة (+)',
          note: 'المادة (9) — مصاريف غير مؤيدة أو تتجاوز السقوف الضريبية',
          amount: `+ ${disallowedDec.toFixed(3)} د.أ`,
        },
        {
          label: '3. يطرح: الإيرادات المعفاة من الضريبة وأرباح الأسهم والحصص (-)',
          note: 'المادة (4) — الدخول المعفاة بموجب التشريعات النافذة',
          amount: `- ${exemptDec.toFixed(3)} د.أ`,
          isDeduction: true,
        },
        {
          label: '4. يطرح: الخسائر الضريبية المدورة من سنوات سابقة ومقبولة (-)',
          note: 'المادة (10) — تنزيل الخسائر المدورة المؤيدة',
          amount: `- ${lossesDec.toFixed(3)} د.أ`,
          isDeduction: true,
        },
        {
          label: '5. يطرح: التبرعات والاشتراكات المقبولة ضريبياً للجهات المؤهلة قانوناً (-)',
          note: 'المادة (10/ب) — ضمن السقف القانوني المسموح به (25% من الدخل الخاضع)',
          amount: `- ${allowableDonationsDec.toFixed(3)} د.أ`,
          isDeduction: true,
        },
        {
          label: '6. صافي الدخل الخاضع للضريبة (الوعاء الضريبي المعدل)',
          note: 'الأساس المعتمد لاحتساب ضريبة الدخل والمساهمة الوطنية',
          amount: `${netTaxableIncomeDec.toFixed(3)} د.أ`,
          isHighlight: true,
        },
        {
          label: `7. ضريبة الدخل السنوية المستحقة (${activeSector.incomeTaxRate.times(100).toFixed(0)}%)`,
          note: 'المادة (11) — حسب نسبة القطاع الضريبي للمنشأة',
          amount: `${corporateIncomeTaxDueDec.toFixed(3)} د.أ`,
        },
        {
          label: `8. حساب المساهمة الوطنية المستحقة (${activeSector.natContribRate.times(100).toFixed(0)}%)`,
          note: 'المادة (11/ج) — المساهمة الوطنية لسداد الدين العام',
          amount: `${nationalContributionDueDec.toFixed(3)} د.أ`,
        },
        {
          label: '9. إجمالي الضريبة والمساهمة الوطنية المستحقة عن السنة',
          note: 'مجموع البندين (7 + 8)',
          amount: `${totalGrossTaxAndContribDec.toFixed(3)} د.أ`,
          isHighlight: true,
        },
        {
          label: '10. يطرح: الدفعات المقدمة واقتطاعات المنبع المسددة خلال السنة (-)',
          note: 'الأرصدة المقتطعة بموجب نماذج (و/1) والدفعات على الحساب',
          amount: `- ${creditsDec.toFixed(3)} د.أ`,
          isDeduction: true,
        },
      ];

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 22px Cairo, sans-serif';
      ctx.fillText('ثانياً: جدول التسوية الضريبية واحتساب صافي الضريبة المستحقة (بالدينار الأردني)', 1170, 425);

      let y = 450;
      rows.forEach((row) => {
        ctx.fillStyle = row.isHighlight ? '#ecfdf5' : '#ffffff';
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1.5;
        ctx.fillRect(70, y, 1100, 82);
        ctx.strokeRect(70, y, 1100, 82);

        ctx.textAlign = 'right';
        ctx.fillStyle = row.isHighlight ? '#065f46' : '#0f172a';
        ctx.font = row.isHighlight ? 'bold 19px Cairo, sans-serif' : 'bold 18px Cairo, sans-serif';
        ctx.fillText(row.label, 1145, y + 34);

        ctx.fillStyle = '#64748b';
        ctx.font = '14px Cairo, sans-serif';
        ctx.fillText(row.note, 1145, y + 62);

        ctx.textAlign = 'left';
        ctx.fillStyle = row.isHighlight ? '#047857' : row.isDeduction ? '#0284c7' : '#0f172a';
        ctx.font = 'bold 20px monospace';
        ctx.fillText(row.amount, 100, y + 48);

        y += 88;
      });

      // Final Net Payable Box
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(70, y + 10, 1100, 105);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px Cairo, sans-serif';
      const finalStatusLabel = netFinalBalancePayableDec.greaterThanOrEqualTo(0)
        ? 'صافي الرصيد الضريبي واجب التوريد لدائرة ضريبة الدخل والمبيعات:'
        : 'صافي الرصيد الضريبي الفائض (قابل للرد أو التدوير للسنة القادمة):';
      ctx.fillText(finalStatusLabel, 1140, y + 70);

      ctx.textAlign = 'left';
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 28px monospace';
      ctx.fillText(`${netFinalBalancePayableDec.abs().toFixed(3)} JOD`, 100, y + 72);

      // Footer & JCPA Signature Area
      ctx.textAlign = 'right';
      ctx.fillStyle = '#475569';
      ctx.font = '16px Cairo, sans-serif';
      ctx.fillText('إقرار المفوض بالتوقيع: أقر بأن البيانات الواردة أعلاه مستخرجة من السجلات المحاسبية المنتظمة وفواتير نظام JoFotara.', 1170, 1545);
      ctx.fillText('توقيع المكلف / المدير المالي: .........................................', 1170, 1615);
      ctx.fillText('مصادقة المدقق المحاسبي المختص (JCPA): .........................................', 620, 1615);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
      pdf.save(`ISTD_Annual_Income_Tax_Return_${corpTin}_${corpFiscalYear}.pdf`);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // --- Sub-tab 1: Audit Anomaly Detector State ---
  const [periodData, setPeriodData] = useState<AccountingPeriodData>({
    totalRevenuePerBooks: 145000,
    totalRevenueReportedSalesTax: 139500,
    totalWithholdingTaxPaid: 450,
    grossPayrollExpense: 32000,
    hazardousStaffCount: 4,
    hazardousSscContributionPaid: 150,
    avgMonthlySalaryPerHazardousWorker: 650,
  });

  const anomalyResult = AuditAnomalyDetector.inspectPeriod(periodData);

  // --- Sub-tab 2: ISTD Field Audit Readiness Checklist ---
  const [checklistItems, setChecklistItems] = useState([
    { id: '1', label: 'مطابقة إجمالي المبيعات في ميزان المراجعة مع الفواتير المرسلة لنظام الفوترة الإلكتروني (JoFotara)', checked: true, lawRef: 'نظام الفوترة الإلكتروني رقم 2 لسنة 2019' },
    { id: '2', label: 'مطابقة ضريبة المخرجات والمدخلات مع كشوفات الإقرارات الضريبية المودعة لدى ISTD', checked: true, lawRef: 'قانون الضريبة العامة على المبيعات' },
    { id: '3', label: 'تجهيز شهادات التصدير الجمركية وبوالص الشحن لكافة مبيعات نسبة الصفر (0%)', checked: false, lawRef: 'المادة 7 - تعليمات التصدير' },
    { id: '4', label: 'إرفاق عقود الإيجار الموثقة وسندات توريد ضريبة اقتطاع المنبع (10% - نموذج و/1)', checked: false, lawRef: 'تعليمات الاقتطاع من المنبع' },
    { id: '5', label: 'إصدار شهادة براءة ذمة والتزام من المؤسسة العامة للضمان الاجتماعي ومطابقة كشف الرواتب', checked: true, lawRef: 'قانون الضمان الاجتماعي رقم 1 لسنة 2014' },
    { id: '6', label: 'توثيق اتفاقيات التمويل وحساب جاري الشركاء (Code 20401) لتفنيد اعتبار الإيداعات البنكية مبيعات مخفاة', checked: true, lawRef: 'المادة 23 - أصول الفحص الضريبي' },
  ]);
  const [newCheckLabel, setNewCheckLabel] = useState('');
  const [newCheckLawRef, setNewCheckLawRef] = useState('قانون ضريبة الدخل والمبيعات');

  const toggleChecklist = (id: string) => {
    setChecklistItems(checklistItems.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)));
  };

  const completedCount = checklistItems.filter((i) => i.checked).length;

  // --- Sub-tab 3: SAF-T Export Workbench State ---
  const [saftGenerated, setSaftGenerated] = useState<{
    fileName: string;
    digitalChecksumSha256: string;
    rawJsonExport: string;
    summaryStatistics: {
      totalAccounts: number;
      totalJournalEntries: number;
      totalJoFotaraInvoices: number;
      totalDebitsJod: string;
      totalCreditsJod: string;
      totalTaxAuditedJod: string;
    };
  } | null>(null);

  const handleGenerateSafT = async () => {
    const res = await JordanTaxAuditFileGenerator.generateStandardAuditFile({
      companyHeader: {
        tin: '2001584920',
        crn: '48921',
        legalName: 'شركة الرواد للصناعات والتجارة ذ.م.م',
        fiscalYear: 2026,
        periodStartDate: '2026-01-01',
        periodEndDate: '2026-12-31',
      },
      chartOfAccounts: [
        { accountCode: '10101', accountName: 'النقدية لدى البنوك المحلية', standardType: 'ASSET', openingBalance: 25000, closingBalance: 64200 },
        { accountCode: '20301', accountName: 'أمانات ضريبة المبيعات العامة', standardType: 'LIABILITY', openingBalance: 1200, closingBalance: 4540 },
        { accountCode: '40101', accountName: 'إيرادات المبيعات المحلية الخاضعة', standardType: 'REVENUE', openingBalance: 0, closingBalance: 145000 },
      ],
      generalLedgerEntries: [
        {
          journalId: 'JRN-2026-001',
          transactionDate: '2026-07-15',
          description: 'إثبات مبيعات فاتورة JoFotara رقم S-2026-101',
          lines: [
            { accountCode: '10101', debit: 52200, credit: 0 },
            { accountCode: '40101', debit: 0, credit: 45000 },
            { accountCode: '20301', debit: 0, credit: 7200 },
          ],
        },
      ],
      salesInvoicesJoFotara: [
        {
          uuid: '8b2c4e91-7a12-4d30-9f11-29a8f12c0912',
          invoiceNo: 'S-2026-101',
          issueDate: '2026-07-15',
          buyerTaxNo: '100948271',
          netAmount: 45000,
          salesTax16: 7200,
          grandTotal: 52200,
          hash: 'a94f82e109c3b81274e0192837465fab12903847561029384756abcdef123456',
        },
      ],
    });
    setSaftGenerated(res);
  };

  useEffect(() => {
    handleGenerateSafT();
  }, []);

  const downloadSaftFile = () => {
    if (!saftGenerated) return;
    const blob = new Blob([saftGenerated.rawJsonExport], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = saftGenerated.fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  // --- Sub-tab 4: JCPA Verification Portal State ---
  const [auditorName, setAuditorName] = useState('فريق الإشراف الهندسي والتدقيق المالي المختص');
  const [jcpaLicenseNo, setJcpaLicenseNo] = useState('JCPA-948');
  const [jacpaMembershipNo, setJacpaMembershipNo] = useState('JACPA-2011-409');
  const [firmName, setFirmName] = useState('مجموعة المهندسين والمستشارين المتخصصين — عمّان، الأردن');
  const [jcpaVerified, setJcpaVerified] = useState(false);

  // --- Sub-tab 5: Consultation Desk State ---
  const [messages, setMessages] = useState([
    {
      id: '1',
      role: 'CLIENT',
      sender: 'الإدارة المالية — منشأة تجريبية',
      text: 'لدينا استفسار بخصوص تسوية مبيعات الصفر (التصدير لمنطقة العقبة الاقتصادية الخاصة) في إقرار الربع الثالث.',
      time: '09:15 ص',
    },
    {
      id: '2',
      role: 'CONSULTANT',
      sender: 'فريق الإشراف الفني والتدقيق (عمّان - الأردن)',
      text: 'تم تدقيق البيانات الجمركية ونماذج تنظيم البيان الجمركي (الترانزيت/العقبة)؛ جميعها مطابقة لشروط المادة (7) ومقبولة ضريبياً بنسبة الصفر.',
      time: '09:28 ص',
    },
  ]);
  const [chatInput, setChatInput] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setMessages([
      ...messages,
      {
        id: Date.now().toString(),
        role: 'CONSULTANT',
        sender: 'فريق الإشراف الفني والتدقيق (عمّان - الأردن)',
        text: chatInput,
        time: new Date().toLocaleTimeString('ar-JO', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setChatInput('');
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            وحدة التدقيق المحاسبي الاستباقي، حاسبة تدقيق البنود، الإقرار السنوي، واعتماد JCPA
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            حاسبة المبيعات والتدقيق الشامل للبند المالي · كشف المخاطر · الإقرار السنوي (PDF) · حزمة SAF-T
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
          {[
            { id: 'anomaly-detector', label: 'كشف التناقضات الاستباقي', icon: ShieldAlert },
            { id: 'annual-tax-return', label: 'تقدير الإقرار الضريبي السنوي (PDF)', icon: FileSpreadsheet },
            { id: 'audit-checklist', label: 'جاهزية التفتيش الضريبي', icon: FileCheck2 },
            { id: 'saft-export', label: 'حزمة التدقيق SAF-T', icon: PackageCheck },
            { id: 'jcpa-portal', label: 'توثيق المحاسبين JCPA', icon: UserCheck },
            { id: 'consultation-desk', label: 'غرفة الاستشارات الحية', icon: MessageSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
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

      {/* PINNED INTERACTIVE TOOL: Comprehensive Sales Calculator & Financial Line-Item Audit Engine */}
      <ComprehensiveLineItemAuditTool />

      {/* SUB-TAB: Interactive Annual Income Tax Return Estimator & PDF Exporter */}
      {activeSubTab === 'annual-tax-return' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-1">
                قانون ضريبة الدخل الأردني رقم (34) لسنة 2014 وتعديلاته — المواد (4، 9، 10، 11)
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                نموذج تقدير الإقرار الضريبي السنوي للشركات والمنشآت بناءً على الأرباح التشغيلية
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                تسوية الربح المحاسبي التشغيلي إلى الوعاء الضريبي المعدل واحتساب ضريبة الدخل والمساهمة الوطنية مع التصدير المباشر بصيغة PDF
              </p>
            </div>

            <button
              type="button"
              onClick={handleExportIncomeTaxPdf}
              disabled={isExportingPdf}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition cursor-pointer whitespace-nowrap shrink-0"
            >
              <Printer className="w-4 h-4" />
              <span>{isExportingPdf ? 'جاري توليد ملف PDF...' : 'تصدير الإقرار الضريبي السنوي (PDF)'}</span>
            </button>
          </div>

          {/* Entity & Sector Metadata Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
            <div className="sm:col-span-2">
              <label className="block text-xs text-slate-500 mb-1">اسم المنشأة / المكلف في الإقرار</label>
              <input
                type="text"
                value={corpName}
                onChange={(e) => setCorpName(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">الرقم الضريبي (TIN)</label>
              <input
                type="text"
                value={corpTin}
                onChange={(e) => setCorpTin(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">السنة المالية الضريبية</label>
              <select
                value={corpFiscalYear}
                onChange={(e) => setCorpFiscalYear(Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
              >
                <option value={2026}>2026</option>
                <option value={2025}>2025</option>
                <option value={2024}>2024</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Operating Profit & Tax Adjustments Inputs */}
            <div className="lg:col-span-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  القطاع الاقتصادي ونسبة الضريبة والمساهمة الوطنية
                </label>
                <select
                  value={corpSector}
                  onChange={(e) => setCorpSector(e.target.value as CorporateSectorKey)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-semibold"
                >
                  {Object.entries(sectorConfig).map(([k, cfg]) => (
                    <option key={k} value={k}>
                      {cfg.labelAr}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  1. صافي الأرباح التشغيلية المحاسبية قبل الضريبة (د.أ)
                </label>
                <input
                  type="number"
                  step={5000}
                  value={operatingProfitJod}
                  onChange={(e) => setOperatingProfitJod(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">
                    2. مصاريف غير مقبولة ضريبياً تُضاف (+)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={500}
                    value={disallowedExpensesJod}
                    onChange={(e) => setDisallowedExpensesJod(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">
                    3. إيرادات معفاة ضريبياً تُطرح (-)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={500}
                    value={exemptRevenuesJod}
                    onChange={(e) => setExemptRevenuesJod(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">
                    4. خسائر ضريبية مدورة من سنوات سابقة (-)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={carriedForwardLossesJod}
                    onChange={(e) => setCarriedForwardLossesJod(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">
                    5. تبرعات للجهات المؤهلة قانوناً (سقف 25%) (-)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={500}
                    value={donationsDeductibleJod}
                    onChange={(e) => setDonationsDeductibleJod(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
                  />
                  {excessDisallowedDonationsDec.greaterThan(0) && (
                    <span className="text-[10px] text-amber-500 block mt-1">
                      تنبيه المادة 10/ب: السقف المسموح 25% ({maxAllowedDonationsDec.toFixed(3)} د.أ)، تم استبعاد الزيادة ({excessDisallowedDonationsDec.toFixed(3)} د.أ).
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  6. دفعات ضريبية مقدمة واقتطاعات منبع مسددة خلال السنة (-)
                </label>
                <input
                  type="number"
                  min={0}
                  step={500}
                  value={advanceTaxAndWhtCreditsJod}
                  onChange={(e) => setAdvanceTaxAndWhtCreditsJod(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Right Column: Live Tax Assessment Schedule */}
            <div className="lg:col-span-7 space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono tabular-nums">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <span className="text-[11px] font-sans text-slate-500 block mb-1">الدخل الخاضع للضريبة</span>
                  <span className="text-base font-bold text-slate-900 dark:text-white">
                    {netTaxableIncomeDec.toFixed(3)} د.أ
                  </span>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <span className="text-[11px] font-sans text-slate-500 block mb-1">
                    ضريبة الدخل ({activeSector.incomeTaxRate.times(100).toFixed(0)}%)
                  </span>
                  <span className="text-base font-bold text-amber-600 dark:text-amber-400">
                    {corporateIncomeTaxDueDec.toFixed(3)} د.أ
                  </span>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <span className="text-[11px] font-sans text-slate-500 block mb-1">
                    المساهمة الوطنية ({activeSector.natContribRate.times(100).toFixed(0)}%)
                  </span>
                  <span className="text-base font-bold text-sky-600 dark:text-sky-400">
                    {nationalContributionDueDec.toFixed(3)} د.أ
                  </span>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <span className="text-[11px] font-sans text-slate-500 block mb-1">صافي الضريبة للتوريد</span>
                  <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                    {netFinalBalancePayableDec.toFixed(3)} د.أ
                  </span>
                </div>
              </div>

              {/* Detailed Reconciliation Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-950 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-2.5 px-4">بيان التسوية الضريبية السنوية (ISTD Form)</th>
                      <th className="py-2.5 px-4">السند القانوني</th>
                      <th className="py-2.5 px-4 text-left">المبلغ (د.أ)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/70 font-mono tabular-nums">
                    <tr>
                      <td className="py-2.5 px-4 font-sans font-semibold text-slate-800 dark:text-slate-200">
                        صافي الربح التشغيلي المحاسبي قبل الضريبة
                      </td>
                      <td className="py-2.5 px-4 font-sans text-slate-500">قائمة الدخل المدققة</td>
                      <td className="py-2.5 px-4 text-left text-slate-900 dark:text-white">{opProfitDec.toFixed(3)}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-sans text-slate-700 dark:text-slate-300">
                        (+) يضاف: مصاريف غير مقبولة ضريبياً وفروقات إهلاك مردودة
                      </td>
                      <td className="py-2.5 px-4 font-sans text-slate-500">المادة (9) و (13)</td>
                      <td className="py-2.5 px-4 text-left text-amber-500">+{disallowedDec.toFixed(3)}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-sans text-slate-700 dark:text-slate-300">
                        (-) يطرح: إيرادات معفاة وخسائر مدورة وتبرعات مقبولة
                      </td>
                      <td className="py-2.5 px-4 font-sans text-slate-500">المواد (4، 10/ب، 10)</td>
                      <td className="py-2.5 px-4 text-left text-sky-500">
                        -{exemptDec.plus(lossesDec).plus(allowableDonationsDec).toFixed(3)}
                      </td>
                    </tr>
                    <tr className="bg-slate-50 dark:bg-slate-950 font-bold">
                      <td className="py-2.5 px-4 font-sans text-slate-900 dark:text-white">
                        (=) صافي الدخل الخاضع للضريبة (الوعاء الضريبي المعدل)
                      </td>
                      <td className="py-2.5 px-4 font-sans text-slate-500">الوعاء الخاضع</td>
                      <td className="py-2.5 px-4 text-left text-slate-900 dark:text-white">{netTaxableIncomeDec.toFixed(3)}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-sans text-slate-700 dark:text-slate-300">
                        إجمالي ضريبة الدخل المستحقة + المساهمة الوطنية
                      </td>
                      <td className="py-2.5 px-4 font-sans text-slate-500">المادة (11)</td>
                      <td className="py-2.5 px-4 text-left text-rose-400 font-semibold">{totalGrossTaxAndContribDec.toFixed(3)}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-sans text-slate-700 dark:text-slate-300">
                        (-) يطرح: دفعات ضريبية مقدمة واقتطاعات منبع مسددة (و/1)
                      </td>
                      <td className="py-2.5 px-4 font-sans text-slate-500">المادة (12)</td>
                      <td className="py-2.5 px-4 text-left text-sky-400">-{creditsDec.toFixed(3)}</td>
                    </tr>
                    <tr className="bg-emerald-950/20 font-bold">
                      <td className="py-3 px-4 font-sans text-emerald-600 dark:text-emerald-400">
                        {netFinalBalancePayableDec.greaterThanOrEqualTo(0)
                          ? 'صافي الضريبة واجبة التوريد لدائرة ضريبة الدخل والمبيعات'
                          : 'صافي الرصيد الضريبي الفائض للمكلف (قابل للرد أو التدوير)'}
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-500">الرصيد الختامي</td>
                      <td className="py-3 px-4 text-left text-base text-emerald-600 dark:text-emerald-400">
                        {netFinalBalancePayableDec.abs().toFixed(3)} د.أ
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 1: Audit Anomaly Detector */}
      {activeSubTab === 'anomaly-detector' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                محرك كشف التناقضات والمخاطر الضريبية الاستباقي (Pre-ISTD Audit Scanner)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                يفحص التطابق بين إيرادات الدفاتر وإقرارات المبيعات، كفاية اقتطاع ضريبة الرواتب، ونسبة الـ 1% للمهن الخطرة بالضمان
              </p>
            </div>
            <div className="text-xs font-mono">
              عدد التنبيهات المكتشفة: <strong className="text-rose-500">{anomalyResult.warningsCount}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">إيراد المبيعات بالدفاتر (د.أ)</label>
                  <input
                    type="number"
                    value={periodData.totalRevenuePerBooks}
                    onChange={(e) => setPeriodData({ ...periodData, totalRevenuePerBooks: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">المبيعات بإقرار الضريبة (د.أ)</label>
                  <input
                    type="number"
                    value={periodData.totalRevenueReportedSalesTax}
                    onChange={(e) => setPeriodData({ ...periodData, totalRevenueReportedSalesTax: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">كتلة الرواتب والأجور (د.أ)</label>
                  <input
                    type="number"
                    value={periodData.grossPayrollExpense}
                    onChange={(e) => setPeriodData({ ...periodData, grossPayrollExpense: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">ضريبة الرواتب المقتطعة (د.أ)</label>
                  <input
                    type="number"
                    value={periodData.totalWithholdingTaxPaid}
                    onChange={(e) => setPeriodData({ ...periodData, totalWithholdingTaxPaid: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">عدد عمال المهن الخطرة</label>
                  <input
                    type="number"
                    min={0}
                    value={periodData.hazardousStaffCount}
                    onChange={(e) => setPeriodData({ ...periodData, hazardousStaffCount: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">متوسط راتب عامل المهنة الخطرة</label>
                  <input
                    type="number"
                    min={0}
                    value={periodData.avgMonthlySalaryPerHazardousWorker ?? 650}
                    onChange={(e) =>
                      setPeriodData({
                        ...periodData,
                        avgMonthlySalaryPerHazardousWorker: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">المسدد للمهن الخطرة 1% (د.أ)</label>
                  <input
                    type="number"
                    value={periodData.hazardousSscContributionPaid}
                    onChange={(e) => setPeriodData({ ...periodData, hazardousSscContributionPaid: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-3">
              {anomalyResult.anomalies.length === 0 ? (
                <div className="p-8 bg-emerald-950/20 border border-emerald-800/40 rounded-2xl text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">السجلات متطابقة ولا توجد فجوات ضريبية</h3>
                  <p className="text-xs text-slate-500">كافة مؤشرات المبيعات والرواتب والضمان الاجتماعي متوافقة مع المعايير.</p>
                </div>
              ) : (
                anomalyResult.anomalies.map((item) => (
                  <div
                    key={item.code}
                    className={`p-4 rounded-xl border ${
                      item.severity === 'HIGH'
                        ? 'bg-rose-950/15 border-rose-800/50'
                        : 'bg-amber-950/15 border-amber-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <AlertTriangle className={`w-4 h-4 ${item.severity === 'HIGH' ? 'text-rose-500' : 'text-amber-500'}`} />
                        <span>{item.title}</span>
                      </span>
                      <span className="font-mono text-[11px] text-slate-500">{item.code}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">{item.description}</p>
                    <div className="p-2.5 bg-slate-100 dark:bg-slate-950 rounded-lg text-[11px] text-emerald-700 dark:text-emerald-300">
                      <strong className="font-bold">الإجراء التصحيحي الموصى به: </strong>
                      {item.recommendation}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: Tax Audit Prep Checklist */}
      {activeSubTab === 'audit-checklist' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                قائمة التحقق الميداني للجاهزية للتفتيش الضريبي (ISTD Field Audit Readiness)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                قائمة المراجعة الإلزامية قبل حضور جلسة المناقشة الضريبية أو تسليم الدفاتر للمقدر
              </p>
            </div>
            <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
              مكتمل: {completedCount} / {checklistItems.length}
            </div>
          </div>

          <div className="space-y-2.5">
            {checklistItems.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleChecklist(item.id)}
                className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between gap-4 ${
                  item.checked
                    ? 'bg-emerald-950/15 border-emerald-700/40 text-slate-600 dark:text-slate-300'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => {}}
                    className="w-4 h-4 accent-emerald-600 rounded"
                  />
                  <span className={`text-xs font-medium ${item.checked ? 'line-through opacity-75' : ''}`}>
                    {item.label}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 whitespace-nowrap shrink-0">{item.lawRef}</span>
              </div>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newCheckLabel.trim()) return;
              const added = {
                id: String(Date.now()),
                label: newCheckLabel.trim(),
                checked: false,
                lawRef: newCheckLawRef.trim() || 'ضابطة تدقيق داخلي',
              };
              setChecklistItems((prev) => [...prev, added]);
              SystemGovernanceService.recordAuditAction({
                actorName: 'المدقق الداخلي',
                actorRole: 'قسم الامتثال الضريبي',
                moduleName: 'قائمة الجاهزية للتفتيش الضريبي',
                actionLabel: 'إضافة بند فحص ميداني جديد',
                oldValue: `عدد البنود: ${checklistItems.length}`,
                newValue: added.label,
              });
              setNewCheckLabel('');
            }}
            className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-2.5"
          >
            <input
              type="text"
              value={newCheckLabel}
              onChange={(e) => setNewCheckLabel(e.target.value)}
              placeholder="أدخل بند فحص جديد لقائمة الجاهزية للتفتيش الضريبي..."
              className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white"
            />
            <input
              type="text"
              value={newCheckLawRef}
              onChange={(e) => setNewCheckLawRef(e.target.value)}
              placeholder="المرجع القانوني"
              className="sm:w-52 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة بند للقائمة</span>
            </button>
          </form>
        </div>
      )}

      {/* SUB-TAB 3: SAF-T Export Workbench */}
      {activeSubTab === 'saft-export' && saftGenerated && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                منصة تصدير ملف التدقيق الضريبي الموحد (Jordan SAF-T 2026.1)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                توليد حزمة الفحص الرقمية الموحدة شاملة شجرة الحسابات، قيود اليومية المتوازنة، وفواتير JoFotara موقعة ببصمة SHA-256
              </p>
            </div>
            <button
              onClick={downloadSaftFile}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span>تنزيل حزمة {saftGenerated.fileName}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono tabular-nums">
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
              <span className="text-xs font-sans text-slate-500 block mb-1">إجمالي المدين (Debits)</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white">{saftGenerated.summaryStatistics.totalDebitsJod} د.أ</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
              <span className="text-xs font-sans text-slate-500 block mb-1">إجمالي الدائن (Credits)</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white">{saftGenerated.summaryStatistics.totalCreditsJod} د.أ</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
              <span className="text-xs font-sans text-slate-500 block mb-1">ضريبة المبيعات المدققة</span>
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{saftGenerated.summaryStatistics.totalTaxAuditedJod} د.أ</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
              <span className="text-xs font-sans text-slate-500 block mb-1">بصمة النزاهة SHA-256</span>
              <span className="text-xs font-bold text-sky-500 truncate block">{saftGenerated.digitalChecksumSha256.slice(0, 18)}...</span>
            </div>
          </div>

          <div>
            <span className="text-xs text-slate-500 block mb-2">معاينة محتوى حزمة التدقيق الموحدة (JO-SAF-T-2026.1 JSON):</span>
            <pre className="p-4 bg-slate-950 text-slate-200 rounded-xl border border-slate-800 text-[11px] font-mono overflow-x-auto max-h-72 leading-relaxed" dir="ltr">
              {saftGenerated.rawJsonExport}
            </pre>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: JCPA Verification Portal */}
      {activeSubTab === 'jcpa-portal' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={jcpaAvatarImg}
                  alt="مدقق محاسبي JCPA"
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 rounded-2xl object-cover border border-slate-300 dark:border-slate-700 shrink-0"
                />
                <div>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold block">
                    جمعية المحاسبين القانونيين الأردنيين (JACPA)
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    بوابة توثيق بيانات المدقق المحاسبي المختص (JCPA)
                  </h2>
                  <p className="text-xs text-slate-500">وفق قانون تنظيم مهنة المحاسبة القانونية رقم 73 لسنة 2003</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                يتطلب إيداع القوائم المالية الختامية ولوائح الاعتراض الضريبية وإفصاحات الأسعار التحويلية لدى دائرة ضريبة الدخل والمبيعات مصادقة محاسب قانوني مزاول يحمل إجازة (JCPA) سارية المفعول.
              </p>
            </div>

            <div className="lg:col-span-7">
              {jcpaVerified ? (
                <div className="p-6 bg-emerald-950/20 border border-emerald-700/40 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>تم التحقق من سريان إجازة مزاولة المهنة واعتماد التوقيع الرقمي</span>
                  </div>
                  <div className="text-xs text-slate-300 space-y-1 font-mono">
                    <div>الاسم: {auditorName}</div>
                    <div>رقم إجازة مزاولة المهنة: {jcpaLicenseNo} · رقم العضوية: {jacpaMembershipNo}</div>
                    <div>المكتب المعتمد: {firmName}</div>
                  </div>
                  <button
                    onClick={() => setJcpaVerified(false)}
                    className="text-xs text-emerald-400 underline cursor-pointer"
                  >
                    تعديل بيانات المفوض بالتدقيق
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setJcpaVerified(true);
                  }}
                  className="space-y-4 p-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">اسم المحاسب القانوني الرباعي</label>
                      <input
                        type="text"
                        required
                        value={auditorName}
                        onChange={(e) => setAuditorName(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">اسم مكتب التدقيق المعتمد</label>
                      <input
                        type="text"
                        required
                        value={firmName}
                        onChange={(e) => setFirmName(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">رقم إجازة المهنة (JCPA)</label>
                      <input
                        type="text"
                        required
                        value={jcpaLicenseNo}
                        onChange={(e) => setJcpaLicenseNo(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">رقم عضوية الجمعية (JACPA)</label>
                      <input
                        type="text"
                        required
                        value={jacpaMembershipNo}
                        onChange={(e) => setJacpaMembershipNo(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    التحقق واعتماد ختم المحاسب القانوني
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: Consultation Desk */}
      {activeSubTab === 'consultation-desk' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              غرفة الاستشارات والتذاكر الضريبية والمحاسبية
            </h2>
            <p className="text-xs text-slate-500">تواصل مباشر وموثق بين الإدارة المالية للشركة ومستشار التدقيق المحاسبي (JCPA)</p>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`p-3.5 rounded-xl text-xs max-w-xl ${
                  m.role === 'CONSULTANT'
                    ? 'bg-emerald-950/30 border border-emerald-800/40 text-slate-800 dark:text-emerald-100 mr-auto'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 ml-auto'
                }`}
              >
                <div className="flex justify-between items-center text-[11px] text-slate-400 mb-1">
                  <span className="font-bold text-emerald-500">{m.sender}</span>
                  <span className="font-mono">{m.time}</span>
                </div>
                <p className="leading-relaxed">{m.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="اكتب الملاحظة الاستشارية أو الاستفسار الضريبي..."
              className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>إرسال الرد الموثق</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
