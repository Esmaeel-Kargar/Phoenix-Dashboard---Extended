import React, { useState, useEffect, useRef } from 'react';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  CheckCircle2,
  Coffee,
  Sparkles,
  Zap,
  ListTodo,
  Music,
  Flame,
} from 'lucide-react';
import { DayTask, Language, PomodoroSettings } from '../types';
import { toPersianDigits } from '../utils/jalali';
import { useWidgetTheme } from '../context/WidgetThemeContext';

interface PomodoroTimerWidgetProps {
  tasks: DayTask[];
  onUpdateTasks?: (tasks: DayTask[]) => void;
  language: Language;
  onAddLog?: (log: any) => void;
}

export const PomodoroTimerWidget: React.FC<PomodoroTimerWidgetProps> = ({
  tasks = [],
  onUpdateTasks,
  language,
  onAddLog,
}) => {
  const theme = useWidgetTheme();
  const isFa = language === 'fa';

  const [mode, setMode] = useState<'focus' | 'short_break' | 'long_break'>('focus');
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [completedCycles, setCompletedCycles] = useState<number>(0);
  const [ambientSound, setAmbientSound] = useState<'none' | 'rain' | 'whitenoise' | 'chime'>('none');
  const [isSoundPlaying, setIsSoundPlaying] = useState<boolean>(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);

  const DURATIONS = {
    focus: 25 * 60,
    short_break: 5 * 60,
    long_break: 15 * 60,
  };

  // Switch mode
  const handleSwitchMode = (newMode: 'focus' | 'short_break' | 'long_break') => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(DURATIONS[newMode]);
  };

  // Timer Tick
  useEffect(() => {
    let timer: any = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      handleTimerComplete();
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  // Play Bell Chime using Web Audio
  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1); // A5

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch (e) {
      console.log('Audio not supported or blocked:', e);
    }
  };

  // Web Audio Ambient Synthesizer
  const toggleAmbientSound = (type: 'none' | 'rain' | 'whitenoise' | 'chime') => {
    // Stop existing audio
    if (noiseNodeRef.current) {
      try {
        (noiseNodeRef.current as any).stop?.();
        noiseNodeRef.current.disconnect();
      } catch (e) {}
      noiseNodeRef.current = null;
    }

    if (type === 'none' || ambientSound === type) {
      setAmbientSound('none');
      setIsSoundPlaying(false);
      return;
    }

    setAmbientSound(type);
    setIsSoundPlaying(true);

    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Generate White / Pink Noise buffer
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (type === 'rain') {
          // Pink-ish filtered noise
          b0 = 0.99 * b0 + white * 0.05;
          output[i] = b0 * 0.8;
        } else {
          // Soft white noise
          output[i] = white * 0.15;
        }
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = type === 'rain' ? 'lowpass' : 'bandpass';
      filter.frequency.value = type === 'rain' ? 800 : 1200;

      const gain = ctx.createGain();
      gain.gain.value = 0.05;

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start();
      noiseNodeRef.current = whiteNoise;
    } catch (e) {
      console.log('Error starting ambient noise:', e);
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (noiseNodeRef.current) {
        try {
          (noiseNodeRef.current as any).stop?.();
          noiseNodeRef.current.disconnect();
        } catch (e) {}
      }
    };
  }, []);

  const handleTimerComplete = () => {
    setIsRunning(false);
    playChime();

    if (mode === 'focus') {
      const newCycles = completedCycles + 1;
      setCompletedCycles(newCycles);

      // Increment pomodoro count on selected task
      if (selectedTaskId && onUpdateTasks) {
        onUpdateTasks(
          tasks.map((t) =>
            t.id === selectedTaskId
              ? { ...t, pomodorosSpent: (t.pomodorosSpent || 0) + 1 }
              : t
          )
        );
      }

      if (onAddLog) {
        const taskName = tasks.find((t) => t.id === selectedTaskId)?.title || 'جلسه تمرکز عمومی';
        onAddLog({
          id: `log-pomo-${Date.now()}`,
          actorType: 'user',
          actorId: 'user-default',
          actorName: 'کاربر سیستم',
          authorizerType: 'direct_user',
          authorizerId: 'user-default',
          authorizerName: 'سیستم پومودورو',
          module: 'pomodoro',
          action: 'create',
          descriptionFa: `تکمیل ۲۵ دقیقه تمرکز عمیق روی "${taskName}" (سیکل ${newCycles})`,
          descriptionEn: `Completed 25min focus session on "${taskName}" (Cycle ${newCycles})`,
          timestamp: new Date().toISOString(),
          shamsiDate: '',
          status: 'success',
        });
      }

      // Next break
      if (newCycles % 4 === 0) {
        handleSwitchMode('long_break');
      } else {
        handleSwitchMode('short_break');
      }
    } else {
      // Break completed -> switch back to focus
      handleSwitchMode('focus');
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progressPercent = ((DURATIONS[mode] - timeLeft) / DURATIONS[mode]) * 100;

  const activeTask = tasks.find((t) => t.id === selectedTaskId);

  return (
    <div className="h-full flex flex-col justify-between select-text relative">
      {/* Top Header */}
      <div className={`flex items-center justify-between border-b ${theme.borderClass} pb-2.5 mb-2.5 shrink-0`}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Timer className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold tracking-tight">
              {isFa ? 'تایمر تمرکز عمیق و پومودورو' : 'Deep Focus & Pomodoro Timer'}
            </h2>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span>{isFa ? `تکمیل شده امروز: ${toPersianDigits(completedCycles)} پومودورو` : `Completed Today: ${completedCycles}`}</span>
            </div>
          </div>
        </div>

        {/* Ambient Sound Pills */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => toggleAmbientSound('rain')}
            className={`px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer ${
              ambientSound === 'rain'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
            title={isFa ? 'صدای باران ملایم (Ambient Rain)' : 'Gentle Rain'}
          >
            <Music className="w-3 h-3" />
            <span>{isFa ? 'باران' : 'Rain'}</span>
          </button>
          <button
            onClick={() => toggleAmbientSound('whitenoise')}
            className={`px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer ${
              ambientSound === 'whitenoise'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
            title={isFa ? 'صدای سفید تمرکز (White Noise)' : 'White Noise'}
          >
            <Zap className="w-3 h-3" />
            <span>{isFa ? 'نویز سفید' : 'Noise'}</span>
          </button>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900/50 rounded-xl border border-slate-800 mb-3 shrink-0">
        {[
          { key: 'focus' as const, labelFa: 'تمرکز (۲۵ د)', labelEn: 'Focus (25m)' },
          { key: 'short_break' as const, labelFa: 'استراحت کوتاه (۵ د)', labelEn: 'Short Break (5m)' },
          { key: 'long_break' as const, labelFa: 'استراحت طولانی (۱۵ د)', labelEn: 'Long Break (15m)' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleSwitchMode(tab.key)}
            className={`py-1 px-2 rounded-lg text-xs font-bold transition cursor-pointer text-center ${
              mode === tab.key
                ? tab.key === 'focus'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isFa ? tab.labelFa : tab.labelEn}
          </button>
        ))}
      </div>

      {/* Main Timer Display & Progress Ring */}
      <div className="flex-1 flex flex-col items-center justify-center p-3 relative">
        <div className="relative flex flex-col items-center justify-center">
          <div className="text-4xl sm:text-5xl font-black font-mono tracking-widest text-slate-100 drop-shadow-sm">
            {isFa ? toPersianDigits(formattedTime) : formattedTime}
          </div>

          <div className="w-48 sm:w-56 h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                mode === 'focus' ? 'bg-indigo-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition shadow-md cursor-pointer ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
            <span>{isRunning ? (isFa ? 'توقف موقت' : 'Pause') : (isFa ? 'شروع تمرکز' : 'Start')}</span>
          </button>

          <button
            onClick={() => {
              setIsRunning(false);
              setTimeLeft(DURATIONS[mode]);
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer border border-slate-700"
            title={isFa ? 'تنظیم مجدد' : 'Reset'}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Task Linker Section */}
      <div className="mt-2 pt-2 border-t border-slate-800/80 shrink-0">
        <div className="flex items-center gap-2">
          <ListTodo className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <select
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            className="flex-1 text-xs px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-hidden"
          >
            <option value="">
              {isFa ? '🎯 اختصاص این تمرکز به یک تسک از ماتریس هفتگی...' : '🎯 Link this focus session to a task...'}
            </option>
            {tasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.title} {task.completed ? '✓' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
