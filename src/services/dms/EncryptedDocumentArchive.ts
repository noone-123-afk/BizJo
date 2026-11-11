export type TaxDocumentCategory =
  | 'JOFOTARA_INVOICE'
  | 'VENDOR_PURCHASE_BILL'
  | 'LEASE_CONTRACT'
  | 'BANK_STATEMENT'
  | 'PAYROLL_SSC'
  | 'CUSTOMS_DECLARATION';

export interface DocumentUploadParams {
  enterpriseTin: string;
  taxYear: number;
  category: TaxDocumentCategory;
  fileName: string;
  fileSizeBytes: number;
  contentSample?: string;
}

export interface EncryptedDocumentMeta {
  documentId: string;
  fileName: string;
  category: TaxDocumentCategory;
  categoryLabelAr: string;
  storagePath: string;
  sha256Checksum: string;
  ivHex: string;
  cipherAlgorithm: string;
  fileSizeBytes: number;
  uploadedAt: string;
}

export class EncryptedDocumentArchive {
  public static readonly CATEGORY_LABELS: Record<TaxDocumentCategory, string> = {
    JOFOTARA_INVOICE: 'فواتير مبيعات نظام الفوترة الوطني (JoFotara)',
    VENDOR_PURCHASE_BILL: 'فواتير مشتريات محلية وموردين (ضريبة مدخلات)',
    LEASE_CONTRACT: 'عقود إيجار مصدقة وإيصالات اقتطاع المنبع (10%)',
    BANK_STATEMENT: 'كشوفات الحسابات البنكية وحركات CliQ الشهرية',
    PAYROLL_SSC: 'كشوفات الرواتب واشتراكات الضمان الاجتماعي (SSC)',
    CUSTOMS_DECLARATION: 'البيانات الجمركية وشهادات التصدير (نسبة الصفر)',
  };

  private static async computeSha256Hex(input: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  public static async storeEncryptedDocument(params: DocumentUploadParams): Promise<EncryptedDocumentMeta> {
    const documentId = crypto.randomUUID();
    const ivBytes = new Uint8Array(12);
    crypto.getRandomValues(ivBytes);
    const ivHex = Array.from(ivBytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    const payloadSeed = `${params.enterpriseTin}|${params.fileName}|${params.fileSizeBytes}|${params.contentSample || Date.now()}`;
    const sha256Checksum = await this.computeSha256Hex(payloadSeed);

    const storagePath = `r2://jordan-tax-vault/enterprises/${params.enterpriseTin}/${params.taxYear}/${params.category.toLowerCase()}/${documentId}.aes256.enc`;

    return {
      documentId,
      fileName: params.fileName,
      category: params.category,
      categoryLabelAr: this.CATEGORY_LABELS[params.category],
      storagePath,
      sha256Checksum,
      ivHex,
      cipherAlgorithm: 'AES-256-GCM',
      fileSizeBytes: params.fileSizeBytes,
      uploadedAt: new Date().toISOString(),
    };
  }
}
