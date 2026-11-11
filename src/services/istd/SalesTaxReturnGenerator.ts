import Decimal from 'decimal.js';

Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP });

export interface SalesReturnItemInput {
  invoiceNumber: string;
  invoiceDate: string;
  buyerTaxNumber?: string;
  buyerName?: string;
  taxCategory: 'STANDARD_16' | 'REDUCED_10' | 'REDUCED_4' | 'ZERO_RATED' | 'EXEMPT';
  taxableBaseAmount: number | string;
}

export interface PurchaseReturnItemInput {
  vendorInvoiceNumber: string;
  invoiceDate: string;
  vendorTaxNumber: string;
  vendorName: string;
  purchaseCategory: 'LOCAL_PURCHASE' | 'IMPORT' | 'CAPITAL_ASSETS';
  taxableBaseAmount: number | string;
  inputTaxPaid: number | string;
}

export interface QuarterlySalesTaxReturnParams {
  taxpayerTIN: string;
  commercialRegistrationNo: string;
  taxpayerName: string;
  taxYear: number;
  taxQuarter: 1 | 2 | 3 | 4;
  salesList: SalesReturnItemInput[];
  purchasesList: PurchaseReturnItemInput[];
  carriedForwardCredit?: number | string;
}

export interface ISTDStandardReturnFormat {
  header: {
    tin: string;
    crn: string;
    taxpayerName: string;
    taxYear: number;
    quarter: number;
    submissionDate: string;
    schemaVersion: string;
  };
  summary: {
    totalGrossSales: string; // إجمالي المبيعات الصافية قبل الضريبة
    totalSalesIncludingTax: string; // إجمالي المبيعات شاملاً الضريبة
    standardRateSales16: string;
    taxDueOnStandardRate: string;
    reducedRateSales: string;
    taxDueOnReducedRate: string;
    zeroRatedSales: string;
    exemptSales: string;
    totalOutputTaxDue: string;
    totalDeductiblePurchases: string;
    totalInputTaxDeductible: string;
    carriedForwardCredit: string;
    totalDeductionsAndCredits: string;
    netTaxPayable: string;
    netRefundableTaxCredit: string;
  };
  details: {
    salesSchedule: Array<{
      invNo: string;
      date: string;
      buyerTin: string;
      category: string;
      baseAmt: string;
      taxRate: string;
      taxAmt: string;
      totalWithTaxAmt: string;
    }>;
    purchasesSchedule: Array<{
      invNo: string;
      date: string;
      vendorTin: string;
      vendorName: string;
      category: string;
      baseAmt: string;
      inputTaxClaimed: string;
    }>;
  };
}

export class SalesTaxReturnGenerator {
  private static readonly RATE_STANDARD_16 = new Decimal('0.16');
  private static readonly RATE_REDUCED_10 = new Decimal('0.10');
  private static readonly RATE_REDUCED_4 = new Decimal('0.04');

