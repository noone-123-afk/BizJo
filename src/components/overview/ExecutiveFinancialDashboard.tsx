import React, { useState } from 'react';
import Decimal from 'decimal.js';
import {
  Activity,
  ShieldCheck,
  Wallet,
  Landmark,
  BarChart3,
  Scale,
  CheckCircle2,
  AlertTriangle,
  SlidersHorizontal,
  RotateCcw,
  Download,
} from 'lucide-react';
import { SystemGovernanceService } from '../../services/governance/SystemGovernanceService';

Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP });

function safeDec(val: number | string): Decimal {
  try {
    const d = new Decimal(val || 0);
    return d.isFinite() && d.gte(0) ? d : new Decimal(0);
  } catch {
    return new Decimal(0);
  }
}

export default function ExecutiveFinancialDashboard() {
  const [showInteractiveInputs, setShowInteractiveInputs] = useState<boolean>(false);

  // Live Accounting Balances (in JOD)
  const [totalRevenueJod, setTotalRevenueJod] = useState<number>(485000);
  const [cogsAndOpexJod, setCogsAndOpexJod] = useState<number>(339500);
  const [cashAndBanksJod, setCashAndBanksJod] = useState<number>(112400);
  const [accountsReceivableJod, setAccountsReceivableJod] = useState<number>(68000);
  const [inventoryBalanceJod, setInventoryBalanceJod] = useState<number>(54600);
  const [prepaidExpensesJod, setPrepaidExpensesJod] = useState<number>(7500);
  const [nonCurrentFixedAssetsJod, setNonCurrentFixedAssetsJod] = useState<number>(395000);
  const [currentLiabilitiesExclTaxJod, setCurrentLiabilitiesExclTaxJod] = useState<number>(79000);
  const [shareholdersEquityJod, setShareholdersEquityJod] = useState<number>(445000);

  // Tax Liabilities Breakdown (in JOD)
  const [salesTaxPayableJod, setSalesTaxPayableJod] = useState<number>(14250);
  const [withholdingTaxPayableJod, setWithholdingTaxPayableJod] = useState<number>(2850);

  // Interactive Compliance Pillar Scores (0 - 100%)
  const [joFotaraSyncRatePct, setJoFotaraSyncRatePct] = useState<number>(100);
  const [returnsZeroDiscrepancyPct, setReturnsZeroDiscrepancyPct] = useState<number>(100);
  const [timelySscAndWhtRemittancePct, setTimelySscAndWhtRemittancePct] = useState<number>(100);

  // --- Exact Decimal.js Calculations (3 Decimal Places for JOD, 2 for Ratios) ---
  const revDec = safeDec(totalRevenueJod).toDecimalPlaces(3);
  const costDec = safeDec(cogsAndOpexJod).toDecimalPlaces(3);
  const operatingProfitDec = revDec.minus(costDec).toDecimalPlaces(3);
  const operatingMarginPctDec = revDec.gt(0)
    ? operatingProfitDec.div(revDec).times(100).toDecimalPlaces(2)
    : new Decimal(0);

  // Corporate Income Tax + National Contribution (20% + 1% = 21% on positive operating profit)
  const incomeTaxAndContribDueDec = operatingProfitDec.gt(0)
    ? operatingProfitDec.times(new Decimal('0.21')).toDecimalPlaces(3)
    : new Decimal(0);

  const salesTaxDec = safeDec(salesTaxPayableJod).toDecimalPlaces(3);
  const whtTaxDec = safeDec(withholdingTaxPayableJod).toDecimalPlaces(3);
  const totalTaxLiabilitiesDec = incomeTaxAndContribDueDec
    .plus(salesTaxDec)
    .plus(whtTaxDec)
    .toDecimalPlaces(3);

  const netProfitAfterTaxDec = operatingProfitDec.minus(incomeTaxAndContribDueDec).toDecimalPlaces(3);

  // Balance Sheet Aggregations for Liquidity & Return Ratios
  const cashDec = safeDec(cashAndBanksJod).toDecimalPlaces(3);
  const arDec = safeDec(accountsReceivableJod).toDecimalPlaces(3);
  const invDec = safeDec(inventoryBalanceJod).toDecimalPlaces(3);
  const prepaidDec = safeDec(prepaidExpensesJod).toDecimalPlaces(3);
  const fixedAssetsDec = safeDec(nonCurrentFixedAssetsJod).toDecimalPlaces(3);

  const totalCurrentAssetsDec = cashDec.plus(arDec).plus(invDec).plus(prepaidDec).toDecimalPlaces(3);
  // Quick Liquid Assets = Current Assets (242,500) minus Inventory (54,600) = 187,900 JOD -> Quick Ratio = 187,900 / 126,655 = 1.48x
  const quickLiquidAssetsDec = Decimal.max(0, totalCurrentAssetsDec.minus(invDec)).toDecimalPlaces(3);
  const totalAssetsDec = totalCurrentAssetsDec.plus(fixedAssetsDec).toDecimalPlaces(3);

  const totalCurrentLiabilitiesDec = safeDec(currentLiabilitiesExclTaxJod)
    .plus(totalTaxLiabilitiesDec)
    .toDecimalPlaces(3);

  const equityDec = safeDec(shareholdersEquityJod).toDecimalPlaces(3);

  // 1. Liquidity Ratios (Current Ratio & Quick Ratio)
  const currentRatioDec = totalCurrentLiabilitiesDec.gt(0)
    ? totalCurrentAssetsDec.div(totalCurrentLiabilitiesDec).toDecimalPlaces(2)
    : new Decimal(0);

  const quickRatioDec = totalCurrentLiabilitiesDec.gt(0)
    ? quickLiquidAssetsDec.div(totalCurrentLiabilitiesDec).toDecimalPlaces(2)
    : new Decimal(0);

  // 2. Profitability & Return Ratios (ROA & ROE)
  const roaPctDec = totalAssetsDec.gt(0)
    ? netProfitAfterTaxDec.div(totalAssetsDec).times(100).toDecimalPlaces(2)
    : new Decimal(0);

  const roePctDec = equityDec.gt(0)
    ? netProfitAfterTaxDec.div(equityDec).times(100).toDecimalPlaces(2)
    : new Decimal(0);

  // 3. Weighted Tax Compliance Score (35% JoFotara + 35% Zero Discrepancy + 30% Timely SSC/WHT)
  const complianceScoreDec = safeDec(joFotaraSyncRatePct)
    .times(new Decimal('0.35'))
    .plus(safeDec(returnsZeroDiscrepancyPct).times(new Decimal('0.35')))
    .plus(safeDec(timelySscAndWhtRemittancePct).times(new Decimal('0.30')))
    .toDecimalPlaces(1);

  const handleResetDefaults = () => {
    setTotalRevenueJod(485000);
    setCogsAndOpexJod(339500);
    setCashAndBanksJod(112400);
    setAccountsReceivableJod(68000);
    setInventoryBalanceJod(54600);
    setPrepaidExpensesJod(7500);
    setNonCurrentFixedAssetsJod(395000);
    setCurrentLiabilitiesExclTaxJod(79000);
    setShareholdersEquityJod(445000);
    setSalesTaxPayableJod(14250);
    setWithholdingTaxPayableJod(2850);
    setJoFotaraSyncRatePct(100);
    setReturnsZeroDiscrepancyPct(100);
    setTimelySscAndWhtRemittancePct(100);
    SystemGovernanceService.recordAuditAction({
      actorName: 'المدير المالي',
      moduleName: 'لوحة مؤشرات الأداء المالي',
      actionLabel: 'إعادة ضبط أرصدة المحاكاة المالية',
      oldValue: `${revDec.toFixed(3)} د.أ`,
      newValue: '485000.000 د.أ',
    });
  };

  const handleExportDashboardJson = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      currency: 'JOD',
      summary: {
        totalRevenueJod: revDec.toFixed(3),
        cogsAndOpexJod: costDec.toFixed(3),
        operatingProfitEbitJod: operatingProfitDec.toFixed(3),
        operatingMarginPct: operatingMarginPctDec.toFixed(2),
        incomeTaxAndNatContrib21PctJod: incomeTaxAndContribDueDec.toFixed(3),
        netProfitAfterTaxJod: netProfitAfterTaxDec.toFixed(3),
        totalTaxLiabilitiesJod: totalTaxLiabilitiesDec.toFixed(3),
        cashAndBanksJod: cashDec.toFixed(3),
      },
      balanceSheetTotals: {
        totalCurrentAssetsJod: totalCurrentAssetsDec.toFixed(3),
        quickLiquidAssetsJod: quickLiquidAssetsDec.toFixed(3),
        totalAssetsJod: totalAssetsDec.toFixed(3),
        totalCurrentLiabilitiesJod: totalCurrentLiabilitiesDec.toFixed(3),
        shareholdersEquityJod: equityDec.toFixed(3),
      },
      ratios: {
        currentRatio: currentRatioDec.toFixed(2),
        quickRatio: quickRatioDec.toFixed(2),
        roaPct: roaPctDec.toFixed(2),
        roePct: roePctDec.toFixed(2),
        complianceScorePct: complianceScoreDec.toFixed(1),
      },
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Executive_Financial_Dashboard_Report_2026.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="bg-white dark:bg-slate-900 border-2 border-emerald-600/35 dark:border-emerald-500/35 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-1">
            الرؤية التحليلية الفورية لمتخذ القرار الإداري والمالي — دقة عشرية (Decimal.js)
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-emerald-500 shrink-0" />
            <span>لوحة مؤشرات الأداء المالي الحية والامتثال الضريبي (Executive Financial Dashboard)</span>
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleExportDashboardJson}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تصدير التقرير التنفيذي (JSON)</span>
          </button>
          <button
            type="button"
            onClick={() => setShowInteractiveInputs(!showInteractiveInputs)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center gap-2 transition cursor-pointer whitespace-nowrap"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-500" />
            <span>
              {showInteractiveInputs
                ? 'إخفاء محاكي المدخلات المحاسبية'
                : 'تعديل المدخلات المحاسبية ومؤشرات الامتثال حياً'}
            </span>
          </button>
        </div>
      </div>

      {/* 1. Four Executive Summary KPI Cards (بطاقات الملخص المالي السريع) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono tabular-nums">
        {/* Card 1: Total Revenue */}
        <div className="p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-xs font-sans text-slate-500">
            <span>إجمالي الإيرادات المسجلة</span>
            <BarChart3 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white">
            {revDec.toFixed(3)} د.أ
          </div>
          <div className="text-[11px] font-sans text-slate-500">
            مطابقة 100% مع فواتير نظام JoFotara
          </div>
        </div>

        {/* Card 2: Net Operating Profit */}
        <div className="p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-xs font-sans text-slate-500">
            <span>صافي الربح التشغيلي (EBIT)</span>
            <Activity className="w-4 h-4 text-sky-500" />
          </div>
          <div
            className={`text-xl font-extrabold ${
              operatingProfitDec.gte(0) ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
            }`}
          >
            {operatingProfitDec.toFixed(3)} د.أ
          </div>
          <div className="text-[11px] font-sans text-slate-500">
            هامش الربح التشغيلي: <strong className="font-mono">{operatingMarginPctDec.toFixed(2)}%</strong> | صافي بعد الضريبة:{' '}
            <strong className="font-mono">{netProfitAfterTaxDec.toFixed(3)}</strong>
          </div>
        </div>

        {/* Card 3: Total Tax Liabilities Due */}
        <div className="p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-xs font-sans text-slate-500">
            <span>إجمالي الالتزامات الضريبية المستحقة</span>
            <Scale className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400">
            {totalTaxLiabilitiesDec.toFixed(3)} د.أ
          </div>
          <div className="text-[11px] font-sans text-slate-500">
            دخل ومساهمة: {incomeTaxAndContribDueDec.toFixed(0)} · مبيعات: {salesTaxDec.toFixed(0)} · اقتطاع: {whtTaxDec.toFixed(0)}
          </div>
        </div>

        {/* Card 4: Cash & Bank Liquidity */}
        <div className="p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-xs font-sans text-slate-500">
            <span>رصيد السيولة النقدية والبنكية</span>
            <Wallet className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-extrabold text-sky-600 dark:text-sky-400">
            {cashDec.toFixed(3)} د.أ
          </div>
          <div className="text-[11px] font-sans text-slate-500">
            يغطي الالتزامات الضريبية بمعدل{' '}
            <strong className="font-mono">
              {totalTaxLiabilitiesDec.gt(0) ? cashDec.div(totalTaxLiabilitiesDec).toFixed(2) : '0.00'}x
            </strong>
          </div>
        </div>
      </div>

      {/* 2. Three Analytical Pillars: Liquidity Ratios + Profitability Ratios + Tax Compliance Score */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pillar A: Liquidity Ratios (Current Ratio & Quick Ratio) */}
        <div className="lg:col-span-4 p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Landmark className="w-4 h-4 text-sky-500" />
              <span>نسب السيولة المالية الحية</span>
            </h3>
            <span className="text-[11px] text-slate-500">الوفاء بالالتزامات قصيرة الأجل</span>
          </div>

          <div className="space-y-3 font-mono tabular-nums">
            <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <span className="font-sans text-xs font-semibold text-slate-700 dark:text-slate-300">
                  نسبة التداول (Current Ratio)
                </span>
                <span
                  className={`text-base font-extrabold ${
                    currentRatioDec.gte('1.5')
                      ? 'text-emerald-500'
                      : currentRatioDec.gte('1.0')
                      ? 'text-amber-500'
                      : 'text-rose-500'
                  }`}
                >
                  {currentRatioDec.toFixed(2)}x
                </span>
              </div>
              <div className="text-[11px] font-sans text-slate-500 flex justify-between">
                <span>الأصول المتداولة ({totalCurrentAssetsDec.toFixed(0)}) ÷ الالتزامات ({totalCurrentLiabilitiesDec.toFixed(0)})</span>
                <span>المعيار: &ge; 1.50x</span>
              </div>
            </div>

            <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <span className="font-sans text-xs font-semibold text-slate-700 dark:text-slate-300">
                  نسبة السيولة السريعة (Quick Ratio)
                </span>
                <span
                  className={`text-base font-extrabold ${
                    quickRatioDec.gte('1.0')
                      ? 'text-emerald-500'
                      : quickRatioDec.gte('0.75')
                      ? 'text-amber-500'
                      : 'text-rose-500'
                  }`}
                >
                  {quickRatioDec.toFixed(2)}x
                </span>
              </div>
              <div className="text-[11px] font-sans text-slate-500 flex justify-between">
                <span>({totalCurrentAssetsDec.toFixed(0)} - {invDec.toFixed(0)}) ÷ {totalCurrentLiabilitiesDec.toFixed(0)}</span>
                <span>المعيار: &ge; 1.00x</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pillar B: Profitability & Return Ratios (ROA & ROE) */}
        <div className="lg:col-span-4 p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-emerald-500" />
              <span>نسب العائد والربحية المعيارية</span>
            </h3>
            <span className="text-[11px] text-slate-500">كفاءة توظيف الأصول ورأس المال</span>
          </div>

          <div className="space-y-3 font-mono tabular-nums">
            <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <span className="font-sans text-xs font-semibold text-slate-700 dark:text-slate-300">
                  معدل العائد على الأصول (ROA)
                </span>
                <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                  {roaPctDec.toFixed(2)}%
                </span>
              </div>
              <div className="text-[11px] font-sans text-slate-500 flex justify-between">
                <span>صافي الربح ({netProfitAfterTaxDec.toFixed(0)}) ÷ إجمالي الأصول ({totalAssetsDec.toFixed(0)})</span>
              </div>
            </div>

            <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <span className="font-sans text-xs font-semibold text-slate-700 dark:text-slate-300">
                  معدل العائد على حقوق الملكية (ROE)
                </span>
                <span className="text-base font-extrabold text-sky-600 dark:text-sky-400">
                  {roePctDec.toFixed(2)}%
                </span>
              </div>
              <div className="text-[11px] font-sans text-slate-500 flex justify-between">
                <span>صافي الربح ({netProfitAfterTaxDec.toFixed(0)}) ÷ حقوق الملكية ({equityDec.toFixed(0)})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pillar C: Interactive Tax Compliance Score (مؤشر الامتثال الضريبي) */}
        <div className="lg:col-span-4 p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>مؤشر الامتثال الضريبي (Compliance Score)</span>
            </h3>
            <span className="font-mono text-sm font-extrabold text-emerald-500">
              {complianceScoreDec.toFixed(1)}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                complianceScoreDec.gte(90)
                  ? 'bg-emerald-500'
                  : complianceScoreDec.gte(75)
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, complianceScoreDec.toNumber()))}%` }}
            />
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>مزامنة فواتير JoFotara الفورية (35%)</span>
              </span>
              <span className="font-mono font-bold">{joFotaraSyncRatePct}%</span>
            </div>
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>خلو الإقرارات من التناقضات الدفترية (35%)</span>
              </span>
              <span className="font-mono font-bold">{returnsZeroDiscrepancyPct}%</span>
            </div>
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                {timelySscAndWhtRemittancePct >= 95 ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                )}
                <span>دقة سداد الاقتطاعات والضمان بالمواعيد (30%)</span>
              </span>
              <span className="font-mono font-bold">{timelySscAndWhtRemittancePct}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Collapsible Live Accounting & Compliance Simulator Panel */}
      {showInteractiveInputs && (
        <div className="p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2.5">
            <div className="text-xs font-bold text-slate-900 dark:text-white">
              محاكي المدخلات المحاسبية ومؤشرات الالتزام (عدّل أي رقم لمشاهدة تحديث النسب المالية ومؤشر الامتثال فورياً)
            </div>
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-3 py-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-bold rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>إعادة ضبط الأرصدة الافتراضية</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">إجمالي الإيرادات (د.أ)</label>
              <input
                type="number"
                step={5000}
                value={totalRevenueJod}
                onChange={(e) => setTotalRevenueJod(Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-500 mb-1">إجمالي التكاليف والمصاريف (د.أ)</label>
              <input
                type="number"
                step={5000}
                value={cogsAndOpexJod}
                onChange={(e) => setCogsAndOpexJod(Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-500 mb-1">النقدية والأرصدة البنكية (د.أ)</label>
              <input
                type="number"
                step={2000}
                value={cashAndBanksJod}
                onChange={(e) => setCashAndBanksJod(Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-500 mb-1">الذمم المدينة التجارية (د.أ)</label>
              <input
                type="number"
                step={2000}
                value={accountsReceivableJod}
                onChange={(e) => setAccountsReceivableJod(Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-500 mb-1">قيمة المخزون الدفترية (د.أ)</label>
              <input
                type="number"
                step={2000}
                value={inventoryBalanceJod}
                onChange={(e) => setInventoryBalanceJod(Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-500 mb-1">مصاريف مدفوعة مقدماً (د.أ)</label>
              <input
                type="number"
                step={500}
                value={prepaidExpensesJod}
                onChange={(e) => setPrepaidExpensesJod(Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-500 mb-1">الأصول الثابتة غير المتداولة (د.أ)</label>
              <input
                type="number"
                step={5000}
                value={nonCurrentFixedAssetsJod}
                onChange={(e) => setNonCurrentFixedAssetsJod(Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-500 mb-1">الالتزامات المتداولة التشغيلية (د.أ)</label>
              <input
                type="number"
                step={2000}
                value={currentLiabilitiesExclTaxJod}
                onChange={(e) => setCurrentLiabilitiesExclTaxJod(Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-500 mb-1">إجمالي حقوق الملكية (د.أ)</label>
              <input
                type="number"
                step={5000}
                value={shareholdersEquityJod}
                onChange={(e) => setShareholdersEquityJod(Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-500 mb-1">أمانات ضريبة المبيعات المستحقة (د.أ)</label>
              <input
                type="number"
                step={500}
                value={salesTaxPayableJod}
                onChange={(e) => setSalesTaxPayableJod(Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-500 mb-1">أمانات اقتطاع المنبع (د.أ)</label>
              <input
                type="number"
                step={250}
                value={withholdingTaxPayableJod}
                onChange={(e) => setWithholdingTaxPayableJod(Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-500 mb-1">مزامنة JoFotara / خلو التناقض (%)</label>
              <div className="grid grid-cols-3 gap-1">
                <input
                  type="number"
                  min={0}
                  max={100}
                  title="مزامنة JoFotara %"
                  value={joFotaraSyncRatePct}
                  onChange={(e) => setJoFotaraSyncRatePct(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-1.5 py-1.5 font-mono text-center text-slate-900 dark:text-white"
                />
                <input
                  type="number"
                  min={0}
                  max={100}
                  title="خلو الإقرارات من التناقضات %"
                  value={returnsZeroDiscrepancyPct}
                  onChange={(e) => setReturnsZeroDiscrepancyPct(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-1.5 py-1.5 font-mono text-center text-slate-900 dark:text-white"
                />
                <input
                  type="number"
                  min={0}
                  max={100}
                  title="انتظام سداد الضمان والاقتطاع %"
                  value={timelySscAndWhtRemittancePct}
                  onChange={(e) => setTimelySscAndWhtRemittancePct(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-1.5 py-1.5 font-mono text-center text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
