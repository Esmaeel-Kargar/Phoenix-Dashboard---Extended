import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
  Trash2,
  PieChart,
  ArrowUpRight,
  ArrowDownLeft,
  AlertTriangle,
  CheckCircle2,
  Layers,
  Wallet,
  ShieldCheck,
} from 'lucide-react';
import {
  BudgetCategory,
  CashflowTransaction,
  BankAccount,
  DebtCreditItem,
  Language,
} from '../types';
import { toPersianDigits } from '../utils/jalali';
import { useWidgetTheme } from '../context/WidgetThemeContext';

interface CashflowBudgetWidgetProps {
  budgetCategories: BudgetCategory[];
  transactions: CashflowTransaction[];
  bankAccounts: BankAccount[];
  debtsCredits: DebtCreditItem[];
  onUpdateBudgets: (categories: BudgetCategory[]) => void;
  onUpdateTransactions: (transactions: CashflowTransaction[]) => void;
  language: Language;
  onAddLog?: (log: any) => void;
}

export const CashflowBudgetWidget: React.FC<CashflowBudgetWidgetProps> = ({
  budgetCategories = [],
  transactions = [],
  bankAccounts = [],
  debtsCredits = [],
  onUpdateBudgets,
  onUpdateTransactions,
  language,
  onAddLog,
}) => {
  const theme = useWidgetTheme();
  const isFa = language === 'fa';

  const [isAddingTx, setIsAddingTx] = useState(false);
  const [txTitle, setTxTitle] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txType, setTxType] = useState<'income' | 'expense'>('expense');
  const [txCategory, setTxCategory] = useState(budgetCategories[0]?.name || 'هزینه‌های جاری');
  const [txBankId, setTxBankId] = useState(bankAccounts[0]?.id || '');

  // Calculate Totals
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  // Total Liquid Cash from accounts (in TMN)
  const totalLiquidTMN = bankAccounts.reduce((acc, a) => {
    if (a.currency === 'TMN') return acc + a.balance;
    if (a.currency === 'IRR') return acc + Math.round(a.balance / 10);
    if (a.currency === 'USDT' || a.currency === 'USD') return acc + a.balance * 95000;
    return acc;
  }, 0);

  // Projected Receivable vs Payable
  const totalReceivables = debtsCredits
    .filter((d) => d.type === 'credit' && d.status !== 'settled')
    .reduce((acc, d) => acc + (d.currency === 'TMN' ? d.amount : d.amount * 95000), 0);

  const totalPayables = debtsCredits
    .filter((d) => d.type === 'debt' && d.status !== 'settled')
    .reduce((acc, d) => acc + (d.currency === 'TMN' ? d.amount : d.amount * 95000), 0);

  const projectedCashflow = totalLiquidTMN + totalReceivables - totalPayables;

  const handleAddTransaction = () => {
    const amountNum = parseFloat(txAmount.replace(/,/g, ''));
    if (!txTitle.trim() || isNaN(amountNum) || amountNum <= 0) return;

    const newTx: CashflowTransaction = {
      id: `tx-${Date.now()}`,
      title: txTitle.trim(),
      amount: amountNum,
      type: txType,
      category: txCategory,
      date: new Date().toISOString().split('T')[0],
      bankAccountId: txBankId || undefined,
    };

    onUpdateTransactions([newTx, ...transactions]);

    // Update budget category spent amount if it is an expense
    if (txType === 'expense') {
      const updatedCategories = budgetCategories.map((c) =>
        c.name === txCategory ? { ...c, spentAmount: c.spentAmount + amountNum } : c
      );
      onUpdateBudgets(updatedCategories);
    }

    if (onAddLog) {
      onAddLog({
        id: `log-tx-${Date.now()}`,
        actorType: 'user',
        actorId: 'user-default',
        actorName: 'کاربر سیستم',
        authorizerType: 'direct_user',
        authorizerId: 'user-default',
        authorizerName: 'مدیریت مالی',
        module: 'finances',
        action: 'create',
        descriptionFa: `ثبت ${txType === 'income' ? 'درآمد' : 'هزینه'} "${txTitle}" به مبلغ ${amountNum.toLocaleString('fa-IR')} تومان`,
        descriptionEn: `Created ${txType} "${txTitle}" of ${amountNum.toLocaleString()} TMN`,
        timestamp: new Date().toISOString(),
        shamsiDate: '',
        status: 'success',
      });
    }

    setTxTitle('');
    setTxAmount('');
    setIsAddingTx(false);
  };

  const formatMoney = (amount: number) => {
    return isFa ? toPersianDigits(amount.toLocaleString('fa-IR')) : amount.toLocaleString();
  };

  return (
    <div className="h-full flex flex-col justify-between select-text relative">
      {/* Header bar */}
      <div className={`flex items-center justify-between border-b ${theme.borderClass} pb-2.5 mb-2.5 shrink-0`}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold tracking-tight">
              {isFa ? 'بودجه‌بندی و جریان نقدینگی ماهانه' : 'Cashflow & Budget Analytics'}
            </h2>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span>{isFa ? 'پیش‌بینی نقدینگی نهایی:' : 'Projected Liquidity:'}</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {formatMoney(projectedCashflow)} {isFa ? 'تومان' : 'TMN'}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsAddingTx(!isAddingTx)}
          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 transition shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isFa ? 'تراکنش جدید' : 'New Tx'}</span>
        </button>
      </div>

      {/* Top 3 KPI Cards */}
      <div className="grid grid-cols-3 gap-2 mb-3 shrink-0">
        <div className="p-2 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-500/20">
          <div className="flex items-center justify-between text-[10px] text-emerald-700 dark:text-emerald-300 font-bold mb-1">
            <span>{isFa ? 'مجموع درآمد' : 'Total Income'}</span>
            <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
          </div>
          <div className="text-xs sm:text-sm font-black text-emerald-700 dark:text-emerald-200">
            {formatMoney(totalIncome)} <span className="text-[10px] font-normal">{isFa ? 'تومان' : 'TMN'}</span>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-500/20">
          <div className="flex items-center justify-between text-[10px] text-rose-700 dark:text-rose-300 font-bold mb-1">
            <span>{isFa ? 'مجموع هزینه‌ها' : 'Total Expenses'}</span>
            <ArrowUpRight className="w-3 h-3 text-rose-600" />
          </div>
          <div className="text-xs sm:text-sm font-black text-rose-700 dark:text-rose-200">
            {formatMoney(totalExpense)} <span className="text-[10px] font-normal">{isFa ? 'تومان' : 'TMN'}</span>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-500/20">
          <div className="flex items-center justify-between text-[10px] text-blue-700 dark:text-blue-300 font-bold mb-1">
            <span>{isFa ? 'تراز خالص' : 'Net Balance'}</span>
            <ShieldCheck className="w-3 h-3 text-blue-600" />
          </div>
          <div className={`text-xs sm:text-sm font-black ${netSavings >= 0 ? 'text-blue-700 dark:text-blue-200' : 'text-red-500'}`}>
            {formatMoney(netSavings)} <span className="text-[10px] font-normal">{isFa ? 'تومان' : 'TMN'}</span>
          </div>
        </div>
      </div>

      {/* Add Transaction Inline Form */}
      {isAddingTx && (
        <div className="mb-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-emerald-500/30 animate-in fade-in">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            {isFa ? 'ثبت تراکنش نقدینگی جدید' : 'Add Cashflow Entry'}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
            <input
              type="text"
              placeholder={isFa ? 'شرح تراکنش (مثلاً: تمدید سرور، دریافت مشاوره)' : 'Title'}
              value={txTitle}
              onChange={(e) => setTxTitle(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
            />
            <input
              type="text"
              placeholder={isFa ? 'مبلغ به تومان' : 'Amount (TMN)'}
              value={txAmount}
              onChange={(e) => setTxAmount(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
            />
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setTxType('expense')}
                className={`flex-1 py-1 text-xs font-bold rounded-lg cursor-pointer ${
                  txType === 'expense'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {isFa ? 'هزینه' : 'Expense'}
              </button>
              <button
                type="button"
                onClick={() => setTxType('income')}
                className={`flex-1 py-1 text-xs font-bold rounded-lg cursor-pointer ${
                  txType === 'income'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {isFa ? 'درآمد' : 'Income'}
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => setIsAddingTx(false)}
              className="px-2.5 py-1 text-xs text-slate-500 cursor-pointer"
            >
              {isFa ? 'انصراف' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={handleAddTransaction}
              className="px-3 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer"
            >
              {isFa ? 'ذخیره' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* Budget Categories Progress List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-0.5">
        <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 px-1 mb-1">
          {isFa ? 'سقف بودجه‌بندی دسته‌ها (ماه جاری)' : 'Budget Limits by Category'}
        </div>

        {budgetCategories.map((cat) => {
          const percent = Math.min(Math.round((cat.spentAmount / (cat.monthlyLimit || 1)) * 100), 100);
          const isOverBudget = cat.spentAmount > cat.monthlyLimit;

          return (
            <div
              key={cat.id}
              className="p-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 truncate">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color || '#3b82f6' }}
                  />
                  <span>{cat.name}</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="font-bold text-slate-700 dark:text-slate-200">{formatMoney(cat.spentAmount)}</span>
                  <span> / {formatMoney(cat.monthlyLimit)} {isFa ? 'تومان' : 'TMN'}</span>
                </div>
              </div>

              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    isOverBudget
                      ? 'bg-rose-500'
                      : percent > 80
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                <span>{isFa ? `${toPersianDigits(percent)}٪ مصرف شده` : `${percent}% used`}</span>
                <span>
                  {isFa
                    ? `باقی‌مانده: ${formatMoney(Math.max(cat.monthlyLimit - cat.spentAmount, 0))} تومان`
                    : `Remaining: ${formatMoney(Math.max(cat.monthlyLimit - cat.spentAmount, 0))} TMN`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer info */}
      <div className={`mt-2 pt-2 border-t ${theme.borderClass} flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 shrink-0`}>
        <div className="flex items-center gap-1">
          <Wallet className="w-3.5 h-3.5 text-indigo-500" />
          <span>{isFa ? `موجودی نقد فعلی: ${formatMoney(totalLiquidTMN)} تومان` : `Liquid: ${formatMoney(totalLiquidTMN)} TMN`}</span>
        </div>
        <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
          {isFa ? `نرخ پس‌انداز: ${toPersianDigits(savingsRate)}٪` : `Savings: ${savingsRate}%`}
        </div>
      </div>
    </div>
  );
};
