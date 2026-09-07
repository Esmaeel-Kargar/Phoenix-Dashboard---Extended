export type Language = 'fa' | 'en';
export type ThemeMode =
  | 'classic'
  | 'modern-light'
  | 'modern-dark'
  | 'obsidian'
  | 'titanium'
  | 'emerald'
  | 'sunset'
  | 'cyber'
  | 'nordic';

export type CanvasLayoutMode = 'spatial-freeform' | 'smart-grid';
export type CanvasOrientation = 'landscape' | 'portrait';
export type DisplayPreset =
  | 'desktop-16-9'
  | 'ultrawide-21-9'
  | 'tablet-landscape'
  | 'tablet-portrait'
  | 'phone-portrait'
  | 'phone-landscape'
  | 'infinite';

export interface CanvasWallpaper {
  id: string;
  nameFa: string;
  nameEn: string;
  type: 'gradient' | 'image' | 'pattern' | 'solid';
  cssValue: string;
  blur?: number; // 0 to 30px
  overlayDark?: number; // 0 to 0.9
  showGridLines?: boolean;
}

export type WidgetType =
  | 'executive_hud'
  | 'calendar'
  | 'season_goals'
  | 'task_matrix'
  | 'habit_tracker'
  | 'pomodoro_timer'
  | 'cashflow_budget'
  | 'kanban_board'
  | 'quick_scratchpad'
  | 'reminder_notes'
  | 'bank_accounts'
  | 'debts_credits'
  | 'social_hub'
  | 'activity_logs'
  | 'ai_season_report'
  | 'ai_assistant'
  | 'meeting_chat'
  | 'file_manager';

export interface WidgetGridPosition {
  col: number; // 1 to 12
  row: number; // 1 to 100
}

export interface WidgetCustomization {
  bgColor?: string;
  textColor?: string;
  fontFamily?: 'vazir' | 'system' | 'mono' | 'serif';
  fontSize?: 'sm' | 'base' | 'lg';
  headerColor?: string;
  colSpan?: number; // 1 to 12
  rowSpan?: number; // 1 to 4
  customWidthPercent?: number; // 20% to 100%
  customHeightPx?: number; // flexible pixel height with auto-scaling content
  isFloating?: boolean; // pinned floating widget above canvas
  floatingPosition?: { x: number; y: number };
  gridPosition?: WidgetGridPosition; // explicit Android/Desktop 2D coordinate slot
  isLocked?: boolean; // prevent move or resize
  isCollapsed?: boolean; // minimize to header
  accentColor?: string;
}

export interface WorkspaceWidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  titleFa: string;
  enabled: boolean;
  order: number;
  customization: WidgetCustomization;
  customTitle?: string;
  isFloating?: boolean;
}

export interface UserAccount {
  id: string;
  username: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  databasePath?: string;
}

export interface WorkspaceFile {
  id: string;
  name: string;
  size: number; // bytes
  type: string; // mime or extension
  category: 'document' | 'image' | 'data' | 'audio' | 'archive' | 'other';
  uploadedAt: string;
  uploadedBy: string; // user or agent name
  dataUrl?: string;
  url?: string;
  tags?: string[];
  description?: string;
}

export interface ChatAttachment {
  id?: string;
  name: string;
  size?: number;
  type: string;
  dataUrl?: string;
  textExcerpt?: string;
}

export interface AIAgentActionProposal {
  id: string;
  type: 'create_task' | 'update_goal' | 'create_debt_credit' | 'add_calendar_note';
  title: string;
  description: string;
  payload: any;
  executed?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  agentId?: string;
  agentName?: string;
  content: string;
  timestamp: string;
  attachments?: ChatAttachment[];
  isVoice?: boolean;
  audioDuration?: number;
  actionProposal?: AIAgentActionProposal;
}

export interface AIAgentPermissions {
  canViewFinances: boolean;
  canModifyFinances: boolean;
  canManageTasks: boolean;
  canAutoSchedule: boolean;
  canAccessFiles: boolean;
  canDeleteFiles: boolean;
  canAccessSocial: boolean;
  canGenerateReports: boolean;
  canAuthorizeLogs: boolean;
}

