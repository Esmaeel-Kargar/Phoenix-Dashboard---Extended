import {
  AppState,
  BankAccount,
  DebtCreditItem,
  ReminderNote,
  SeasonGoal,
  DayTask,
  SocialPlatformKey,
  SocialChannelMetrics,
  WorkspaceWidgetConfig,
  ActivityLog,
  AIAgentConfig,
  ChatMessage,
  HabitItem,
  BudgetCategory,
  CashflowTransaction,
  KanbanCard,
  ScratchpadNote,
  TimeBlock,
  WidgetType,
} from '../types';
import { getFormattedDateInfo } from './jalali';
import { WALLPAPER_PRESETS } from './themePresets';

const STORAGE_KEY = 'PERSONAL_WORK_MANAGEMENT_STATE_V2';

export const DEFAULT_REFERENCE_DATE = new Date(2026, 7, 14, 18, 38);

export const DEFAULT_WIDGETS: WorkspaceWidgetConfig[] = [
  {
    id: 'widget-executive-hud',
    type: 'executive_hud',
    title: 'Executive Command HUD & Live Pulse',
    titleFa: 'اتاق فرمان و HUD شاخص‌های کلیدی مدیریت',
    enabled: true,
    order: 0,
    customization: {
      bgColor: '#0b111e',
      textColor: '#f8fafc',
      fontFamily: 'vazir',
      fontSize: 'base',
      colSpan: 12,
      rowSpan: 1,
      gridPosition: { col: 1, row: 1 },
    },
  },
  {
    id: 'widget-calendar',
    type: 'calendar',
    title: 'Solar & Gregorian Calendar & Notes',
    titleFa: 'تقویم خورشیدی و میلادی و نوت روز',
    enabled: true,
    order: 1,
    customization: {
      bgColor: '#131b27',
      textColor: '#ffffff',
      fontFamily: 'vazir',
      fontSize: 'base',
      colSpan: 4,
      rowSpan: 2,
      gridPosition: { col: 1, row: 2 },
    },
  },
  {
    id: 'widget-season-goals',
    type: 'season_goals',
    title: 'Season Work Goals',
    titleFa: 'اهداف فصل کاری و پیشرفت نقشه راه',
    enabled: true,
    order: 2,
    customization: {
      bgColor: '#091c16',
      textColor: '#ffffff',
      fontFamily: 'vazir',
      fontSize: 'base',
      colSpan: 8,
      rowSpan: 1,
      gridPosition: { col: 5, row: 2 },
    },
  },
  {
    id: 'widget-bank-accounts',
    type: 'bank_accounts',
    title: 'Bank Accounts & Balances',
    titleFa: 'مانده حساب‌های بانکی و نقدینگی',
    enabled: true,
    order: 3,
    customization: {
      bgColor: '#1c130b',
      textColor: '#ffffff',
      fontFamily: 'vazir',
      fontSize: 'base',
      colSpan: 8,
      rowSpan: 1,
      gridPosition: { col: 5, row: 3 },
    },
  },
  {
    id: 'widget-task-matrix',
    type: 'task_matrix',
    title: '7-Day Rolling Task Matrix',
    titleFa: 'ماتریس هفتگی تسک‌ها (برنامه‌ریزی غلتان)',
    enabled: true,
    order: 4,
    customization: {
      bgColor: '#0f172a',
      textColor: '#f8fafc',
      fontFamily: 'vazir',
      fontSize: 'base',
      colSpan: 12,
      rowSpan: 2,
      gridPosition: { col: 1, row: 4 },
    },
  },
  {
    id: 'widget-meeting-chat',
    type: 'meeting_chat',
    title: 'AI Multi-Agent Meeting & Chat',
    titleFa: 'جلسه و اتاق گفتگوی چند-ایجنت هوشمند',
    enabled: true,
    order: 5,
    customization: {
      bgColor: '#1e1b4b',
      textColor: '#f8fafc',
      fontFamily: 'vazir',
      fontSize: 'base',
      colSpan: 6,
      rowSpan: 2,
    },
  },
  {
    id: 'widget-file-manager',
    type: 'file_manager',
    title: 'Workspace File & Asset Manager',
    titleFa: 'مدیریت و مخزن اسناد و فایل‌ها',
    enabled: true,
    order: 6,
    customization: {
      bgColor: '#ffffff',
      textColor: '#0f172a',
      fontFamily: 'vazir',
      fontSize: 'base',
      colSpan: 6,
      rowSpan: 2,
    },
  },
  {
    id: 'widget-ai-season-report',
    type: 'ai_season_report',
    title: 'AI Seasonal Performance Analyst',
    titleFa: 'تولید هوشمند گزارش عملکرد فصلی (Gemini AI)',
    enabled: true,
    order: 7,
    customization: {
      bgColor: '#0f172a',
      textColor: '#f8fafc',
      fontFamily: 'vazir',
      fontSize: 'base',
      colSpan: 4,
      rowSpan: 1,
    },
  },
  {
    id: 'widget-reminder-notes',
    type: 'reminder_notes',
    title: 'Temporary Reminder Notes',
    titleFa: 'نوت‌های موقت یادآوری',
    enabled: true,
    order: 8,
    customization: {
      bgColor: '#7030A0',
      textColor: '#ffffff',
      fontFamily: 'vazir',
      fontSize: 'base',
      colSpan: 4,
      rowSpan: 1,
    },
  },
  {
    id: 'widget-debts-credits',
    type: 'debts_credits',
    title: 'Debts & Receivables',
    titleFa: 'بدهی‌ها و طلب‌ها (سررسید و تسویه‌ها)',
    enabled: true,
    order: 9,
    customization: {
      bgColor: '#7030A0',
      textColor: '#ffffff',
      fontFamily: 'vazir',
      fontSize: 'base',
      colSpan: 4,
      rowSpan: 1,
    },
  },
  {
    id: 'widget-activity-logs',
    type: 'activity_logs',
    title: 'System & Agent Activity Logs',
    titleFa: 'مرکز لاگ‌ها و رویدادها (تفکیک انجام‌دهنده و مجوزدهنده)',
    enabled: true,
    order: 10,
    customization: {
      bgColor: '#ffffff',
      textColor: '#0f172a',
      fontFamily: 'vazir',
      fontSize: 'base',
      colSpan: 12,
      rowSpan: 2,
    },
  },
  {
    id: 'widget-social-hub',
    type: 'social_hub',
    title: 'Social Channels Tracker',
    titleFa: 'رصد شبکه‌های اجتماعی (یوتیوب، لینکدین، X، اینستاگرام، ردیت)',
    enabled: true,
    order: 11,
    customization: {
      bgColor: '#ffffff',
      textColor: '#1e293b',
      fontFamily: 'vazir',
      fontSize: 'base',
      colSpan: 8,
      rowSpan: 1,
    },
  },
  {
    id: 'widget-habit-tracker',
    type: 'habit_tracker',
    title: 'Habit & Routine Tracker',
    titleFa: 'ردیاب عادات، روتین‌ها و استمرار (Streak Tracker)',
    enabled: true,
    order: 12,
    customization: {
      bgColor: '#ffffff',
      textColor: '#0f172a',
      fontFamily: 'vazir',
      fontSize: 'base',
      colSpan: 6,
      rowSpan: 2,
    },
  },
  {
    id: 'widget-pomodoro-timer',
    type: 'pomodoro_timer',
    title: 'Focus & Pomodoro Timer',
    titleFa: 'تایمر تمرکز عمیق و پومودورو (با صدای امبینت)',
    enabled: true,
    order: 13,
    customization: {
      bgColor: '#1e1b4b',
      textColor: '#ffffff',
      fontFamily: 'vazir',
      fontSize: 'base',
      colSpan: 6,
      rowSpan: 2,
    },
  },
  {
    id: 'widget-cashflow-budget',
    type: 'cashflow_budget',
    title: 'Cashflow & Budget Analytics',
    titleFa: 'بودجه‌بندی و تحلیل جریان نقدینگی ماهانه',
    enabled: true,
    order: 14,
    customization: {
      bgColor: '#ffffff',
      textColor: '#0f172a',
      fontFamily: 'vazir',
      fontSize: 'base',
      colSpan: 6,
      rowSpan: 2,
    },
  },
  {
    id: 'widget-kanban-board',
    type: 'kanban_board',
    title: 'Project Kanban Board',
    titleFa: 'تخته کانبان پروژه‌ها و جریان کار',
    enabled: true,
    order: 15,
    customization: {
      bgColor: '#ffffff',
      textColor: '#0f172a',
      fontFamily: 'vazir',
      fontSize: 'base',
      colSpan: 12,
      rowSpan: 2,
    },
  },
  {
    id: 'widget-quick-scratchpad',
    type: 'quick_scratchpad',
    title: 'Voice & Quick Scratchpad',
    titleFa: 'یادداشت سریع و ضبط صوت هوشمند',
    enabled: true,
    order: 16,
    customization: {
      bgColor: '#ffffff',
      textColor: '#0f172a',
      fontFamily: 'vazir',
      fontSize: 'base',
      colSpan: 6,
      rowSpan: 2,
    },
  },
];

