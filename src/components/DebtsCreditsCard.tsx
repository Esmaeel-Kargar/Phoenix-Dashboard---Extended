import React, { useState } from 'react';
import {
  Scale,
  Plus,
  Star,
  ArrowUpDown,
  Trash2,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { DebtCreditItem, Language } from '../types';
import { formatCurrency, toPersianDigits } from '../utils/jalali';
import { useWidgetTheme } from '../context/WidgetThemeContext';

interface DebtsCreditsCardProps {
  items: DebtCreditItem[];
  onUpdateItems: (items: DebtCreditItem[]) => void;
  language: Language;
}

type TabType = 'all' | 'debt' | 'credit';
type SortType = 'deadline' | 'stars-desc' | 'amount-desc';

export const DebtsCreditsCard: React.FC<DebtsCreditsCardProps> = ({
  items,
  onUpdateItems,
  language,
}) => {
  const theme = useWidgetTheme();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [sortBy, setSortBy] = useState<SortType>('deadline');
  const [isAdding, setIsAdding] = useState<boolean>(false);

  // Form inputs
  const [type, setType] = useState<'debt' | 'credit'>('credit');
  const [personOrEntity, setPersonOrEntity] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [currency, setCurrency] = useState<'TMN' | 'USD'>('TMN');
  const [deadline, setDeadline] = useState<string>('');
  const [priority, setPriority] = useState<number>(3);
  const [description, setDescription] = useState<string>('');

  const isFa = language === 'fa';

  const totalDebt = items
    .filter((i) => i.type === 'debt' && i.status !== 'settled')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalCredit = items
    .filter((i) => i.type === 'credit' && i.status !== 'settled')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personOrEntity.trim() || !amount.trim()) return;

    const parsedAmount = parseFloat(amount.replace(/,/g, '')) || 0;
    const newItem: DebtCreditItem = {
      id: `dc-${Date.now()}`,
      type,
      personOrEntity: personOrEntity.trim(),
      amount: parsedAmount,
      currency,
      deadline: deadline.trim() || '۱۴۰۵/۰۶/۰۱',
      priority,
      status: 'pending',
      description: description.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    onUpdateItems([newItem, ...items]);
    setPersonOrEntity('');
    setAmount('');
    setDeadline('');
    setDescription('');
    setIsAdding(false);
  };

  const handleToggleSettle = (id: string) => {
    onUpdateItems(
      items.map((i) =>
        i.id === id
          ? { ...i, status: i.status === 'settled' ? 'pending' : 'settled' }
          : i
      )
    );
  };

  const handleSetPriority = (id: string, priority: number) => {
    onUpdateItems(
      items.map((i) => (i.id === id ? { ...i, priority } : i))
    );
  };

  const handleDelete = (id: string) => {
    onUpdateItems(items.filter((i) => i.id !== id));
  };

  // Filter & Sort
  const filtered = items.filter((i) => {
    if (activeTab === 'debt') return i.type === 'debt';
    if (activeTab === 'credit') return i.type === 'credit';
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'stars-desc') return b.priority - a.priority;
    if (sortBy === 'amount-desc') return b.amount - a.amount;
    if (sortBy === 'deadline') return a.deadline.localeCompare(b.deadline);
    return 0;
  });

  return (
    <div
      id="debts-credits-card"
      className="h-full flex flex-col justify-between relative overflow-hidden transition-all select-text"
    >
      {/* Background Accent */}
      <div className="absolute -top-10 -right-10 w-36 h-36 bg-current/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className={`flex items-center justify-between border-b ${theme.borderClass} pb-2 mb-2 shrink-0`}>
          <div className="flex items-center gap-1.5 min-w-0">
            <Scale className={`w-4 h-4 ${theme.isDark ? 'text-blue-300' : 'text-blue-600'} shrink-0`} />
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-bold tracking-tight truncate">
                {isFa ? 'لیست بدهی‌ها و بستانکاری‌ها' : 'Debts & Receivables'}
              </h2>
              <span className={`text-[9px] sm:text-[10px] ${theme.subtleTextClass} block truncate`}>
                {isFa
                  ? '<ویرایش / مرتب‌سازی / اولویت‌دهی ۰-۵ ستاره / ددلاین>'
                  : '<Edit / Sort / 0-5 Stars / Deadlines>'}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className={`p-1.5 ${theme.buttonBgClass} rounded-lg transition cursor-pointer text-xs flex items-center gap-1 font-medium shrink-0`}
            title={isFa ? 'ثبت بدهی یا بستانکاری' : 'Add Item'}
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">{isFa ? 'افزودن' : 'Add'}</span>
          </button>
        </div>

        {/* Quick Summary Numbers */}
        <div className="grid grid-cols-2 gap-1.5 mb-2 text-xs shrink-0">
          <div className={`p-1.5 rounded-lg border text-center ${
            theme.isDark
              ? 'bg-emerald-950/40 border-emerald-500/30'
              : 'bg-emerald-50 border-emerald-200'
          }`}>
            <div className={`text-[10px] ${theme.isDark ? 'text-emerald-300' : 'text-emerald-800'}`}>
              {isFa ? 'مجموع طلب (بستانکاری):' : 'Total Receivables:'}
            </div>
            <div className="font-mono font-bold text-xs sm:text-sm text-emerald-600 dark:text-emerald-300">
              {formatCurrency(totalCredit, 'TMN', isFa)} تومان
            </div>
          </div>
          <div className={`p-1.5 rounded-lg border text-center ${
            theme.isDark
              ? 'bg-rose-950/40 border-rose-500/30'
              : 'bg-rose-50 border-rose-200'
          }`}>
            <div className={`text-[10px] ${theme.isDark ? 'text-rose-300' : 'text-rose-800'}`}>
              {isFa ? 'مجموع بدهی‌های جاری:' : 'Total Payables:'}
            </div>
            <div className="font-mono font-bold text-xs sm:text-sm text-rose-600 dark:text-rose-300">
              {formatCurrency(totalDebt, 'TMN', isFa)} تومان
            </div>
          </div>
        </div>

        {/* Tabs & Sort Controls */}
        <div className="flex items-center justify-between gap-1 mb-2 text-xs shrink-0">
          {/* Tabs */}
          <div className={`flex items-center ${theme.isDark ? 'bg-black/25' : 'bg-slate-200/60'} p-0.5 rounded-lg border ${theme.borderClass}`}>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-1.5 py-0.5 rounded transition cursor-pointer text-[10px] ${
                activeTab === 'all'
                  ? theme.isDark ? 'bg-white/30 text-white font-bold shadow-xs' : 'bg-white text-slate-900 font-bold shadow-xs'
                  : theme.subtleTextClass
              }`}
            >
              {isFa ? 'همه' : 'All'}
            </button>
            <button
              onClick={() => setActiveTab('credit')}
              className={`px-1.5 py-0.5 rounded transition cursor-pointer text-[10px] ${
                activeTab === 'credit' ? 'bg-emerald-600 text-white font-bold shadow-xs' : theme.subtleTextClass
              }`}
            >
              {isFa ? 'طلب‌ها' : 'Receivables'}
            </button>
            <button
              onClick={() => setActiveTab('debt')}
              className={`px-1.5 py-0.5 rounded transition cursor-pointer text-[10px] ${
                activeTab === 'debt' ? 'bg-rose-600 text-white font-bold shadow-xs' : theme.subtleTextClass
              }`}
            >
              {isFa ? 'بدهی‌ها' : 'Payables'}
            </button>
          </div>

          {/* Sort Selector */}
          <div className={`flex items-center gap-1 ${theme.isDark ? 'bg-black/20' : 'bg-slate-100'} px-1.5 py-0.5 rounded border ${theme.borderClass}`}>
            <ArrowUpDown className={`w-2.5 h-2.5 ${theme.subtleTextClass}`} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortType)}
              className={`bg-transparent ${theme.textColor} text-[10px] focus:outline-none cursor-pointer`}
            >
              <option value="deadline" className="bg-slate-900 text-white">
                {isFa ? 'سررسید (ددلاین)' : 'Deadline'}
              </option>
              <option value="stars-desc" className="bg-slate-900 text-white">
                {isFa ? 'اولویت ستاره' : 'Priority'}
              </option>
              <option value="amount-desc" className="bg-slate-900 text-white">
                {isFa ? 'مبلغ' : 'Amount'}
              </option>
            </select>
          </div>
        </div>

        {/* Add Form */}
        {isAdding && (
          <form
            onSubmit={handleAddItem}
            className={`p-2.5 rounded-lg border ${theme.cardBgClass} mb-2 space-y-1.5 text-xs shrink-0 animate-in fade-in`}
          >
            <div className="flex gap-1.5">
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className={`p-1.5 rounded focus:outline-none text-[11px] font-semibold ${theme.inputClass}`}
              >
                <option value="credit">{isFa ? 'طلب (بستانکاری)' : 'Receivable (Credit)'}</option>
                <option value="debt">{isFa ? 'بدهی من (پرداختنی)' : 'Payable (Debt)'}</option>
              </select>
              <input
                type="text"
                value={personOrEntity}
                onChange={(e) => setPersonOrEntity(e.target.value)}
                placeholder={isFa ? 'نام شخص / شرکت / موضوع' : 'Counterparty / Purpose'}
                className={`flex-1 p-1.5 rounded focus:outline-none text-[11px] ${theme.inputClass}`}
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={isFa ? 'مبلغ (تومان)' : 'Amount'}
                className={`p-1.5 rounded focus:outline-none text-[11px] ${theme.inputClass}`}
              />
              <input
                type="text"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                placeholder={isFa ? 'ددلاین (مثال: ۱۴۰۵/۰۶/۰۱)' : 'Deadline (e.g. 2026-08-22)'}
                className={`p-1.5 rounded focus:outline-none text-[11px] ${theme.inputClass}`}
              />
            </div>

            <div className="flex items-center justify-between pt-0.5">
              <div className="flex items-center gap-1">
                <span className={`text-[10px] ${theme.subtleTextClass}`}>{isFa ? 'اولویت:' : 'Priority:'}</span>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setPriority(star)}
                      className="text-amber-400 hover:scale-110 transition cursor-pointer p-0.5"
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          star <= priority ? 'fill-amber-400' : 'opacity-30'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className={`px-2.5 py-0.5 ${theme.buttonBgClass} rounded cursor-pointer text-[11px]`}
                >
                  {isFa ? 'انصراف' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-2.5 py-0.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-semibold cursor-pointer text-[11px]"
                >
                  {isFa ? 'ثبت' : 'Add'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* List of Debts and Credits */}
        <div className="space-y-1.5 flex-1 overflow-y-auto pe-1 custom-scrollbar min-h-0">
          {sorted.length === 0 ? (
            <div className={`text-center py-4 ${theme.subtleTextClass} text-xs italic rounded-lg border ${theme.borderClass} ${theme.cardBgClass}`}>
              {isFa ? 'موردی در این دسته‌بندی یافت نشد.' : 'No debt/credit records found.'}
            </div>
          ) : (
            sorted.map((item) => {
              const isSettled = item.status === 'settled';
              const isCredit = item.type === 'credit';

              return (
                <div
                  key={item.id}
                  className={`border rounded-lg p-2 transition-all ${theme.borderClass} ${theme.cardBgClass} ${theme.cardHoverClass} ${
                    isSettled ? 'opacity-65' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <div className="flex items-start gap-1.5 flex-1 min-w-0">
                      <button
                        onClick={() => handleToggleSettle(item.id)}
                        className={`mt-0.5 p-0.5 rounded cursor-pointer transition shrink-0 ${
                          isSettled ? 'text-emerald-400' : theme.subtleTextClass
                        }`}
                        title={isSettled ? (isFa ? 'تسویه شده' : 'Settled') : (isFa ? 'علامت به عنوان تسویه' : 'Mark settled')}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                              isCredit
                                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-400/40'
                                : 'bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-400/40'
                            }`}
                          >
                            {isCredit ? (isFa ? 'طلب' : 'Receivable') : (isFa ? 'بدهی' : 'Payable')}
                          </span>
                          <span
                            className={`text-[11px] sm:text-xs font-semibold truncate ${
                              isSettled ? 'line-through opacity-70' : ''
                            }`}
                          >
                            {item.personOrEntity}
                          </span>
                        </div>

                        {/* Deadline badge */}
                        <div className={`flex items-center gap-1.5 mt-0.5 text-[10px] ${theme.subtleTextClass}`}>
                          <span className="flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 text-amber-400" />
                            {isFa ? 'ددلاین:' : 'Due:'}{' '}
                            <span className="font-mono">{isFa ? toPersianDigits(item.deadline) : item.deadline}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-end shrink-0">
                      <div
                        className={`font-mono font-bold text-[11px] sm:text-xs ${
                          isCredit ? 'text-emerald-500 dark:text-emerald-300' : 'text-rose-500 dark:text-rose-300'
                        }`}
                      >
                        {formatCurrency(item.amount, item.currency, isFa)}
                      </div>

                      {/* Stars & Delete */}
                      <div className="flex items-center justify-end gap-1 mt-0.5">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => handleSetPriority(item.id, star === item.priority ? 0 : star)}
                              className="cursor-pointer p-0.5"
                            >
                              <Star
                                className={`w-2.5 h-2.5 ${
                                  star <= item.priority ? 'fill-amber-400 text-amber-400' : 'opacity-25'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className={`p-0.5 ${theme.buttonBgClass} hover:text-red-400 rounded cursor-pointer transition ms-0.5`}
                          title={isFa ? 'حذف' : 'Delete'}
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className={`mt-2 pt-1.5 border-t ${theme.borderClass} flex items-center justify-between text-[10px] ${theme.subtleTextClass} shrink-0`}>
        <span>
          {isFa
            ? `${toPersianDigits(items.filter((i) => i.status !== 'settled').length)} تعهد در انتظار تسویه`
            : `${items.filter((i) => i.status !== 'settled').length} active pending items`}
        </span>
        <span className="opacity-80">
          {isFa ? 'مدیریت سررسید و اولویت' : 'Deadline Prioritization'}
        </span>
      </div>
    </div>
  );
};
