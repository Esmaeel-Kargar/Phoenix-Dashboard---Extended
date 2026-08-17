import React, { useState, useEffect } from 'react';
import {
  Activity,
  Target,
  CheckCircle2,
  Clock,
  Wallet,
  Flame,
  Zap,
  TrendingUp,
  Search,
  MessageSquare,
  Plus,
  StickyNote,
  Timer,
  FileDown,
  Sparkles,
  Shield,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  ArrowUpRight,
  Maximize2,
} from 'lucide-react';
import {
  Language,
  SeasonGoal,
  DayTask,
  BankAccount,
  DebtCreditItem,
  HabitItem,
} from '../types';
import { toPersianDigits, getFormattedDateInfo } from '../utils/jalali';
import { useWidgetTheme } from '../context/WidgetThemeContext';

interface ExecutiveHUDWidgetProps {
  language: Language;
  seasonGoals?: SeasonGoal[];
  tasks?: DayTask[];
  bankAccounts?: BankAccount[];
  debtsCredits?: DebtCreditItem[];
  habits?: HabitItem[];
  isPrivacyMode?: boolean;
  onTogglePrivacy?: () => void;
  onQuickAction?: (action: 'new_task' | 'new_note' | 'ai_chat' | 'search' | 'export' | 'pomodoro') => void;
}

