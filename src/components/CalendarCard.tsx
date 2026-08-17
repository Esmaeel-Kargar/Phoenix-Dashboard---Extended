import React, { useState, useEffect } from 'react';
import { Clock, Edit3, Sparkles, Check, ChevronRight, ChevronLeft, CalendarRange, Plus, CheckCircle2, Trash2 } from 'lucide-react';
import { getFormattedDateInfo, toPersianDigits, getOccasionsForDate } from '../utils/jalali';
import { Language, TimeBlock } from '../types';
import { useWidgetTheme } from '../context/WidgetThemeContext';

interface CalendarCardProps {
  currentDate: Date;
  onDateChange?: (date: Date) => void;
  dateNote: string;
  onSaveDateNote: (note: string) => void;
  language: Language;
  timeBlocks?: TimeBlock[];
  onUpdateTimeBlocks?: (blocks: TimeBlock[]) => void;
}

export const CalendarCard: React.FC<CalendarCardProps> = ({
  currentDate,
  onDateChange,
  dateNote,
  onSaveDateNote,
  language,
  timeBlocks = [],
  onUpdateTimeBlocks,
}) => {
  const theme = useWidgetTheme();
  const [liveTime, setLiveTime] = useState<string>('');
  const [isLiveClock, setIsLiveClock] = useState<boolean>(true);
  const [isEditingNote, setIsEditingNote] = useState<boolean>(false);
  const [noteInput, setNoteInput] = useState<string>(dateNote);
  const [activeTab, setActiveTab] = useState<'info' | 'timeblocking'>('info');

  const [newBlockTime, setNewBlockTime] = useState('10:00');
  const [newBlockTitle, setNewBlockTitle] = useState('');

  const isFa = language === 'fa';

  useEffect(() => {
    setNoteInput(dateNote);
  }, [dateNote]);

  useEffect(() => {
    const updateTime = () => {
      const now = isLiveClock ? new Date() : currentDate;
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setLiveTime(`${hours}:${minutes}:${seconds}`);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [isLiveClock, currentDate]);

  const dateInfo = getFormattedDateInfo(currentDate);
  const occasions = getOccasionsForDate(dateInfo.jm, dateInfo.jd, dateInfo.gm, dateInfo.gd);

  const handleSaveNote = () => {
    onSaveDateNote(noteInput);
    setIsEditingNote(false);
  };

  const handlePrevDay = () => {
    if (onDateChange) {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 1);
      onDateChange(d);
    }
  };

  const handleNextDay = () => {
    if (onDateChange) {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 1);
      onDateChange(d);
    }
  };

  const handleAddTimeBlock = () => {
    if (!newBlockTitle.trim() || !onUpdateTimeBlocks) return;
    const newBlock: TimeBlock = {
      id: `tb-${Date.now()}`,
      dateKey: dateInfo.dateKey,
      startTime: newBlockTime,
      endTime: '',
      title: newBlockTitle.trim(),
      color: '#3b82f6',
      completed: false,
    };
    onUpdateTimeBlocks([...timeBlocks, newBlock]);
    setNewBlockTitle('');
  };

  const handleToggleBlock = (id: string) => {
    if (!onUpdateTimeBlocks) return;
    onUpdateTimeBlocks(
      timeBlocks.map((b) => (b.id === id ? { ...b, completed: !b.completed } : b))
    );
  };

  const handleDeleteBlock = (id: string) => {
    if (!onUpdateTimeBlocks) return;
    onUpdateTimeBlocks(timeBlocks.filter((b) => b.id !== id));
  };

  const todayBlocks = timeBlocks.filter((b) => b.dateKey === dateInfo.dateKey);

  return (
    <div
      id="calendar-card"
      className="@container h-full flex flex-col justify-between relative overflow-hidden transition-all select-text"
    >
      {/* Subtle Background Glow */}
      <div className="absolute -top-10 -right-10 w-36 h-36 bg-current/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header: Live Clock & Day Navigation */}
      <div className="shrink-0">
        <div className={`flex items-center justify-between border-b ${theme.borderClass} pb-2 mb-2 gap-1`}>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handlePrevDay}
              title={isFa ? 'روز قبل' : 'Previous Day'}
              className={`p-1 ${theme.buttonBgClass} rounded-lg transition-colors cursor-pointer shrink-0`}
            >
              <ChevronRight className={`w-3.5 h-3.5 ${!isFa ? 'rotate-180' : ''}`} />
            </button>
            <div className={`flex items-center gap-1 ${theme.isDark ? 'bg-black/25' : 'bg-slate-100'} px-1.5 sm:px-2 py-0.5 rounded-lg border ${theme.borderClass} backdrop-blur-xs whitespace-nowrap`}>
              <Clock className={`w-3.5 h-3.5 ${theme.isDark ? 'text-blue-300' : 'text-blue-600'} shrink-0`} />
              <span className="font-mono font-bold tracking-wider text-xs sm:text-sm">
                {isFa ? toPersianDigits(liveTime.slice(0, 5)) : liveTime.slice(0, 5)}
              </span>
              <span className="font-mono text-[10px] opacity-75 hidden @[280px]:inline">
                :{isFa ? toPersianDigits(liveTime.slice(6, 8)) : liveTime.slice(6, 8)}
              </span>
            </div>
            <button
              onClick={handleNextDay}
              title={isFa ? 'روز بعد' : 'Next Day'}
              className={`p-1 ${theme.buttonBgClass} rounded-lg transition-colors cursor-pointer shrink-0`}
            >
              <ChevronLeft className={`w-3.5 h-3.5 ${!isFa ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className="flex items-center gap-1 min-w-0 shrink">
            <span className={`text-[10px] sm:text-xs font-semibold tracking-wide ${theme.isDark ? 'bg-white/15' : 'bg-slate-200'} px-2 py-0.5 rounded-md truncate whitespace-nowrap`}>
              {dateInfo.persianWeekday}
            </span>
          </div>
        </div>

        {/* Dual Date Display (Shamsi & Gregorian) */}
        <div className={`grid grid-cols-2 gap-1.5 text-center my-1.5 p-1.5 sm:p-2 rounded-lg border ${theme.borderClass} ${theme.cardBgClass}`}>
          {/* Shamsi Date */}
          <div className={`border-e ${theme.borderClass} pe-1 min-w-0 flex flex-col justify-center`}>
            <div className={`text-[9px] @[280px]:text-[10px] ${theme.subtleTextClass} uppercase tracking-wider font-medium mb-0.5 truncate whitespace-nowrap`}>
              {isFa ? 'خورشیدی (شمسی)' : 'Solar Hijri'}
            </div>
            <div className="font-bold tracking-tight whitespace-nowrap flex items-center justify-center gap-0.5 text-[clamp(10px,3.8cqw,14px)]">
              <span className="font-mono">{isFa ? toPersianDigits(`${dateInfo.jy}/${dateInfo.jm}/${dateInfo.jd}`) : `${dateInfo.jy}/${dateInfo.jm}/${dateInfo.jd}`}</span>
              <span className={`text-[9px] @[260px]:text-[10px] ${theme.subtleTextClass} font-normal shrink-0`}>
                ({dateInfo.persianMonth})
              </span>
            </div>
          </div>

          {/* Gregorian Date */}
          <div className="ps-1 min-w-0 flex flex-col justify-center">
            <div className={`text-[9px] @[280px]:text-[10px] ${theme.subtleTextClass} uppercase tracking-wider font-medium mb-0.5 truncate whitespace-nowrap`}>
              {isFa ? 'میلادی' : 'Gregorian'}
            </div>
            <div className="font-bold tracking-tight whitespace-nowrap flex items-center justify-center gap-0.5 text-[clamp(10px,3.8cqw,14px)]">
              <span className="font-mono">{`${dateInfo.gy}/${dateInfo.gm}/${dateInfo.gd}`}</span>
              <span className={`text-[9px] @[260px]:text-[10px] ${theme.subtleTextClass} font-normal shrink-0`}>
                ({dateInfo.englishMonth.slice(0, 3)})
              </span>
            </div>
          </div>
        </div>

        {/* Tab switch between Note/Occasions vs Time-Blocking */}
        <div className="flex gap-1 mb-1.5 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-bold">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-0.5 rounded transition cursor-pointer ${
              activeTab === 'info' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs' : 'text-slate-500'
            }`}
          >
            {isFa ? 'نوت و مناسبت‌ها' : 'Note & Occasions'}
          </button>
          <button
            onClick={() => setActiveTab('timeblocking')}
            className={`flex-1 py-0.5 rounded transition cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'timeblocking' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs' : 'text-slate-500'
            }`}
          >
            <CalendarRange className="w-3 h-3" />
            <span>{isFa ? 'بلوک زمانی (Time Block)' : 'Time-Blocking'}</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'info' ? (
        <div className="space-y-1.5 text-xs flex-1 flex flex-col justify-between min-h-0">
          {/* Date-Associated Note */}
          <div className={`p-2 rounded-lg border ${theme.borderClass} ${theme.cardBgClass} shrink-0`}>
            <div className="flex items-center justify-between mb-1">
              <span className={`font-bold flex items-center gap-1 ${theme.subtleTextClass} text-[11px] truncate`}>
                <Edit3 className="w-3 h-3 shrink-0" />
                <span className="truncate">{isFa ? 'نوت مرتبط با تاریخ:' : 'Date Note:'}</span>
              </span>
              <button
                onClick={() => {
                  if (isEditingNote) {
                    handleSaveNote();
                  } else {
                    setIsEditingNote(true);
                  }
                }}
                className={`text-[10px] ${theme.buttonBgClass} px-1.5 py-0.5 rounded transition cursor-pointer flex items-center gap-1 shrink-0`}
              >
                {isEditingNote ? (
                  <>
                    <Check className="w-2.5 h-2.5" />
                    <span>{isFa ? 'ذخیره' : 'Save'}</span>
                  </>
                ) : (
                  <>
                    <Edit3 className="w-2.5 h-2.5" />
                    <span>{isFa ? 'ویرایش' : 'Edit'}</span>
                  </>
                )}
              </button>
            </div>

            {isEditingNote ? (
              <textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder={isFa ? 'یادداشت مربوط به تاریخ امروز...' : 'Enter notes for today...'}
                className={`w-full rounded p-1.5 text-[11px] focus:outline-none min-h-[45px] resize-none ${theme.inputClass}`}
                autoFocus
              />
            ) : (
              <p className={`leading-relaxed italic text-[11px] ${theme.isDark ? 'bg-black/15' : 'bg-slate-50'} p-1.5 rounded border ${theme.borderClass} line-clamp-3 break-words`}>
                {noteInput || (isFa ? '<یادداشت ثبت شده برای این تاریخ>' : '<Recorded note for this date>')}
              </p>
            )}
          </div>

          {/* Occasions / مناسبت‌ها */}
          <div className={`p-2 rounded-lg border ${theme.borderClass} ${theme.cardBgClass} flex-1 min-h-[60px] overflow-y-auto custom-scrollbar`}>
            <div className="font-bold flex items-center gap-1 mb-1 text-[11px]">
              <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="truncate">{isFa ? 'مناسبت‌های تقویم:' : 'Occasions:'}</span>
            </div>
            <div className="space-y-0.5">
              {occasions.map((occ, idx) => (
                <div
                  key={idx}
                  className="text-[11px] flex items-start gap-1 leading-tight"
                >
                  <span className="text-amber-400 shrink-0">•</span>
                  <span className="break-words">{isFa ? occ.fa : occ.en}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Time-Blocking Panel */
        <div className="flex-1 flex flex-col justify-between min-h-0 space-y-1.5">
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5 p-1">
            {todayBlocks.length === 0 ? (
              <div className="text-center py-4 text-[11px] text-slate-400">
                {isFa ? 'هیچ بلوک زمانی برای این تاریخ ثبت نشده است.' : 'No time-blocks scheduled for this day.'}
              </div>
            ) : (
              todayBlocks.map((block) => (
                <div
                  key={block.id}
                  className={`p-1.5 rounded-lg border flex items-center justify-between text-xs transition ${
                    block.completed
                      ? 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 text-slate-400 line-through'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <button
                      onClick={() => handleToggleBlock(block.id)}
                      className="cursor-pointer text-slate-400 hover:text-emerald-500 shrink-0"
                    >
                      <CheckCircle2 className={`w-3.5 h-3.5 ${block.completed ? 'text-emerald-500' : ''}`} />
                    </button>
                    <span className="font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400 shrink-0">
                      {isFa ? toPersianDigits(block.startTime) : block.startTime}
                    </span>
                    <span className="truncate text-slate-800 dark:text-slate-200 font-medium text-[11px]">
                      {block.title}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteBlock(block.id)}
                    className="text-slate-400 hover:text-red-500 p-0.5 cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Add Time-Block inline */}
          <div className="flex items-center gap-1 pt-1 border-t border-slate-200 dark:border-slate-800 shrink-0">
            <input
              type="time"
              value={newBlockTime}
              onChange={(e) => setNewBlockTime(e.target.value)}
              className="text-[10px] p-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 w-16"
            />
            <input
              type="text"
              placeholder={isFa ? 'عنوان جلسه یا بلوک کاری...' : 'Block title...'}
              value={newBlockTitle}
              onChange={(e) => setNewBlockTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddTimeBlock();
              }}
              className="flex-1 text-[11px] p-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
            <button
              onClick={handleAddTimeBlock}
              className="p-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs cursor-pointer shrink-0"
              title={isFa ? 'ثبت بلوک زمانی' : 'Add Time-block'}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
