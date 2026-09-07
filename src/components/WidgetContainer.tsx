import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronsUp,
  ChevronsDown,
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  Maximize2,
  Minimize2,
  Trash2,
  Palette,
  Pin,
  PinOff,
  GripVertical,
  X,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  MoveHorizontal,
  Move,
  Layers,
  Check,
  Globe,
} from 'lucide-react';
import { WorkspaceWidgetConfig, Language, WidgetCustomization } from '../types';
import { WidgetThemeProvider, isDarkBg } from '../context/WidgetThemeContext';

interface WidgetContainerProps {
  widget: WorkspaceWidgetConfig;
  children: React.ReactNode;
  onRemoveWidget: (id: string) => void;
  onUpdateWidget: (updatedWidget: WorkspaceWidgetConfig) => void;
  onApplyThemeToAll?: (customization: Partial<WidgetCustomization>) => void;
  onExpand: (id: string) => void;
  isExpanded?: boolean;
  onToggleFloat?: (id: string) => void;
  onMoveWidget?: (id: string, direction: 'prev' | 'next' | 'start' | 'end' | 'up' | 'down') => void;
  onDragStart?: (id: string, e: React.DragEvent) => void;
  onDragEnd?: () => void;
  language: Language;
  isDraggable?: boolean;
  isFloating?: boolean;
}

type ResizeDirection = 'e' | 'w' | 's' | 'n' | 'se' | 'sw' | 'ne' | 'nw';

const GAP_PX = 16;
const ROW_UNIT_PX = 230;

export const PRESET_PALETTES = [
  // 1. Crystal & Glass Palettes
  { id: 'crystal-dark', label: 'شیشه کریستالی تیره (Dark Crystal)', value: '#0f172a', text: '#f8fafc', accent: '#38bdf8', group: 'crystal' },
  { id: 'crystal-light', label: 'شیشه بلورین روشن (Frosted White)', value: '#ffffff', text: '#0f172a', accent: '#0284c7', group: 'crystal' },
  { id: 'titanium-obsidian', label: 'تیتانیوم فضایی آبسیدین (Titanium Obsidian)', value: '#18181b', text: '#f8fafc', accent: '#a1a1aa', group: 'crystal' },
  { id: 'deep-slate', label: 'دودی مات عمیق (Deep Slate)', value: '#1e293b', text: '#f1f5f9', accent: '#60a5fa', group: 'crystal' },

  // 2. Phoenix Cyber & Neon Palettes
  { id: 'phoenix-cyan', label: 'آبی اقیانوسی ققنوس (Phoenix Cyan Blue)', value: '#0284c7', text: '#ffffff', accent: '#38bdf8', group: 'cyber' },
  { id: 'neon-emerald', label: 'سبز نئون متالیک (Neon Emerald)', value: '#047857', text: '#ffffff', accent: '#34d399', group: 'cyber' },
  { id: 'cosmic-violet', label: 'بنفش کهکشانی سایبر (Cosmic Violet)', value: '#4338ca', text: '#ffffff', accent: '#818cf8', group: 'cyber' },
  { id: 'lava-amber', label: 'شعله نارنجی گدازه (Lava Amber)', value: '#c2410c', text: '#ffffff', accent: '#fb923c', group: 'cyber' },
  { id: 'ruby-crimson', label: 'یاقوتی درخشان ققنوس (Ruby Crimson)', value: '#be123c', text: '#ffffff', accent: '#fb7185', group: 'cyber' },
  { id: 'teal-cyberpunk', label: 'فیروزه‌ای سایبرپانک (Teal Cyberpunk)', value: '#0e7490', text: '#ffffff', accent: '#22d3ee', group: 'cyber' },

  // 3. Executive & Treasury Palettes
  { id: 'luxury-gold', label: 'طلایی متالیک لوکس (Luxury Champagne)', value: '#b45309', text: '#ffffff', accent: '#fcd34d', group: 'executive' },
  { id: 'royal-navy', label: 'لاجوردی سلطنتی (Royal Navy)', value: '#1e1b4b', text: '#e0e7ff', accent: '#a5b4fc', group: 'executive' },
  { id: 'treasury-velvet', label: 'زرشکی مخملی خزانه‌داری (Treasury Velvet)', value: '#881337', text: '#ffffff', accent: '#f43f5e', group: 'executive' },
  { id: 'growth-forest', label: 'سبز رشد پایدار (Growth Forest)', value: '#14532d', text: '#ffffff', accent: '#4ade80', group: 'executive' },
  { id: 'obsidian-velvet', label: 'مشکی کربن آبسیدین (Obsidian Velvet)', value: '#090d16', text: '#f1f5f9', accent: '#38bdf8', group: 'executive' },
  { id: 'azure-classic', label: 'آبی کلاسیک آفیس ۳۶۵ (Azure Classic)', value: '#1d4ed8', text: '#ffffff', accent: '#93c5fd', group: 'executive' },
];

