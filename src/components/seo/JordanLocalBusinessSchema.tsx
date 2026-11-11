import React from 'react';

export default function JordanLocalBusinessSchema() {
  const schemaGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['AccountingService', 'TaxService', 'LegalService'],
        name: 'منصة الأعمال والمحاسبة والامتثال الضريبي الأردنية',
        description:
          'منصة رقمية متكاملة تساعد الأفراد والشركات ورواد الأعمال على إدارة الحسابات والضرائب والفواتير الإلكترونية وتحليل الأداء المالي وفق التشريعات والأنظمة المعمول بها في المملكة الأردنية الهاشمية.',
        url: typeof window !== 'undefined' ? window.location.origin : 'https://jordan-business-hub.jo',
        telephone: '+962-6-5000000',
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
        name: 'منصة الأعمال والمحاسبة والامتثال الضريبي الأردنية',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'All',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'JOD',
        },
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
