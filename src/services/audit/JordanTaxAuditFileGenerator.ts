import Decimal from 'decimal.js';

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export interface TaxAuditExportPayload {
  companyHeader: {
    tin: string;
    crn: string;
    legalName: string;
    fiscalYear: number;
    periodStartDate: string;
    periodEndDate: string;
  };
  chartOfAccounts: Array<{
    accountCode: string;
    accountName: string;
    standardType: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
    openingBalance: number;
    closingBalance: number;
  }>;
  generalLedgerEntries: Array<{
    journalId: string;
    transactionDate: string;
    description: string;
    lines: Array<{
      accountCode: string;
      debit: number;
      credit: number;
    }>;
  }>;
  salesInvoicesJoFotara: Array<{
    uuid: string;
    invoiceNo: string;
    issueDate: string;
    buyerTaxNo?: string;
    netAmount: number;
    salesTax16: number;
    grandTotal: number;
    hash: string;
  }>;
}

export class JordanTaxAuditFileGenerator {
  private static async computeSha256Hex(input: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  public static async generateStandardAuditFile(payload: TaxAuditExportPayload) {
    let totalDebit = new Decimal(0);
    let totalCredit = new Decimal(0);
    let totalTax = new Decimal(0);

    payload.generalLedgerEntries.forEach((entry) => {
      entry.lines.forEach((line) => {
        totalDebit = totalDebit.plus(new Decimal(line.debit || 0));
        totalCredit = totalCredit.plus(new Decimal(line.credit || 0));
      });
    });

    payload.salesInvoicesJoFotara.forEach((inv) => {
      totalTax = totalTax.plus(new Decimal(inv.salesTax16 || 0));
    });

    const isBalanced = totalDebit.equals(totalCredit);
    if (!isBalanced) {
      throw new Error(`خلل في توازن القيود: المدين (${totalDebit.toFixed(3)}) != الدائن (${totalCredit.toFixed(3)})`);
    }

    const auditFileStructure = {
      auditFileHeader: {
        auditFileVersion: 'JO-SAF-T-2026.1',
        auditJurisdiction: 'Jordan / ISTD',
        generatedAt: new Date().toISOString(),
        companyMetadata: payload.companyHeader,
      },
      masterFiles: {
        generalLedgerAccounts: payload.chartOfAccounts,
      },
      generalLedgerEntries: {
        totalCount: payload.generalLedgerEntries.length,
        totalDebit: totalDebit.toFixed(3),
        totalCredit: totalCredit.toFixed(3),
        journals: payload.generalLedgerEntries,
      },
      sourceDocuments: {
        eInvoicesJoFotara: payload.salesInvoicesJoFotara,
      },
    };

    const rawJsonExport = JSON.stringify(auditFileStructure, null, 2);
    const digitalChecksumSha256 = await this.computeSha256Hex(rawJsonExport);

    return {
      fileName: `SAF_T_JO_${payload.companyHeader.tin}_${payload.companyHeader.fiscalYear}.json`,
      digitalChecksumSha256,
      rawJsonExport,
      summaryStatistics: {
        totalAccounts: payload.chartOfAccounts.length,
        totalJournalEntries: payload.generalLedgerEntries.length,
        totalJoFotaraInvoices: payload.salesInvoicesJoFotara.length,
        totalDebitsJod: totalDebit.toFixed(3),
        totalCreditsJod: totalCredit.toFixed(3),
        totalTaxAuditedJod: totalTax.toFixed(3),
      },
    };
  }
}
