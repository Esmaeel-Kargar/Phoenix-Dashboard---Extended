import React, { useState } from 'react';
import {
  WorkspaceWidgetConfig,
  Language,
  CanvasLayoutMode,
  CanvasOrientation,
  CanvasWallpaper,
  CanvasWidthMode,
  WidgetCustomization,
} from '../types';
import { WidgetContainer } from './WidgetContainer';
import {
  Move,
  Grid,
  Sparkles,
  Pin,
  Plus,
  ArrowDown,
  ArrowUp,
  Maximize2,
  Minimize2,
  Sliders,
  RotateCw,
  LayoutGrid,
} from 'lucide-react';

interface SpatialCanvasProps {
  widgets: WorkspaceWidgetConfig[];
  language: Language;
  layoutMode: CanvasLayoutMode;
  canvasOrientation?: CanvasOrientation;
  wallpaper?: CanvasWallpaper;
  showCoordinateGrid?: boolean;
  canvasWidthMode: CanvasWidthMode;
  canvasRowsCount?: number;
  canvasColsCount?: number;
  draggedWidgetId: string | null;
  dragOverWidgetId: string | null;
  onUpdateWidget: (
    widgetIdOrConfig: string | WorkspaceWidgetConfig,
    updates?: Partial<WorkspaceWidgetConfig>
  ) => void;
  onApplyThemeToAll: (customization: Partial<WidgetCustomization>) => void;
  onRemoveWidget: (widgetId: string) => void;
  onExpandWidget: (widgetId: string) => void;
  onToggleFloat: (widgetId: string) => void;
  onMoveWidget: (
    widgetId: string,
    direction: 'prev' | 'next' | 'start' | 'end' | 'up' | 'down'
  ) => void;
  onSetWidgetPosition: (widgetId: string, col: number, row: number) => void;
  onDragStart: (widgetId: string) => void;
  onDragEnd: () => void;
  onDragOverCard: (e: React.DragEvent, targetWidgetId: string) => void;
  onDropOnCard: (e: React.DragEvent, targetWidgetId: string) => void;
  onExpandRows?: (count?: number) => void;
  onCanvasOrientationChange?: (orientation: CanvasOrientation) => void;
  renderWidgetContent: (widget: WorkspaceWidgetConfig) => React.ReactNode;
}

