import React, { useState, useRef } from 'react';
import {
  StickyNote,
  Mic,
  MicOff,
  Plus,
  Trash2,
  Send,
  Pin,
  Sparkles,
  ArrowUpRight,
  Target,
  FileText,
  Volume2,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { ScratchpadNote, DayTask, SeasonGoal, Language } from '../types';
import { toPersianDigits, getFormattedDateInfo } from '../utils/jalali';
import { useWidgetTheme } from '../context/WidgetThemeContext';

interface QuickScratchpadWidgetProps {
  notes: ScratchpadNote[];
  onUpdateNotes: (notes: ScratchpadNote[]) => void;
  tasks: DayTask[];
  onUpdateTasks: (tasks: DayTask[]) => void;
  seasonGoals: SeasonGoal[];
  onUpdateGoals: (goals: SeasonGoal[]) => void;
  language: Language;
  onAddLog?: (log: any) => void;
}

export const QuickScratchpadWidget: React.FC<QuickScratchpadWidgetProps> = ({
  notes = [],
  onUpdateNotes,
  tasks = [],
  onUpdateTasks,
  seasonGoals = [],
  onUpdateGoals,
  language,
  onAddLog,
}) => {
  const theme = useWidgetTheme();
  const isFa = language === 'fa';

  const [activeNoteId, setActiveNoteId] = useState<string>(notes[0]?.id || '');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  const activeNote = notes.find((n) => n.id === activeNoteId) || notes[0];

  const handleCreateNewNote = () => {
    const newNote: ScratchpadNote = {
      id: `note-${Date.now()}`,
      title: isFa ? `یادداشت جدید (${notes.length + 1})` : `New Scratchpad (${notes.length + 1})`,
      content: '',
      updatedAt: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      pinned: false,
    };
    onUpdateNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
  };

  const handleUpdateActiveNote = (updates: Partial<ScratchpadNote>) => {
    if (!activeNote) return;
    const updated = notes.map((n) =>
      n.id === activeNote.id
        ? {
            ...n,
            ...updates,
            updatedAt: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
          }
        : n
    );
    onUpdateNotes(updated);
  };

  const handleDeleteNote = (id: string) => {
    const filtered = notes.filter((n) => n.id !== id);
    onUpdateNotes(filtered);
    if (activeNoteId === id && filtered.length > 0) {
      setActiveNoteId(filtered[0].id);
    }
  };

  // Microphone Voice Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          handleUpdateActiveNote({
            audioDataUrl: base64Audio,
            isVoiceNote: true,
            durationSec: recordingSeconds,
            content:
              activeNote.content +
              (activeNote.content ? '\n\n' : '') +
              (isFa
                ? `🎙️ [ضبط صوت جدید - ${toPersianDigits(recordingSeconds)} ثانیه]`
                : `🎙️ [Voice Memo - ${recordingSeconds}s]`),
          });
        };
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      alert(isFa ? 'دسترسی به میکروفون میسر نشد.' : 'Microphone access denied.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerIntervalRef.current);
    }
  };

  // Convert Note to Today's Task
  const handleConvertToTask = () => {
    if (!activeNote || !activeNote.content.trim()) return;

    const firstLine = activeNote.content.split('\n')[0].replace(/^[#•\-\*\s]+/, '').slice(0, 80);
    const todayKey = getFormattedDateInfo(new Date()).dateKey;

    const newTask: DayTask = {
      id: `task-from-note-${Date.now()}`,
      dateKey: todayKey,
      title: firstLine || activeNote.title,
      completed: false,
      priority: 'high',
      timeEstimate: '30m',
    };

    onUpdateTasks([...tasks, newTask]);

    if (onAddLog) {
      onAddLog({
        id: `log-note-task-${Date.now()}`,
        actorType: 'user',
        actorId: 'user-default',
        actorName: 'کاربر سیستم',
        authorizerType: 'direct_user',
        authorizerId: 'user-default',
        authorizerName: 'یادداشت سریع',
        module: 'tasks',
        action: 'create',
        descriptionFa: `تبدیل یادداشت "${activeNote.title}" به تسک جدید در ماتریس روزانه`,
        descriptionEn: `Converted scratchpad "${activeNote.title}" to day task`,
        timestamp: new Date().toISOString(),
        shamsiDate: todayKey,
        status: 'success',
      });
    }

    alert(isFa ? 'یادداشت با موفقیت به تسک‌های امروز اضافه شد!' : 'Note sent to today tasks!');
  };

  // Convert Note to Season Goal
  const handleConvertToGoal = () => {
    if (!activeNote || !activeNote.content.trim()) return;

    const newGoal: SeasonGoal = {
      id: `goal-from-note-${Date.now()}`,
      title: activeNote.title,
      season: isFa ? 'تابستان ۱۴۰۵' : 'Summer 2026',
      progress: 0,
      completed: false,
      order: seasonGoals.length + 1,
      description: activeNote.content,
    };

    onUpdateGoals([...seasonGoals, newGoal]);
    alert(isFa ? 'یادداشت به عنوان هدف جدید فصلی ثبت شد!' : 'Goal created from note!');
  };

  return (
    <div className="h-full flex flex-col justify-between select-text relative">
      {/* Header bar */}
      <div className={`flex items-center justify-between border-b ${theme.borderClass} pb-2.5 mb-2.5 shrink-0`}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <StickyNote className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold tracking-tight">
              {isFa ? 'یادداشت سریع و ضبط صوت هوشمند' : 'Voice & Quick Scratchpad'}
            </h2>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span>{isFa ? `تعداد یادداشت‌ها: ${toPersianDigits(notes.length)}` : `Notes: ${notes.length}`}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
              isRecording
                ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-rose-500" />}
            <span>
              {isRecording
                ? `${isFa ? 'توقف' : 'Stop'} (${toPersianDigits(recordingSeconds)}s)`
                : isFa
                ? 'ضبط ویس'
                : 'Record Voice'}
            </span>
          </button>

          <button
            onClick={handleCreateNewNote}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1 transition shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isFa ? 'نوت جدید' : 'New Note'}</span>
          </button>
        </div>
      </div>

      {/* Note Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-2 mb-2 shrink-0">
        {notes.map((n) => (
          <button
            key={n.id}
            onClick={() => setActiveNoteId(n.id)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 flex items-center gap-1.5 transition cursor-pointer ${
              activeNote?.id === n.id
                ? 'bg-amber-500 text-white shadow-xs font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            {n.isVoiceNote && <Mic className="w-3 h-3 text-rose-400 shrink-0" />}
            <span className="truncate max-w-[100px]">{n.title}</span>
          </button>
        ))}
      </div>

      {/* Active Note Editor */}
      {activeNote ? (
        <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl p-2.5 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <input
              type="text"
              value={activeNote.title}
              onChange={(e) => handleUpdateActiveNote({ title: e.target.value })}
              className="font-bold text-xs sm:text-sm bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-amber-500 focus:outline-hidden text-slate-800 dark:text-slate-100 w-2/3"
            />
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <Clock className="w-3 h-3" />
              <span>{activeNote.updatedAt}</span>
              <button
                onClick={() => handleDeleteNote(activeNote.id)}
                className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                title={isFa ? 'حذف این یادداشت' : 'Delete note'}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <textarea
            value={activeNote.content}
            onChange={(e) => handleUpdateActiveNote({ content: e.target.value })}
            placeholder={
              isFa
                ? 'یادداشت سریع، ایده، چک‌لیست یا متن تبدیل شده از ویس...'
                : 'Type your scratchpad note, thoughts, ideas...'
            }
            className="flex-1 w-full bg-transparent resize-none text-xs leading-relaxed text-slate-800 dark:text-slate-200 focus:outline-hidden custom-scrollbar"
          />

          {/* Voice Player if note contains audio */}
          {activeNote.audioDataUrl && (
            <div className="mt-2 p-2 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400">
                <Volume2 className="w-4 h-4" />
                <span>{isFa ? 'پخش پیام صوتی ضبط شده' : 'Audio Memo'}</span>
              </div>
              <audio src={activeNote.audioDataUrl} controls className="h-7 w-48" />
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
          {isFa ? 'هیچ یادداشتی وجود ندارد.' : 'No notes selected.'}
        </div>
      )}

      {/* Action Footer: Convert to Task or Goal */}
      <div className={`mt-2 pt-2 border-t ${theme.borderClass} flex items-center justify-between text-[11px] shrink-0`}>
        <div className="flex items-center gap-2">
          <button
            onClick={handleConvertToTask}
            disabled={!activeNote}
            className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-500/30 hover:bg-blue-100 flex items-center gap-1 cursor-pointer disabled:opacity-50 font-medium"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{isFa ? 'تبدیل به تسک امروز' : 'Convert to Task'}</span>
          </button>

          <button
            onClick={handleConvertToGoal}
            disabled={!activeNote}
            className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-100 flex items-center gap-1 cursor-pointer disabled:opacity-50 font-medium"
          >
            <Target className="w-3.5 h-3.5" />
            <span>{isFa ? 'تبدیل به هدف فصل' : 'Send to Season Goal'}</span>
          </button>
        </div>

        <span className="text-[10px] text-slate-400">
          {isFa ? 'ذخیره‌سازی آنی و خودکار' : 'Auto-saved'}
        </span>
      </div>
    </div>
  );
};
