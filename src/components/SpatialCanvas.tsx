import React, { useState } from 'react';
import {
  WorkspaceWidgetConfig,
  Language,
  CanvasLayoutMode,
  CanvasWallpaper,
  CanvasWidthMode,
  WidgetCustomization,
} from '../types';
import { WidgetContainer } from './WidgetContainer';
import { Move, Grid, Sparkles, Pin } from 'lucide-react';

interface SpatialCanvasProps {
  widgets: WorkspaceWidgetConfig[];
  language: Language;
  layoutMode: CanvasLayoutMode;
  wallpaper?: CanvasWallpaper;
  showCoordinateGrid?: boolean;
  canvasWidthMode: CanvasWidthMode;
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
  renderWidgetContent: (widget: WorkspaceWidgetConfig) => React.ReactNode;
}

export const SpatialCanvas: React.FC<SpatialCanvasProps> = ({
  widgets,
  language,
  layoutMode,
  wallpaper,
  showCoordinateGrid = true,
  canvasWidthMode,
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
  renderWidgetContent,
}) => {
  const isFa = language === 'fa';
  const isSpatial = layoutMode === 'spatial-freeform';
  const [hoveredDropSlot, setHoveredDropSlot] = useState<{ col: number; row: number } | null>(null);

  const enabledWidgets = widgets.filter((w) => w.enabled !== false && !w.isFloating);
  const floatingWidgets = widgets.filter((w) => w.enabled !== false && w.isFloating);

  // Determine max rows needed in spatial mode
  const maxOccupiedRow = isSpatial
    ? Math.max(
        16,
        ...enabledWidgets.map((w) => {
          const row = w.customization?.gridPosition?.row || 1;
          const rSpan = w.customization?.rowSpan || 2;
          return row + rSpan + 1;
        })
      )
    : 12;

  // Background CSS
  const wallpaperStyle: React.CSSProperties = {
    background: wallpaper?.cssValue || '#070a12',
    backgroundSize: wallpaper?.type === 'pattern' ? '32px 32px' : 'cover',
  };

  const getColSpanClass = (span: number) => {
    const safeSpan = Math.min(12, Math.max(1, span));
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
    setHoveredDropSlot(null);
    if (!draggedWidgetId) return;
    onSetWidgetPosition(draggedWidgetId, col, row);
    onDragEnd();
  };

  return (
    <div className="relative min-h-[calc(100vh-60px)] w-full transition-all duration-300">
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

      {/* Blueprint Grid Lines & Dot Coordinates (when enabled in Spatial Mode) */}
      {showCoordinateGrid && isSpatial && (
        <div className="fixed inset-0 pointer-events-none z-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:32px_32px]" />
      )}

      {/* Main Canvas Area */}
      <main
        className={`relative z-10 p-3 sm:p-4 md:p-6 mx-auto transition-all ${
          canvasWidthMode === 'standard'
            ? 'max-w-[1440px] w-full'
            : canvasWidthMode === 'wide'
            ? 'max-w-[1920px] w-full'
            : canvasWidthMode === 'ultrawide'
            ? 'max-w-[2560px] w-full'
            : 'max-w-none w-full'
        }`}
      >
        {/* Spatial Coordinate Board Mode */}
        {isSpatial ? (
          <div
            className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-3.5 sm:gap-4 relative min-h-[900px]"
            style={{
              gridAutoRows: 'minmax(140px, auto)',
            }}
          >
            {/* Interactive Drop-Target Matrix Overlay (visible during dragging) */}
            {draggedWidgetId && (
              <div className="absolute inset-0 pointer-events-auto z-20 grid grid-cols-12 gap-3.5 auto-rows-[140px] bg-slate-950/20 backdrop-blur-[1px] p-1 rounded-3xl border border-sky-500/20">
                {Array.from({ length: Math.min(maxOccupiedRow * 12, 192) }).map((_, idx) => {
                  const col = (idx % 12) + 1;
                  const row = Math.floor(idx / 12) + 1;
                  const isHovered =
                    hoveredDropSlot?.col === col && hoveredDropSlot?.row === row;

                  return (
                    <div
                      key={`slot-${col}-${row}`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                        setHoveredDropSlot({ col, row });
                      }}
                      onDragLeave={() => setHoveredDropSlot(null)}
                      onDrop={(e) => handleDropOnSpatialSlot(e, col, row)}
                      className={`rounded-xl border border-dashed transition-all flex flex-col items-center justify-center p-2 cursor-pointer ${
                        isHovered
                          ? 'border-sky-400 bg-sky-500/25 ring-2 ring-sky-400 scale-[1.02] text-white shadow-lg'
                          : 'border-white/10 hover:border-sky-400/50 bg-black/10 text-slate-500 hover:text-sky-300'
                      }`}
                    >
                      <span className="text-[10px] font-mono font-bold">
                        C{col}:R{row}
                      </span>
                      <span className="text-[9px] opacity-70">
                        {isFa ? 'رهاسازی در این نقطه' : 'Drop Here'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Spatial Coordinate Widgets */}
            {enabledWidgets.map((widget, index) => {
              const col = Math.min(12, Math.max(1, widget.customization?.gridPosition?.col || ((index % 2) * 6 + 1)));
              const row = Math.max(1, widget.customization?.gridPosition?.row || (Math.floor(index / 2) * 2 + 1));
              const colSpan = Math.min(12, Math.max(1, widget.customization?.colSpan || 6));
              const rowSpan = Math.min(6, Math.max(1, widget.customization?.rowSpan || 2));

              const isBeingDragged = draggedWidgetId === widget.id;
              const isOver = dragOverWidgetId === widget.id;

              return (
                <div
                  key={widget.id}
                  style={{
                    gridColumnStart: col,
                    gridColumnEnd: `span ${Math.min(colSpan, 13 - col)}`,
                    gridRowStart: row,
                    gridRowEnd: `span ${rowSpan}`,
                  }}
                  className={`w-full transition-all duration-200 ${
                    isBeingDragged ? 'opacity-30 scale-95' : 'opacity-100'
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
        ) : (
          /* Smart Auto-Flow Grid Mode */
          <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-3.5 sm:gap-4 auto-rows-min">
            {enabledWidgets
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map((widget) => {
                const span = Math.min(
                  12,
                  Math.max(1, widget.customization?.colSpan ?? (widget as any).colSpan ?? 6)
                );
                const colSpanClass = getColSpanClass(span);

                const isBeingDragged = draggedWidgetId === widget.id;
                const isOver = dragOverWidgetId === widget.id;

                return (
                  <div
                    key={widget.id}
                    className={`${colSpanClass} self-start w-full transition-all duration-200 ${
                      isBeingDragged ? 'opacity-30 scale-95' : 'opacity-100'
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
        )}

        {/* Floating / Pinned Pinned Widgets on Top */}
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