export const SpatialCanvas: React.FC<SpatialCanvasProps> = ({
  widgets,
  language,
  layoutMode,
  canvasOrientation = 'landscape',
  wallpaper,
  showCoordinateGrid = true,
  canvasWidthMode,
  canvasRowsCount = 24,
  canvasColsCount,
  draggedWidgetId,
  dragOverWidgetId,
  onUpdateWidget,
  onApplyThemeToAll,
  onRemoveWidget,
  onExpandWidget,
  onToggleFloat,
  onMoveWidget,
  onSetWidgetPosition,
  onDragStart,
  onDragEnd,
  onDragOverCard,
  onDropOnCard,
  onExpandRows,
  onCanvasOrientationChange,
  renderWidgetContent,
}) => {
  const isFa = language === 'fa';
  const isSpatial = layoutMode === 'spatial-freeform';
  const isPortrait = canvasOrientation === 'portrait';

  const [hoveredDropSlot, setHoveredDropSlot] = useState<{ col: number; row: number } | null>(null);
  const [selectedSlotForPlacement, setSelectedSlotForPlacement] = useState<{ col: number; row: number } | null>(null);

  const enabledWidgets = widgets.filter((w) => w.enabled !== false && !w.isFloating);
  const floatingWidgets = widgets.filter((w) => w.enabled !== false && w.isFloating);

  // Determine effective total columns based on orientation & device width
  const totalCols = canvasColsCount || (isPortrait ? 6 : 12);

  // Determine max occupied row to compute infinite grid length
  const maxOccupiedRow = Math.max(
    canvasRowsCount,
    ...enabledWidgets.map((w) => {
      const row = w.customization?.gridPosition?.row || 1;
      const rSpan = w.customization?.rowSpan || 2;
      return row + rSpan + 3;
    })
  );

  // Background CSS
  const wallpaperStyle: React.CSSProperties = {
    background: wallpaper?.cssValue || '#070a12',
    backgroundSize: wallpaper?.type === 'pattern' ? '32px 32px' : 'cover',
  };

  const getColSpanClass = (span: number) => {
    const safeSpan = Math.min(totalCols, Math.max(1, span));
    if (isPortrait) {
      switch (safeSpan) {
        case 1: return 'col-span-1';
        case 2: return 'col-span-2';
        case 3: return 'col-span-3';
        case 4: return 'col-span-4';
        case 5: return 'col-span-5';
        case 6: default: return 'col-span-6';
      }
    }
    switch (safeSpan) {
      case 1: return 'col-span-1 md:col-span-2 lg:col-span-1';
      case 2: return 'col-span-1 md:col-span-2 lg:col-span-2';
      case 3: return 'col-span-1 md:col-span-3 lg:col-span-3';
      case 4: return 'col-span-1 md:col-span-3 lg:col-span-4';
      case 5: return 'col-span-1 md:col-span-4 lg:col-span-5';
      case 6: return 'col-span-1 md:col-span-6 lg:col-span-6';
      case 7: return 'col-span-1 md:col-span-6 lg:col-span-7';
      case 8: return 'col-span-1 md:col-span-6 lg:col-span-8';
      case 9: return 'col-span-1 md:col-span-6 lg:col-span-9';
      case 10: return 'col-span-1 md:col-span-6 lg:col-span-10';
      case 11: return 'col-span-1 md:col-span-6 lg:col-span-11';
      case 12: default: return 'col-span-1 md:col-span-6 lg:col-span-12';
    }
  };

  // Handle dropping a widget into a direct spatial cell (C, R)
  const handleDropOnSpatialSlot = (e: React.DragEvent, col: number, row: number) => {
    e.preventDefault();
    e.stopPropagation();
    setHoveredDropSlot(null);
    if (!draggedWidgetId) return;
    onSetWidgetPosition(draggedWidgetId, col, row);
    onDragEnd();
  };

  return (
    <div className="relative min-h-[calc(100vh-60px)] w-full transition-all duration-300 pb-20">
      {/* Dynamic Wallpaper & Ambient Backdrop Layer */}
      <div
        className="fixed inset-0 pointer-events-none z-0 transition-all duration-500"
        style={wallpaperStyle}
      />

      {/* Dimmer Overlay for readability */}
      {wallpaper?.overlayDark && wallpaper.overlayDark > 0 && (
        <div
          className="fixed inset-0 pointer-events-none z-0 bg-black transition-opacity duration-300"
          style={{ opacity: wallpaper.overlayDark }}
        />
      )}

      {/* Blueprint Grid Lines & Dot Coordinates (when enabled) */}
      {showCoordinateGrid && (
        <div className="fixed inset-0 pointer-events-none z-0 opacity-20 bg-[radial-gradient(#38bdf8_1.2px,transparent_1.2px)] [background-size:28px_28px]" />
      )}

      {/* Main Canvas Area */}
      <main
        className={`relative z-10 p-3 sm:p-4 md:p-6 mx-auto transition-all ${
          isPortrait
            ? 'max-w-[720px] w-full'
            : canvasWidthMode === 'standard'
            ? 'max-w-[1440px] w-full'
            : canvasWidthMode === 'wide'
            ? 'max-w-[1920px] w-full'
            : canvasWidthMode === 'ultrawide'
            ? 'max-w-[2560px] w-full'
            : 'max-w-none w-full'
        }`}
      >
        {/* SPATIAL BOARD MODE (True Android Freeform with independent coordinates & empty gaps) */}
        {isSpatial ? (
          <div className="space-y-4">
            {/* Direct Spatial Grid Container */}
            <div
              className={`grid gap-3.5 sm:gap-4 relative transition-all ${
                isPortrait ? 'grid-cols-6' : 'grid-cols-12'
              }`}
              style={{
                gridAutoRows: 'minmax(140px, auto)',
                minHeight: `${Math.max(800, maxOccupiedRow * 155)}px`,
              }}
            >
              {/* Interactive Droppable Background Matrix Slots (Visible when dragging or hovering) */}
              {draggedWidgetId && (
                <div
                  className={`absolute inset-0 pointer-events-auto z-20 grid gap-3.5 p-1 rounded-3xl border-2 border-dashed border-sky-400/30 bg-slate-950/40 backdrop-blur-[2px] ${
                    isPortrait ? 'grid-cols-6' : 'grid-cols-12'
                  }`}
                  style={{
                    gridAutoRows: '140px',
                  }}
                >
                  {Array.from({ length: maxOccupiedRow * totalCols }).map((_, idx) => {
                    const col = (idx % totalCols) + 1;
                    const row = Math.floor(idx / totalCols) + 1;
                    const isHovered =
                      hoveredDropSlot?.col === col && hoveredDropSlot?.row === row;

                    return (
                      <div
                        key={`drop-slot-${col}-${row}`}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = 'move';
                          setHoveredDropSlot({ col, row });
                        }}
                        onDragLeave={() => {
                          if (hoveredDropSlot?.col === col && hoveredDropSlot?.row === row) {
                            setHoveredDropSlot(null);
                          }
                        }}
                        onDrop={(e) => handleDropOnSpatialSlot(e, col, row)}
                        className={`rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-2 cursor-pointer select-none ${
                          isHovered
                            ? 'border-sky-400 bg-sky-500/40 ring-4 ring-sky-400/60 scale-[1.03] text-white shadow-[0_0_25px_rgba(56,189,248,0.6)] z-30'
                            : 'border-white/15 hover:border-sky-400/60 bg-black/25 text-slate-400 hover:text-sky-300'
                        }`}
                      >
                        <span className="text-[11px] font-mono font-extrabold text-sky-300">
                          {isFa ? `ستون ${col} • سطر ${row}` : `C${col} : R${row}`}
                        </span>
                        <span className="text-[10px] font-medium opacity-80 mt-0.5">
                          {isHovered
                            ? (isFa ? '✨ رها کنید تا اینجا بنشیند' : 'Drop to Place')
                            : (isFa ? 'نقطه قرارگیری آزاد' : 'Empty Slot')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Spatial Widgets Placed at Exact (Column, Row) Slots */}
              {enabledWidgets.map((widget, index) => {
                const defaultCol = isPortrait ? ((index % 2) * 3 + 1) : ((index % 2) * 6 + 1);
                const defaultRow = Math.floor(index / 2) * 2 + 1;

                const col = Math.min(
                  totalCols,
                  Math.max(1, widget.customization?.gridPosition?.col || defaultCol)
                );
                const row = Math.max(
                  1,
                  widget.customization?.gridPosition?.row || defaultRow
                );
                const maxAllowedSpan = totalCols - col + 1;
                const colSpan = Math.min(
                  maxAllowedSpan,
                  Math.max(1, widget.customization?.colSpan || (isPortrait ? 6 : 6))
                );
                const rowSpan = Math.min(8, Math.max(1, widget.customization?.rowSpan || 2));

                const isBeingDragged = draggedWidgetId === widget.id;
                const isOver = dragOverWidgetId === widget.id;

                return (
                  <div
                    key={widget.id}
                    style={{
                      gridColumnStart: col,
                      gridColumnEnd: `span ${colSpan}`,
                      gridRowStart: row,
                      gridRowEnd: `span ${rowSpan}`,
                      zIndex: 10,
                    }}
                    className={`w-full transition-all duration-200 relative group/spatial-wrapper ${
                      isBeingDragged ? 'opacity-25 scale-95' : 'opacity-100'
                    } ${isOver ? 'ring-2 ring-sky-400 rounded-2xl scale-[1.01]' : ''}`}
                    onDragOver={(e) => onDragOverCard(e, widget.id)}
                    onDrop={(e) => onDropOnCard(e, widget.id)}
                  >
                    <WidgetContainer
                      widget={widget}
                      language={language}
                      onUpdateWidget={onUpdateWidget}
                      onApplyThemeToAll={onApplyThemeToAll}
                      onRemoveWidget={onRemoveWidget}
                      onExpand={onExpandWidget}
                      onToggleFloat={onToggleFloat}
                      isFloating={false}
                      isDraggable={true}
                      onDragStart={() => onDragStart(widget.id)}
                      onDragEnd={onDragEnd}
                      onMoveWidget={onMoveWidget}
                    >
                      {renderWidgetContent(widget)}
                    </WidgetContainer>
                  </div>
                );
              })}
            </div>

            {/* Infinite Canvas Expansion Footer Banner */}
            <div className="pt-6 pb-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 border border-white/10 backdrop-blur-xl rounded-2xl p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 shrink-0">
                  <Move className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-sky-200">
                    {isFa ? 'بوم آزاد نامحدود فضایی فعال است' : 'Infinite Spatial Canvas Active'}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {isFa
                      ? `ابعاد فعلی: ${totalCols} ستون در ${maxOccupiedRow} سطر • امکان فاصله‌گذاری و چیدمان آزاد در هر نقطه`
                      : `Dimensions: ${totalCols} Cols x ${maxOccupiedRow} Rows • Freeform spacing & slot placement`}
                  </p>
                </div>
              </div>

              {/* Expansion buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => onExpandRows?.(6)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-sm cursor-pointer border border-sky-400/40"
                  title={isFa ? 'افزودن ۶ سطر جدید به انتهای بوم' : 'Add 6 Rows to Canvas'}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isFa ? '➕ گسترش بوم (+۶ سطر)' : '➕ Expand Canvas (+6 Rows)'}</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* SMART AUTO-FLOW GRID MODE */
          <div className="space-y-4">
            <div
              className={`grid gap-3.5 sm:gap-4 auto-rows-min ${
                isPortrait ? 'grid-cols-6' : 'grid-cols-1 md:grid-cols-6 lg:grid-cols-12'
              }`}
            >
              {enabledWidgets
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((widget) => {
                  const span = Math.min(
                    totalCols,
                    Math.max(1, widget.customization?.colSpan ?? (widget as any).colSpan ?? 6)
                  );
                  const colSpanClass = getColSpanClass(span);

                  const isBeingDragged = draggedWidgetId === widget.id;
                  const isOver = dragOverWidgetId === widget.id;

                  return (
                    <div
                      key={widget.id}
                      className={`${colSpanClass} self-start w-full transition-all duration-200 ${
                        isBeingDragged ? 'opacity-25 scale-95' : 'opacity-100'
                      } ${isOver ? 'ring-2 ring-sky-400 rounded-2xl scale-[1.01]' : ''}`}
                      onDragOver={(e) => onDragOverCard(e, widget.id)}
                      onDrop={(e) => onDropOnCard(e, widget.id)}
                    >
                      <WidgetContainer
                        widget={widget}
                        language={language}
                        onUpdateWidget={onUpdateWidget}
                        onApplyThemeToAll={onApplyThemeToAll}
                        onRemoveWidget={onRemoveWidget}
                        onExpand={onExpandWidget}
                        onToggleFloat={onToggleFloat}
                        isFloating={false}
                        isDraggable={true}
                        onDragStart={() => onDragStart(widget.id)}
                        onDragEnd={onDragEnd}
                        onMoveWidget={onMoveWidget}
                      >
                        {renderWidgetContent(widget)}
                      </WidgetContainer>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Floating / Pinned Widgets on Top */}
        {floatingWidgets.map((widget) => (
          <WidgetContainer
            key={widget.id}
            widget={widget}
            language={language}
            onUpdateWidget={onUpdateWidget}
            onApplyThemeToAll={onApplyThemeToAll}
            onRemoveWidget={onRemoveWidget}
            onExpand={onExpandWidget}
            onToggleFloat={onToggleFloat}
            isFloating={true}
          >
            {renderWidgetContent(widget)}
          </WidgetContainer>
        ))}
      </main>
    </div>
  );
};
