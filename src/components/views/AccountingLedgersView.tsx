import React, { useState, useMemo, useEffect } from 'react';
import Decimal from 'decimal.js';
import {
  Landmark,
  Package,
  Building,
  Users,
  Lock,
  Plus,
  Trash2,
  ArrowLeftRight,
  RotateCcw,
  Layers,
} from 'lucide-react';
import { InventoryTaxLedger } from '../accounting/InventoryTaxLedger';
import FullAccountingCycleWorkspace from '../accounting/FullAccountingCycleWorkspace';
import {
  calculateTaxDepreciationDifference,
  JORDAN_TAX_DEPRECIATION_RATES,
} from '../../engine/jordanCalculators';
import {
  calculateEmployeeLabourProvisions,
  EmployeeServiceInput,
} from '../../engine/labourLawProvisionEngine';
import {
  generateYearEndClosingPlan,
  TrialBalanceAccount,
} from '../../engine/yearEndClosingEngine';
import { SystemGovernanceService } from '../../services/governance/SystemGovernanceService';

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

interface BankStatementLine {
  id: string;
  date: string;
  reference: string;
  description: string;
  amountJod: number;
  type: 'CREDIT' | 'DEBIT';
  paymentChannel: 'CLIQ' | 'EFWATEERCOM' | 'ACH_WIRE' | 'POS_CARD';
  matchedLedgerId?: string;
}

interface GeneralLedgerCashEntry {
  id: string;
  date: string;
  voucherNo: string;
  partyName: string;
  amountJod: number;
  type: 'RECEIPT' | 'PAYMENT';
}

const INITIAL_BANK_LINES: BankStatementLine[] = [
  {
    id: 'BNK-01',
    date: '2026-03-10',
    reference: 'CLIQ-JOPACC-99412',
    description: 'تحويل فوري وارد عبر نظام كليك - شركة الأفق للتجارة',
    amountJod: 4250.0,
    type: 'CREDIT',
    paymentChannel: 'CLIQ',
    matchedLedgerId: 'GL-101',
  },
  {
    id: 'BNK-02',
    date: '2026-03-12',
    reference: 'EFW-ISTD-88210',
    description: 'تسديد ضريبة مبيعات عبر إي فواتيركم (eFAWATEERcom)',
    amountJod: 1840.5,
    type: 'DEBIT',
    paymentChannel: 'EFWATEERCOM',
    matchedLedgerId: 'GL-102',
  },
  {
    id: 'BNK-03',
    date: '2026-03-15',
    reference: 'CLIQ-JOPACC-99840',
    description: 'دفعة عميل عبر CliQ لم تسجل في الدفاتر بعد',
    amountJod: 980.0,
    type: 'CREDIT',
    paymentChannel: 'CLIQ',
  },
  {
    id: 'BNK-04',
    date: '2026-03-18',
    reference: 'POS-SETTLE-441',
    description: 'عمولة تحصيل نقاط بيع بنكية غير مسجلة دفترياً',
    amountJod: 32.75,
    type: 'DEBIT',
    paymentChannel: 'POS_CARD',
  },
];

const INITIAL_LEDGER_LINES: GeneralLedgerCashEntry[] = [
  {
    id: 'GL-101',
    date: '2026-03-10',
    voucherNo: 'RV-2026-401',
    partyName: 'شركة الأفق للتجارة ذ.م.م',
    amountJod: 4250.0,
    type: 'RECEIPT',
  },
  {
    id: 'GL-102',
    date: '2026-03-12',
    voucherNo: 'PV-2026-219',
    partyName: 'دائرة ضريبة الدخل والمبيعات - إي فواتيركم',
    amountJod: 1840.5,
    type: 'PAYMENT',
  },
  {
    id: 'GL-103',
    date: '2026-03-20',
    voucherNo: 'PV-2026-225',
    partyName: 'شيك صادر لمورد أجهزة لم يُصرف من البنك بعد',
    amountJod: 1200.0,
    type: 'PAYMENT',
  },
];

const INITIAL_TRIAL_BALANCE: TrialBalanceAccount[] = [
  { accountCode: '4101', accountNameAr: 'مبيعات البضائع والحلول التقنية المحلية', category: 'REVENUE', balanceJod: 420000 },
  { accountCode: '4102', accountNameAr: 'إيرادات عقود الصيانة والدعم الفني السنوي', category: 'REVENUE', balanceJod: 95000 },
  { accountCode: '5101', accountNameAr: 'تكلفة البضاعة المباعة وتراخيص البرمجيات', category: 'COST_OF_SALES', balanceJod: 215000 },
  { accountCode: '5201', accountNameAr: 'الرواتب والأجور وحصة الشركة في الضمان الاجتماعي', category: 'OPERATING_EXPENSE', balanceJod: 112000 },
  { accountCode: '5202', accountNameAr: 'الإيجارات والمرافق والكهرباء والاتصالات', category: 'OPERATING_EXPENSE', balanceJod: 38000 },
  { accountCode: '5203', accountNameAr: 'مصاريف استهلاك الأصول الثابتة والصيانة', category: 'OPERATING_EXPENSE', balanceJod: 24000 },
];

export interface AccountingLedgersViewProps {
  initialSubTab?: string;
}

type AccountingSubTabId =
  | 'erp-full-cycle'
  | 'bank-reconciliation'
  | 'inventory-ledger'
  | 'fixed-assets'
  | 'labour-provisions'
  | 'year-end-closing';

