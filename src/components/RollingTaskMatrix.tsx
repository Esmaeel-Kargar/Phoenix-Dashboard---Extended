import React, { useState, useRef } from 'react';
import {
  Plus,
  CheckCircle2,
  Circle,
  ArrowLeft,
  Trash2,
  Clock,
  ChevronRight,
  ChevronLeft,
  CalendarDays,
  ArrowRight,
  LayoutGrid,
  Zap,
  Flame,
  Calendar,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { DayTask, Language } from '../types';
import { getFormattedDateInfo, toPersianDigits } from '../utils/jalali';
import { useWidgetTheme } from '../context/WidgetThemeContext';

interface RollingTaskMatrixProps {
  baseDate: Date;
  activeOffset: number;
  onOffsetChange: (offset: number) => void;
  tasks: DayTask[];
  onUpdateTasks: (tasks: DayTask[]) => void;
  language: Language;
}

export const RollingTaskMatrix: React.FC<RollingTaskMatrixProps> = ({
  baseDate,
  activeOffset,
  onOffsetChange,
  tasks,
  onUpdateTasks,
  language,
}) => {
  const theme = useWidgetTheme();
  const isFa = language === 'fa';

  const [viewMode, setViewMode] = useState<'7days' | 'eisenhower'>('7days');
  const [addingDateKey, setAddingDateKey] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [newTaskEstimate, setNewTaskEstimate] = useState<string>('30m');
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  // Build the 7 days array based on baseDate + activeOffset
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + activeOffset + i);
    const info = getFormattedDateInfo(d);
    return {
      index: i,
      dateObj: d,
      info,
    };
  });

  const handleToggleComplete = (taskId: string) => {
    onUpdateTasks(
      tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleAddTask = (dateKey: string, priorityOverride?: 'high' | 'medium' | 'low') => {
    if (!newTaskTitle.trim()) return;

    const newTask: DayTask = {
      id: `task-${Date.now()}`,
      dateKey,
      title: newTaskTitle.trim(),
      completed: false,
      priority: priorityOverride || newTaskPriority,
      timeEstimate: newTaskEstimate.trim() || '30m',
    };

    onUpdateTasks([...tasks, newTask]);
    setNewTaskTitle('');
    setAddingDateKey(null);
  };

  const handleDeleteTask = (taskId: string) => {
    onUpdateTasks(tasks.filter((t) => t.id !== taskId));
  };

  const handleShiftTaskToNextDay = (task: DayTask, currentDayIndex: number) => {
    const targetDay = days[currentDayIndex + 1];
    if (targetDay) {
      onUpdateTasks(
        tasks.map((t) =>
          t.id === task.id ? { ...t, dateKey: targetDay.info.dateKey } : t
        )
      );
    } else {
      const nextDate = new Date(days[6].dateObj);
      nextDate.setDate(nextDate.getDate() + 1);
      const nextInfo = getFormattedDateInfo(nextDate);
      onUpdateTasks(
        tasks.map((t) =>
          t.id === task.id ? { ...t, dateKey: nextInfo.dateKey } : t
        )
      );
    }
  };

  // Drag-to-scroll handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsMouseDown(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeftState(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseLeaveOrUp = () => {
    setIsMouseDown(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeftState - walk;
  };

  const scrollByAmount = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const colWidth = 220;
    const delta = direction === 'left' ? -colWidth : colWidth;
    scrollContainerRef.current.scrollBy({
      left: delta,
      behavior: 'smooth',
    });
  };

  // Eisenhower Quadrants classification
  const todayKey = days[0]?.info.dateKey || getFormattedDateInfo(new Date()).dateKey;

  // Q1: Urgent & Important (High priority, today or pending)
  const q1Tasks = tasks.filter((t) => t.priority === 'high' && !t.completed);
  // Q2: Not Urgent, Important (Medium priority)
  const q2Tasks = tasks.filter((t) => t.priority === 'medium' && !t.completed);
  // Q3: Urgent, Not Important (Low priority with close date)
  const q3Tasks = tasks.filter((t) => t.priority === 'low' && !t.completed);
  // Q4: Completed or Archived
  const q4Tasks = tasks.filter((t) => t.completed);

  return (
    <div
      id="rolling-task-matrix"
      className="h-full flex flex-col justify-between relative overflow-hidden transition-all select-text"
    >
      {/* Header bar with controls and window navigation */}
      <div className={`flex items-center justify-between border-b ${theme.borderClass} pb-2 mb-2 gap-2 shrink-0`}>
        <div className="flex items-center gap-2 min-w-0">
          <CalendarDays className={`w-4 h-4 ${theme.isDark ? 'text-blue-300' : 'text-blue-600'} shrink-0`} />
          <h2 className="text-xs sm:text-sm font-bold tracking-tight truncate">
            {isFa ? 'ماتریس برنامه‌ریزی و تسک‌های اجرایی' : 'Task Matrix & Scheduler'}
          </h2>

          {/* View Mode Toggle: 7-Day vs Eisenhower */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[10px] font-bold">
            <button
              onClick={() => setViewMode('7days')}
              className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                viewMode === '7days'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {isFa ? 'نمای ۷ روزه غلتان' : '7-Day Rolling'}
            </button>
            <button
              onClick={() => setViewMode('eisenhower')}
              className={`px-2 py-0.5 rounded-md transition cursor-pointer flex items-center gap-1 ${
                viewMode === 'eisenhower'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <LayoutGrid className="w-3 h-3" />
              <span>{isFa ? 'ماتریس آیزنهاور' : 'Eisenhower'}</span>
            </button>
          </div>
        </div>

        {/* Rolling Window Navigation (when in 7-day mode) */}
        {viewMode === '7days' ? (
          <div className="flex items-center gap-1 text-xs shrink-0">
            <button
              onClick={() => onOffsetChange(activeOffset - 1)}
              className={`p-1 ${theme.buttonBgClass} rounded cursor-pointer transition flex items-center gap-1`}
              title={isFa ? 'یک روز به عقب' : 'Shift 1 day earlier'}
            >
              <ChevronRight className={`w-3.5 h-3.5 ${!isFa ? 'rotate-180' : ''}`} />
              <span className="hidden sm:inline text-[10px]">{isFa ? 'روز قبل' : 'Prev'}</span>
            </button>

            <button
              onClick={() => onOffsetChange(0)}
              className={`px-2 py-0.5 rounded font-bold cursor-pointer transition text-[10px] ${
                activeOffset === 0
                  ? 'bg-blue-600 text-white shadow-xs'
                  : theme.buttonBgClass
              }`}
            >
              {isFa ? 'امروز' : 'Today'}
            </button>

            <button
              onClick={() => onOffsetChange(activeOffset + 1)}
              className={`p-1 ${theme.buttonBgClass} rounded cursor-pointer transition flex items-center gap-1`}
              title={isFa ? 'یک روز به جلو' : 'Shift 1 day forward'}
            >
              <span className="hidden sm:inline text-[10px]">{isFa ? 'روز بعد' : 'Next'}</span>
              <ChevronLeft className={`w-3.5 h-3.5 ${!isFa ? 'rotate-180' : ''}`} />
            </button>

            {/* Quick Smooth Slide Buttons */}
            <div className={`flex items-center gap-0.5 border-s ${theme.borderClass} ps-1 ms-0.5`}>
              <button
                onClick={() => scrollByAmount(isFa ? 'right' : 'left')}
                className={`p-1 ${theme.buttonBgClass} rounded cursor-pointer transition`}
                title={isFa ? 'اسکرول به راست' : 'Scroll Left'}
              >
                <ArrowRight className="w-3 h-3" />
              </button>
              <button
                onClick={() => scrollByAmount(isFa ? 'left' : 'right')}
                className={`p-1 ${theme.buttonBgClass} rounded cursor-pointer transition`}
                title={isFa ? 'اسکرول به چپ' : 'Scroll Right'}
              >
                <ArrowLeft className="w-3 h-3" />
              </button>
            </div>
          </div>
        ) : (
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {isFa ? 'تفکیک بر اساس ماتریس ۴ خانه مدیریت زمان' : 'Time management quadrant view'}
          </span>
        )}
      </div>

      {/* Main Content: 7-Day Rolling Mode OR Eisenhower Matrix Mode */}
      {viewMode === '7days' ? (
        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeaveOrUp}
          onMouseUp={handleMouseLeaveOrUp}
          onMouseMove={handleMouseMove}
          className="flex-1 flex gap-2.5 overflow-x-auto custom-scrollbar pb-1 cursor-grab active:cursor-grabbing select-none"
        >
          {days.map((day) => {
            const dayTasks = tasks.filter((t) => t.dateKey === day.info.dateKey);
            const isToday = day.index === 0 && activeOffset === 0;

            return (
              <div
                key={day.info.dateKey}
                className={`flex-1 min-w-[200px] max-w-[260px] flex flex-col rounded-xl border transition-all ${
                  isToday
                    ? 'border-blue-500/50 bg-blue-50/20 dark:bg-blue-950/15 shadow-xs'
                    : `${theme.borderClass} bg-slate-50/40 dark:bg-slate-900/40`
                }`}
              >
                {/* Day Header */}
                <div
                  className={`p-2 border-b ${theme.borderClass} flex items-center justify-between shrink-0 ${
                    isToday ? 'bg-blue-500/10' : ''
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className={`text-xs font-black ${
                        isToday
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {isFa ? day.info.persianWeekday : day.info.englishWeekday}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {isFa ? toPersianDigits(day.info.jd) : day.info.gd}{' '}
                      {isFa ? day.info.persianMonth : day.info.englishMonth}
                    </span>
                  </div>

                  {isToday && (
                    <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-blue-500 text-white">
                      {isFa ? 'امروز' : 'Today'}
                    </span>
                  )}
                </div>

                {/* Day Tasks List */}
                <div className="flex-1 p-1.5 space-y-1.5 overflow-y-auto custom-scrollbar min-h-[140px]">
                  {dayTasks.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-[10px] text-slate-400 py-4">
                      {isFa ? 'تسکی ثبت نشده' : 'No tasks'}
                    </div>
                  ) : (
                    dayTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`p-2 rounded-lg border text-xs transition group ${
                          task.completed
                            ? 'bg-slate-100/70 dark:bg-slate-800/40 border-slate-200/50 dark:border-slate-800 text-slate-400 line-through'
                            : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-start gap-1.5">
                          <button
                            onClick={() => handleToggleComplete(task.id)}
                            className="mt-0.5 text-slate-400 hover:text-blue-500 transition cursor-pointer shrink-0"
                          >
                            {task.completed ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Circle className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium leading-tight break-words">{task.title}</p>
                            <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
                              {task.timeEstimate && (
                                <span className="flex items-center gap-0.5">
                                  <Clock className="w-2.5 h-2.5" />
                                  <span>{isFa ? toPersianDigits(task.timeEstimate) : task.timeEstimate}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Hover Action Bar */}
                        <div className="flex items-center justify-end gap-1 mt-1 pt-1 border-t border-slate-100 dark:border-slate-700/60 opacity-0 group-hover:opacity-100 transition">
                          <button
                            onClick={() => handleShiftTaskToNextDay(task, day.index)}
                            className="p-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-blue-500 cursor-pointer"
                            title={isFa ? 'انتقال به روز بعد' : 'Move to next day'}
                          >
                            <ArrowLeft className={`w-3 h-3 ${!isFa ? 'rotate-180' : ''}`} />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-red-500 cursor-pointer"
                            title={isFa ? 'حذف' : 'Delete'}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Task Button */}
                <div className={`p-1.5 border-t ${theme.borderClass} shrink-0`}>
                  {addingDateKey === day.info.dateKey ? (
                    <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-blue-500/30 space-y-1.5 shadow-sm">
                      <input
                        type="text"
                        placeholder={isFa ? 'عنوان تسک...' : 'Task title...'}
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddTask(day.info.dateKey);
                          if (e.key === 'Escape') setAddingDateKey(null);
                        }}
                        className="w-full text-xs p-1 rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-100"
                        autoFocus
                      />
                      <div className="flex items-center justify-between gap-1">
                        <select
                          value={newTaskPriority}
                          onChange={(e) => setNewTaskPriority(e.target.value as any)}
                          className="text-[10px] p-0.5 rounded border border-slate-200 dark:border-slate-700 bg-transparent"
                        >
                          <option value="high">{isFa ? 'فوری' : 'High'}</option>
                          <option value="medium">{isFa ? 'متوسط' : 'Med'}</option>
                          <option value="low">{isFa ? 'عادی' : 'Low'}</option>
                        </select>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setAddingDateKey(null)}
                            className="px-1.5 py-0.5 rounded text-[10px] text-slate-500 cursor-pointer"
                          >
                            {isFa ? 'لغو' : 'X'}
                          </button>
                          <button
                            onClick={() => handleAddTask(day.info.dateKey)}
                            className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white cursor-pointer"
                          >
                            {isFa ? 'ثبت' : 'Add'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setAddingDateKey(day.info.dateKey);
                        setNewTaskTitle('');
                      }}
                      className="w-full py-1 text-[11px] rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium flex items-center justify-center gap-1 transition cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{isFa ? 'افزودن تسک' : 'Add Task'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Eisenhower Matrix 4 Quadrants View */
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2.5 overflow-y-auto custom-scrollbar p-1">
          {/* Q1: Do First (فوری و مهم) */}
          <div className="p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-500/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-rose-500/20">
                <div className="flex items-center gap-1.5 font-bold text-xs text-rose-700 dark:text-rose-300">
                  <Flame className="w-4 h-4 text-rose-600" />
                  <span>{isFa ? '۱. فوری و بسیار مهم (اقدام سریع)' : '1. Urgent & Important (Do First)'}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-700 dark:text-rose-300">
                  {isFa ? toPersianDigits(q1Tasks.length) : q1Tasks.length}
                </span>
              </div>
              <div className="space-y-1.5 max-h-[140px] overflow-y-auto custom-scrollbar">
                {q1Tasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-900/60 flex items-center justify-between text-xs"
                  >
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{t.title}</span>
                    <button
                      onClick={() => handleToggleComplete(t.id)}
                      className="text-slate-400 hover:text-emerald-500 cursor-pointer"
                    >
                      <Circle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => handleAddTask(todayKey, 'high')}
              className="mt-2 text-[10px] text-rose-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>{isFa ? 'افزودن تسک با اولویت بالا' : 'Add Urgent Task'}</span>
            </button>
          </div>

          {/* Q2: Schedule (مهم ولی غیرفوری) */}
          <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-500/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-blue-500/20">
                <div className="flex items-center gap-1.5 font-bold text-xs text-blue-700 dark:text-blue-300">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>{isFa ? '۲. مهم و غیرفوری (برنامه‌ریزی و رشد)' : '2. Important, Not Urgent (Schedule)'}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-300">
                  {isFa ? toPersianDigits(q2Tasks.length) : q2Tasks.length}
                </span>
              </div>
              <div className="space-y-1.5 max-h-[140px] overflow-y-auto custom-scrollbar">
                {q2Tasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-900/60 flex items-center justify-between text-xs"
                  >
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{t.title}</span>
                    <button
                      onClick={() => handleToggleComplete(t.id)}
                      className="text-slate-400 hover:text-emerald-500 cursor-pointer"
                    >
                      <Circle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => handleAddTask(todayKey, 'medium')}
              className="mt-2 text-[10px] text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>{isFa ? 'افزودن تسک برنامه‌ریزی' : 'Add Schedule Task'}</span>
            </button>
          </div>

          {/* Q3: Delegate (فوری ولی کم‌اهمیت) */}
          <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-500/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-amber-500/20">
                <div className="flex items-center gap-1.5 font-bold text-xs text-amber-700 dark:text-amber-300">
                  <Zap className="w-4 h-4 text-amber-600" />
                  <span>{isFa ? '۳. فوری و کم‌اهمیت (تفویض و خودکارسازی)' : '3. Urgent, Low Impact (Delegate)'}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300">
                  {isFa ? toPersianDigits(q3Tasks.length) : q3Tasks.length}
                </span>
              </div>
              <div className="space-y-1.5 max-h-[140px] overflow-y-auto custom-scrollbar">
                {q3Tasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between text-xs"
                  >
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{t.title}</span>
                    <button
                      onClick={() => handleToggleComplete(t.id)}
                      className="text-slate-400 hover:text-emerald-500 cursor-pointer"
                    >
                      <Circle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => handleAddTask(todayKey, 'low')}
              className="mt-2 text-[10px] text-amber-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>{isFa ? 'افزودن تسک تفویضی' : 'Add Delegate Task'}</span>
            </button>
          </div>

          {/* Q4: Completed / Archived (تکمیل شده‌ها) */}
          <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-500/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-emerald-500/20">
                <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{isFa ? '۴. تسک‌های پایان‌یافته و دستاوردها' : '4. Completed Achievements'}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                  {isFa ? toPersianDigits(q4Tasks.length) : q4Tasks.length}
                </span>
              </div>
              <div className="space-y-1.5 max-h-[140px] overflow-y-auto custom-scrollbar">
                {q4Tasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-1.5 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-emerald-200 dark:border-emerald-900/60 flex items-center justify-between text-xs line-through text-slate-400"
                  >
                    <span className="truncate">{t.title}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
            <div className="text-[10px] text-slate-400 mt-2">
              {isFa ? 'آمار کل دستاوردها' : 'Total completed'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
