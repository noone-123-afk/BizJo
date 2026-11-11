export interface LegalTemplateDocument {
  id: string;
  code: string;
  titleAr: string;
  titleEn: string;
  category: 'CONTRACTS' | 'TAX_DEFENSE' | 'GOVERNANCE';
  categoryLabelAr: string;
  lawReference: string;
  summary: string;
  editableFields: Array<{
    key: string;
    label: string;
    defaultValue: string;
  }>;
  buildMarkdown: (values: Record<string, string>) => string;
}

export const JORDAN_LEGAL_TEMPLATES: LegalTemplateDocument[] = [
  {
    id: 'nda-2023',
    code: 'DOC-4.1',
    titleAr: 'اتفاقية عدم إفصاح وحماية سرية المعلومات (NDA)',
    titleEn: 'Non-Disclosure & Data Protection Agreement',
    category: 'CONTRACTS',
    categoryLabelAr: 'العقود والاتفاقيات القانونية',
    lawReference: 'القانون المدني وقانون حماية البيانات الشخصية الأردني رقم (24) لسنة 2023',
    summary: 'نموذج اتفاقية استرشادية لحماية البيانات المالية، القوائم المحاسبية، والشيفرات البرمجية مع اختصاص محاكم عمان.',
    editableFields: [
      { key: 'partyOneName', label: 'الفريق الأول (الطرف المفصح)', defaultValue: 'شركة الرواد للحلول الصناعية والتجارية ذ.م.م' },
      { key: 'partyOneTin', label: 'رقم تعريف المنشأة / الرقم الضريبي', defaultValue: '2001584920' },
      { key: 'partyTwoName', label: 'الفريق الثاني (الطرف المتلقي)', defaultValue: 'مكتب المستشارون المتحدون للتدقيق والاستشارات' },
      { key: 'partyTwoTin', label: 'الرقم التعريفي / الضريبي للفريق الثاني', defaultValue: '1009482715' },
      { key: 'agreementDate', label: 'تاريخ الإبرام', defaultValue: '2026-11-10' },
    ],
    buildMarkdown: (v) => `# اتفاقية سرية وعدم إفصاح عن المعلومات (NDA — نموذج استرشادي)
**وفقاً لأحكام القانون المدني وقانون حماية البيانات الشخصية الأردني رقم (24) لسنة 2023**

تم إبرام هذه الاتفاقية في مدينة عمان بتاريخ: **${v.agreementDate}** بين كل من:
- **الفريق الأول (الطرف المفصح):** السادة / ${v.partyOneName}، رقم تعريف المنشأة: (${v.partyOneTin})، وعنوانها: عمان، المملكة الأردنية الهاشمية.
- **الفريق الثاني (الطرف المتلقي):** السادة / ${v.partyTwoName}، الرقم التعريفي/الضريبي: (${v.partyTwoTin}).

### 1. تعريف المعلومات السرية
تشمل كافة البيانات المالية، القوائم المحاسبية، الخطط الاستراتيجية، الشيفرات البرمجية، سجلات العملاء، الفواتير الإلكترونية (JoFotara)، ودراسات الجدوى سواء كانت مكتوبة، شفوية، أو مخزنة إلكترونياً.

### 2. التزامات الطرف المتلقي
1. المحافظة على سرية البيانات وعدم الإفصاح عنها لأي طرف ثالث دون موافقة خطية مسبقة.
2. حصر استخدام البيانات في الغرض المتفق عليه حصراً وعدم استغلالها للمنافسة المباشرة أو غير المباشرة.
3. تطبيق معايير الأمان التقنية والتشفير (AES-256) للامتثال لقانون حماية البيانات الشخصية الأردني رقم (24) لسنة 2023.

### 3. مدة الاتفاقية
تظل التزامات السرية سارية المفعول طيلة فترة التعامل ولمدة **ثلاث سنوات** تالية لإنهاء العلاقة التعاقدية.

### 4. الاختصاص القضائي
تختص محاكم عمان (قصر العدل) بنظر أي نزاع ناشئ عنها وفق القوانين الأردنية النافذة.

**توقيع الفريق الأول:** ...................................         **توقيع الفريق الثاني:** ...................................`,
  },
  {
    id: 'labour-contract-1996',
    code: 'DOC-4.2',
    titleAr: 'عقد عمل محدد المدة وفق قانون العمل الأردني',
    titleEn: 'Fixed-Term Employment Contract (Jordan Labour Law)',
    category: 'CONTRACTS',
    categoryLabelAr: 'العقود والاتفاقيات القانونية',
    lawReference: 'قانون العمل الأردني رقم (8) لسنة 1996 وتعديلاته (المواد 35 و61)',
    summary: 'نموذج عقد عمل استرشادي منسجم مع قانون العمل الأردني والمؤسسة العامة للضمان الاجتماعي وفترة التجربة والإجازات السنوية.',
    editableFields: [
      { key: 'employerName', label: 'الفريق الأول (صاحب العمل)', defaultValue: 'شركة الأفق للتقنية المالية والمحاسبية ذ.م.م' },
      { key: 'employerTin', label: 'الرقم الضريبي للشركة', defaultValue: '1700529814' },
      { key: 'employeeName', label: 'الفريق الثاني (العامل)', defaultValue: 'المهندس طارق زياد العبداللات' },
      { key: 'employeeNationalId', label: 'رقم الهوية الشخصية للعامل', defaultValue: '9941028374' },
      { key: 'jobTitle', label: 'المسمى الوظيفي', defaultValue: 'محاسب مالي ومختص ضرائب أول' },
      { key: 'monthlySalaryJod', label: 'الأجر الشهري الإجمالي (د.أ)', defaultValue: '1450.000' },
      { key: 'startDate', label: 'تاريخ مباشرة العمل', defaultValue: '2026-11-01' },
    ],
    buildMarkdown: (v) => `# عقد عمل محدد المدة (نموذج استرشادي)
**وفق أحكام قانون العمل الأردني رقم (8) لسنة 1996 وتعديلاته**

- **الفريق الأول (صاحب العمل):** ${v.employerName}، الرقم الضريبي: (${v.employerTin})، عمان - الأردن.
- **الفريق الثاني (العامل):** السيد/السيدة ${v.employeeName}، رقم الهوية الشخصية: (${v.employeeNationalId}).

### البنود والشروط:
1. **طبيعة العمل:** يعمل الفريق الثاني لدى الفريق الأول بوظيفة: (**${v.jobTitle}**).
2. **المدة والتجربة:** مدة العقد سنة ميلادية واحدة تبدأ من تاريخ **${v.startDate}**. يخضع العامل لفترة تجربة مدتها (3) أشهر وفق المادة (35) من قانون العمل.
3. **الأجر والاقتطاعات:** يتقاضى الفريق الثاني أجراً شهرياً إجمالياً مقداره (**${v.monthlySalaryJod}**) دينار أردني خاضع لاقتطاعات المؤسسة العامة للضمان الاجتماعي (7.5% حصة العامل) وضريبة الدخل إن وجدت.
4. **ساعات العمل والإجازات:** 48 ساعة أسبوعياً كحد أقصى. يستحق العامل إجازة سنوية مدفوعة الأجر مدتها (14) يوماً ترتفع إلى (21) يوماً بعد خدمة 5 سنوات متصلة وفق المادة (61).
5. **الاختصاص القانوني:** يرجع لقانون العمل الأردني في كل ما لم يرد به نص، وتختص محاكم عمان بنظر النزاعات العمالية.

**توقيع الفريق الأول (صاحب العمل):** ...................................         **توقيع الفريق الثاني (العامل):** ...................................`,
  },
  {
    id: 'istd-objection-memo',
    code: 'DOC-4.3',
    titleAr: 'نموذج لائحة اعتراض ضريبية أمام هيئة الاعتراض',
    titleEn: 'Tax Assessment Objection Memo Template',
    category: 'TAX_DEFENSE',
    categoryLabelAr: 'المذكرات الضريبية والدفاع القانوني',
    lawReference: 'قانون ضريبة الدخل الأردني رقم (34) لسنة 2014 وتعديلاته - المادة (33/أ) والمادة (23)',
    summary: 'صياغة استرشادية للاعتراض على قرارات التقدير الإداري وإثبات انتظام الدفاتر ومطابقة الفواتير الإلكترونية.',
    editableFields: [
      { key: 'taxpayerName', label: 'اسم المكلف / الشركة المعترضة', defaultValue: 'شركة الشرق الأوسط للتجهيزات الطبية ذ.م.م' },
      { key: 'taxpayerTin', label: 'الرقم الضريبي (TIN)', defaultValue: '1400892310' },
      { key: 'taxYear', label: 'السنة الضريبية المعترض عليها', defaultValue: '2025' },
      { key: 'decisionNumber', label: 'رقم قرار التقدير الإداري', defaultValue: 'ISTD/AUD/2026/8841' },
      { key: 'notificationDate', label: 'تاريخ التبليغ بالقرار', defaultValue: '2026-10-25' },
      { key: 'jcpaName', label: 'اسم المدقق / المفوض الضريبي', defaultValue: 'مكتب التدقيق والاستشارات الضريبية' },
    ],
    buildMarkdown: (v) => `# لائحة اعتراض ضريبية (نموذج استرشادي)
**موجهة إلى هيئة الاعتراض في دائرة ضريبة الدخل والمبيعات – عمان**

- **المعترض (المكلف):** ${v.taxpayerName} | **الرقم الضريبي:** (${v.taxpayerTin})
- **يمثله بالتفويض:** ${v.jcpaName}
- **المعترض ضده:** قرار التقدير الإداري رقم (**${v.decisionNumber}**) الصادر عن الفترة الضريبية (**${v.taxYear}**) والمبلغ بتاريخ **${v.notificationDate}**.

### أسباب الاعتراض ومبرراته القانونية:
1. **من حيث الشكل:** قُدم هذا الاعتراض ضمن المدة القانونية البالغة (30) يوماً من اليوم التالي لتاريخ التبليغ وفق أحكام المادة (33/أ) من قانون ضريبة الدخل، لذا نلتمس قبوله شكلاً.
2. **من حيث الموضوع:**
   - **بطلان التقدير الجزافي:** أخطأ المقدر في إهدار الدفاتر والحسابات المنتظمة المعدة وفق المعايير الدولية للتقارير المالية (IFRS) دون سند قانوني، مخالفةً لنص المادة (23).
   - **مطابقة الفوترة الإلكترونية:** كافة مبيعات الشركة مصدرة وموثقة لحظياً عبر منظومة الفوترة الإلكترونية (**JoFotara**) برموز تحقق TLV وبصمات SHA-256 مطابقة لإقرارات ضريبة المبيعات.
   - **المصاريف المقبولة ضريبياً:** تم استبعاد مصاريف تشغيلية ورواتب حقيقية مؤيدة بكشوفات المؤسسة العامة للضمان الاجتماعي وسندات التحويل البنكي خلافاً لأحكام المادة (9).

### الطلب:
قبول الاعتراض شكلاً، وفي الموضوع فسخ قرار التقدير الإداري رقم (${v.decisionNumber}) وقبول الإقرار الضريبي الذاتي والدفاتر المحاسبية المنتظمة للمكلف.

**المعترض / الوكيل المفوض:** ${v.jcpaName}`,
  },
  {
    id: 'istd-auditor-reply',
    code: 'DOC-4.4',
    titleAr: 'نموذج مذكرة رد على استيضاح خطي لمدقق الضريبة',
    titleEn: 'Reply Template to Tax Auditor Inquiry',
    category: 'TAX_DEFENSE',
    categoryLabelAr: 'المذكرات الضريبية والدفاع القانوني',
    lawReference: 'تعليمات التدقيق الضريبي واقتطاعات المنبع والضمان الاجتماعي',
    summary: 'نموذج استرشادي للرد على استيضاحات المدقق الضريبي بخصوص بدل الإيجار (اقتطاع 10%)، الرواتب والأجور، ومطابقة الفوترة.',
    editableFields: [
      { key: 'directorateName', label: 'مديرية الضريبة المختصة', defaultValue: 'مديرية كبار ومتوسطي المكلفين - عمان' },
      { key: 'companyName', label: 'اسم الشركة المكلفة', defaultValue: 'شركة البتراء للصناعات الغذائية ذ.م.م' },
      { key: 'companyTin', label: 'الرقم الضريبي (TIN)', defaultValue: '1800412590' },
      { key: 'inquiryNumber', label: 'رقم كتاب الاستيضاح الخطي', defaultValue: 'م ك/استيضاح/2026/319' },
      { key: 'inquiryDate', label: 'تاريخ الاستيضاح', defaultValue: '2026-11-02' },
    ],
    buildMarkdown: (v) => `# مذكرة رد على استيضاح خطي صادر من مدقق ضريبة الدخل (نموذج استرشادي)
**لدى ${v.directorateName}**

- **المكلف:** ${v.companyName} | **الرقم الضريبي:** (${v.companyTin})
- **الموضوع:** الرد القانوني والمحاسبي على الاستيضاح الخطي رقم (**${v.inquiryNumber}**) تاريخ **${v.inquiryDate}** بخصوص بندي الرواتب وبدل الإيجار.

1. **بخصوص بدل الإيجار العقاري:** تشغل الشركة العقار بموجب عقد إيجار موثق أصولاً لدى أمانة عمان الكبرى، وقد التزمت الشركة باقتطاع نسبة (**10%**) كضريبة دخل من المنبع وتوريدها للدائرة بموجب نموذج (و/1) وإيصالات سداد مرفقة، وتم السداد عبر شيكات بنكية مسحوبة لأمر المؤجر.
2. **بخصوص الرواتب والأجور:** كافة الرواتب المصروفة مطابقة تماماً لكشوفات واشتراكات المؤسسة العامة للضمان الاجتماعي والتحويلات المصرفية الشهرية، ومقتطع منها ضريبة الدخل للموظفين الذين تتجاوز رواتبهم حد الإعفاء القانوني.
3. **انتظام الدفاتر والفوترة:** المنشأة ملتزمة كلياً بمنظومة الفوترة الإلكترونية (**JoFotara**) ودفاترها منتظمة ومدققة أصولاً.

**المفوض بالتوقيع:** ............................................`,
  },
  {
    id: 'tp-disclosure-form',
    code: 'DOC-4.5',
    titleAr: 'نموذج إفصاح الأسعار التحويلية المرفق بالإقرار السنوي',
    titleEn: 'Transfer Pricing Related-Party Disclosure Form',
    category: 'TAX_DEFENSE',
    categoryLabelAr: 'المذكرات الضريبية والدفاع القانوني',
    lawReference: 'نظام تسعير المعاملات الأردني رقم (40) لسنة 2021 وتعليماته التنفيذية',
    summary: 'نموذج استرشادي للإفصاح عن المعاملات بين الأطراف المرتبطة التي تتجاوز 500,000 د.أ سنوياً وتطبيق مبدأ السعر المحايد.',
    editableFields: [
      { key: 'companyName', label: 'اسم المكلف', defaultValue: 'شركة المشرق للخدمات اللوجستية الإقليمية ذ.م.م' },
      { key: 'companyTin', label: 'الرقم الضريبي (TIN)', defaultValue: '1900773120' },
      { key: 'relatedPartyName', label: 'اسم الطرف ذو العلاقة (الشركة الشقيقة/الأم)', defaultValue: 'Al-Mashreq Holding Ltd (DIFC)' },
      { key: 'relatedPartyCountry', label: 'دولة الإقامة الضريبية للطرف المرتبط', defaultValue: 'الإمارات العربية المتحدة' },
      { key: 'transactionVolumeJod', label: 'إجمالي قيمة المعاملات السنوية (د.أ)', defaultValue: '625,000.000' },
      { key: 'pricingMethod', label: 'طريقة السعر المحايد المطبقة', defaultValue: 'طريقة هامش صافي المعاملة (TNMM)' },
    ],
    buildMarkdown: (v) => `# إفصاح المعاملات مع الأشخاص ذوي العلاقة (الأسعار التحويلية — نموذج استرشادي)
**مرفق الإقرار الضريبي السنوي**

- **اسم المكلف:** ${v.companyName}
- **الرقم الضريبي (TIN):** (${v.companyTin}) | **السنة الضريبية:** 2026م

### 1. بيان صفة العلاقة
تصرح الشركة بارتباطها بعلاقات سيطرة أو ملكية مباشرة/غير مباشرة تزيد على 50% من رأس المال أو الإدارة مع الأطراف الموضحة أدناه وفق المادة (2) من نظام تسعير المعاملات.

### 2. جدول المعاملات البينية
- **الطرف ذو العلاقة:** ${v.relatedPartyName} | **الدولة:** ${v.relatedPartyCountry}
- **طبيعة التعامل:** خدمات إدارية واستشارية وتوريد سلاسل إمداد.
- **إجمالي المبلغ المسجل بالدفاتر:** (**${v.transactionVolumeJod}**) دينار أردني.
- **طريقة السعر المحايد المطبقة:** ${v.pricingMethod}.

### 3. إقرار التوثيق (Local File)
يقر المكلف بتجهيز الملف المحلي (Local File) ودراسات المقارنة الاقتصادية (Benchmarking Study) وتقديمها خلال (30) يوماً من طلبها خطياً.

**توقيع المدقق المالي:** ............................................
**المفوض بالتوقيع:** ............................................`,
  },
  {
    id: 'sla-policy-2026',
    code: 'DOC-4.6',
    titleAr: 'اتفاقية مستوى الخدمة والجاهزية للمنصة السحابية (SaaS SLA)',
    titleEn: 'SaaS Platform Service Level Agreement (SLA 99.9%)',
    category: 'GOVERNANCE',
    categoryLabelAr: 'الحوكمة واستمرارية الأعمال',
    lawReference: 'معايير أمن المعلومات السحابية وجودة خدمات البرمجيات (SaaS)',
    summary: 'وثيقة التزام المنصة السحابية بنسبة توافر 99.95% لخدمات الفوترة ومحركات الحسابات وأوقات الاستجابة للدعم.',
    editableFields: [
      { key: 'guaranteedUptime', label: 'نسبة التوافر الشهري المستهدفة', defaultValue: '99.95%' },
      { key: 'criticalResponseTime', label: 'وقت الاستجابة للحالات الحرجة (توقف الفوترة)', defaultValue: '15 دقيقة' },
      { key: 'maintenanceWindow', label: 'نافذة الصيانة الدورية (توقيت الأردن)', defaultValue: '02:00 - 04:30 صباحاً يوم الجمعة' },
    ],
    buildMarkdown: (v) => `# اتفاقية مستوى الخدمة والجاهزية (SaaS SLA Policy)

1. **نسبة التوافر المستهدفة:** تلتزم المنصة بنسبة توافر شهري لا تقل عن (**${v.guaranteedUptime}**) لكافة الخدمات الحيوية (بوابة الفوترة الإلكترونية، ومحركات الحسابات الضريبية، وقواعد البيانات المشفرة).
2. **أوقات الصيانة المجدولة:** تُجرى أعمال الترقية الدورية خلال الفترة (${v.maintenanceWindow}) بتوقيت عمان مع إشعار مسبق بـ 48 ساعة.
3. **أوقات الاستجابة للدعم الفني المحاسبي والتقني:**
   - **الحالات الحرجة (توقف الفوترة اللحظية POS/JoFotara):** بدء الاستجابة خلال **${v.criticalResponseTime}** مع تفعيل الطابور المحلي المشفر (Offline Queue).
   - **الحالات المرتفعة (تعطل جزئي في تصدير SAF-T أو JSON):** بدء الاستجابة خلال ساعتين.
   - **الاستفسارات المحاسبية والضريبية الاعتيادية:** الرد خلال 4 ساعات عمل من قبل فريق الدعم المختص.
4. **التعويض المالي لمشتركي SaaS (Service Credits):**
   - توافر بين 95% وأقل من 99%: رصيد خصم 25% من الاشتراك الشهري.
   - توافر يقل عن 95%: رصيد خصم 50% من الاشتراك الشهري.`,
  },
  {
    id: 'dr-drill-runbook',
    code: 'DOC-4.7',
    titleAr: 'دليل محاكاة خطة الاستعادة من الكوارث (DR Drill Runbook)',
    titleEn: 'Disaster Recovery & Cryptographic Restore Runbook',
    category: 'GOVERNANCE',
    categoryLabelAr: 'الحوكمة واستمرارية الأعمال',
    lawReference: 'معيار ISO 22301 لاستمرارية الأعمال وتعليمات حفظ السجلات الإلكترونية',
    summary: 'بروتوكول الاستعادة القياسي خلال 30 دقيقة (RTO <= 30m) وفك تشفير أرشيف AES-256 والتحقق من بصمات الفواتير.',
    editableFields: [
      { key: 'targetRtoMinutes', label: 'هدف زمن الاستعادة (RTO)', defaultValue: '28 دقيقة' },
      { key: 'backupVaultRegion', label: 'منطقة التخزين السحابي المشفر', defaultValue: 'Cloudflare R2 - Middle East / Frankfurt Failover' },
    ],
    buildMarkdown: (v) => `# دليل محاكاة خطة الاستعادة الدورية (DR Drill Runbook)

1. **التوقيت والتجهيز:** يُجرى التمرين ربع سنوياً على بيئة معزولة مطابقة للإنتاج خارج أوقات الذروة في المملكة الأردنية الهاشمية.
2. **موقع الخزنة المشفرة:** ${v.backupVaultRegion}
3. **خطوات المحاكاة القياسية:**
   - **T = 00:00:** إعلان بدء التمرين وقطع اتصال قاعدة بيانات الـ Staging لمحاكاة انقطاع كامل.
   - **T + 05:00:** سحب أحدث لقطة مشفرة من سحابة التخزين وتدقيق بصمة SHA-256.
   - **T + 12:00:** تشغيل محرك فك التشفير (AES-256-GCM) واسترجاع جداول PostgreSQL الأساسية (Enterprise, Invoice, FixedAsset, TaxReturn, ConsentLog, AuditLog).
   - **T + 20:00:** تنفيذ استعلامات التدقيق ومطابقة بصمات آخر 50 فاتورة إلكترونية والتأكد من تطابق الأرصدة الدفترية.
   - **T + 28:00:** توثيق النتائج والتأكد من تحقيق الهدف (**RTO <= ${v.targetRtoMinutes}**) وإتلاف الخادم المؤقت بأمان.`,
  },
  {
    id: 'tax-audit-defense-guide',
    code: 'DOC-4.8',
    titleAr: 'دليل الإجراءات الإرشادية في جلسات المناقشة الضريبية',
    titleEn: 'Tax Audit Discussion & Preparation Playbook',
    category: 'TAX_DEFENSE',
    categoryLabelAr: 'المذكرات الضريبية والدفاع القانوني',
    lawReference: 'قانون ضريبة الدخل رقم (34) لسنة 2014 وقانون الضريبة العامة على المبيعات رقم (6) لسنة 1994',
    summary: 'إرشادات تنظيمية للمديرين الماليين والمحاسبين أثناء التحضير لجلسات المناقشة الميدانية الضريبية.',
    editableFields: [
      { key: 'partnerCurrentAccountCode', label: 'رمز حساب جاري الشريك بالدفاتر', defaultValue: '20401' },
      { key: 'auditRepresentativeRole', label: 'صفة الحاضر في جلسة المناقشة', defaultValue: 'المفوض بالتوقيع أو المدقق الضريبي المختص' },
    ],
    buildMarkdown: (v) => `# دليل الإجراءات الإرشادية في جلسات المناقشة الضريبية

1. **الالتزام بالتفويض القانوني:** حصر الحضور في **${v.auditRepresentativeRole}** بموجب تفويض خطي محدد للفترة الضريبية محل الفحص.
2. **توثيق بند الرواتب والأجور:** تقديم كشف الرواتب السنوي ومطابقته التامة مع قيود المؤسسة العامة للضمان الاجتماعي والتحويلات البنكية الشهرية وإيصالات توريد اقتطاعات الموظفين.
3. **توثيق المبيعات وإيداعات البنوك:** إبراز مطابقة مبيعات الشركة التامة مع فواتير وبصمات الفوترة الإلكترونية (**JoFotara**)، وتوضيح طبيعة إيداعات الشركاء التمويلية الشخصية عبر إبراز **حساب جاري الشريك (Code ${v.partnerCurrentAccountCode})** واتفاقيات التمويل الموثقة.
4. **تثبيت الملاحظات القانونية:** في حال وجود خلاف على رد مصاريف أو إضافات إيرادية، يُوقع محضر المناقشة مع تدوين عبارة: *"تم التوقيع مع التحفظ والتمسك بصحة الدفاتر المنتظمة وسنرد على الاستيضاح بمذكرة خطية مفصلة ضمن المهلة القانونية"*.`,
  },
];

