import React, { useState } from 'react';
import {
  Building2,
  FileSpreadsheet,
  UserCheck,
  Upload,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  UserPlus,
  LogIn,
} from 'lucide-react';
import { SystemGovernanceService } from '../../services/governance/SystemGovernanceService';

export const ENTITY_TYPES = [
  'مؤسسة فردية',
  'شركة ذات مسؤولية محدودة',
  'شركة تضامن',
  'شركة مساهمة خاصة',
  'شركة مساهمة عامة',
  'جمعية',
  'منظمة غير ربحية',
  'أخرى',
] as const;

export const TAX_REGISTRATION_STATUSES = ['مسجل ضريبياً', 'غير مسجل ضريبياً', 'قيد التسجيل'] as const;
export const REGISTERED_TAX_TYPES = ['ضريبة الدخل', 'ضريبة المبيعات', 'ضريبة خاصة', 'ضرائب أخرى'] as const;
export const RETURN_PERIODICITIES = ['شهري', 'ربع سنوي', 'سنوي'] as const;
export const SALES_TAX_STATUSES = ['مسجل', 'غير مسجل', 'معفى'] as const;

export const OWNER_LEGAL_ROLES = [
  'مالك منشأة فردية',
  'شريك',
  'شريك مدير',
  'رئيس مجلس إدارة',
  'مساهم',
  'مالك فعلي',
] as const;

export const AUTHORIZED_POSITIONS = [
  'مدير عام',
  'مدير مالي',
  'مدير تنفيذي',
  'شريك مدير',
  'مالك المنشأة',
  'رئيس مجلس إدارة',
  'أخرى',
] as const;

export const AUTHORIZED_PERMISSIONS = [
  'إدارة الحسابات',
  'إدارة المستخدمين',
  'اعتماد الفواتير',
  'تقديم الإقرارات الضريبية',
  'إدارة الملفات القانونية',
  'إدارة الرواتب',
  'التوقيع الإلكتروني',
  'الاطلاع على التقارير',
] as const;

export const SUPPORTING_DOCUMENTS = [
  { key: 'crnDoc', label: 'إرفاق السجل التجاري' },
  { key: 'taxCertDoc', label: 'إرفاق شهادة التسجيل الضريبي' },
  { key: 'authDoc', label: 'إرفاق وثيقة التفويض أو الوكالة' },
  { key: 'ownerIdDoc', label: 'إرفاق الهوية الشخصية للمالك' },
  { key: 'authIdDoc', label: 'إرفاق هوية المفوض بالتوقيع' },
] as const;

