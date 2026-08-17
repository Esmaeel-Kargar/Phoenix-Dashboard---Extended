import { ThemeMode, WorkspaceWidgetConfig } from '../types';

export interface SystemThemeDefinition {
  id: ThemeMode;
  nameFa: string;
  nameEn: string;
  isDark: boolean;
  bgCanvas: string;
  headerBg: string;
  widgetBg: string;
  widgetText: string;
  accentColor: string;
  ringClass: string;
  borderClass: string;
  previewGradient: string;
  descriptionFa: string;
}

export interface WallpaperPreset {
  id: string;
  nameFa: string;
  nameEn: string;
  category: 'mesh' | 'geometric' | 'landscape' | 'minimal' | 'solid';
  type: 'gradient' | 'image' | 'pattern' | 'solid';
  cssValue: string;
  previewColor: string;
  defaultOverlayDark: number; // 0 to 0.9
  defaultBlur: number; // 0 to 30
}

export const SYSTEM_THEMES: SystemThemeDefinition[] = [
  {
    id: 'obsidian',
    nameFa: 'آبسیدین بلک (نیمه‌شب کریستالی)',
    nameEn: 'Obsidian Midnight',
    isDark: true,
    bgCanvas: '#06090e',
    headerBg: 'rgba(10, 15, 26, 0.75)',
    widgetBg: '#0b111e',
    widgetText: '#f1f5f9',
    accentColor: '#38bdf8',
    ringClass: 'ring-1 ring-sky-500/20',
    borderClass: 'border-white/10',
    previewGradient: 'from-[#0b111e] via-[#0e1726] to-[#0284c7]',
    descriptionFa: 'پالت دارک فوق‌العاده عمیق با رنگ مشکی آبسیدین و رینگ‌های کریستالی لاجوردی',
  },
  {
    id: 'titanium',
    nameFa: 'تیتانیوم مت (مینیمال مدرن)',
    nameEn: 'Titanium Matte Minimal',
    isDark: true,
    bgCanvas: '#0f141c',
    headerBg: 'rgba(19, 26, 38, 0.75)',
    widgetBg: '#131b27',
    widgetText: '#f8fafc',
    accentColor: '#818cf8',
    ringClass: 'ring-1 ring-white/10',
    borderClass: 'border-white/10',
    previewGradient: 'from-[#131b27] via-[#1a2332] to-[#6366f1]',
    descriptionFa: 'طراحی خنثی، بدون شلوغی با رینگ‌های تیتانیومی مت و کنتراست بالای مطالعه',
  },
  {
    id: 'emerald',
    nameFa: 'زمرد نئوکلاسیک (جنگل نیمه‌شب)',
    nameEn: 'Midnight Emerald',
    isDark: true,
    bgCanvas: '#050f0c',
    headerBg: 'rgba(7, 24, 19, 0.75)',
    widgetBg: '#091c16',
    widgetText: '#ecfdf5',
    accentColor: '#10b981',
    ringClass: 'ring-1 ring-emerald-500/20',
    borderClass: 'border-emerald-500/20',
    previewGradient: 'from-[#091c16] via-[#0d2a21] to-[#10b981]',
    descriptionFa: 'ترکیب لوکس و آرامش‌بخش سبز زمردی با رینگ‌های فیروزه‌ای تیره',
  },
  {
    id: 'sunset',
    nameFa: 'غروب کهربایی (برنز تیره)',
    nameEn: 'Amber Twilight',
    isDark: true,
    bgCanvas: '#0f0a06',
    headerBg: 'rgba(26, 17, 10, 0.75)',
    widgetBg: '#1c130b',
    widgetText: '#fffbeb',
    accentColor: '#f59e0b',
    ringClass: 'ring-1 ring-amber-500/20',
    borderClass: 'border-amber-500/20',
    previewGradient: 'from-[#1c130b] via-[#2a1c10] to-[#f59e0b]',
    descriptionFa: 'پالت گرم و لوکس با اکسنت‌های کهربایی، طلایی و برنز',
  },
  {
    id: 'cyber',
    nameFa: 'سایبرنتیک کربن (ماتریکس)',
    nameEn: 'Cyber Carbon',
    isDark: true,
    bgCanvas: '#020408',
    headerBg: 'rgba(4, 8, 16, 0.85)',
    widgetBg: '#050a14',
    widgetText: '#e2e8f0',
    accentColor: '#06b6d4',
    ringClass: 'ring-1 ring-cyan-500/30',
    borderClass: 'border-cyan-500/25',
    previewGradient: 'from-[#050a14] via-[#08152b] to-[#06b6d4]',
    descriptionFa: 'کربن مشکی خالص با هایلایت‌های آبی نئونی و رینگ‌های فناوری آینده',
  },
  {
    id: 'nordic',
    nameFa: 'سپیده‌دم نوردیک (روشن کریستالی)',
    nameEn: 'Nordic Daylight',
    isDark: false,
    bgCanvas: '#f1f5f9',
    headerBg: 'rgba(255, 255, 255, 0.85)',
    widgetBg: '#ffffff',
    widgetText: '#0f172a',
    accentColor: '#0284c7',
    ringClass: 'ring-1 ring-slate-200 shadow-sm',
    borderClass: 'border-slate-200/90',
    previewGradient: 'from-[#ffffff] via-[#f8fafc] to-[#0284c7]',
    descriptionFa: 'حالت روشن چشم‌نواز با سفید خالص، سایه‌های شیشه‌ای و رینگ‌های نقره‌ای',
  },
  {
    id: 'modern-dark',
    nameFa: 'حالت تیره استاندارد',
    nameEn: 'Standard Dark',
    isDark: true,
    bgCanvas: '#080c14',
    headerBg: 'rgba(15, 23, 42, 0.75)',
    widgetBg: '#0f172a',
    widgetText: '#f8fafc',
    accentColor: '#38bdf8',
    ringClass: 'ring-1 ring-white/10',
    borderClass: 'border-white/10',
    previewGradient: 'from-[#0f172a] via-[#1e293b] to-[#38bdf8]',
    descriptionFa: 'پالت تیره استاندارد مهندسی با رنگ‌های متعادل',
  },
  {
    id: 'modern-light',
    nameFa: 'حالت روشن استاندارد',
    nameEn: 'Standard Light',
    isDark: false,
    bgCanvas: '#f8fafc',
    headerBg: 'rgba(255, 255, 255, 0.85)',
    widgetBg: '#ffffff',
    widgetText: '#1e293b',
    accentColor: '#2563eb',
    ringClass: 'ring-1 ring-slate-200 shadow-sm',
    borderClass: 'border-slate-200',
    previewGradient: 'from-[#ffffff] via-[#f1f5f9] to-[#2563eb]',
    descriptionFa: 'پالت روشن ساده و خوانا با کنتراست بالا',
  },
  {
    id: 'classic',
    nameFa: 'کلاسیک سازمانی (اکسل / آفیس)',
    nameEn: 'Classic Enterprise',
    isDark: false,
    bgCanvas: '#eef2f6',
    headerBg: 'rgba(255, 255, 255, 0.9)',
    widgetBg: '#ffffff',
    widgetText: '#1e293b',
    accentColor: '#1d4ed8',
    ringClass: 'ring-1 ring-slate-300',
    borderClass: 'border-slate-300',
    previewGradient: 'from-[#ffffff] via-[#e2e8f0] to-[#1d4ed8]',
    descriptionFa: 'پالت کلاسیک اداری با پایداری رنگ و حاشیه‌های واضح',
  },
];

