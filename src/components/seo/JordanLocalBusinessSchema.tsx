import React from 'react';
import { SidebarItemId } from '../erp/SimpleHomeDashboard';
import { BizJoSeoEngine } from '../../services/seo/BizJoSeoEngine';

interface JordanLocalBusinessSchemaProps {
  activeSection?: SidebarItemId;
}

export default function JordanLocalBusinessSchema({
  activeSection = 'biz-dashboard',
}: JordanLocalBusinessSchemaProps) {
  const meta = BizJoSeoEngine.getMetadataForSection(activeSection);
  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://bizjo.jo';
  const fullPageUrl = `${originUrl}${meta.canonicalPath}`;

  const schemaGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['AccountingService', 'TaxService', 'LegalService'],
        '@id': `${originUrl}/#organization`,
        name: 'BizJo — منصة الأعمال والمحاسبة والامتثال الضريبي الأردنية',
        alternateName: 'BizJo ERP Jordan',
        description:
          'BizJo: منصة رقمية متكاملة تساعد الأفراد والشركات ورواد الأعمال على إدارة الحسابات والضرائب والفواتير الإلكترونية وتحليل الأداء المالي وفق التشريعات والأنظمة المعمول بها في المملكة الأردنية الهاشمية.',
        url: originUrl,
        telephone: '+962-6-5000000',
        email: 'one497303@gmail.com',
        priceRange: 'JOD',
        currenciesAccepted: 'JOD',
        paymentAccepted: 'CliQ, Credit Card, Bank Wire',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'شارع مكة، مجمع الأعمال، بوليفارد العبدلي',
          addressLocality: 'عمان',
          addressRegion: 'العاصمة',
          addressCountry: 'JO',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: '31.9539',
          longitude: '35.9106',
        },
      },
      {
        '@type': 'WebApplication',
        '@id': `${originUrl}/#webapp`,
        name: meta.title,
        url: fullPageUrl,
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'All',
        inLanguage: ['ar-JO', 'en'],
        description: meta.metaDescription,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'JOD',
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${fullPageUrl}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'BizJo الرئيسية',
            item: `${originUrl}/business/dashboard`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: meta.directoryNameAr,
            item: `${originUrl}/${meta.directorySlug}`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: meta.breadcrumbLabelAr,
            item: fullPageUrl,
          },
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': `${originUrl}/#faq`,
        mainEntity: [
          {
            '@type': 'Question',
            name: 'كيف تتم الدورة المحاسبية من الفاتورة إلى الإقرار الضريبي داخل منصة BizJo؟',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'عند إصدار أي فاتورة مبيعات أو تحويل عرض سعر أو عقد أو سند قبض/صرف في BizJo، يقوم المحرك آلياً بتوليد قيد يومية مزدوج متوازن بالدينار والفلس الأردني، وترحيله فوراً إلى دفتر الأستاذ العام وكشف حساب العميل أو المورد، وتحديث ميزان المراجعة وقائمة الدخل والمركز المالي وإقرار ضريبة المبيعات.',
            },
          },
          {
            '@type': 'Question',
            name: 'ما هي نسب ضريبة المبيعات واشتراكات الضمان الاجتماعي المعتمدة في الأردن؟',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'النسبة القياسية للضريبة العامة على المبيعات في الأردن هي 16% (مع نسب مخفضة 4% و0%). أما اشتراك الضمان الاجتماعي الشهري فيبلغ إجماليه 21.75% من الأجر الخاضع (7.5% حصة الموظف و14.25% حصة الشركة، وتضاف 1% للمهن الخطرة).',
            },
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph) }}
    />
  );
}