export const INITIAL_AI_AGENTS: AIAgentConfig[] = [
  {
    id: 'agent_gemini_ops',
    name: 'ایجنت تحلیل عملیات و تسک‌ها',
    role: 'مدیریت و پیگیری وظایف و کنترل زمان‌بندی‌ها',
    avatarColor: '#3b82f6',
    model: 'gemini-3.7-flash',
    enabled: true,
    isDefault: true,
    permissions: {
      canViewFinances: false,
      canModifyFinances: false,
      canManageTasks: true,
      canAutoSchedule: true,
      canAccessFiles: true,
      canDeleteFiles: false,
      canAccessSocial: false,
      canGenerateReports: true,
      canAuthorizeLogs: true,
    },
  },
  {
    id: 'agent_gemini_finance',
    name: 'ایجنت مدیریت مالی و خزانه‌داری',
    role: 'پایش مطالبات، هشدار سررسید بدهی‌ها و موجودی حساب‌ها',
    avatarColor: '#10b981',
    model: 'gemini-3.7-flash',
    enabled: true,
    isDefault: true,
    permissions: {
      canViewFinances: true,
      canModifyFinances: true,
      canManageTasks: false,
      canAutoSchedule: false,
      canAccessFiles: true,
      canDeleteFiles: false,
      canAccessSocial: false,
      canGenerateReports: true,
      canAuthorizeLogs: true,
    },
  },
  {
    id: 'agent_gemini_social',
    name: 'ایجنت رشد شبکه‌های اجتماعی',
    role: 'تحلیل انگیجمنت، بازخورد مخاطبان و کامنت‌ها',
    avatarColor: '#8b5cf6',
    model: 'gemini-3.7-flash',
    enabled: true,
    isDefault: true,
    permissions: {
      canViewFinances: false,
      canModifyFinances: false,
      canManageTasks: false,
      canAutoSchedule: false,
      canAccessFiles: true,
      canDeleteFiles: false,
      canAccessSocial: true,
      canGenerateReports: true,
      canAuthorizeLogs: false,
    },
  },
];