export interface AIAgentConfig {
  id: string;
  name: string;
  role: string;
  avatarColor: string;
  model: string;
  systemPrompt?: string;
  permissions?: AIAgentPermissions;
  enabled?: boolean;
  isDefault?: boolean;
  createdAt?: string;
}

export interface ActivityLog {
  id: string;
  actorType: 'user' | 'agent' | 'system';
  actorId: string;
  actorName: string;
  authorizerType: 'direct_user' | 'system_rule' | 'scheduled_cron' | 'api_key';
  authorizerId: string;
  authorizerName: string;
  module: 'tasks' | 'season_goals' | 'finances' | 'social' | 'calendar' | 'notes' | 'chat' | 'system' | 'habits' | 'pomodoro' | 'kanban';
  action: 'create' | 'update' | 'delete' | 'sync' | 'execute_tool' | 'ai_generate';
  descriptionFa: string;
  descriptionEn: string;
  timestamp: string; // ISO date string
  shamsiDate: string;
  status: 'success' | 'failed' | 'pending';
  payload?: any;
}

export interface SeasonGoal {
  id: string;
  title: string;
  season: string; // e.g. "تابستان ۱۴۰۵" / "Summer 2026"
  progress: number; // 0 - 100
  targetDate?: string;
  category?: string;
  description?: string;
  completed: boolean;
  order: number;
}

export interface ReminderNote {
  id: string;
  content: string;
  priority: number; // 0 to 5 stars
  createdAt: string;
  updatedAt: string;
  pinned: boolean;
  category?: string;
  colorTag?: string;
}

export interface BankAccount {
  id: string;
  name: string; // e.g. "حساب اول (ملی)" / "کیف پول تتر (Trust Wallet)"
  bankName?: string;
  balance: number;
  currency: 'TMN' | 'IRR' | 'USD' | 'EUR' | 'USDT' | 'BTC' | 'ETH' | 'TON' | 'SOL' | 'CRYPTO';
  accountNumber?: string;
  color?: string;
  isFavorite?: boolean;
  type?: 'bank' | 'crypto' | 'cash' | 'card';
  network?: string; // e.g. "TRC20", "ERC20", "TON", "Solana"
  walletAddress?: string;
  lastSyncedAt?: string;
  syncStatus?: 'idle' | 'syncing' | 'success' | 'error';
}

export interface DebtCreditItem {
  id: string;
  type: 'debt' | 'credit'; // debt = بدهی من (payable), credit = بستانکاری / طلب من (receivable)
  personOrEntity: string; // e.g. "علی رضایی"
  amount: number;
  currency: 'TMN' | 'IRR' | 'USD' | 'EUR';
  deadline: string; // e.g. "1405/06/01" or "2026-08-22"
  priority: number; // 0 to 5 stars
  status: 'pending' | 'settled' | 'overdue';
  description?: string;
  createdAt: string;
  matchedTransactionId?: string;
}

export type EisenhowerQuadrant = 'do_first' | 'schedule' | 'delegate' | 'eliminate';

export interface DayTask {
  id: string;
  dateKey: string; // ISO format or YYYY-MM-DD
  title: string;
  completed: boolean;
  priority?: 'high' | 'medium' | 'low';
  timeEstimate?: string;
  category?: string;
  eisenhowerQuadrant?: EisenhowerQuadrant;
  scheduledTime?: string; // e.g. "10:30"
  pomodorosSpent?: number;
}

export interface TimeBlock {
  id: string;
  dateKey: string;
  startTime: string; // e.g. "09:00"
  endTime: string; // e.g. "10:30"
  title: string;
  category?: 'focus' | 'meeting' | 'review' | 'rest' | 'personal' | string;
  taskId?: string;
  color?: string;
  completed?: boolean;
}