export const ExecutiveHUDWidget: React.FC<ExecutiveHUDWidgetProps> = ({
  language,
  seasonGoals = [],
  tasks = [],
  bankAccounts = [],
  debtsCredits = [],
  habits = [],
  isPrivacyMode = false,
  onTogglePrivacy,
  onQuickAction,
}) => {
  const theme = useWidgetTheme();
  const isFa = language === 'fa';
  const [liveTime, setLiveTime] = useState<string>('');
  const [liveDateInfo, setLiveDateInfo] = useState<any>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const info = getFormattedDateInfo(now);
      setLiveDateInfo(info);
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setLiveTime(`${hours}:${minutes}:${seconds}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // 1. Season Goals Progress
  const totalGoals = seasonGoals.length;
  const completedGoals = seasonGoals.filter((g) => g.progress >= 100).length;
  const avgGoalProgress =
    totalGoals > 0
      ? Math.round(seasonGoals.reduce((acc, g) => acc + (g.progress || 0), 0) / totalGoals)
      : 0;

  // 2. Tasks Pulse
  const todayKey = liveDateInfo?.dateKey || '';
  const todayTasks = tasks.filter((t) => t.dateKey === todayKey);
  const todayCompleted = todayTasks.filter((t) => t.completed).length;
  const todayPending = todayTasks.length - todayCompleted;
  const totalAllTasks = tasks.length;
  const completedAllTasks = tasks.filter((t) => t.completed).length;
  const overallTaskRate =
    totalAllTasks > 0 ? Math.round((completedAllTasks / totalAllTasks) * 100) : 0;

  // 3. Financial Net Worth
  const totalBankBalance = bankAccounts.reduce((acc, b) => acc + (Number(b.balance) || 0), 0);
  const totalReceivables = debtsCredits
    .filter((d) => d.type === 'credit' && !d.settled)
    .reduce((acc, d) => acc + (Number(d.amount) || 0), 0);
  const totalPayables = debtsCredits
    .filter((d) => d.type === 'debt' && !d.settled)
    .reduce((acc, d) => acc + (Number(d.amount) || 0), 0);
  const netLiquidWorth = totalBankBalance + totalReceivables - totalPayables;

  // 4. Habit Streak
  const maxStreak = habits.length > 0 ? Math.max(...habits.map((h) => h.streak || 0)) : 0;
  const completedHabitsToday = habits.filter((h) => h.history?.[todayKey]).length;

  const formatNumber = (num: number) => {
    const formatted = new Intl.NumberFormat('en-US').format(Math.round(num));
    return isFa ? toPersianDigits(formatted) : formatted;
  };

  return (
    <div className="w-full h-full flex flex-col justify-between space-y-3 p-1">
      {/* Top HUD Banner: Live Status + System Pulse */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        {/* 1. Live Time & Jalali/Gregorian Clock */}
        <div className="bg-black/10 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-2.5 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between text-xs opacity-70">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {isFa ? 'زمان زنده اتاق فرمان' : 'Live HUD Clock'}
            </span>
            <Clock className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          </div>
          <div className="my-1">
            <div className="text-base sm:text-lg font-black font-mono tracking-wider">
              {isFa ? toPersianDigits(liveTime || '00:00:00') : liveTime || '00:00:00'}
            </div>
            <div className="text-[10px] opacity-75 truncate">
              {liveDateInfo ? (isFa ? liveDateInfo.jalaliFull : liveDateInfo.gregorianFull) : '...'}
            </div>
          </div>
          <div className="w-full bg-blue-500/20 h-1 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full w-full animate-pulse" />
          </div>
        </div>

        {/* 2. Season Goals Progress */}
        <div className="bg-black/10 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-2.5 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between text-xs opacity-70">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {isFa ? 'اهداف فصلی' : 'Season Goals'}
            </span>
            <Target className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="my-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-black text-emerald-400 font-mono">
                {isFa ? toPersianDigits(avgGoalProgress) : avgGoalProgress}%
              </span>
              <span className="text-[10px] opacity-60">
                ({isFa ? `${toPersianDigits(completedGoals)}/${toPersianDigits(totalGoals)}` : `${completedGoals}/${totalGoals}`})
              </span>
            </div>
            <div className="text-[10px] opacity-75 truncate">
              {isFa ? 'میانگین پیشرفت کل اهداف' : 'Average Goal Progress'}
            </div>
          </div>
          <div className="w-full bg-black/20 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, avgGoalProgress))}%` }}
            />
          </div>
        </div>

        {/* 3. Task Pulse */}
        <div className="bg-black/10 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-2.5 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between text-xs opacity-70">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {isFa ? 'تسک‌های امروز' : "Today's Tasks"}
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="my-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-black text-indigo-400 font-mono">
                {isFa ? toPersianDigits(todayPending) : todayPending}
              </span>
              <span className="text-[10px] opacity-60">
                {isFa ? 'تسک مانده' : 'Pending'}
              </span>
            </div>
            <div className="text-[10px] opacity-75 truncate">
              {isFa
                ? `${toPersianDigits(todayCompleted)} از ${toPersianDigits(todayTasks.length)} تسک کامل شد`
                : `${todayCompleted} of ${todayTasks.length} done`}
            </div>
          </div>
          <div className="w-full bg-black/20 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-500"
              style={{
                width: `${todayTasks.length > 0 ? (todayCompleted / todayTasks.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        {/* 4. Financial Net Worth */}
        <div className="bg-black/10 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-2.5 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between text-xs opacity-70">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {isFa ? 'نقدینگی و تراز کل' : 'Net Liquidity'}
            </span>
            {onTogglePrivacy ? (
              <button
                onClick={onTogglePrivacy}
                className="opacity-70 hover:opacity-100 cursor-pointer"
                title={isFa ? 'حالت محرمانگی اعداد' : 'Toggle Privacy Mode'}
              >
                {isPrivacyMode ? <EyeOff className="w-3 h-3 text-amber-400" /> : <Eye className="w-3 h-3" />}
              </button>
            ) : (
              <Wallet className="w-3.5 h-3.5 text-rose-400" />
            )}
          </div>
          <div className="my-1">
            <div className="text-sm sm:text-base font-black text-rose-400 font-mono truncate">
              {isPrivacyMode ? '••••••••' : formatNumber(netLiquidWorth)}
            </div>
            <div className="text-[10px] opacity-75 truncate">
              {isFa ? 'تومان (بانک + مطالبات - بدهی)' : 'Total Liquid Balances'}
            </div>
          </div>
          <div className="w-full bg-black/20 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div className="bg-rose-500 h-full w-4/5 rounded-full" />
          </div>
        </div>

        {/* 5. Habit Streak */}
        <div className="bg-black/10 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-2.5 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between text-xs opacity-70">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {isFa ? 'زنجیره عادات' : 'Habit Streak'}
            </span>
            <Flame className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="my-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-black text-amber-500 font-mono">
                {isFa ? toPersianDigits(maxStreak) : maxStreak}
              </span>
              <span className="text-[10px] opacity-60">
                {isFa ? 'روز پیاپی' : 'Days'}
              </span>
            </div>
            <div className="text-[10px] opacity-75 truncate">
              {isFa
                ? `${toPersianDigits(completedHabitsToday)} از ${toPersianDigits(habits.length)} روتین امروز`
                : `${completedHabitsToday}/${habits.length} habits today`}
            </div>
          </div>
          <div className="w-full bg-black/20 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{
                width: `${habits.length > 0 ? (completedHabitsToday / habits.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        {/* 6. Overall Performance Pulse */}
        <div className="bg-black/10 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-2.5 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between text-xs opacity-70">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {isFa ? 'راندمان کل بوم' : 'Overall Velocity'}
            </span>
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="my-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-black text-cyan-400 font-mono">
                {isFa ? toPersianDigits(overallTaskRate) : overallTaskRate}%
              </span>
              <span className="text-[10px] opacity-60">
                {isFa ? 'موفقیت' : 'Rate'}
              </span>
            </div>
            <div className="text-[10px] opacity-75 truncate">
              {isFa ? 'نرخ تسویه‌حساب و وظایف' : 'Overall Matrix Completion'}
            </div>
          </div>
          <div className="w-full bg-black/20 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-cyan-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${overallTaskRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Action Commands Toolbar */}
      {onQuickAction && (
        <div className="pt-2 border-t border-black/10 dark:border-white/10 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-bold opacity-80">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>{isFa ? 'فرمان‌های فوری اتاق فرمان (Quick HUD Actions):' : 'HUD Instant Commands:'}</span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
            <button
              onClick={() => onQuickAction('new_task')}
              className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>{isFa ? 'تسک جدید' : 'Add Task'}</span>
            </button>

            <button
              onClick={() => onQuickAction('new_note')}
              className="flex items-center gap-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <StickyNote className="w-3 h-3" />
              <span>{isFa ? 'نوت / ویس' : 'Memo/Voice'}</span>
            </button>

            <button
              onClick={() => onQuickAction('pomodoro')}
              className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Timer className="w-3 h-3" />
              <span>{isFa ? 'تایمر تمرکز' : 'Pomodoro'}</span>
            </button>

            <button
              onClick={() => onQuickAction('ai_chat')}
              className="flex items-center gap-1 px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              <span>{isFa ? 'ایجنت هوش مصنوعی' : 'AI Agent'}</span>
            </button>

            <button
              onClick={() => onQuickAction('search')}
              className="flex items-center gap-1 px-2.5 py-1 bg-black/20 hover:bg-black/30 dark:bg-white/10 dark:hover:bg-white/20 text-current rounded-lg text-xs font-medium transition cursor-pointer border border-black/10 dark:border-white/10"
            >
              <Search className="w-3 h-3" />
              <span>{isFa ? 'جستجو (Ctrl+K)' : 'Search'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