export const PRISMA_DATABASE_SCHEMA = `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum EntityType {
  INDIVIDUAL
  SOLE_PROPRIETORSHIP
  LIMITED_LIABILITY
  GENERAL_PARTNERSHIP
  FOREIGN_BRANCH
}

enum InvoiceStatus {
  DRAFT
  SIGNED
  QUEUED_ISTD
  SUBMITTED_ISTD
  REJECTED_ISTD
}

model Enterprise {
  id                      String        @id @default(uuid())
  tin                     String        @unique
  crn                     String        @unique
  legalName               String
  commercialName          String
  entityType              EntityType
  saasPlanTier            String        @default("SME_GROWTH")
  phone                   String?
  email                   String?
  addressCity             String        @default("Amman")
  isActive                Boolean       @default(true)
  invoices                Invoice[]
  bankReconciliations     BankReconciliation[]
  fixedAssets             FixedAsset[]
  taxReturns              TaxReturn[]
  consentLogs             ConsentLog[]
  auditLogs               AuditLog[]
  createdAt               DateTime      @default(now())
  updatedAt               DateTime      @updatedAt
}

model ConsentLog {
  id                      String        @id @default(uuid())
  enterpriseId            String
  enterprise              Enterprise    @relation(fields: [enterpriseId], references: [id])
  userId                  String
  ipAddress               String
  consentDate             String
  consentTime             String
  policyVersion           String
  consentedScopes         String
  verificationHashSha256  String
  createdAt               DateTime      @default(now())
}

model AuditLog {
  id                      String        @id @default(uuid())
  enterpriseId            String
  enterprise              Enterprise    @relation(fields: [enterpriseId], references: [id])
  userId                  String
  actorName               String
  actionDate              String
  actionTime              String
  moduleName              String
  fieldModified           String
  oldValue                String
  newValue                String
  summaryText             String
  createdAt               DateTime      @default(now())
}

model Invoice {
  id                      String        @id @default(uuid())
  enterpriseId            String
  enterprise              Enterprise    @relation(fields: [enterpriseId], references: [id])
  invoiceUUID             String        @unique @default(uuid())
  localInvoiceNumber      String
  issueDate               DateTime
  buyerTaxNumber          String?
  buyerName               String?
  subtotalJod             Decimal       @db.Decimal(12, 3)
  taxTotalJod             Decimal       @db.Decimal(12, 3)
  grandTotalJod           Decimal       @db.Decimal(12, 3)
  qrPayloadBase64         String        @db.Text
  digitalHashSha256       String
  status                  InvoiceStatus @default(DRAFT)
  istdAcknowledgementNo   String?
  createdAt               DateTime      @default(now())
}

model FixedAsset {
  id                      String        @id @default(uuid())
  enterpriseId            String
  enterprise              Enterprise    @relation(fields: [enterpriseId], references: [id])
  assetCode               String
  assetName               String
  category                String
  purchaseDate            DateTime
  acquisitionCostJod      Decimal       @db.Decimal(12, 3)
  salvageValueJod         Decimal       @default(0) @db.Decimal(12, 3)
  bookDepreciationRate    Decimal       @db.Decimal(5, 4)
  accumulatedDeprJod      Decimal       @default(0) @db.Decimal(12, 3)
  createdAt               DateTime      @default(now())
}

model BankReconciliation {
  id                      String        @id @default(uuid())
  enterpriseId            String
  enterprise              Enterprise    @relation(fields: [enterpriseId], references: [id])
  statementDate           DateTime
  bankEndingBalanceJod    Decimal       @db.Decimal(12, 3)
  bookEndingBalanceJod    Decimal       @db.Decimal(12, 3)
  isBalanced              Boolean       @default(false)
  unmatchedItemsCount     Int           @default(0)
  createdAt               DateTime      @default(now())
}

model TaxReturn {
  id                      String        @id @default(uuid())
  enterpriseId            String
  enterprise              Enterprise    @relation(fields: [enterpriseId], references: [id])
  taxType                 String
  taxYear                 Int
  taxQuarter              Int?
  netTaxPayableJod        Decimal       @db.Decimal(12, 3)
  netCreditRefundJod      Decimal       @db.Decimal(12, 3)
  submissionStatus        String        @default("PENDING")
  acknowledgementNo       String?
  rawExportJson           String?       @db.Text
  createdAt               DateTime      @default(now())
}`;
