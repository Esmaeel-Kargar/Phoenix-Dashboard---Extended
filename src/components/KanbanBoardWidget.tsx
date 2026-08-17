import React, { useState } from 'react';
import {
  Kanban,
  Plus,
  Trash2,
  Calendar,
  ChevronRight,
  ChevronLeft,
  Tag,
  ArrowRight,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { KanbanCard, DayTask, Language } from '../types';
import { toPersianDigits, getFormattedDateInfo } from '../utils/jalali';
import { useWidgetTheme } from '../context/WidgetThemeContext';

interface KanbanBoardWidgetProps {
  cards: KanbanCard[];
  onUpdateCards: (cards: KanbanCard[]) => void;
  tasks: DayTask[];
  onUpdateTasks: (tasks: DayTask[]) => void;
  language: Language;
  onAddLog?: (log: any) => void;
}

export const KanbanBoardWidget: React.FC<KanbanBoardWidgetProps> = ({
  cards = [],
  onUpdateCards,
  tasks = [],
  onUpdateTasks,
  language,
  onAddLog,
}) => {
  const theme = useWidgetTheme();
  const isFa = language === 'fa';

  const [isAdding, setIsAdding] = useState(false);
  const [targetCol, setTargetCol] = useState<'backlog' | 'in_progress' | 'review' | 'done'>('backlog');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [newTags, setNewTags] = useState('');

  const COLUMNS: {
    id: 'backlog' | 'in_progress' | 'review' | 'done';
    titleFa: string;
    titleEn: string;
    color: string;
    badgeBg: string;
  }[] = [
    { id: 'backlog', titleFa: 'ایده‌ها و بک‌لاگ', titleEn: 'Backlog', color: '#64748b', badgeBg: 'bg-slate-500/15 text-slate-700 dark:text-slate-300' },
    { id: 'in_progress', titleFa: 'در دست اقدام', titleEn: 'In Progress', color: '#3b82f6', badgeBg: 'bg-blue-500/15 text-blue-700 dark:text-blue-300' },
    { id: 'review', titleFa: 'بازبینی و کنترل', titleEn: 'Review & QA', color: '#8b5cf6', badgeBg: 'bg-purple-500/15 text-purple-700 dark:text-purple-300' },
    { id: 'done', titleFa: 'تکمیل شده', titleEn: 'Completed', color: '#10b981', badgeBg: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' },
  ];

  const handleAddCard = () => {
    if (!newTitle.trim()) return;

    const tagsArray = newTags
      .split(/[,،]/)
      .map((t) => t.trim())
      .filter(Boolean);

    const newCard: KanbanCard = {
      id: `kb-card-${Date.now()}`,
      columnId: targetCol,
      title: newTitle.trim(),
      description: newDesc.trim() || undefined,
      priority: newPriority,
      tags: tagsArray.length > 0 ? tagsArray : undefined,
      createdAt: new Date().toISOString().split('T')[0],
    };

    onUpdateCards([...cards, newCard]);
    setNewTitle('');
    setNewDesc('');
    setNewTags('');
    setIsAdding(false);
  };

  const handleMoveCard = (cardId: string, direction: 'next' | 'prev') => {
    const colOrder: ('backlog' | 'in_progress' | 'review' | 'done')[] = ['backlog', 'in_progress', 'review', 'done'];
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;

    const currentIndex = colOrder.indexOf(card.columnId);
    const targetIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

    if (targetIndex >= 0 && targetIndex < colOrder.length) {
      const nextCol = colOrder[targetIndex];
      onUpdateCards(cards.map((c) => (c.id === cardId ? { ...c, columnId: nextCol } : c)));
    }
  };

  const handleDeleteCard = (cardId: string) => {
    onUpdateCards(cards.filter((c) => c.id !== cardId));
  };

  // Convert Kanban card to a task in the 7-day matrix
  const handleSendToTaskMatrix = (card: KanbanCard) => {
    const todayKey = getFormattedDateInfo(new Date()).dateKey;
    const newTask: DayTask = {
      id: `task-from-kb-${Date.now()}`,
      dateKey: todayKey,
      title: `[پروژه] ${card.title}`,
      completed: false,
      priority: card.priority,
      category: card.tags?.[0] || 'پروژه',
      timeEstimate: '1h',
    };

    onUpdateTasks([...tasks, newTask]);

    if (onAddLog) {
      onAddLog({
        id: `log-kb-task-${Date.now()}`,
        actorType: 'user',
        actorId: 'user-default',
        actorName: 'کاربر سیستم',
        authorizerType: 'direct_user',
        authorizerId: 'user-default',
        authorizerName: 'مدیریت کانبان',
        module: 'kanban',
        action: 'create',
        descriptionFa: `انتقال کارت کانبان "${card.title}" به ماتریس تسک‌های امروز`,
        descriptionEn: `Moved Kanban card "${card.title}" to today's task matrix`,
        timestamp: new Date().toISOString(),
        shamsiDate: todayKey,
        status: 'success',
      });
    }
  };

  return (
    <div className="h-full flex flex-col justify-between select-text relative">
      {/* Header bar */}
      <div className={`flex items-center justify-between border-b ${theme.borderClass} pb-2.5 mb-2.5 shrink-0`}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Kanban className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold tracking-tight">
              {isFa ? 'تخته کانبان پروژه‌ها و جریان کار' : 'Project Kanban Board'}
            </h2>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span>{isFa ? `کل آیتم‌ها: ${toPersianDigits(cards.length)}` : `Total Cards: ${cards.length}`}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setTargetCol('backlog');
            setIsAdding(!isAdding);
          }}
          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 transition shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isFa ? 'کارت جدید' : 'New Card'}</span>
        </button>
      </div>

      {/* Add Card Form */}
      {isAdding && (
        <div className="mb-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-blue-500/30 animate-in fade-in">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            {isFa ? 'افزودن کارت جدید به تخته کانبان' : 'Add New Kanban Card'}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
            <input
              type="text"
              placeholder={isFa ? 'عنوان تسک یا فیچر پروژه' : 'Card title'}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
            />
            <select
              value={targetCol}
              onChange={(e) => setTargetCol(e.target.value as any)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
            >
              {COLUMNS.map((col) => (
                <option key={col.id} value={col.id}>
                  {isFa ? col.titleFa : col.titleEn}
                </option>
              ))}
            </select>
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as any)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
            >
              <option value="high">{isFa ? 'اولویت بالا' : 'High Priority'}</option>
              <option value="medium">{isFa ? 'اولویت متوسط' : 'Medium Priority'}</option>
              <option value="low">{isFa ? 'اولویت پایین' : 'Low Priority'}</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
            <input
              type="text"
              placeholder={isFa ? 'توضیحات تکمیلی (اختیاری)' : 'Description (optional)'}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
            />
            <input
              type="text"
              placeholder={isFa ? 'برچسب‌ها با کاما (مثلاً: هوش مصنوعی، UI)' : 'Tags comma-separated'}
              value={newTags}
              onChange={(e) => setNewTags(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="flex justify-end gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-2.5 py-1 text-xs text-slate-500 cursor-pointer"
            >
              {isFa ? 'انصراف' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={handleAddCard}
              className="px-3 py-1 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer"
            >
              {isFa ? 'افزودن کارت' : 'Add Card'}
            </button>
          </div>
        </div>
      )}

      {/* 4 Kanban Columns */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 overflow-y-auto custom-scrollbar p-0.5">
        {COLUMNS.map((col) => {
          const colCards = cards.filter((c) => c.columnId === col.id);

          return (
            <div
              key={col.id}
              className="flex flex-col bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 p-2 min-h-[220px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/80 dark:border-slate-800 shrink-0">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: col.color }}
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {isFa ? col.titleFa : col.titleEn}
                  </span>
                </div>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${col.badgeBg}`}>
                  {isFa ? toPersianDigits(colCards.length) : colCards.length}
                </span>
              </div>

              {/* Cards List in this Column */}
              <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-0.5">
                {colCards.map((card) => (
                  <div
                    key={card.id}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 shadow-2xs hover:shadow-xs transition group"
                  >
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">
                        {card.title}
                      </h4>
                      <button
                        onClick={() => handleDeleteCard(card.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition p-0.5 cursor-pointer shrink-0"
                        title={isFa ? 'حذف کارت' : 'Delete'}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    {card.description && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2 line-clamp-2 leading-relaxed">
                        {card.description}
                      </p>
                    )}

                    {/* Tags & Priority */}
                    <div className="flex flex-wrap items-center gap-1 mb-2">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          card.priority === 'high'
                            ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                            : card.priority === 'medium'
                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                            : 'bg-slate-500/15 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {card.priority === 'high' ? (isFa ? 'فوری' : 'High') : card.priority === 'medium' ? (isFa ? 'متوسط' : 'Med') : (isFa ? 'پایین' : 'Low')}
                      </span>

                      {card.tags?.map((t, idx) => (
                        <span
                          key={idx}
                          className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>

                    {/* Card Actions (Shift between columns & Send to 7-Day Matrix) */}
                    <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 dark:border-slate-700/60 text-[10px]">
                      <button
                        onClick={() => handleSendToTaskMatrix(card)}
                        className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 cursor-pointer font-semibold"
                        title={isFa ? 'ارسال این تسک به ماتریس هفتگی' : 'Send to weekly task matrix'}
                      >
                        <ArrowUpRight className="w-3 h-3" />
                        <span>{isFa ? 'به ماتریس هفتگی' : 'To Matrix'}</span>
                      </button>

                      <div className="flex items-center gap-1">
                        {col.id !== 'backlog' && (
                          <button
                            onClick={() => handleMoveCard(card.id, 'prev')}
                            className="p-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                            title={isFa ? 'ستون قبلی' : 'Previous Column'}
                          >
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                        {col.id !== 'done' && (
                          <button
                            onClick={() => handleMoveCard(card.id, 'next')}
                            className="p-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                            title={isFa ? 'ستون بعدی' : 'Next Column'}
                          >
                            <ChevronLeft className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
