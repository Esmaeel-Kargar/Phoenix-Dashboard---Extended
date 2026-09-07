import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard,
  Globe,
  Sun,
  Moon,
  RotateCcw,
  Download,
  Upload,
  Search,
  Eye,
  EyeOff,
  Sparkles,
  Calendar,
  Plus,
  Layers,
  Settings,
  User,
  Database,
  Monitor,
  Tv,
  Maximize2,
  Sliders,
  SlidersHorizontal,
  FileDown,
  Palette,
  Image as ImageIcon,
  Check,
  LayoutGrid,
  Move,
  Grid,
  Sparkle,
  Smartphone,
} from 'lucide-react';
import {
  Language,
  ThemeMode,
  UserAccount,
  CanvasWidthMode,
  CanvasLayoutMode,
  CanvasOrientation,
  CanvasWallpaper,
} from '../types';
import {
  SYSTEM_THEMES,
  WALLPAPER_PRESETS,
  WallpaperPreset,
  getThemePreset,
} from '../utils/themePresets';

interface HeaderBarProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  onSyncAllWidgetsTheme: (theme: ThemeMode) => void;
  canvasLayoutMode: CanvasLayoutMode;
  onCanvasLayoutModeChange: (mode: CanvasLayoutMode) => void;
  canvasOrientation?: CanvasOrientation;
  onCanvasOrientationChange?: (orientation: CanvasOrientation) => void;
  canvasWallpaper?: CanvasWallpaper;
  onCanvasWallpaperChange: (wallpaper: CanvasWallpaper) => void;
  showCoordinateGrid?: boolean;
  onToggleCoordinateGrid: () => void;
  canvasWidthMode: CanvasWidthMode;
  onCanvasWidthModeChange: (mode: CanvasWidthMode) => void;
  onExpandRows?: (count?: number) => void;
  isPrivacyMode: boolean;
  onTogglePrivacy: () => void;
  onOpenSearch: () => void;
  onOpenAddWidget: () => void;
  onOpenSettings: () => void;
  onOpenAuth: () => void;
  onOpenExport?: () => void;
  currentUser?: UserAccount | null;
  onExport: () => void;
  onReset: () => void;
  useLiveDate: boolean;
  onToggleDateMode: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  language,
  onLanguageChange,
  theme,
  onThemeChange,
  onSyncAllWidgetsTheme,
  canvasLayoutMode,
  onCanvasLayoutModeChange,
  canvasOrientation = 'landscape',
  onCanvasOrientationChange,
  canvasWallpaper,
  onCanvasWallpaperChange,
  showCoordinateGrid = true,
  onToggleCoordinateGrid,
  canvasWidthMode,
  onCanvasWidthModeChange,
  onExpandRows,
  isPrivacyMode,
  onTogglePrivacy,
  onOpenSearch,
  onOpenAddWidget,
  onOpenSettings,
  onOpenAuth,
  onOpenExport,
  currentUser,
  onExport,
  onReset,
  useLiveDate,
  onToggleDateMode,
}) => {
  const isFa = language === 'fa';
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState<boolean>(false);
  const [isWallpaperMenuOpen, setIsWallpaperMenuOpen] = useState<boolean>(false);

  const themeMenuRef = useRef<HTMLDivElement>(null);
  const wallpaperMenuRef = useRef<HTMLDivElement>(null);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setIsThemeMenuOpen(false);
      }
      if (wallpaperMenuRef.current && !wallpaperMenuRef.current.contains(e.target as Node)) {
        setIsWallpaperMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentThemeObj = getThemePreset(theme);

  const canvasModes: {
    key: CanvasWidthMode;
    labelFa: string;
    labelEn: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    { key: 'standard', labelFa: 'کادر استاندارد (۱۴۴۰px)', labelEn: 'Standard (1440px)', icon: Monitor },
    { key: 'wide', labelFa: 'مانیتور عریض (۱۹۲۰px)', labelEn: 'Wide (1920px)', icon: Tv },
    { key: 'ultrawide', labelFa: 'فوق‌عریض (۲۵۶۰px)', labelEn: 'Ultrawide 2K (2560px)', icon: Maximize2 },
    { key: 'fluid', labelFa: 'بوم نامحدود فضایی (۱۰۰٪ لبه‌به‌لبه)', labelEn: 'Fluid Infinite Sci-Fi (100%)', icon: Sparkles },
  ];

  return (
    <header className="bg-slate-950/80 text-white backdrop-blur-2xl border-b border-white/10 sticky top-0 z-40 px-3 sm:px-4 py-2.5 transition-all shadow-md">
      <div
        className={`mx-auto flex items-center justify-between gap-2.5 sm:gap-3 ${
          canvasWidthMode === 'standard'
            ? 'max-w-[1440px]'
            : canvasWidthMode === 'wide'
            ? 'max-w-[1920px]'
            : canvasWidthMode === 'ultrawide'
            ? 'max-w-[2560px]'
            : 'max-w-none w-full'
        }`}
      >
        {/* Brand & Concept Title */}
        <div className="flex items-center gap-2.5 shrink-0 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0a84ff] via-[#5e5ce6] to-[#ff2d55] flex items-center justify-center text-white shadow-md font-extrabold text-sm shrink-0 border border-white/30">
            PD
          </div>
          <div className="min-w-0 max-w-[130px] sm:max-w-[200px] md:max-w-none">
            <h1 className="text-xs sm:text-sm md:text-base font-extrabold text-white tracking-tight flex items-center gap-1.5 leading-tight">
              <span className="truncate whitespace-nowrap">
                {isFa ? 'داشبورد ققنوس' : 'Phoenix Dashboard'}
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 hidden 2xl:block truncate whitespace-nowrap max-w-md">
              {isFa
                ? 'اتاق فرمان هوشمند سازمانی • بوم مختصاتی آزاد و مدیریت یکپارچه'
                : 'Executive Command HUD • Spatial Board & Unified Workspace'}
            </p>
          </div>
        </div>

        {/* Global Controls & Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 flex-wrap justify-end">
          {/* Tenant / User Account Button */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 text-slate-200 px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border border-white/10 shrink-0 backdrop-blur-md"
            title={isFa ? 'پایگاه داده و حساب کاربری هاست' : 'Host Tenant Database & User'}
          >
            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center text-[9px] font-bold shrink-0 shadow-xs">
              {currentUser ? currentUser.name.slice(0, 1) : 'U'}
            </div>
            <span className="hidden md:inline max-w-[80px] lg:max-w-[100px] truncate">
              {currentUser ? currentUser.name : (isFa ? 'کاربر' : 'User')}
            </span>
          </button>

          {/* Add Widget Button */}
          <button
            onClick={onOpenAddWidget}
            className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-90 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer shrink-0 border border-white/20"
            title={isFa ? 'کتابخانه ماژول‌ها و قالب‌های آماده' : 'Widget Catalog & Presets'}
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="hidden sm:inline">{isFa ? 'ویجت‌ها' : 'Widgets'}</span>
          </button>

          {/* UNIFIED CANVAS & DISPLAY SETTINGS MENU */}
          <div className="relative shrink-0" ref={wallpaperMenuRef}>
            <button
              onClick={() => {
                setIsWallpaperMenuOpen(!isWallpaperMenuOpen);
                setIsThemeMenuOpen(false);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border shrink-0 backdrop-blur-md ${
                isWallpaperMenuOpen
                  ? 'bg-sky-500/25 text-sky-300 border-sky-400/50 shadow-md ring-1 ring-sky-400/40'
                  : 'bg-white/10 hover:bg-white/15 text-slate-200 border-white/10'
              }`}
              title={isFa ? 'تنظیمات یکپارچه ابعاد نمایشگر، نوع چیدمان بوم و والپیپر' : 'Unified Canvas, Display & Wallpaper Settings'}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="hidden sm:inline text-[11px]">
                {isFa ? 'بوم و نمایشگر' : 'Canvas & Display'}
              </span>
              <span className="text-[10px] font-mono opacity-60 hidden md:inline">
                ({canvasLayoutMode === 'spatial-freeform' ? (isFa ? 'بوم آزاد' : 'Spatial') : (isFa ? 'شبکه' : 'Grid')})
              </span>
            </button>

            {isWallpaperMenuOpen && (
              <div
                className={`absolute top-full mt-2 z-50 w-80 sm:w-96 bg-slate-900/98 text-white border border-white/20 rounded-2xl shadow-2xl backdrop-blur-3xl p-3.5 space-y-3.5 animate-in fade-in zoom-in-95 ${
                  isFa ? 'left-0' : 'right-0'
                }`}
              >
                {/* Header title */}
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-2 font-extrabold text-xs text-sky-300">
                    <SlidersHorizontal className="w-4 h-4 text-sky-400" />
                    <span>{isFa ? 'تنظیمات یکپارچه بوم و نمایشگر' : 'Canvas & Display Settings'}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {canvasWidthMode.toUpperCase()}
                  </span>
                </div>

                {/* Section 1: Canvas Layout Architecture Mode */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 block flex items-center justify-between">
                    <span>{isFa ? '۱. معماری چیدمان بوم:' : '1. Canvas Layout Mode:'}</span>
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => onCanvasLayoutModeChange('spatial-freeform')}
                      className={`p-2.5 rounded-xl border text-start transition cursor-pointer flex flex-col gap-1 ${
                        canvasLayoutMode === 'spatial-freeform'
                          ? 'bg-sky-600/30 border-sky-400 text-white ring-1 ring-sky-400 shadow-sm'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <Move className="w-3.5 h-3.5 text-sky-400" />
                          <span>{isFa ? 'بوم آزاد مختصاتی' : 'Spatial Freeform'}</span>
                        </div>
                        {canvasLayoutMode === 'spatial-freeform' && (
                          <Check className="w-3.5 h-3.5 text-sky-400" />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        {isFa
                          ? 'جابجایی آزاد دو بعدی، فاصله‌گذاری و اسلات‌های مستقل مشابه اندروید'
                          : 'Android & Desktop style 2D coordinates with custom spacing'}
                      </p>
                    </button>

                    <button
                      onClick={() => onCanvasLayoutModeChange('smart-grid')}
                      className={`p-2.5 rounded-xl border text-start transition cursor-pointer flex flex-col gap-1 ${
                        canvasLayoutMode === 'smart-grid'
                          ? 'bg-sky-600/30 border-sky-400 text-white ring-1 ring-sky-400 shadow-sm'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <LayoutGrid className="w-3.5 h-3.5 text-sky-400" />
                          <span>{isFa ? 'شبکه ستونی خودکار' : 'Auto Flow Grid'}</span>
                        </div>
                        {canvasLayoutMode === 'smart-grid' && (
                          <Check className="w-3.5 h-3.5 text-sky-400" />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        {isFa
                          ? 'جریان خطی و پر کردن متوالی بدون فاصله خالی'
                          : 'Sequential auto-packing grid without empty gaps'}
                      </p>
                    </button>
                  </div>
                </div>

                {/* Section 2: Canvas Orientation (Landscape / Portrait) */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 block">
                    {isFa ? '۲. جهت‌گیری و چرخش صفحه (Orientation):' : '2. Canvas Orientation:'}
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => onCanvasOrientationChange?.('landscape')}
                      className={`p-2 rounded-xl border text-center transition cursor-pointer flex items-center justify-center gap-2 ${
                        canvasOrientation === 'landscape'
                          ? 'bg-sky-600/30 border-sky-400 text-white ring-1 ring-sky-400 shadow-xs'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Monitor className="w-3.5 h-3.5 text-sky-400" />
                      <span className="text-xs font-bold">
                        {isFa ? 'افقی (Landscape - ۱۲ ستون)' : 'Landscape (12 Cols)'}
                      </span>
                    </button>

                    <button
                      onClick={() => onCanvasOrientationChange?.('portrait')}
                      className={`p-2 rounded-xl border text-center transition cursor-pointer flex items-center justify-center gap-2 ${
                        canvasOrientation === 'portrait'
                          ? 'bg-sky-600/30 border-sky-400 text-white ring-1 ring-sky-400 shadow-xs'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs font-bold">
                        {isFa ? 'عمودی (Portrait - ۶ ستون)' : 'Portrait (6 Cols)'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Section 3: Display Width Modes & Presets */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-300 block">
                      {isFa ? '۳. نوع مانیتور و ابعاد نمایشگر:' : '3. Display / Screen Preset:'}
                    </label>
                    {onExpandRows && (
                      <button
                        onClick={() => onExpandRows(6)}
                        className="text-[10px] text-sky-300 hover:text-sky-100 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                        title={isFa ? 'افزودن ۶ سطر به بوم' : 'Expand Rows'}
                      >
                        <Plus className="w-3 h-3" />
                        <span>{isFa ? 'گسترش بینهایت (+۶ سطر)' : '+6 Rows'}</span>
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {canvasModes.map((mode) => {
                      const Icon = mode.icon;
                      const isCurrent = canvasWidthMode === mode.key;
                      return (
                        <button
                          key={mode.key}
                          onClick={() => onCanvasWidthModeChange(mode.key)}
                          className={`p-2 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
                            isCurrent
                              ? 'bg-indigo-600/40 border-indigo-400 text-white ring-1 ring-indigo-400 shadow-xs'
                              : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <Icon className="w-4 h-4 text-indigo-400" />
                          <span className="text-[10px] font-bold truncate">
                            {mode.key === 'standard'
                              ? (isFa ? 'استاندارد' : 'Std (1440)')
                              : mode.key === 'wide'
                              ? (isFa ? 'عریض' : 'Wide (1920)')
                              : mode.key === 'ultrawide'
                              ? (isFa ? 'فوق‌عریض' : 'Ultra (2560)')
                              : (isFa ? '۱۰۰٪ فضایی' : '100% Fluid')}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section 4: Canvas Wallpaper & Blueprint Grid */}
                <div className="space-y-2 border-t border-white/10 pt-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                      <span>{isFa ? '۴. طرح و والپیپر بوم:' : '4. Canvas Wallpaper & Grid:'}</span>
                    </label>

                    {/* Coordinate Grid Toggle */}
                    <button
                      onClick={onToggleCoordinateGrid}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                        showCoordinateGrid
                          ? 'bg-sky-600/30 border-sky-400 text-sky-200 shadow-xs'
                          : 'bg-white/5 border-white/10 text-slate-400'
                      }`}
                      title={isFa ? 'نمایش خطوط و نقاط راهنمای مختصات در بوم' : 'Toggle Coordinate Grid Points'}
                    >
                      <Grid className="w-3 h-3 text-sky-400" />
                      <span>{isFa ? (showCoordinateGrid ? 'گرید مختصات: فعال' : 'گرید: غیرفعال') : (showCoordinateGrid ? 'Grid: On' : 'Grid: Off')}</span>
                    </button>
                  </div>

                  {/* Wallpaper Selection Cards */}
                  <div className="grid grid-cols-2 gap-1.5 max-h-44 overflow-y-auto custom-scrollbar p-0.5">
                    {WALLPAPER_PRESETS.map((wp) => {
                      const isSelected = canvasWallpaper?.id === wp.id;
                      return (
                        <button
                          key={wp.id}
                          onClick={() => {
                            onCanvasWallpaperChange({
                              id: wp.id,
                              nameFa: wp.nameFa,
                              nameEn: wp.nameEn,
                              type: wp.type,
                              cssValue: wp.cssValue,
                              blur: wp.defaultBlur,
                              overlayDark: wp.defaultOverlayDark,
                              showGridLines: showCoordinateGrid,
                            });
                          }}
                          style={{ background: wp.previewColor }}
                          className={`p-2 rounded-xl text-start border transition-all cursor-pointer relative overflow-hidden group ${
                            isSelected
                              ? 'border-sky-400 ring-2 ring-sky-400/50 shadow-md'
                              : 'border-white/10 hover:border-white/30'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-white drop-shadow-sm truncate">
                              {isFa ? wp.nameFa.split('(')[0] : wp.nameEn}
                            </span>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Theme & System Palette Dropdown */}
          <div className="relative shrink-0" ref={themeMenuRef}>
            <button
              onClick={() => {
                setIsThemeMenuOpen(!isThemeMenuOpen);
                setIsWallpaperMenuOpen(false);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border shrink-0 backdrop-blur-md ${
                isThemeMenuOpen
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-400/40'
                  : 'bg-white/10 hover:bg-white/15 text-slate-200 border-white/10'
              }`}
              title={isFa ? 'انتخاب پالت و هماهنگ‌سازی تم ویجت‌ها' : 'System Theme & Widget Sync'}
            >
              <Palette className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="hidden sm:inline text-[11px]">{isFa ? 'پالت تم' : 'Theme'}</span>
            </button>

            {isThemeMenuOpen && (
              <div
                className={`absolute top-full mt-2 z-50 w-80 bg-slate-900/95 text-white border border-white/20 rounded-2xl shadow-2xl backdrop-blur-2xl p-3 space-y-3 animate-in fade-in zoom-in-95 ${
                  isFa ? 'left-0' : 'right-0'
                }`}
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-indigo-300">
                    <Palette className="w-4 h-4 text-indigo-400" />
                    <span>{isFa ? 'پالت‌های تم سیستم و ویجت‌ها' : 'System Theme Palettes'}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {isFa ? `${SYSTEM_THEMES.length} تم استاندارد` : `${SYSTEM_THEMES.length} Themes`}
                  </span>
                </div>

                {/* Quick Sync All Widgets Button */}
                <button
                  onClick={() => {
                    onSyncAllWidgetsTheme(theme);
                    setIsThemeMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:opacity-95 text-white rounded-xl text-xs font-extrabold shadow-sm transition cursor-pointer border border-white/20"
                >
                  <Sparkle className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span>{isFa ? 'اعمال تم انتخابی به تمام ویجت‌ها' : 'Sync All Widgets to System Theme'}</span>
                </button>

                {/* Theme List */}
                <div className="space-y-1 max-h-64 overflow-y-auto custom-scrollbar p-0.5">
                  {SYSTEM_THEMES.map((t) => {
                    const isCurrent = theme === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => {
                          onThemeChange(t.id);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl transition cursor-pointer border ${
                          isCurrent
                            ? 'bg-white/15 border-indigo-400 text-white font-bold ring-1 ring-indigo-400/50'
                            : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-5 h-5 rounded-lg bg-gradient-to-tr ${t.previewGradient} border border-white/30 shrink-0 shadow-xs`}
                          />
                          <div className="text-start min-w-0">
                            <div className="text-xs truncate">{isFa ? t.nameFa : t.nameEn}</div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[190px]">
                              {t.descriptionFa}
                            </div>
                          </div>
                        </div>
                        {isCurrent && <Check className="w-4 h-4 text-indigo-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Export & Report Modal Button */}
          {onOpenExport && (
            <button
              onClick={onOpenExport}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 text-slate-200 px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border border-white/10 shrink-0 backdrop-blur-md"
              title={isFa ? 'خروجی اکسل، کارنامه و چاپ PDF' : 'Reports, Export & Print'}
            >
              <FileDown className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="hidden xl:inline">{isFa ? 'کارنامه و خروجی' : 'Reports'}</span>
            </button>
          )}

          {/* Settings Menu Button */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 backdrop-blur-md"
            title={isFa ? 'منوی تنظیمات، ایجنت‌ها و دسترسی‌ها' : 'Settings & AI Agents Management'}
          >
            <Settings className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden lg:inline">{isFa ? 'تنظیمات' : 'Settings'}</span>
          </button>

          {/* Quick Search trigger */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-1 bg-white/10 hover:bg-white/15 text-slate-200 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs transition cursor-pointer border border-white/10 shrink-0 backdrop-blur-md"
            title={isFa ? 'جستجوی سراسری (Ctrl + K)' : 'Search (Ctrl + K)'}
          >
            <Search className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden xl:inline">{isFa ? 'جستجو...' : 'Search...'}</span>
          </button>

          {/* Simulation vs Current Date Mode Toggle */}
          <button
            onClick={onToggleDateMode}
            className={`flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-medium transition cursor-pointer border shrink-0 backdrop-blur-md ${
              useLiveDate
                ? 'bg-blue-500/20 text-blue-300 border-blue-400/40'
                : 'bg-amber-500/20 text-amber-300 border-amber-400/40'
            }`}
            title={isFa ? 'تغییر بین تاریخ طرح (۲۳ مرداد ۱۴۰۵) و تاریخ زنده سیستم' : 'Toggle between Diagram Date (Aug 14, 2026) and Real-time'}
          >
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden md:inline text-[11px]">
              {useLiveDate
                ? (isFa ? 'زنده' : 'Live')
                : (isFa ? '۱۴۰۵' : '1405')}
            </span>
          </button>

          {/* Privacy Toggle */}
          <button
            onClick={onTogglePrivacy}
            className="p-1.5 bg-white/10 hover:bg-white/15 text-slate-200 rounded-xl transition cursor-pointer shrink-0 border border-white/10 backdrop-blur-md"
            title={isPrivacyMode ? (isFa ? 'نمایش موجودی‌ها' : 'Show Balances') : (isFa ? 'مخفی‌سازی موجودی‌ها' : 'Hide Balances')}
          >
            {isPrivacyMode ? <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" /> : <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>

          {/* Language Switch */}
          <button
            onClick={() => onLanguageChange(isFa ? 'en' : 'fa')}
            className="flex items-center gap-1 px-2 py-1.5 bg-white/10 hover:bg-white/15 text-slate-200 rounded-xl text-xs font-bold transition cursor-pointer border border-white/10 shrink-0 backdrop-blur-md"
            title={isFa ? 'Switch to English' : 'تغییر به زبان فارسی'}
          >
            <Globe className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="text-[11px]">{isFa ? 'FA' : 'EN'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

