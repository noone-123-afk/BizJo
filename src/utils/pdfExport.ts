export interface PdfReportSection {
  heading: string;
  rows: Array<{ label: string; value: string }>;
}

export interface PdfReportPayload {
  title: string;
  subtitle?: string;
  referenceNumber?: string;
  sections: PdfReportSection[];
  footerDisclaimer?: string;
}

export function exportArabicReportToPdf(payload: PdfReportPayload): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const htmlContent = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8" />
  <title>${payload.title}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
      margin: 32px;
      color: #0f172a;
      background: #ffffff;
      direction: rtl;
    }
    .header {
      border-bottom: 3px solid #059669;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .header h1 {
      margin: 0 0 6px 0;
      font-size: 22px;
      color: #0f172a;
    }
    .header p {
      margin: 0;
      font-size: 13px;
      color: #475569;
    }
    .meta {
      margin-top: 8px;
      font-size: 12px;
      color: #059669;
      font-weight: bold;
    }
    .section {
      margin-bottom: 20px;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      overflow: hidden;
    }
    .section-title {
      background: #f8fafc;
      padding: 10px 14px;
      font-weight: bold;
      font-size: 14px;
      border-bottom: 1px solid #e2e8f0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    td {
      padding: 9px 14px;
      border-bottom: 1px solid #f1f5f9;
    }
    td.val {
      font-family: monospace;
      font-weight: bold;
      text-align: left;
      color: #047857;
    }
    .footer {
      margin-top: 28px;
      padding-top: 12px;
      border-top: 1px solid #cbd5e1;
      font-size: 11px;
      color: #64748b;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${payload.title}</h1>
    ${payload.subtitle ? `<p>${payload.subtitle}</p>` : ''}
    <div class="meta">
      رقم المرجع: ${payload.referenceNumber || 'REP-2026'} · تاريخ الإصدار: ${new Date().toISOString().slice(0, 10)}
    </div>
  </div>
  ${payload.sections
    .map(
      (sec) => `
    <div class="section">
      <div class="section-title">${sec.heading}</div>
      <table>
        <tbody>
          ${sec.rows
            .map(
              (r) => `
            <tr>
              <td>${r.label}</td>
              <td class="val">${r.value}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>
  `
    )
    .join('')}
  <div class="footer">
    ${
      payload.footerDisclaimer ||
      'تم استخراج هذا التقرير المالي من منصة BizJo للأعمال والمحاسبة والامتثال الضريبي الأردنية. هذه المعلومات لأغراض العرض المالي والإرشادي ولا تعتبر استشارة قانونية أو ضريبية معتمدة.'
    }
  </div>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${payload.referenceNumber || 'Jordan_Financial_Report_2026'}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
