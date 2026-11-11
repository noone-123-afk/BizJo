import Decimal from 'decimal.js';
import { TlvQrGenerator } from '../jofotara/TlvQrGenerator';

export interface PosLineItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
}

export interface PosTransactionPayload {
  posTerminalId: string;
  storeBranchId: string;
  cashierId: string;
  localInvoiceNumber: string;
  transactionTimestamp: string;
  items: PosLineItem[];
  paymentType: 'CASH' | 'CARD' | 'CLIQ';
  sellerTaxNumber: string;
  sellerCommercialName: string;
  buyerTaxNumber?: string;
  buyerName?: string;
}

export interface PosFastResponse {
  success: boolean;
  invoiceUUID: string;
  invoiceHash: string;
  qrPayloadBase64: string;
  subtotalJod: string;
  taxTotalJod: string;
  grandTotalJod: string;
  queuedForIstdSync: boolean;
}

export class PosJoFotaraWebhookGateway {
  private static async computeSha256Hex(input: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  public static async processPosInvoice(payload: PosTransactionPayload): Promise<PosFastResponse> {
    const invoiceUUID = crypto.randomUUID();

    let subtotal = new Decimal(0);
    let taxTotal = new Decimal(0);

    for (const item of payload.items) {
      const lineNet = new Decimal(item.quantity || 0).times(new Decimal(item.unitPrice || 0));
      const lineTax = lineNet.times(new Decimal(item.taxRate || 0));
      subtotal = subtotal.plus(lineNet);
      taxTotal = taxTotal.plus(lineTax);
    }

    const grandTotal = subtotal.plus(taxTotal);

    const subtotalStr = subtotal.toFixed(3);
    const taxTotalStr = taxTotal.toFixed(3);
    const grandTotalStr = grandTotal.toFixed(3);

    const canonicalInvoiceString = [
      invoiceUUID,
      payload.sellerTaxNumber,
      payload.localInvoiceNumber,
      payload.transactionTimestamp,
      subtotalStr,
      taxTotalStr,
      grandTotalStr,
    ].join('|');

    const invoiceHash = await this.computeSha256Hex(canonicalInvoiceString);

    const qrPayloadBase64 = TlvQrGenerator.generateJoFotaraQrBase64({
      sellerCommercialName: payload.sellerCommercialName,
      sellerTaxNumber: payload.sellerTaxNumber,
      invoiceTimestamp: payload.transactionTimestamp,
      invoiceGrandTotal: grandTotalStr,
      taxTotalAmount: taxTotalStr,
      digitalHash: invoiceHash,
    });

    return {
      success: true,
      invoiceUUID,
      invoiceHash,
      qrPayloadBase64,
      subtotalJod: subtotalStr,
      taxTotalJod: taxTotalStr,
      grandTotalJod: grandTotalStr,
      queuedForIstdSync: true,
    };
  }
}