export interface HabitItem {
  id: string;
  title: string;
  category?: string; // سلامت، تمرکز، یادگیری، کار
  targetDaysPerWeek: number; // 7 = everyday, 5 = weekdays
  color: string;
  icon?: string;
  completedDates: string[]; // ISO format YYYY-MM-DD or dateKey
  createdAt: string;
  seasonGoalId?: string;
}

export interface PomodoroSession {
  id: string;
  taskId?: string;
  taskTitle?: string;
  durationMinutes: number;
  completedAt: string;
  mode: 'focus' | 'short_break' | 'long_break';
}

export interface PomodoroSettings {
  focusDuration: number; // mins (default 25)
  shortBreakDuration: number; // mins (default 5)
  longBreakDuration: number; // mins (default 15)
  longBreakInterval: number; // cycles (default 4)
  soundEnabled: boolean;
  ambientSound: 'none' | 'rain' | 'whitenoise' | 'cafe' | 'waves';
}

export interface BudgetCategory {
  id: string;
  name: string;
  monthlyLimit: number;
  currency: 'TMN' | 'IRR' | 'USD';
  color: string;
  spentAmount: number;
  icon?: string;
}

export interface CashflowTransaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string; // YYYY-MM-DD or dateKey
  bankAccountId?: string;
  description?: string;
}

export interface ScratchpadNote {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  audioDataUrl?: string;
  isVoiceNote?: boolean;
  durationSec?: number;
  tags?: string[];
  pinned?: boolean;
}

export interface KanbanCard {
  id: string;
  columnId: 'backlog' | 'in_progress' | 'review' | 'done';
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  tags?: string[];
  dueDate?: string;
  createdAt: string;
}

export interface SocialChannelMetrics {
  notifications: {
    count: number;
    unread: boolean;
    note?: string;
  };
  comments: {
    count: number;
    pendingReply: number;
    note?: string;
  };
  statistics: {
    viewsOrFollowers: string;
    growth: string;
    summary?: string;
  };
  messages: {
    count: number;
    unread: number;
    note?: string;
  };
}

export type SocialPlatformKey = 'youtube' | 'linkedin' | 'x' | 'instagram' | 'reddit';

export type CanvasWidthMode = 'standard' | 'wide' | 'ultrawide' | 'fluid';
export type GridColumnsMode = 'auto' | '12' | '16' | '24';

export interface AppState {
  currentUser?: UserAccount | null;
  language: Language;
  theme: ThemeMode;
  canvasLayoutMode?: CanvasLayoutMode; // 'spatial-freeform' | 'smart-grid'
  canvasOrientation?: CanvasOrientation; // 'landscape' | 'portrait'
  displayPreset?: DisplayPreset;
  canvasWallpaper?: CanvasWallpaper;
  showCoordinateGrid?: boolean;
  canvasWidthMode?: CanvasWidthMode; // standard (1440px), wide (1920px), ultrawide (2560px), fluid (100% edge-to-edge)
  gridColumnsMode?: GridColumnsMode; // grid columns scaling for wide screens
  canvasRowsCount?: number; // total rows for spatial canvas (expandable to infinity)
  canvasColsCount?: number; // total cols (12, 16, 24)
  isPrivacyMode: boolean; // hide balances
  widgets: WorkspaceWidgetConfig[];
  activityLogs: ActivityLog[];
  seasonGoals: SeasonGoal[];
  reminderNotes: ReminderNote[];
  bankAccounts: BankAccount[];
  debtsCredits: DebtCreditItem[];
  tasks: DayTask[];
  dateNotes: Record<string, string>; // dateKey -> note
  socialMetrics: Record<SocialPlatformKey, SocialChannelMetrics>;
  activeDayOffset: number;
  aiAgents: AIAgentConfig[];
  chatHistory: ChatMessage[];
  files: WorkspaceFile[];
  habits?: HabitItem[];
  pomodoroSessions?: PomodoroSession[];
  pomodoroSettings?: PomodoroSettings;
  budgetCategories?: BudgetCategory[];
  cashflowTransactions?: CashflowTransaction[];
  scratchpadNotes?: ScratchpadNote[];
  kanbanCards?: KanbanCard[];
  timeBlocks?: TimeBlock[];
}
