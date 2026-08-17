import React, { createContext, useContext } from 'react';

export interface WidgetTheme {
  bgColor?: string;
  textColor?: string;
  isDark: boolean;
  isLight: boolean;
  accentColor: string;
  
  // Standard CSS class helpers
  borderClass: string;
  cardBgClass: string;
  cardHoverClass: string;
  subtleTextClass: string;
  mutedTextClass: string;
  highlightTextClass: string;
  buttonBgClass: string;
  buttonPrimaryClass: string;
  inputClass: string;
  headerAccentClass: string;
  badgeBgClass: string;
  activeTabClass: string;
  inactiveTabClass: string;
  pillClass: string;
  subtleBgClass: string;

  // CSS variables object for style attribute
  styleVars: React.CSSProperties;
}

export function isDarkBg(hexColor?: string): boolean {
  if (!hexColor || hexColor === 'transparent') return true;
  const hex = hexColor.trim().toLowerCase();
  if (hex === '#ffffff' || hex === '#fff' || hex === '#f8fafc' || hex === '#f1f5f9' || hex === '#f3f4f6' || hex === '#e2e8f0') {
    return false;
  }
  const c = hex.replace('#', '');
  if (c.length === 3) {
    const r = parseInt(c[0] + c[0], 16);
    const g = parseInt(c[1] + c[1], 16);
    const b = parseInt(c[2] + c[2], 16);
    return (r * 299 + g * 587 + b * 114) / 1000 < 165;
  }
  if (c.length === 6) {
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 < 165;
  }
  return true;
}

export function getWidgetTheme(bgColor?: string, textColor?: string, accentColor?: string): WidgetTheme {
  const isDark = isDarkBg(bgColor);
  const isLight = !isDark;
  const accent = accentColor || (isDark ? '#38bdf8' : '#0284c7');

  if (isDark) {
    return {
      bgColor: bgColor || '#0f172a',
      textColor: textColor || '#f8fafc',
      isDark: true,
      isLight: false,
      accentColor: accent,

      borderClass: 'border-white/15',
      cardBgClass: 'bg-white/[0.08] backdrop-blur-md text-white border-white/15 shadow-xs',
      cardHoverClass: 'hover:bg-white/[0.14] hover:border-white/25 transition-all',
      subtleTextClass: 'text-white/75',
      mutedTextClass: 'text-white/50',
      highlightTextClass: 'text-amber-300 font-bold',
      buttonBgClass: 'bg-white/15 hover:bg-white/25 active:bg-white/30 text-white transition-colors',
      buttonPrimaryClass: 'bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-white shadow-xs',
      inputClass: 'bg-black/35 border-white/20 text-white placeholder:text-white/40 focus:border-sky-400 focus:bg-black/50 focus:ring-1 focus:ring-sky-400/50',
      headerAccentClass: 'text-white/90',
      badgeBgClass: 'bg-white/15 text-white border border-white/10',
      activeTabClass: 'bg-white/25 text-white shadow-xs font-bold',
      inactiveTabClass: 'text-white/60 hover:text-white/90 hover:bg-white/10',
      pillClass: 'bg-white/10 text-white/90 border border-white/15 px-2 py-0.5 rounded-md text-xs',
      subtleBgClass: 'bg-white/[0.04]',

      styleVars: {
        '--widget-bg': bgColor || '#0f172a',
        '--widget-fg': textColor || '#f8fafc',
        '--widget-card-bg': 'rgba(255, 255, 255, 0.08)',
        '--widget-card-border': 'rgba(255, 255, 255, 0.15)',
        '--widget-accent': accent,
      } as React.CSSProperties,
    };
  }

  // Light theme
  return {
    bgColor: bgColor || '#ffffff',
    textColor: textColor || '#0f172a',
    isDark: false,
    isLight: true,
    accentColor: accent,

    borderClass: 'border-slate-200/90',
    cardBgClass: 'bg-white/85 text-slate-900 border-slate-200/90 shadow-xs backdrop-blur-md',
    cardHoverClass: 'hover:bg-white hover:border-slate-300 hover:shadow-sm transition-all',
    subtleTextClass: 'text-slate-600',
    mutedTextClass: 'text-slate-400',
    highlightTextClass: 'text-indigo-600 font-bold',
    buttonBgClass: 'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 transition-colors',
    buttonPrimaryClass: 'bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white shadow-xs',
    inputClass: 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30',
    headerAccentClass: 'text-slate-800',
    badgeBgClass: 'bg-slate-100 text-slate-700 border border-slate-200',
    activeTabClass: 'bg-white text-slate-900 shadow-xs font-bold border border-slate-200/60',
    inactiveTabClass: 'text-slate-500 hover:text-slate-800 hover:bg-slate-100',
    pillClass: 'bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md text-xs',
    subtleBgClass: 'bg-slate-50/80',

    styleVars: {
      '--widget-bg': bgColor || '#ffffff',
      '--widget-fg': textColor || '#0f172a',
      '--widget-card-bg': 'rgba(255, 255, 255, 0.85)',
      '--widget-card-border': 'rgba(226, 232, 240, 0.9)',
      '--widget-accent': accent,
    } as React.CSSProperties,
  };
}

const WidgetThemeContext = createContext<WidgetTheme>(getWidgetTheme('#0f172a', '#f8fafc'));

export const WidgetThemeProvider: React.FC<{
  bgColor?: string;
  textColor?: string;
  accentColor?: string;
  children: React.ReactNode;
}> = ({ bgColor, textColor, accentColor, children }) => {
  const theme = getWidgetTheme(bgColor, textColor, accentColor);
  return (
    <WidgetThemeContext.Provider value={theme}>
      {children}
    </WidgetThemeContext.Provider>
  );
};

export const useWidgetTheme = (): WidgetTheme => {
  return useContext(WidgetThemeContext);
};