  public static generateISTDJson(params: QuarterlySalesTaxReturnParams): ISTDStandardReturnFormat {
    let salesTotal = new Decimal(0);
    let sales16 = new Decimal(0);
    let tax16 = new Decimal(0);
    let salesReduced = new Decimal(0);
    let taxReduced = new Decimal(0);
    let salesZero = new Decimal(0);
    let salesExempt = new Decimal(0);

    const formattedSales = params.salesList.map((item) => {
      const base = Decimal.max(0, new Decimal(item.taxableBaseAmount || 0)).toDecimalPlaces(3, Decimal.ROUND_HALF_UP);
      salesTotal = salesTotal.plus(base).toDecimalPlaces(3);
      let taxAmount = new Decimal(0);
      let appliedRateStr = '0%';

      switch (item.taxCategory) {
        case 'STANDARD_16':
          taxAmount = base.times(this.RATE_STANDARD_16).toDecimalPlaces(3, Decimal.ROUND_HALF_UP);
          sales16 = sales16.plus(base).toDecimalPlaces(3);
          tax16 = tax16.plus(taxAmount).toDecimalPlaces(3);
          appliedRateStr = '16%';
          break;
        case 'REDUCED_10':
          taxAmount = base.times(this.RATE_REDUCED_10).toDecimalPlaces(3, Decimal.ROUND_HALF_UP);
          salesReduced = salesReduced.plus(base).toDecimalPlaces(3);
          taxReduced = taxReduced.plus(taxAmount).toDecimalPlaces(3);
          appliedRateStr = '10%';
          break;
        case 'REDUCED_4':
          taxAmount = base.times(this.RATE_REDUCED_4).toDecimalPlaces(3, Decimal.ROUND_HALF_UP);
          salesReduced = salesReduced.plus(base).toDecimalPlaces(3);
          taxReduced = taxReduced.plus(taxAmount).toDecimalPlaces(3);
          appliedRateStr = '4%';
          break;
        case 'ZERO_RATED':
          salesZero = salesZero.plus(base).toDecimalPlaces(3);
          appliedRateStr = '0% (صفر)';
          break;
        case 'EXEMPT':
          salesExempt = salesExempt.plus(base).toDecimalPlaces(3);
          appliedRateStr = 'معفى';
          break;
      }

      const lineTotalWithTax = base.plus(taxAmount).toDecimalPlaces(3);

      return {
        invNo: item.invoiceNumber,
        date: item.invoiceDate,
        buyerTin: item.buyerTaxNumber || 'CONSUMER',
        category: item.taxCategory,
        baseAmt: base.toFixed(3),
        taxRate: appliedRateStr,
        taxAmt: taxAmount.toFixed(3),
        totalWithTaxAmt: lineTotalWithTax.toFixed(3),
      };
    });

    const totalOutputTax = tax16.plus(taxReduced).toDecimalPlaces(3);
    const totalSalesIncludingTax = salesTotal.plus(totalOutputTax).toDecimalPlaces(3);

    let purchasesTotal = new Decimal(0);
    let totalInputTaxDeductible = new Decimal(0);

    const formattedPurchases = params.purchasesList.map((p) => {
      const base = Decimal.max(0, new Decimal(p.taxableBaseAmount || 0)).toDecimalPlaces(3, Decimal.ROUND_HALF_UP);
      const taxPaid = Decimal.max(0, new Decimal(p.inputTaxPaid || 0)).toDecimalPlaces(3, Decimal.ROUND_HALF_UP);
      purchasesTotal = purchasesTotal.plus(base).toDecimalPlaces(3);
      totalInputTaxDeductible = totalInputTaxDeductible.plus(taxPaid).toDecimalPlaces(3);

      return {
        invNo: p.vendorInvoiceNumber,
        date: p.invoiceDate,
        vendorTin: p.vendorTaxNumber,
        vendorName: p.vendorName,
        category: p.purchaseCategory,
        baseAmt: base.toFixed(3),
        inputTaxClaimed: taxPaid.toFixed(3),
      };
    });

    const carriedCredit = Decimal.max(0, new Decimal(params.carriedForwardCredit || 0)).toDecimalPlaces(3, Decimal.ROUND_HALF_UP);
    const totalDeductions = totalInputTaxDeductible.plus(carriedCredit).toDecimalPlaces(3);
    const netDifference = totalOutputTax.minus(totalDeductions).toDecimalPlaces(3);

    return {
      header: {
        tin: params.taxpayerTIN,
        crn: params.commercialRegistrationNo,
        taxpayerName: params.taxpayerName,
        taxYear: params.taxYear,
        quarter: params.taxQuarter,
        submissionDate: new Date().toISOString().split('T')[0],
        schemaVersion: 'JO-ISTD-GST-v2.1',
      },
      summary: {
        totalGrossSales: salesTotal.toFixed(3),
        totalSalesIncludingTax: totalSalesIncludingTax.toFixed(3),
        standardRateSales16: sales16.toFixed(3),
        taxDueOnStandardRate: tax16.toFixed(3),
        reducedRateSales: salesReduced.toFixed(3),
        taxDueOnReducedRate: taxReduced.toFixed(3),
        zeroRatedSales: salesZero.toFixed(3),
        exemptSales: salesExempt.toFixed(3),
        totalOutputTaxDue: totalOutputTax.toFixed(3),
        totalDeductiblePurchases: purchasesTotal.toFixed(3),
        totalInputTaxDeductible: totalInputTaxDeductible.toFixed(3),
        carriedForwardCredit: carriedCredit.toFixed(3),
        totalDeductionsAndCredits: totalDeductions.toFixed(3),
        netTaxPayable: netDifference.greaterThan(0) ? netDifference.toFixed(3) : '0.000',
        netRefundableTaxCredit: netDifference.lessThan(0) ? netDifference.abs().toFixed(3) : '0.000',
      },
      details: {
        salesSchedule: formattedSales,
        purchasesSchedule: formattedPurchases,
      },
    };
  }
}
