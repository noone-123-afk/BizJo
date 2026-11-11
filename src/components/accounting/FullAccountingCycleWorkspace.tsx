import React, { useState, useEffect } from 'react';
import Decimal from 'decimal.js';
import {
  BookOpen,
  FileSpreadsheet,
  CheckCircle2,
  Plus,
  RotateCcw,
  Layers,
  Scale,
  ArrowLeftRight,
  Landmark,
  Users,
  Receipt,
  Download,
} from 'lucide-react';
import {
  AccountingCycleStore,
  STANDARD_JORDAN_COA,
} from '../../services/accounting/AccountingCycleStore';

Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP });

export type CycleViewMode =
  | 'FINANCIAL_STATEMENTS'
  | 'TRIAL_BALANCE'
  | 'GENERAL_JOURNAL'
  | 'GENERAL_LEDGER'
  | 'CHART_OF_ACCOUNTS';

interface FullAccountingCycleWorkspaceProps {
  initialMode?: CycleViewMode;
}

export default function FullAccountingCycleWorkspace({
  initialMode = 'FINANCIAL_STATEMENTS',
}: FullAccountingCycleWorkspaceProps = {}) {
  const [activeMode, setActiveMode] = useState<CycleViewMode>(initialMode);
  const [cycleData, setCycleData] = useState(() => AccountingCycleStore.computeFullFinancialCycle());
  const [selectedGlCode, setSelectedGlCode] = useState<string>('1101');
  const [postingBanner, setPostingBanner] = useState<string | null>(null);

  useEffect(() => {
    if (initialMode) {
      setActiveMode(initialMode);
    }
  }, [initialMode]);

  // Quick Invoice-to-Ledger Form State
  const [invNo, setInvNo] = useState<string>('INV-2026-109');
  const [custName, setCustName] = useState<string>('شركة الفوسفات والصناعات التحويلية ذ.م.م');
  const [netSalesJod, setNetSalesJod] = useState<number>(15000);
  const [vatRatePct, setVatRatePct] = useState<number>(16);
  const [cogsJod, setCogsJod] = useState<number>(8200);
  const [payMethod, setPayMethod] = useState<'CLIQ' | 'CASH' | 'CARD'>('CLIQ');

  // Custom Double-Entry Journal Voucher Form State
  const [jvRef, setJvRef] = useState<string>('JV-ADJ-2026-09');
  const [jvDesc, setJvDesc] = useState<string>('سداد دفعة للمورد شركة الخوادم والحوسبة الأردنية عبر البنك');
  const [debitAccCode, setDebitAccCode] = useState<string>('2101');
  const [creditAccCode, setCreditAccCode] = useState<string>('1101');
  const [jvAmountJod, setJvAmountJod] = useState<number>(5000);

  useEffect(() => {
    return AccountingCycleStore.subscribe(() => {
      setCycleData(AccountingCycleStore.computeFullFinancialCycle());
    });
  }, []);

  const handlePostQuickSalesInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const netDec = Decimal.max(0, new Decimal(netSalesJod || 0)).toDecimalPlaces(3);
    const vatDec = netDec.times(new Decimal(vatRatePct || 0).div(100)).toDecimalPlaces(3);
    const grossDec = netDec.plus(vatDec).toDecimalPlaces(3);

    const created = AccountingCycleStore.postJoFotaraSalesInvoiceToLedger({
      invoiceNumber: invNo.trim() || `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
      customerName: custName.trim() || 'عميل تجاري',
      netAmountJod: netDec.toNumber(),
      vatAmountJod: vatDec.toNumber(),
      grossAmountJod: grossDec.toNumber(),
      paymentMethod: payMethod,
      estimatedCogsJod: Math.max(0, Number(cogsJod) || 0),
    });

    setCycleData(AccountingCycleStore.computeFullFinancialCycle());
    setInvNo(`INV-2026-${Math.floor(110 + Math.random() * 880)}`);
    setPostingBanner(
      `تم ترحيل الفاتورة (${created.sourceReference}) بقيد يومية مزدوج رقم (${created.voucherNo}) وتحديث دفتر الأستاذ العام وميزان المراجعة وقائمة الدخل والمركز المالي والضريبة تلقائياً!`
    );
    setTimeout(() => setPostingBanner(null), 6000);
  };

  const handlePostCustomJournalEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (debitAccCode === creditAccCode || jvAmountJod <= 0) return;

    const drAcc = STANDARD_JORDAN_COA.find((a) => a.code === debitAccCode);
    const crAcc = STANDARD_JORDAN_COA.find((a) => a.code === creditAccCode);
    if (!drAcc || !crAcc) return;

    const amt = Decimal.max(0, new Decimal(jvAmountJod)).toDecimalPlaces(3).toNumber();
    const created = AccountingCycleStore.addJournalVoucher({
      dateIso: new Date().toISOString().slice(0, 10),
      sourceType: 'MANUAL_JV',
      sourceReference: jvRef.trim() || 'JV-MAN-2026',
      descriptionAr: jvDesc.trim() || `قيد يومية مزدوج بين ${drAcc.nameAr} و ${crAcc.nameAr}`,
      lines: [
        {
          accountCode: drAcc.code,
          accountNameAr: drAcc.nameAr,
          debitJod: amt,
          creditJod: 0,
        },
        {
          accountCode: crAcc.code,
          accountNameAr: crAcc.nameAr,
          debitJod: 0,
          creditJod: amt,
        },
      ],
    });

    setCycleData(AccountingCycleStore.computeFullFinancialCycle());
    setPostingBanner(
      `تم تسجيل وترحيل قيد اليومية المزدوج (${created.voucherNo}) بقيمة ${amt.toFixed(3)} د.أ وتحديث جميع القوائم المالية وميزان المراجعة فورياً.`
    );
    setTimeout(() => setPostingBanner(null), 6000);
  };

  const handleExportErpCycleJson = () => {
    const blob = new Blob([JSON.stringify(cycleData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Jordan_ERP_Full_Accounting_Cycle_2026.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectedGlReport =
    cycleData.generalLedgerList.find((g) => g.account.code === selectedGlCode) ||
    cycleData.generalLedgerList[0];

  const { incomeStatement, balanceSheet, cashFlowStatement, trialBalanceSummary, taxIntegrationSummary } =
    cycleData;

  return (
    <div className="space-y-6">
      {/* Header & Live ERP Pipeline Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="text-xs text-emerald-400 font-bold mb-1">
              الدورة المحاسبية المتكاملة والربط الحقيقي (End-to-End Double-Entry ERP Engine)
            </div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>
                من الفاتورة الإلكترونية (JoFotara) ⬅ قيد اليومية ⬅ الأستاذ العام ⬅ ميزان المراجعة ⬅ القوائم المالية ⬅ الإقرار الضريبي
              </span>
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleExportErpCycleJson}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تصدير الدورة المحاسبية (JSON)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                AccountingCycleStore.resetToInitialCycle();
                setCycleData(AccountingCycleStore.computeFullFinancialCycle());
                setPostingBanner('تمت إعادة ضبط القيود والأرصدة الافتتاحية للدورة المحاسبية القياسية.');
                setTimeout(() => setPostingBanner(null), 4000);
              }}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة ضبط الأرصدة القياسية</span>
            </button>
          </div>
        </div>

        {/* Summary KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="font-sans text-[11px] text-slate-400 block mb-1">عدد قيود اليومية المرحّلة</span>
            <span className="text-base font-extrabold text-white">{cycleData.vouchers.length} قيود</span>
          </div>
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="font-sans text-[11px] text-slate-400 block mb-1">توازن ميزان المراجعة</span>
            <span className="text-base font-extrabold text-emerald-400">
              {trialBalanceSummary.closingDebitJod} د.أ
            </span>
          </div>
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="font-sans text-[11px] text-slate-400 block mb-1">صافي الربح بعد الضريبة</span>
            <span className="text-base font-extrabold text-emerald-400">
              {incomeStatement.netIncomeAfterTaxJod} د.أ
            </span>
          </div>
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="font-sans text-[11px] text-slate-400 block mb-1">إجمالي الأصول = الخصوم والملكية</span>
            <span className="text-base font-extrabold text-sky-400">
              {balanceSheet.totalAssetsJod} د.أ
            </span>
          </div>
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="font-sans text-[11px] text-slate-400 block mb-1">رصيد النقدية والبنوك الختامي</span>
            <span className="text-base font-extrabold text-amber-400">
              {cashFlowStatement.closingCashBalanceJod} د.أ
            </span>
          </div>
          <div className="p-3.5 bg-emerald-950/25 border border-emerald-500/30 rounded-xl">
            <span className="font-sans text-[11px] text-emerald-300 block mb-1">صافي ضريبة المبيعات لـ ISTD</span>
            <span className="text-base font-extrabold text-emerald-400">
              {taxIntegrationSummary.netGstPayableToIstdJod} د.أ
            </span>
          </div>
        </div>

        {/* Sub-Navigation Pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={() => setActiveMode('FINANCIAL_STATEMENTS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              activeMode === 'FINANCIAL_STATEMENTS'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>1. القوائم المالية الختامية المترابطة (الدخل + المركز المالي + التدفقات + الضريبة)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('GENERAL_JOURNAL')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              activeMode === 'GENERAL_JOURNAL'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>2. قيود اليومية المزدوجة + إصدار وترحيل فاتورة فورية ({cycleData.vouchers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('GENERAL_LEDGER')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              activeMode === 'GENERAL_LEDGER'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>3. الأستاذ العام (GL) والأستاذ المساعد للعملاء والموردين (AR/AP)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('TRIAL_BALANCE')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              activeMode === 'TRIAL_BALANCE'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>4. ميزان المراجعة بالمجاميع والأرصدة (Trial Balance)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('CHART_OF_ACCOUNTS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              activeMode === 'CHART_OF_ACCOUNTS'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>5. دليل الحسابات المعياري الأردني ({STANDARD_JORDAN_COA.length} حساب)</span>
          </button>
        </div>
      </div>

      {postingBanner && (
        <div className="p-4 bg-emerald-950/30 border border-emerald-500/40 rounded-xl text-xs font-bold text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{postingBanner}</span>
        </div>
      )}

      {/* Always-accessible Quick Simulator Bar to Post a New JoFotara Invoice and Watch All Statements Update Live */}
      <form
        onSubmit={handlePostQuickSalesInvoice}
        className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-5 space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="text-xs font-bold text-emerald-400 flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4" />
            <span>
              تجربة الربط المحاسبي الحي: أصدر فاتورة مبيعات إلكترونية الآن وشاهد ترحيلها الآلي لليومية والأستاذ العام وميزان المراجعة والقوائم المالية والإقرار الضريبي
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            القيد الآلي: من ح/ النقدية أو العملاء + من ح/ تكلفة المبيعات ⬅ إلى ح/ المبيعات + ح/ أمانات ضريبة المبيعات + ح/ المخزون
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs items-end">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">رقم فاتورة JoFotara</label>
            <input
              type="text"
              value={invNo}
              onChange={(e) => setInvNo(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-white font-mono"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">اسم العميل (الأستاذ المساعد AR)</label>
            <input
              type="text"
              value={custName}
              onChange={(e) => setCustName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">صافي المبيعات قبل الضريبة (د.أ)</label>
            <input
              type="number"
              min={10}
              step={500}
              value={netSalesJod}
              onChange={(e) => setNetSalesJod(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-emerald-400 font-mono font-bold"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">نسبة ضريبة المبيعات (%)</label>
            <select
              value={vatRatePct}
              onChange={(e) => setVatRatePct(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-white font-mono"
            >
              <option value={16}>16% (الضريبة العامة)</option>
              <option value={10}>10% (نسبة مخفضة)</option>
              <option value={4}>4% (سلع أساسية)</option>
              <option value={0}>0% (تصدير / معفى)</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">تكلفة البضاعة المباعة COGS (د.أ)</label>
            <input
              type="number"
              min={0}
              step={250}
              value={cogsJod}
              onChange={(e) => setCogsJod(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-amber-400 font-mono"
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إصدار وترحيل للقوائم</span>
            </button>
          </div>
        </div>
      </form>

      {/* MODE 1: FINANCIAL STATEMENTS (قائمة الدخل + قائمة المركز المالي + قائمة التدفقات النقدية + الربط الضريبي) */}
      {activeMode === 'FINANCIAL_STATEMENTS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 1. Income Statement (قائمة الدخل) */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="text-xs text-emerald-400 font-bold">القائمة المالية الأولى (IAS 1)</div>
                <h4 className="text-base font-bold text-white">قائمة الدخل الشامل (Income Statement)</h4>
              </div>
              <span className="text-xs font-mono text-slate-400">بالدينار الأردني (دقة الفلس)</span>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="font-sans text-slate-300">إيرادات المبيعات الخاضعة للضريبة (ح/ 4101)</span>
                <span className="text-white font-bold">{incomeStatement.taxableSalesRevenueJod}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="font-sans text-slate-300">إيرادات التصدير والمناطق الحرة 0% (ح/ 4102)</span>
                <span className="text-white">{incomeStatement.zeroRatedExportRevenueJod}</span>
              </div>
              <div className="flex justify-between py-2 bg-slate-950 px-3 rounded-lg font-bold">
                <span className="font-sans text-emerald-400">إجمالي الإيرادات التشغيلية</span>
                <span className="text-emerald-400">{incomeStatement.totalRevenueJod} د.أ</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="font-sans text-rose-300">(-) تكلفة البضاعة المباعة (ح/ 5101 — COGS)</span>
                <span className="text-rose-400">({incomeStatement.costOfGoodsSoldJod})</span>
              </div>
              <div className="flex justify-between py-2 bg-slate-950 px-3 rounded-lg font-bold">
                <span className="font-sans text-sky-400">مجمل الربح (Gross Profit)</span>
                <span className="text-sky-400">{incomeStatement.grossProfitJod} د.أ</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="font-sans text-slate-300">(-) مصاريف الرواتب والضمان الاجتماعي (ح/ 5201)</span>
                <span className="text-rose-400">({incomeStatement.payrollAndSscExpenseJod})</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="font-sans text-slate-300">(-) مصاريف الإيجارات والمرافق والاستشارات (ح/ 5202)</span>
                <span className="text-rose-400">({incomeStatement.rentAndAdminExpenseJod})</span>
              </div>

              <div className="flex justify-between py-2 bg-slate-950 px-3 rounded-lg font-bold">
                <span className="font-sans text-white">صافي الربح التشغيلي قبل الضريبة (EBIT)</span>
                <span className="text-white">{incomeStatement.operatingProfitEbitJod} د.أ</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="font-sans text-amber-300">
                  (-) مخصص ضريبة دخل الشركات (20%) + المساهمة الوطنية (1%)
                </span>
                <span className="text-amber-400">({incomeStatement.incomeTaxAndNatContrib21PctJod})</span>
              </div>

              <div className="flex justify-between py-2.5 bg-emerald-950/30 border border-emerald-500/40 px-3 rounded-xl font-extrabold text-sm">
                <span className="font-sans text-emerald-300">صافي الربح القابل للتوزيع بعد الضريبة</span>
                <span className="text-emerald-400">{incomeStatement.netIncomeAfterTaxJod} د.أ</span>
              </div>

              <div className="pt-2 grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                  <span className="font-sans text-slate-400 block">احتياطي إجباري 10% (مادة 186):</span>
                  <span className="text-amber-400 font-bold">{incomeStatement.statutoryReserve10PctJod} د.أ</span>
                </div>
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                  <span className="font-sans text-slate-400 block">صافي الأرباح المدورة للميزانية:</span>
                  <span className="text-emerald-400 font-bold">{incomeStatement.retainedProfitForPeriodJod} د.أ</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Balance Sheet (قائمة المركز المالي / الميزانية العمومية) */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="text-xs text-sky-400 font-bold">القائمة المالية الثانية (IAS 1)</div>
                <h4 className="text-base font-bold text-white">
                  قائمة المركز المالي / الميزانية العمومية (Balance Sheet)
                </h4>
              </div>
              <span className="px-2.5 py-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold">
                {balanceSheet.isBalanced ? 'متوازنة 100% (الأصول = الخصوم + الملكية)' : 'قيد المراجعة'}
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="text-xs font-sans font-bold text-sky-400">أولاً: الأصول (Assets)</div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="font-sans text-slate-300">النقدية لدى البنوك المحلية (ح/ 1101)</span>
                <span className="text-white">{balanceSheet.cashAndBanksJod}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="font-sans text-slate-300">ذمم العملاء التجارية (ح/ 1102 — AR)</span>
                <span className="text-white">{balanceSheet.accountsReceivableJod}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="font-sans text-slate-300">مخزون البضاعة الجاهزة (ح/ 1105 — WAC)</span>
                <span className="text-white">{balanceSheet.inventoryJod}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="font-sans text-slate-300">ضريبة المبيعات القابلة للرد / مدخلات (ح/ 1108)</span>
                <span className="text-white">{balanceSheet.recoverableInputVatJod}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="font-sans text-slate-300">صافي الممتلكات والمعدات الثابتة (ح/ 1201)</span>
                <span className="text-white">{balanceSheet.netFixedAssetsJod}</span>
              </div>
              <div className="flex justify-between py-2 bg-sky-950/30 border border-sky-500/30 px-3 rounded-lg font-extrabold">
                <span className="font-sans text-sky-300">إجمالي الأصول (Total Assets)</span>
                <span className="text-sky-400">{balanceSheet.totalAssetsJod} د.أ</span>
              </div>

              <div className="text-xs font-sans font-bold text-amber-400 pt-2">
                ثانياً: الالتزامات وحقوق الملكية (Liabilities & Equity)
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="font-sans text-slate-300">ذمم الموردين التجارية (ح/ 2101 — AP)</span>
                <span className="text-white">{balanceSheet.accountsPayableJod}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="font-sans text-slate-300">أمانات ضريبة المبيعات المستحقة (ح/ 2104)</span>
                <span className="text-amber-400">{balanceSheet.outputVatPayableJod}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="font-sans text-slate-300">أمانات اقتطاع المنبع (ح/ 2105) + الضمان (ح/ 2106)</span>
                <span className="text-white">
                  {new Decimal(balanceSheet.withholdingTaxPayableJod)
                    .plus(balanceSheet.sscPayableJod)
                    .toFixed(3)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="font-sans text-slate-300">مخصص ضريبة الدخل والمساهمة للفترة الجارية</span>
                <span className="text-amber-400">{balanceSheet.incomeTaxProvisionPayableJod}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="font-sans text-slate-300">قروض بنكية طويلة الأجل (ح/ 2201)</span>
                <span className="text-white">{balanceSheet.longTermLoansJod}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="font-sans text-slate-300">
                  رأس المال (3101) + الاحتياطي الإجباري (3201) + الأرباح المدورة (3301)
                </span>
                <span className="text-emerald-400 font-bold">{balanceSheet.totalEquityJod}</span>
              </div>

              <div className="flex justify-between py-2 bg-emerald-950/30 border border-emerald-500/40 px-3 rounded-lg font-extrabold">
                <span className="font-sans text-emerald-300">إجمالي الالتزامات وحقوق الملكية</span>
                <span className="text-emerald-400">{balanceSheet.totalLiabilitiesAndEquityJod} د.أ</span>
              </div>
            </div>
          </div>

          {/* 3. Cash Flow Statement (قائمة التدفقات النقدية) */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="text-xs text-amber-400 font-bold">القائمة المالية الثالثة (IAS 7)</div>
                <h4 className="text-base font-bold text-white">قائمة التدفقات النقدية (Cash Flow Statement)</h4>
              </div>
              <span className="text-xs font-mono text-emerald-400">مطابقة لحساب البنك 1101</span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-2 bg-slate-950 px-3 rounded-lg">
                <span className="font-sans text-slate-300">رصيد النقدية والبنوك في بداية الفترة (1101)</span>
                <span className="text-white font-bold">{cashFlowStatement.openingCashBalanceJod} د.أ</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/60">
                <span className="font-sans text-slate-300">
                  صافي التدفقات النقدية من الأنشطة التشغيلية (التحصيلات النقدية ناقص المدفوعات)
                </span>
                <span className="text-emerald-400 font-bold">{cashFlowStatement.netOperatingCashFlowJod} د.أ</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/60">
                <span className="font-sans text-slate-300">صافي التدفقات النقدية من الأنشطة الاستثمارية والتمويلية</span>
                <span className="text-slate-400">0.000 د.أ</span>
              </div>
              <div className="flex justify-between py-2.5 bg-amber-950/25 border border-amber-500/30 px-3 rounded-xl font-extrabold">
                <span className="font-sans text-amber-300">رصيد النقدية والبنوك في نهاية الفترة (مطابق للميزانية)</span>
                <span className="text-amber-400">{cashFlowStatement.closingCashBalanceJod} د.أ</span>
              </div>
            </div>
          </div>

          {/* 4. Direct Tax Return Integration (الربط التلقائي مع الإقرار الضريبي) */}
          <div className="lg:col-span-6 bg-slate-900 border border-emerald-500/35 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="text-xs text-emerald-400 font-bold">الربط الضريبي المباشر من الأستاذ العام (ISTD Live Sync)</div>
                <h4 className="text-base font-bold text-white">
                  خلاصة الإقرارات الضريبية المستخرجة آلياً من القيود المحاسبية
                </h4>
              </div>
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="font-sans text-slate-300">ضريبة المبيعات المستحقة على المبيعات (ح/ 2104 — مخرجات)</span>
                <span className="text-amber-400 font-bold">{taxIntegrationSummary.outputVatOnSalesJod} د.أ</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="font-sans text-slate-300">(-) ضريبة المبيعات القابلة للرد على المشتريات (ح/ 1108 — مدخلات)</span>
                <span className="text-sky-400">({taxIntegrationSummary.inputVatOnPurchasesJod}) د.أ</span>
              </div>
              <div className="flex justify-between py-2 bg-emerald-950/30 border border-emerald-500/30 px-3 rounded-lg font-extrabold">
                <span className="font-sans text-emerald-300">صافي إقرار الضريبة العامة على المبيعات واجب التوريد لـ ISTD</span>
                <span className="text-emerald-400">{taxIntegrationSummary.netGstPayableToIstdJod} د.أ</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="font-sans text-slate-300">أمانات ضريبة الدخل المقتطعة من المنبع (ح/ 2105 — نموذج و/1)</span>
                <span className="text-white font-bold">{taxIntegrationSummary.whtPayableFormW1Jod} د.أ</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="font-sans text-slate-300">مخصص ضريبة الدخل السنوية والمساهمة الوطنية (21% على صافي الربح)</span>
                <span className="text-amber-400 font-bold">{taxIntegrationSummary.estimatedCorporateIncomeTaxJod} د.أ</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: GENERAL JOURNAL (دفتر قيود اليومية المزدوجة) */}
      {activeMode === 'GENERAL_JOURNAL' && (
        <div className="space-y-6">
          {/* Custom Journal Entry Form */}
          <form
            onSubmit={handlePostCustomJournalEntry}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4"
          >
            <h4 className="text-sm font-bold text-white">
              إضافة قيد يومية مزدوج مخصص (Manual Double-Entry Journal Voucher)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs items-end">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">رقم المرجع / السند</label>
                <input
                  type="text"
                  value={jvRef}
                  onChange={(e) => setJvRef(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">الطرف المدين (من ح/)</label>
                <select
                  value={debitAccCode}
                  onChange={(e) => setDebitAccCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-white"
                >
                  {STANDARD_JORDAN_COA.map((a) => (
                    <option key={a.code} value={a.code}>
                      {a.code} — {a.nameAr}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">الطرف الدائن (إلى ح/)</label>
                <select
                  value={creditAccCode}
                  onChange={(e) => setCreditAccCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-white"
                >
                  {STANDARD_JORDAN_COA.map((a) => (
                    <option key={a.code} value={a.code}>
                      {a.code} — {a.nameAr}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">المبلغ (د.أ)</label>
                <input
                  type="number"
                  min={1}
                  step={100}
                  value={jvAmountJod}
                  onChange={(e) => setJvAmountJod(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-emerald-400 font-mono font-bold"
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full py-2 px-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg cursor-pointer"
                >
                  ترحيل القيد المزدوج
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">البيان المحاسبي التفصيلي للقيد</label>
              <input
                type="text"
                value={jvDesc}
                onChange={(e) => setJvDesc(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
              />
            </div>
          </form>

          {/* List of All Double-Entry Vouchers */}
          <div className="space-y-4">
            {cycleData.vouchers.map((v) => {
              const totDr = v.lines.reduce((acc, l) => acc.plus(l.debitJod), new Decimal(0)).toFixed(3);
              const totCr = v.lines.reduce((acc, l) => acc.plus(l.creditJod), new Decimal(0)).toFixed(3);
              return (
                <div
                  key={v.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden"
                >
                  <div className="px-5 py-3 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-emerald-400">{v.voucherNo}</span>
                      <span className="text-slate-400 font-mono">{v.dateIso}</span>
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-mono">
                        مرجع: {v.sourceReference}
                      </span>
                    </div>
                    <span className="text-slate-200 font-semibold">{v.descriptionAr}</span>
                  </div>
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-2 px-4">رقم الحساب</th>
                        <th className="py-2 px-4">اسم الحساب (دليل الحسابات)</th>
                        <th className="py-2 px-4">الأستاذ المساعد (عميل / مورد)</th>
                        <th className="py-2 px-4 text-left">مدين (Debit د.أ)</th>
                        <th className="py-2 px-4 text-left">دائن (Credit د.أ)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {v.lines.map((line, i) => (
                        <tr key={i} className="hover:bg-slate-800/30">
                          <td className="py-2 px-4 text-sky-400 font-bold">{line.accountCode}</td>
                          <td className="py-2 px-4 font-sans text-slate-200">{line.accountNameAr}</td>
                          <td className="py-2 px-4 font-sans text-slate-400">
                            {line.subLedgerPartyName || '—'}
                          </td>
                          <td className="py-2 px-4 text-left text-emerald-400">
                            {line.debitJod > 0 ? line.debitJod.toFixed(3) : '—'}
                          </td>
                          <td className="py-2 px-4 text-left text-amber-400">
                            {line.creditJod > 0 ? line.creditJod.toFixed(3) : '—'}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-slate-950 font-bold">
                        <td colSpan={3} className="py-2 px-4 font-sans text-slate-300">
                          إجمالي القيد المزدوج المتوازن
                        </td>
                        <td className="py-2 px-4 text-left text-emerald-400">{totDr} د.أ</td>
                        <td className="py-2 px-4 text-left text-emerald-400">{totCr} د.أ</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODE 3: GENERAL LEDGER & AR/AP SUB-LEDGERS (دفتر الأستاذ العام والأستاذ المساعد) */}
      {activeMode === 'GENERAL_LEDGER' && (
        <div className="space-y-6">
          {/* Sub-Ledgers for Customers (AR) and Vendors (AP) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h4 className="text-base font-bold text-white">
              دفتر الأستاذ المساعد للعملاء (Accounts Receivable) والموردين (Accounts Payable)
            </h4>
            <div className="overflow-x-auto border border-slate-800 rounded-xl">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4">الرمز</th>
                    <th className="py-2.5 px-4">اسم الطرف (العميل / المورد)</th>
                    <th className="py-2.5 px-4">النوع</th>
                    <th className="py-2.5 px-4">الرقم الضريبي</th>
                    <th className="py-2.5 px-4 text-left">رصيد افتتاحي</th>
                    <th className="py-2.5 px-4 text-left">حركة مدينة (فواتير/سداد)</th>
                    <th className="py-2.5 px-4 text-left">حركة دائنة (تحصيل/توريد)</th>
                    <th className="py-2.5 px-4 text-left">الرصيد الختامي المطابق</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {cycleData.subLedgers.map((sub) => (
                    <tr key={sub.partyId} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-4 text-sky-400 font-bold">{sub.partyId}</td>
                      <td className="py-2.5 px-4 font-sans text-white font-semibold">{sub.partyName}</td>
                      <td className="py-2.5 px-4 font-sans text-slate-300">
                        {sub.partyType === 'CUSTOMER_AR' ? 'عميل (ذمم مدينة 1102)' : 'مورد (ذمم دائنة 2101)'}
                      </td>
                      <td className="py-2.5 px-4 text-slate-400">{sub.taxNumber}</td>
                      <td className="py-2.5 px-4 text-left text-slate-300">{sub.openingBalanceJod}</td>
                      <td className="py-2.5 px-4 text-left text-emerald-400">{sub.totalDebitJod}</td>
                      <td className="py-2.5 px-4 text-left text-amber-400">{sub.totalCreditJod}</td>
                      <td className="py-2.5 px-4 text-left font-bold text-white">{sub.closingBalanceJod} د.أ</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* General Ledger Account Card Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h4 className="text-base font-bold text-white">
                  كشف حساب دفتر الأستاذ العام التفصيلي (General Ledger Account Card)
                </h4>
                <p className="text-xs text-slate-400">
                  اختر أي حساب من دليل الحسابات لاستعراض رصيده الافتتاحي وحركاته المرحّلة من قيود اليومية ورصيده الختامي
                </p>
              </div>
              <select
                value={selectedGlCode}
                onChange={(e) => setSelectedGlCode(e.target.value)}
                className="bg-slate-950 border border-emerald-500/40 rounded-xl px-3.5 py-2 text-xs text-white font-bold"
              >
                {cycleData.generalLedgerList.map((g) => (
                  <option key={g.account.code} value={g.account.code}>
                    {g.account.code} — {g.account.nameAr} (الرصيد: {g.netSignedBalanceJod} د.أ)
                  </option>
                ))}
              </select>
            </div>

            {selectedGlReport && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                    <span className="font-sans text-slate-400 block">الرصيد الافتتاحي</span>
                    <span className="text-sm font-bold text-white">
                      مدين: {selectedGlReport.openingDebitJod} | دائن: {selectedGlReport.openingCreditJod}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                    <span className="font-sans text-slate-400 block">إجمالي حركة الفترة (مدين)</span>
                    <span className="text-sm font-bold text-emerald-400">{selectedGlReport.periodDebitJod} د.أ</span>
                  </div>
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                    <span className="font-sans text-slate-400 block">إجمالي حركة الفترة (دائن)</span>
                    <span className="text-sm font-bold text-amber-400">{selectedGlReport.periodCreditJod} د.أ</span>
                  </div>
                  <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl">
                    <span className="font-sans text-emerald-300 block">الرصيد الختامي الصافي</span>
                    <span className="text-sm font-extrabold text-emerald-400">
                      {selectedGlReport.netSignedBalanceJod} د.أ ({selectedGlReport.account.normalSide})
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-800 rounded-xl">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-2 px-4">رقم القيد</th>
                        <th className="py-2 px-4">التاريخ</th>
                        <th className="py-2 px-4">المستند المرجعي</th>
                        <th className="py-2 px-4">البيان</th>
                        <th className="py-2 px-4 text-left">مدين (د.أ)</th>
                        <th className="py-2 px-4 text-left">دائن (د.أ)</th>
                        <th className="py-2 px-4 text-left">الرصيد التراكمي</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-mono">
                      {selectedGlReport.movements.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-4 text-center font-sans text-slate-500">
                            لا توجد حركات خلال الفترة الحالية على هذا الحساب (الرصيد مساوٍ للرصيد الافتتاحي).
                          </td>
                        </tr>
                      ) : (
                        selectedGlReport.movements.map((m, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/30">
                            <td className="py-2 px-4 text-emerald-400 font-bold">{m.voucherNo}</td>
                            <td className="py-2 px-4 text-slate-400">{m.dateIso}</td>
                            <td className="py-2 px-4 text-sky-400">{m.sourceReference}</td>
                            <td className="py-2 px-4 font-sans text-slate-200">{m.descriptionAr}</td>
                            <td className="py-2 px-4 text-left text-emerald-400">{m.debitJod}</td>
                            <td className="py-2 px-4 text-left text-amber-400">{m.creditJod}</td>
                            <td className="py-2 px-4 text-left font-bold text-white">{m.runningBalanceJod} د.أ</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODE 4: TRIAL BALANCE (ميزان المراجعة بالمجاميع والأرصدة) */}
      {activeMode === 'TRIAL_BALANCE' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h4 className="text-base font-bold text-white">
                ميزان المراجعة بالمجاميع والأرصدة (Trial Balance — Opening, Period Movements & Closing)
              </h4>
              <p className="text-xs text-slate-400">
                يتحقق آلياً من معادلة القيد المزدوج: مجموع الأرصدة المدينة = مجموع الأرصدة الدائنة بدقة 3 خانات عشرية (فلس)
              </p>
            </div>
            <span className="px-3 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-bold">
              {trialBalanceSummary.isBalanced ? 'ميزان المراجعة متوازن 100%' : 'يوجد فرق'}
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-xl">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">الرمز</th>
                  <th className="py-2.5 px-3">اسم الحساب</th>
                  <th className="py-2.5 px-3 text-left">افتتاحي مدين</th>
                  <th className="py-2.5 px-3 text-left">افتتاحي دائن</th>
                  <th className="py-2.5 px-3 text-left">حركة مدينة</th>
                  <th className="py-2.5 px-3 text-left">حركة دائنة</th>
                  <th className="py-2.5 px-3 text-left">ختامي مدين</th>
                  <th className="py-2.5 px-3 text-left">ختامي دائن</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {cycleData.generalLedgerList.map((g) => (
                  <tr key={g.account.code} className="hover:bg-slate-800/30">
                    <td className="py-2 px-3 text-sky-400 font-bold">{g.account.code}</td>
                    <td className="py-2 px-3 font-sans text-slate-200">{g.account.nameAr}</td>
                    <td className="py-2 px-3 text-left text-slate-400">{g.openingDebitJod}</td>
                    <td className="py-2 px-3 text-left text-slate-400">{g.openingCreditJod}</td>
                    <td className="py-2 px-3 text-left text-emerald-400">{g.periodDebitJod}</td>
                    <td className="py-2 px-3 text-left text-amber-400">{g.periodCreditJod}</td>
                    <td className="py-2 px-3 text-left font-bold text-emerald-300">{g.closingDebitBalanceJod}</td>
                    <td className="py-2 px-3 text-left font-bold text-amber-300">{g.closingCreditBalanceJod}</td>
                  </tr>
                ))}
                <tr className="bg-slate-950 font-extrabold text-sm border-t-2 border-emerald-500/40">
                  <td colSpan={2} className="py-3 px-3 font-sans text-white">
                    الإجمالي العام لميزان المراجعة (تطابق تام 100%)
                  </td>
                  <td className="py-3 px-3 text-left text-slate-200">{trialBalanceSummary.openingDebitJod}</td>
                  <td className="py-3 px-3 text-left text-slate-200">{trialBalanceSummary.openingCreditJod}</td>
                  <td className="py-3 px-3 text-left text-emerald-400">{trialBalanceSummary.periodDebitJod}</td>
                  <td className="py-3 px-3 text-left text-amber-400">{trialBalanceSummary.periodCreditJod}</td>
                  <td className="py-3 px-3 text-left text-emerald-400">{trialBalanceSummary.closingDebitJod} د.أ</td>
                  <td className="py-3 px-3 text-left text-emerald-400">{trialBalanceSummary.closingCreditJod} د.أ</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODE 5: CHART OF ACCOUNTS (دليل الحسابات المعياري الأردني) */}
      {activeMode === 'CHART_OF_ACCOUNTS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h4 className="text-base font-bold text-white">
            دليل الحسابات المعياري الأردني (Standard Jordanian Chart of Accounts — IFRS & ISTD Aligned)
          </h4>
          <div className="overflow-x-auto border border-slate-800 rounded-xl">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4">رقم الحساب</th>
                  <th className="py-2.5 px-4">اسم الحساب</th>
                  <th className="py-2.5 px-4">التصنيف الرئيسي</th>
                  <th className="py-2.5 px-4">الطبيعة المحاسبية</th>
                  <th className="py-2.5 px-4">التبويب في القوائم المالية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {STANDARD_JORDAN_COA.map((acc) => (
                  <tr key={acc.code} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-4 font-mono font-bold text-sky-400">{acc.code}</td>
                    <td className="py-2.5 px-4 text-white font-semibold">{acc.nameAr}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-300">{acc.category}</td>
                    <td className="py-2.5 px-4 font-mono text-emerald-400">{acc.normalSide}</td>
                    <td className="py-2.5 px-4 text-slate-400">{acc.subCategoryAr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
