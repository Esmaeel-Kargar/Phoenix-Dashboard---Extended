import React, { useState } from 'react';
import {
  Target,
  Plus,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { SeasonGoal, Language } from '../types';
import { toPersianDigits } from '../utils/jalali';
import { useWidgetTheme } from '../context/WidgetThemeContext';

interface SeasonGoalsCardProps {
  goals: SeasonGoal[];
  onUpdateGoals: (goals: SeasonGoal[]) => void;
  currentSeason?: string;
  language: Language;
}

export const SeasonGoalsCard: React.FC<SeasonGoalsCardProps> = ({
  goals,
  onUpdateGoals,
  currentSeason = 'تابستان ۱۴۰۵',
  language,
}) => {
  const theme = useWidgetTheme();
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTargetDate, setNewTargetDate] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);

  const isFa = language === 'fa';

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newGoal: SeasonGoal = {
      id: `goal-${Date.now()}`,
      title: newTitle.trim(),
      season: isFa ? 'تابستان ۱۴۰۵' : 'Summer 2026',
      progress: 0,
      targetDate: newTargetDate.trim() || undefined,
      category: newCategory.trim() || undefined,
      completed: false,
      order: goals.length,
    };

    onUpdateGoals([...goals, newGoal]);
    setNewTitle('');
    setNewTargetDate('');
    setNewCategory('');
    setIsAddingGoal(false);
  };

  const handleToggleComplete = (goalId: string) => {
    onUpdateGoals(
      goals.map((g) =>
        g.id === goalId
          ? {
              ...g,
              completed: !g.completed,
              progress: !g.completed ? 100 : g.progress === 100 ? 50 : g.progress,
            }
          : g
      )
    );
  };

  const handleUpdateProgress = (goalId: string, progress: number) => {
    const clampedProgress = Math.max(0, Math.min(100, progress));
    onUpdateGoals(
      goals.map((g) =>
        g.id === goalId
          ? {
              ...g,
              progress: clampedProgress,
              completed: clampedProgress === 100,
            }
          : g
      )
    );
  };

  const handleDeleteGoal = (goalId: string) => {
    onUpdateGoals(goals.filter((g) => g.id !== goalId));
  };

  const handleSaveEdit = (goalId: string, newText: string) => {
    if (!newText.trim()) return;
    onUpdateGoals(
      goals.map((g) => (g.id === goalId ? { ...g, title: newText.trim() } : g))
    );
    setEditingGoalId(null);
  };

  return (
    <div
      id="season-goals-card"
      className="h-full flex flex-col justify-between relative overflow-hidden transition-all select-text"
    >
      {/* Background Ambience */}
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-current/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className={`flex items-center justify-between border-b ${theme.borderClass} pb-2 mb-2 shrink-0`}>
          <div className="flex items-center gap-1.5 min-w-0">
            <Target className={`w-4 h-4 ${theme.isDark ? 'text-emerald-300' : 'text-emerald-600'} shrink-0`} />
            <h2 className="text-xs sm:text-sm font-bold tracking-tight truncate">
              {isFa ? 'اهداف اصلی فصل کاری:' : 'Main Season Work Goals:'}
            </h2>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`text-[10px] ${theme.isDark ? 'bg-white/15 text-emerald-200' : 'bg-emerald-100 text-emerald-800'} px-2 py-0.5 rounded-full font-medium flex items-center gap-1`}>
              <Sparkles className="w-2.5 h-2.5 text-amber-400" />
              {currentSeason}
            </span>
            <button
              onClick={() => setIsAddingGoal(!isAddingGoal)}
              className={`p-1.5 ${theme.buttonBgClass} rounded-lg transition cursor-pointer text-xs flex items-center gap-1 font-medium`}
              title={isFa ? 'افزودن هدف جدید' : 'Add New Goal'}
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">{isFa ? 'افزودن' : 'Add'}</span>
            </button>
          </div>
        </div>

        {/* Add Goal Form */}
        {isAddingGoal && (
          <form
            onSubmit={handleAddGoal}
            className={`p-2.5 rounded-lg border ${theme.cardBgClass} mb-2.5 space-y-1.5 text-xs shrink-0 animate-in fade-in`}
          >
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder={isFa ? 'عنوان هدف فصل کاری (مثال: توسعه سامانه مدیریت...)' : 'Season Goal Title...'}
              className={`w-full p-1.5 rounded focus:outline-none text-[11px] ${theme.inputClass}`}
              autoFocus
            />
            <div className="flex gap-1.5">
              <input
                type="text"
                value={newTargetDate}
                onChange={(e) => setNewTargetDate(e.target.value)}
                placeholder={isFa ? 'مهلت هدف (مثال: ۱۴۰۵/۰۶/۳۱)' : 'Target Date...'}
                className={`w-1/2 p-1.5 rounded focus:outline-none text-[11px] ${theme.inputClass}`}
              />
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder={isFa ? 'دسته‌بندی (مثال: محصول، مالی)' : 'Category...'}
                className={`w-1/2 p-1.5 rounded focus:outline-none text-[11px] ${theme.inputClass}`}
              />
            </div>
            <div className="flex justify-end gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingGoal(false)}
                className={`px-2.5 py-0.5 ${theme.buttonBgClass} rounded cursor-pointer transition text-[11px]`}
              >
                {isFa ? 'انصراف' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-3 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-semibold cursor-pointer transition text-[11px]"
              >
                {isFa ? 'ثبت هدف' : 'Add Goal'}
              </button>
            </div>
          </form>
        )}

        {/* Goals List */}
        <div className="space-y-1.5 flex-1 overflow-y-auto pe-1 custom-scrollbar min-h-0">
          {goals.length === 0 ? (
            <div className={`text-center py-4 ${theme.subtleTextClass} text-xs italic rounded-lg border ${theme.borderClass} ${theme.cardBgClass}`}>
              {isFa ? 'هنوز هدفی برای این فصل کاری ثبت نشده است.' : 'No season goals added yet.'}
            </div>
          ) : (
            goals.map((goal, idx) => {
              const isExpanded = expandedGoalId === goal.id;
              const isEditing = editingGoalId === goal.id;
              const defaultBullet = isFa
                ? `هدف ${idx === 0 ? 'اول' : idx === 1 ? 'دوم' : idx === 2 ? 'سوم' : idx === 3 ? 'چهارم' : idx + 1}`
                : `Goal ${idx + 1}`;

              return (
                <div
                  key={goal.id}
                  className={`border rounded-lg p-2 transition-all ${theme.borderClass} ${theme.cardBgClass} ${theme.cardHoverClass} ${
                    goal.completed ? 'opacity-85' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-1.5">
                    {/* Goal Title & Bullet Point */}
                    <div className="flex items-start gap-1.5 flex-1 min-w-0">
                      <button
                        onClick={() => handleToggleComplete(goal.id)}
                        className={`mt-0.5 ${theme.isDark ? 'text-emerald-300 hover:text-white' : 'text-emerald-600 hover:text-emerald-700'} transition cursor-pointer shrink-0`}
                        title={goal.completed ? (isFa ? 'تکمیل شده' : 'Completed') : (isFa ? 'علامت به عنوان تکمیل' : 'Mark complete')}
                      >
                        {goal.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <span className="text-base font-bold leading-none text-emerald-400">•</span>
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        {isEditing ? (
                          <input
                            type="text"
                            defaultValue={goal.title}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEdit(goal.id, e.currentTarget.value);
                              if (e.key === 'Escape') setEditingGoalId(null);
                            }}
                            onBlur={(e) => handleSaveEdit(goal.id, e.target.value)}
                            className={`w-full p-1 rounded text-xs focus:outline-none ${theme.inputClass}`}
                            autoFocus
                          />
                        ) : (
                          <div
                            onClick={() => setExpandedGoalId(isExpanded ? null : goal.id)}
                            className="cursor-pointer"
                          >
                            <p
                              className={`text-[11px] sm:text-xs font-semibold leading-snug break-words ${
                                goal.completed ? 'line-through opacity-70' : ''
                              }`}
                            >
                              <span className={`${theme.isDark ? 'text-emerald-300' : 'text-emerald-700'} font-bold me-1`}>
                                {defaultBullet}:
                              </span>
                              {goal.title.replace(/^هدف\s+(اول|دوم|سوم|چهارم|پنجم|[0-9]+):\s*/i, '')}
                            </p>
                            {goal.targetDate && (
                              <span className={`text-[10px] ${theme.subtleTextClass} mt-0.5 block`}>
                                {isFa ? `موعد: ${toPersianDigits(goal.targetDate)}` : `Due: ${goal.targetDate}`}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick Progress Badge & Action Buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      <span className={`text-[10px] font-mono font-bold ${
                        theme.isDark ? 'bg-black/25 text-emerald-300' : 'bg-slate-100 text-slate-800 border border-slate-200'
                      } px-1.5 py-0.5 rounded`}>
                        {isFa ? toPersianDigits(goal.progress) : goal.progress}%
                      </span>
                      <button
                        onClick={() => setExpandedGoalId(isExpanded ? null : goal.id)}
                        className={`p-1 ${theme.buttonBgClass} rounded transition cursor-pointer`}
                      >
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className={`mt-1.5 w-full ${theme.isDark ? 'bg-black/30' : 'bg-slate-200'} h-1.5 rounded-full overflow-hidden`}>
                    <div
                      className="bg-emerald-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>

                  {/* Expanded Controls (Sliders, Edits, Deletion) */}
                  {isExpanded && (
                    <div className={`mt-2 pt-2 border-t ${theme.borderClass} flex flex-wrap items-center justify-between gap-1.5 text-xs`}>
                      {/* Increment / Decrement Buttons */}
                      <div className="flex items-center gap-1">
                        <span className={`text-[10px] ${theme.subtleTextClass}`}>{isFa ? 'پیشرفت:' : 'Progress:'}</span>
                        <button
                          onClick={() => handleUpdateProgress(goal.id, goal.progress - 10)}
                          className={`px-1.5 py-0.5 ${theme.buttonBgClass} rounded cursor-pointer text-[10px] font-bold`}
                        >
                          -۱۰٪
                        </button>
                        <button
                          onClick={() => handleUpdateProgress(goal.id, goal.progress + 10)}
                          className={`px-1.5 py-0.5 ${theme.buttonBgClass} rounded cursor-pointer text-[10px] font-bold`}
                        >
                          +۱۰٪
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={goal.progress}
                          onChange={(e) => handleUpdateProgress(goal.id, Number(e.target.value))}
                          className="w-16 accent-emerald-400 cursor-pointer h-1 ms-1"
                        />
                      </div>

                      {/* Edit & Delete Action Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingGoalId(goal.id)}
                          className={`p-1 ${theme.buttonBgClass} rounded cursor-pointer transition`}
                          title={isFa ? 'ویرایش متن هدف' : 'Edit Goal Title'}
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteGoal(goal.id)}
                          className={`p-1 ${theme.buttonBgClass} hover:text-red-400 rounded cursor-pointer transition`}
                          title={isFa ? 'حذف هدف' : 'Delete Goal'}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer / Summary */}
      <div className={`mt-2 pt-1.5 border-t ${theme.borderClass} flex items-center justify-between text-[10px] ${theme.subtleTextClass} shrink-0`}>
        <span>
          {isFa
            ? `${toPersianDigits(goals.filter((g) => g.completed).length)} از ${toPersianDigits(goals.length)} هدف محقق شده`
            : `${goals.filter((g) => g.completed).length} of ${goals.length} goals achieved`}
        </span>
        <span className="opacity-80">
          {isFa ? 'تمرکز بر تارگت‌های اصلی' : 'High-Impact Focus'}
        </span>
      </div>
    </div>
  );
};
