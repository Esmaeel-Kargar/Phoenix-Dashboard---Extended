import React, { useEffect, useState } from 'react';
import {
  X,
  Minimize2,
  Maximize,
  Sparkles,
  Palette,
  Columns,
  Type,
  LayoutGrid,
  Laptop,
  Check,
  ChevronDown,
} from 'lucide-react';
import { WorkspaceWidgetConfig, Language } from '../types';
import { WidgetThemeProvider } from '../context/WidgetThemeContext';

interface WidgetExpandedModalProps {
  widget: WorkspaceWidgetConfig | null;
  language: Language;
  onClose: () => void;
  onUpdateWidget: (updated: WorkspaceWidgetConfig) => void;
  children: React.ReactNode;
}

export const WidgetExpandedModal: React.FC<WidgetExpandedModalProps> = ({
  widget,
  language,
  onClose,
  onUpdateWidget,
  children,
}) => {
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);

  // Sync native fullscreen state
  useEffect(() => {
    const handleFsChange = () => {
      setIsNativeFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Keyboard shortcut listeners (Esc to close, F for OS fullscreen)
  useEffect(() => {
    if (!widget) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
        onClose();
      } else if ((e.key === 'f' || e.key === 'F') && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        toggleNativeFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [widget, onClose]);

  if (!widget) return null;

  const isFa = language === 'fa';
  const custom = widget.customization || {};
  const bgColor = custom.bgColor || '';
  const textColor = custom.textColor || '';

  const toggleNativeFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const presetThemes = [
    { label: isFa ? 'روشن مینیمال' : 'Light Clean', bg: '#ffffff', text: '#0f172a' },
    { label: isFa ? 'تیره مدرن' : 'Dark Slate', bg: '#0f172a', text: '#f8fafc' },
    { label: isFa ? 'آبی نیلگون' : 'Navy Indigo', bg: '#1e1b4b', text: '#e0e7ff' },
    { label: isFa ? 'زمردی تیره' : 'Emerald Night', bg: '#064e3b', text: '#d1fae5' },
    { label: isFa ? 'کهربایی دنج' : 'Warm Amber', bg: '#451a03', text: '#fef3c7' },
  ];

  return (
    <div
      id="widget-fullscreen-viewport"
      className="fixed inset-0 z-[99999] w-screen h-screen flex flex-col overflow-hidden bg-slate-950 text-slate-100 animate-in fade-in zoom-in-[0.99] duration-150"
    >
      {/* Edge-to-Edge Fullscreen Canvas */}
      <div
        style={{
          backgroundColor: bgColor || undefined,
          color: textColor || undefined,
        }}
        className={`w-full h-full flex flex-col flex-1 overflow-hidden select-text ${
          !bgColor ? 'bg-slate-900 text-slate-100' : ''
        }`}
      >
        {/* Fullscreen Master Command Header */}
        <header className="px-4 sm:px-6 py-3 border-b border-black/10 dark:border-white/10 bg-black/15 backdrop-blur-md shrink-0 flex items-center justify-between gap-4 z-20">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 shadow-inner">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-black tracking-tight truncate">
                  {widget.customTitle || (isFa ? widget.titleFa : widget.title)}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
                  {isFa ? 'نمایش تمام‌صفحه فراگیر' : 'Immersive Fullscreen'}
                </span>
              </div>
              <p className="text-[11px] opacity-75 hidden sm:block truncate">
                {isFa
                  ? 'تسلط کامل بر تمام ابعاد، داده‌ها، تنظیمات و جزئیات ماژول بدون محدودیت کادر'
                  : 'Full edge-to-edge canvas with complete data controls & tools'}
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Customization Toggle */}
            <button
              onClick={() => setShowToolbar(!showToolbar)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                showToolbar
                  ? 'bg-indigo-600 border-indigo-400 text-white shadow-md'
                  : 'bg-white/10 hover:bg-white/20 border-white/15 text-current'
              }`}
              title={isFa ? 'شخصی‌سازی ظاهر تمام‌صفحه' : 'Customize theme & appearance'}
            >
              <Palette className="w-4 h-4" />
              <span className="hidden md:inline">{isFa ? 'قالب' : 'Theme'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showToolbar ? 'rotate-180' : ''}`} />
            </button>

            {/* Native OS Fullscreen Toggle */}
            <button
              onClick={toggleNativeFullscreen}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-current text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title={isFa ? 'کلید میانبر: F (حذف نوار مرورگر)' : 'Shortcut: F (Toggle OS Fullscreen)'}
            >
              {isNativeFullscreen ? <Minimize2 className="w-4 h-4 text-amber-400" /> : <Maximize className="w-4 h-4" />}
              <span className="hidden sm:inline">
                {isNativeFullscreen ? (isFa ? 'خروج از F11' : 'Exit OS Fullscreen') : (isFa ? 'تمام‌صفحه مرورگر' : 'OS Fullscreen')}
              </span>
            </button>

            {/* Close / Return Button */}
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-600/20 transition cursor-pointer active:scale-95"
              title={isFa ? 'کلید میانبر: Esc' : 'Shortcut: Esc'}
            >
              <Minimize2 className="w-4 h-4" />
              <span>{isFa ? 'بستن (Esc)' : 'Minimize (Esc)'}</span>
            </button>
          </div>
        </header>

        {/* Quick Toolbar (Collapsible) */}
        {showToolbar && (
          <div className="px-6 py-3 border-b border-black/10 dark:border-white/10 bg-black/30 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4 animate-in slide-in-from-top-2 duration-150 shrink-0 z-10">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold opacity-80 flex items-center gap-1">
                <Palette className="w-3.5 h-3.5" />
                {isFa ? 'انتخاب پالت رنگی تمام‌صفحه:' : 'Fullscreen Palette:'}
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {presetThemes.map((t, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onUpdateWidget({
                        ...widget,
                        customization: {
                          ...widget.customization,
                          bgColor: t.bg,
                          textColor: t.text,
                        },
                      });
                    }}
                    style={{ backgroundColor: t.bg, color: t.text }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition cursor-pointer flex items-center gap-1 ${
                      custom.bgColor === t.bg ? 'border-amber-400 shadow-md ring-2 ring-amber-400/40' : 'border-white/20'
                    }`}
                  >
                    {custom.bgColor === t.bg && <Check className="w-3 h-3 text-amber-400" />}
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const newCustom = { ...widget.customization };
                  delete newCustom.bgColor;
                  delete newCustom.textColor;
                  onUpdateWidget({ ...widget, customization: newCustom });
                }}
                className="text-xs text-amber-300 hover:underline cursor-pointer"
              >
                {isFa ? 'بازنشانی به تم پیش‌فرض' : 'Reset to Default'}
              </button>
            </div>
          </div>
        )}

        {/* Full Viewport Scrollable & Responsive Work Area */}
        <main className="flex-1 w-full h-full overflow-y-auto overflow-x-hidden p-3 sm:p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-[1700px] mx-auto w-full h-full flex flex-col">
            <WidgetThemeProvider bgColor={bgColor} textColor={textColor}>
              {children}
            </WidgetThemeProvider>
          </div>
        </main>
      </div>
    </div>
  );
};
