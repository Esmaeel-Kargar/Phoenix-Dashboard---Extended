import React, { useState } from 'react';
import {
  Flame,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Trophy,
  Target,
  Sparkles,
  TrendingUp,
  Calendar,
  Layers,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { HabitItem, Language, SeasonGoal } from '../types';
import { getFormattedDateInfo, toPersianDigits } from '../utils/jalali';
import { useWidgetTheme } from '../context/WidgetThemeContext';

interface HabitTrackerWidgetProps {
  habits: HabitItem[];
  onUpdateHabits: (habits: HabitItem[]) => void;
  language: Language;
  currentDate?: Date;
  seasonGoals?: SeasonGoal[];
  onAddLog?: (log: any) => void;
}

export const HabitTrackerWidget: React.FC<HabitTrackerWidgetProps> = ({
  habits = [],
  onUpdateHabits,
  language,
  currentDate = new Date(2026, 7, 14),
  seasonGoals = [],
  onAddLog,
}) => {
  const theme = useWidgetTheme();
  const isFa = language === 'fa';

  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('سلامت');
  const [newColor, setNewColor] = useState('#10b981');
  const [newTargetDays, setNewTargetDays] = useState(7);
  const [newSeasonGoalId, setNewSeasonGoalId] = useState<string>('');

  // Generate last 7 days window for tracking
  const daysWindow = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - (6 - i)); // 6 days ago up to today
    const info = getFormattedDateInfo(d);
    return {
      dateObj: d,
      key: info.dateKey,
      dayName: isFa ? info.persianWeekday.slice(0, 2) : info.englishWeekday.slice(0, 2),
      dayNum: isFa ? toPersianDigits(info.jd) : String(info.gd),
      isToday: i === 6,
    };
  });

  const todayKey = daysWindow[6].key;

  // Toggle habit for a given dateKey
  const handleToggleHabitDay = (habitId: string, dateKey: string) => {
    const targetHabit = habits.find((h) => h.id === habitId);
    if (!targetHabit) return;

    const isDone = targetHabit.completedDates.includes(dateKey);
    const updatedCompletedDates = isDone
      ? targetHabit.completedDates.filter((d) => d !== dateKey)
      : [...targetHabit.completedDates, dateKey];

    const updatedHabits = habits.map((h) =>
      h.id === habitId ? { ...h, completedDates: updatedCompletedDates } : h
    );

    onUpdateHabits(updatedHabits);

    if (!isDone && onAddLog) {
      onAddLog({
        id: `log-habit-${Date.now()}`,
        actorType: 'user',
        actorId: 'user-default',
        actorName: 'کاربر سیستم',
        authorizerType: 'direct_user',
        authorizerId: 'user-default',
        authorizerName: 'مدیر فضا',
        module: 'habits',
        action: 'update',
        descriptionFa: `تکمیل عادت "${targetHabit.title}" در تاریخ ${dateKey}`,
        descriptionEn: `Completed habit "${targetHabit.title}" on ${dateKey}`,
        timestamp: new Date().toISOString(),
        shamsiDate: todayKey,
        status: 'success',
      });
    }
  };

  const handleCreateHabit = () => {
    if (!newTitle.trim()) return;

    const newHabit: HabitItem = {
      id: `habit-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      targetDaysPerWeek: newTargetDays,
      color: newColor,
      completedDates: [],
      createdAt: todayKey,
      seasonGoalId: newSeasonGoalId || undefined,
    };

    onUpdateHabits([...habits, newHabit]);
    setNewTitle('');
    setIsAdding(false);
  };

  const handleDeleteHabit = (id: string) => {
    onUpdateHabits(habits.filter((h) => h.id !== id));
  };

  // Calculate current streak for a habit
  const calculateStreak = (completedDates: string[]): number => {
    let streak = 0;
    const checkDate = new Date(currentDate);

    // If today is completed or not checked yet, start counting from today or yesterday
    const todayStr = getFormattedDateInfo(checkDate).dateKey;
    if (completedDates.includes(todayStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      // Check if yesterday was completed
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const dateStr = getFormattedDateInfo(checkDate).dateKey;
      if (completedDates.includes(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  // Overall weekly score
  const totalSlots = (habits.length || 1) * 7;
  const completedSlots = habits.reduce((acc, h) => {
    const inWindow = h.completedDates.filter((d) =>
      daysWindow.some((dw) => dw.key === d)
    ).length;
    return acc + inWindow;
  }, 0);
  const overallRate = Math.round((completedSlots / (totalSlots || 1)) * 100);

  const CATEGORIES = [
    { label: 'سلامت و تندرستی', color: '#10b981' },
    { label: 'کار و توسعه', color: '#3b82f6' },
    { label: 'یادگیری و مطالعه', color: '#8b5cf6' },
    { label: 'مالی و سرمایه', color: '#f59e0b' },
    { label: 'تمرکز و ذهن‌آگاهی', color: '#ec4899' },
  ];

  return (
    <div className="h-full flex flex-col justify-between select-text relative">
      {/* Header bar */}
      <div className={`flex items-center justify-between border-b ${theme.borderClass} pb-2.5 mb-2.5 shrink-0`}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold tracking-tight">
              {isFa ? 'ردیاب عادات و زنجیره استمرار (Habits)' : 'Habits & Routine Streak Tracker'}
            </h2>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              <span>{isFa ? 'نرخ موفقیت ۷ روز گذشته:' : '7-Day Success Rate:'}</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {isFa ? toPersianDigits(overallRate) : overallRate}٪
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 transition shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isFa ? 'عادت جدید' : 'New Habit'}</span>
          </button>
        </div>
      </div>

      {/* Add Habit Form Modal/Drawer */}
      {isAdding && (
        <div className="mb-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-emerald-500/30 animate-in fade-in slide-in-from-top-2">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            {isFa ? 'تعریف عادت یا روتین جدید' : 'Define New Habit or Routine'}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
            <input
              type="text"
              placeholder={isFa ? 'عنوان عادت (مثلاً: ۳۰ دقیقه ورزش، خواندن کتاب)' : 'Habit title'}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            />
            <select
              value={newCategory}
              onChange={(e) => {
                setNewCategory(e.target.value);
                const cat = CATEGORIES.find((c) => c.label === e.target.value);
                if (cat) setNewColor(cat.color);
              }}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-hidden"
            >
              {CATEGORIES.map((c) => (
                <option key={c.label} value={c.label}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <span>{isFa ? 'تکرار هفتگی:' : 'Target frequency:'}</span>
              <div className="flex gap-1">
                {[
                  { days: 7, label: isFa ? 'هر روز' : 'Everyday' },
                  { days: 5, label: isFa ? 'روزهای کاری (۵ روز)' : '5 Days' },
                  { days: 3, label: isFa ? '۳ روز در هفته' : '3 Days' },
                ].map((item) => (
                  <button
                    key={item.days}
                    type="button"
                    onClick={() => setNewTargetDays(item.days)}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer ${
                      newTargetDays === item.days
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-2.5 py-1 rounded text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
              >
                {isFa ? 'انصراف' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleCreateHabit}
                className="px-3 py-1 rounded text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer"
              >
                {isFa ? 'ثبت عادت' : 'Save Habit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Habits Table & Grid */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-0.5">
        {/* Days Header */}
        <div className="grid grid-cols-12 gap-1 items-center px-2 py-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100/70 dark:bg-slate-800/40 rounded-lg">
          <div className="col-span-5 sm:col-span-5 truncate">
            {isFa ? 'عادت و استمرار' : 'Habit & Streak'}
          </div>
          <div className="col-span-7 sm:col-span-7 grid grid-cols-7 gap-1 text-center">
            {daysWindow.map((d, idx) => (
              <div
                key={d.key}
                className={`flex flex-col items-center py-0.5 rounded ${
                  d.isToday
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-extrabold ring-1 ring-emerald-500/30'
                    : ''
                }`}
              >
                <span className="text-[10px] opacity-80">{d.dayName}</span>
                <span className="text-[11px]">{d.dayNum}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Habit Rows */}
        {habits.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            <Flame className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-700 opacity-60" />
            <p>{isFa ? 'هیچ عادتی ثبت نشده است. روی "عادت جدید" کلیک کنید.' : 'No habits yet. Click "New Habit" to start.'}</p>
          </div>
        ) : (
          habits.map((habit) => {
            const streak = calculateStreak(habit.completedDates);
            const isTodayDone = habit.completedDates.includes(todayKey);

            return (
              <div
                key={habit.id}
                className={`grid grid-cols-12 gap-1 items-center p-2 rounded-xl border transition-all ${
                  isTodayDone
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-500/30'
                    : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Habit Info & Streak */}
                <div className="col-span-5 sm:col-span-5 flex items-center justify-between min-w-0 pr-1">
                  <div className="min-w-0 pr-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: habit.color || '#10b981' }}
                      />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate block">
                        {habit.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        {habit.category || 'عمومی'}
                      </span>
                      {streak > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-amber-600 dark:text-amber-400 bg-amber-500/15 px-1.5 py-0.2 rounded-full border border-amber-500/30">
                          <Flame className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                          <span>{isFa ? toPersianDigits(streak) : streak} {isFa ? 'روز' : 'd'}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteHabit(habit.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition p-1 cursor-pointer shrink-0"
                    title={isFa ? 'حذف عادت' : 'Delete habit'}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                {/* 7-Day Completion Checkboxes */}
                <div className="col-span-7 sm:col-span-7 grid grid-cols-7 gap-1 text-center items-center">
                  {daysWindow.map((day) => {
                    const done = habit.completedDates.includes(day.key);
                    return (
                      <button
                        key={day.key}
                        onClick={() => handleToggleHabitDay(habit.id, day.key)}
                        className={`h-7 rounded-lg flex items-center justify-center transition cursor-pointer ${
                          done
                            ? 'bg-emerald-500 text-white shadow-xs scale-105'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700'
                        } ${day.isToday ? 'ring-1 ring-emerald-500/40' : ''}`}
                        title={`${habit.title} - ${day.key}`}
                      >
                        {done ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <Circle className="w-3 h-3 opacity-40" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Summary Footer */}
      <div className={`mt-2 pt-2 border-t ${theme.borderClass} flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 shrink-0`}>
        <div className="flex items-center gap-1.5">
          <Trophy className="w-3.5 h-3.5 text-amber-500" />
          <span>
            {isFa
              ? `تعداد کل عادات فعال: ${toPersianDigits(habits.length)}`
              : `Total Active Habits: ${habits.length}`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
            {isFa ? 'تمرکز بر استمرار روزانه' : 'Focus on Daily Consistency'}
          </span>
        </div>
      </div>
    </div>
  );
};
