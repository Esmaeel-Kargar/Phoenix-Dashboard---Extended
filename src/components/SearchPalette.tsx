import React, { useState, useEffect } from 'react';
import { Search, X, Target, StickyNote, Wallet, Scale, CalendarDays, ArrowRight, CheckCircle2, FolderOpen, FileText } from 'lucide-react';
import { AppState, Language } from '../types';
import { formatCurrency, toPersianDigits } from '../utils/jalali';

interface SearchPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
  language: Language;
}

export const SearchPalette: React.FC<SearchPaletteProps> = ({
  isOpen,
  onClose,
  state,
  language,
}) => {
  const [query, setQuery] = useState<string>('');
  const isFa = language === 'fa';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const matchingGoals = state.seasonGoals.filter((g) =>
    g.title.toLowerCase().includes(q) || (g.category && g.category.toLowerCase().includes(q))
  );

  const matchingNotes = state.reminderNotes.filter((n) =>
    n.content.toLowerCase().includes(q) || (n.category && n.category.toLowerCase().includes(q))
  );

  const matchingAccounts = state.bankAccounts.filter((a) =>
    a.name.toLowerCase().includes(q) || (a.bankName && a.bankName.toLowerCase().includes(q))
  );

  const matchingDebtsCredits = state.debtsCredits.filter((d) =>
    d.personOrEntity.toLowerCase().includes(q) ||
    (d.description && d.description.toLowerCase().includes(q))
  );

  const matchingTasks = state.tasks.filter((t) =>
    t.title.toLowerCase().includes(q) || t.dateKey.includes(q)
  );

  const matchingFiles = (state.files || []).filter((f) =>
    f.name.toLowerCase().includes(q) ||
    f.description?.toLowerCase().includes(q) ||
    f.tags?.some((t) => t.toLowerCase().includes(q))
  );

  const totalResults =
    matchingGoals.length +
    matchingNotes.length +
    matchingAccounts.length +
    matchingDebtsCredits.length +
    matchingTasks.length +
    matchingFiles.length;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-20 z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isFa ? 'جستجو در تمام اهداف، نوت‌ها، حساب‌ها، بدهی‌ها و تسک‌ها...' : 'Search goals, notes, accounts, debts, and tasks...'}
            className="w-full bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-sm focus:outline-none"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Body */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs">
          {q && totalResults === 0 ? (
            <div className="text-center py-10 text-slate-400 italic">
              {isFa ? 'هیچ موردی مطابق با جستجوی شما یافت نشد.' : 'No matching results found.'}
            </div>
          ) : null}

          {/* Season Goals */}
          {matchingGoals.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider text-[11px] mb-2">
                <Target className="w-3.5 h-3.5" />
                <span>{isFa ? 'اهداف فصل کاری' : 'Season Goals'} ({matchingGoals.length})</span>
              </div>
              <div className="space-y-1.5">
                {matchingGoals.map((g) => (
                  <div
                    key={g.id}
                    className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 flex items-center justify-between"
                  >
                    <span className="font-semibold text-slate-800 dark:text-slate-100">{g.title}</span>
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">
                      {isFa ? toPersianDigits(g.progress) : g.progress}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7-Day Tasks */}
          {matchingTasks.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider text-[11px] mb-2">
                <CalendarDays className="w-3.5 h-3.5" />
                <span>{isFa ? 'تسک‌ها' : 'Tasks'} ({matchingTasks.length})</span>
              </div>
              <div className="space-y-1.5">
                {matchingTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 flex items-center justify-between"
                  >
                    <span className={`font-semibold text-slate-800 dark:text-slate-100 ${t.completed ? 'line-through opacity-70' : ''}`}>
                      {t.title}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">{t.dateKey}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reminder Notes */}
          {matchingNotes.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider text-[11px] mb-2">
                <StickyNote className="w-3.5 h-3.5" />
                <span>{isFa ? 'نوت‌های یادآوری' : 'Reminder Notes'} ({matchingNotes.length})</span>
              </div>
              <div className="space-y-1.5">
                {matchingNotes.map((n) => (
                  <div
                    key={n.id}
                    className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/40 flex items-center justify-between"
                  >
                    <span className="text-slate-800 dark:text-slate-100">{n.content}</span>
                    <span className="text-amber-500 font-bold">★ {n.priority}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bank Accounts */}
          {matchingAccounts.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider text-[11px] mb-2">
                <Wallet className="w-3.5 h-3.5" />
                <span>{isFa ? 'حساب‌های بانکی' : 'Bank Accounts'} ({matchingAccounts.length})</span>
              </div>
              <div className="space-y-1.5">
                {matchingAccounts.map((a) => (
                  <div
                    key={a.id}
                    className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 flex items-center justify-between"
                  >
                    <span className="font-semibold text-slate-800 dark:text-slate-100">{a.name} ({a.bankName})</span>
                    <span className="font-mono font-bold text-rose-700 dark:text-rose-300">
                      {formatCurrency(a.balance, a.currency, isFa)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Debts & Credits */}
          {matchingDebtsCredits.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider text-[11px] mb-2">
                <Scale className="w-3.5 h-3.5" />
                <span>{isFa ? 'بدهی‌ها و طلب‌ها' : 'Debts & Credits'} ({matchingDebtsCredits.length})</span>
              </div>
              <div className="space-y-1.5">
                {matchingDebtsCredits.map((d) => (
                  <div
                    key={d.id}
                    className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/40 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-100">{d.personOrEntity}</span>
                      <span className="text-[11px] text-slate-500 ms-2">({d.type === 'credit' ? 'طلب' : 'بدهی'})</span>
                    </div>
                    <span className="font-mono font-bold text-indigo-700 dark:text-indigo-300">
                      {formatCurrency(d.amount, d.currency, isFa)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Files & Documents */}
          {matchingFiles.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider text-[11px] mb-2">
                <FolderOpen className="w-3.5 h-3.5" />
                <span>{isFa ? 'اسناد و فایل‌های فضا' : 'Workspace Files'} ({matchingFiles.length})</span>
              </div>
              <div className="space-y-1.5">
                {matchingFiles.map((f) => (
                  <div
                    key={f.id}
                    className="p-2.5 rounded-lg bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/40 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-teal-500 shrink-0" />
                      <span className="font-semibold text-slate-800 dark:text-slate-100 truncate">{f.name}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 shrink-0">{f.uploadedBy}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
