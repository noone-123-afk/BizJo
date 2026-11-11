import React, { useState, useEffect } from 'react';
import Decimal from 'decimal.js';
import {
  FileText,
  Users,
  Receipt,
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw,
  PlusCircle,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  Printer,
  BookOpen,
  Search,
  Lock,
  Clock,
  Crown,
  Sparkles,
  Send,
  Briefcase,
  FolderKanban,
  Award,
  UserCheck,
} from 'lucide-react';
import {
  AccountingCycleStore,
} from '../../services/accounting/AccountingCycleStore';
import { exportArabicReportToPdf } from '../../utils/pdfExport';
import { SidebarItemId } from './SimpleHomeDashboard';

Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP });

interface ErpModulesWorkspaceProps {
  sectionId: SidebarItemId;
  onSelectSection: (section: SidebarItemId) => void;
}

interface DecisionLogEntry {
  id: string;
  title: string;
  actorName: string;
  actorRole: string;
  dateTime: string;
  reason: string;
  impactTag: string;
}

interface VaultDocEntry {
  id: string;
  category: 'السجل التجاري' | 'الرخصة' | 'الضريبة' | 'العقود' | 'التفويضات';
  title: string;
  docNumber: string;
  issueDate: string;
  expiryDate: string;
  daysRemaining: number;
  status: 'ساري' | 'ينتهي قريباً' | 'منتهي';
}

interface JordanLawArticle {
  id: string;
  lawCategory: 'قانون ضريبة الدخل' | 'قانون الشركات' | 'قانون العمل' | 'قانون الضمان';
  articleNumber: string;
  title: string;
  officialSummary: string;
  practicalInterpretation: string;
  exampleCase: string;
}

const JORDAN_LAWS_DATABASE: JordanLawArticle[] = [
  {
    id: 'LAW-TAX-1',
    lawCategory: 'قانون ضريبة الدخل',
    articleNumber: 'المادة (9) و (11) - قانون رقم 34 لسنة 2014 وتعديلاته',
    title: 'الإعفاءات الشخصية والعائلية وشرائح ضريبة الدخل للأفراد والشركات',
    officialSummary:
      'يُمنح الشخص الطبيعي المقيم إعفاءً شخصياً بقيمة 9,000 دينار سنوياً، وإعفاء إعالة بقيمة 9,000 دينار، بالإضافة إلى نفقات العلاج والتعليم والإيجار أو فوائد القروض السكنية بحد أقصى 4,000 دينار للمكلف وزوجه وأبنائه (بإجمالي سقف إعفاء عالي يصل إلى 23,000 دينار مع الفواتير الموثقة). وتخضع الشركات في القطاع التجاري والخدمي لنسبة 20% والقطاع الصناعي لنسبة 18% (مع المساهمة الوطنية 1%).',
    practicalInterpretation:
      'التفسير العملي للمحاسب: عند احتساب اقتطاع ضريبة الدخل الشهري للموظفين، يجب خصم حصة الضمان الاجتماعي (7.5%) أولاً للوصول للدخل الصافي، ثم طرح الإعفاءات القانونية، وتطبيق الشرائح التصاعدية (5% لأول 5,000 د.أ، 10% للثانية، 15% للثالثة، 20% للرابعة، 25% لغاية مليون، و30% لما يتجاوز المليون).',
    exampleCase:
      'مثال تطبيقي: موظف متزوج دخله السنوي الصافي بعد الضمان 23,700 د.أ ولديه إعفاءات موثقة بقيمة 22,000 د.أ؛ يكون الدخل الخاضع للضريبة 1,700 د.أ فقط ويخضع للشريحة الأولى (5%) = 85 ديناراً سنوياً.',
  },
  {
    id: 'LAW-TAX-2',
    lawCategory: 'قانون ضريبة الدخل',
    articleNumber: 'نظام الفوترة الوطني الإلكتروني رقم (82) لسنة 2019 وتعديلاته',
    title: 'الالتزام بإصدار الفواتير الضريبية والإشعارات عبر نظام JoFotara',
    officialSummary:
      'يلتزم جميع المكلفين من الشركات والمنشآت وأصحاب المهن الحرة بالربط مع نظام الفوترة الوطني الإلكتروني (JoFotara) وإصدار الفواتير والإشعارات الدائنة والمدينة إلكترونياً برمز الاستجابة السريع (QR Code) والبصمة التشفيرية المعتمدة.',
    practicalInterpretation:
      'التفسير العملي للشركة: أي مصروف أو فاتورة مشتريات من مورد محلي ملزم بالنظام ولا تحمل رمز JoFotara المعتمد قد تتعرض للرد الضريبي وعدم قبولها كمصروف مقبول ضريبياً عند الفحص.',
    exampleCase:
      'مثال تطبيقي: قبل تسجيل فاتورة مورد في حساب الذمم الدائنة (2101)، يتحقق المحاسب من مطابقة الرقم الضريبي للمورد وحالة الفاتورة في JoFotara.',
  },
  {
    id: 'LAW-COMP-1',
    lawCategory: 'قانون الشركات',
    articleNumber: 'المادة (53) و (62) - قانون الشركات الأردني رقم 22 لسنة 1997 وتعديلاته',
    title: 'الشركة ذات المسؤولية المحدودة (ذ.م.م) والاحتياطي الإجباري وتوزيع الأرباح',
    officialSummary:
      'تقتطع الشركة ذات المسؤولية المحدودة والشركة المساهمة الخاصة ما نسبته (10%) من أرباحها السنوية الصافية لحساب الاحتياطي الإجباري، ويستمر هذا الاقتطاع إلى أن يبلغ مجموع الاحتياطي الإجباري ربع (25%) رأس مال الشركة المصرح به.',
    practicalInterpretation:
      'التفسير العملي للمدير المالي: لا يجوز للهيئة العامة توزيع كامل الأرباح المدورة قبل إثبات قيد استقطاع الاحتياطي الإجباري (10% من صافي الربح قبل التوزيع) وتقديم البيانات المالية المدققة لدائرة مراقبة الشركات خلال الأشهر الثلاثة الأولى من السنة المالية الجديدة.',
    exampleCase:
      'مثال تطبيقي: شركة رأس مالها 100,000 د.أ حققت صافي ربح 40,000 د.أ؛ يُرحل قيد بقيمة 4,000 د.أ إلى حساب الاحتياطي الإجباري قبل أي توزيع للشركاء.',
  },
  {
    id: 'LAW-LAB-1',
    lawCategory: 'قانون العمل',
    articleNumber: 'المادة (32) و (59) و (61) - قانون العمل الأردني رقم 8 لسنة 1996 وتعديلاته',
    title: 'ساعات العمل الإضافي، الإجازات السنوية، ومكافأة نهاية الخدمة',
    officialSummary:
      'يستحق العامل إجازة سنوية بأجر كامل مدتها 14 يوماً عن كل سنة خدمة، وتصبح 21 يوماً إذا أمضى في الخدمة خمس سنوات متصلة لدى صاحب العمل نفسه. ويُحتسب العمل الإضافي في الأيام العادية بنسبة 125% وفي أيام العطل الأسبوعية والأعياد الرسمية بنسبة 150% من الأجر المعتاد.',
    practicalInterpretation:
      'التفسير العملي للموارد البشرية: يجب تكوين مخصص بدل إجازات متراكمة في نهاية كل سنة مالية كالتزام متداول في قائمة المركز المالي، علماً بأنه لا يجوز جمع الإجازات لأكثر من سنتين متتاليتين.',
    exampleCase:
      'مثال تطبيقي: موظف راتبه الشهري 900 د.أ (الأجر اليومي 30 د.أ) ولديه 8 أيام إجازة غير مستنفدة في نهاية العام؛ يُسجل له مخصص بقيمة 240 د.أ.',
  },
  {
    id: 'LAW-SSC-1',
    lawCategory: 'قانون الضمان',
    articleNumber: 'المادة (42) و (48) - قانون الضمان الاجتماعي رقم 1 لسنة 2014 وتعديلاته',
    title: 'نسب الاقتطاع الشهرية وسقف الأجر الخاضع للضمان الاجتماعي لعام 2026',
    officialSummary:
      'تبلغ نسبة الاقتطاع الإجمالية للضمان الاجتماعي (21.75%) من الأجر الخاضع للاقتطاع، موزعة بواقع (7.5%) تقتطع من أجر المؤمن عليه (الموظف)، و(14.25%) تتحملها المنشأة (تشمل تأمين الشيخوخة والعجز والوفاة، إصابات العمل، الأمومة، والتعطل عن العمل)، وتضاف (1%) للمهن الخطرة لتصبح حصة المنشأة (15.25%).',
    practicalInterpretation:
      'التفسير العملي: الحد الأدنى للأجر الخاضع للضمان هو 290 د.أ، والسقف الأعلى للأجر الخاضع للضمان في عام 2026 هو 3,742 د.أ؛ أي مبلغ يتجاوز هذا السقف في الراتب الأساسي والعلاوات الثابتة لا يخضع لاقتطاع الضمان الاجتماعي.',
    exampleCase:
      'مثال تطبيقي: موظف راتبه الخاضع 1,000 د.أ؛ يُقتطع من راتبه 75.000 د.أ وتتحمل الشركة 142.500 د.أ، ويُورد للمؤسسة العامة للضمان الاجتماعي إجمالي 217.500 د.أ شهرياً.',
  },
];

