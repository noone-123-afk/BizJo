export type Language = 'ar' | 'en';

export const LOCALES = {
  ar: {
    common: {
      platformName: 'منصة الأعمال والمحاسبة والامتثال الضريبي الأردنية',
      shortBrand: 'منصة الأعمال والمحاسبة الأردنية · SME SaaS',
      brandSubtitle: 'منصة SaaS أردنية للمحاسبة والفوترة الإلكترونية والامتثال الضريبي للشركات الصغيرة والمتوسطة.',
      country: 'المملكة الأردنية الهاشمية',
      currency: 'دينار أردني',
      currencyCode: 'د.أ',
      save: 'حفظ البيانات',
      cancel: 'إلغاء',
      download: 'تنزيل المستند',
      exportJson: 'تصدير ملف JSON',
    },
    nav: {
      overview: 'الرئيسية والحاسبات',
      taxAndJoFotara: 'الضرائب والفوترة الإلكترونية',
      accountingLedgers: 'المحاسبة والدفاتر',
      auditAndJcpa: 'التدقيق وتحليل الأعمال',
      legalAndDocs: 'المكتبة القانونية والحوكمة',
      ctaAction: 'ابدأ الآن',
    },
    tax: {
      incomeTax: 'حاسبة ضريبة الدخل',
      salesTax: 'حاسبة المبيعات',
      nationalTaxNumber: 'الرقم الضريبي',
      personalExemption: 'الإعفاء الشخصي للمكلف (9,000 د.أ)',
      familyExemption: 'إعفاء المعيل والأسرة (18,000 د.أ)',
      withholdingTax: 'ضريبة الاقتطاع من المنبع (نموذج و/1)',
    },
    jofotara: {
      systemTitle: 'الفوترة الإلكترونية (JoFotara)',
      qrCode: 'رمز الاستجابة السريع (TLV Base64)',
      digitalSignature: 'البصمة الرقمية المشفرة (SHA-256)',
    },
  },
  en: {
    common: {
      platformName: 'Jordanian Business, Accounting & Tax Compliance SaaS Platform',
      shortBrand: 'Jordan Business & Accounting SaaS · SMEs',
      brandSubtitle: 'Jordanian SaaS platform for accounting, e-invoicing, and tax compliance for small and medium enterprises.',
      country: 'Hashemite Kingdom of Jordan',
      currency: 'Jordanian Dinar',
      currencyCode: 'JOD',
      save: 'Save Data',
      cancel: 'Cancel',
      download: 'Download Document',
      exportJson: 'Export JSON File',
    },
    nav: {
      overview: 'Overview & Calculators',
      taxAndJoFotara: 'Taxes & E-Invoicing',
      accountingLedgers: 'Accounting & Ledgers',
      auditAndJcpa: 'Audit & Business Analytics',
      legalAndDocs: 'Legal Library & Governance',
      ctaAction: 'Start Now',
    },
    tax: {
      incomeTax: 'Income Tax Calculator',
      salesTax: 'Sales Tax Calculator',
      nationalTaxNumber: 'Tax Identification Number',
      personalExemption: 'Personal Exemption (9,000 JOD)',
      familyExemption: 'Family / Dependent Exemption (18,000 JOD)',
      withholdingTax: 'Withholding Tax (WHT Form W/1)',
    },
    jofotara: {
      systemTitle: 'Electronic Invoicing Solutions (JoFotara)',
      qrCode: 'QR Code (TLV Base64 Format)',
      digitalSignature: 'Cryptographic SHA-256 Hash',
    },
  },
};