export const WidgetContainer: React.FC<WidgetContainerProps> = ({
  widget,
  children,
  onRemoveWidget,
  onUpdateWidget,
  onApplyThemeToAll,
  onExpand,
  isExpanded = false,
  onToggleFloat,
  onMoveWidget,
  onDragStart,
  onDragEnd,
  language,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [themeAppliedToast, setThemeAppliedToast] = useState<string | null>(null);
  const isFa = language === 'fa';
  const menuRef = useRef<HTMLDivElement>(null);

  const custom = widget.customization || {};
  const bgColor = custom.bgColor || '#0f172a';
  const textColor = custom.textColor || '#f8fafc';
  const colSpan = custom.colSpan || 4;
  const rowSpan = custom.rowSpan || 1;
  const customHeightPx = custom.customHeightPx;
  const fontFamily = custom.fontFamily || 'vazir';
  const fontSize = custom.fontSize || 'md';
  const isFloating = custom.isFloating || false;

  const matchedPreset = PRESET_PALETTES.find((p) => p.value.toLowerCase() === bgColor.toLowerCase());
  const accentColor = matchedPreset?.accent || (isDarkBg(bgColor) ? '#38bdf8' : '#0284c7');

  const resolvedHeightPx = customHeightPx
    ? customHeightPx
    : rowSpan > 1
    ? rowSpan * ROW_UNIT_PX + (rowSpan - 1) * GAP_PX
    : undefined;

  const containerRef = useRef<HTMLDivElement>(null);
  const [activeResizeDir, setActiveResizeDir] = useState<ResizeDirection | null>(null);
  const [resizePreview, setResizePreview] = useState<{
    colSpan: number;
    rowSpan: number;
    liveWidthPx?: number;
    liveHeightPx?: number;
    snappedWidthPx?: number;
    snappedHeightPx?: number;
  } | null>(null);

  const resizeSession = useRef<{
    startMouseX: number;
    startMouseY: number;
    startWidth: number;
    startHeight: number;
    startColSpan: number;
    startRowSpan: number;
    singleColWidth: number;
    lastSnappedCol: number;
    lastSnappedRow: number;
    direction: ResizeDirection;
  } | null>(null);

  // Floating drag state
  const [isDraggingFloat, setIsDraggingFloat] = useState(false);
  const [floatPos, setFloatPos] = useState<{ x: number; y: number }>(
    custom.floatingPosition || { x: 24, y: 80 }
  );

  // Close 3-dots menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isMenuOpen]);

  const fontClass =
    fontFamily === 'mono'
      ? 'font-mono'
      : fontFamily === 'serif'
      ? 'font-serif'
      : fontFamily === 'system'
      ? 'font-sans'
      : 'font-sans';

  const sizeClass =
    fontSize === 'sm' ? 'text-xs' : fontSize === 'lg' ? 'text-base' : 'text-sm';

  // Start Resizing in any of the 8 directions
  const startResizing = (e: React.MouseEvent, dir: ResizeDirection) => {
    e.preventDefault();
    e.stopPropagation();
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const gridEl = (containerRef.current.closest('.grid') || containerRef.current.parentElement) as HTMLElement | null;
    const gridWidth = gridEl ? gridEl.clientWidth : (containerRef.current.parentElement?.clientWidth || window.innerWidth);
    const singleColWidth = Math.max(20, (gridWidth - 11 * GAP_PX) / 12);

    resizeSession.current = {
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startWidth: rect.width,
      startHeight: rect.height,
      startColSpan: colSpan,
      startRowSpan: rowSpan,
      singleColWidth,
      lastSnappedCol: colSpan,
      lastSnappedRow: rowSpan,
      direction: dir,
    };

    const initialSnappedWidth = colSpan * singleColWidth + (colSpan - 1) * GAP_PX;
    const initialSnappedHeight = resolvedHeightPx || rect.height;

    setResizePreview({
      colSpan,
      rowSpan,
      liveWidthPx: rect.width,
      liveHeightPx: rect.height,
      snappedWidthPx: initialSnappedWidth,
      snappedHeightPx: initialSnappedHeight,
    });
    setActiveResizeDir(dir);
  };

  // 8-Direction drag resize listener with strict fixed origin anchoring
  useEffect(() => {
    let animFrameId: number | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      const session = resizeSession.current;
      if (!session || !activeResizeDir) return;

      if (animFrameId) {
        cancelAnimationFrame(animFrameId);
      }

      animFrameId = requestAnimationFrame(() => {
        const deltaX = e.clientX - session.startMouseX;
        const deltaY = e.clientY - session.startMouseY;

        let effectiveDeltaX = 0;
        let effectiveDeltaY = 0;

        // Horizontal dimension handling (Pure screen coordinate physics, universal in RTL and LTR):
        // East handle (right edge): dragging mouse right (+deltaX) expands width
        // West handle (left edge): dragging mouse left (-deltaX) expands width
        if (session.direction.includes('e')) {
          effectiveDeltaX = deltaX;
        } else if (session.direction.includes('w')) {
          effectiveDeltaX = -deltaX;
        }

        // Vertical dimension handling:
        // South handle (bottom edge): dragging mouse down (+deltaY) expands height
        // North handle (top edge): dragging mouse up (-deltaY) expands height
        if (session.direction.includes('s')) {
          effectiveDeltaY = deltaY;
        } else if (session.direction.includes('n')) {
          effectiveDeltaY = -deltaY;
        }

        // Calculate live continuous dimensions
        const rawLiveWidth = Math.max(
          session.singleColWidth,
          session.startWidth + effectiveDeltaX
        );
        const rawLiveHeight = Math.max(120, session.startHeight + effectiveDeltaY);

        // Snap column width
        const rawSpan = (rawLiveWidth + GAP_PX) / (session.singleColWidth + GAP_PX);
        const snappedCol = Math.min(12, Math.max(2, Math.round(rawSpan)));

        // Snap row height
        const rawRows = (rawLiveHeight + GAP_PX) / (ROW_UNIT_PX + GAP_PX);
        const snappedRow = Math.min(6, Math.max(1, Math.round(rawRows)));

        const snappedWidthPx = snappedCol * session.singleColWidth + (snappedCol - 1) * GAP_PX;
        const snappedHeightPx = snappedRow * ROW_UNIT_PX + (snappedRow - 1) * GAP_PX;

        session.lastSnappedCol = snappedCol;
        session.lastSnappedRow = snappedRow;

        setResizePreview({
          colSpan: snappedCol,
          rowSpan: snappedRow,
          liveWidthPx: rawLiveWidth,
          liveHeightPx: rawLiveHeight,
          snappedWidthPx,
          snappedHeightPx,
        });
      });
    };

    const handleMouseUp = () => {
      const session = resizeSession.current;
      if (session && activeResizeDir) {
        const targetCol = session.lastSnappedCol;
        const targetRow = session.lastSnappedRow;
        const targetHeightPx = targetRow * ROW_UNIT_PX + (targetRow - 1) * GAP_PX;

        onUpdateWidget({
          ...widget,
          customization: {
            ...widget.customization,
            colSpan: targetCol,
            rowSpan: targetRow,
            customHeightPx: targetHeightPx,
          },
        });
      }

      if (animFrameId) {
        cancelAnimationFrame(animFrameId);
      }
      resizeSession.current = null;
      setActiveResizeDir(null);
      setResizePreview(null);
    };

    if (activeResizeDir) {
      window.addEventListener('mousemove', handleMouseMove, { passive: false });
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = `${activeResizeDir}-resize`;
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      if (animFrameId) {
        cancelAnimationFrame(animFrameId);
      }
    };
  }, [activeResizeDir, isFa, widget, onUpdateWidget]);

  // Floating Window dragging handler
  useEffect(() => {
    if (!isDraggingFloat) return;

    const handleFloatMove = (e: MouseEvent) => {
      setFloatPos((prev) => ({
        x: Math.max(10, Math.min(window.innerWidth - 300, prev.x + e.movementX)),
        y: Math.max(10, Math.min(window.innerHeight - 200, prev.y + e.movementY)),
      }));
    };

    const handleFloatUp = () => {
      setIsDraggingFloat(false);
      onUpdateWidget({
        ...widget,
        customization: {
          ...widget.customization,
          floatingPosition: floatPos,
        },
      });
    };

    window.addEventListener('mousemove', handleFloatMove);
    window.addEventListener('mouseup', handleFloatUp);

    return () => {
      window.removeEventListener('mousemove', handleFloatMove);
      window.removeEventListener('mouseup', handleFloatUp);
    };
  }, [isDraggingFloat, floatPos, widget, onUpdateWidget]);

  const floatingStyle: React.CSSProperties = isFloating
    ? {
        position: 'fixed',
        left: `${floatPos.x}px`,
        top: `${floatPos.y}px`,
        zIndex: 40,
        width: `${colSpan * 90 + 120}px`,
        minHeight: '260px',
        maxHeight: '80vh',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 20px rgba(56, 189, 248, 0.3)',
      }
    : resolvedHeightPx
    ? { height: `${resolvedHeightPx}px` }
    : {};

  const handleApplyPalette = (palette: typeof PRESET_PALETTES[0], applyToAll = false) => {
    if (applyToAll && onApplyThemeToAll) {
      onApplyThemeToAll({
        bgColor: palette.value,
        textColor: palette.text,
      });
      setThemeAppliedToast(isFa ? `تم "${palette.label.split('(')[0]}" روی تمام ویجت‌ها اعمال شد.` : `Applied theme to all widgets.`);
      setTimeout(() => setThemeAppliedToast(null), 3000);
    } else {
      onUpdateWidget({
        ...widget,
        customization: {
          ...widget.customization,
          bgColor: palette.value,
          textColor: palette.text,
        },
      });
    }
  };

  const isDark = isDarkBg(bgColor);
  const isAnyMenuOpen = isMenuOpen || isCustomizing;

  const currentGridPos = custom.gridPosition || { col: 1, row: 1 };

  return (
    <div
      ref={containerRef}
      id={`widget-box-${widget.id}`}
      style={{
        backgroundColor: bgColor,
        color: textColor,
        zIndex: isAnyMenuOpen ? 9999 : (isFloating ? 50 : 1),
        ...floatingStyle,
      }}
      className={`rounded-2xl border transition-all duration-150 flex flex-col justify-between relative select-none group/widget shadow-sm hover:shadow-2xl backdrop-blur-2xl ${fontClass} ${sizeClass} ${
        isAnyMenuOpen ? 'z-[9999] ring-2 ring-sky-400/80 shadow-2xl' : 'hover:z-20'
      } ${
        isFloating
          ? 'border-sky-400/80 ring-2 ring-sky-500/30'
          : isDark
          ? 'border-white/10 hover:border-white/25'
          : 'border-slate-200/90 hover:border-slate-300'
      } ${isExpanded ? 'h-full' : ''}`}
    >
      {/* Invisible backdrop to capture clicks and guarantee menu is top-most without overlap */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-[99990] bg-transparent cursor-default pointer-events-auto"
          onClick={(e) => {
            e.stopPropagation();
            setIsMenuOpen(false);
          }}
        />
      )}

      {/* Sleek Minimalist Widget Header (Only Title + Three Dots Menu) */}
      <div
        draggable={!isFloating && !isExpanded}
        onDragStart={(e) => {
          e.dataTransfer.setData('text/plain', widget.id);
          e.dataTransfer.effectAllowed = 'move';
          onDragStart?.(widget.id, e);
        }}
        onDragEnd={() => {
          onDragEnd?.();
        }}
        onMouseDown={() => {
          if (isFloating) {
            setIsDraggingFloat(true);
          }
        }}
        className={`flex items-center justify-between gap-2 px-3.5 py-2.5 border-b shrink-0 min-w-0 backdrop-blur-md rounded-t-2xl relative z-10 ${
          isDark
            ? 'border-white/10 bg-black/25'
            : 'border-slate-200/80 bg-white/40'
        } ${
          isFloating
            ? 'cursor-move'
            : 'cursor-grab active:cursor-grabbing hover:opacity-95 transition-opacity'
        }`}
        title={
          !isFloating
            ? (isFa ? 'برای جابجایی ویجت، این سربرگ را بکشید و رها کنید' : 'Drag header to move widget')
            : undefined
        }
      >
        {/* Title side */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div
            className="cursor-grab active:cursor-grabbing text-current opacity-40 group-hover/widget:opacity-80 transition shrink-0 p-0.5"
            title={isFa ? 'جابجایی موقعیت ویجت' : 'Drag'}
          >
            <GripVertical className="w-3.5 h-3.5" />
          </div>

          <h3
            className="font-bold text-xs sm:text-sm tracking-tight truncate flex-1 min-w-0"
            title={widget.customTitle || (isFa ? widget.titleFa : widget.title)}
          >
            {widget.customTitle || (isFa ? widget.titleFa : widget.title)}
          </h3>

          {/* Coordinate badge in spatial mode */}
          {custom.gridPosition && (
            <span
              className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-sky-300 opacity-60 group-hover/widget:opacity-100 transition shrink-0"
              title={isFa ? `مختصات: ستون ${custom.gridPosition.col}، سطر ${custom.gridPosition.row}` : `C${custom.gridPosition.col}:R${custom.gridPosition.row}`}
            >
              C{custom.gridPosition.col}:R{custom.gridPosition.row}
            </span>
          )}

          {isFloating && (
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping shrink-0" />
          )}
        </div>

        {/* Corner Three-Dots Menu Button */}
        <div className="relative shrink-0 z-[99995]" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            className={`p-1 rounded-lg transition cursor-pointer text-current relative z-[99996] ${
              isMenuOpen
                ? 'bg-sky-500 text-white shadow-md ring-2 ring-sky-300/60'
                : 'hover:bg-white/15 opacity-70 hover:opacity-100'
            }`}
            title={isFa ? 'منوی گزینه‌ها' : 'Options'}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {/* Frosted Glass Dropdown Popover with Top Stacking Context */}
          {isMenuOpen && (
            <div
              className={`absolute top-full mt-2 z-[99999] w-64 bg-slate-900/98 text-white border border-white/20 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_20px_rgba(56,189,248,0.25)] backdrop-blur-3xl p-2 space-y-1 animate-in fade-in zoom-in-95 pointer-events-auto ${
                isFa ? 'left-0' : 'right-0'
              }`}
              style={{ isolation: 'isolate' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Title */}
              <div className="px-2 py-1 border-b border-white/10 flex items-center justify-between text-[11px] font-bold text-slate-300">
                <span className="truncate">{widget.customTitle || (isFa ? widget.titleFa : widget.title)}</span>
                <span className="text-[9px] font-mono text-sky-400">
                  C{currentGridPos.col}:R{currentGridPos.row}
                </span>
              </div>

              {/* Customize Appearance */}
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsCustomizing(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/15 transition cursor-pointer"
              >
                <Palette className="w-3.5 h-3.5 text-amber-400" />
                <span>{isFa ? 'شخصی‌سازی رنگ، ابعاد و موقعیت' : 'Customize Theme & Size'}</span>
              </button>

              {/* Fullscreen */}
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onExpand(widget.id);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/15 transition cursor-pointer"
              >
                {isExpanded ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5 text-sky-400" />
                    <span>{isFa ? 'خروج از تمام‌صفحه' : 'Exit Fullscreen'}</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5 text-sky-400" />
                    <span>{isFa ? 'نمایش تمام‌صفحه' : 'Fullscreen'}</span>
                  </>
                )}
              </button>

              {/* Pin / Float */}
              {onToggleFloat && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onToggleFloat(widget.id);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/15 transition cursor-pointer"
                >
                  {isFloating ? (
                    <>
                      <PinOff className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{isFa ? 'جای‌گذاری در بوم' : 'Snap back to canvas'}</span>
                    </>
                  ) : (
                    <>
                      <Pin className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{isFa ? 'سنجاق و شناور روی صفحه' : 'Pin / Float on top'}</span>
                    </>
                  )}
                </button>
              )}

              {/* Free Spatial Direct Nudge / Coordinates (Android-style free placement) */}
              {!isFloating && (
                <div className="border-t border-white/10 pt-1.5 px-1 space-y-1.5">
                  <div className="text-[10px] text-sky-300 font-bold flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Move className="w-3 h-3 text-sky-400" />
                      {isFa ? 'جابجایی آزاد در بوم (اندرویدی):' : 'Free Spatial Move:'}
                    </span>
                    <span className="font-mono text-[9px] text-slate-400">
                      ({currentGridPos.col}, {currentGridPos.row})
                    </span>
                  </div>

                  {/* 4-Direction Spatial Nudge Buttons */}
                  <div className="grid grid-cols-4 gap-1">
                    {/* Move Left / Right depending on RTL */}
                    <button
                      onClick={() => {
                        const newCol = Math.max(1, currentGridPos.col - 1);
                        onUpdateWidget({
                          ...widget,
                          customization: {
                            ...widget.customization,
                            gridPosition: { ...currentGridPos, col: newCol },
                          },
                        });
                      }}
                      className="flex items-center justify-center p-1.5 bg-white/5 hover:bg-white/15 rounded-lg text-[10px] font-bold text-slate-300 hover:text-white transition cursor-pointer"
                      title={isFa ? 'یک ستون به قبل' : 'Nudge Left'}
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    {/* Move Up */}
                    <button
                      onClick={() => {
                        const newRow = Math.max(1, currentGridPos.row - 1);
                        onUpdateWidget({
                          ...widget,
                          customization: {
                            ...widget.customization,
                            gridPosition: { ...currentGridPos, row: newRow },
                          },
                        });
                      }}
                      className="flex items-center justify-center p-1.5 bg-white/5 hover:bg-white/15 rounded-lg text-[10px] font-bold text-slate-300 hover:text-white transition cursor-pointer"
                      title={isFa ? 'یک سطر به بالا' : 'Nudge Up'}
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>

                    {/* Move Down */}
                    <button
                      onClick={() => {
                        const newRow = currentGridPos.row + 1;
                        onUpdateWidget({
                          ...widget,
                          customization: {
                            ...widget.customization,
                            gridPosition: { ...currentGridPos, row: newRow },
                          },
                        });
                      }}
                      className="flex items-center justify-center p-1.5 bg-white/5 hover:bg-white/15 rounded-lg text-[10px] font-bold text-slate-300 hover:text-white transition cursor-pointer"
                      title={isFa ? 'یک سطر به پایین (ایجاد فضای خالی)' : 'Nudge Down (add gap)'}
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>

                    {/* Move Right / Left */}
                    <button
                      onClick={() => {
                        const newCol = Math.min(24, currentGridPos.col + 1);
                        onUpdateWidget({
                          ...widget,
                          customization: {
                            ...widget.customization,
                            gridPosition: { ...currentGridPos, col: newCol },
                          },
                        });
                      }}
                      className="flex items-center justify-center p-1.5 bg-white/5 hover:bg-white/15 rounded-lg text-[10px] font-bold text-slate-300 hover:text-white transition cursor-pointer"
                      title={isFa ? 'یک ستون به بعد' : 'Nudge Right'}
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Move Order in Grid */}
              {onMoveWidget && !isFloating && (
                <div className="border-t border-white/10 pt-1 mt-1 space-y-1">
                  <div className="text-[10px] text-slate-400 font-semibold px-1">
                    {isFa ? 'ترتیب چیدمان در صفحه:' : 'Sequential Order:'}
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    <button
                      onClick={() => onMoveWidget(widget.id, 'start')}
                      className="flex items-center justify-center p-1.5 bg-white/5 hover:bg-white/15 rounded-lg text-[11px] font-medium transition cursor-pointer text-slate-300 hover:text-white"
                      title={isFa ? 'انتقال به ابتدای صفحه' : 'Move to top'}
                    >
                      <ChevronsUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onMoveWidget(widget.id, 'prev')}
                      className="flex items-center justify-center p-1.5 bg-white/5 hover:bg-white/15 rounded-lg text-[11px] font-medium transition cursor-pointer text-slate-300 hover:text-white"
                      title={isFa ? 'یک خانه قبل' : 'Previous'}
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onMoveWidget(widget.id, 'next')}
                      className="flex items-center justify-center p-1.5 bg-white/5 hover:bg-white/15 rounded-lg text-[11px] font-medium transition cursor-pointer text-slate-300 hover:text-white"
                      title={isFa ? 'یک خانه بعد' : 'Next'}
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onMoveWidget(widget.id, 'end')}
                      className="flex items-center justify-center p-1.5 bg-white/5 hover:bg-white/15 rounded-lg text-[11px] font-medium transition cursor-pointer text-slate-300 hover:text-white"
                      title={isFa ? 'انتقال به انتهای صفحه' : 'Move to end'}
                    >
                      <ChevronsDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Remove Widget */}
              <div className="border-t border-white/10 pt-1 mt-1">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onRemoveWidget(widget.id);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-200 hover:bg-rose-500/20 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isFa ? 'حذف ویجت' : 'Remove Widget'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Embedded Drawer for Customization */}
      {isCustomizing && (
        <div className="p-3.5 bg-slate-950/90 backdrop-blur-2xl text-white text-xs border-b border-white/15 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between font-bold text-xs text-amber-300">
            <span className="flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-amber-400" />
              {isFa ? 'شخصی‌سازی استاندارد پالت رنگ و ابعاد ویجت' : 'Customize Standard Palette & Dimensions'}
            </span>
            <button
              onClick={() => setIsCustomizing(false)}
              className="p-1 hover:bg-white/20 rounded-lg cursor-pointer transition text-slate-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {themeAppliedToast && (
            <div className="p-2 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-emerald-300 text-[11px] flex items-center gap-1.5 animate-in fade-in">
              <Check className="w-3.5 h-3.5" />
              <span>{themeAppliedToast}</span>
            </div>
          )}

          <div className="space-y-2.5">
            {/* Color Palettes */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] text-slate-300 font-bold">
                  {isFa ? 'انتخاب تم و پالت رنگی استاندارد (۱۶ پالت شیشه‌ای ققنوس):' : 'Standard Color Palettes (16 Phoenix Themes):'}
                </label>
                {onApplyThemeToAll && matchedPreset && (
                  <button
                    onClick={() => handleApplyPalette(matchedPreset, true)}
                    className="text-[10px] text-sky-300 hover:text-sky-200 bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 px-2 py-0.5 rounded-md flex items-center gap-1 cursor-pointer transition"
                    title={isFa ? 'اعمال این رنگ به تمام ویجت‌های داشبورد' : 'Apply this color to all widgets'}
                  >
                    <Globe className="w-3 h-3" />
                    <span>{isFa ? 'اعمال به کل داشبورد' : 'Apply to all'}</span>
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {/* 1. Crystal & Glass */}
                <div className="bg-white/5 p-2 rounded-xl border border-white/10">
                  <span className="text-[9px] text-sky-300 font-bold block mb-1">
                    💎 {isFa ? 'پالت‌های کریستالی و شیشه‌ای:' : 'Crystal & Glass:'}
                  </span>
                  <div className="flex gap-1.5 flex-wrap">
                    {PRESET_PALETTES.filter((p) => p.group === 'crystal').map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleApplyPalette(p, false)}
                        style={{ backgroundColor: p.value }}
                        className={`w-6 h-6 rounded-lg border-2 shadow-md cursor-pointer hover:scale-115 transition ${
                          bgColor.toLowerCase() === p.value.toLowerCase()
                            ? 'border-amber-400 ring-2 ring-amber-400/50 scale-110'
                            : 'border-white/30'
                        }`}
                        title={p.label}
                      />
                    ))}
                  </div>
                </div>

                {/* 2. Cyber & Neon */}
                <div className="bg-white/5 p-2 rounded-xl border border-white/10">
                  <span className="text-[9px] text-emerald-300 font-bold block mb-1">
                    ⚡️ {isFa ? 'پالت‌های نئون و سایبر ققنوس:' : 'Phoenix Cyber & Neon:'}
                  </span>
                  <div className="flex gap-1.5 flex-wrap">
                    {PRESET_PALETTES.filter((p) => p.group === 'cyber').map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleApplyPalette(p, false)}
                        style={{ backgroundColor: p.value }}
                        className={`w-6 h-6 rounded-lg border-2 shadow-md cursor-pointer hover:scale-115 transition ${
                          bgColor.toLowerCase() === p.value.toLowerCase()
                            ? 'border-amber-400 ring-2 ring-amber-400/50 scale-110'
                            : 'border-white/30'
                        }`}
                        title={p.label}
                      />
                    ))}
                  </div>
                </div>

                {/* 3. Executive & Treasury */}
                <div className="bg-white/5 p-2 rounded-xl border border-white/10">
                  <span className="text-[9px] text-amber-300 font-bold block mb-1">
                    🏛 {isFa ? 'پالت‌های مدیریتی و خزانه‌داری:' : 'Executive & Treasury:'}
                  </span>
                  <div className="flex gap-1.5 flex-wrap">
                    {PRESET_PALETTES.filter((p) => p.group === 'executive').map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleApplyPalette(p, false)}
                        style={{ backgroundColor: p.value }}
                        className={`w-6 h-6 rounded-lg border-2 shadow-md cursor-pointer hover:scale-115 transition ${
                          bgColor.toLowerCase() === p.value.toLowerCase()
                            ? 'border-amber-400 ring-2 ring-amber-400/50 scale-110'
                            : 'border-white/30'
                        }`}
                        title={p.label}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Dimensions Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-white/15">
              {/* Font Family */}
              <div>
                <label className="text-[10px] text-slate-300 block mb-1">{isFa ? 'فونت محتوا:' : 'Font:'}</label>
                <select
                  value={fontFamily}
                  onChange={(e) =>
                    onUpdateWidget({
                      ...widget,
                      customization: {
                        ...widget.customization,
                        fontFamily: e.target.value as any,
                      },
                    })
                  }
                  className="w-full bg-black/50 border border-white/25 rounded-lg p-1.5 text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-sky-400"
                >
                  <option value="vazir">وزیرمتن (Vazirmatn)</option>
                  <option value="system">پیش‌فرض سیستم (Sans)</option>
                  <option value="mono">کد و مونو (Monospace)</option>
                  <option value="serif">سریف رسمی (Serif)</option>
                </select>
              </div>

              {/* Column Width Controls */}
              <div>
                <label className="text-[10px] text-slate-300 block mb-1">
                  {isFa ? `عرض ستون (${colSpan}/12):` : `Width (${colSpan}/12):`}
                </label>
                <div className="grid grid-cols-5 gap-1">
                  {[3, 4, 6, 8, 12].map((span) => (
                    <button
                      key={span}
                      onClick={() =>
                        onUpdateWidget({
                          ...widget,
                          customization: {
                            ...widget.customization,
                            colSpan: span,
                          },
                        })
                      }
                      className={`py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer text-center ${
                        colSpan === span
                          ? 'bg-sky-600 border-sky-400 text-white shadow-xs'
                          : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/20'
                      }`}
                    >
                      {span === 3 ? '25%' : span === 4 ? '33%' : span === 6 ? '50%' : span === 8 ? '66%' : '100%'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row Height Controls & Reset */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] text-slate-300 block">
                    {isFa ? `ارتفاع (${resolvedHeightPx ? `${resolvedHeightPx}px` : `${rowSpan}x`}):` : `Height:`}
                  </label>
                  {(customHeightPx || rowSpan > 1) && (
                    <button
                      onClick={() => {
                        const newCustom = { ...widget.customization, rowSpan: 1 };
                        delete newCustom.customHeightPx;
                        onUpdateWidget({ ...widget, customization: newCustom });
                      }}
                      className="text-[9px] text-amber-300 hover:underline cursor-pointer"
                    >
                      {isFa ? 'بازنشانی' : 'Reset'}
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {[1, 2, 3, 4].map((r) => {
                    const targetHeight = r * ROW_UNIT_PX + (r - 1) * GAP_PX;
                    const isCurrent = rowSpan === r || customHeightPx === targetHeight;
                    return (
                      <button
                        key={r}
                        onClick={() => {
                          const newCustom = {
                            ...widget.customization,
                            rowSpan: r,
                            customHeightPx: targetHeight,
                          };
                          onUpdateWidget({
                            ...widget,
                            customization: newCustom,
                          });
                        }}
                        className={`py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer text-center ${
                          isCurrent
                            ? 'bg-indigo-600 border-indigo-400 text-white shadow-xs'
                            : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/20'
                        }`}
                        title={isFa ? `ارتفاع ${r} سطری (${targetHeight}px)` : `${r} row(s) height (${targetHeight}px)`}
                      >
                        {r}x
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Spatial Freeform Coordinate Positioning Controls */}
            <div className="pt-2 border-t border-white/15">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-sky-300 font-bold flex items-center gap-1">
                  <Move className="w-3 h-3 text-sky-400" />
                  {isFa ? 'مختصات قرارگیری در بوم آزاد (ستون و سطر):' : 'Spatial Board Coordinates (Col & Row):'}
                </span>
                <span className="text-[9px] text-slate-400 font-mono">
                  ({currentGridPos.col},{currentGridPos.row})
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/5 p-2 rounded-xl border border-white/10 flex items-center justify-between">
                  <span className="text-[10px] text-slate-300 font-semibold">{isFa ? 'ستون:' : 'Column:'}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        const newCol = Math.max(1, currentGridPos.col - 1);
                        onUpdateWidget({
                          ...widget,
                          customization: {
                            ...widget.customization,
                            gridPosition: { ...currentGridPos, col: newCol },
                          },
                        });
                      }}
                      className="w-6 h-6 rounded-md bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center cursor-pointer text-xs"
                    >
                      -
                    </button>
                    <span className="text-xs font-mono font-bold text-sky-300 min-w-[20px] text-center">
                      {currentGridPos.col}
                    </span>
                    <button
                      onClick={() => {
                        const newCol = Math.min(12, currentGridPos.col + 1);
                        onUpdateWidget({
                          ...widget,
                          customization: {
                            ...widget.customization,
                            gridPosition: { ...currentGridPos, col: newCol },
                          },
                        });
                      }}
                      className="w-6 h-6 rounded-md bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center cursor-pointer text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="bg-white/5 p-2 rounded-xl border border-white/10 flex items-center justify-between">
                  <span className="text-[10px] text-slate-300 font-semibold">{isFa ? 'سطر:' : 'Row:'}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        const newRow = Math.max(1, currentGridPos.row - 1);
                        onUpdateWidget({
                          ...widget,
                          customization: {
                            ...widget.customization,
                            gridPosition: { ...currentGridPos, row: newRow },
                          },
                        });
                      }}
                      className="w-6 h-6 rounded-md bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center cursor-pointer text-xs"
                    >
                      -
                    </button>
                    <span className="text-xs font-mono font-bold text-indigo-300 min-w-[20px] text-center">
                      {currentGridPos.row}
                    </span>
                    <button
                      onClick={() => {
                        const newRow = currentGridPos.row + 1;
                        onUpdateWidget({
                          ...widget,
                          customization: {
                            ...widget.customization,
                            gridPosition: { ...currentGridPos, row: newRow },
                          },
                        });
                      }}
                      className="w-6 h-6 rounded-md bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center cursor-pointer text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Widget Main Body Content wrapped with Standardized Theme Provider */}
      <WidgetThemeProvider bgColor={bgColor} textColor={textColor} accentColor={accentColor}>
        <div className="p-3 sm:p-4 flex-1 overflow-auto custom-scrollbar min-h-0 flex flex-col">
          {children}
        </div>
      </WidgetThemeProvider>

      {/* Live Interactive Resizing Ghost Box & Feedback Overlay */}
      {resizePreview && (
        <>
          {/* Visual Interactive Ghost Silhouette fixed at the origin side */}
          <div
            style={{
              width: resizePreview.snappedWidthPx ? `${resizePreview.snappedWidthPx}px` : (resizePreview.liveWidthPx ? `${resizePreview.liveWidthPx}px` : '100%'),
              height: resizePreview.snappedHeightPx ? `${resizePreview.snappedHeightPx}px` : (resizePreview.liveHeightPx ? `${resizePreview.liveHeightPx}px` : '100%'),
              top: activeResizeDir?.includes('n') ? 'auto' : 0,
              bottom: activeResizeDir?.includes('n') ? 0 : 'auto',
              left: activeResizeDir?.includes('w') ? 'auto' : 0,
              right: activeResizeDir?.includes('w') ? 0 : 'auto',
            }}
            className="absolute z-50 pointer-events-none rounded-2xl border-2 border-dashed border-sky-400 bg-sky-500/15 shadow-[0_0_35px_rgba(56,189,248,0.4)] transition-all duration-75 flex flex-col justify-between p-3"
          >
            {/* Top corner live dimensions indicator */}
            <div className="flex items-center justify-between">
              <span className="bg-sky-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-lg shadow-md">
                {isFa ? `اسنپ عرض: ${resizePreview.colSpan} ستون` : `Width: ${resizePreview.colSpan} Cols`}
              </span>
              <span className="bg-indigo-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-lg shadow-md">
                {isFa ? `اسنپ ارتفاع: ${resizePreview.rowSpan} سطر` : `Height: ${resizePreview.rowSpan} Rows`}
              </span>
            </div>

            {/* Centered Size Badge */}
            <div className="self-center bg-slate-950/95 text-white px-4 py-2 rounded-xl shadow-2xl text-xs font-bold border border-sky-400/60 flex items-center gap-2 backdrop-blur-md">
              <span className="text-sky-300">
                {isFa ? 'ابعاد شبکه:' : 'Grid Snap:'}
              </span>
              <span className="font-mono bg-sky-600 px-2 py-0.5 rounded-md text-white font-bold">
                {resizePreview.colSpan}/12 ({Math.round((resizePreview.colSpan / 12) * 100)}%)
              </span>
              <span className="text-slate-400">×</span>
              <span className="font-mono bg-indigo-600 px-2 py-0.5 rounded-md text-white font-bold">
                {resizePreview.rowSpan}x ({Math.round(resizePreview.snappedHeightPx || resizePreview.liveHeightPx || 0)}px)
              </span>
            </div>

            {/* Bottom corner guide */}
            <div className="text-[10px] text-sky-200 font-medium text-center bg-black/60 py-0.5 px-2.5 rounded-lg mx-auto border border-white/10">
              {isFa ? 'رها کنید تا در موقعیت قفل شود' : 'Release mouse to lock size'}
            </div>
          </div>

          {/* Subtle backdrop blur over the resizing widget */}
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] rounded-2xl z-40 pointer-events-none transition-all" />
        </>
      )}

      {/* 4-Side & 4-Corner Resize Handles */}
      {!isExpanded && (
        <>
          {/* 1. Top Edge Handle (North) */}
          <div
            onMouseDown={(e) => startResizing(e, 'n')}
            className="absolute -top-1.5 left-4 right-4 h-3 cursor-ns-resize group/nhandle z-30 flex items-center justify-center"
            title={isFa ? 'تغییر ارتفاع از بالا' : 'Resize height from top'}
          >
            <div className="h-1.5 w-12 bg-sky-500/50 rounded-full opacity-0 group-hover/nhandle:opacity-100 group-hover/widget:opacity-30 transition-all shadow-sm" />
          </div>

          {/* 2. Bottom Edge Handle (South) */}
          <div
            onMouseDown={(e) => startResizing(e, 's')}
            className="absolute -bottom-1.5 left-4 right-4 h-3 cursor-ns-resize group/shandle z-30 flex items-center justify-center"
            title={isFa ? 'تغییر ارتفاع از پایین' : 'Resize height from bottom'}
          >
            <div className="h-1.5 w-12 bg-sky-500/50 rounded-full opacity-0 group-hover/shandle:opacity-100 group-hover/widget:opacity-30 transition-all shadow-sm" />
          </div>

          {/* 3. Left Edge Handle (West) */}
          <div
            onMouseDown={(e) => startResizing(e, 'w')}
            className="absolute -left-1.5 top-4 bottom-4 w-3 cursor-ew-resize group/whandle z-30 flex items-center justify-center"
            title={isFa ? 'تغییر عرض از چپ' : 'Resize width from left'}
          >
            <div className="w-1.5 h-12 bg-sky-500/50 rounded-full opacity-0 group-hover/whandle:opacity-100 group-hover/widget:opacity-30 transition-all shadow-sm" />
          </div>

          {/* 4. Right Edge Handle (East) */}
          <div
            onMouseDown={(e) => startResizing(e, 'e')}
            className="absolute -right-1.5 top-4 bottom-4 w-3 cursor-ew-resize group/ehandle z-30 flex items-center justify-center"
            title={isFa ? 'تغییر عرض از راست' : 'Resize width from right'}
          >
            <div className="w-1.5 h-12 bg-sky-500/50 rounded-full opacity-0 group-hover/ehandle:opacity-100 group-hover/widget:opacity-30 transition-all shadow-sm" />
          </div>

          {/* 5. Top-Left Corner (North-West) */}
          <div
            onMouseDown={(e) => startResizing(e, 'nw')}
            className="absolute -top-1.5 -left-1.5 w-5 h-5 cursor-nwse-resize group/nwhandle z-30 flex items-center justify-center"
            title={isFa ? 'تغییر ابعاد همزمان گوشه بالا-چپ' : 'Resize corner'}
          >
            <div className="w-2.5 h-2.5 bg-sky-400 rounded-full opacity-0 group-hover/nwhandle:opacity-100 group-hover/widget:opacity-50 transition-all shadow-md" />
          </div>

          {/* 6. Top-Right Corner (North-East) */}
          <div
            onMouseDown={(e) => startResizing(e, 'ne')}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 cursor-nesw-resize group/nehandle z-30 flex items-center justify-center"
            title={isFa ? 'تغییر ابعاد همزمان گوشه بالا-راست' : 'Resize corner'}
          >
            <div className="w-2.5 h-2.5 bg-sky-400 rounded-full opacity-0 group-hover/nehandle:opacity-100 group-hover/widget:opacity-50 transition-all shadow-md" />
          </div>

          {/* 7. Bottom-Left Corner (South-West) */}
          <div
            onMouseDown={(e) => startResizing(e, 'sw')}
            className="absolute -bottom-1.5 -left-1.5 w-5 h-5 cursor-nesw-resize group/swhandle z-30 flex items-center justify-center"
            title={isFa ? 'تغییر ابعاد همزمان گوشه پایین-چپ' : 'Resize corner'}
          >
            <div className="w-2.5 h-2.5 bg-sky-400 rounded-full opacity-0 group-hover/swhandle:opacity-100 group-hover/widget:opacity-50 transition-all shadow-md" />
          </div>

          {/* 8. Bottom-Right Corner (South-East) */}
          <div
            onMouseDown={(e) => startResizing(e, 'se')}
            className="absolute -bottom-1.5 -right-1.5 w-5 h-5 cursor-nwse-resize group/sehandle z-30 flex items-center justify-center"
            title={isFa ? 'تغییر ابعاد همزمان گوشه پایین-راست' : 'Resize corner'}
          >
            <div className="w-2.5 h-2.5 bg-sky-400 rounded-full opacity-0 group-hover/sehandle:opacity-100 group-hover/widget:opacity-50 transition-all shadow-md" />
          </div>
        </>
      )}
    </div>
  );
};
