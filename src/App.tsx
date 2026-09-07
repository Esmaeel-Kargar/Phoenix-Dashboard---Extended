/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { HeaderBar } from './components/HeaderBar';
import { CalendarCard } from './components/CalendarCard';
import { SeasonGoalsCard } from './components/SeasonGoalsCard';
import { ReminderNotesCard } from './components/ReminderNotesCard';
import { BankAccountsCard } from './components/BankAccountsCard';
import { DebtsCreditsCard } from './components/DebtsCreditsCard';
import { RollingTaskMatrix } from './components/RollingTaskMatrix';
import { SocialChannelsMatrix } from './components/SocialChannelsMatrix';
import { AISeasonReportWidget } from './components/AISeasonReportWidget';
import { ActivityLogsWidget } from './components/ActivityLogsWidget';
import { MeetingChatWidget } from './components/MeetingChatWidget';
import { FileManagerWidget } from './components/FileManagerWidget';
import { HabitTrackerWidget } from './components/HabitTrackerWidget';
import { PomodoroTimerWidget } from './components/PomodoroTimerWidget';
import { CashflowBudgetWidget } from './components/CashflowBudgetWidget';
import { KanbanBoardWidget } from './components/KanbanBoardWidget';
import { QuickScratchpadWidget } from './components/QuickScratchpadWidget';
import { ExecutiveHUDWidget } from './components/ExecutiveHUDWidget';
import { ExportReportModal } from './components/ExportReportModal';
import { WidgetContainer } from './components/WidgetContainer';
import { WidgetExpandedModal } from './components/WidgetExpandedModal';
import { AddWidgetModal } from './components/AddWidgetModal';
import { SettingsModal } from './components/SettingsModal';
import { AuthModal } from './components/AuthModal';
import { SearchPalette } from './components/SearchPalette';
import { SpatialCanvas } from './components/SpatialCanvas';
import {
  AppState,
  Language,
  ThemeMode,
  WorkspaceWidgetConfig,
  WidgetCustomization,
  WidgetType,
  ActivityLog,
  ChatMessage,
  WorkspaceFile,
  AIAgentConfig,
  UserAccount,
  ChatAttachment,
  CanvasWidthMode,
  CanvasLayoutMode,
  CanvasOrientation,
  CanvasWallpaper,
} from './types';
import {
  loadStoredState,
  saveState,
  resetToDefaults,
  DEFAULT_REFERENCE_DATE,
  DEFAULT_WIDGETS,
  WorkspacePreset,
} from './utils/storage';
import { syncAllWidgetsToTheme, WALLPAPER_PRESETS, getThemePreset } from './utils/themePresets';
import { getFormattedDateInfo } from './utils/jalali';
import {
  Sparkles,
  Monitor,
  Tv,
  Maximize2,
  LayoutGrid,
  Layers,
  Plus,
  Compass,
  Cpu,
  Activity,
  Sliders,
} from 'lucide-react';

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