export default function CompanyAndTaxProfileForms() {
  const [activeStepTab, setActiveStepTab] = useState<'company' | 'tax' | 'owner-auth' | 'account-auth'>('company');

  // --- Form 1: Company Data Form State (نموذج بيانات الشركة) ---
  const [legalName, setLegalName] = useState<string>('شركة الرواد للصناعات والتجارة ذ.م.م');
  const [tradeName, setTradeName] = useState<string>('الرواد للتجارة والحلول الصناعية');
  const [entityType, setEntityType] = useState<string>('شركة ذات مسؤولية محدودة');
  const [crnNumber, setCrnNumber] = useState<string>('48921');
  const [nationalIdNumber, setNationalIdNumber] = useState<string>('2001584920');
  const [economicSector, setEconomicSector] = useState<string>('الصناعات التحويلية والتجارة العامة');
  const [incorporationDate, setIncorporationDate] = useState<string>('2020-03-15');
  const [employeesCount, setEmployeesCount] = useState<string>('28');
  const [mainAddress, setMainAddress] = useState<string>('عمّان - العبدلي - شارع مكة');
  const [officialEmail, setOfficialEmail] = useState<string>('info@alrowad-example.jo');
  const [phoneNumber, setPhoneNumber] = useState<string>('0795544332');
  const [websiteUrl, setWebsiteUrl] = useState<string>('https://alrowad-example.jo');

  // --- Form 2: Tax Profile Form State (نموذج الملف الضريبي) ---
  const [taxRegStatus, setTaxRegStatus] = useState<string>('مسجل ضريبياً');
  const [taxNumber, setTaxNumber] = useState<string>('2001584920');
  const [taxpayerNo, setTaxpayerNo] = useState<string>('9948201');
  const [taxRegDate, setTaxRegDate] = useState<string>('2020-04-01');
  const [selectedTaxTypes, setSelectedTaxTypes] = useState<string[]>(['ضريبة الدخل', 'ضريبة المبيعات']);
  const [returnPeriodicity, setReturnPeriodicity] = useState<string>('ربع سنوي');
  const [salesTaxStatus, setSalesTaxStatus] = useState<string>('مسجل');
  const [salesTaxRate, setSalesTaxRate] = useState<string>('16%');
  const [taxOfficerName, setTaxOfficerName] = useState<string>('قسم المحاسبة والامتثال الضريبي');
  const [taxEmail, setTaxEmail] = useState<string>('tax@alrowad-example.jo');
  const [taxNotes, setTaxNotes] = useState<string>(
    'الالتزام بإصدار الفواتير الإلكترونية وتقديم الإقرارات الربعية في مواعيدها.'
  );

  // --- Form 3: Owner & Authorized Signatory State (بيانات المالك والمفوض بالتوقيع والمرفقات) ---
  const [ownerFullName, setOwnerFullName] = useState<string>('أحمد عبدالكريم محمود العبدالله');
  const [ownerNationalId, setOwnerNationalId] = useState<string>('9821045892');
  const [ownerNationality, setOwnerNationality] = useState<string>('أردني');
  const [ownerBirthDate, setOwnerBirthDate] = useState<string>('1982-06-14');
  const [ownerPhone, setOwnerPhone] = useState<string>('0795544332');
  const [ownerEmail, setOwnerEmail] = useState<string>('owner@alrowad-example.jo');
  const [ownerResidenceAddress, setOwnerResidenceAddress] = useState<string>('عمّان - دابوق - شارع الملك عبدالله الثاني');
  const [ownershipPercentage, setOwnershipPercentage] = useState<string>('100%');
  const [ownerRole, setOwnerRole] = useState<string>('شريك مدير');

  const [isOwnerAuthorized, setIsOwnerAuthorized] = useState<'نعم' | 'لا'>('نعم');
  const [authFullName, setAuthFullName] = useState<string>('أحمد عبدالكريم محمود العبدالله');
  const [authNationalId, setAuthNationalId] = useState<string>('9821045892');
  const [authPosition, setAuthPosition] = useState<string>('شريك مدير');
  const [authPhone, setAuthPhone] = useState<string>('0795544332');
  const [authEmail, setAuthEmail] = useState<string>('owner@alrowad-example.jo');
  const [authDocNumber, setAuthDocNumber] = useState<string>('AUTH-JO-2026-441');
  const [authStartDate, setAuthStartDate] = useState<string>('2026-01-01');
  const [authExpiryDate, setAuthExpiryDate] = useState<string>('2027-12-31');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([
    'إدارة الحسابات',
    'اعتماد الفواتير',
    'تقديم الإقرارات الضريبية',
    'التوقيع الإلكتروني',
    'الاطلاع على التقارير',
  ]);

  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string>>({
    crnDoc: 'Commercial_Registry_2026.pdf',
    taxCertDoc: 'Tax_Registration_Cert.pdf',
  });
  const [fileUploadError, setFileUploadError] = useState<string | null>(null);

  // Legal Consent Checkboxes
  const [agreeAccuracyConsent, setAgreeAccuracyConsent] = useState<boolean>(true);
  const [agreeSensitiveDocsConsent, setAgreeSensitiveDocsConsent] = useState<boolean>(true);
  const [agreePrivacyAndProcessingConsent, setAgreePrivacyAndProcessingConsent] = useState<boolean>(true);

  // --- Validation & Feedback State ---
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorBannerMessage, setErrorBannerMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isValidJordanPhone = (phone: string) => /^07[789]\d{7}$/.test(phone.trim());
  const isValidTaxNumber = (tin: string) => /^\d{7,12}$/.test(tin.trim());

  const handleToggleIsOwnerAuthorized = (choice: 'نعم' | 'لا') => {
    setIsOwnerAuthorized(choice);
    if (choice === 'نعم') {
      setAuthFullName(ownerFullName);
      setAuthNationalId(ownerNationalId);
      setAuthPhone(ownerPhone);
      setAuthEmail(ownerEmail);
      setAuthPosition('مالك المنشأة');
    }
  };

  const handleFileSelect = (docKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
    setFileUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!['pdf', 'jpg', 'jpeg', 'png'].includes(ext)) {
      setFileUploadError('نوع الملف غير مدعوم. يرجى رفع ملف PDF أو صورة بصيغة JPG أو PNG.');
      return;
    }
    setUploadedFiles({ ...uploadedFiles, [docKey]: file.name });
  };

  const validateCompanyForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!legalName.trim()) errors.legalName = 'هذا الحقل مطلوب.';
    if (!crnNumber.trim()) errors.crnNumber = 'هذا الحقل مطلوب.';
    if (!nationalIdNumber.trim()) errors.nationalIdNumber = 'هذا الحقل مطلوب.';
    if (!officialEmail.trim()) {
      errors.officialEmail = 'هذا الحقل مطلوب.';
    } else if (!isValidEmail(officialEmail)) {
      errors.officialEmail = 'يرجى إدخال بريد إلكتروني صالح.';
    }
    if (!phoneNumber.trim()) {
      errors.phoneNumber = 'هذا الحقل مطلوب.';
    } else if (!isValidJordanPhone(phoneNumber)) {
      errors.phoneNumber = 'يرجى إدخال رقم هاتف أردني صالح.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateTaxForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!taxNumber.trim()) {
      errors.taxNumber = 'هذا الحقل مطلوب.';
    } else if (!isValidTaxNumber(taxNumber)) {
      errors.taxNumber = 'يرجى إدخال رقم ضريبي صحيح.';
    }
    if (!taxEmail.trim()) {
      errors.taxEmail = 'هذا الحقل مطلوب.';
    } else if (!isValidEmail(taxEmail)) {
      errors.taxEmail = 'يرجى إدخال بريد إلكتروني صالح.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateOwnerAndAuthForm = (): boolean => {
    setErrorBannerMessage(null);
    const errors: Record<string, string> = {};

    if (!ownerFullName.trim()) errors.ownerFullName = 'هذا الحقل مطلوب.';
    if (!ownerNationalId.trim()) errors.ownerNationalId = 'هذا الحقل مطلوب.';
    if (!ownerPhone.trim()) {
      errors.ownerPhone = 'هذا الحقل مطلوب.';
    } else if (!isValidJordanPhone(ownerPhone)) {
      errors.ownerPhone = 'يرجى إدخال رقم هاتف أردني صالح.';
    }
    if (!ownerEmail.trim()) {
      errors.ownerEmail = 'هذا الحقل مطلوب.';
    } else if (!isValidEmail(ownerEmail)) {
      errors.ownerEmail = 'يرجى إدخال بريد إلكتروني صالح.';
    }

    if (!authFullName.trim()) errors.authFullName = 'هذا الحقل مطلوب.';
    if (!authNationalId.trim()) errors.authNationalId = 'هذا الحقل مطلوب.';
    if (!authPhone.trim()) {
      errors.authPhone = 'هذا الحقل مطلوب.';
    } else if (!isValidJordanPhone(authPhone)) {
      errors.authPhone = 'يرجى إدخال رقم هاتف أردني صالح.';
    }
    if (!authEmail.trim()) {
      errors.authEmail = 'هذا الحقل مطلوب.';
    } else if (!isValidEmail(authEmail)) {
      errors.authEmail = 'يرجى إدخال بريد إلكتروني صالح.';
    }

    if (authExpiryDate) {
      const exp = new Date(authExpiryDate);
      const today = new Date('2026-11-10');
      if (exp < today) {
        errors.authExpiryDate = 'تاريخ انتهاء التفويض المدخل يشير إلى تفويض منتهي الصلاحية.';
      }
    }

    if (!agreeAccuracyConsent || !agreeSensitiveDocsConsent || !agreePrivacyAndProcessingConsent) {
      setErrorBannerMessage('يرجى استكمال جميع الحقول الإلزامية قبل المتابعة.');
      setFieldErrors(errors);
      return false;
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setErrorBannerMessage('يرجى استكمال جميع الحقول الإلزامية قبل المتابعة.');
      return false;
    }
    return true;
  };

  const handleSaveData = (mode: 'SAVE' | 'UPDATE') => {
    setStatusMessage(null);
    setErrorBannerMessage(null);
    const shortActor = ownerFullName.trim().split(' ')[0] || 'أحمد';
    if (activeStepTab === 'company') {
      if (!validateCompanyForm()) return;
      const auditEntry = SystemGovernanceService.recordAuditAction({
        actorName: shortActor,
        moduleName: 'معلومات المنشأة',
        actionLabel: mode === 'SAVE' ? 'حفظ بيانات المنشأة' : 'تعديل بيانات المنشأة ورقم السجل',
        oldValue: 'سجل تجاري سابق',
        newValue: `${legalName} (سجل: ${crnNumber})`,
      });
      setStatusMessage(
        `${mode === 'SAVE' ? 'تم حفظ البيانات بنجاح.' : 'تم تحديث البيانات بنجاح.'} (${auditEntry.summarySentence})`
      );
    } else if (activeStepTab === 'tax') {
      if (!validateTaxForm()) return;
      const auditEntry = SystemGovernanceService.recordAuditAction({
        actorName: shortActor,
        moduleName: 'الملف الضريبي',
        actionLabel: 'تعديل الرقم الضريبي',
        oldValue: '2001584900',
        newValue: taxNumber,
      });
      setStatusMessage(
        `${mode === 'SAVE' ? 'تم حفظ البيانات بنجاح.' : 'تم تحديث البيانات بنجاح.'} (${auditEntry.summarySentence})`
      );
    } else if (activeStepTab === 'owner-auth') {
      if (!validateOwnerAndAuthForm()) return;
      const consentEntry = SystemGovernanceService.recordConsent({
        userId: `USR-JO-${ownerNationalId.slice(-6) || '982104'}`,
        userName: ownerFullName,
        ipAddress: '176.29.142.88',
        policyVersion: 'v2.4-2026.11',
        consentedPolicies: ['الخصوصية', 'الشروط', 'معالجة البيانات'],
      });
      const auditEntry = SystemGovernanceService.recordAuditAction({
        actorName: shortActor,
        moduleName: 'بيانات المالك والمفوض',
        actionLabel: 'تحديث بيانات المالك والمفوض وتوثيق الموافقة',
        oldValue: 'بيانات تفويض سابقة',
        newValue: `${authFullName} (${authDocNumber})`,
      });
      setStatusMessage(
        `تم حفظ بيانات المالك والمفوض بنجاح وتوثيق الموافقة في سجل الموافقات (${consentEntry.consentId} | IP: ${consentEntry.ipAddress} | ${consentEntry.date} ${consentEntry.time}) — ${auditEntry.summarySentence}`
      );
    }
  };

  const toggleTaxType = (tType: string) => {
    if (selectedTaxTypes.includes(tType)) {
      setSelectedTaxTypes(selectedTaxTypes.filter((item) => item !== tType));
    } else {
      setSelectedTaxTypes([...selectedTaxTypes, tType]);
    }
  };

  const togglePermission = (perm: string) => {
    if (selectedPermissions.includes(perm)) {
      setSelectedPermissions(selectedPermissions.filter((p) => p !== perm));
    } else {
      setSelectedPermissions([...selectedPermissions, perm]);
    }
  };

  return (
    <section
      id="company-tax-profile-section"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6"
    >
      {/* Header & 4-Tab Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-1">
            التسجيل المؤسسي وإدارة الملف الضريبي والتفويض القانوني
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {activeStepTab === 'company'
              ? 'معلومات المنشأة'
              : activeStepTab === 'tax'
              ? 'الملف الضريبي'
              : activeStepTab === 'owner-auth'
              ? 'بيانات المالك والمفوض بالتوقيع والمستندات الداعمة'
              : 'إنشاء حساب وتسجيل الدخول إلى المنصة'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {activeStepTab === 'company'
              ? 'يرجى إدخال بيانات المنشأة بدقة للاستفادة من خدمات المحاسبة والامتثال الضريبي وإدارة الفواتير الإلكترونية.'
              : activeStepTab === 'tax'
              ? 'أدخل بيانات الملف الضريبي للمنشأة لضمان إعداد الحسابات والتقارير الضريبية بصورة صحيحة.'
              : activeStepTab === 'owner-auth'
              ? 'يرجى إدخال بيانات مالك المنشأة أو الشريك الرئيسي والشخص المفوض قانونياً بتمثيل المنشأة والتوقيع على المستندات والمعاملات.'
              : 'سجّل حسابك مجاناً أو قم بتسجيل الدخول للوصول الفوري إلى أدوات المحاسبة والضرائب والفوترة الإلكترونية.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => {
              setStatusMessage(null);
              setErrorBannerMessage(null);
              setFieldErrors({});
              setActiveStepTab('company');
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              activeStepTab === 'company'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>1. معلومات المنشأة</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setStatusMessage(null);
              setErrorBannerMessage(null);
              setFieldErrors({});
              setActiveStepTab('tax');
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              activeStepTab === 'tax'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>2. الملف الضريبي</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setStatusMessage(null);
              setErrorBannerMessage(null);
              setFieldErrors({});
              setActiveStepTab('owner-auth');
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              activeStepTab === 'owner-auth'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>3. بيانات المالك والمفوض</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setStatusMessage(null);
              setErrorBannerMessage(null);
              setFieldErrors({});
              setActiveStepTab('account-auth');
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              activeStepTab === 'account-auth'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>4. حسابات المستخدمين</span>
          </button>
        </div>
      </div>

      {/* Feedback & Validation Banners */}
      {statusMessage && (
        <div className="p-3.5 bg-emerald-950/20 border border-emerald-600/40 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorBannerMessage && (
        <div className="p-3.5 bg-rose-950/20 border border-rose-600/40 rounded-xl text-xs font-bold text-rose-500 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorBannerMessage}</span>
        </div>
      )}

      {/* TAB 1: نموذج بيانات الشركة (معلومات المنشأة) */}
      {activeStepTab === 'company' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                اسم المنشأة أو الشركة
              </label>
              <input
                type="text"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                placeholder="أدخل الاسم القانوني للمنشأة"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white"
              />
              {fieldErrors.legalName && (
                <span className="text-[11px] text-rose-500 mt-1 block">{fieldErrors.legalName}</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                الاسم التجاري
              </label>
              <input
                type="text"
                value={tradeName}
                onChange={(e) => setTradeName(e.target.value)}
                placeholder="أدخل الاسم التجاري إن وجد"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                نوع المنشأة
              </label>
              <select
                value={entityType}
                onChange={(e) => setEntityType(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white"
              >
                {ENTITY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                رقم السجل التجاري
              </label>
              <input
                type="text"
                value={crnNumber}
                onChange={(e) => setCrnNumber(e.target.value)}
                placeholder="أدخل رقم السجل التجاري"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white"
              />
              {fieldErrors.crnNumber && (
                <span className="text-[11px] text-rose-500 mt-1 block">{fieldErrors.crnNumber}</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                الرقم الوطني
              </label>
              <input
                type="text"
                value={nationalIdNumber}
                onChange={(e) => setNationalIdNumber(e.target.value)}
                placeholder="أدخل الرقم الوطني للمنشأة"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white"
              />
              {fieldErrors.nationalIdNumber && (
                <span className="text-[11px] text-rose-500 mt-1 block">{fieldErrors.nationalIdNumber}</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                النشاط الاقتصادي
              </label>
              <input
                type="text"
                value={economicSector}
                onChange={(e) => setEconomicSector(e.target.value)}
                placeholder="اختر النشاط الرئيسي للمنشأة"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                تاريخ التأسيس
              </label>
              <input
                type="date"
                value={incorporationDate}
                onChange={(e) => setIncorporationDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                عدد الموظفين
              </label>
              <input
                type="number"
                min={0}
                value={employeesCount}
                onChange={(e) => setEmployeesCount(e.target.value)}
                placeholder="أدخل عدد الموظفين الحالي"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                العنوان الرئيسي
              </label>
              <input
                type="text"
                value={mainAddress}
                onChange={(e) => setMainAddress(e.target.value)}
                placeholder="المدينة - المنطقة - الشارع"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                البريد الإلكتروني للمنشأة
              </label>
              <input
                type="email"
                dir="ltr"
                value={officialEmail}
                onChange={(e) => setOfficialEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white"
              />
              {fieldErrors.officialEmail && (
                <span className="text-[11px] text-rose-500 mt-1 block">{fieldErrors.officialEmail}</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                رقم الهاتف
              </label>
              <input
                type="tel"
                dir="ltr"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="07XXXXXXXX"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white"
              />
              {fieldErrors.phoneNumber && (
                <span className="text-[11px] text-rose-500 mt-1 block">{fieldErrors.phoneNumber}</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                الموقع الإلكتروني
              </label>
              <input
                type="url"
                dir="ltr"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => handleSaveData('SAVE')}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition cursor-pointer whitespace-nowrap"
            >
              حفظ البيانات
            </button>
            <button
              type="button"
              onClick={() => handleSaveData('UPDATE')}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer whitespace-nowrap"
            >
              تحديث البيانات
            </button>
            <button
              type="button"
              onClick={() => {
                if (validateCompanyForm()) setActiveStepTab('tax');
              }}
              className="px-5 py-2.5 border border-emerald-600/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
            >
              <span>التالي</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: نموذج الملف الضريبي (الملف الضريبي) */}
      {activeStepTab === 'tax' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                حالة التسجيل الضريبي
              </label>
              <select
                value={taxRegStatus}
                onChange={(e) => setTaxRegStatus(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white"
              >
                {TAX_REGISTRATION_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                الرقم الضريبي
              </label>
              <input
                type="text"
                value={taxNumber}
                onChange={(e) => setTaxNumber(e.target.value)}
                placeholder="أدخل الرقم الضريبي"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white"
              />
              {fieldErrors.taxNumber && (
                <span className="text-[11px] text-rose-500 mt-1 block">{fieldErrors.taxNumber}</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                رقم المكلف
              </label>
              <input
                type="text"
                value={taxpayerNo}
                onChange={(e) => setTaxpayerNo(e.target.value)}
                placeholder="أدخل رقم المكلف الضريبي"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                تاريخ التسجيل الضريبي
              </label>
              <input
                type="date"
                value={taxRegDate}
                onChange={(e) => setTaxRegDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                دورية تقديم الإقرار
              </label>
              <select
                value={returnPeriodicity}
                onChange={(e) => setReturnPeriodicity(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white"
              >
                {RETURN_PERIODICITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                التسجيل في ضريبة المبيعات
              </label>
              <select
                value={salesTaxStatus}
                onChange={(e) => setSalesTaxStatus(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white"
              >
                {SALES_TAX_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                نسبة ضريبة المبيعات
              </label>
              <input
                type="text"
                value={salesTaxRate}
                onChange={(e) => setSalesTaxRate(e.target.value)}
                placeholder="مثال: 16%"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                اسم المسؤول الضريبي
              </label>
              <input
                type="text"
                value={taxOfficerName}
                onChange={(e) => setTaxOfficerName(e.target.value)}
                placeholder="أدخل اسم المحاسب أو المسؤول المختص"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                البريد الإلكتروني الضريبي
              </label>
              <input
                type="email"
                dir="ltr"
                value={taxEmail}
                onChange={(e) => setTaxEmail(e.target.value)}
                placeholder="tax@company.com"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white"
              />
              {fieldErrors.taxEmail && (
                <span className="text-[11px] text-rose-500 mt-1 block">{fieldErrors.taxEmail}</span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              أنواع الضرائب المسجلة
            </label>
            <div className="flex flex-wrap gap-3">
              {REGISTERED_TAX_TYPES.map((tType) => {
                const isChecked = selectedTaxTypes.includes(tType);
                return (
                  <label
                    key={tType}
                    onClick={() => toggleTaxType(tType)}
                    className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 cursor-pointer transition ${
                      isChecked
                        ? 'bg-emerald-500/10 border-emerald-600 text-emerald-600 dark:text-emerald-400'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="w-3.5 h-3.5 accent-emerald-600 rounded"
                    />
                    <span>{tType}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              ملاحظات أو استثناءات ضريبية
            </label>
            <textarea
              rows={2}
              value={taxNotes}
              onChange={(e) => setTaxNotes(e.target.value)}
              placeholder="أدخل أي معلومات أو ملاحظات مهمة"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => handleSaveData('SAVE')}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition cursor-pointer whitespace-nowrap"
            >
              حفظ البيانات
            </button>
            <button
              type="button"
              onClick={() => handleSaveData('UPDATE')}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer whitespace-nowrap"
            >
              تحديث البيانات
            </button>
            <button
              type="button"
              onClick={() => {
                if (validateTaxForm()) setActiveStepTab('owner-auth');
              }}
              className="px-5 py-2.5 border border-emerald-600/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
            >
              <span>التالي</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-4 bg-amber-950/15 border border-amber-700/40 rounded-xl text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2.5 leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p>
              يتحمل المستخدم مسؤولية صحة البيانات المدخلة. وتستخدم هذه المعلومات لأغراض المعالجة المحاسبية والضريبية داخل المنصة، ولا تشكل بحد ذاتها إقراراً ضريبياً رسمياً أو مستنداً معتمداً لدى أي جهة حكومية.
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: نموذج بيانات المالك + المفوض بالتوقيع + المستندات الداعمة */}
      {activeStepTab === 'owner-auth' && (
        <div className="space-y-8">
          {/* القسم أ: بيانات المالك */}
          <div className="p-5 bg-slate-50/70 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">بيانات المالك</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                يرجى إدخال بيانات مالك المنشأة أو الشريك الرئيسي كما هي مسجلة في الوثائق الثبوتية.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  الاسم الكامل
                </label>
                <input
                  type="text"
                  value={ownerFullName}
                  onChange={(e) => {
                    setOwnerFullName(e.target.value);
                    if (isOwnerAuthorized === 'نعم') setAuthFullName(e.target.value);
                  }}
                  placeholder="أدخل الاسم الرباعي"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white"
                />
                {fieldErrors.ownerFullName && (
                  <span className="text-[11px] text-rose-500 mt-1 block">{fieldErrors.ownerFullName}</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  الرقم الوطني
                </label>
                <input
                  type="text"
                  value={ownerNationalId}
                  onChange={(e) => {
                    setOwnerNationalId(e.target.value);
                    if (isOwnerAuthorized === 'نعم') setAuthNationalId(e.target.value);
                  }}
                  placeholder="أدخل الرقم الوطني"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white"
                />
                {fieldErrors.ownerNationalId && (
                  <span className="text-[11px] text-rose-500 mt-1 block">{fieldErrors.ownerNationalId}</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  الجنسية
                </label>
                <input
                  type="text"
                  value={ownerNationality}
                  onChange={(e) => setOwnerNationality(e.target.value)}
                  placeholder="اختر الجنسية"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  تاريخ الميلاد
                </label>
                <input
                  type="date"
                  value={ownerBirthDate}
                  onChange={(e) => setOwnerBirthDate(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  رقم الهاتف الشخصي
                </label>
                <input
                  type="tel"
                  dir="ltr"
                  value={ownerPhone}
                  onChange={(e) => {
                    setOwnerPhone(e.target.value);
                    if (isOwnerAuthorized === 'نعم') setAuthPhone(e.target.value);
                  }}
                  placeholder="07XXXXXXXX"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white"
                />
                {fieldErrors.ownerPhone && (
                  <span className="text-[11px] text-rose-500 mt-1 block">{fieldErrors.ownerPhone}</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  dir="ltr"
                  value={ownerEmail}
                  onChange={(e) => {
                    setOwnerEmail(e.target.value);
                    if (isOwnerAuthorized === 'نعم') setAuthEmail(e.target.value);
                  }}
                  placeholder="name@example.com"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white"
                />
                {fieldErrors.ownerEmail && (
                  <span className="text-[11px] text-rose-500 mt-1 block">{fieldErrors.ownerEmail}</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  عنوان السكن
                </label>
                <input
                  type="text"
                  value={ownerResidenceAddress}
                  onChange={(e) => setOwnerResidenceAddress(e.target.value)}
                  placeholder="المدينة - المنطقة - الشارع"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  نسبة الملكية
                </label>
                <input
                  type="text"
                  value={ownershipPercentage}
                  onChange={(e) => setOwnershipPercentage(e.target.value)}
                  placeholder="مثال: 100%"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  صفة المالك
                </label>
                <select
                  value={ownerRole}
                  onChange={(e) => setOwnerRole(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white"
                >
                  {OWNER_LEGAL_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* القسم ب: بيانات المفوض بالتوقيع */}
          <div className="p-5 bg-slate-50/70 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">بيانات المفوض بالتوقيع</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  أدخل بيانات الشخص المفوض قانونياً بتمثيل المنشأة والتوقيع على المستندات والمعاملات.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">هل المالك هو المفوض بالتوقيع؟</span>
                <div className="flex items-center gap-1 p-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg">
                  {(['نعم', 'لا'] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleToggleIsOwnerAuthorized(opt)}
                      className={`px-3 py-1 rounded-md font-bold transition cursor-pointer ${
                        isOwnerAuthorized === opt
                          ? 'bg-emerald-600 text-white'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  اسم المفوض بالتوقيع
                </label>
                <input
                  type="text"
                  value={authFullName}
                  onChange={(e) => setAuthFullName(e.target.value)}
                  placeholder="أدخل الاسم الكامل"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white"
                />
                {fieldErrors.authFullName && (
                  <span className="text-[11px] text-rose-500 mt-1 block">{fieldErrors.authFullName}</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  الرقم الوطني للمفوض
                </label>
                <input
                  type="text"
                  value={authNationalId}
                  onChange={(e) => setAuthNationalId(e.target.value)}
                  placeholder="أدخل الرقم الوطني"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white"
                />
                {fieldErrors.authNationalId && (
                  <span className="text-[11px] text-rose-500 mt-1 block">{fieldErrors.authNationalId}</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  المنصب الوظيفي
                </label>
                <select
                  value={authPosition}
                  onChange={(e) => setAuthPosition(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white"
                >
                  {AUTHORIZED_POSITIONS.map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  رقم هاتف المفوض
                </label>
                <input
                  type="tel"
                  dir="ltr"
                  value={authPhone}
                  onChange={(e) => setAuthPhone(e.target.value)}
                  placeholder="07XXXXXXXX"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white"
                />
                {fieldErrors.authPhone && (
                  <span className="text-[11px] text-rose-500 mt-1 block">{fieldErrors.authPhone}</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  البريد الإلكتروني للمفوض
                </label>
                <input
                  type="email"
                  dir="ltr"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="authorized@example.com"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white"
                />
                {fieldErrors.authEmail && (
                  <span className="text-[11px] text-rose-500 mt-1 block">{fieldErrors.authEmail}</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  رقم التفويض أو الوكالة
                </label>
                <input
                  type="text"
                  value={authDocNumber}
                  onChange={(e) => setAuthDocNumber(e.target.value)}
                  placeholder="أدخل رقم الوثيقة إن وجد"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  تاريخ التفويض
                </label>
                <input
                  type="date"
                  value={authStartDate}
                  onChange={(e) => setAuthStartDate(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  تاريخ انتهاء التفويض
                </label>
                <input
                  type="date"
                  value={authExpiryDate}
                  onChange={(e) => setAuthExpiryDate(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white"
                />
                {fieldErrors.authExpiryDate && (
                  <span className="text-[11px] text-rose-500 mt-1 block">{fieldErrors.authExpiryDate}</span>
                )}
              </div>
            </div>

            {/* صلاحيات المفوض */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                صلاحيات المفوض
              </label>
              <div className="flex flex-wrap gap-2.5">
                {AUTHORIZED_PERMISSIONS.map((perm) => {
                  const isChecked = selectedPermissions.includes(perm);
                  return (
                    <label
                      key={perm}
                      onClick={() => togglePermission(perm)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 cursor-pointer transition ${
                        isChecked
                          ? 'bg-emerald-500/10 border-emerald-600 text-emerald-600 dark:text-emerald-400'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="w-3.5 h-3.5 accent-emerald-600 rounded"
                      />
                      <span>{perm}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* القسم ج: المستندات الداعمة (قسم المرفقات القانونية) */}
          <div className="p-5 bg-slate-50/70 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">المستندات الداعمة</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                يرجى إرفاق النسخ الثبوتية بصيغة PDF أو JPG أو PNG للتحقق من الصفة القانونية.
              </p>
            </div>

            {fileUploadError && (
              <div className="p-3 bg-rose-950/20 border border-rose-600/40 rounded-xl text-xs text-rose-500 font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{fileUploadError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {SUPPORTING_DOCUMENTS.map((doc) => (
                <div
                  key={doc.key}
                  className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between gap-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{doc.label}</span>
                    <Upload className="w-4 h-4 text-emerald-500 shrink-0" />
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileSelect(doc.key, e)}
                    className="text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-emerald-500/10 file:text-emerald-600 dark:file:text-emerald-400 cursor-pointer"
                  />
                  {uploadedFiles[doc.key] && (
                    <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 truncate">
                      ✓ {uploadedFiles[doc.key]}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* نصوص الموافقة القانونية الإلزامية */}
          <div className="space-y-3 p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <label className="flex items-start gap-3 cursor-pointer text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <input
                type="checkbox"
                checked={agreeAccuracyConsent}
                onChange={(e) => setAgreeAccuracyConsent(e.target.checked)}
                className="w-4 h-4 mt-0.5 accent-emerald-600 rounded shrink-0"
              />
              <span>
                أقر بأن جميع البيانات والمستندات المقدمة صحيحة وحديثة، وأتحمل كامل المسؤولية القانونية عن أي معلومات غير صحيحة أو غير محدثة.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <input
                type="checkbox"
                checked={agreeSensitiveDocsConsent}
                onChange={(e) => setAgreeSensitiveDocsConsent(e.target.checked)}
                className="w-4 h-4 mt-0.5 accent-emerald-600 rounded shrink-0"
              />
              <span>
                أوافق على رفع ومعالجة المستندات والوثائق التي أقوم بإرسالها عبر المنصة، وأتحمل مسؤولية صحة ملكيتها وصلاحية استخدامها، وأقر بأنني أمتلك التفويض القانوني اللازم لتقديمها.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <input
                type="checkbox"
                checked={agreePrivacyAndProcessingConsent}
                onChange={(e) => setAgreePrivacyAndProcessingConsent(e.target.checked)}
                className="w-4 h-4 mt-0.5 accent-emerald-600 rounded shrink-0"
              />
              <span>
                أقر بأنني قرأت سياسة الخصوصية وسياسة معالجة البيانات وأوافق على جمع ومعالجة وتخزين البيانات التي أقدمها لأغراض تشغيل المنصة وتقديم خدماتها، وأؤكد أن جميع البيانات المدخلة صحيحة وأن لدي الصلاحية القانونية لتقديمها.
              </span>
            </label>
          </div>

          {/* أزرار الحفظ النهائي */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleSaveData('SAVE')}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition cursor-pointer whitespace-nowrap"
            >
              حفظ البيانات
            </button>
            <button
              type="button"
              onClick={() => handleSaveData('SAVE')}
              className="px-6 py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition cursor-pointer whitespace-nowrap"
            >
              حفظ ومتابعة
            </button>
          </div>

          {/* التنويه القانوني أسفل النموذج */}
          <div className="p-4 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            تستخدم هذه البيانات للتحقق من هوية المستخدم وإدارة خدمات المنصة وتحسين الامتثال التنظيمي. لا يتم مشاركة البيانات مع أي جهة خارجية إلا وفقاً للقانون أو بناءً على موافقة صاحب البيانات أو متطلبات الجهات المختصة.
          </div>
        </div>
      )}

      {/* TAB 4: أزرار الحسابات والتسجيل وتسجيل الدخول */}
      {activeStepTab === 'account-auth' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* بطاقة إنشاء حساب جديد */}
          <div className="p-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
            <div className="flex items-center gap-2.5">
              <UserPlus className="w-5 h-5 text-emerald-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">إنشاء حساب مجاني في المنصة</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              انضم إلى منصة BizJo للأعمال والمحاسبة والامتثال الضريبي الأردنية وابدأ بإدارة حسابات منشأتك وفواتيرك الإلكترونية بدقة وسهولة.
            </p>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="الاسم الكامل أو اسم المنشأة"
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white"
              />
              <input
                type="email"
                dir="ltr"
                placeholder="name@company.com"
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white"
              />
              <label className="flex items-start gap-2.5 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed cursor-pointer">
                <input type="checkbox" defaultChecked className="w-3.5 h-3.5 mt-0.5 accent-emerald-600 rounded" />
                <span>
                  أقر بأنني قرأت سياسة الخصوصية وسياسة معالجة البيانات وأوافق على جمع ومعالجة وتخزين البيانات التي أقدمها لأغراض تشغيل المنصة وتقديم خدماتها، وأؤكد أن جميع البيانات المدخلة صحيحة وأن لدي الصلاحية القانونية لتقديمها.
                </span>
              </label>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  const cEntry = SystemGovernanceService.recordConsent({
                    userId: `USR-JO-${Math.floor(100000 + Math.random() * 900000)}`,
                    userName: ownerFullName,
                    ipAddress: '176.29.142.88',
                    policyVersion: 'v2.4-2026.11',
                    consentedPolicies: ['الخصوصية', 'الشروط', 'معالجة البيانات'],
                  });
                  setStatusMessage(
                    `تم حفظ البيانات وتوثيق الموافقة في سجل الموافقات (${cEntry.consentId} | User ID: ${cEntry.userId} | IP: ${cEntry.ipAddress} | ${cEntry.date} ${cEntry.time}).`
                  );
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                إنشاء حساب
              </button>
              <button
                type="button"
                onClick={() => {
                  const cEntry = SystemGovernanceService.recordConsent({
                    userId: `USR-JO-${Math.floor(100000 + Math.random() * 900000)}`,
                    userName: ownerFullName,
                    ipAddress: '176.29.142.88',
                    policyVersion: 'v2.4-2026.11',
                    consentedPolicies: ['الخصوصية', 'الشروط', 'معالجة البيانات'],
                  });
                  setStatusMessage(
                    `تم التسجيل وتوثيق الموافقة في سجل الموافقات (${cEntry.consentId} | User ID: ${cEntry.userId} | IP: ${cEntry.ipAddress}).`
                  );
                }}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl cursor-pointer"
              >
                التسجيل مجاناً
              </button>
              <button
                type="button"
                onClick={() => {
                  const cEntry = SystemGovernanceService.recordConsent({
                    userId: `USR-JO-${Math.floor(100000 + Math.random() * 900000)}`,
                    userName: ownerFullName,
                    ipAddress: '176.29.142.88',
                    policyVersion: 'v2.4-2026.11',
                    consentedPolicies: ['الخصوصية', 'الشروط', 'معالجة البيانات'],
                  });
                  setStatusMessage(
                    `تم تفعيل الحساب وتوثيق الموافقة (${cEntry.consentId} | Policy: ${cEntry.policyVersion}).`
                  );
                }}
                className="px-4 py-2 border border-emerald-500/50 text-emerald-600 dark:text-emerald-400 font-bold text-xs rounded-xl cursor-pointer"
              >
                ابدأ رحلتك الآن
              </button>
            </div>
          </div>

          {/* بطاقة تسجيل الدخول */}
          <div className="p-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
            <div className="flex items-center gap-2.5">
              <LogIn className="w-5 h-5 text-sky-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">تسجيل الدخول للمستخدمين</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              ادخل إلى حسابك لمتابعة التقارير المحاسبية، الإقرارات الضريبية، والفواتير الإلكترونية المحفوظة.
            </p>
            <div className="space-y-3">
              <input
                type="email"
                dir="ltr"
                placeholder="name@company.com"
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white"
              />
              <input
                type="password"
                dir="ltr"
                placeholder="••••••••••••"
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white"
              />
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStatusMessage('تم حفظ البيانات بنجاح.')}
                className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                تسجيل الدخول
              </button>
              <button
                type="button"
                onClick={() => setStatusMessage('تم حفظ البيانات بنجاح.')}
                className="px-5 py-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl cursor-pointer"
              >
                الدخول إلى حسابي
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