export default function ErpModulesWorkspace({
  sectionId,
  onSelectSection,
}: ErpModulesWorkspaceProps) {
  const [cycleData, setCycleData] = useState(() => AccountingCycleStore.computeFullFinancialCycle());
  const [parties, setParties] = useState(() => AccountingCycleStore.getParties());
  const [selectedPartyId, setSelectedPartyId] = useState<string>('CUST-01');
  const [bannerMsg, setBannerMsg] = useState<string | null>(null);

  // Commercial Billing & Vouchers Action Tab
  const [billingMode, setBillingMode] = useState<
    'INVOICE' | 'CREDIT_NOTE' | 'DEBIT_NOTE' | 'RECEIPT_VOUCHER' | 'PAYMENT_VOUCHER' | 'STATEMENT'
  >('INVOICE');

  // Commercial Document Form States
  const [docNumber, setDocNumber] = useState<string>('INV-2026-205');
  const [origInvNumber, setOrigInvNumber] = useState<string>('INV-2026-101');
  const [partyNameInput, setPartyNameInput] = useState<string>('شركة الاتصالات المتقدمة ذ.م.م');
  const [netAmountInput, setNetAmountInput] = useState<number>(4500);
  const [vatRateInput, setVatRateInput] = useState<number>(16);
  const [cogsInput, setCogsInput] = useState<number>(2100);
  const [paymentMethodInput, setPaymentMethodInput] = useState<'CLIQ' | 'CASH' | 'CARD' | 'CREDIT_AR'>('CREDIT_AR');
  const [reasonInput, setReasonInput] = useState<string>('تسوية خصم كميات / مردودات بضاعة بموجب محضر استلام');

  // New Party Modal / Form
  const [newPartyType, setNewPartyType] = useState<'CUSTOMER_AR' | 'VENDOR_AP'>('CUSTOMER_AR');
  const [newPartyName, setNewPartyName] = useState<string>('');
  const [newPartyTin, setNewPartyTin] = useState<string>('');
  const [newPartyCity, setNewPartyCity] = useState<string>('عمّان');
  const [newPartyPhone, setNewPartyPhone] = useState<string>('079');
  const [newPartyOpeningBal, setNewPartyOpeningBal] = useState<number>(0);

  // Decision Log State
  const [decisionLog, setDecisionLog] = useState<DecisionLogEntry[]>([
    {
      id: 'DEC-2026-01',
      title: 'تم اعتماد ميزانية العام المالي 2026 وخطة التدفقات النقدية',
      actorName: 'م. طارق الكيلاني',
      actorRole: 'المدير المالي (CFO)',
      dateTime: '2026-01-05 · 10:15 صباحاً',
      reason: 'تحديد سقف النفقات الرأسمالية بـ 120,000 د.أ واستهداف هامش ربح تشغيلي لا يقل عن 22%.',
      impactTag: 'الميزانية والتخطيط',
    },
    {
      id: 'DEC-2026-02',
      title: 'تم تعديل الرواتب وهيكلة العلاوات الفنية للربع الأول',
      actorName: 'أ. ريم العبداللات',
      actorRole: 'مديرة الموارد البشرية',
      dateTime: '2026-02-01 · 01:40 ظهراً',
      reason: 'مواكبة سلم الأجور في قطاع التكنولوجيا وتحديث الأجور الخاضعة للضمان الاجتماعي وفق سقف 2026 (3,742 د.أ).',
      impactTag: 'الرواتب والضمان',
    },
    {
      id: 'DEC-2026-03',
      title: 'تم رفع ضريبة المبيعات على بند الخدمات الاستشارية الجديدة إلى النسبة العامة (16%)',
      actorName: 'أ. سامر المجالي (JCPA)',
      actorRole: 'المستشار والمدقق الضريبي',
      dateTime: '2026-03-02 · 11:30 صباحاً',
      reason: 'الامتثال الكامل لجدول الخدمات الخاضعة للضريبة العامة وتجنب أي فروقات فحص ضريبي في إقرار الفترة القادمة.',
      impactTag: 'الامتثال الضريبي',
    },
  ]);
  const [newDecTitle, setNewDecTitle] = useState<string>('');
  const [newDecActor, setNewDecActor] = useState<string>('المدير المالي');
  const [newDecReason, setNewDecReason] = useState<string>('');

  // Electronic Document Vault State
  const [vaultDocs] = useState<VaultDocEntry[]>([
    {
      id: 'DOC-01',
      category: 'السجل التجاري',
      title: 'شهادة تسجيل شركة ذات مسؤولية محدودة - دائرة مراقبة الشركات',
      docNumber: 'CCD-200184992',
      issueDate: '2021-04-12',
      expiryDate: 'دائم (محدث سنوياً)',
      daysRemaining: 365,
      status: 'ساري',
    },
    {
      id: 'DOC-02',
      category: 'الرخصة',
      title: 'رخصة مهن أمانة عمّان الكبرى - المقر الرئيسي (الشميساني)',
      docNumber: 'GAM-LIC-88412',
      issueDate: '2025-04-10',
      expiryDate: '2026-04-09',
      daysRemaining: 30,
      status: 'ينتهي قريباً',
    },
    {
      id: 'DOC-03',
      category: 'الضريبة',
      title: 'شهادة التسجيل في ضريبة الدخل والمبيعات + شهادة براءة ذمة ضريبية',
      docNumber: 'ISTD-17489201',
      issueDate: '2026-01-15',
      expiryDate: '2026-12-31',
      daysRemaining: 295,
      status: 'ساري',
    },
    {
      id: 'DOC-04',
      category: 'التفويضات',
      title: 'كتاب تفويض التوقيع البنكي والضريبي (المفوض الأول + المدير المالي)',
      docNumber: 'AUTH-2025-09',
      issueDate: '2025-04-10',
      expiryDate: '2026-04-09',
      daysRemaining: 30,
      status: 'ينتهي قريباً',
    },
    {
      id: 'DOC-05',
      category: 'العقود',
      title: 'عقد إيجار المقر الرئيسي المصدق + عقد توريد الأنظمة السحابية السنوي',
      docNumber: 'CNT-2026-104',
      issueDate: '2026-01-01',
      expiryDate: '2026-12-31',
      daysRemaining: 295,
      status: 'ساري',
    },
  ]);

  // Jordan Law Search State
  const [lawSearch, setLawSearch] = useState<string>('');
  const [selectedLawCat, setSelectedLawCat] = useState<string>('ALL');

  // Jordan Business Advisor State
  const [advisorQuery, setAdvisorQuery] = useState<string>('');
  const [selectedPresetQ, setSelectedPresetQ] = useState<number>(0);

  // HR SSC Calculator State
  const [empGrossWage, setEmpGrossWage] = useState<number>(1250);
  const [isHazardousJob, setIsHazardousJob] = useState<boolean>(false);

  useEffect(() => {
    return AccountingCycleStore.subscribe(() => {
      setCycleData(AccountingCycleStore.computeFullFinancialCycle());
      setParties(AccountingCycleStore.getParties());
    });
  }, []);

  // Automatically pick vendor when in biz-vendors
  useEffect(() => {
    if (sectionId === 'biz-vendors') {
      setSelectedPartyId('VEND-01');
      setPartyNameInput('شركة الخوادم والحوسبة الأردنية');
      setBillingMode('PAYMENT_VOUCHER');
    } else if (sectionId === 'biz-customers') {
      setSelectedPartyId('CUST-01');
      setPartyNameInput('شركة الاتصالات المتقدمة ذ.م.م');
      setBillingMode('INVOICE');
    }
  }, [sectionId]);

  const showSuccessBanner = (msg: string) => {
    setBannerMsg(msg);
    setTimeout(() => setBannerMsg(null), 6000);
  };

  // Commercial Document Execution Handler
  const handleExecuteCommercialDoc = (e: React.FormEvent) => {
    e.preventDefault();
    const netDec = Decimal.max(0, new Decimal(netAmountInput || 0)).toDecimalPlaces(3);
    const vatDec = netDec.times(new Decimal(vatRateInput || 0).div(100)).toDecimalPlaces(3);
    const grossDec = netDec.plus(vatDec).toDecimalPlaces(3);

    const matchedParty = parties.find((p) => p.partyName === partyNameInput);
    const partyId = matchedParty?.partyId || selectedPartyId;

    if (billingMode === 'INVOICE') {
      const v = AccountingCycleStore.postJoFotaraSalesInvoiceToLedger({
        invoiceNumber: docNumber.trim() || `INV-2026-${Math.floor(200 + Math.random() * 700)}`,
        customerId: partyId,
        customerName: partyNameInput,
        netAmountJod: netDec.toNumber(),
        vatAmountJod: vatDec.toNumber(),
        grossAmountJod: grossDec.toNumber(),
        paymentMethod: paymentMethodInput,
        estimatedCogsJod: Math.max(0, Number(cogsInput) || 0),
      });
      showSuccessBanner(
        `تم إصدار الفاتورة (${v.sourceReference}) وترحيل قيد اليومية (${v.voucherNo}) إلى الأستاذ العام وكشف حساب العميل وميزان المراجعة تلقائياً!`
      );
    } else if (billingMode === 'CREDIT_NOTE') {
      const v = AccountingCycleStore.postCreditNoteToLedger({
        creditNoteNumber: docNumber.trim() || `CRN-2026-${Math.floor(100 + Math.random() * 800)}`,
        originalInvoiceNumber: origInvNumber.trim() || 'INV-2026-101',
        customerId: partyId,
        customerName: partyNameInput,
        netReturnJod: netDec.toNumber(),
        vatRatePercent: vatRateInput,
        reasonAr: reasonInput,
      });
      showSuccessBanner(
        `تم إصدار الإشعار الدائن (${v.sourceReference}) وترحيل القيد العكسي (${v.voucherNo}) وتخفيض الذمم والضريبة فوراً!`
      );
    } else if (billingMode === 'DEBIT_NOTE') {
      const v = AccountingCycleStore.postDebitNoteToLedger({
        debitNoteNumber: docNumber.trim() || `DBN-2026-${Math.floor(100 + Math.random() * 800)}`,
        originalInvoiceNumber: origInvNumber.trim() || 'INV-2026-101',
        customerId: partyId,
        customerName: partyNameInput,
        netAdditionJod: netDec.toNumber(),
        vatRatePercent: vatRateInput,
        reasonAr: reasonInput,
      });
      showSuccessBanner(
        `تم إصدار الإشعار المدين (${v.sourceReference}) وترحيل قيد الإضافة (${v.voucherNo}) على حساب العميل والضريبة!`
      );
    } else if (billingMode === 'RECEIPT_VOUCHER') {
      const v = AccountingCycleStore.postReceiptVoucherToLedger({
        receiptNo: docNumber.trim() || `RV-2026-${Math.floor(300 + Math.random() * 600)}`,
        customerId: partyId,
        customerName: partyNameInput,
        amountJod: netDec.toNumber(),
        channelLabelAr: paymentMethodInput === 'CASH' ? 'نقداً بالصندوق' : 'تحويل بنكي CliQ',
        notesAr: reasonInput || 'تحصيل دفعة من حساب العميل',
      });
      showSuccessBanner(
        `تم إصدار سند القبض (${v.sourceReference}) بقيمة ${netDec.toFixed(3)} د.أ وترحيله لحساب النقدية والذمم المدينة (${v.voucherNo})!`
      );
    } else if (billingMode === 'PAYMENT_VOUCHER') {
      const v = AccountingCycleStore.postPaymentVoucherToLedger({
        paymentNo: docNumber.trim() || `PV-2026-${Math.floor(300 + Math.random() * 600)}`,
        targetType: sectionId === 'biz-vendors' ? 'VENDOR_AP' : 'OPERATING_EXPENSE',
        partyId,
        partyName: partyNameInput,
        amountJod: netDec.toNumber(),
        whtRatePercent: 0,
        notesAr: reasonInput || 'سداد دفعة للمورد / مصروف تشغيلي',
      });
      showSuccessBanner(
        `تم إصدار سند الصرف (${v.sourceReference}) بقيمة ${netDec.toFixed(3)} د.أ وترحيله لليومية والأستاذ العام (${v.voucherNo})!`
      );
    }

    setCycleData(AccountingCycleStore.computeFullFinancialCycle());
  };

  const handleAddNewParty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartyName.trim()) return;
    const created = AccountingCycleStore.addParty({
      partyType: newPartyType,
      partyName: newPartyName.trim(),
      taxNumber: newPartyTin.trim() || '179900112',
      cityAr: newPartyCity.trim() || 'عمّان',
      phone: newPartyPhone.trim() || '0790000000',
      openingBalanceJod: Number(newPartyOpeningBal) || 0,
    });
    setParties(AccountingCycleStore.getParties());
    setSelectedPartyId(created.partyId);
    setPartyNameInput(created.partyName);
    setNewPartyName('');
    showSuccessBanner(
      `تمت إضافة ${created.partyType === 'CUSTOMER_AR' ? 'العميل' : 'المورد'} (${created.partyName}) وفتح كشف حساب فرعي له بنجاح.`
    );
  };

  const handlePostMonthlyPayrollToLedger = () => {
    const created = AccountingCycleStore.addJournalVoucher({
      dateIso: new Date().toISOString().slice(0, 10),
      sourceType: 'PAYROLL_AND_SSC',
      sourceReference: `PAY-2026-${Math.floor(10 + Math.random() * 89)}`,
      descriptionAr: 'ترحيل مسير الرواتب والأجور وحصة المنشأة في الضمان الاجتماعي (14.25%) واقتطاعات الضمان (21.75%)',
      lines: [
        {
          accountCode: '5201',
          accountNameAr: 'مصاريف الرواتب والأجور وحصة الشركة بالضمان الاجتماعي',
          debitJod: 9711.25,
          creditJod: 0,
        },
        {
          accountCode: '2106',
          accountNameAr: 'أمانات المؤسسة العامة للضمان الاجتماعي المستحقة (21.75%)',
          debitJod: 0,
          creditJod: 1848.75,
        },
        {
          accountCode: '1101',
          accountNameAr: 'النقدية لدى البنوك المحلية والصندوق (البنك العربي / CliQ)',
          debitJod: 0,
          creditJod: 7862.5,
        },
      ],
    });
    setCycleData(AccountingCycleStore.computeFullFinancialCycle());
    showSuccessBanner(
      `تم ترحيل مسير الرواتب والضمان الاجتماعي بقيد يومية مزدوج رقم (${created.voucherNo}) وتحديث قائمة الدخل والمركز المالي!`
    );
  };

  const handleAddDecision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDecTitle.trim() || !newDecReason.trim()) return;
    const entry: DecisionLogEntry = {
      id: `DEC-2026-0${decisionLog.length + 1}`,
      title: newDecTitle.trim(),
      actorName: newDecActor.trim() || 'المدير المالي',
      actorRole: 'إدارة المنشأة',
      dateTime: `${new Date().toISOString().slice(0, 10)} · الآن`,
      reason: newDecReason.trim(),
      impactTag: 'قرار إداري ومالي',
    };
    setDecisionLog([entry, ...decisionLog]);
    setNewDecTitle('');
    setNewDecReason('');
    showSuccessBanner('تم توثيق القرار المالي/الإداري في سجل القرارات المعتمد للمنشأة.');
  };

  const handleExportInvestorPdf = () => {
    exportArabicReportToPdf({
      title: 'تقرير الأداء المالي والجدارة الائتمانية للمستثمرين والبنوك الأردنية',
      subtitle: 'مستخرج آلياً من الدورة المحاسبية المتكاملة (قائمة الدخل، المركز المالي، والتدفقات النقدية)',
      referenceNumber: `CFO-BANK-2026-${Math.floor(100 + Math.random() * 900)}`,
      sections: [
        {
          heading: '1. الأداء المالي وتحليل الربحية (قائمة الدخل)',
          rows: [
            { label: 'إجمالي الإيرادات والمبيعات الصافية', value: `${cycleData.incomeStatement.totalRevenueJod} د.أ` },
            { label: 'تكلفة البضاعة المباعة (COGS)', value: `${cycleData.incomeStatement.costOfGoodsSoldJod} د.أ` },
            { label: 'مجمل الربح التشغيلي (Gross Profit)', value: `${cycleData.incomeStatement.grossProfitJod} د.أ` },
            { label: 'الربح التشغيلي قبل الضريبة (EBIT)', value: `${cycleData.incomeStatement.operatingProfitEbitJod} د.أ` },
            { label: 'صافي الربح بعد ضريبة الدخل والمساهمة الوطنية', value: `${cycleData.incomeStatement.netIncomeAfterTaxJod} د.أ` },
          ],
        },
        {
          heading: '2. المركز المالي والسيولة وحقوق الملكية',
          rows: [
            { label: 'رصيد النقدية لدى البنوك والصندوق', value: `${cycleData.balanceSheet.cashAndBanksJod} د.أ` },
            { label: 'ذمم العملاء التجارية (AR)', value: `${cycleData.balanceSheet.accountsReceivableJod} د.أ` },
            { label: 'إجمالي الأصول المتوازنة', value: `${cycleData.balanceSheet.totalAssetsJod} د.أ` },
            { label: 'إجمالي حقوق الملكية والأرباح المحتجزة', value: `${cycleData.balanceSheet.totalEquityJod} د.أ` },
          ],
        },
        {
          heading: '3. المؤشرات المالية، المخاطر، والتوصيات الائتمانية',
          rows: [
            { label: 'العائد على الأصول (ROA) والعائد على الملكية (ROE)', value: 'ROA: 18.03% | ROE: 25.83%' },
            { label: 'نسبة السيولة السريعة (Quick Ratio)', value: '1.48x (ملاءة نقدية قوية)' },
            { label: 'درجة الامتثال الضريبي (Tax Compliance Score)', value: '92% (مخاطر منخفضة)' },
            { label: 'التوصية الائتمانية للبنوك والمستثمرين', value: 'مؤهل لتسهيلات ائتمانية لغاية 150,000 د.أ' },
          ],
        },
      ],
    });
    showSuccessBanner('تم توليد وتنزيل تقرير المستثمرين والبنوك الاحترافي بنجاح.');
  };

  const selectedSubLedger =
    cycleData.subLedgers.find((s) => s.partyId === selectedPartyId) || cycleData.subLedgers[0];

  // ============================================================================
  // 1. BUSINESS & COMMERCIAL BILLING / VOUCHERS / STATEMENTS WORKSPACE
  // ============================================================================
  if (
    sectionId === 'biz-customers' ||
    sectionId === 'biz-vendors' ||
    sectionId === 'biz-contracts' ||
    sectionId === 'biz-projects'
  ) {
    return (
      <div className="space-y-6">
        {bannerMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 flex items-center gap-3 text-xs font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>{bannerMsg}</span>
          </div>
        )}

        {/* Header */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-lg flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold mb-2">
              <Receipt className="w-3.5 h-3.5" />
              <span>نظام الفواتير والسندات التجارية وكشوف حسابات العملاء والموردين</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold">
              {sectionId === 'biz-customers' && 'إدارة العملاء · الفواتير · الإشعارات · سندات القبض · كشف حساب عميل'}
              {sectionId === 'biz-vendors' && 'إدارة الموردين · فواتير المشتريات · سندات الصرف · كشف حساب مورد'}
              {sectionId === 'biz-contracts' && 'إدارة العقود التجارية والاتفاقيات السنوية مع العملاء والموردين'}
              {sectionId === 'biz-projects' && 'إدارة المشاريع ومراكز التكلفة وربحية العقود'}
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              كل عملية إصدار فاتورة أو إشعار دائن/مدين أو سند قبض/صرف تُرحّل قيد يومية مزدوج وتُحدث كشف حساب العميل/المورد وميزان المراجعة فوراً.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onSelectSection('acc-journal')}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer"
            >
              معاينة قيود اليومية ({cycleData.vouchers.length})
            </button>
            <button
              onClick={() => onSelectSection('acc-statements')}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
            >
              القوائم المالية الفورية
            </button>
          </div>
        </div>

        {/* 6 Commercial Document Tabs */}
        <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
          {[
            { id: 'INVOICE', label: '1. إنشاء فاتورة مبيعات', icon: FileText },
            { id: 'CREDIT_NOTE', label: '2. إشعار دائن (مردودات/خصم)', icon: RotateCcw },
            { id: 'DEBIT_NOTE', label: '3. إشعار مدين (فروقات/إضافة)', icon: PlusCircle },
            { id: 'RECEIPT_VOUCHER', label: '4. سند قبض (تحصيل عميل)', icon: ArrowDownLeft },
            { id: 'PAYMENT_VOUCHER', label: '5. سند صرف (دفعة مورد/مصروف)', icon: ArrowUpRight },
            { id: 'STATEMENT', label: '6. كشف حساب عميل / مورد تفصيلي', icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = billingMode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setBillingMode(tab.id as typeof billingMode)}
                className={`px-3.5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  active
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Interactive Form + Live Customer/Vendor Statement Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 5 Cols: Commercial Document Generator or Add Party */}
          <div className="lg:col-span-5 space-y-5">
            {billingMode !== 'STATEMENT' && (
              <form
                onSubmit={handleExecuteCommercialDoc}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {billingMode === 'INVOICE' && 'إصدار فاتورة مبيعات ضريبية وترحيلها للأستاذ العام'}
                    {billingMode === 'CREDIT_NOTE' && 'إصدار إشعار دائن (تخفيض مبيعات وذمم وضريبة)'}
                    {billingMode === 'DEBIT_NOTE' && 'إصدار إشعار مدين (إضافة مطالبات وفروقات أسعار)'}
                    {billingMode === 'RECEIPT_VOUCHER' && 'إصدار سند قبض رسمي من عميل'}
                    {billingMode === 'PAYMENT_VOUCHER' && 'إصدار سند صرف لمورد أو مصروف تشغيلي'}
                  </h3>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                    قيد مزدوج آلي
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">رقم المستند</label>
                    <input
                      type="text"
                      value={docNumber}
                      onChange={(e) => setDocNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 font-mono"
                    />
                  </div>
                  {(billingMode === 'CREDIT_NOTE' || billingMode === 'DEBIT_NOTE') && (
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">رقم الفاتورة الأصلية</label>
                      <input
                        type="text"
                        value={origInvNumber}
                        onChange={(e) => setOrigInvNumber(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 font-mono"
                      />
                    </div>
                  )}
                  <div className="sm:col-span-2">
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">
                      اختر العميل / المورد المسجل
                    </label>
                    <select
                      value={partyNameInput}
                      onChange={(e) => {
                        setPartyNameInput(e.target.value);
                        const found = parties.find((p) => p.partyName === e.target.value);
                        if (found) setSelectedPartyId(found.partyId);
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 font-bold"
                    >
                      {parties.map((p) => (
                        <option key={p.partyId} value={p.partyName}>
                          [{p.partyType === 'CUSTOMER_AR' ? 'عميل' : 'مورد'}] {p.partyName} (الرقم الضريبي: {p.taxNumber})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">
                      {billingMode === 'RECEIPT_VOUCHER' || billingMode === 'PAYMENT_VOUCHER'
                        ? 'المبلغ المدفوع / المحصل (د.أ)'
                        : 'المبلغ الصافي قبل الضريبة (د.أ)'}
                    </label>
                    <input
                      type="number"
                      min={1}
                      step="0.001"
                      value={netAmountInput}
                      onChange={(e) => setNetAmountInput(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 font-mono"
                    />
                  </div>

                  {(billingMode === 'INVOICE' || billingMode === 'CREDIT_NOTE' || billingMode === 'DEBIT_NOTE') && (
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">نسبة ضريبة المبيعات (%)</label>
                      <select
                        value={vatRateInput}
                        onChange={(e) => setVatRateInput(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 font-mono"
                      >
                        <option value={16}>16% (النسبة العامة)</option>
                        <option value={4}>4% (النسبة المخفضة)</option>
                        <option value={0}>0% (معفى / صفرية)</option>
                      </select>
                    </div>
                  )}

                  {billingMode === 'INVOICE' && (
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">تكلفة البضاعة المباعة (COGS)</label>
                      <input
                        type="number"
                        min={0}
                        step="0.001"
                        value={cogsInput}
                        onChange={(e) => setCogsInput(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 font-mono"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">طريقة التسوية المالية</label>
                    <select
                      value={paymentMethodInput}
                      onChange={(e) => setPaymentMethodInput(e.target.value as typeof paymentMethodInput)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700"
                    >
                      <option value="CREDIT_AR">ذمم (على الحساب - يظهر في كشف العميل)</option>
                      <option value="CLIQ">تحويل بنكي فوري (CliQ - 1101)</option>
                      <option value="CASH">نقداً (الصندوق الرئيسي - 1101)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">البيان / السبب التوثيقي</label>
                    <input
                      type="text"
                      value={reasonInput}
                      onChange={(e) => setReasonInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm cursor-pointer"
                >
                  اعتماد المستند وترحيله لليومية وكشف الحساب الآن
                </button>
              </form>
            )}

            {/* Add New Customer / Vendor Card */}
            <form
              onSubmit={handleAddNewParty}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3 shadow-sm"
            >
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                إضافة عميل أو مورد جديد وفتح حساب ذمم له
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">التصنيف</label>
                  <select
                    value={newPartyType}
                    onChange={(e) => setNewPartyType(e.target.value as 'CUSTOMER_AR' | 'VENDOR_AP')}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700"
                  >
                    <option value="CUSTOMER_AR">عميل (ذمم مدينة - 1102)</option>
                    <option value="VENDOR_AP">مورد (ذمم دائنة - 2101)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">الرقم الضريبي</label>
                  <input
                    type="text"
                    value={newPartyTin}
                    onChange={(e) => setNewPartyTin(e.target.value)}
                    placeholder="178XXXXXX"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 font-mono"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">الاسم التجاري الكامل</label>
                  <input
                    type="text"
                    value={newPartyName}
                    onChange={(e) => setNewPartyName(e.target.value)}
                    placeholder="مثال: شركة الشرق الأوسط للتجهيزات الصناعية ذ.م.م"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">المدينة</label>
                  <input
                    type="text"
                    value={newPartyCity}
                    onChange={(e) => setNewPartyCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-bold">الرصيد الافتتاحي (د.أ)</label>
                  <input
                    type="number"
                    value={newPartyOpeningBal}
                    onChange={(e) => setNewPartyOpeningBal(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 font-mono"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
              >
                + حفظ وإضافة إلى دليل العملاء والموردين
              </button>
            </form>
          </div>

          {/* Right 7 Cols: Live Customer / Vendor Statement of Account (كشف حساب عميل / مورد) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  كشف حساب تفصيلي مباشر (Statement of Account)
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {selectedSubLedger?.partyName}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  الرقم الضريبي: {selectedSubLedger?.taxNumber} · المدينة: {selectedSubLedger?.cityAr} · الهاتف:{' '}
                  {selectedSubLedger?.phone}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={selectedPartyId}
                  onChange={(e) => setSelectedPartyId(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold"
                >
                  {cycleData.subLedgers.map((sl) => (
                    <option key={sl.partyId} value={sl.partyId}>
                      {sl.partyType === 'CUSTOMER_AR' ? 'عميل: ' : 'مورد: '}
                      {sl.partyName}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>طباعة الكشف</span>
                </button>
              </div>
            </div>

            {/* Summary KPIs for the Selected Customer / Vendor */}
            {selectedSubLedger && (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                    <div className="text-[11px] text-slate-500">إجمالي الحركات المدينة (فواتير / تسديدات)</div>
                    <div className="text-base font-extrabold font-mono text-slate-900 dark:text-white mt-1">
                      {selectedSubLedger.totalDebitJod} JOD
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                    <div className="text-[11px] text-slate-500">إجمالي الحركات الدائنة (قبض / إشعارات دائنة)</div>
                    <div className="text-base font-extrabold font-mono text-slate-900 dark:text-white mt-1">
                      {selectedSubLedger.totalCreditJod} JOD
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                    <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                      الرصيد القائم المستحق ({selectedSubLedger.partyType === 'CUSTOMER_AR' ? 'لنا على العميل' : 'علينا للمورد'})
                    </div>
                    <div className="text-base font-extrabold font-mono text-emerald-700 dark:text-emerald-300 mt-1">
                      {selectedSubLedger.closingBalanceJod} JOD
                    </div>
                  </div>
                </div>

                {/* Movements Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500">
                        <th className="p-2.5">التاريخ</th>
                        <th className="p-2.5">رقم القيد</th>
                        <th className="p-2.5">المرجع</th>
                        <th className="p-2.5">البيان</th>
                        <th className="p-2.5">مدين (JOD)</th>
                        <th className="p-2.5">دائن (JOD)</th>
                        <th className="p-2.5">الرصيد التراكمي</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {selectedSubLedger.movements.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-6 text-center text-slate-400">
                            لا توجد حركات مسجلة لهذا الحساب بعد — قم بإصدار فاتورة أو سند من النموذج المجاور.
                          </td>
                        </tr>
                      ) : (
                        selectedSubLedger.movements.map((m, idx) => (
                          <tr key={`${m.voucherNo}-${idx}`} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                            <td className="p-2.5 font-mono text-slate-500">{m.dateIso}</td>
                            <td className="p-2.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">{m.voucherNo}</td>
                            <td className="p-2.5 font-mono">{m.sourceReference}</td>
                            <td className="p-2.5 text-slate-700 dark:text-slate-300">{m.descriptionAr}</td>
                            <td className="p-2.5 font-mono font-semibold">
                              {Number(m.debitJod) > 0 ? m.debitJod : '—'}
                            </td>
                            <td className="p-2.5 font-mono font-semibold">
                              {Number(m.creditJod) > 0 ? m.creditJod : '—'}
                            </td>
                            <td className="p-2.5 font-mono font-extrabold text-slate-900 dark:text-white">
                              {m.runningBalanceJod}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Contracts & Projects Summary if user selected biz-contracts or biz-projects */}
        {(sectionId === 'biz-contracts' || sectionId === 'biz-projects') && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-600" />
              <span>سجل العقود التجارية والمشاريع النشطة ومراكز التكلفة</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {[
                {
                  code: 'PRJ-2026-01',
                  name: 'مشروع أتمتة المستودعات وتوريد الأنظمة - شركة الفوسفات',
                  client: 'مجموعة الفوسفات والصناعات التحويلية المساهمة',
                  contractValue: '125,000.000 د.أ',
                  completion: '78%',
                  margin: '39.4%',
                },
                {
                  code: 'PRJ-2026-02',
                  name: 'عقد الصيانة والدعم الفني السنوي للأنظمة المحاسبية',
                  client: 'شركة الاتصالات المتقدمة ذ.م.م',
                  contractValue: '42,000.000 د.أ',
                  completion: '65%',
                  margin: '54.2%',
                },
                {
                  code: 'PRJ-2026-03',
                  name: 'اتفاقية توريد أجهزة نقاط البيع والربط مع JoFotara',
                  client: 'مستشفى الأردن التخصصي للرعاية الطبية',
                  contractValue: '68,500.000 د.أ',
                  completion: '90%',
                  margin: '41.8%',
                },
              ].map((prj) => (
                <div
                  key={prj.code}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{prj.code}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                      نسبة الإنجاز: {prj.completion}
                    </span>
                  </div>
                  <div className="font-extrabold text-slate-900 dark:text-white">{prj.name}</div>
                  <div className="text-slate-500">العميل: {prj.client}</div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700 font-bold">
                    <span>قيمة العقد: {prj.contractValue}</span>
                    <span className="text-emerald-600 dark:text-emerald-400">هامش الربح: {prj.margin}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ============================================================================
  // 2. TAX COMPLIANCE CENTER (مركز الامتثال الضريبي - 92%)
  // ============================================================================
  if (sectionId === 'tax-compliance') {
    return (
      <div className="space-y-6">
        <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-5 space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>مركز الامتثال والفحص الضريبي الاستباقي - السوق الأردني</span>
              </div>
              <h1 className="text-2xl font-extrabold">درجة الامتثال الضريبي</h1>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-black font-mono text-emerald-400">92%</span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                  مستوى امتثال مرتفع · جاهز للتدقيق
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed pt-1">
                يتم احتساب المؤشر آلياً بناءً على تطابق فواتير JoFotara مع دفتر الأستاذ العام، وسلامة اقتطاعات المصدر، واكتمال الوثائق القانونية للمنشأة.
              </p>
            </div>

            {/* The Exact 3 Alerts Requested by User */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                  <span className="text-[11px] font-bold text-rose-300">أولوية قصوى</span>
                </div>
                <div className="text-sm font-extrabold text-white">يوجد إقرار متأخر</div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  إقرار ضريبة المبيعات الدورية للفترة الحالية يستحق خلال 5 أيام (صافي الضريبة المستحقة للتوريد:{' '}
                  {cycleData.taxIntegrationSummary.netGstPayableToIstdJod} د.أ).
                </p>
                <button
                  onClick={() => onSelectSection('tax-sales')}
                  className="w-full py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold cursor-pointer"
                >
                  مراجعة وتقديم الإقرار
                </button>
              </div>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <Clock className="w-5 h-5 text-amber-400" />
                  <span className="text-[11px] font-bold text-amber-300">تنبيه وثائق</span>
                </div>
                <div className="text-sm font-extrabold text-white">يوجد ملف غير مكتمل</div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  تفويض التوقيع الضريبي ورخصة المهن ينتهيان خلال 30 يوماً، ويجب تحديث مرفق شهادة التسجيل لعام 2026.
                </p>
                <button
                  onClick={() => onSelectSection('doc-authorizations')}
                  className="w-full py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold cursor-pointer"
                >
                  استكمال الملف الضريبي
                </button>
              </div>

              <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <ShieldAlert className="w-5 h-5 text-sky-400" />
                  <span className="text-[11px] font-bold text-sky-300">تحليل المخاطر</span>
                </div>
                <div className="text-sm font-extrabold text-white">يوجد خطر ضريبي متوسط</div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  وجود مصاريف استشارية تحتاج مطابقة إشعار اقتطاع ضريبة دخل من المنبع (رصيد و/1 الحالي:{' '}
                  {cycleData.taxIntegrationSummary.whtPayableFormW1Jod} د.أ).
                </p>
                <button
                  onClick={() => onSelectSection('tax-income')}
                  className="w-full py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-bold cursor-pointer"
                >
                  معالجة اقتطاع المصدر
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Actionable Recommendations Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
            التوصيات التصحيحية لرفع درجة الامتثال الضريبي من 92% إلى 100%
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="font-extrabold text-emerald-700 dark:text-emerald-400">1. مطابقة فواتير المشتريات مع JoFotara (+3%)</div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                تحقق من أن جميع فواتير الموردين المحليين المسجلة في حساب الذمم الدائنة (2101) تحتوي على رقم تسلسلي ضريبي ورمز QR صالح قبل إغلاق الإقرار.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="font-extrabold text-emerald-700 dark:text-emerald-400">2. توثيق ضريبة الاقتطاع من المصدر (+3%)</div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                اقتطع 5% من أتعاب المحامين والمدققين والاستشاريين المحليين و10% لغير المقيمين، وورّدها خلال 30 يوماً من تاريخ الدفع وفق قانون ضريبة الدخل.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="font-extrabold text-emerald-700 dark:text-emerald-400">3. تجديد كتاب التفويض ورخصة المهن (+2%)</div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                رفع النسخة المصدقة الجديدة من رخصة المهن وتفويض التوقيع في قسم «المستندات» لضمان استمرارية الصلاحيات الإلكترونية دون انقطاع.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // 3. HUMAN RESOURCES WORKSPACE (الموظفون · الرواتب · الضمان الاجتماعي · الإجازات)
  // ============================================================================
  if (
    sectionId === 'hr-employees' ||
    sectionId === 'hr-payroll' ||
    sectionId === 'hr-ssc' ||
    sectionId === 'hr-leaves'
  ) {
    const cappedWage = Math.min(Math.max(290, empGrossWage), 3742);
    const empSscShare = new Decimal(cappedWage).times(0.075).toDecimalPlaces(3).toNumber();
    const compSscRate = isHazardousJob ? 0.1525 : 0.1425;
    const compSscShare = new Decimal(cappedWage).times(compSscRate).toDecimalPlaces(3).toNumber();
    const totalSsc = new Decimal(empSscShare).plus(compSscShare).toDecimalPlaces(3).toNumber();

    return (
      <div className="space-y-6">
        {bannerMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 flex items-center gap-3 text-xs font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>{bannerMsg}</span>
          </div>
        )}

        <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-lg flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold mb-2">
              <UserCheck className="w-3.5 h-3.5" />
              <span>نظام الموارد البشرية والرواتب والضمان الاجتماعي الأردني</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold">
              {sectionId === 'hr-employees' && 'سجل الموظفين والملفات الوظيفية والتعاقدية'}
              {sectionId === 'hr-payroll' && 'مسير الرواتب الشهري وترحيل قيد الرواتب والضمان لليومية'}
              {sectionId === 'hr-ssc' && 'حاسبة وسجل اشتراكات المؤسسة العامة للضمان الاجتماعي (2026)'}
              {sectionId === 'hr-leaves' && 'إدارة الإجازات السنوية والمرضية ومخصص مكافأة نهاية الخدمة'}
            </h1>
          </div>
          <button
            onClick={handlePostMonthlyPayrollToLedger}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm cursor-pointer"
          >
            ترحيل مسير الرواتب والضمان إلى اليومية والأستاذ العام
          </button>
        </div>

        {/* Employees & Payroll Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
            كشف الموظفين ومسير الرواتب والاقتطاعات الشهرية (دينار أردني)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500">
                  <th className="p-2.5">الرقم الوظيفي</th>
                  <th className="p-2.5">اسم الموظف</th>
                  <th className="p-2.5">المسمى الوظيفي</th>
                  <th className="p-2.5">الراتب الإجمالي</th>
                  <th className="p-2.5">حصة الموظف ضمان (7.5%)</th>
                  <th className="p-2.5">حصة الشركة ضمان (14.25%)</th>
                  <th className="p-2.5">صافي الراتب المحول</th>
                  <th className="p-2.5">رصيد الإجازات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {[
                  { id: 'EMP-101', name: 'م. طارق الكيلاني', role: 'المدير المالي (CFO)', gross: 2400, leaves: '18 يوماً' },
                  { id: 'EMP-102', name: 'أ. سامر المجالي', role: 'محاسب رئيسي', gross: 1650, leaves: '14 يوماً' },
                  { id: 'EMP-103', name: 'أ. ريم العبداللات', role: 'مسؤولة الموارد البشرية', gross: 1350, leaves: '12 يوماً' },
                  { id: 'EMP-104', name: 'م. ليث النسور', role: 'مهندس أنظمة فوترة', gross: 1800, leaves: '10 أيام' },
                  { id: 'EMP-105', name: 'أ. دانا الزعبي', role: 'محاسبة ذمم وتحصيل', gross: 1300, leaves: '14 يوماً' },
                ].map((emp) => {
                  const empSsc = +(emp.gross * 0.075).toFixed(3);
                  const coSsc = +(emp.gross * 0.1425).toFixed(3);
                  const netPay = +(emp.gross - empSsc).toFixed(3);
                  return (
                    <tr key={emp.id}>
                      <td className="p-2.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">{emp.id}</td>
                      <td className="p-2.5 font-bold text-slate-900 dark:text-white">{emp.name}</td>
                      <td className="p-2.5 text-slate-500">{emp.role}</td>
                      <td className="p-2.5 font-mono font-semibold">{emp.gross.toFixed(3)}</td>
                      <td className="p-2.5 font-mono text-rose-600 dark:text-rose-400">{empSsc.toFixed(3)}</td>
                      <td className="p-2.5 font-mono text-amber-600 dark:text-amber-400">{coSsc.toFixed(3)}</td>
                      <td className="p-2.5 font-mono font-extrabold text-emerald-700 dark:text-emerald-400">{netPay.toFixed(3)}</td>
                      <td className="p-2.5 font-bold">{emp.leaves}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Interactive SSC Calculator */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-5 space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              حاسبة اشتراكات الضمان الاجتماعي الأردني (سقف 2026: 3,742 د.أ)
            </h3>
            <div className="space-y-2 text-xs">
              <label className="block font-bold text-slate-600 dark:text-slate-400">الأجر الشهري الإجمالي للموظف (د.أ)</label>
              <input
                type="number"
                min={290}
                value={empGrossWage}
                onChange={(e) => setEmpGrossWage(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 font-mono"
              />
              <label className="flex items-center gap-2 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isHazardousJob}
                  onChange={(e) => setIsHazardousJob(e.target.checked)}
                />
                <span className="font-bold">مهنة خطرة (+1% إضافية تتحملها المنشأة لتصبح 15.25%)</span>
              </label>
            </div>
          </div>

          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <div className="text-slate-500">الأجر الخاضع للضمان</div>
              <div className="text-base font-extrabold font-mono mt-1">{cappedWage.toFixed(3)} د.أ</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <div className="text-slate-500">اقتطاع الموظف (7.5%)</div>
              <div className="text-base font-extrabold font-mono text-rose-600 dark:text-rose-400 mt-1">{empSscShare.toFixed(3)} د.أ</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <div className="text-slate-500">مساهمة المنشأة ({isHazardousJob ? '15.25%' : '14.25%'})</div>
              <div className="text-base font-extrabold font-mono text-amber-600 dark:text-amber-400 mt-1">{compSscShare.toFixed(3)} د.أ</div>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <div className="font-bold text-emerald-700 dark:text-emerald-300">إجمالي التوريد للضمان</div>
              <div className="text-base font-extrabold font-mono text-emerald-700 dark:text-emerald-300 mt-1">{totalSsc.toFixed(3)} د.أ</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // 4. CFO DASHBOARD, FORECASTS & INVESTOR / BANK PDF REPORT (لوحة المدير المالي)
  // ============================================================================
  if (sectionId === 'ana-cfo' || sectionId === 'ana-forecasts') {
    const cfoChartData = [
      { month: 'يناير', المبيعات: 42000, السيولة: 68000, الربحية: 12400, الضرائب: 4100, التدفقات: 15200 },
      { month: 'فبراير', المبيعات: 46500, السيولة: 74200, الربحية: 14100, الضرائب: 4650, التدفقات: 17900 },
      { month: 'مارس', المبيعات: 51200, السيولة: 81500, الربحية: 16800, الضرائب: 5120, التدفقات: 21400 },
      { month: 'أبريل (متوقع)', المبيعات: 55800, السيولة: 89400, الربحية: 18900, الضرائب: 5600, التدفقات: 24100 },
      { month: 'مايو (متوقع)', المبيعات: 60400, السيولة: 96800, الربحية: 21200, الضرائب: 6150, التدفقات: 27300 },
      { month: 'يونيو (متوقع)', المبيعات: 66000, السيولة: 105200, الربحية: 24500, الضرائب: 6800, التدفقات: 31000 },
    ];

    return (
      <div className="space-y-6">
        {bannerMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 flex items-center gap-3 text-xs font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>{bannerMsg}</span>
          </div>
        )}

        {/* Header with Investor & Bank PDF Report Trigger */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-lg flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold mb-2">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>لوحة المدير المالي التنفيذية (CFO Dashboard) وتقارير المستثمرين والبنوك</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold">
              السيولة · الربحية · المبيعات · الضرائب · المخاطر · التدفقات النقدية
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              تحليل مالي تنفيذي متكامل مرتبط بدفتر الأستاذ العام مع إمكانية توليد ملف تقرير رسمي لتقديمه للبنوك التجارية والمستثمرين.
            </p>
          </div>
          <button
            onClick={handleExportInvestorPdf}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer shrink-0"
          >
            <Printer className="w-4 h-4" />
            <span>تصدير تقرير المستثمرين والبنوك (PDF)</span>
          </button>
        </div>

        {/* 6 CFO Dimensions KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            {
              title: 'السيولة النقدية',
              value: `${cycleData.balanceSheet.cashAndBanksJod} د.أ`,
              sub: 'Quick Ratio: 1.48x',
            },
            {
              title: 'الربحية الصافية',
              value: `${cycleData.incomeStatement.netIncomeAfterTaxJod} د.أ`,
              sub: 'ROE: 25.83% · ROA: 18.03%',
            },
            {
              title: 'صافي المبيعات',
              value: `${cycleData.incomeStatement.totalRevenueJod} د.أ`,
              sub: 'نمو ربعي +14.2%',
            },
            {
              title: 'الضرائب المستحقة',
              value: `${cycleData.taxIntegrationSummary.netGstPayableToIstdJod} د.أ`,
              sub: 'صافي ضريبة المبيعات لـ ISTD',
            },
            {
              title: 'درجة المخاطر',
              value: 'منخفضة (AA)',
              sub: 'امتثال ضريبي 92%',
            },
            {
              title: 'التدفقات النقدية',
              value: `${cycleData.cashFlowStatement.closingCashBalanceJod} د.أ`,
              sub: 'تغطية خدمة الدين 3.4x',
            },
          ].map((kpi) => (
            <div
              key={kpi.title}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm"
            >
              <div className="text-[11px] font-bold text-slate-500">{kpi.title}</div>
              <div className="text-base font-extrabold font-mono text-slate-900 dark:text-white mt-1">{kpi.value}</div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">{kpi.sub}</div>
            </div>
          ))}
        </div>

        {/* Interactive Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              منحنى السيولة والمبيعات والتدفقات النقدية (فعلي + تنبؤات الأشهر القادمة)
            </h3>
            <div className="space-y-3 text-xs">
              {cfoChartData.map((row) => {
                const liqPct = Math.min(100, Math.round((row.السيولة / 110000) * 100));
                const salesPct = Math.min(100, Math.round((row.المبيعات / 110000) * 100));
                return (
                  <div key={row.month} className="space-y-1">
                    <div className="flex items-center justify-between font-bold">
                      <span>{row.month}</span>
                      <span className="font-mono text-[11px] text-slate-500">
                        السيولة: {row.السيولة.toLocaleString('en-US')} د.أ | المبيعات: {row.المبيعات.toLocaleString('en-US')} د.أ
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex gap-0.5">
                      <div
                        className="h-full bg-emerald-500 rounded-r-full"
                        style={{ width: `${liqPct}%` }}
                      />
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-sky-500 rounded-r-full"
                        style={{ width: `${salesPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              تحليل الربحية الصافية مقابل الالتزامات الضريبية الشهرية (دينار أردني)
            </h3>
            <div className="space-y-3 text-xs">
              {cfoChartData.map((row) => {
                const profPct = Math.min(100, Math.round((row.الربحية / 26000) * 100));
                const taxPct = Math.min(100, Math.round((row.الضرائب / 26000) * 100));
                return (
                  <div key={row.month} className="space-y-1">
                    <div className="flex items-center justify-between font-bold">
                      <span>{row.month}</span>
                      <span className="font-mono text-[11px] text-slate-500">
                        الربحية: {row.الربحية.toLocaleString('en-US')} د.أ | الضرائب: {row.الضرائب.toLocaleString('en-US')} د.أ
                      </span>
                    </div>
                    <div className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-8 h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${profPct}%` }} />
                      </div>
                      <div className="col-span-4 h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${taxPct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Investor & Bank Formal Credit Pack Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                تقرير الجدارة الائتمانية والاستثمارية المعتمد (Investor & Bank Readiness Dossier)
              </span>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
                ملخص التقرير الرسمي للمستثمرين والبنوك الأردنية
              </h2>
            </div>
            <button
              onClick={handleExportInvestorPdf}
              className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>تنزيل التقرير المالي الرسمي</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="font-extrabold text-slate-900 dark:text-white">1. الأداء المالي</div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                إجمالي الأصول {cycleData.balanceSheet.totalAssetsJod} د.أ وحقوق الملكية شاملة الأرباح{' '}
                {cycleData.balanceSheet.totalEquityJod} د.أ مع توازن محاسبي كامل.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="font-extrabold text-slate-900 dark:text-white">2. تحليل الربحية</div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                مجمل الربح {cycleData.incomeStatement.grossProfitJod} د.أ وصافي الربح بعد الضريبة والمساهمة الوطنية{' '}
                {cycleData.incomeStatement.netIncomeAfterTaxJod} د.أ.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="font-extrabold text-slate-900 dark:text-white">3. المؤشرات الرئيسية</div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                العائد على الأصول (ROA): 18.03% · العائد على حقوق الملكية (ROE): 25.83% · السيولة السريعة (Quick Ratio): 1.48x.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="font-extrabold text-slate-900 dark:text-white">4. تقييم المخاطر</div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                مخاطر ائتمانية وضريبية منخفضة مع التزام كامل بنظام الفوترة الوطني الإلكتروني JoFotara ومخصصات الضمان.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
              <div className="font-extrabold text-emerald-800 dark:text-emerald-300">5. التوصيات الائتمانية</div>
              <p className="text-emerald-700 dark:text-emerald-300 leading-relaxed">
                المنشأة مؤهلة للحصول على تسهيلات تمويل رأس مال عامل لغاية 150,000 د.أ بضمان التدفقات النقدية التشغيلية.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // 5. DOCUMENTS VAULT, DECISION LOG, RBAC & SUBSCRIPTION PLANS
  // ============================================================================
  if (
    sectionId === 'doc-contracts' ||
    sectionId === 'doc-licenses' ||
    sectionId === 'doc-authorizations' ||
    sectionId === 'doc-archive'
  ) {
    return (
      <div className="space-y-6">
        {bannerMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 flex items-center gap-3 text-xs font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>{bannerMsg}</span>
          </div>
        )}

        {/* Expiry Alert Banner */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-500 shrink-0" />
            <div className="text-xs">
              <span className="font-extrabold text-amber-800 dark:text-amber-200">
                تنبيه انتهاء صلاحية الوثائق الرسمية:
              </span>{' '}
              <span className="text-slate-700 dark:text-slate-300">
                تبقى 30 يوماً على انتهاء رخصة المهن الصادرة عن أمانة عمّان الكبرى وكتاب تفويض التوقيع البنكي والضريبي.
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] font-bold">
            تنبيه استباقي آلي (30 يوماً)
          </span>
        </div>

        {/* Electronic Document Vault (الخزنة الإلكترونية) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-emerald-600" />
                <span>إدارة الوثائق والخزنة الإلكترونية للمنشأة (السجل التجاري · الرخصة · الضريبة · العقود · التفويضات)</span>
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {vaultDocs.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-bold text-slate-800 dark:text-slate-200">
                    {doc.category}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded font-bold ${
                      doc.status === 'ينتهي قريباً'
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                        : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {doc.status === 'ينتهي قريباً' ? `تبقى ${doc.daysRemaining} يوماً` : 'ساري المفعول'}
                  </span>
                </div>
                <div className="font-extrabold text-slate-900 dark:text-white">{doc.title}</div>
                <div className="font-mono text-slate-500">رقم الوثيقة: {doc.docNumber}</div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-500">
                  <span>تاريخ الإصدار: {doc.issueDate}</span>
                  <span>الانتهاء: {doc.expiryDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Decision Log (سجل القرارات الإدارية والمالية) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>سجل القرارات المالية والضريبية (Decision Log — من قام بها؟ متى؟ لماذا؟)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                توثيق رسمي غير قابل للإنكار لجميع القرارات الاستراتيجية داخل الشركة لأغراض الحوكمة ومجلس الإدارة والتدقيق الخارجي.
              </p>
            </div>
          </div>

          <form onSubmit={handleAddDecision} className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
            <input
              type="text"
              value={newDecTitle}
              onChange={(e) => setNewDecTitle(e.target.value)}
              placeholder="عنوان القرار (مثال: تم اعتماد ميزانية الربع الثالث / تم تعديل الرواتب)"
              className="md:col-span-4 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700"
            />
            <input
              type="text"
              value={newDecActor}
              onChange={(e) => setNewDecActor(e.target.value)}
              placeholder="من اتخذ القرار؟ (الاسم والمنصب)"
              className="md:col-span-3 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700"
            />
            <input
              type="text"
              value={newDecReason}
              onChange={(e) => setNewDecReason(e.target.value)}
              placeholder="لماذا؟ (المبرر المالي أو القانوني)"
              className="md:col-span-3 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700"
            />
            <button
              type="submit"
              className="md:col-span-2 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
            >
              + توثيق القرار
            </button>
          </form>

          <div className="space-y-3">
            {decisionLog.map((d) => (
              <div
                key={d.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{d.id}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold text-[11px]">
                      {d.impactTag}
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-white text-sm">{d.title}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">
                    <strong>السبب والمبرر:</strong> {d.reason}
                  </p>
                </div>
                <div className="text-left sm:shrink-0 space-y-0.5 text-[11px] text-slate-500">
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    من قام به: {d.actorName} ({d.actorRole})
                  </div>
                  <div>متى: {d.dateTime}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Multi-User Role-Based Access Control (RBAC) & 3 Subscription Plans */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* RBAC Matrix */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>نظام الصلاحيات وتعدد المستخدمين (RBAC)</span>
            </h3>
            <div className="space-y-2 text-xs">
              {[
                { role: 'المالك / المفوض بالتوقيع', access: 'صلاحية كاملة + اعتماد الميزانية + تفويض الإقرارات' },
                { role: 'المدير المالي (CFO)', access: 'اعتماد القيود + لوحة المدير المالي + تقارير البنوك' },
                { role: 'المحاسب الرئيسي', access: 'إصدار الفواتير والسندات + قيود اليومية + التسويات' },
                { role: 'المدقق الخارجي (JCPA)', access: 'قراءة فقط + تصدير ملف SAF-T + فحص سجل القرارات' },
              ].map((r) => (
                <div
                  key={r.role}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800"
                >
                  <div className="font-bold text-slate-900 dark:text-white">{r.role}</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">{r.access}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 3 Subscription Tiers (مجاني / احترافي / شركات) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-500" />
              <span>باقات الاشتراك المعتمدة في المنصة (مجاني · احترافي · شركات)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="font-extrabold text-sm text-slate-900 dark:text-white">الباقة المجانية</div>
                <div className="text-lg font-black font-mono text-slate-900 dark:text-white">0 د.أ / شهرياً</div>
                <ul className="space-y-1 text-slate-600 dark:text-slate-400 text-[11px]">
                  <li>✓ الحاسبات الضريبية والضمان</li>
                  <li>✓ المكتبة القانونية الأردنية</li>
                  <li>✓ بعض الأدوات الإرشادية</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/10 border-2 border-emerald-500 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-emerald-700 dark:text-emerald-300">الباقة الاحترافية</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold">مفعلة حالياً</span>
                </div>
                <div className="text-lg font-black font-mono text-slate-900 dark:text-white">35 د.أ / شهرياً</div>
                <ul className="space-y-1 text-slate-700 dark:text-slate-300 text-[11px]">
                  <li>✓ الفواتير والسندات وJoFotara</li>
                  <li>✓ الدورة المحاسبية والتقارير</li>
                  <li>✓ مركز الامتثال الضريبي والتخزين</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="font-extrabold text-sm text-slate-900 dark:text-white">باقة الشركات (Enterprise)</div>
                <div className="text-lg font-black font-mono text-slate-900 dark:text-white">95 د.أ / شهرياً</div>
                <ul className="space-y-1 text-slate-600 dark:text-slate-400 text-[11px]">
                  <li>✓ مستخدمون متعددون وصلاحيات</li>
                  <li>✓ تقارير المستثمرين والبنوك المتقدمة</li>
                  <li>✓ ربط برمجي مباشر (API)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // 6. JORDAN SMART LAW CENTER, FAQ & JORDAN BUSINESS ADVISOR (المساعدة)
  // ============================================================================
  const filteredLaws = JORDAN_LAWS_DATABASE.filter((item) => {
    const matchesCat = selectedLawCat === 'ALL' || item.lawCategory === selectedLawCat;
    const matchesText =
      !lawSearch.trim() ||
      item.title.includes(lawSearch) ||
      item.officialSummary.includes(lawSearch) ||
      item.practicalInterpretation.includes(lawSearch) ||
      item.articleNumber.includes(lawSearch);
    return matchesCat && matchesText;
  });

  const advisorPresets = [
    {
      q: 'كيف أسجل شركتي في الأردن وما المتطلبات الضريبية الأولى؟',
      a: 'لتسجيل شركة في الأردن (مثل ذ.م.م): 1) تقديم طلب التسجيل الإلكتروني لدى دائرة مراقبة الشركات والحصول على السجل التجاري والرقم الوطني للمنشأة. 2) فتح ملف ضريبي لدى دائرة ضريبة الدخل والمبيعات والتسجيل في نظام الفوترة الوطني الإلكتروني (JoFotara). 3) إصدار رخصة المهن من أمانة عمّان أو البلدية المختصة. 4) تسجيل المنشأة والموظفين في المؤسسة العامة للضمان الاجتماعي خلال 30 يوماً من مباشرة العمل.',
    },
    {
      q: 'ما ضريبة المبيعات في الأردن ومتى يصبح التسجيل إلزامياً؟',
      a: 'النسبة العامة لضريبة المبيعات في الأردن هي (16%) على السلع والخدمات الخاضعة، وتوجد نسب مخفضة (4% و10%) وسلع وخدمات خاضعة لنسبة الصفر أو معفاة. يُلزم المكلف بالتسجيل في شبكة ضريبة المبيعات عند بلوغ مبيعاته السنوية حد التسجيل القانوني (30,000 د.أ للخدمات، 75,000 د.أ للتجارة، 50,000 د.أ للصناعة) وتُقدم الإقرارات كل شهرين.',
    },
    {
      q: 'كم اشتراك الضمان الاجتماعي في الأردن لعام 2026؟',
      a: 'إجمالي نسبة اشتراك الضمان الاجتماعي هو (21.75%) من الأجر الخاضع للاقتطاع، موزعة بواقع (7.5%) تُقتطع من راتب الموظف، و(14.25%) تتحملها الشركة (وتصبح 15.25% للمهن الخطرة). الحد الأدنى للأجر الخاضع هو 290 د.أ والسقف الأعلى للأجر الخاضع لعام 2026 هو 3,742 د.أ.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Jordan Business Advisor (المساعد الذكي المتخصص بالأردن) */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-extrabold">مساعد الأعمال الذكي المتخصص بالتشريعات الأردنية</h1>
          </div>
          <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
            هذه معلومات إرشادية ولا تعتبر استشارة قانونية أو ضريبية معتمدة.
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {advisorPresets.map((item, idx) => (
            <button
              key={item.q}
              onClick={() => {
                setSelectedPresetQ(idx);
                setAdvisorQuery(item.q);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                selectedPresetQ === idx
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {item.q}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={advisorQuery}
            onChange={(e) => setAdvisorQuery(e.target.value)}
            placeholder="اكتب سؤالك هنا (مثال: كيف أسجل شركتي؟ ما ضريبة المبيعات؟ كم اشتراك الضمان؟)..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
          />
          <button
            type="button"
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>اسأل المساعد</span>
          </button>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2 text-xs leading-relaxed">
          <div className="font-bold text-emerald-400">
            الإجابة الإرشادية حول: «{advisorPresets[selectedPresetQ].q}»
          </div>
          <p className="text-slate-200">{advisorPresets[selectedPresetQ].a}</p>
          <div className="pt-2 border-t border-slate-800 text-[11px] text-amber-300 font-semibold">
            تنبيه قانوني: هذه معلومات إرشادية ولا تعتبر استشارة قانونية أو ضريبية معتمدة.
          </div>
        </div>
      </div>

      {/* Smart Jordan Laws Center (مركز قوانين الأردن الذكي) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>مركز قوانين الأردن الذكي (بحث فوري + تفسير عملي لكل مادة)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              يغطي قانون ضريبة الدخل · قانون الشركات · قانون العمل · قانون الضمان الاجتماعي مع الأمثلة المحاسبية العملية.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {['ALL', 'قانون ضريبة الدخل', 'قانون الشركات', 'قانون العمل', 'قانون الضمان'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedLawCat(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                  selectedLawCat === cat
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {cat === 'ALL' ? 'جميع القوانين (5)' : cat}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
          <input
            type="text"
            value={lawSearch}
            onChange={(e) => setLawSearch(e.target.value)}
            placeholder="ابحث داخل مواد القوانين والتفسيرات العملية (مثال: إعفاء، ضمان، JoFotara، احتياطي إجباري، إجازات)..."
            className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs"
          />
        </div>

        <div className="space-y-4">
          {filteredLaws.map((law) => (
            <div
              key={law.id}
              className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold">
                  {law.lawCategory}
                </span>
                <span className="font-mono text-slate-500 font-bold">{law.articleNumber}</span>
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{law.title}</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                <strong>ملخص النص التشريعي:</strong> {law.officialSummary}
              </p>
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-200 leading-relaxed">
                <strong>التفسير العملي للمحاسب وصاحب العمل:</strong> {law.practicalInterpretation}
              </div>
              <div className="text-slate-500 dark:text-slate-400">
                <strong>{law.exampleCase}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