export default function App() {
  const [state, setState] = useState<AppState>(loadStoredState);
  const [useLiveDate, setUseLiveDate] = useState<boolean>(false);
  const [currentDate, setCurrentDate] = useState<Date>(DEFAULT_REFERENCE_DATE);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isAddWidgetOpen, setIsAddWidgetOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [expandedWidgetId, setExpandedWidgetId] = useState<string | null>(null);
  const [presetChatAttachment, setPresetChatAttachment] = useState<ChatAttachment | null>(null);

  // Drag & drop state for rearrangeable widgets
  const draggedWidgetIdRef = useRef<string | null>(null);
  const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null);
  const [dragOverWidgetId, setDragOverWidgetId] = useState<string | null>(null);

  // Save to localStorage whenever state changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Synchronize document title and direction
  useEffect(() => {
    document.documentElement.lang = state.language;
    document.documentElement.dir = state.language === 'fa' ? 'rtl' : 'ltr';
    document.title =
      state.language === 'fa'
        ? 'داشبورد ققنوس | سیستم عامل هوشمند کار و زندگی'
        : 'Phoenix Dashboard | Life & Work OS';

    if (state.theme === 'modern-dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.language, state.theme]);

  // Global Keyboard Shortcuts (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Update date based on simulation mode
  useEffect(() => {
    if (useLiveDate) {
      setCurrentDate(new Date());
    } else {
      setCurrentDate(DEFAULT_REFERENCE_DATE);
    }
  }, [useLiveDate]);

  const dateInfo = getFormattedDateInfo(currentDate);

  // Handlers
  const handleLanguageChange = (lang: Language) => {
    setState((prev) => ({ ...prev, language: lang }));
  };

  const handleThemeChange = (theme: ThemeMode) => {
    setState((prev) => ({ ...prev, theme }));
  };

  const handleSyncAllWidgetsTheme = (themeId: ThemeMode) => {
    setState((prev) => ({
      ...prev,
      theme: themeId,
      widgets: syncAllWidgetsToTheme(themeId, prev.widgets),
    }));
  };

  const handleCanvasLayoutModeChange = (mode: CanvasLayoutMode) => {
    setState((prev) => ({ ...prev, canvasLayoutMode: mode }));
  };

  const handleCanvasWallpaperChange = (wallpaper: CanvasWallpaper) => {
    setState((prev) => ({ ...prev, canvasWallpaper: wallpaper }));
  };

  const handleCanvasOrientationChange = (orientation: CanvasOrientation) => {
    setState((prev) => ({ ...prev, canvasOrientation: orientation }));
  };

  const handleExpandRows = (count: number = 6) => {
    setState((prev) => ({
      ...prev,
      canvasRowsCount: (prev.canvasRowsCount || 24) + count,
    }));
  };

  const handleToggleCoordinateGrid = () => {
    setState((prev) => ({
      ...prev,
      showCoordinateGrid: prev.showCoordinateGrid !== undefined ? !prev.showCoordinateGrid : false,
    }));
  };

  const handleSetWidgetPosition = (widgetId: string, col: number, row: number) => {
    setState((prev) => ({
      ...prev,
      widgets: prev.widgets.map((w) =>
        w.id === widgetId
          ? {
              ...w,
              customization: {
                ...w.customization,
                gridPosition: { col, row },
              },
            }
          : w
      ),
    }));
  };

  const handleCanvasWidthModeChange = (canvasWidthMode: CanvasWidthMode) => {
    setState((prev) => ({ ...prev, canvasWidthMode }));
  };

  const handleTogglePrivacy = () => {
    setState((prev) => ({ ...prev, isPrivacyMode: !prev.isPrivacyMode }));
  };

  const handleSaveDateNote = (note: string) => {
    const key = dateInfo.dateKey;
    setState((prev) => ({
      ...prev,
      dateNotes: {
        ...prev.dateNotes,
        [key]: note,
      },
    }));
  };

  const handleAddLog = (log: ActivityLog) => {
    setState((prev) => ({
      ...prev,
      activityLogs: [log, ...(prev.activityLogs || [])],
    }));
  };

  const handleSendChatMessage = (msg: ChatMessage) => {
    setState((prev) => ({
      ...prev,
      chatHistory: [...(prev.chatHistory || []), msg],
    }));
  };

  const handleUploadFile = (file: WorkspaceFile) => {
    setState((prev) => ({
      ...prev,
      files: [file, ...(prev.files || [])],
    }));
  };

  const handleDeleteFile = (id: string) => {
    setState((prev) => ({
      ...prev,
      files: (prev.files || []).filter((f) => f.id !== id),
    }));
  };

  const handleSendFileToChat = (file: WorkspaceFile) => {
    setPresetChatAttachment({
      id: file.id,
      name: file.name,
      size: file.size,
      type: file.type,
      category: file.category,
    });
    const chatWidget = state.widgets.find((w) => w.type === 'meeting_chat');
    if (chatWidget && chatWidget.enabled === false) {
      handleUpdateWidget(chatWidget.id, { enabled: true });
    }
  };

  const handleApplyThemeToAll = (customization: Partial<WidgetCustomization>) => {
    setState((prev) => ({
      ...prev,
      widgets: prev.widgets.map((w) => ({
        ...w,
        customization: {
          ...w.customization,
          bgColor: customization.bgColor,
          textColor: customization.textColor,
        },
      })),
    }));
  };

  const handleUpdateWidget = (
    widgetIdOrConfig: string | WorkspaceWidgetConfig,
    updates?: Partial<WorkspaceWidgetConfig>
  ) => {
    if (typeof widgetIdOrConfig === 'object') {
      const updated = widgetIdOrConfig;
      setState((prev) => ({
        ...prev,
        widgets: prev.widgets.map((w) => (w.id === updated.id ? { ...w, ...updated } : w)),
      }));
    } else {
      const widgetId = widgetIdOrConfig;
      setState((prev) => ({
        ...prev,
        widgets: prev.widgets.map((w) => (w.id === widgetId ? { ...w, ...updates } : w)),
      }));
    }
  };

  const handleRemoveWidget = (widgetId: string) => {
    setState((prev) => ({
      ...prev,
      widgets: prev.widgets.filter((w) => w.id !== widgetId),
    }));
  };

  const handleAddWidget = (type: WidgetType) => {
    const defaultTemplate = DEFAULT_WIDGETS.find((w) => w.type === type);
    const newWidget: WorkspaceWidgetConfig = defaultTemplate
      ? {
          ...defaultTemplate,
          id: `widget-${Date.now()}`,
          order: state.widgets.length + 1,
          enabled: true,
        }
      : {
          id: `widget-${Date.now()}`,
          type,
          title: type,
          titleFa: type,
          order: state.widgets.length + 1,
          enabled: true,
          customization: {
            colSpan: 6,
            rowSpan: 2,
            fontFamily: 'vazir',
            fontSize: 'base',
          },
        };

    setState((prev) => ({
      ...prev,
      widgets: [...prev.widgets, newWidget],
    }));

    handleAddLog({
      id: `log-add-${Date.now()}`,
      actorType: 'user',
      actorId: state.currentUser?.id || 'user-default',
      actorName: state.currentUser?.name || 'کاربر سیستم',
      authorizerType: 'direct_user',
      authorizerId: state.currentUser?.id || 'user-default',
      authorizerName: 'مدیر فضا',
      module: 'system',
      action: 'create',
      descriptionFa: `افزودن ویجت جدید "${newWidget.titleFa}" به داشبورد`,
      descriptionEn: `Added new widget "${newWidget.title}" to workspace`,
      timestamp: new Date().toISOString(),
      shamsiDate: dateInfo.dateKey,
      status: 'success',
    });
  };

  const handleApplyPreset = (preset: WorkspacePreset) => {
    const configuredWidgets: WorkspaceWidgetConfig[] = preset.widgetTypes.map((type, idx) => {
      const template = DEFAULT_WIDGETS.find((w) => w.type === type);
      return template
        ? { ...template, id: `w-${type}-${idx}`, order: idx + 1, enabled: true }
        : {
            id: `w-${type}-${idx}`,
            type,
            title: type,
            titleFa: type,
            order: idx + 1,
            enabled: true,
            customization: {
              colSpan: 6,
              rowSpan: 2,
              fontFamily: 'vazir',
              fontSize: 'base',
            },
          };
    });

    setState((prev) => ({
      ...prev,
      widgets: configuredWidgets,
    }));

    handleAddLog({
      id: `log-preset-${Date.now()}`,
      actorType: 'user',
      actorId: state.currentUser?.id || 'user-default',
      actorName: state.currentUser?.name || 'کاربر سیستم',
      authorizerType: 'direct_user',
      authorizerId: state.currentUser?.id || 'user-default',
      authorizerName: 'مدیر فضا',
      module: 'system',
      action: 'update',
      descriptionFa: `اعمال قالب کاری "${preset.nameFa}" روی چیدمان داشبورد`,
      descriptionEn: `Applied workspace preset "${preset.nameEn}"`,
      timestamp: new Date().toISOString(),
      shamsiDate: dateInfo.dateKey,
      status: 'success',
    });
  };

  const handleToggleFloat = (widgetId: string) => {
    setState((prev) => ({
      ...prev,
      widgets: prev.widgets.map((w) =>
        w.id === widgetId ? { ...w, isFloating: !w.isFloating } : w
      ),
    }));
  };

  const handleMoveWidget = (
    widgetId: string,
    direction: 'prev' | 'next' | 'start' | 'end' | 'up' | 'down'
  ) => {
    const index = state.widgets.findIndex((w) => w.id === widgetId);
    if (index === -1) return;

    let targetIndex = index;
    if (direction === 'up' || direction === 'prev') {
      targetIndex = Math.max(0, index - 1);
    } else if (direction === 'down' || direction === 'next') {
      targetIndex = Math.min(state.widgets.length - 1, index + 1);
    } else if (direction === 'start') {
      targetIndex = 0;
    } else if (direction === 'end') {
      targetIndex = state.widgets.length - 1;
    }

    if (targetIndex === index) return;

    const newWidgets = [...state.widgets];
    const [moved] = newWidgets.splice(index, 1);
    newWidgets.splice(targetIndex, 0, moved);

    newWidgets.forEach((w, i) => {
      w.order = i + 1;
    });

    setState((prev) => ({ ...prev, widgets: newWidgets }));
  };

  const handleDragOverCard = (e: React.DragEvent, targetWidgetId: string) => {
    e.preventDefault();
    if (draggedWidgetIdRef.current && draggedWidgetIdRef.current !== targetWidgetId) {
      setDragOverWidgetId(targetWidgetId);
    }
  };

  const handleDropOnCard = (e: React.DragEvent, targetWidgetId: string) => {
    e.preventDefault();
    const sourceId = draggedWidgetIdRef.current;
    setDragOverWidgetId(null);
    setDraggedWidgetId(null);
    draggedWidgetIdRef.current = null;

    if (!sourceId || sourceId === targetWidgetId) return;

    const sourceIndex = state.widgets.findIndex((w) => w.id === sourceId);
    const targetIndex = state.widgets.findIndex((w) => w.id === targetWidgetId);

    if (sourceIndex === -1 || targetIndex === -1) return;

    const updatedWidgets = [...state.widgets];
    const [movedWidget] = updatedWidgets.splice(sourceIndex, 1);
    updatedWidgets.splice(targetIndex, 0, movedWidget);

    updatedWidgets.forEach((w, i) => {
      w.order = i + 1;
    });

    setState((prev) => ({ ...prev, widgets: updatedWidgets }));
  };

  const handleSaveAgents = (agents: AIAgentConfig[]) => {
    setState((prev) => ({ ...prev, aiAgents: agents }));
  };

  const handleLoginSuccess = (user: UserAccount) => {
    setState((prev) => ({
      ...prev,
      currentUser: user,
      activityLogs: [
        {
          id: `log-login-${Date.now()}`,
          actorType: 'user',
          actorId: user.id,
          actorName: user.name,
          authorizerType: 'direct_user',
          authorizerId: user.id,
          authorizerName: 'سیستم احراز هویت هاست',
          module: 'system',
          action: 'create',
          descriptionFa: `ورود موفق کاربر "${user.name}" به فضای کاری مشترک`,
          descriptionEn: `User "${user.name}" logged into host database`,
          timestamp: new Date().toISOString(),
          shamsiDate: dateInfo.dateKey,
          status: 'success',
        },
        ...(prev.activityLogs || []),
      ],
    }));
  };

  const handleLogout = () => {
    setState((prev) => ({
      ...prev,
      currentUser: null,
    }));
  };

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `phoenix_workspace_backup_${dateInfo.dateKey}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleReset = () => {
    if (window.confirm(state.language === 'fa' ? 'آیا از بازنشانی کامل داده‌ها به حالت پیش‌فرض اطمینان دارید؟' : 'Reset all workspace data to defaults?')) {
      const reset = resetToDefaults();
      setState(reset);
    }
  };

  const handleSaveHostState = (updatedState: Partial<AppState>) => {
    setState((prev) => ({ ...prev, ...updatedState }));
  };

  // Render Widget Content Switch
  const renderWidgetContent = (widget: WorkspaceWidgetConfig) => {
    switch (widget.type) {
      case 'executive_hud':
        return (
          <ExecutiveHUDWidget
            language={state.language}
            seasonGoals={state.seasonGoals}
            tasks={state.tasks}
            bankAccounts={state.bankAccounts}
            debtsCredits={state.debtsCredits}
            habits={state.habits || []}
            isPrivacyMode={state.isPrivacyMode}
            onTogglePrivacy={handleTogglePrivacy}
            onQuickAction={(action) => {
              if (action === 'search') setIsSearchOpen(true);
              else if (action === 'export') setIsExportOpen(true);
              else if (action === 'ai_chat') {
                const el = document.getElementById('widget-meeting-chat');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              } else if (action === 'pomodoro') {
                const el = document.getElementById('widget-pomodoro-timer');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              } else if (action === 'new_task') {
                const el = document.getElementById('widget-task-matrix');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              } else if (action === 'new_note') {
                const el = document.getElementById('widget-reminder-notes') || document.getElementById('widget-scratchpad');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          />
        );
      case 'calendar':
        return (
          <CalendarCard
            currentDate={currentDate}
            onDateChange={(d) => setCurrentDate(d)}
            dateNote={state.dateNotes[dateInfo.dateKey] || ''}
            onSaveDateNote={handleSaveDateNote}
            language={state.language}
            timeBlocks={state.timeBlocks || []}
            onUpdateTimeBlocks={(timeBlocks) => setState((prev) => ({ ...prev, timeBlocks }))}
          />
        );
      case 'season_goals':
        return (
          <SeasonGoalsCard
            goals={state.seasonGoals}
            onUpdateGoals={(goals) => setState((prev) => ({ ...prev, seasonGoals: goals }))}
            language={state.language}
            currentSeason={dateInfo.seasonFa}
          />
        );
      case 'task_matrix':
        return (
          <RollingTaskMatrix
            baseDate={currentDate}
            activeOffset={state.activeDayOffset}
            onOffsetChange={(offset) => setState((prev) => ({ ...prev, activeDayOffset: offset }))}
            tasks={state.tasks}
            onUpdateTasks={(tasks) => setState((prev) => ({ ...prev, tasks }))}
            language={state.language}
          />
        );
      case 'habit_tracker':
        return (
          <HabitTrackerWidget
            habits={state.habits || []}
            onUpdateHabits={(habits) => setState((prev) => ({ ...prev, habits }))}
            language={state.language}
            currentDate={currentDate}
            seasonGoals={state.seasonGoals}
            onAddLog={handleAddLog}
          />
        );
      case 'pomodoro_timer':
        return (
          <PomodoroTimerWidget
            tasks={state.tasks}
            onUpdateTasks={(tasks) => setState((prev) => ({ ...prev, tasks }))}
            language={state.language}
            onAddLog={handleAddLog}
          />
        );
      case 'cashflow_budget':
        return (
          <CashflowBudgetWidget
            budgetCategories={state.budgetCategories || []}
            transactions={state.cashflowTransactions || []}
            bankAccounts={state.bankAccounts}
            debtsCredits={state.debtsCredits}
            onUpdateBudgets={(cats) => setState((prev) => ({ ...prev, budgetCategories: cats }))}
            onUpdateTransactions={(txs) => setState((prev) => ({ ...prev, cashflowTransactions: txs }))}
            language={state.language}
            onAddLog={handleAddLog}
          />
        );
      case 'kanban_board':
        return (
          <KanbanBoardWidget
            cards={state.kanbanCards || []}
            onUpdateCards={(cards) => setState((prev) => ({ ...prev, kanbanCards: cards }))}
            tasks={state.tasks}
            onUpdateTasks={(tasks) => setState((prev) => ({ ...prev, tasks }))}
            language={state.language}
            onAddLog={handleAddLog}
          />
        );
      case 'quick_scratchpad':
        return (
          <QuickScratchpadWidget
            notes={state.scratchpadNotes || []}
            onUpdateNotes={(notes) => setState((prev) => ({ ...prev, scratchpadNotes: notes }))}
            tasks={state.tasks}
            onUpdateTasks={(tasks) => setState((prev) => ({ ...prev, tasks }))}
            seasonGoals={state.seasonGoals}
            onUpdateGoals={(goals) => setState((prev) => ({ ...prev, seasonGoals: goals }))}
            language={state.language}
            onAddLog={handleAddLog}
          />
        );
      case 'ai_season_report':
        return (
          <AISeasonReportWidget
            state={state}
            language={state.language}
            onAddLog={handleAddLog}
          />
        );
      case 'activity_logs':
        return (
          <ActivityLogsWidget
            logs={state.activityLogs || []}
            onAddLog={handleAddLog}
            language={state.language}
          />
        );
      case 'meeting_chat':
        return (
          <MeetingChatWidget
            messages={state.chatHistory || []}
            agents={state.aiAgents || []}
            workspaceContext={{
              goals: state.seasonGoals,
              bankAccounts: state.bankAccounts,
              debtsCredits: state.debtsCredits,
              tasks: state.tasks,
              files: state.files?.map((f) => ({ name: f.name, category: f.category, size: f.size })),
            }}
            onSendMessage={handleSendChatMessage}
            language={state.language}
            presetAttachment={presetChatAttachment}
            onClearPresetAttachment={() => setPresetChatAttachment(null)}
          />
        );
      case 'file_manager':
        return (
          <FileManagerWidget
            files={state.files || []}
            onUploadFile={handleUploadFile}
            onDeleteFile={handleDeleteFile}
            onSendFileToChat={handleSendFileToChat}
            language={state.language}
            userId={state.currentUser?.id || 'user-default'}
          />
        );
      case 'reminder_notes':
        return (
          <ReminderNotesCard
            notes={state.reminderNotes}
            onUpdateNotes={(notes) => setState((prev) => ({ ...prev, reminderNotes: notes }))}
            language={state.language}
          />
        );
      case 'bank_accounts':
        return (
          <BankAccountsCard
            accounts={state.bankAccounts}
            onUpdateAccounts={(accounts) => setState((prev) => ({ ...prev, bankAccounts: accounts }))}
            isPrivacyMode={state.isPrivacyMode}
            onTogglePrivacy={handleTogglePrivacy}
            language={state.language}
          />
        );
      case 'debts_credits':
        return (
          <DebtsCreditsCard
            items={state.debtsCredits}
            onUpdateItems={(items) => setState((prev) => ({ ...prev, debtsCredits: items }))}
            language={state.language}
          />
        );
      case 'social_hub':
        return (
          <SocialChannelsMatrix
            metrics={state.socialMetrics}
            onUpdateMetrics={(metrics) => setState((prev) => ({ ...prev, socialMetrics: metrics }))}
            language={state.language}
          />
        );
      default:
        return <div>Widget Content</div>;
    }
  };

  const expandedWidget = state.widgets.find((w) => w.id === expandedWidgetId) || null;

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        state.theme === 'classic'
          ? 'bg-[#F4F6F9] dark:bg-[#090d16] text-slate-900 dark:text-slate-100'
          : state.theme === 'modern-dark'
          ? 'bg-[#080c14] text-slate-100 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/40 via-[#080c14] to-[#04060a]'
          : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Top Application Header */}
      <HeaderBar
        language={state.language}
        onLanguageChange={handleLanguageChange}
        theme={state.theme}
        onThemeChange={handleThemeChange}
        onSyncAllWidgetsTheme={handleSyncAllWidgetsTheme}
        canvasLayoutMode={state.canvasLayoutMode || 'spatial-freeform'}
        onCanvasLayoutModeChange={handleCanvasLayoutModeChange}
        canvasOrientation={state.canvasOrientation || 'landscape'}
        onCanvasOrientationChange={handleCanvasOrientationChange}
        canvasWallpaper={state.canvasWallpaper}
        onCanvasWallpaperChange={handleCanvasWallpaperChange}
        showCoordinateGrid={state.showCoordinateGrid !== false}
        onToggleCoordinateGrid={handleToggleCoordinateGrid}
        canvasWidthMode={state.canvasWidthMode || 'wide'}
        onCanvasWidthModeChange={handleCanvasWidthModeChange}
        onExpandRows={handleExpandRows}
        isPrivacyMode={state.isPrivacyMode}
        onTogglePrivacy={handleTogglePrivacy}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAddWidget={() => setIsAddWidgetOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        currentUser={state.currentUser}
        onExport={handleExport}
        onReset={handleReset}
        useLiveDate={useLiveDate}
        onToggleDateMode={() => setUseLiveDate(!useLiveDate)}
      />

      {/* Main Spatial Freeform / Smart Grid Canvas */}
      <SpatialCanvas
        widgets={state.widgets}
        language={state.language}
        layoutMode={state.canvasLayoutMode || 'spatial-freeform'}
        canvasOrientation={state.canvasOrientation || 'landscape'}
        wallpaper={state.canvasWallpaper}
        showCoordinateGrid={state.showCoordinateGrid !== false}
        canvasWidthMode={state.canvasWidthMode || 'wide'}
        canvasRowsCount={state.canvasRowsCount || 24}
        canvasColsCount={state.canvasColsCount}
        draggedWidgetId={draggedWidgetId}
        dragOverWidgetId={dragOverWidgetId}
        onUpdateWidget={handleUpdateWidget}
        onApplyThemeToAll={handleApplyThemeToAll}
        onRemoveWidget={handleRemoveWidget}
        onExpandWidget={(id) => setExpandedWidgetId(id)}
        onToggleFloat={handleToggleFloat}
        onMoveWidget={handleMoveWidget}
        onSetWidgetPosition={handleSetWidgetPosition}
        onExpandRows={handleExpandRows}
        onCanvasOrientationChange={handleCanvasOrientationChange}
        onDragStart={(id) => {
          draggedWidgetIdRef.current = id;
          setDraggedWidgetId(id);
        }}
        onDragEnd={() => {
          draggedWidgetIdRef.current = null;
          setDraggedWidgetId(null);
          setDragOverWidgetId(null);
        }}
        onDragOverCard={handleDragOverCard}
        onDropOnCard={handleDropOnCard}
        renderWidgetContent={renderWidgetContent}
      />

      {/* Full-Screen Expanded Widget Modal */}
      <WidgetExpandedModal
        widget={expandedWidget}
        language={state.language}
        onClose={() => setExpandedWidgetId(null)}
        onUpdateWidget={handleUpdateWidget}
      >
        {expandedWidget && renderWidgetContent(expandedWidget)}
      </WidgetExpandedModal>

      {/* Add Widget Modal */}
      <AddWidgetModal
        isOpen={isAddWidgetOpen}
        onClose={() => setIsAddWidgetOpen(false)}
        existingWidgets={state.widgets}
        onAddWidget={handleAddWidget}
        onApplyPreset={handleApplyPreset}
        language={state.language}
      />

      {/* Export & Performance Report Modal */}
      <ExportReportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        state={state}
        onImportState={handleSaveHostState}
        language={state.language}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        language={state.language}
        onLanguageChange={handleLanguageChange}
        theme={state.theme}
        onThemeChange={handleThemeChange}
        isPrivacyMode={state.isPrivacyMode}
        onTogglePrivacy={handleTogglePrivacy}
        useLiveDate={useLiveDate}
        onToggleDateMode={() => setUseLiveDate(!useLiveDate)}
        agents={state.aiAgents || []}
        onSaveAgents={handleSaveAgents}
        currentUser={state.currentUser}
        onOpenAuth={() => {
          setIsSettingsOpen(false);
          setIsAuthOpen(true);
        }}
        onExportBackup={handleExport}
        onResetDefaults={handleReset}
        onSaveHostState={handleSaveHostState}
      />

      {/* Auth & Tenant Database Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={state.currentUser}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
        language={state.language}
      />

      {/* Global Search Palette (Ctrl+K) */}
      <SearchPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        state={state}
        language={state.language}
      />
    </div>
  );
}