export const INITIAL_FILES = [
  {
    id: 'file-doc-1',
    name: 'طرح_جامع_توسعه_فصل_تابستان_۱۴۰۵.pdf',
    size: 2450000,
    type: 'application/pdf',
    category: 'document' as const,
    uploadedAt: '2026-08-14T08:30:00Z',
    uploadedBy: 'اسماعیل کارگر',
    description: 'سند نیازمندی‌های فاز دوم و نقشه راه معماری سیستم',
    tags: ['برنامه‌ریزی', 'نقشه_راه', 'اسناد_فنی'],
  },
  {
    id: 'file-data-2',
    name: 'گزارش_مالی_تیرماه_و_موجودی_حسابها.xlsx',
    size: 890000,
    type: 'application/vnd.ms-excel',
    category: 'data' as const,
    uploadedAt: '2026-08-13T14:15:00Z',
    uploadedBy: 'ایجنت مدیریت مالی',
    description: 'اکسل گردش حساب‌های بانکی و مطالبات وصول‌شده',
    tags: ['حسابداری', 'ترازنامه', 'خزانه‌داری'],
  },
  {
    id: 'file-img-3',
    name: 'نمودار_معماری_ماتریس_تسکها.png',
    size: 1250000,
    type: 'image/png',
    category: 'image' as const,
    uploadedAt: '2026-08-12T11:00:00Z',
    uploadedBy: 'اسماعیل کارگر',
    description: 'دیاگرام ارتباطی اجزای فضای کاری و ایجنت‌ها',
    tags: ['طراحی', 'دیاگرام', 'UI/UX'],
  },
];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'log-1',
    actorType: 'user',
    actorId: 'user_esmaeel',
    actorName: 'اسماعیل کارگر (مدیر فضا)',
    authorizerType: 'direct_user',
    authorizerId: 'user_esmaeel',
    authorizerName: 'اسماعیل کارگر',
    module: 'season_goals',
    action: 'update',
    descriptionFa: 'بروزرسانی پیشرفت هدف فصلی توسعه پلتفرم سازمانی به ۷۵٪',
    descriptionEn: 'Updated Season Goal 1 progress to 75%',
    timestamp: '2026-08-14T17:45:00Z',
    shamsiDate: '۱۴۰۵/۰۵/۲۳ ۱۸:۱۵',
    status: 'success',
  },
  {
    id: 'log-2',
    actorType: 'agent',
    actorId: 'agent_gemini_finance',
    actorName: 'ایجنت مدیریت مالی و خزانه‌داری',
    authorizerType: 'direct_user',
    authorizerId: 'user_esmaeel',
    authorizerName: 'اسماعیل کارگر (دستور تایید تسویه)',
    module: 'finances',
    action: 'sync',
    descriptionFa: 'بررسی سررسید بدهی اجاره دفتر کاری (سررسید ۱۴۰۵/۰۶/۰۱) و ارسال هشدار نقدینگی',
    descriptionEn: 'Monitored office rent debt due date (1405/06/01) and sent liquidity alert',
    timestamp: '2026-08-14T16:20:00Z',
    shamsiDate: '۱۴۰۵/۰۵/۲۳ ۱۶:۵۰',
    status: 'success',
  },
  {
    id: 'log-3',
    actorType: 'agent',
    actorId: 'agent_gemini_social',
    actorName: 'ایجنت رشد شبکه‌های اجتماعی',
    authorizerType: 'scheduled_cron',
    authorizerId: 'cron_social_sync',
    authorizerName: 'فرایند زمان‌بندی خودکار سیستم',
    module: 'social',
    action: 'sync',
    descriptionFa: 'همگام‌سازی و تحلیل داده‌های کانال یوتیوب (۴۸.۲K سابسکرایبر و ۱۲.۴٪ رشد ماهانه)',
    descriptionEn: 'Synced YouTube metrics (48.2K Subs, +12.4% MoM)',
    timestamp: '2026-08-14T15:00:00Z',
    shamsiDate: '۱۴۰۵/۰۵/۲۳ ۱۵:۳۰',
    status: 'success',
  },
  {
    id: 'log-4',
    actorType: 'user',
    actorId: 'user_esmaeel',
    actorName: 'اسماعیل کارگر (مدیر فضا)',
    authorizerType: 'direct_user',
    authorizerId: 'user_esmaeel',
    authorizerName: 'اسماعیل کارگر',
    module: 'tasks',
    action: 'update',
    descriptionFa: 'تکمیل تسک شماره ۱ روز جاری: بازبینی هفتگی اهداف و ثبت گزارش',
    descriptionEn: 'Marked Task 1 completed for today',
    timestamp: '2026-08-14T11:30:00Z',
    shamsiDate: '۱۴۰۵/۰۵/۲۳ ۱۲:۰۰',
    status: 'success',
  },
  {
    id: 'log-5',
    actorType: 'agent',
    actorId: 'agent_gemini_ops',
    actorName: 'ایجنت تحلیل عملیات و تسک‌ها',
    authorizerType: 'direct_user',
    authorizerId: 'user_esmaeel',
    authorizerName: 'اسماعیل کارگر',
    module: 'tasks',
    action: 'ai_generate',
    descriptionFa: 'پیشنهاد و زمان‌بندی ۳ تسک مهم برای شنبه (جلسه تیم توسعه، استراتژی محتوا، تسویه بدهی)',
    descriptionEn: 'Scheduled 3 recommended tasks for tomorrow',
    timestamp: '2026-08-14T09:10:00Z',
    shamsiDate: '۱۴۰۵/۰۵/۲۳ ۰۹:۴۰',
    status: 'success',
  },
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'user',
    content: 'سلام به همه ایجنت‌ها. وضعیت پیشرفت اهداف فصل تابستان و هماهنگی تسک‌های شنبه چطور است؟',
    timestamp: '2026-08-14T17:50:00Z',
  },
  {
    id: 'msg-2',
    sender: 'agent',
    agentId: 'agent_gemini_ops',
    agentName: 'ایجنت تحلیل عملیات و تسک‌ها',
    content: 'سلام اسماعیل جان! هدف اول (توسعه نسخه سازمانی) روی ۷۵٪ است و تسک‌های روز شنبه از جمله جلسه ساعت ۱۰ با تیم توسعه در تقویم رزرو شده است.',
    timestamp: '2026-08-14T17:51:00Z',
  },
  {
    id: 'msg-3',
    sender: 'agent',
    agentId: 'agent_gemini_finance',
    agentName: 'ایجنت مدیریت مالی و خزانه‌داری',
    content: 'مجموع مطالبات وصول‌نشده ۴۵ میلیون تومان و بدهی سررسید اول شهریور ۲۸ میلیون تومان است. نقدینگی فعلی در حساب ملت برای تسویه کاملاً کافی است.',
    timestamp: '2026-08-14T17:52:00Z',
  },
];

