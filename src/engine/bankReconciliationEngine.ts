import Decimal from 'decimal.js';

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export interface BankStatementLine {
  transactionId: string;
  valueDate: string;
  description: string;
  referenceNumber?: string;
  debit: number;
  credit: number;
}

export interface GeneralLedgerBankEntry {
  entryId: string;
  entryDate: string;
  documentNo: string;
  memo: string;
  cliqReferenceCode?: string;
  amount: number;
  isReconciled: boolean;
}

export interface ReconciliationSummary {
  statementEndingBalance: string;
  ledgerEndingBalance: string;
  totalMatchedJod: string;
  unreconciledBankItemsCount: number;
  unreconciledLedgerItemsCount: number;
  adjustedBankBalance: string;
  adjustedBookBalance: string;
  isBalanced: boolean;
  matchedPairs: Array<{
    bankTxnId: string;
    ledgerEntryId: string;
    amount: string;
    matchMethod: 'EXACT_REFERENCE' | 'AMOUNT_AND_DATE';
  }>;
  outstandingDeposits: BankStatementLine[];
  outstandingChecksAndPayments: GeneralLedgerBankEntry[];
}

export class BankReconciliationEngine {
  public static reconcile(
    bankOpeningBalance: number,
    ledgerOpeningBalance: number,
    bankLines: BankStatementLine[],
    ledgerEntries: GeneralLedgerBankEntry[]
  ): ReconciliationSummary {
    const matchedPairs: ReconciliationSummary['matchedPairs'] = [];
    const matchedBankIds = new Set<string>();
    const matchedLedgerIds = new Set<string>();
    let totalMatched = new Decimal(0);

    for (const bankLine of bankLines) {
      const bankRef = (bankLine.referenceNumber || '').trim().toUpperCase();
      if (!bankRef) continue;

      const ledgerMatch = ledgerEntries.find(
        (l) =>
          !matchedLedgerIds.has(l.entryId) &&
          (l.cliqReferenceCode?.toUpperCase() === bankRef || l.documentNo.toUpperCase() === bankRef)
      );

      if (ledgerMatch) {
        matchedBankIds.add(bankLine.transactionId);
        matchedLedgerIds.add(ledgerMatch.entryId);
        const matchAmt = new Decimal(Math.abs(ledgerMatch.amount));
        totalMatched = totalMatched.plus(matchAmt);

        matchedPairs.push({
          bankTxnId: bankLine.transactionId,
          ledgerEntryId: ledgerMatch.entryId,
          amount: matchAmt.toFixed(3),
          matchMethod: 'EXACT_REFERENCE',
        });
      }
    }

    for (const bankLine of bankLines) {
      if (matchedBankIds.has(bankLine.transactionId)) continue;

      const bankNetAmt = new Decimal(bankLine.credit).minus(new Decimal(bankLine.debit));
      const ledgerMatch = ledgerEntries.find((l) => {
        if (matchedLedgerIds.has(l.entryId)) return false;
        const ledgerAmt = new Decimal(l.amount);
        if (!ledgerAmt.equals(bankNetAmt)) return false;

        const bDate = new Date(bankLine.valueDate).getTime();
        const lDate = new Date(l.entryDate).getTime();
        const diffDays = Math.abs(bDate - lDate) / (1000 * 3600 * 24);
        return diffDays <= 3;
      });

      if (ledgerMatch) {
        matchedBankIds.add(bankLine.transactionId);
        matchedLedgerIds.add(ledgerMatch.entryId);
        const matchAmt = bankNetAmt.abs();
        totalMatched = totalMatched.plus(matchAmt);

        matchedPairs.push({
          bankTxnId: bankLine.transactionId,
          ledgerEntryId: ledgerMatch.entryId,
          amount: matchAmt.toFixed(3),
          matchMethod: 'AMOUNT_AND_DATE',
        });
      }
    }

    const outstandingDeposits = bankLines.filter((b) => !matchedBankIds.has(b.transactionId));
    const outstandingChecksAndPayments = ledgerEntries.filter((l) => !matchedLedgerIds.has(l.entryId));

    let bankEnding = new Decimal(bankOpeningBalance);
    for (const b of bankLines) {
      bankEnding = bankEnding.plus(new Decimal(b.credit)).minus(new Decimal(b.debit));
    }

    let ledgerEnding = new Decimal(ledgerOpeningBalance);
    for (const l of ledgerEntries) {
      ledgerEnding = ledgerEnding.plus(new Decimal(l.amount));
    }

    let adjustedBank = bankEnding;
    for (const l of outstandingChecksAndPayments) {
      adjustedBank = adjustedBank.plus(new Decimal(l.amount));
    }

    let adjustedBook = ledgerEnding;
    for (const b of outstandingDeposits) {
      adjustedBook = adjustedBook.plus(new Decimal(b.credit)).minus(new Decimal(b.debit));
    }

    const isBalanced = adjustedBank.minus(adjustedBook).abs().lessThan(new Decimal('0.005'));

    return {
      statementEndingBalance: bankEnding.toFixed(3),
      ledgerEndingBalance: ledgerEnding.toFixed(3),
      totalMatchedJod: totalMatched.toFixed(3),
      unreconciledBankItemsCount: outstandingDeposits.length,
      unreconciledLedgerItemsCount: outstandingChecksAndPayments.length,
      adjustedBankBalance: adjustedBank.toFixed(3),
      adjustedBookBalance: adjustedBook.toFixed(3),
      isBalanced,
      matchedPairs,
      outstandingDeposits,
      outstandingChecksAndPayments,
    };
  }
}