export const WALLPAPER_PRESETS: WallpaperPreset[] = [
  {
    id: 'cosmic-aurora',
    nameFa: 'شفق قطبی کیهانی (Cosmic Aurora)',
    nameEn: 'Cosmic Aurora Mesh',
    category: 'mesh',
    type: 'gradient',
    cssValue: 'radial-gradient(ellipse at 20% 20%, rgba(56, 189, 248, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(129, 140, 248, 0.18) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(168, 85, 247, 0.12) 0%, transparent 60%), #070a12',
    previewColor: '#1e1b4b',
    defaultOverlayDark: 0.2,
    defaultBlur: 0,
  },
  {
    id: 'geometric-grid',
    nameFa: 'شبکه مختصاتی نئوکربن (Obsidian Blueprint)',
    nameEn: 'Obsidian Blueprint Grid',
    category: 'geometric',
    type: 'pattern',
    cssValue: 'linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px), #080c14',
    previewColor: '#0f172a',
    defaultOverlayDark: 0.1,
    defaultBlur: 0,
  },
  {
    id: 'emerald-abyss',
    nameFa: 'اعماق زمردی (Deep Emerald Abyss)',
    nameEn: 'Deep Emerald Abyss',
    category: 'mesh',
    type: 'gradient',
    cssValue: 'radial-gradient(circle at 10% 20%, rgba(16, 185, 129, 0.16) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(5, 150, 105, 0.12) 0%, transparent 50%), #040c09',
    previewColor: '#064e3b',
    defaultOverlayDark: 0.15,
    defaultBlur: 0,
  },
  {
    id: 'warm-twilight',
    nameFa: 'غروب گرگ‌ومیش کهربا (Warm Amber Dusk)',
    nameEn: 'Warm Amber Dusk',
    category: 'mesh',
    type: 'gradient',
    cssValue: 'radial-gradient(circle at 75% 20%, rgba(245, 158, 11, 0.15) 0%, transparent 45%), radial-gradient(circle at 20% 80%, rgba(225, 29, 72, 0.12) 0%, transparent 50%), #0f0b07',
    previewColor: '#451a03',
    defaultOverlayDark: 0.2,
    defaultBlur: 0,
  },
  {
    id: 'cyber-circuit',
    nameFa: 'مدار سایبرنتیک بلک (Cyber Circuit)',
    nameEn: 'Cyber Circuit',
    category: 'geometric',
    type: 'pattern',
    cssValue: 'radial-gradient(rgba(6, 182, 212, 0.15) 1px, transparent 1px), #030712',
    previewColor: '#082f49',
    defaultOverlayDark: 0.05,
    defaultBlur: 0,
  },
  {
    id: 'minimal-slate-dots',
    nameFa: 'ماتریس نقطه‌ای مینیمال (Dot Matrix)',
    nameEn: 'Minimal Dot Matrix',
    category: 'minimal',
    type: 'pattern',
    cssValue: 'radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px), #0a0e17',
    previewColor: '#1e293b',
    defaultOverlayDark: 0.05,
    defaultBlur: 0,
  },
  {
    id: 'nordic-frost',
    nameFa: 'یخسار نوردیک (Nordic Frost Light)',
    nameEn: 'Nordic Frost Light',
    category: 'mesh',
    type: 'gradient',
    cssValue: 'radial-gradient(circle at 20% 20%, rgba(186, 230, 253, 0.7) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(224, 231, 255, 0.7) 0%, transparent 50%), #f1f5f9',
    previewColor: '#e0f2fe',
    defaultOverlayDark: 0,
    defaultBlur: 0,
  },
  {
    id: 'solid-obsidian',
    nameFa: 'مشکی خالص ضدحواس‌پرتی (Zero Distraction Dark)',
    nameEn: 'Zero Distraction Obsidian',
    category: 'solid',
    type: 'solid',
    cssValue: '#07090e',
    previewColor: '#07090e',
    defaultOverlayDark: 0,
    defaultBlur: 0,
  },
];

export function getThemePreset(themeId: ThemeMode): SystemThemeDefinition {
  const found = SYSTEM_THEMES.find((t) => t.id === themeId);
  return found || SYSTEM_THEMES[0];
}

export function syncAllWidgetsToTheme(
  themeId: ThemeMode,
  widgets: WorkspaceWidgetConfig[]
): WorkspaceWidgetConfig[] {
  const theme = getThemePreset(themeId);
  return widgets.map((w) => {
    return {
      ...w,
      customization: {
        ...w.customization,
        bgColor: theme.widgetBg,
        textColor: theme.widgetText,
        headerColor: theme.widgetBg,
      },
    };
  });
}