export function getInitialDefaultState(): AppState {
  const dateInfo = getFormattedDateInfo(DEFAULT_REFERENCE_DATE);

  const dayKeys: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(DEFAULT_REFERENCE_DATE);
    d.setDate(d.getDate() + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    dayKeys.push(`${y}-${m}-${day}`);
  }

  const initialGoals: SeasonGoal[] = [
    {
      id: 'g-1',
      title: 'هدف اول: توسعه و استقرار نسخه سازمانی پلتفرم و اتوماسیون فرایندهای کاری',
      season: 'تابستان ۱۴۰۵',
      progress: 75,
      completed: false,
      order: 1,
      targetDate: '1405/06/31',
      category: 'توسعه محصول',
    },
    {
      id: 'g-2',
      title: 'هدف دوم: افزایش ۴۰ درصدی تعاملات کانال‌های اجتماعی و تدوین کمپین محتوایی',
      season: 'تابستان ۱۴۰۵',
      progress: 45,
      completed: false,
      order: 2,
      targetDate: '1405/06/20',
      category: 'بازاریابی و محتوا',
    },
    {
      id: 'g-3',
      title: 'هدف سوم: مدیریت تعهدات مالی، وصول مطالبات معوق و ارتقای مانده حساب‌ها',
      season: 'تابستان ۱۴۰۵',
      progress: 60,
      completed: false,
      order: 3,
      targetDate: '1405/06/15',
      category: 'مدیریت مالی',
    },
  ];

  const initialNotes: ReminderNote[] = [
    {
      id: 'note-1',
      content: 'بررسی پیش‌نویس قرارداد پیمانکاران تا دوشنبه و هماهنگی جلسه نهایی تایید پیش‌فاکتور',
      priority: 5,
      createdAt: '2026-08-14T09:30:00Z',
      updatedAt: '2026-08-14T10:00:00Z',
      pinned: true,
      category: 'قراردادها',
      colorTag: 'purple',
    },
    {
      id: 'note-2',
      content: 'تماس با پشتیبانی فنی جهت تمدید لایسنس سرورها و بازبینی دوره‌ای بک‌آپ پایگاه داده',
      priority: 4,
      createdAt: '2026-08-14T11:15:00Z',
      updatedAt: '2026-08-14T11:15:00Z',
      pinned: true,
      category: 'زیرساخت',
      colorTag: 'blue',
    },
    {
      id: 'note-3',
      content: 'آماده‌سازی فایل ارائه آماری کانال‌های یوتیوب و لینکدین برای جلسه بررسی فصلی',
      priority: 3,
      createdAt: '2026-08-13T14:20:00Z',
      updatedAt: '2026-08-13T14:20:00Z',
      pinned: false,
      category: 'گزارش‌دهی',
      colorTag: 'green',
    },
    {
      id: 'note-4',
      content: 'پیگیری وضعیت سفارش تجهیزات سخت‌افزاری و دریافت فاکتور رسمی',
      priority: 2,
      createdAt: '2026-08-12T16:45:00Z',
      updatedAt: '2026-08-12T16:45:00Z',
      pinned: false,
      category: 'تدارکات',
      colorTag: 'amber',
    },
  ];

  const initialAccounts: BankAccount[] = [
    {
      id: 'acc-1',
      name: 'حساب اول',
      bankName: 'بانک ملت - جاری کسب‌وکار',
      balance: 185400000,
      currency: 'TMN',
      accountNumber: 'IR820120000000012345678901',
      color: '#4472C4',
      isFavorite: true,
    },
    {
      id: 'acc-2',
      name: 'حساب دوم',
      bankName: 'بانک سامان - پس‌انداز و سرمایه‌گذاری',
      balance: 92000000,
      currency: 'TMN',
      accountNumber: 'IR440560000000098765432101',
      color: '#548235',
      isFavorite: true,
    },
    {
      id: 'acc-3',
      name: 'حساب سوم',
      bankName: 'بانک پاسارگاد - تنخواه و مخارج عملیاتی',
      balance: 34800000,
      currency: 'TMN',
      accountNumber: 'IR190570000000055443322101',
      color: '#C00000',
      isFavorite: false,
      type: 'bank',
    },
    {
      id: 'acc-crypto-1',
      name: 'کیف پول تتر و درآمد دلاری',
      bankName: 'Trust Wallet (خزانه‌داری ارزی)',
      balance: 3250,
      currency: 'USDT',
      type: 'crypto',
      network: 'TRC20',
      walletAddress: 'TYDzsxdUKn5PFi8m1mUe7f3iU3...',
      color: '#10b981',
      isFavorite: true,
    },
  ];

  const initialDebtsCredits: DebtCreditItem[] = [
    {
      id: 'dc-1',
      type: 'credit',
      personOrEntity: 'شرکت فناوری نوین (حق‌الزحمه مشاوره و فاز ۲)',
      amount: 45000000,
      currency: 'TMN',
      deadline: '1405/05/30',
      priority: 5,
      status: 'pending',
      description: 'مطالبه بابت مشاوره معماری نرم‌افزار ماه مرداد',
      createdAt: '2026-08-10',
    },
    {
      id: 'dc-2',
      type: 'debt',
      personOrEntity: 'پرداخت اجاره دفتر کاری و شارژ ساختمان',
      amount: 28000000,
      currency: 'TMN',
      deadline: '1405/06/01',
      priority: 5,
      status: 'pending',
      description: 'سررسید اول شهریور ماه ۱۴۰۵',
      createdAt: '2026-08-12',
    },
    {
      id: 'dc-3',
      type: 'debt',
      personOrEntity: 'تسویه فاکتور سرورها و زیرساخت ابری',
      amount: 16500000,
      currency: 'TMN',
      deadline: '1405/06/10',
      priority: 4,
      status: 'pending',
      description: 'هزینه‌های ماهانه کلاود و هاستینگ',
      createdAt: '2026-08-11',
    },
    {
      id: 'dc-4',
      type: 'credit',
      personOrEntity: 'مهندس رضایی (تسویه نهایی فاز آزمایشی)',
      amount: 22000000,
      currency: 'TMN',
      deadline: '1405/06/05',
      priority: 3,
      status: 'pending',
      description: 'بستانکاری توافق‌شده پروژه مشترک',
      createdAt: '2026-08-08',
    },
  ];

  const initialTasks: DayTask[] = [
    { id: 't-1', dateKey: dayKeys[0], title: 'بازبینی هفتگی اهداف و ثبت گزارش', completed: true, priority: 'high', timeEstimate: '45m' },
    { id: 't-2', dateKey: dayKeys[0], title: 'بررسی ایمیل‌ها و هماهنگی تقویم هفته', completed: false, priority: 'medium', timeEstimate: '30m' },
    { id: 't-3', dateKey: dayKeys[1], title: 'جلسه هماهنگی هفتگی تیم توسعه ساعت ۱۰', completed: false, priority: 'high', timeEstimate: '1h' },
    { id: 't-4', dateKey: dayKeys[1], title: 'تدوین استراتژی محتوای یوتیوب و لینکدین', completed: false, priority: 'medium', timeEstimate: '1.5h' },
    { id: 't-5', dateKey: dayKeys[1], title: 'بازبینی تسویه بدهی‌های سررسید اول ماه', completed: false, priority: 'high', timeEstimate: '20m' },
    { id: 't-6', dateKey: dayKeys[2], title: 'جلسه با کارفرما جهت ارائه پیشرفت فاز اول', completed: false, priority: 'high', timeEstimate: '1.5h' },
    { id: 't-7', dateKey: dayKeys[3], title: 'ضبط و تدوین ویدیو آموزشی یوتیوب', completed: false, priority: 'medium', timeEstimate: '2h' },
    { id: 't-8', dateKey: dayKeys[3], title: 'تحلیل داده‌های تعامل در پلتفرم X و ردیت', completed: false, priority: 'low', timeEstimate: '45m' },
    { id: 't-9', dateKey: dayKeys[5], title: 'پیگیری مطالبات معوق و تماس با مشتریان', completed: false, priority: 'high', timeEstimate: '1h' },
    { id: 't-10', dateKey: dayKeys[5], title: 'بررسی کد و تایید Pull Requestهای گیت‌هاب', completed: false, priority: 'medium', timeEstimate: '1.5h' },
    { id: 't-11', dateKey: dayKeys[5], title: 'ثبت اسناد در نرم‌افزار حسابداری', completed: false, priority: 'low', timeEstimate: '30m' },
    { id: 't-12', dateKey: dayKeys[6], title: 'جمع‌بندی تسک‌های هفتگی و برنامه‌ریزی هفته جدید', completed: false, priority: 'medium', timeEstimate: '1h' },
  ];

  const initialSocialMetrics: Record<SocialPlatformKey, SocialChannelMetrics> = {
    youtube: {
      notifications: { count: 14, unread: true, note: '۴ کامنت پرلایک و ۲ سابسکرایب برجسته' },
      comments: { count: 38, pendingReply: 5, note: 'پاسخ به سوالات ویدیوی معماری سیستم' },
      statistics: { viewsOrFollowers: '48.2K Subs', growth: '+12.4% MoM', summary: '۱۸۰K بازدید ویدیوها در ۳۰ روز اخیر' },
      messages: { count: 7, unread: 2, note: 'پیشنهاد اسپانسرشیپ و همکاری محتوایی' },
    },
    linkedin: {
      notifications: { count: 29, unread: true, note: '۹ بازدید پروفایل و ۴ اشتراک‌گذاری پست' },
      comments: { count: 19, pendingReply: 2, note: 'بحث پیرامون متدولوژی مدیریت پروژه' },
      statistics: { viewsOrFollowers: '15.8K Conn', growth: '+8.6% MoM', summary: '۴۲K ایمپرشن پست‌های فنی هفتگی' },
      messages: { count: 12, unread: 3, note: 'درخواست مشاوره معماری سازمانی' },
    },
    x: {
      notifications: { count: 43, unread: true, note: 'رتوییت توسط اکانت‌های تکنولوژی' },
      comments: { count: 52, pendingReply: 8, note: 'مکالمات در تِرِد هوش مصنوعی' },
      statistics: { viewsOrFollowers: '24.1K Foll', growth: '+14.1% MoM', summary: '۲۱۰K ایمپرشن کلی در ماه اخیر' },
      messages: { count: 5, unread: 1, note: 'دعوت به پادکست توسعه نرم‌افزار' },
    },
    instagram: {
      notifications: { count: 67, unread: true, note: 'منشن در استوری‌ها و لایک ریلزها' },
      comments: { count: 84, pendingReply: 11, note: 'سوالات درباره ابزارها و دوره آموزشی' },
      statistics: { viewsOrFollowers: '32.5K Foll', growth: '+18.2% MoM', summary: 'نرخ انگیجمنت ۶.۸٪ در استوری‌ها' },
      messages: { count: 19, unread: 4, note: 'پیام‌های دایرکت مشاوره و ثبت‌نام' },
    },
    reddit: {
      notifications: { count: 8, unread: false, note: 'آپ‌ووت در ساب‌ردیت‌های برنامه‌نویسی' },
      comments: { count: 14, pendingReply: 1, note: 'پاسخ تکمیلی به پست بهینه‌سازی React' },
      statistics: { viewsOrFollowers: '8.4K Karma', growth: '+5.3% MoM', summary: 'Top 5% Karma در r/reactjs' },
      messages: { count: 3, unread: 0, note: 'پیام از مدیر ساب‌ردیت' },
    },
  };

  const initialHabits: HabitItem[] = [
    {
      id: 'habit-1',
      title: 'ورزش و تمرینات کششی صبحگاهی (۳۰ دقیقه)',
      category: 'سلامت',
      targetDaysPerWeek: 7,
      color: '#10b981',
      completedDates: [dayKeys[0], dayKeys[1], dayKeys[2]],
      createdAt: '2026-08-01',
    },
    {
      id: 'habit-2',
      title: 'تمرکز عمیق (Deep Work) و برنامه‌نویسی بدون وقفه',
      category: 'کار',
      targetDaysPerWeek: 5,
      color: '#3b82f6',
      completedDates: [dayKeys[0], dayKeys[2]],
      createdAt: '2026-08-01',
    },
    {
      id: 'habit-3',
      title: 'مطالعه مقالات هوش مصنوعی و معماری سیستم (۲۰ دقیقه)',
      category: 'یادگیری',
      targetDaysPerWeek: 5,
      color: '#8b5cf6',
      completedDates: [dayKeys[0], dayKeys[1]],
      createdAt: '2026-08-01',
    },
    {
      id: 'habit-4',
      title: 'بررسی بیلان مالی و کنترل حساب‌ها در پایان روز',
      category: 'مالی',
      targetDaysPerWeek: 7,
      color: '#f59e0b',
      completedDates: [dayKeys[0]],
      createdAt: '2026-08-01',
    },
  ];

  const initialBudgetCategories: BudgetCategory[] = [
    {
      id: 'budget-1',
      name: 'هزینه‌های زیرساخت سرور و هوش مصنوعی',
      monthlyLimit: 15000000,
      spentAmount: 8500000,
      currency: 'TMN',
      color: '#3b82f6',
      icon: 'Server',
    },
    {
      id: 'budget-2',
      name: 'تبلیغات، اسپانسرشیپ و رشد رسانه‌ها',
      monthlyLimit: 25000000,
      spentAmount: 14200000,
      currency: 'TMN',
      color: '#8b5cf6',
      icon: 'Megaphone',
    },
    {
      id: 'budget-3',
      name: 'ابزارها، لایسنس نرم‌افزارها و تجهیزات',
      monthlyLimit: 12000000,
      spentAmount: 6000000,
      currency: 'TMN',
      color: '#10b981',
      icon: 'Layers',
    },
    {
      id: 'budget-4',
      name: 'هزینه‌های جاری، دفتری و خدمات عمومی',
      monthlyLimit: 18000000,
      spentAmount: 11000000,
      currency: 'TMN',
      color: '#f59e0b',
      icon: 'Briefcase',
    },
  ];

  const initialCashflow: CashflowTransaction[] = [
    {
      id: 'cf-1',
      title: 'دریافت پیش‌پرداخت پروژه مشاوره ابری',
      amount: 45000000,
      type: 'income',
      category: 'پروژه‌ها',
      date: dayKeys[0],
      bankAccountId: 'acc-1',
      description: 'واریز قسط اول قرارداد فصلی',
    },
    {
      id: 'cf-2',
      title: 'تمدید اشتراک سرورهای ابری Hetzner',
      amount: 3200000,
      type: 'expense',
      category: 'هزینه‌های زیرساخت سرور و هوش مصنوعی',
      date: dayKeys[1],
      bankAccountId: 'acc-2',
      description: 'پرداخت ماهانه صورتحساب کلاود',
    },
    {
      id: 'cf-3',
      title: 'تسویه فاکتور طراح UI/UX',
      amount: 8500000,
      type: 'expense',
      category: 'ابزارها، لایسنس نرم‌افزارها و تجهیزات',
      date: dayKeys[2],
      bankAccountId: 'acc-1',
      description: 'تسویه دستمزد طراحی رابط کاربری',
    },
  ];

  const initialKanban: KanbanCard[] = [
    {
      id: 'kb-1',
      columnId: 'backlog',
      title: 'معماری خط لوله پردازش چند ایجنتی با Gemini 2.5/3.0',
      description: 'تحلیل پرامپت‌ها و ساختار ابزارهای اکشن اتوماتیک',
      priority: 'high',
      tags: ['هوش مصنوعی', 'معماری'],
      dueDate: dayKeys[5],
      createdAt: '2026-08-10',
    },
    {
      id: 'kb-2',
      columnId: 'in_progress',
      title: 'پیاده‌سازی ماژول بودجه‌بندی نقدینگی و ردیاب عادات',
      description: 'طراحی ویجت‌های تعاملی با قابلیت سفارشی‌سازی زنده',
      priority: 'high',
      tags: ['Frontend', 'UI'],
      dueDate: dayKeys[1],
      createdAt: '2026-08-12',
    },
    {
      id: 'kb-3',
      columnId: 'review',
      title: 'اتصال هوشمند پیامک‌های واریزی به دفتر تسویه بدهی‌ها',
      description: 'تست رگولار اکسپرشن‌های بانک ملی، سامان و ملت',
      priority: 'medium',
      tags: ['فین‌تک', 'بانک'],
      dueDate: dayKeys[2],
      createdAt: '2026-08-11',
    },
    {
      id: 'kb-4',
      columnId: 'done',
      title: 'طراحی داشبورد چندبعدی با پشتیبانی از مانیتورهای عریض 2K/4K',
      description: 'پیکربندی استایل‌ها و بهینه‌سازی ریسپانسیو',
      priority: 'low',
      tags: ['UI', 'Release'],
      dueDate: dayKeys[0],
      createdAt: '2026-08-08',
    },
  ];

  const initialScratchpad: ScratchpadNote[] = [
    {
      id: 'sp-1',
      title: 'ایده‌های جلسه توسعه محصول با تیم بازاریابی',
      content: '• تمرکز روی قابلیت آفلاین PWA\n• اتصال خودکار بات تلگرام جهت ارسال سریع تسک‌ها با ویس\n• افزودن خروجی استاندارد PDF به گزارش عملکرد فصلی',
      updatedAt: '2026-08-14 17:30',
      pinned: true,
      tags: ['ایده', 'توسعه'],
    },
    {
      id: 'sp-2',
      title: 'یادداشت صوتی: نکات مهم قرارداد پشتیبانی نرم‌افزار',
      content: 'در قرارداد جدید حتماً بند مربوط به زمان پاسخگویی ۴ ساعته در روزهای تعطیل و بازپرداخت ۵۰٪ هزینه در صورت قطعی ذکر شود.',
      updatedAt: '2026-08-13 11:20',
      isVoiceNote: true,
      durationSec: 34,
      tags: ['قرارداد', 'صوتی'],
    },
  ];

  const initialTimeBlocks: TimeBlock[] = [
    {
      id: 'tb-1',
      dateKey: dayKeys[0],
      startTime: '09:00',
      endTime: '11:00',
      title: 'تمرکز عمیق (Deep Work) روی ماژول هوش مصنوعی',
      category: 'focus',
      color: '#3b82f6',
    },
    {
      id: 'tb-2',
      dateKey: dayKeys[0],
      startTime: '11:30',
      endTime: '12:30',
      title: 'جلسه هماهنگی هفتگی با مدیران پروژه',
      category: 'meeting',
      color: '#8b5cf6',
    },
    {
      id: 'tb-3',
      dateKey: dayKeys[0],
      startTime: '15:00',
      endTime: '16:00',
      title: 'بررسی وضعیت مانده حساب‌ها و مطالبات',
      category: 'review',
      color: '#10b981',
    },
  ];

  return {
    currentUser: {
      id: 'user-default',
      username: 'manager',
      email: 'manager@workspace.local',
      name: 'اسماعیل کارگر (مدیر فضا)',
      avatar: '',
      createdAt: '2026-08-14T00:00:00Z',
      databasePath: 'data/users/user-default/database.json',
    },
    language: 'fa',
    theme: 'obsidian',
    canvasLayoutMode: 'spatial-freeform',
    canvasWallpaper: WALLPAPER_PRESETS[0],
    showCoordinateGrid: true,
    canvasWidthMode: 'wide',
    gridColumnsMode: 'auto',
    isPrivacyMode: false,
    widgets: DEFAULT_WIDGETS,
    activityLogs: INITIAL_ACTIVITY_LOGS,
    aiAgents: INITIAL_AI_AGENTS,
    chatHistory: INITIAL_CHAT_MESSAGES,
    files: INITIAL_FILES,
    seasonGoals: initialGoals,
    reminderNotes: initialNotes,
    bankAccounts: initialAccounts,
    debtsCredits: initialDebtsCredits,
    tasks: initialTasks,
    habits: initialHabits,
    pomodoroSessions: [],
    pomodoroSettings: {
      focusDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      longBreakInterval: 4,
      soundEnabled: true,
      ambientSound: 'rain',
    },
    budgetCategories: initialBudgetCategories,
    cashflowTransactions: initialCashflow,
    scratchpadNotes: initialScratchpad,
    kanbanCards: initialKanban,
    timeBlocks: initialTimeBlocks,
    dateNotes: {
      [dateInfo.dateKey]: 'جلسه بررسی فصلی اهداف کاری، تحلیل کانال‌های اجتماعی و برنامه‌ریزی تسویه‌های مالی هفته جاری با موفقیت ثبت شد.',
    },
    socialMetrics: initialSocialMetrics,
    activeDayOffset: 0,
  };
}