export const AccountingLedgersView: React.FC<AccountingLedgersViewProps> = ({ initialSubTab }) => {
  const [activeSubTab, setActiveSubTab] = useState<AccountingSubTabId>('erp-full-cycle');

  useEffect(() => {
    if (
      initialSubTab &&
      [
        'erp-full-cycle',
        'bank-reconciliation',
        'inventory-ledger',
        'fixed-assets',
        'labour-provisions',
        'year-end-closing',
      ].includes(initialSubTab)
    ) {
      setActiveSubTab(initialSubTab as AccountingSubTabId);
    }
  }, [initialSubTab]);

  // --- Sub-tab 1: Bank Reconciliation & FX State ---
  const [fxAmount, setFxAmount] = useState<number>(10000);
  const [fxCurrency, setFxCurrency] = useState<'USD' | 'EUR' | 'GBP' | 'SAR' | 'AED'>('USD');
  const fxRatesToJod: Record<'USD' | 'EUR' | 'GBP' | 'SAR' | 'AED', number> = {
    USD: 0.709, // CBJ Fixed Peg
    EUR: 0.772,
    GBP: 0.901,
    SAR: 0.189,
    AED: 0.193,
  };

  const [bankLines, setBankLines] = useState<BankStatementLine[]>(INITIAL_BANK_LINES);
  const [ledgerLines, setLedgerLines] = useState<GeneralLedgerCashEntry[]>(INITIAL_LEDGER_LINES);

  // Add Bank Line State
  const [newBnkRef, setNewBnkRef] = useState('CLIQ-JOPACC-99915');
  const [newBnkDesc, setNewBnkDesc] = useState('تحويل فوري وارد من عميل');
  const [newBnkAmount, setNewBnkAmount] = useState('650.000');
  const [newBnkType, setNewBnkType] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
  const [newBnkChannel, setNewBnkChannel] = useState<BankStatementLine['paymentChannel']>('CLIQ');

  // Add Ledger Entry State
  const [newGlVoucher, setNewGlVoucher] = useState('RV-2026-408');
  const [newGlParty, setNewGlParty] = useState('شركة النور للتوريدات');
  const [newGlAmount, setNewGlAmount] = useState('650.000');
  const [newGlType, setNewGlType] = useState<'RECEIPT' | 'PAYMENT'>('RECEIPT');

  const handleAutoMatchReconciliation = () => {
    const matchedLedgerIds = new Set(
      bankLines.map((b) => b.matchedLedgerId).filter(Boolean) as string[]
    );

    const updatedBankLines = bankLines.map((bLine) => {
      if (bLine.matchedLedgerId) return bLine;
      const expectedGlType = bLine.type === 'CREDIT' ? 'RECEIPT' : 'PAYMENT';
      const candidate = ledgerLines.find(
        (gl) =>
          !matchedLedgerIds.has(gl.id) &&
          gl.type === expectedGlType &&
          new Decimal(gl.amountJod).equals(new Decimal(bLine.amountJod))
      );
      if (candidate) {
        matchedLedgerIds.add(candidate.id);
        return { ...bLine, matchedLedgerId: candidate.id };
      }
      return bLine;
    });

    setBankLines(updatedBankLines);
  };

  const handleAddBankLine = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Math.max(0, Number(newBnkAmount) || 0);
    if (amt <= 0 || !newBnkDesc.trim()) return;

    const newLine: BankStatementLine = {
      id: `BNK-0${bankLines.length + 1}`,
      date: new Date().toISOString().slice(0, 10),
      reference: newBnkRef.trim() || `REF-${Date.now().toString().slice(-4)}`,
      description: newBnkDesc.trim(),
      amountJod: amt,
      type: newBnkType,
      paymentChannel: newBnkChannel,
    };
    setBankLines((prev) => [...prev, newLine]);
    SystemGovernanceService.recordAuditAction({
      actorName: 'محاسب التسويات البنكية',
      actorRole: 'الإدارة المالية',
      moduleName: 'التسوية البنكية (CliQ & eFAWATEERcom)',
      actionLabel: `إدراج حركة كشف بنكي (${newLine.reference})`,
      oldValue: `عدد حركات البنك: ${bankLines.length}`,
      newValue: `${newLine.description} — ${amt.toFixed(3)} د.أ (${newLine.type})`,
    });
  };

  const handleAddLedgerLine = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Math.max(0, Number(newGlAmount) || 0);
    if (amt <= 0 || !newGlParty.trim()) return;

    const newEntry: GeneralLedgerCashEntry = {
      id: `GL-10${ledgerLines.length + 1}`,
      date: new Date().toISOString().slice(0, 10),
      voucherNo: newGlVoucher.trim() || `V-${Date.now().toString().slice(-4)}`,
      partyName: newGlParty.trim(),
      amountJod: amt,
      type: newGlType,
    };
    setLedgerLines((prev) => [...prev, newEntry]);
    SystemGovernanceService.recordAuditAction({
      actorName: 'محاسب التسويات البنكية',
      actorRole: 'الإدارة المالية',
      moduleName: 'دفتر النقدية والبنك (General Ledger)',
      actionLabel: `إدراج سند مالي دفتري (${newEntry.voucherNo})`,
      oldValue: `عدد القيود الدفترية: ${ledgerLines.length}`,
      newValue: `${newEntry.partyName} — ${amt.toFixed(3)} د.أ`,
    });
  };

  const reconciliationSummary = useMemo(() => {
    let bankStatementBalanceDec = new Decimal(15000);
    bankLines.forEach((b) => {
      bankStatementBalanceDec =
        b.type === 'CREDIT'
          ? bankStatementBalanceDec.plus(b.amountJod)
          : bankStatementBalanceDec.minus(b.amountJod);
    });

    let bookBalanceDec = new Decimal(15000);
    ledgerLines.forEach((l) => {
      bookBalanceDec =
        l.type === 'RECEIPT'
          ? bookBalanceDec.plus(l.amountJod)
          : bookBalanceDec.minus(l.amountJod);
    });

    const unmatchedBankLines = bankLines.filter((b) => !b.matchedLedgerId);
    const matchedLedgerIds = new Set(bankLines.map((b) => b.matchedLedgerId).filter(Boolean));
    const outstandingChequesOrDeposits = ledgerLines.filter((l) => !matchedLedgerIds.has(l.id));

    let adjustedBankDec = bankStatementBalanceDec;
    outstandingChequesOrDeposits.forEach((gl) => {
      adjustedBankDec =
        gl.type === 'RECEIPT'
          ? adjustedBankDec.plus(gl.amountJod)
          : adjustedBankDec.minus(gl.amountJod);
    });

    let adjustedBookDec = bookBalanceDec;
    unmatchedBankLines.forEach((b) => {
      adjustedBookDec =
        b.type === 'CREDIT'
          ? adjustedBookDec.plus(b.amountJod)
          : adjustedBookDec.minus(b.amountJod);
    });

    return {
      bankStatementBalance: bankStatementBalanceDec.toFixed(3),
      bookBalance: bookBalanceDec.toFixed(3),
      adjustedBankBalance: adjustedBankDec.toFixed(3),
      adjustedBookBalance: adjustedBookDec.toFixed(3),
      isBalanced: adjustedBankDec.equals(adjustedBookDec),
      unmatchedBankLines,
      outstandingChequesOrDeposits,
    };
  }, [bankLines, ledgerLines]);

  // --- Sub-tab 3: Fixed Assets Register State ---
  const [assets, setAssets] = useState([
    {
      id: 'AST-01',
      nameAr: 'مقر الشركة الإداري والمستودع (عمّان - القسطل)',
      cost: 240000,
      salvage: 20000,
      bookRate: 0.04,
      taxCategory: 'BUILDINGS_INDUSTRIAL' as keyof typeof JORDAN_TAX_DEPRECIATION_RATES,
      monthsInServiceThisYear: 12,
    },
    {
      id: 'AST-02',
      nameAr: 'خوادم سحابية وأجهزة شبكات (Data Center Servers)',
      cost: 48000,
      salvage: 3000,
      bookRate: 0.3333,
      taxCategory: 'COMPUTERS_AND_SOFTWARE' as keyof typeof JORDAN_TAX_DEPRECIATION_RATES,
      monthsInServiceThisYear: 12,
    },
    {
      id: 'AST-03',
      nameAr: 'أسطول مركبات التوزيع والنقل المبرد',
      cost: 65000,
      salvage: 5000,
      bookRate: 0.20,
      taxCategory: 'VEHICLES_AND_TRANSPORT' as keyof typeof JORDAN_TAX_DEPRECIATION_RATES,
      monthsInServiceThisYear: 12,
    },
  ]);

  const [newAssetName, setNewAssetName] = useState('خط إنتاج وتغليف أوتوماتيكي');
  const [newAssetCost, setNewAssetCost] = useState(85000);
  const [newAssetSalvage, setNewAssetSalvage] = useState(5000);
  const [newAssetBookRate, setNewAssetBookRate] = useState(0.15);
  const [newAssetTaxCat, setNewAssetTaxCat] =
    useState<keyof typeof JORDAN_TAX_DEPRECIATION_RATES>('MACHINERY_AND_EQUIPMENT');
  const [newAssetMonths, setNewAssetMonths] = useState(12);

  const handleAddAsset = () => {
    if (!newAssetName.trim() || newAssetCost <= 0) return;
    const monthsClamped = Math.min(12, Math.max(1, Number(newAssetMonths) || 12));
    setAssets([
      ...assets,
      {
        id: `AST-0${assets.length + 1}`,
        nameAr: newAssetName,
        cost: newAssetCost,
        salvage: Math.max(0, Number(newAssetSalvage) || 0),
        bookRate: newAssetBookRate,
        taxCategory: newAssetTaxCat,
        monthsInServiceThisYear: monthsClamped,
      },
    ]);
  };

  const handleDeleteAsset = (id: string) => {
    if (assets.length <= 1) return;
    setAssets((prev) => prev.filter((a) => a.id !== id));
  };

  const fixedAssetsTotals = useMemo(() => {
    let totalDepreciableBase = new Decimal(0);
    let totalBookDep = new Decimal(0);
    let totalTaxAllowedDep = new Decimal(0);
    let totalDisallowedDiff = new Decimal(0);

    assets.forEach((asset) => {
      const calc = calculateTaxDepreciationDifference(
        asset.cost,
        asset.salvage,
        asset.bookRate,
        asset.taxCategory,
        asset.monthsInServiceThisYear
      );
      totalDepreciableBase = totalDepreciableBase.plus(calc.depreciableBase);
      totalBookDep = totalBookDep.plus(calc.bookDepreciation);
      totalTaxAllowedDep = totalTaxAllowedDep.plus(calc.taxAllowedDepreciation);
      totalDisallowedDiff = totalDisallowedDiff.plus(calc.disallowedDepreciationExpense);
    });

    return {
      totalDepreciableBase: totalDepreciableBase.toFixed(3),
      totalBookDep: totalBookDep.toFixed(3),
      totalTaxAllowedDep: totalTaxAllowedDep.toFixed(3),
      totalDisallowedDiff: totalDisallowedDiff.toFixed(3),
    };
  }, [assets]);

  // --- Sub-tab 4: Labour Law Provisions State ---
  const [empInput, setEmpInput] = useState<EmployeeServiceInput>({
    employeeId: 'EMP-2021-014',
    employeeName: 'المهندس طارق عبد الرحمن المجالي',
    hireDateIso: '2021-01-01',
    calculationDateIso: '2026-04-01',
    lastGrossMonthlySalaryJod: 1650,
    isSubjectToSocialSecurity: true,
    unusedAnnualLeaveDays: 14,
    terminationScenario: 'ACTIVE_SERVICE',
  });

  const labourProvisionResult = useMemo(() => {
    return calculateEmployeeLabourProvisions(empInput);
  }, [empInput]);

  // --- Sub-tab 5: Year-End Closing Engine State ---
  const [trialBalance, setTrialBalance] = useState<TrialBalanceAccount[]>(INITIAL_TRIAL_BALANCE);
  const [taxNonDeductibleAddBacks, setTaxNonDeductibleAddBacks] = useState<number>(6400);
  const [closingCorporateTaxRate, setClosingCorporateTaxRate] = useState<number>(0.20);
  const [newTbCode, setNewTbCode] = useState('5209');
  const [newTbName, setNewTbName] = useState('مصاريف تسويق رقمي ومعارض');
  const [newTbCategory, setNewTbCategory] = useState<TrialBalanceAccount['category']>('OPERATING_EXPENSE');
  const [newTbBalance, setNewTbBalance] = useState('14500');

  const handleAddTbAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const bal = Math.max(0, Number(newTbBalance) || 0);
    if (bal <= 0 || !newTbName.trim()) return;

    setTrialBalance((prev) => [
      ...prev,
      {
        accountCode: newTbCode.trim() || `ACC-${prev.length + 1}`,
        accountNameAr: newTbName.trim(),
        category: newTbCategory,
        balanceJod: bal,
      },
    ]);
  };

  const handleDeleteTbAccount = (code: string) => {
    if (trialBalance.length <= 2) return;
    setTrialBalance((prev) => prev.filter((a) => a.accountCode !== code));
  };

  const yearEndClosingPlan = useMemo(() => {
    return generateYearEndClosingPlan(trialBalance, taxNonDeductibleAddBacks, closingCorporateTaxRate, true);
  }, [trialBalance, taxNonDeductibleAddBacks, closingCorporateTaxRate]);

  return (
    <div className="space-y-6">
      {/* Header & Navigation */}
      <div className="bg-slate-900 border border-slate-800 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Landmark className="w-4 h-4" />
              <span>المحاسبة والدفاتر المالية ومسك السجلات</span>
            </div>
            <h2 className="text-2xl font-bold text-white">
              إدارة الحسابات، المخزون، الأصول الثابتة، وإقفال السنة المالية
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              إدارة مالية متكاملة تساعدك على تنظيم الحسابات وتتبع الإيرادات والمصروفات وإعداد التقارير المالية بسهولة ودقة وفق المعايير المحاسبية والتشريعات الأردنية.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-5">
          <button
            type="button"
            onClick={() => setActiveSubTab('erp-full-cycle')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'erp-full-cycle'
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>0. الدورة المحاسبية المتكاملة والقوائم المالية (ERP Core)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('bank-reconciliation')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'bank-reconciliation'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Landmark className="w-4 h-4" />
            <span>1. التسوية البنكية (CliQ & eFAWATEERcom) والعملات</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('inventory-ledger')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'inventory-ledger'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>2. دفتر المخزون والتصنيف الضريبي (WAC / FIFO)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('fixed-assets')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'fixed-assets'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>3. سجل الأصول الثابتة وفروقات الإهلاك الضريبي</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('labour-provisions')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'labour-provisions'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>4. مخصصات قانون العمل الأردني (مادة 32 و 55)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('year-end-closing')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'year-end-closing'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>5. قيود إقفال السنة المالية والاحتياطي الإجباري (مادة 186)</span>
          </button>
        </div>
      </div>

      {/* Sub-tab 0: Full Integrated ERP Accounting Cycle */}
      {activeSubTab === 'erp-full-cycle' && <FullAccountingCycleWorkspace />}

      {/* Sub-tab 1: Bank Reconciliation & CBJ FX */}
      {activeSubTab === 'bank-reconciliation' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-slate-900 border border-slate-800 p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white">
                  مذكرة التسوية البنكية (مطابقة حركات CliQ و eFAWATEERcom مع الأستاذ العام)
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAutoMatchReconciliation}
                    className="text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 cursor-pointer"
                  >
                    مطابقة آلية للحركات المتكافئة
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBankLines(INITIAL_BANK_LINES);
                      setLedgerLines(INITIAL_LEDGER_LINES);
                    }}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1.5 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>إعادة ضبط</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950 border border-slate-800 p-3">
                  <span className="text-[11px] text-slate-400 block">رصيد كشف البنك الفعلي</span>
                  <span className="text-lg font-mono font-bold text-white" dir="ltr">
                    {reconciliationSummary.bankStatementBalance} JOD
                  </span>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-3">
                  <span className="text-[11px] text-slate-400 block">رصيد حساب البنك بالدفاتر</span>
                  <span className="text-lg font-mono font-bold text-amber-400" dir="ltr">
                    {reconciliationSummary.bookBalance} JOD
                  </span>
                </div>
                <div className="bg-slate-950 border border-emerald-700/40 p-3">
                  <span className="text-[11px] text-emerald-300 block">الرصيد المعدل لكشف البنك</span>
                  <span className="text-lg font-mono font-bold text-emerald-400" dir="ltr">
                    {reconciliationSummary.adjustedBankBalance} JOD
                  </span>
                </div>
                <div className="bg-slate-950 border border-emerald-700/40 p-3">
                  <span className="text-[11px] text-emerald-300 block">الرصيد المعدل للدفاتر</span>
                  <span className="text-lg font-mono font-bold text-emerald-400" dir="ltr">
                    {reconciliationSummary.adjustedBookBalance} JOD
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-950 border border-slate-800 p-4 space-y-2">
                  <div className="text-xs font-bold text-amber-400">
                    حركات واردة في كشف البنك غير مسجلة في الدفاتر ({reconciliationSummary.unmatchedBankLines.length}):
                  </div>
                  {reconciliationSummary.unmatchedBankLines.map((b) => (
                    <div key={b.id} className="text-xs border-b border-slate-900 pb-2">
                      <div className="flex justify-between font-mono">
                        <span className="text-white">{b.reference} ({b.paymentChannel})</span>
                        <span
                          className={b.type === 'CREDIT' ? 'text-emerald-400' : 'text-rose-400'}
                          dir="ltr"
                        >
                          {b.type === 'CREDIT' ? '+' : '-'}{b.amountJod.toFixed(3)} JOD
                        </span>
                      </div>
                      <div className="text-slate-400 text-[11px]">{b.description}</div>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-950 border border-slate-800 p-4 space-y-2">
                  <div className="text-xs font-bold text-blue-400">
                    شيكات وحوالات مسجلة دفترياً قيد التحصيل ({reconciliationSummary.outstandingChequesOrDeposits.length}):
                  </div>
                  {reconciliationSummary.outstandingChequesOrDeposits.map((l) => (
                    <div key={l.id} className="text-xs border-b border-slate-900 pb-2">
                      <div className="flex justify-between font-mono">
                        <span className="text-white">{l.voucherNo}</span>
                        <span
                          className={l.type === 'RECEIPT' ? 'text-emerald-400' : 'text-rose-400'}
                          dir="ltr"
                        >
                          {l.type === 'RECEIPT' ? '+' : '-'}{l.amountJod.toFixed(3)} JOD
                        </span>
                      </div>
                      <div className="text-slate-400 text-[11px]">{l.partyName}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                <form onSubmit={handleAddBankLine} className="bg-slate-950 border border-slate-800 p-3 space-y-2">
                  <div className="text-xs font-bold text-white">إضافة حركة كشف بنكي جديدة</div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newBnkRef}
                      onChange={(e) => setNewBnkRef(e.target.value)}
                      placeholder="رقم المرجع"
                      className="bg-slate-900 border border-slate-700 px-2 py-1 text-xs font-mono text-white"
                    />
                    <select
                      value={newBnkChannel}
                      onChange={(e) => setNewBnkChannel(e.target.value as BankStatementLine['paymentChannel'])}
                      className="bg-slate-900 border border-slate-700 px-2 py-1 text-xs text-white"
                    >
                      <option value="CLIQ">CliQ</option>
                      <option value="EFWATEERCOM">eFAWATEERcom</option>
                      <option value="POS_CARD">POS Card</option>
                      <option value="ACH_WIRE">حوالة ACH</option>
                    </select>
                  </div>
                  <input
                    type="text"
                    value={newBnkDesc}
                    onChange={(e) => setNewBnkDesc(e.target.value)}
                    placeholder="البيان"
                    className="w-full bg-slate-900 border border-slate-700 px-2 py-1 text-xs text-white"
                  />
                  <div className="flex gap-2">
                    <select
                      value={newBnkType}
                      onChange={(e) => setNewBnkType(e.target.value as 'CREDIT' | 'DEBIT')}
                      className="bg-slate-900 border border-slate-700 px-2 py-1 text-xs text-white"
                    >
                      <option value="CREDIT">إيداع (+ Credit)</option>
                      <option value="DEBIT">سحب (- Debit)</option>
                    </select>
                    <input
                      type="number"
                      step="0.001"
                      value={newBnkAmount}
                      onChange={(e) => setNewBnkAmount(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 px-2 py-1 text-xs font-mono text-white"
                    />
                    <button
                      type="submit"
                      className="bg-amber-500 text-slate-950 font-bold text-xs px-3 py-1 cursor-pointer"
                    >
                      إدراج
                    </button>
                  </div>
                </form>

                <form onSubmit={handleAddLedgerLine} className="bg-slate-950 border border-slate-800 p-3 space-y-2">
                  <div className="text-xs font-bold text-white">إضافة سند دفتري (الأستاذ العام)</div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newGlVoucher}
                      onChange={(e) => setNewGlVoucher(e.target.value)}
                      placeholder="رقم السند"
                      className="bg-slate-900 border border-slate-700 px-2 py-1 text-xs font-mono text-white"
                    />
                    <select
                      value={newGlType}
                      onChange={(e) => setNewGlType(e.target.value as 'RECEIPT' | 'PAYMENT')}
                      className="bg-slate-900 border border-slate-700 px-2 py-1 text-xs text-white"
                    >
                      <option value="RECEIPT">سند قبض (Receipt)</option>
                      <option value="PAYMENT">سند صرف (Payment)</option>
                    </select>
                  </div>
                  <input
                    type="text"
                    value={newGlParty}
                    onChange={(e) => setNewGlParty(e.target.value)}
                    placeholder="اسم الجهة / البيان"
                    className="w-full bg-slate-900 border border-slate-700 px-2 py-1 text-xs text-white"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.001"
                      value={newGlAmount}
                      onChange={(e) => setNewGlAmount(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 px-2 py-1 text-xs font-mono text-white"
                    />
                    <button
                      type="submit"
                      className="bg-emerald-600 text-white font-bold text-xs px-3 py-1 cursor-pointer"
                    >
                      تسجيل
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* CBJ FX Converter */}
            <div className="lg:col-span-4 bg-slate-900 border border-slate-800 p-6 space-y-4">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm border-b border-slate-800 pb-3">
                <ArrowLeftRight className="w-4 h-4" />
                <span>محول العملات الأجنبية (سعر البنك المركزي الأردني CBJ)</span>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">المبلغ بالعملة الأجنبية</label>
                <input
                  type="number"
                  value={fxAmount}
                  onChange={(e) => setFxAmount(Number(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 text-sm font-mono text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">العملة الأجنبية</label>
                <select
                  value={fxCurrency}
                  onChange={(e) => setFxCurrency(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white"
                >
                  <option value="USD">دولار أمريكي (USD) - سعر الربط القياسي 0.7090</option>
                  <option value="EUR">يورو أوروبي (EUR) - 0.7720</option>
                  <option value="GBP">جنيه إسترليني (GBP) - 0.9010</option>
                  <option value="SAR">ريال سعودي (SAR) - 0.1890</option>
                  <option value="AED">درهم إماراتي (AED) - 0.1930</option>
                </select>
              </div>

              <div className="bg-slate-950 border border-amber-500/40 p-4">
                <span className="text-xs text-slate-400 block">المعادل بالدينار الأردني (IAS 21)</span>
                <span className="text-2xl font-mono font-bold text-amber-400 mt-1 block" dir="ltr">
                  {new Decimal(fxAmount).times(fxRatesToJod[fxCurrency]).toFixed(3)} JOD
                </span>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  سعر الصرف القياسي المعلن لغايات الجمارك وضريبة المبيعات: 1 {fxCurrency} ={' '}
                  {fxRatesToJod[fxCurrency]} JOD
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 2: Inventory Tax Ledger */}
      {activeSubTab === 'inventory-ledger' && <InventoryTaxLedger />}

      {/* Sub-tab 3: Fixed Assets & Tax Depreciation Schedule */}
      {activeSubTab === 'fixed-assets' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-5">
            <h3 className="text-sm font-bold text-white mb-3">
              إضافة أصل ثابت جديد وفحص سقف الإهلاك الضريبي (نظام الاستهلاكات رقم 33 لسنة 2015)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-6 gap-3 items-end">
              <div className="sm:col-span-2">
                <label className="block text-xs text-slate-400 mb-1">اسم الأصل الثابت</label>
                <input
                  type="text"
                  value={newAssetName}
                  onChange={(e) => setNewAssetName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">التكلفة (JOD)</label>
                <input
                  type="number"
                  value={newAssetCost}
                  onChange={(e) => setNewAssetCost(Number(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">الخردة (JOD)</label>
                <input
                  type="number"
                  min="0"
                  value={newAssetSalvage}
                  onChange={(e) => setNewAssetSalvage(Number(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">نسبة الإهلاك المحاسبي</label>
                <input
                  type="number"
                  step="0.01"
                  value={newAssetBookRate}
                  onChange={(e) => setNewAssetBookRate(Number(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">أشهر الخدمة (1-12)</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={newAssetMonths}
                  onChange={(e) => setNewAssetMonths(Number(e.target.value) || 12)}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 text-xs font-mono text-white"
                />
              </div>
              <div className="sm:col-span-6 flex flex-wrap items-center justify-between gap-2 pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">فئة الإهلاك الضريبي القصوى:</span>
                  <select
                    value={newAssetTaxCat}
                    onChange={(e) => setNewAssetTaxCat(e.target.value as any)}
                    className="bg-slate-950 border border-slate-700 px-3 py-1.5 text-xs text-white"
                  >
                    <option value="BUILDINGS_CONCRETE">مبانٍ خرسانية (2%)</option>
                    <option value="BUILDINGS_INDUSTRIAL">مبانٍ صناعية (4%)</option>
                    <option value="MACHINERY_AND_EQUIPMENT">آلات ومعدات صناعية (10%)</option>
                    <option value="VEHICLES_AND_TRANSPORT">وسائط نقل ومركبات (15%)</option>
                    <option value="COMPUTERS_AND_SOFTWARE">أجهزة حاسوب وبرمجيات (25%)</option>
                    <option value="FURNITURE_AND_FIXTURES">أثاث ومفروشات وتجهيزات (10%)</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleAddAsset}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>إدراج الأصل الثابت في السجل</span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">الأصل الثابت</th>
                  <th className="p-3 text-left">الوعاء القابل للإهلاك</th>
                  <th className="p-3 text-left">أشهر الخدمة</th>
                  <th className="p-3 text-left">الإهلاك المحاسبي (IAS 16)</th>
                  <th className="p-3 text-left">السقف الضريبي المسموح (ISTD)</th>
                  <th className="p-3 text-left">فرق الإهلاك غير المقبول ضريبياً</th>
                  <th className="p-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {assets.map((asset) => {
                  const calc = calculateTaxDepreciationDifference(
                    asset.cost,
                    asset.salvage,
                    asset.bookRate,
                    asset.taxCategory,
                    asset.monthsInServiceThisYear
                  );
                  return (
                    <tr key={asset.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-white">{asset.nameAr}</td>
                      <td className="p-3 font-mono text-left text-slate-300" dir="ltr">
                        {calc.depreciableBase.toFixed(3)} JOD
                      </td>
                      <td className="p-3 font-mono text-left text-slate-400">
                        {asset.monthsInServiceThisYear} / 12
                      </td>
                      <td className="p-3 font-mono text-left text-white" dir="ltr">
                        {calc.bookDepreciation.toFixed(3)} JOD ({(asset.bookRate * 100).toFixed(1)}%)
                      </td>
                      <td className="p-3 font-mono text-left text-emerald-400" dir="ltr">
                        {calc.taxAllowedDepreciation.toFixed(3)} JOD (Max {(calc.maxTaxRate * 100).toFixed(0)}%)
                      </td>
                      <td className="p-3 font-mono text-left font-bold" dir="ltr">
                        {calc.disallowedDepreciationExpense > 0 ? (
                          <span className="text-rose-400">
                            +{calc.disallowedDepreciationExpense.toFixed(3)} JOD (يُرد للوعاء)
                          </span>
                        ) : (
                          <span className="text-emerald-400">0.000 JOD (متطابق)</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteAsset(asset.id)}
                          className="text-slate-500 hover:text-rose-400 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-950 border-t-2 border-slate-700 font-mono text-xs font-bold">
                <tr>
                  <td className="p-3 text-amber-400 font-sans">إجمالي سجل الأصول الثابتة</td>
                  <td className="p-3 text-left text-white" dir="ltr">
                    {fixedAssetsTotals.totalDepreciableBase} JOD
                  </td>
                  <td className="p-3 text-left text-slate-400">—</td>
                  <td className="p-3 text-left text-white" dir="ltr">
                    {fixedAssetsTotals.totalBookDep} JOD
                  </td>
                  <td className="p-3 text-left text-emerald-400" dir="ltr">
                    {fixedAssetsTotals.totalTaxAllowedDep} JOD
                  </td>
                  <td className="p-3 text-left text-rose-400" dir="ltr">
                    +{fixedAssetsTotals.totalDisallowedDiff} JOD
                  </td>
                  <td className="p-3"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Sub-tab 4: Jordanian Labour Law Provisions */}
      {activeSubTab === 'labour-provisions' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
              حاسبة مخصصات الموظفين (قانون العمل الأردني رقم 8 لسنة 1996 وتعديلاته)
            </h3>

            <div>
              <label className="block text-xs text-slate-400 mb-1">اسم الموظف</label>
              <input
                type="text"
                value={empInput.employeeName}
                onChange={(e) => setEmpInput({ ...empInput, employeeName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">تاريخ المباشرة</label>
                <input
                  type="date"
                  value={empInput.hireDateIso}
                  onChange={(e) => setEmpInput({ ...empInput, hireDateIso: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">تاريخ الاحتساب</label>
                <input
                  type="date"
                  value={empInput.calculationDateIso}
                  onChange={(e) => setEmpInput({ ...empInput, calculationDateIso: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 text-xs font-mono text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">الأجر الشهري الإجمالي الأخير (JOD)</label>
                <input
                  type="number"
                  value={empInput.lastGrossMonthlySalaryJod}
                  onChange={(e) =>
                    setEmpInput({
                      ...empInput,
                      lastGrossMonthlySalaryJod: Number(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">رصيد الإجازات السنوية غير المستنفد (يوم)</label>
                <input
                  type="number"
                  value={empInput.unusedAnnualLeaveDays}
                  onChange={(e) =>
                    setEmpInput({
                      ...empInput,
                      unusedAnnualLeaveDays: Number(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 text-xs font-mono text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">حالة الخدمة / سيناريو إنهاء العقد</label>
              <select
                value={empInput.terminationScenario}
                onChange={(e) =>
                  setEmpInput({ ...empInput, terminationScenario: e.target.value as any })
                }
                className="w-full bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white"
              >
                <option value="ACTIVE_SERVICE">على رأس عمله (تقييم المخصص التراكمي)</option>
                <option value="MUTUAL_OR_LAWFUL_END">انتهاء خدمة طبيعي / استقالة نظامية</option>
                <option value="ARBITRARY_DISMISSAL_ART_25">
                  فصل تعسفي غير مشروع (تعويض المادة 25 + بدل إشعار المادة 23)
                </option>
              </select>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={empInput.isSubjectToSocialSecurity}
                  onChange={(e) =>
                    setEmpInput({ ...empInput, isSubjectToSocialSecurity: e.target.checked })
                  }
                  className="accent-amber-500"
                />
                <span className="text-xs text-slate-300">
                  الموظف مشمول بأحكام مؤسسة الضمان الاجتماعي (إلغاء مكافأة المادة 32 والاكتفاء بمخصص الإجازات)
                </span>
              </label>
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                تفصيل الاستحقاقات العمالية والمعالجة الضريبية للمخصصات
              </h3>
              <span className="text-xs font-mono text-amber-400 bg-slate-950 border border-slate-800 px-2.5 py-1">
                الأجر اليومي (الراتب ÷ 30): {labourProvisionResult.dailyWageJod.toFixed(3)} JOD
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-950 border border-slate-800 p-3">
                <span className="text-[11px] text-slate-400 block">مدة الخدمة المحسوبة</span>
                <span className="text-lg font-mono font-bold text-white" dir="ltr">
                  {labourProvisionResult.yearsOfService} Years
                </span>
                <span className="text-[10px] text-slate-400 font-mono block">
                  ({labourProvisionResult.exactServiceDays} يوماً فعلياً)
                </span>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-3">
                <span className="text-[11px] text-slate-400 block">مكافأة نهاية الخدمة (مادة 32)</span>
                <span className="text-lg font-mono font-bold text-amber-400" dir="ltr">
                  {labourProvisionResult.endOfServiceIndemnityJod.toFixed(3)} JOD
                </span>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-3">
                <span className="text-[11px] text-slate-400 block">بدل الإجازات المتراكمة (مادة 61)</span>
                <span className="text-lg font-mono font-bold text-emerald-400" dir="ltr">
                  {labourProvisionResult.leaveEncashmentProvisionJod.toFixed(3)} JOD
                </span>
              </div>
              <div className="bg-slate-950 border border-rose-500/40 p-3">
                <span className="text-[11px] text-rose-300 block">تعويض الفصل التعسفي + الإشعار</span>
                <span className="text-lg font-mono font-bold text-rose-400" dir="ltr">
                  {(
                    labourProvisionResult.arbitraryDismissalCompensationJod +
                    labourProvisionResult.noticePeriodPayJod
                  ).toFixed(3)}{' '}
                  JOD
                </span>
              </div>
            </div>

            <div className="bg-slate-950 border-r-2 border-amber-500 p-4 text-xs text-slate-300 leading-relaxed">
              <strong className="text-amber-400 block mb-1">
                القاعدة الضريبية للمخصصات (قانون ضريبة الدخل الأردني):
              </strong>
              {labourProvisionResult.taxDeductibilityNoteAr}
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 5: Year-End Closing & Statutory Reserve */}
      {activeSubTab === 'year-end-closing' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4">
              <div className="text-xs text-slate-400">صافي الربح المحاسبي قبل الضريبة</div>
              <div className="text-2xl font-mono font-bold text-white mt-1" dir="ltr">
                {yearEndClosingPlan.accountingProfitBeforeTaxJod.toLocaleString()} JOD
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4">
              <div className="text-xs text-slate-400">مخصص ضريبة الدخل والوطنية ({Math.round(closingCorporateTaxRate * 100)}% + 1%)</div>
              <div className="text-2xl font-mono font-bold text-rose-400 mt-1" dir="ltr">
                {yearEndClosingPlan.totalTaxProvisionJod.toLocaleString()} JOD
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                الربح الضريبي المعدل: {yearEndClosingPlan.taxableIncomeJod.toLocaleString()} JOD
              </div>
            </div>

            <div className="bg-slate-900 border border-amber-500/40 p-4">
              <div className="text-xs text-amber-300">الاحتياطي الإجباري 10% (مادة 186 شركات)</div>
              <div className="text-2xl font-mono font-bold text-amber-400 mt-1" dir="ltr">
                {yearEndClosingPlan.statutoryReserve10PercentJod.toLocaleString()} JOD
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                يُقتطع إلزامياً قبل أي توزيع للأرباح
              </div>
            </div>

            <div className="bg-slate-900 border border-emerald-500/40 p-4">
              <div className="text-xs text-emerald-300">صافي الأرباح المدورة القابلة للتوزيع</div>
              <div className="text-2xl font-mono font-bold text-emerald-400 mt-1" dir="ltr">
                {yearEndClosingPlan.netTransferToRetainedEarningsJod.toLocaleString()} JOD
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-5 space-y-4">
              <h4 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
                إعدادات الضريبة وحسابات ميزان المراجعة ({trialBalance.length})
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">نسبة ضريبة دخل القطاع</label>
                  <select
                    value={closingCorporateTaxRate}
                    onChange={(e) => setClosingCorporateTaxRate(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value={0.20}>20% — تجاري وخدمي عام</option>
                    <option value={0.14}>14% — صناعي (تفضيلي)</option>
                    <option value={0.24}>24% — اتصالات وتأمين وتعدين</option>
                    <option value={0.35}>35% — بنوك ومصارف</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">مصاريف غير مقبولة ضريبياً (JOD)</label>
                  <input
                    type="number"
                    min="0"
                    value={taxNonDeductibleAddBacks}
                    onChange={(e) => setTaxNonDeductibleAddBacks(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-xs font-mono text-white"
                  />
                </div>
              </div>

              <form onSubmit={handleAddTbAccount} className="space-y-2 pt-2 border-t border-slate-800">
                <div className="text-xs font-bold text-amber-400">إضافة حساب لميزان المراجعة</div>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newTbCode}
                    onChange={(e) => setNewTbCode(e.target.value)}
                    placeholder="رمز الحساب"
                    className="bg-slate-950 border border-slate-700 px-2 py-1 text-xs font-mono text-white"
                  />
                  <select
                    value={newTbCategory}
                    onChange={(e) => setNewTbCategory(e.target.value as TrialBalanceAccount['category'])}
                    className="col-span-2 bg-slate-950 border border-slate-700 px-2 py-1 text-xs text-white"
                  >
                    <option value="REVENUE">إيرادات (Revenue)</option>
                    <option value="COST_OF_SALES">تكلفة مبيعات (COGS)</option>
                    <option value="OPERATING_EXPENSE">مصاريف تشغيلية (OpEx)</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTbName}
                    onChange={(e) => setNewTbName(e.target.value)}
                    placeholder="اسم الحساب"
                    className="w-full bg-slate-950 border border-slate-700 px-2 py-1 text-xs text-white"
                  />
                  <input
                    type="number"
                    min="1"
                    value={newTbBalance}
                    onChange={(e) => setNewTbBalance(e.target.value)}
                    placeholder="الرصيد د.أ"
                    className="w-28 bg-slate-950 border border-slate-700 px-2 py-1 text-xs font-mono text-white"
                  />
                  <button
                    type="submit"
                    className="bg-amber-500 text-slate-950 font-bold text-xs px-3 py-1 cursor-pointer"
                  >
                    إضافة
                  </button>
                </div>
              </form>

              <div className="max-h-48 overflow-y-auto divide-y divide-slate-800 border border-slate-800 bg-slate-950 text-xs">
                {trialBalance.map((acc) => (
                  <div key={acc.accountCode} className="p-2 flex items-center justify-between">
                    <div>
                      <span className="font-mono text-amber-400">{acc.accountCode}</span> —{' '}
                      <span className="text-white">{acc.accountNameAr}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-300" dir="ltr">
                        {acc.balanceJod.toLocaleString()} JOD
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteTbAccount(acc.accountCode)}
                        className="text-slate-500 hover:text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-6 space-y-4">
              <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
                قيود اليومية الآلية لإقفال السنة المالية (31 كانون الأول)
              </h3>

              <div className="space-y-4">
                {yearEndClosingPlan.closingEntries.map((voucher) => (
                  <div key={voucher.voucherNumber} className="bg-slate-950 border border-slate-800 p-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                      <span className="font-bold text-amber-400 text-xs">
                        {voucher.voucherNumber}: {voucher.descriptionAr}
                      </span>
                      <span className="text-xs font-mono text-slate-400">{voucher.dateIso}</span>
                    </div>
                    <table className="w-full text-right text-xs">
                      <thead className="text-slate-400 border-b border-slate-900">
                        <tr>
                          <th className="py-1.5">رمز الحساب</th>
                          <th className="py-1.5">اسم الحساب</th>
                          <th className="py-1.5 text-left">مدين (Debit JOD)</th>
                          <th className="py-1.5 text-left">دائن (Credit JOD)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900 font-mono">
                        {voucher.lines.map((line, i) => (
                          <tr key={i}>
                            <td className="py-1.5 text-amber-400">{line.accountCode}</td>
                            <td className="py-1.5 font-sans text-white">{line.accountNameAr}</td>
                            <td className="py-1.5 text-left text-emerald-400" dir="ltr">
                              {line.debitJod > 0 ? line.debitJod.toFixed(3) : '-'}
                            </td>
                            <td className="py-1.5 text-left text-blue-400" dir="ltr">
                              {line.creditJod > 0 ? line.creditJod.toFixed(3) : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountingLedgersView;

