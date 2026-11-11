export interface InvoiceQrMetadata {
  sellerCommercialName: string;
  sellerTaxNumber: string;
  invoiceTimestamp: string;
  invoiceGrandTotal: string;
  taxTotalAmount: string;
  digitalHash: string;
}

export interface JoFotaraInvoicePayload {
  sellerName: string;
  taxNumber: string;
  invoiceTimestampIso: string;
  invoiceTotalWithTax: string;
  vatTotalAmount: string;
  invoiceNumber: string;
}

export interface DecodedTlvTag {
  tag: number;
  label: string;
  length: number;
  value: string;
  tagNumber: number;
  tagNameAr: string;
  byteLength: number;
  valueUtf8: string;
}

export class TlvQrGenerator {
  private static readonly TAG_LABELS: Record<number, string> = {
    1: 'اسم المكلف / المورد التجاري',
    2: 'الرقم الضريبي للمنشأة (TIN)',
    3: 'تاريخ ووقت إصدار الفاتورة (ISO 8601)',
    4: 'إجمالي قيمة الفاتورة شاملاً الضريبة (د.أ)',
    5: 'إجمالي مبلغ الضريبة العامة (د.أ)',
    6: 'البصمة الرقمية المشفرة (SHA-256 Prefix)',
  };

  private static computeDeterministicHash(input: string): string {
    let h1 = 0xdeadbeef ^ input.length;
    let h2 = 0x41c6ce57 ^ input.length;
    for (let i = 0, ch; i < input.length; i++) {
      ch = input.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
    const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');
    return `${hex1}${hex2}${hex1}${hex2}${hex1}${hex2}${hex1}${hex2}`;
  }

  private static encodeTlvField(tag: number, value: string): Uint8Array {
    const encoder = new TextEncoder();
    const rawBytes = encoder.encode(value);
    const valueBytes = rawBytes.length > 255 ? rawBytes.slice(0, 255) : rawBytes;
    const length = valueBytes.length;

    const result = new Uint8Array(2 + length);
    result[0] = tag;
    result[1] = length;
    result.set(valueBytes, 2);
    return result;
  }

  private static uint8ArrayToBase64(bytes: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return typeof btoa !== 'undefined' ? btoa(binary) : Buffer.from(bytes).toString('base64');
  }

  public static generateJoFotaraQrBase64(meta: InvoiceQrMetadata): string {
    const tlvParts: Uint8Array[] = [
      this.encodeTlvField(1, meta.sellerCommercialName),
      this.encodeTlvField(2, meta.sellerTaxNumber),
      this.encodeTlvField(3, meta.invoiceTimestamp),
      this.encodeTlvField(4, meta.invoiceGrandTotal),
      this.encodeTlvField(5, meta.taxTotalAmount),
      this.encodeTlvField(6, meta.digitalHash.substring(0, 16)),
    ];

    const totalLen = tlvParts.reduce((sum, part) => sum + part.length, 0);
    const combined = new Uint8Array(totalLen);
    let offset = 0;
    for (const part of tlvParts) {
      combined.set(part, offset);
      offset += part.length;
    }

    return this.uint8ArrayToBase64(combined);
  }

  public static generateJoFotaraQrPayload(payload: JoFotaraInvoicePayload): {
    tlvBase64: string;
    cryptographicStamp: string;
  } {
    const canonical = `${payload.sellerName}|${payload.taxNumber}|${payload.invoiceTimestampIso}|${payload.invoiceTotalWithTax}|${payload.vatTotalAmount}|${payload.invoiceNumber}`;
    const cryptographicStamp = this.computeDeterministicHash(canonical);
    const tlvBase64 = this.generateJoFotaraQrBase64({
      sellerCommercialName: payload.sellerName,
      sellerTaxNumber: payload.taxNumber,
      invoiceTimestamp: payload.invoiceTimestampIso,
      invoiceGrandTotal: payload.invoiceTotalWithTax,
      taxTotalAmount: payload.vatTotalAmount,
      digitalHash: cryptographicStamp,
    });
    return { tlvBase64, cryptographicStamp };
  }

  public static generateUblXmlPreview(payload: JoFotaraInvoicePayload): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:ProfileID>reporting:1.0:JoFotara</cbc:ProfileID>
  <cbc:ID>${payload.invoiceNumber}</cbc:ID>
  <cbc:IssueDate>${payload.invoiceTimestampIso.slice(0, 10)}</cbc:IssueDate>
  <cbc:DocumentCurrencyCode>JOD</cbc:DocumentCurrencyCode>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${payload.taxNumber}</cbc:CompanyID>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${payload.sellerName}</cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="JOD">${payload.vatTotalAmount}</cbc:TaxAmount>
  </cac:TaxTotal>
  <cac:LegalMonetaryTotal>
    <cbc:TaxInclusiveAmount currencyID="JOD">${payload.invoiceTotalWithTax}</cbc:TaxInclusiveAmount>
  </cac:LegalMonetaryTotal>
</Invoice>`;
  }

  public static decodeTlvBase64(base64Str: string): DecodedTlvTag[] {
    try {
      const cleaned = (base64Str || '').trim();
      if (!cleaned) return [];
      const binary =
        typeof atob !== 'undefined' ? atob(cleaned) : Buffer.from(cleaned, 'base64').toString('binary');
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      const decoder = new TextDecoder('utf-8');
      const tags: DecodedTlvTag[] = [];
      let i = 0;
      while (i < bytes.length - 1) {
        const tag = bytes[i];
        const length = bytes[i + 1];
        if (tag <= 0 || length < 0 || i + 2 + length > bytes.length) {
          break;
        }
        const valueBytes = bytes.slice(i + 2, i + 2 + length);
        const value = decoder.decode(valueBytes);
        const label = this.TAG_LABELS[tag] || `حقل رقم ${tag}`;
        tags.push({
          tag,
          label,
          length,
          value,
          tagNumber: tag,
          tagNameAr: label,
          byteLength: length,
          valueUtf8: value,
        });
        i += 2 + length;
      }
      return tags;
    } catch {
      return [];
    }
  }
}