export interface WorkspacePreset {
  id: string;
  nameFa: string;
  nameEn: string;
  descFa: string;
  descEn: string;
  icon: string;
  color: string;
  widgetTypes: WidgetType[];
}

export const WORKSPACE_PRESETS: WorkspacePreset[] = [
  {
    id: 'preset-freelancer',
    nameFa: 'پکیج فریلنسر و توسعه‌دهنده (Freelancer Pro)',
    nameEn: 'Freelancer & Dev Pro',
    descFa: 'ماتریس تسک‌ها، تخته کانبان، تایمر پومودورو، عادات روزانه و تسویه‌های مالی',
    descEn: 'Task matrix, kanban board, pomodoro timer, habit tracker, and receivables',
    icon: 'Terminal',
    color: '#2563eb',
    widgetTypes: ['calendar', 'task_matrix', 'pomodoro_timer', 'kanban_board', 'habit_tracker', 'debts_credits', 'file_manager'],
  },
  {
    id: 'preset-executive',
    nameFa: 'پکیج مدیریت و کسب‌وکار (Executive & CEO)',
    nameEn: 'Executive & Business Leader',
    descFa: 'اتاق فرمان هوشمند HUD، اهداف فصلی، تحلیل جریان نقدینگی، گزارش فصلی Gemini و تقویم',
    descEn: 'Executive HUD pulse, season roadmap, cashflow analytics, Gemini AI reports, and calendar',
    icon: 'Briefcase',
    color: '#059669',
    widgetTypes: ['executive_hud', 'calendar', 'season_goals', 'cashflow_budget', 'bank_accounts', 'ai_season_report', 'meeting_chat', 'activity_logs'],
  },
  {
    id: 'preset-finance',
    nameFa: 'پکیج خزانه‌داری و مالی (Treasury & Finance Master)',
    nameEn: 'Finance & Treasury Master',
    descFa: 'مانده حساب‌های بانکی و کریپتو، بدهی و طلب، بودجه‌بندی هزینه‌ها و نوت‌های روز',
    descEn: 'Bank & crypto balances, debts & receivables, budget limits, and calendar notes',
    icon: 'Wallet',
    color: '#dc2626',
    widgetTypes: ['calendar', 'bank_accounts', 'debts_credits', 'cashflow_budget', 'reminder_notes', 'activity_logs'],
  },
  {
    id: 'preset-focus',
    nameFa: 'پکیج تمرکز و بهره‌وری شخصی (Deep Focus & Habits)',
    nameEn: 'Deep Focus & Habit Minimalist',
    descFa: 'اتاق فرمان HUD، تایمر پومودورو، ردیاب عادات و استمرار، ماتریس آیزنهاور و یادداشت سریع',
    descEn: 'Executive HUD, pomodoro timer, habit streak tracker, task matrix, and quick voice scratchpad',
    icon: 'Zap',
    color: '#7c3aed',
    widgetTypes: ['executive_hud', 'calendar', 'pomodoro_timer', 'habit_tracker', 'task_matrix', 'quick_scratchpad', 'reminder_notes'],
  },
  {
    id: 'preset-all',
    nameFa: 'سامانه همه‌جانبه کامل (Complete All-in-One OS)',
    nameEn: 'Complete All-in-One OS',
    descFa: 'تمام ماژول‌های پلتفرم با دسترسی سریع و جامع به تمامی ابزارهای بهره‌وری',
    descEn: 'Every single workspace module enabled for maximum control',
    icon: 'LayoutGrid',
    color: '#0f172a',
    widgetTypes: [
      'executive_hud',
      'calendar',
      'season_goals',
      'task_matrix',
      'pomodoro_timer',
      'habit_tracker',
      'cashflow_budget',
      'kanban_board',
      'quick_scratchpad',
      'bank_accounts',
      'debts_credits',
      'meeting_chat',
      'file_manager',
      'ai_season_report',
      'social_hub',
      'reminder_notes',
      'activity_logs',
    ],
  },
];

