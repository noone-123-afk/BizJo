import { SidebarItemId } from '../../components/erp/SimpleHomeDashboard';

export interface SeoPageMetadata {
  sectionId: SidebarItemId;
  directorySlug: string;
  directoryNameAr: string;
  pageSlug: string;
  breadcrumbLabelAr: string;
  canonicalPath: string;
  title: string; // 30-60 chars, unique & branded with BizJo + Jordan context
  metaDescription: string; // 120-160 chars, unique actionable snippet
  beginnerSearchTerms: string[];
  expertSearchTerms: string[];
  changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export const SEO_PAGE_REGISTRY: Record<SidebarItemId, SeoPageMetadata> = {
  'biz-dashboard': {
    sectionId: 'biz-dashboard',
    directorySlug: 'business',
    directoryNameAr: 'الأعمال',
    pageSlug: 'dashboard',
    breadcrumbLabelAr: 'لوحة التحكم الرئيسية',
    canonicalPath: '/business/dashboard',
    title: 'BizJo | نظام الأعمال والمحاسبة والضرائب في الأردن',
    metaDescription:
      'أدر شركتك في الأردن عبر منصة BizJo: إصدار فواتير JoFotara، قيود اليومية، القوائم المالية، والامتثال الضريبي الفوري بدقة الفلس الأردني.',
    beginnerSearchTerms: ['برنامج محاسبة للشركات في الأردن', 'نظام إدارة فواتير ومبيعات عمّان'],
    expertSearchTerms: ['منصة ERP سحابية أردنية متوافقة مع ISTD وJoFotara', 'نظام محاسبي متكامل ذ.م.م'],
    changeFrequency: 'daily',
  },
  'biz-customers': {
    sectionId: 'biz-customers',
    directorySlug: 'business',
    directoryNameAr: 'الأعمال',
    pageSlug: 'customers',
    breadcrumbLabelAr: 'العملاء والفواتير وكشوف الحساب',
    canonicalPath: '/business/customers',
    title: 'إدارة العملاء والفواتير وكشف الحساب | BizJo الأردن',
    metaDescription:
      'أصدر فواتير المبيعات، الإشعارات الدائنة والمدينة، وسندات القبض مع ترحيل آلي لكشف حساب العميل ودفتر الأستاذ العام عبر منصة BizJo.',
    beginnerSearchTerms: ['برنامج عمل فاتورة للزبون', 'كشف حساب عميل جاهز للطباعة'],
    expertSearchTerms: ['إدارة الذمم المدينة AR وأعمار الديون IFRS 9', 'إشعار دائن ومدين ضريبي أردني'],
    changeFrequency: 'daily',
  },
  'biz-vendors': {
    sectionId: 'biz-vendors',
    directorySlug: 'business',
    directoryNameAr: 'الأعمال',
    pageSlug: 'vendors',
    breadcrumbLabelAr: 'الموردون والبائعون وسندات الصرف',
    canonicalPath: '/business/vendors',
    title: 'إدارة الموردين وفواتير المشتريات (Vendors) | BizJo',
    metaDescription:
      'سجل بيانات البائعين والموردين، فواتير المشتريات، سندات الصرف، وضريبة الاقتطاع من المنبع (WHT) مع ربط مباشر بجدول الشركات والأستاذ العام.',
    beginnerSearchTerms: ['تسجيل فواتير الموردين والمصاريف', 'برنامج حسابات الموردين'],
    expertSearchTerms: ['إدارة الذمم الدائنة AP حساب 2101', 'ضريبة الاقتطاع من المنبع نموذج و/1 الأردن'],
    changeFrequency: 'daily',
  },
  'biz-contracts': {
    sectionId: 'biz-contracts',
    directorySlug: 'business',
    directoryNameAr: 'الأعمال',
    pageSlug: 'contracts',
    breadcrumbLabelAr: 'العقود وعروض الأسعار',
    canonicalPath: '/business/contracts',
    title: 'إدارة العقود وعروض الأسعار وطوابع الواردات | BizJo',
    metaDescription:
      'أنشئ عروض الأسعار والعقود التجارية في الأردن، واحتسب رسوم طوابع الواردات تلقائياً مع تحويل الدفعات مباشرة إلى فواتير وقيود يومية.',
    beginnerSearchTerms: ['نموذج عرض سعر وعقد تجاري الأردن', 'حساب رسوم طوابع العقود'],
    expertSearchTerms: ['قانون رسوم طوابع الواردات الأردني 0.003', 'فوترة دفعات العقود الدورية لليومية'],
    changeFrequency: 'weekly',
  },
  'biz-projects': {
    sectionId: 'biz-projects',
    directorySlug: 'business',
    directoryNameAr: 'الأعمال',
    pageSlug: 'projects',
    breadcrumbLabelAr: 'المشاريع ومراكز التكلفة',
    canonicalPath: '/business/projects',
    title: 'إدارة المشاريع ومراكز التكلفة والربحية | BizJo الأردن',
    metaDescription:
      'تابع نسب إنجاز المشاريع، هوامش الربح، ومراكز التكلفة للشركات الأردنية مع تقارير مالية فورية مرتبطة بدفتر الأستاذ العام.',
    beginnerSearchTerms: ['متابعة أرباح ومصاريف المشاريع', 'حساب تكلفة المشروع'],
    expertSearchTerms: ['محاسبة مراكز التكلفة ونسب الإنجاز IAS 11 / IFRS 15', 'تحليل هامش ربح العقود'],
    changeFrequency: 'weekly',
  },
  'acc-coa': {
    sectionId: 'acc-coa',
    directorySlug: 'accounting',
    directoryNameAr: 'المحاسبة',
    pageSlug: 'chart-of-accounts',
    breadcrumbLabelAr: 'دليل الحسابات (شجرة الحسابات)',
    canonicalPath: '/accounting/chart-of-accounts',
    title: 'دليل الحسابات الشجري للشركات الأردنية | BizJo ERP',
    metaDescription:
      'استعرض شجرة الحسابات القياسية للشركات الأردنية (الأصول، الالتزامات، حقوق الملكية، الإيرادات، والمصروفات) المربوطة آلياً بالقوائم المالية.',
    beginnerSearchTerms: ['شجرة حسابات شركة جاهزة', 'ترقيم الحسابات المحاسبية'],
    expertSearchTerms: ['دليل الحسابات وفق معايير IFRS والتشريعات الضريبية الأردنية', 'ربط أمانات ضريبة المبيعات 2102'],
    changeFrequency: 'monthly',
  },
  'acc-journal': {
    sectionId: 'acc-journal',
    directorySlug: 'accounting',
    directoryNameAr: 'المحاسبة',
    pageSlug: 'general-journal',
    breadcrumbLabelAr: 'دفتر قيود اليومية',
    canonicalPath: '/accounting/general-journal',
    title: 'دفتر قيود اليومية المزدوجة الآلي | BizJo المحاسبي',
    metaDescription:
      'سجل واستعرض قيود اليومية المزدوجة المتوازنة بالدينار والفلس الأردني مع تدقيق آلي لتوازن المدين والدائن وترحيل فوري للأستاذ العام.',
    beginnerSearchTerms: ['كيفية كتابة قيد يومية محاسبي', 'دفتر اليومية العام'],
    expertSearchTerms: ['قيود اليومية المزدوجة Double-Entry Journal Vouchers', 'ترحيل القيود المحاسبية آلياً'],
    changeFrequency: 'daily',
  },
  'acc-gl': {
    sectionId: 'acc-gl',
    directorySlug: 'accounting',
    directoryNameAr: 'المحاسبة',
    pageSlug: 'general-ledger',
    breadcrumbLabelAr: 'دفتر الأستاذ العام (GL)',
    canonicalPath: '/accounting/general-ledger',
    title: 'دفتر الأستاذ العام وحركة الحسابات | BizJo الأردن',
    metaDescription:
      'تتبع أرصدة وحركات جميع الحسابات في دفتر الأستاذ العام والأساتذة المساعدة للعملاء والموردين لحظة بلحظة عبر منصة BizJo.',
    beginnerSearchTerms: ['ما هو دفتر الأستاذ العام', 'معرفة رصيد الصندوق والبنك'],
    expertSearchTerms: ['حسابات الأستاذ العام T-Accounts والأرصدة التراكمية', 'مطابقة الأستاذ المساعد مع الأستاذ العام'],
    changeFrequency: 'daily',
  },
  'acc-trial-balance': {
    sectionId: 'acc-trial-balance',
    directorySlug: 'accounting',
    directoryNameAr: 'المحاسبة',
    pageSlug: 'trial-balance',
    breadcrumbLabelAr: 'ميزان المراجعة بالمجاميع والأرصدة',
    canonicalPath: '/accounting/trial-balance',
    title: 'ميزان المراجعة بالمجاميع والأرصدة المتوازن | BizJo',
    metaDescription:
      'احصل على ميزان مراجعة فوري بالمجاميع والأرصدة مع التحقق الآلي من تطابق إجمالي المدين والدائن قبل إعداد القوائم المالية الختامية.',
    beginnerSearchTerms: ['نموذج ميزان المراجعة المحاسبي', 'توازن المدين والدائن'],
    expertSearchTerms: ['ميزان المراجعة بالمجاميع والأرصدة Trial Balance', 'إقفال الحسابات الختامية'],
    changeFrequency: 'daily',
  },
  'acc-statements': {
    sectionId: 'acc-statements',
    directorySlug: 'accounting',
    directoryNameAr: 'المحاسبة',
    pageSlug: 'financial-statements',
    breadcrumbLabelAr: 'القوائم المالية (الدخل والمركز المالي)',
    canonicalPath: '/accounting/financial-statements',
    title: 'قائمة الدخل والمركز المالي والتدفقات النقدية | BizJo',
    metaDescription:
      'استخرج قائمة الدخل، قائمة المركز المالي (الميزانية العمومية)، وقائمة التدفقات النقدية آلياً من واقع القيود الفعلية لشركتك في الأردن.',
    beginnerSearchTerms: ['حساب صافي الربح والخسارة للشركة', 'الميزانية العمومية للشركة'],
    expertSearchTerms: ['القوائم المالية وفق المعيار المحاسبي الدولي IAS 1', 'قائمة التدفقات النقدية التشغيلية والتمويلية'],
    changeFrequency: 'weekly',
  },
  'tax-profile': {
    sectionId: 'tax-profile',
    directorySlug: 'taxes',
    directoryNameAr: 'الضرائب',
    pageSlug: 'tax-profile',
    breadcrumbLabelAr: 'الملف الضريبي وبيانات الشركة',
    canonicalPath: '/taxes/tax-profile',
    title: 'إعداد الملف الضريبي وتسجيل الشركة في الأردن | BizJo',
    metaDescription:
      'أكمل بيانات السجل التجاري، الرقم الضريبي الموحد، والمفوضين بالتوقيع لدى دائرة ضريبة الدخل والمبيعات الأردنية (ISTD) في مكان واحد.',
    beginnerSearchTerms: ['كيف أفتح ملف ضريبي لشركتي في الأردن', 'الرقم الضريبي للشركات'],
    expertSearchTerms: ['تسجيل المكلفين لدى دائرة ضريبة الدخل والمبيعات ISTD', 'إدارة التفويضات الضريبية والمهنية'],
    changeFrequency: 'monthly',
  },
  'tax-income': {
    sectionId: 'tax-income',
    directorySlug: 'taxes',
    directoryNameAr: 'الضرائب',
    pageSlug: 'income-tax',
    breadcrumbLabelAr: 'ضريبة الدخل والمساهمة الوطنية',
    canonicalPath: '/taxes/income-tax',
    title: 'حاسبة وإقرار ضريبة الدخل الأردنية للأفراد والشركات | BizJo',
    metaDescription:
      'احتسب ضريبة الدخل للأفراد والشركات والمساهمة الوطنية في الأردن وفق القانون رقم 38 لسنة 2018 مع جميع الإعفاءات العائلية والشخصية.',
    beginnerSearchTerms: ['حساب ضريبة الدخل على الراتب في الأردن', 'كم إعفاء ضريبة الدخل للأفراد'],
    expertSearchTerms: ['شرائح ضريبة الدخل المادة 11 والمساهمة الوطنية', 'نسب ضريبة الشركات القطاعية في الأردن'],
    changeFrequency: 'weekly',
  },
  'tax-sales': {
    sectionId: 'tax-sales',
    directorySlug: 'taxes',
    directoryNameAr: 'الضرائب',
    pageSlug: 'sales-tax-vat',
    breadcrumbLabelAr: 'ضريبة المبيعات العامة (16%)',
    canonicalPath: '/taxes/sales-tax-vat',
    title: 'إقرار الضريبة العامة على المبيعات (16% / 4%) | BizJo',
    metaDescription:
      'أعد إقرار ضريبة المبيعات في الأردن بدقة: مطابقة ضريبة المخرجات مع ضريبة المدخلات القابلة للرد واحتساب صافي الضريبة المستحقة لـ ISTD.',
    beginnerSearchTerms: ['طريقة حساب ضريبة المبيعات 16 في الأردن', 'الفرق بين السعر شامل الضريبة وغير شامل'],
    expertSearchTerms: ['إقرار الضريبة العامة على المبيعات نموذج م/4', 'رديات ضريبة المدخلات والسلع الخاضعة لنسبة 4% و0%'],
    changeFrequency: 'weekly',
  },
  'tax-jofotara': {
    sectionId: 'tax-jofotara',
    directorySlug: 'taxes',
    directoryNameAr: 'الضرائب',
    pageSlug: 'jofotara-einvoicing',
    breadcrumbLabelAr: 'نظام الفوترة الوطني الإلكتروني (JoFotara)',
    canonicalPath: '/taxes/jofotara-einvoicing',
    title: 'نظام الفوترة الوطني الإلكتروني الأردني JoFotara | BizJo',
    metaDescription:
      'أصدر فواتير إلكترونية متوافقة مع نظام الفوترة الوطني الأردني (JoFotara) برمز QR وملف XML UBL 2.1 مع ترحيل فوري لدفتر اليومية.',
    beginnerSearchTerms: ['ما هو نظام الفوترة الوطني جوفوتارة', 'إصدار فاتورة إلكترونية QR الأردن'],
    expertSearchTerms: ['معيار UBL 2.1 XML JoFotara ISTD', 'نظام الفوترة الوطني الإلكتروني رقم 82 لسنة 2019'],
    changeFrequency: 'daily',
  },
  'tax-compliance': {
    sectionId: 'tax-compliance',
    directorySlug: 'taxes',
    directoryNameAr: 'الضرائب',
    pageSlug: 'tax-compliance',
    breadcrumbLabelAr: 'مركز الامتثال والفحص الضريبي (92%)',
    canonicalPath: '/taxes/tax-compliance',
    title: 'مركز الامتثال الضريبي وملف الفحص القياسي SAF-T | BizJo',
    metaDescription:
      'راقب درجة الامتثال الضريبي لشركتك (92%)، وتجنب الغرامات الضريبية مع توليد ملف الفحص الضريبي القياسي (SAF-T) الجاهز للتدقيق في الأردن.',
    beginnerSearchTerms: ['تجنب غرامات الضريبة في الأردن', 'فحص الملف الضريبي للشركة'],
    expertSearchTerms: ['ملف الفحص الضريبي القياسي OECD SAF-T Jordan', 'مؤشر مخاطر التدقيق الضريبي ومطابقة الإقرارات'],
    changeFrequency: 'weekly',
  },
  'hr-employees': {
    sectionId: 'hr-employees',
    directorySlug: 'hr',
    directoryNameAr: 'الموارد البشرية',
    pageSlug: 'employees',
    breadcrumbLabelAr: 'سجل الموظفين وعقود العمل',
    canonicalPath: '/hr/employees',
    title: 'إدارة شؤون الموظفين وعقود العمل الأردنية | BizJo HR',
    metaDescription:
      'نظم ملفات الموظفين، المسميات الوظيفية، والأجور الخاضعة للضمان الاجتماعي وفق أحكام قانون العمل الأردني رقم 8 لسنة 1996.',
    beginnerSearchTerms: ['برنامج شؤون الموظفين الأردن', 'تنظيم ملفات الموظفين'],
    expertSearchTerms: ['إدارة العقود الوظيفية والأجر الخاضع للضمان', 'امتثال قانون العمل الأردني وتعديلاته'],
    changeFrequency: 'weekly',
  },
  'hr-payroll': {
    sectionId: 'hr-payroll',
    directorySlug: 'hr',
    directoryNameAr: 'الموارد البشرية',
    pageSlug: 'payroll',
    breadcrumbLabelAr: 'مسيرات الرواتب والأجور',
    canonicalPath: '/hr/payroll',
    title: 'مسير الرواتب واقتطاعات الضمان وضريبة الدخل | BizJo',
    metaDescription:
      'أعد مسير الرواتب الشهري في الأردن مع احتساب تلقائي لحصة الموظف والشركة في الضمان الاجتماعي واقتطاع ضريبة الدخل وترحيل القيد المحاسبي.',
    beginnerSearchTerms: ['كشف رواتب الموظفين الشهري', 'حساب صافي الراتب بعد الضمان'],
    expertSearchTerms: ['قيد استحقاق الرواتب والأمانات حساب 5201 و2106', 'احتساب اقتطاع ضريبة كسب العمل الشهري'],
    changeFrequency: 'monthly',
  },
  'hr-ssc': {
    sectionId: 'hr-ssc',
    directorySlug: 'hr',
    directoryNameAr: 'الموارد البشرية',
    pageSlug: 'social-security',
    breadcrumbLabelAr: 'الضمان الاجتماعي الأردني (21.75%)',
    canonicalPath: '/hr/social-security',
    title: 'حاسبة اشتراكات الضمان الاجتماعي الأردني (21.75%) | BizJo',
    metaDescription:
      'احسب اشتراكات المؤسسة العامة للضمان الاجتماعي في الأردن (7.5% للموظف و14.25% للمنشأة) مع مراعاة سقف الأجر الخاضع والمهن الخطرة.',
    beginnerSearchTerms: ['كم نسبة خصم الضمان الاجتماعي من الراتب', 'حاسبة الضمان الاجتماعي الأردن'],
    expertSearchTerms: ['قانون الضمان الاجتماعي رقم 1 لسنة 2014 تأمين الشيخوخة وإصابات العمل', 'سقف الأجر الخاضع للضمان 2026'],
    changeFrequency: 'monthly',
  },
  'hr-leaves': {
    sectionId: 'hr-leaves',
    directorySlug: 'hr',
    directoryNameAr: 'الموارد البشرية',
    pageSlug: 'leaves',
    breadcrumbLabelAr: 'الإجازات السنوية والمرضية ومكافأة نهاية الخدمة',
    canonicalPath: '/hr/leaves',
    title: 'إدارة الإجازات السنوية ومكافأة نهاية الخدمة | BizJo HR',
    metaDescription:
      'تتبع أرصدة الإجازات السنوية (14 أو 21 يوماً) والإجازات المرضية واحتسب مخصصات مكافأة نهاية الخدمة وفق قانون العمل الأردني.',
    beginnerSearchTerms: ['كم يوم إجازة سنوية حسب قانون العمل الأردني', 'حساب مستحقات نهاية الخدمة'],
    expertSearchTerms: ['المادة 61 من قانون العمل الأردني ومخصصات الإجازات المتراكمة', 'احتساب العمل الإضافي 125% و150%'],
    changeFrequency: 'monthly',
  },
  'ana-kpis': {
    sectionId: 'ana-kpis',
    directorySlug: 'analysis',
    directoryNameAr: 'التحليل',
    pageSlug: 'financial-kpis',
    breadcrumbLabelAr: 'المؤشرات والنسب المالية',
    canonicalPath: '/analysis/financial-kpis',
    title: 'المؤشرات المالية ونسب السيولة والربحية | BizJo التحليلي',
    metaDescription:
      'حلل أداء منشأتك عبر المؤشرات المالية القياسية: نسبة التداول، السيولة السريعة، العائد على الأصول (ROA)، والعائد على الملكية (ROE).',
    beginnerSearchTerms: ['كيف أعرف أن شركتي تربح', 'مؤشرات نجاح الشركة مالياً'],
    expertSearchTerms: ['تحليل النسب المالية ROA ROE Quick Ratio', 'مؤشرات كفاءة رأس المال العامل والتحصيل'],
    changeFrequency: 'weekly',
  },
  'ana-feasibility': {
    sectionId: 'ana-feasibility',
    directorySlug: 'analysis',
    directoryNameAr: 'التحليل',
    pageSlug: 'feasibility-study',
    breadcrumbLabelAr: 'مختبر دراسة الجدوى الاقتصادية',
    canonicalPath: '/analysis/feasibility-study',
    title: 'إعداد دراسة الجدوى المالية للمشاريع في الأردن | BizJo',
    metaDescription:
      'صمم دراسة جدوى اقتصادية متكاملة لمشروعك في الأردن: احتساب صافي القيمة الحالية (NPV)، معدل العائد الداخلي (IRR)، ونقطة التعادل.',
    beginnerSearchTerms: ['عمل دراسة جدوى لمشروع صغير في الأردن', 'حساب فترة استرداد رأس المال'],
    expertSearchTerms: ['تحليل التدفقات النقدية المخصومة DCF NPV IRR', 'حساسية نقطة التعادل Break-Even Analysis'],
    changeFrequency: 'monthly',
  },
  'ana-forecasts': {
    sectionId: 'ana-forecasts',
    directorySlug: 'analysis',
    directoryNameAr: 'التحليل',
    pageSlug: 'forecasts',
    breadcrumbLabelAr: 'التنبؤات المالية والموازنات التقديرية',
    canonicalPath: '/analysis/forecasts',
    title: 'التنبؤات المالية والموازنة التقديرية للتدفقات | BizJo',
    metaDescription:
      'استشرف التدفقات النقدية والمبيعات والمصروفات للأشهر القادمة مع محاكاة السيناريوهات المالية للشركات الصغيرة والمتوسطة في الأردن.',
    beginnerSearchTerms: ['توقع أرباح ومصاريف الشركة', 'خطة مالية سنوية للشركة'],
    expertSearchTerms: ['الموازنات التقديرية Cash Flow Forecasting', 'تحليل الانحرافات المالية Budget Variance'],
    changeFrequency: 'weekly',
  },
  'ana-cfo': {
    sectionId: 'ana-cfo',
    directorySlug: 'analysis',
    directoryNameAr: 'التحليل',
    pageSlug: 'cfo-dashboard',
    breadcrumbLabelAr: 'لوحة المدير المالي (CFO Dashboard)',
    canonicalPath: '/analysis/cfo-dashboard',
    title: 'لوحة المدير المالي التنفيذية (CFO Dashboard) | BizJo',
    metaDescription:
      'لوحة قيادة تنفيذية للمدير المالي في الأردن تعرض السيولة، الربحية، المبيعات، الضرائب، المخاطر، والتدفقات النقدية مع تصدير تقارير البنوك.',
    beginnerSearchTerms: ['ملخص مالي شامل للمدير', 'تقرير مالي لتقديمه للبنك'],
    expertSearchTerms: ['Executive CFO Dashboard & Bank Creditworthiness Report', 'تحليل الجدارة الائتمانية والسيولة'],
    changeFrequency: 'daily',
  },
  'doc-contracts': {
    sectionId: 'doc-contracts',
    directorySlug: 'documents',
    directoryNameAr: 'المستندات',
    pageSlug: 'contracts',
    breadcrumbLabelAr: 'أرشيف العقود والاتفاقيات',
    canonicalPath: '/documents/contracts',
    title: 'أرشيف العقود والاتفاقيات القانونية والتجارية | BizJo',
    metaDescription:
      'احفظ وتابع جميع العقود القانونية، اتفاقيات الموردين، وعقود الإيجار مع تنبيهات استباقية قبل انتهاء الصلاحية وتجديد الالتزامات.',
    beginnerSearchTerms: ['حفظ عقود الشركة إلكترونياً', 'متابعة تاريخ انتهاء العقود'],
    expertSearchTerms: ['إدارة دورة حياة العقود CLM والالتزامات التعاقدية', 'توثيق عقود الإيجار والضمانات البنكية'],
    changeFrequency: 'monthly',
  },
  'doc-licenses': {
    sectionId: 'doc-licenses',
    directorySlug: 'documents',
    directoryNameAr: 'المستندات',
    pageSlug: 'licenses',
    breadcrumbLabelAr: 'رخص المهن والسجلات التجارية',
    canonicalPath: '/documents/licenses',
    title: 'إدارة رخص المهن والسجل التجاري وشهادات الضريبة | BizJo',
    metaDescription:
      'تتبع صلاحية رخصة المهن (أمانة عمّان / البلديات)، السجل التجاري، وشهادة التسجيل الضريبي لتفادي غرامات التأخير عن التجديد السنوي.',
    beginnerSearchTerms: ['موعد تجديد رخصة المهن في عمّان', 'أوراق ترخيص شركة في الأردن'],
    expertSearchTerms: ['امتثال التراخيص البلدية ومراقبة الشركات', 'تنبيهات تجديد السجل التجاري ورخص المهن'],
    changeFrequency: 'monthly',
  },
  'doc-authorizations': {
    sectionId: 'doc-authorizations',
    directorySlug: 'documents',
    directoryNameAr: 'المستندات',
    pageSlug: 'authorizations',
    breadcrumbLabelAr: 'التفويضات البنكية والضريبية',
    canonicalPath: '/documents/authorizations',
    title: 'إدارة التفويضات البنكية والضريبية والمفوضين بالتوقيع | BizJo',
    metaDescription:
      'وثّق صلاحيات المفوضين بالتوقيع الإداري والمالي والضريبي لدى البنوك الأردنية ودائرة ضريبة الدخل والمبيعات والضمان الاجتماعي.',
    beginnerSearchTerms: ['من هو المفوض بالتوقيع عن الشركة', 'نموذج تفويض مراجعة الضريبة'],
    expertSearchTerms: ['حوكمة صلاحيات المفوضين بالتوقيع البنكي والضريبي', 'إدارة التوكيلات والتفويضات القانونية'],
    changeFrequency: 'monthly',
  },
  'doc-archive': {
    sectionId: 'doc-archive',
    directorySlug: 'documents',
    directoryNameAr: 'المستندات',
    pageSlug: 'archive',
    breadcrumbLabelAr: 'سجل القرارات والأرشيف الرقابي (Audit Log)',
    canonicalPath: '/documents/archive',
    title: 'سجل القرارات الإدارية والمالية ومسار التدقيق | BizJo',
    metaDescription:
      'سجل رقابي غير قابل للتلاعب يوثق جميع القرارات المالية والإدارية (من قام بها، متى، ولماذا) لغايات التدقيق الداخلي والخارجي في الأردن.',
    beginnerSearchTerms: ['توثيق قرارات الإدارة والمحاسب', 'سجل حركات النظام المحاسبي'],
    expertSearchTerms: ['مسار التدقيق الرقابي غير القابل للتعديل Immutable Audit Trail', 'حوكمة القرارات المالية والضريبية'],
    changeFrequency: 'daily',
  },
  'help-laws': {
    sectionId: 'help-laws',
    directorySlug: 'help',
    directoryNameAr: 'المساعدة',
    pageSlug: 'jordan-laws',
    breadcrumbLabelAr: 'مركز قوانين الأعمال والضرائب الأردنية',
    canonicalPath: '/help/jordan-laws',
    title: 'مركز قوانين الأردن: ضريبة الدخل، الشركات، العمل والضمان | BizJo',
    metaDescription:
      'موسوعة تفاعلية للتشريعات الأردنية (قانون ضريبة الدخل، قانون الشركات، قانون العمل، وقانون الضمان الاجتماعي) مع تفسير عملي وأمثلة تطبيقية.',
    beginnerSearchTerms: ['قانون العمل الأردني الإجازات والرواتب', 'شرح قانون ضريبة الدخل الأردني ببساطة'],
    expertSearchTerms: ['النصوص القانونية والتفسير التطبيقي لقانون رقم 34 لسنة 2014 وقانون الشركات 22 لسنة 1997', 'تطبيقات نظام الفوترة الوطني 82 لسنة 2019'],
    changeFrequency: 'monthly',
  },
  'help-faq': {
    sectionId: 'help-faq',
    directorySlug: 'help',
    directoryNameAr: 'المساعدة',
    pageSlug: 'faq',
    breadcrumbLabelAr: 'الأسئلة الشائعة حول المحاسبة والضرائب',
    canonicalPath: '/help/faq',
    title: 'الأسئلة الشائعة حول المحاسبة والضرائب وJoFotara في الأردن | BizJo',
    metaDescription:
      'إجابات وافية وموثقة على أكثر الأسئلة شيوعاً للشركات الأردنية حول التسجيل الضريبي، ضريبة المبيعات 16%، الضمان الاجتماعي، والدورة المحاسبية.',
    beginnerSearchTerms: ['أسئلة وأجوبة عن فتح شركة في الأردن', 'كيف أبدأ محاسبة شركتي'],
    expertSearchTerms: ['الاستفسارات الضريبية والمحاسبية المتقدمة للشركات ذ.م.م', 'معالجة الإشعارات الدائنة والمدينة في JoFotara'],
    changeFrequency: 'monthly',
  },
  'help-advisor': {
    sectionId: 'help-advisor',
    directorySlug: 'help',
    directoryNameAr: 'المساعدة',
    pageSlug: 'smart-advisor',
    breadcrumbLabelAr: 'المستشار المالي والضريبي الذكي',
    canonicalPath: '/help/smart-advisor',
    title: 'المستشار المالي والضريبي الذكي للشركات الأردنية | BizJo',
    metaDescription:
      'احصل على إجابات وتحليلات فورية من المستشار الذكي المربوط ببياناتك المحاسبية الفعلية والتشريعات الضريبية وقانون العمل في الأردن.',
    beginnerSearchTerms: ['استشارة محاسبية وضريبية فورية الأردن', 'لماذا انخفض ربح شركتي'],
    expertSearchTerms: ['تحليل أسباب انحراف الربحية والسيولة والتوصيات الضريبية', 'مستشار مالي تفاعلي للأعمال الأردنية'],
    changeFrequency: 'weekly',
  },
  'help-seo': {
    sectionId: 'help-seo',
    directorySlug: 'help',
    directoryNameAr: 'المساعدة',
    pageSlug: 'seo-search-central',
    breadcrumbLabelAr: 'دليل تحسين محركات البحث (Google Search Central SEO)',
    canonicalPath: '/help/seo-search-central',
    title: 'مركز تحسين محركات البحث (Google Search Central SEO) | BizJo',
    metaDescription:
      'لوحة فحص ومعاينة معايير Google Search Central SEO في منصة BizJo: الروابط الوصفية، المسارات التفصيلية Breadcrumbs، البيانات المنظمة، وملف Sitemap.',
    beginnerSearchTerms: ['كيف يظهر موقعي في بحث جوجل', 'تحسين ظهور الموقع في محركات البحث SEO'],
    expertSearchTerms: ['Google Search Central SEO Starter Guide Compliance', 'JSON-LD Structured Data BreadcrumbList & Canonical URLs'],
    changeFrequency: 'weekly',
  },
  'p2-mvp-suite': {
    sectionId: 'p2-mvp-suite',
    directorySlug: 'phase-two',
    directoryNameAr: 'المرحلة الثانية والـ MVP',
    pageSlug: 'mvp-suite',
    breadcrumbLabelAr: 'إطلاق الـ MVP الذكي (7 خطوات)',
    canonicalPath: '/phase-two/mvp-suite',
    title: 'منظومة الأعمال الذكية والـ MVP للشركات الأردنية | BizJo',
    metaDescription:
      'استكشف المراحل الاستراتيجية لمنصة BizJo: مركز التنبيهات الذكية، مؤشر صحة الأعمال (91/100)، إدارة المخاطر، والتقويم الضريبي الأردني.',
    beginnerSearchTerms: ['نظام إدارة شركة متكامل في الأردن', 'تقييم صحة الشركة المالية'],
    expertSearchTerms: ['خارطة طريق نظام ERP والامتثال الضريبي الاستباقي', 'Business Health Score & Risk Matrix'],
    changeFrequency: 'weekly',
  },
  'p2-notifications': {
    sectionId: 'p2-notifications',
    directorySlug: 'phase-two',
    directoryNameAr: 'المرحلة الثانية والـ MVP',
    pageSlug: 'smart-notifications',
    breadcrumbLabelAr: 'مركز التنبيهات الضريبية والمالية الذكية',
    canonicalPath: '/phase-two/smart-notifications',
    title: 'مركز التنبيهات الضريبية والمالية والوثائق الذكية | BizJo',
    metaDescription:
      'تنبيهات استباقية لمواعيد إقرار ضريبة المبيعات والدخل، انتهاء رخص المهن والسجلات، وتغيرات السيولة والمصروفات للشركات في الأردن.',
    beginnerSearchTerms: ['تذكير مواعيد الضريبة ورخصة المهن', 'تنبيهات تأخر سداد العملاء'],
    expertSearchTerms: ['نظام الإنذار المبكر للالتزامات الضريبية والقانونية', 'مراقبة انحرافات التدفقات النقدية والمصروفات'],
    changeFrequency: 'daily',
  },
  'p2-health-score': {
    sectionId: 'p2-health-score',
    directorySlug: 'phase-two',
    directoryNameAr: 'المرحلة الثانية والـ MVP',
    pageSlug: 'business-health-score',
    breadcrumbLabelAr: 'نظام صحة الأعمال (Business Health Score 91/100)',
    canonicalPath: '/phase-two/business-health-score',
    title: 'مؤشر صحة الأعمال (Business Health Score 91/100) | BizJo',
    metaDescription:
      'احصل على تقييم فوري لصحة شركتك من 100 نقطة بناءً على السيولة، الربحية، المديونية، التدفقات النقدية، الامتثال الضريبي، وتحصيل الذمم.',
    beginnerSearchTerms: ['كيف أقيم وضع شركتي المالي', 'درجة قوة الشركة المالية'],
    expertSearchTerms: ['معادلة تقييم الملاءة المالية متعددة الأبعاد للشركات SME', 'تحسين دورة التحصيل وتخفيض المديونية'],
    changeFrequency: 'daily',
  },
  'p2-risk-center': {
    sectionId: 'p2-risk-center',
    directorySlug: 'phase-two',
    directoryNameAr: 'المرحلة الثانية والـ MVP',
    pageSlug: 'risk-center',
    breadcrumbLabelAr: 'مركز إدارة المخاطر الضريبية والمالية',
    canonicalPath: '/phase-two/risk-center',
    title: 'مركز إدارة المخاطر الضريبية والسيولة والتحصيل | BizJo',
    metaDescription:
      'رصد استباقي للمخاطر الضريبية، مخاطر السيولة، ومخاطر تركز ذمم العملاء المتأخرة مع توصيات تصحيحية عملية لإدارة الشركة.',
    beginnerSearchTerms: ['مخاطر تأخر الزبائن عن الدفع', 'تجنب مشاكل السيولة في الشركة'],
    expertSearchTerms: ['مصفوفة المخاطر المالية والضريبية والتشغيلية Enterprise Risk Management', 'معالجة الذمم المشكوك في تحصيلها'],
    changeFrequency: 'weekly',
  },
  'p2-smart-docs': {
    sectionId: 'p2-smart-docs',
    directorySlug: 'phase-two',
    directoryNameAr: 'المرحلة الثانية والـ MVP',
    pageSlug: 'smart-documents',
    breadcrumbLabelAr: 'مركز الوثائق القانونية الذكي',
    canonicalPath: '/phase-two/smart-documents',
    title: 'مركز الوثائق الذكي وتتبع صلاحية التراخيص | BizJo',
    metaDescription:
      'إدارة ذكية لوثائق الشركة الأردنية (السجل التجاري، رخصة المهن، شهادة الضريبة، وشهادة الضمان) مع عداد تنازلي وتنبيهات التجديد.',
    beginnerSearchTerms: ['حفظ أوراق الشركة الرسمية', 'تاريخ انتهاء السجل التجاري ورخصة المهن'],
    expertSearchTerms: ['أرشفة الوثائق القانونية والرقابية للشركات الأردنية', 'مؤشر اكتمال الملف القانوني والضريبي'],
    changeFrequency: 'weekly',
  },
  'p2-kanban-tasks': {
    sectionId: 'p2-kanban-tasks',
    directorySlug: 'phase-two',
    directoryNameAr: 'المرحلة الثانية والـ MVP',
    pageSlug: 'kanban-tasks',
    breadcrumbLabelAr: 'نظام إدارة المهام المالية والضريبية (Kanban)',
    canonicalPath: '/phase-two/kanban-tasks',
    title: 'لوحة مهام المحاسبة والضرائب (Kanban Board) | BizJo',
    metaDescription:
      'نظم مهام فريق المحاسبة والمالية في شركتك عبر لوحة Kanban تفاعلية: مهام جديدة، قيد التنفيذ، مكتملة، ومتأخرة مع ربط بالتقويم الضريبي.',
    beginnerSearchTerms: ['تنظيم مهام المحاسب الشهري', 'جدول أعمال القسم المالي'],
    expertSearchTerms: ['إدارة سير العمل المحاسبي والضريبي بنظام Kanban', 'توزيع المهام الرقابية وإغلاق الفترات المالية'],
    changeFrequency: 'daily',
  },
  'p2-yoy-analytics': {
    sectionId: 'p2-yoy-analytics',
    directorySlug: 'phase-two',
    directoryNameAr: 'المرحلة الثانية والـ MVP',
    pageSlug: 'yoy-analytics',
    breadcrumbLabelAr: 'المقارنات المالية السنوية (YoY)',
    canonicalPath: '/phase-two/yoy-analytics',
    title: 'تحليل المقارنات المالية السنوية (YoY Growth) | BizJo',
    metaDescription:
      'قارن أداء شركتك بين السنوات المالية (الإيرادات، المصروفات، صافي الربح، والالتزامات الضريبية) لاكتشاف اتجاهات النمو الحقيقية.',
    beginnerSearchTerms: ['مقارنة أرباح السنة الحالية بالسنة الماضية', 'نسبة نمو المبيعات سنوياً'],
    expertSearchTerms: ['التحليل الأفقي والرأسي للقوائم المالية YoY Comparison', 'تحليل معدل النمو السنوي المركب CAGR'],
    changeFrequency: 'monthly',
  },
  'p2-investor-bank': {
    sectionId: 'p2-investor-bank',
    directorySlug: 'phase-two',
    directoryNameAr: 'المرحلة الثانية والـ MVP',
    pageSlug: 'investor-bank-reports',
    breadcrumbLabelAr: 'تقارير المستثمرين والبنوك والتمويل',
    canonicalPath: '/phase-two/investor-bank-reports',
    title: 'تقارير الجدارة الائتمانية للبنوك والمستثمرين | BizJo',
    metaDescription:
      'استخرج ملفاً مالياً معتمداً لتقديمه للبنوك الأردنية وصناديق الاستثمار يشمل القوائم المالية، نسب التغطية، ودرجة الامتثال الضريبي.',
    beginnerSearchTerms: ['الأوراق المطلوبة للحصول على تمويل شركات من البنك', 'تقرير مالي للمستثمرين'],
    expertSearchTerms: ['ملف الجدارة الائتمانية للبنوك الأردنية ونسب خدمة الدين DSCR', 'تقييم الشركات وجاهزية التمويل'],
    changeFrequency: 'monthly',
  },
  'p2-sector-benchmarks': {
    sectionId: 'p2-sector-benchmarks',
    directorySlug: 'phase-two',
    directoryNameAr: 'المرحلة الثانية والـ MVP',
    pageSlug: 'sector-benchmarks',
    breadcrumbLabelAr: 'مؤشرات مقارنة القطاعات في السوق الأردني',
    canonicalPath: '/phase-two/sector-benchmarks',
    title: 'مقارنة أداء شركتك بمتوسط القطاع في السوق الأردني | BizJo',
    metaDescription:
      'قارن هامش ربحك، نسبة مصروفاتك، وسرعة تحصيلك مع متوسط الشركات المماثلة في قطاعك داخل الأردن (التجارة، الخدمات، الصناعة، التقنية، والمطاعم).',
    beginnerSearchTerms: ['ما هو هامش الربح الطبيعي في الأردن', 'مقارنة شركتي بالشركات المنافسة'],
    expertSearchTerms: ['المرجعيات القطاعية المالية في السوق الأردني Sector Benchmarks', 'تحليل التنافسية القطاعية وكفاءة التشغيل'],
    changeFrequency: 'monthly',
  },
  'p2-tax-calendar': {
    sectionId: 'p2-tax-calendar',
    directorySlug: 'phase-two',
    directoryNameAr: 'المرحلة الثانية والـ MVP',
    pageSlug: 'tax-calendar',
    breadcrumbLabelAr: 'التقويم الضريبي والقانوني الأردني الذكي',
    canonicalPath: '/phase-two/tax-calendar',
    title: 'التقويم الضريبي والقانوني للشركات الأردنية 2026 | BizJo',
    metaDescription:
      'تقويم شامل لجميع الاستحقاقات الضريبية والقانونية في الأردن: مواعيد إقرارات المبيعات، ضريبة الدخل، الضمان الاجتماعي، وتجديد الرخص.',
    beginnerSearchTerms: ['مواعيد تقديم إقرار ضريبة المبيعات في الأردن', 'متى يدفع الضمان الاجتماعي شهرياً'],
    expertSearchTerms: ['أجندة الامتثال الضريبي والقانوني السنوية للشركات الأردنية', 'المهل القانونية لتوريد اقتطاعات المصدر والضمان'],
    changeFrequency: 'monthly',
  },
  'p2-data-health': {
    sectionId: 'p2-data-health',
    directorySlug: 'phase-two',
    directoryNameAr: 'المرحلة الثانية والـ MVP',
    pageSlug: 'data-health',
    breadcrumbLabelAr: 'فحص جودة وسلامة البيانات المحاسبية (93%)',
    canonicalPath: '/phase-two/data-health',
    title: 'مدقق جودة البيانات المحاسبية والضريبية (93%) | BizJo',
    metaDescription:
      'افحص اكتمال وسلامة بياناتك المحاسبية والضريبية آلياً: كشف الفواتير غير المرحّلة، الأرقام الضريبية الناقصة، وتوازن القيود.',
    beginnerSearchTerms: ['التأكد من صحة الحسابات والفواتير', 'مراجعة أخطاء الإدخال المحاسبي'],
    expertSearchTerms: ['التدقيق الآلي لجودة البيانات المحاسبية Data Integrity Audit', 'فحص تطابق الفواتير مع الأستاذ العام'],
    changeFrequency: 'daily',
  },
  'p2-ai-advisor': {
    sectionId: 'p2-ai-advisor',
    directorySlug: 'phase-two',
    directoryNameAr: 'المرحلة الثانية والـ MVP',
    pageSlug: 'ai-advisor',
    breadcrumbLabelAr: 'المستشار التنفيذي لتحليل الربحية والسيولة',
    canonicalPath: '/phase-two/ai-advisor',
    title: 'المستشار المالي التنفيذي لتحليل الربحية والسيولة | BizJo',
    metaDescription:
      'تشخيص فوري لأسباب تغير الربحية والسيولة من واقع دفتر الأستاذ العام الفعلي مع خطوات عملية لتحسين الأداء المالي والضريبي.',
    beginnerSearchTerms: ['نصائح لزيادة أرباح الشركة وتقليل المصاريف', 'تشخيص الوضع المالي للشركة'],
    expertSearchTerms: ['تحليل حساسية الربحية والتدفقات النقدية من الأستاذ العام', 'توصيات المدير المالي التنفيذية'],
    changeFrequency: 'weekly',
  },
  'p2-erd-schema': {
    sectionId: 'p2-erd-schema',
    directorySlug: 'phase-two',
    directoryNameAr: 'المرحلة الثانية والـ MVP',
    pageSlug: 'erd-sql-schema',
    breadcrumbLabelAr: 'المخطط العلائقي (ERD) وهيكل قاعدة البيانات (21 جدول SQL)',
    canonicalPath: '/phase-two/erd-sql-schema',
    title: 'مخطط قاعدة البيانات العلائقية (21 جدول SQL ERP) | BizJo',
    metaDescription:
      'استعرض المخطط العلائقي الكامل (ERD) لقاعدة بيانات BizJo المكونة من 21 جدولاً شاملاً الشركات، البائعين، المنتجات، عروض الأسعار، العقود، والفواتير.',
    beginnerSearchTerms: ['تصميم قاعدة بيانات برنامج محاسبة وفواتير', 'جداول قاعدة بيانات الشركات'],
    expertSearchTerms: ['مخطط ERD لنظام ERP سحابي متعدد الشركات Multi-Tenant SQL Schema', 'ربط جداول vendors وproducts_services وquotes وcontracts بجدول companies'],
    changeFrequency: 'monthly',
  },
};

export class BizJoSeoEngine {
  public static getMetadataForSection(sectionId: SidebarItemId): SeoPageMetadata {
    return SEO_PAGE_REGISTRY[sectionId] || SEO_PAGE_REGISTRY['biz-dashboard'];
  }

