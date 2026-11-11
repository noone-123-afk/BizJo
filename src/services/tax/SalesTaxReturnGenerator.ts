import Decimal from 'decimal.js';

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export interface SalesInvoiceRecord {
  invoiceId: string;
  issueDate: string;
  customerName: string;
  category:
    | 'DOMESTIC_STANDARD_16'
    | 'DOMESTIC_REDUCED_10'
    | 'DOMESTIC_REDUCED_4'
    | 'EXPORT_AND_FREE_ZONES_0'
    | 'EXEMPT_SUPPLIES';
  netAmount: number;
  taxRate: number;
}

export interface PurchaseInvoiceRecord {
  invoiceId: string;
  supplierTaxId: string;
  supplierName: string;
  category: 'LOCAL_TAXABLE_PURCHASES' | 'IMPORTED_GOODS_CUSTOMS' | 'REVERSE_CHARGE_SERVICES';
  netAmount: number;
  paidTaxAmount: number;
  isDirectlyAttributedToExempt: boolean;
  isCommonOverheadInput: boolean;
  hasValidJoFotaraQr: boolean;
}

export class SalesTaxReturnGenerator {
  public static generateBiMonthlyReturn(
    taxNumber: string,
    taxpayerName: string,
    periodLabel: string,
    salesInvoices: SalesInvoiceRecord[],
    purchaseInvoices: PurchaseInvoiceRecord[],
    carriedForwardCreditJod: number = 0
  ) {
    let standard16Base = new Decimal(0);
    let standard16Tax = new Decimal(0);
    let reduced10Base = new Decimal(0);
    let reduced10Tax = new Decimal(0);
    let reduced4Base = new Decimal(0);
    let reduced4Tax = new Decimal(0);
    let zeroRatedExportsBase = new Decimal(0);
    let exemptSuppliesBase = new Decimal(0);

    salesInvoices.forEach((inv) => {
      const net = Decimal.max(0, new Decimal(inv.netAmount || 0));
      if (inv.category === 'DOMESTIC_STANDARD_16') {
        standard16Base = standard16Base.plus(net);
        standard16Tax = standard16Tax.plus(net.times('0.16'));
      } else if (inv.category === 'DOMESTIC_REDUCED_10') {
        reduced10Base = reduced10Base.plus(net);
        reduced10Tax = reduced10Tax.plus(net.times('0.10'));
      } else if (inv.category === 'DOMESTIC_REDUCED_4') {
        reduced4Base = reduced4Base.plus(net);
        reduced4Tax = reduced4Tax.plus(net.times('0.04'));
      } else if (inv.category === 'EXPORT_AND_FREE_ZONES_0') {
        zeroRatedExportsBase = zeroRatedExportsBase.plus(net);
      } else if (inv.category === 'EXEMPT_SUPPLIES') {
        exemptSuppliesBase = exemptSuppliesBase.plus(net);
      }
    });

    const totalTaxableAndZeroBase = standard16Base
      .plus(reduced10Base)
      .plus(reduced4Base)
      .plus(zeroRatedExportsBase);
    const totalSalesTurnover = totalTaxableAndZeroBase.plus(exemptSuppliesBase);
    const totalOutputTaxDue = standard16Tax.plus(reduced10Tax).plus(reduced4Tax);

    // Input Tax Apportionment Ratio = (Taxable + Zero-Rated) / Total Sales Turnover
    const apportionmentRatio = totalSalesTurnover.greaterThan(0)
      ? totalTaxableAndZeroBase.dividedBy(totalSalesTurnover)
      : new Decimal(1);

    let localPurchasesTax = new Decimal(0);
    let importsCustomsTax = new Decimal(0);
    let reverseChargeInputTax = new Decimal(0);
    let commonOverheadTaxTotal = new Decimal(0);
    let directTaxableInputTax = new Decimal(0);

    purchaseInvoices.forEach((pur) => {
      if (!pur.hasValidJoFotaraQr && pur.category === 'LOCAL_TAXABLE_PURCHASES') {
        return; // Unverified local invoice cannot be claimed for input VAT credit
      }
      if (pur.isDirectlyAttributedToExempt) {
        return;
      }

      const vat = Decimal.max(0, new Decimal(pur.paidTaxAmount || 0));
      if (pur.category === 'LOCAL_TAXABLE_PURCHASES') {
        localPurchasesTax = localPurchasesTax.plus(vat);
      } else if (pur.category === 'IMPORTED_GOODS_CUSTOMS') {
        importsCustomsTax = importsCustomsTax.plus(vat);
      } else if (pur.category === 'REVERSE_CHARGE_SERVICES') {
        reverseChargeInputTax = reverseChargeInputTax.plus(vat);
      }

      if (pur.isCommonOverheadInput) {
        commonOverheadTaxTotal = commonOverheadTaxTotal.plus(vat);
      } else {
        directTaxableInputTax = directTaxableInputTax.plus(vat);
      }
    });

    const allowedCommonInputTax = commonOverheadTaxTotal.times(apportionmentRatio);
    const disallowedCommonInputTax = commonOverheadTaxTotal.minus(allowedCommonInputTax);
    const netRecoverableInputTax = directTaxableInputTax.plus(allowedCommonInputTax);

    const carriedCreditDec = Decimal.max(0, new Decimal(carriedForwardCreditJod || 0));
    const totalDeductionsAndCredits = netRecoverableInputTax.plus(carriedCreditDec);
    const netDiff = totalOutputTaxDue.minus(totalDeductionsAndCredits);
    const netPayableToIstd = Decimal.max(0, netDiff);
    const creditCarriedToNextPeriod = netDiff.lessThan(0) ? netDiff.abs() : new Decimal(0);

    return {
      header: {
        taxNumber,
        taxpayerName,
        periodLabel,
        generatedAtIso: new Date().toISOString(),
        schemaVersion: 'ISTD-FORM4-2026',
      },
      outputTaxSchedule: {
        standard16Base: standard16Base.toDecimalPlaces(3).toNumber(),
        standard16Tax: standard16Tax.toDecimalPlaces(3).toNumber(),
        reduced10Base: reduced10Base.toDecimalPlaces(3).toNumber(),
        reduced10Tax: reduced10Tax.toDecimalPlaces(3).toNumber(),
        reduced4Base: reduced4Base.toDecimalPlaces(3).toNumber(),
        reduced4Tax: reduced4Tax.toDecimalPlaces(3).toNumber(),
        zeroRatedExportsBase: zeroRatedExportsBase.toDecimalPlaces(3).toNumber(),
        exemptSuppliesBase: exemptSuppliesBase.toDecimalPlaces(3).toNumber(),
        totalSalesTurnover: totalSalesTurnover.toDecimalPlaces(3).toNumber(),
        totalOutputTaxDue: totalOutputTaxDue.toDecimalPlaces(3).toNumber(),
      },
      inputTaxSchedule: {
        localPurchasesTax: localPurchasesTax.toDecimalPlaces(3).toNumber(),
        importsCustomsTax: importsCustomsTax.toDecimalPlaces(3).toNumber(),
        reverseChargeInputTax: reverseChargeInputTax.toDecimalPlaces(3).toNumber(),
        apportionmentRatioPercent: Number(apportionmentRatio.times(100).toFixed(2)),
        disallowedCommonInputTax: disallowedCommonInputTax.toDecimalPlaces(3).toNumber(),
        netRecoverableInputTax: netRecoverableInputTax.toDecimalPlaces(3).toNumber(),
      },
      summary: {
        carriedForwardCreditFromPrior: carriedCreditDec.toDecimalPlaces(3).toNumber(),
        totalDeductionsAndCredits: totalDeductionsAndCredits.toDecimalPlaces(3).toNumber(),
        netPayableToIstd: netPayableToIstd.toDecimalPlaces(3).toNumber(),
        creditCarriedToNextPeriod: creditCarriedToNextPeriod.toDecimalPlaces(3).toNumber(),
      },
    };
  }
}