export function loadStoredState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getInitialDefaultState();
    const parsed = JSON.parse(raw);
    const def = getInitialDefaultState();

    const rawWidgets = parsed.widgets?.length ? parsed.widgets : def.widgets;
    const normalizedWidgets: WorkspaceWidgetConfig[] = rawWidgets.map((w: any, index: number) => {
      const defaultW = DEFAULT_WIDGETS.find((dw) => dw.type === w.type) || DEFAULT_WIDGETS.find((dw) => dw.id === w.id);
      const defColSpan = defaultW?.customization?.colSpan || 6;
      const colSpan = w.customization?.colSpan ?? w.colSpan ?? defColSpan;
      const rowSpan = w.customization?.rowSpan ?? w.rowSpan ?? (defaultW?.customization?.rowSpan || 1);
      const bgColor = w.customization?.bgColor ?? w.bgColor ?? (defaultW?.customization?.bgColor || '#ffffff');
      const textColor = w.customization?.textColor ?? w.textColor ?? (defaultW?.customization?.textColor || '#0f172a');
      const fontFamily = w.customization?.fontFamily ?? (defaultW?.customization?.fontFamily || 'vazir');
      const fontSize = w.customization?.fontSize ?? (defaultW?.customization?.fontSize || 'base');
      const gridPosition = w.customization?.gridPosition || defaultW?.customization?.gridPosition || {
        col: (index % 2) * 6 + 1,
        row: Math.floor(index / 2) * 2 + 1,
      };

      return {
        id: w.id || `widget-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        type: w.type || defaultW?.type || 'calendar',
        title: w.title || defaultW?.title || 'Widget',
        titleFa: w.titleFa || defaultW?.titleFa || 'ویجت',
        enabled: w.enabled !== false,
        order: typeof w.order === 'number' ? w.order : (defaultW?.order || 99),
        customTitle: w.customTitle,
        isFloating: Boolean(w.isFloating),
        customization: {
          bgColor,
          textColor,
          fontFamily,
          fontSize,
          colSpan,
          rowSpan,
          gridPosition,
          customWidthPercent: w.customization?.customWidthPercent,
          customHeightPx: w.customization?.customHeightPx,
          floatingPosition: w.customization?.floatingPosition,
          ...(w.customization || {}),
        },
      };
    });

    return {
      ...def,
      ...parsed,
      currentUser: parsed.currentUser !== undefined ? parsed.currentUser : def.currentUser,
      widgets: normalizedWidgets,
      activityLogs: parsed.activityLogs?.length ? parsed.activityLogs : def.activityLogs,
      aiAgents: parsed.aiAgents?.length ? parsed.aiAgents : def.aiAgents,
      chatHistory: parsed.chatHistory?.length ? parsed.chatHistory : def.chatHistory,
      files: parsed.files?.length ? parsed.files : def.files,
      habits: parsed.habits?.length ? parsed.habits : def.habits,
      pomodoroSessions: parsed.pomodoroSessions || def.pomodoroSessions,
      pomodoroSettings: parsed.pomodoroSettings || def.pomodoroSettings,
      budgetCategories: parsed.budgetCategories?.length ? parsed.budgetCategories : def.budgetCategories,
      cashflowTransactions: parsed.cashflowTransactions?.length ? parsed.cashflowTransactions : def.cashflowTransactions,
      scratchpadNotes: parsed.scratchpadNotes?.length ? parsed.scratchpadNotes : def.scratchpadNotes,
      kanbanCards: parsed.kanbanCards?.length ? parsed.kanbanCards : def.kanbanCards,
      timeBlocks: parsed.timeBlocks?.length ? parsed.timeBlocks : def.timeBlocks,
    };
  } catch (err) {
    console.error('Failed to load stored state, falling back to default:', err);
    return getInitialDefaultState();
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save state to localStorage:', err);
  }
}

export function resetToDefaults(): AppState {
  const def = getInitialDefaultState();
  saveState(def);
  return def;
}