  public static findSectionByPath(pathname: string): SidebarItemId | null {
    const cleanPath = pathname.replace(/\/+$/, '');
    if (!cleanPath || cleanPath === '') return null;
    const allEntries = Object.values(SEO_PAGE_REGISTRY);
    const matched = allEntries.find((item) => item.canonicalPath === cleanPath);
    return matched ? matched.sectionId : null;
  }

  /**
   * Synchronizes the active page's `<title>`, `<meta name="description">`, OpenGraph,
   * Twitter Cards, `<link rel="canonical">`, and descriptive directory URL in the browser.
   * Strictly follows Google Search Central SEO Starter Guide & applet-seo rules.
   */
  public static syncPageSeoToDom(sectionId: SidebarItemId, updateUrlHistory = true): SeoPageMetadata {
    const meta = this.getMetadataForSection(sectionId);
    if (typeof document === 'undefined' || typeof window === 'undefined') {
      return meta;
    }

    // 1. Update <title> (Unique, clear, concise title link for Google Search)
    document.title = meta.title;

    // 2. Helper to set or create meta tags
    const setMetaTag = (attrName: 'name' | 'property', attrValue: string, content: string) => {
      let el = document.head.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    const fullCanonicalUrl = `${window.location.origin}${meta.canonicalPath}`;

    // 3. Control Snippets & Social Cards
    setMetaTag('name', 'description', meta.metaDescription);
    setMetaTag('name', 'robots', 'index, follow, max-snippet:-1, max-image-preview:large');
    setMetaTag('property', 'og:title', meta.title);
    setMetaTag('property', 'og:description', meta.metaDescription);
    setMetaTag('property', 'og:url', fullCanonicalUrl);
    setMetaTag('property', 'og:type', 'website');
    setMetaTag('property', 'og:site_name', 'BizJo');
    setMetaTag('property', 'og:locale', 'ar_JO');
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', meta.title);
    setMetaTag('name', 'twitter:description', meta.metaDescription);

    // 4. Remove deprecated <meta name="keywords"> if any exists (per Google Search Central Guide)
    const keywordsMeta = document.head.querySelector('meta[name="keywords"]');
    if (keywordsMeta) {
      keywordsMeta.remove();
    }

    // 5. Canonical URL link element to reduce duplicate content
    let canonicalLink = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', fullCanonicalUrl);

    // 6. Update descriptive URL in browser address bar without page reload
    if (updateUrlHistory && window.location.pathname !== meta.canonicalPath) {
      try {
        window.history.replaceState({ sectionId }, meta.title, meta.canonicalPath);
      } catch {
        // Ignore history restrictions in sandboxed environments if any
      }
    }

    return meta;
  }
}
