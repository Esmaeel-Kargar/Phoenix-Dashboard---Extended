import React, { useState } from 'react';
import {
  Plus,
  X,
  Sparkles,
  Calendar,
  Target,
  CalendarDays,
  StickyNote,
  Wallet,
  Scale,
  Share2,
  FileText,
  ListFilter,
  Bot,
  MessageSquare,
  Flame,
  Timer,
  TrendingUp,
  Kanban,
  Search,
  Check,
  LayoutGrid,
  Zap,
  Briefcase,
  Terminal,
  Layers,
  Sliders,
} from 'lucide-react';
import { WorkspaceWidgetConfig, WidgetType, Language } from '../types';
import { WORKSPACE_PRESETS, WorkspacePreset } from '../utils/storage';

interface AddWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingWidgets: WorkspaceWidgetConfig[];
  onAddWidget: (type: WidgetType) => void;
  onApplyPreset?: (preset: WorkspacePreset) => void;
  language: Language;
}

export const AddWidgetModal: React.FC<AddWidgetModalProps> = ({
  isOpen,
  onClose,
  existingWidgets,
  onAddWidget,
  onApplyPreset,
  language,
}) => {
  if (!isOpen) return null;

  const isFa = language === 'fa';
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'store' | 'presets'>('store');

  const CATEGORIES = [
    { id: 'all', labelFa: 'همه ماژول‌ها', labelEn: 'All Modules', icon: LayoutGrid },
    { id: 'productivity', labelFa: 'بهره‌وری و تمرکز', labelEn: 'Productivity & Focus', icon: Zap },
    { id: 'financial', labelFa: 'مالی و خزانه‌داری', labelEn: 'Treasury & Finances', icon: Wallet },
    { id: 'planning', labelFa: 'برنامه‌ریزی و زمان', labelEn: 'Planning & Time', icon: Calendar },
    { id: 'ai', labelFa: 'هوش مصنوعی و لاگ‌ها', labelEn: 'AI & Intelligence', icon: Sparkles },
    { id: 'tools', labelFa: 'ابزارها و فایل‌ها', labelEn: 'Tools & Repository', icon: Layers },
  ];

  const ALL_WIDGET_CATALOG: {
    type: WidgetType;
    category: 'productivity' | 'financial' | 'planning' | 'ai' | 'tools';
    titleFa: string;
    titleEn: string;
    descFa: string;
    descEn: string;
    icon: any;
    color: string;
    recommendedCol: string;
    badge?: string;
  }[] = [
    {
      type: 'executive_hud',
      category: 'productivity',
      titleFa: 'اتاق فرمان و HUD شاخص‌های کلیدی مدیریت (HUD Pulse)',
      titleEn: 'Executive Command HUD & Live Pulse',
      descFa: 'نمایش زنده و یکپارچه ساعت، اهداف فصل، تسک‌های امروز، تراز نقدینگی کل، زنجیره عادات و دکمه‌های اقدام سریع.',
      descEn: 'Integrated live HUD with mission clock, season goals progress, daily tasks pulse, total net liquidity, and fast command triggers.',
      icon: Zap,
      color: '#0f172a',
      recommendedCol: '12 Col',
      badge: isFa ? 'اتاق فرمان' : 'HUD Command',
    },
    {
      type: 'task_matrix',
      category: 'productivity',
      titleFa: 'ماتریس ۷ روزه تسک‌ها و ماتریس آیزنهاور',
      titleEn: '7-Day Rolling Task Matrix & Eisenhower',
      descFa: 'برنامه‌ریزی تسک‌ها برای ۷ روز متوالی با امکان جابجایی به نمای ۴ خانه آیزنهاور (فوری/مهم).',
      descEn: '7-day rolling scheduler with checklist task items, day offsets, and Eisenhower 4-quadrant view.',
      icon: CalendarDays,
      color: '#2563eb',
      recommendedCol: '12 Col',
      badge: isFa ? 'پرطرفدار' : 'Popular',
    },
    {
      type: 'habit_tracker',
      category: 'productivity',
      titleFa: 'ردیاب عادات، روتین‌ها و استمرار (Streak)',
      titleEn: 'Habit & Routine Streak Tracker',
      descFa: 'ثبت عادات روزانه، شمارش زنجیره استمرار (Streak)، محاسبه نرخ موفقیت هفتگی و اتصال به اهداف.',
      descEn: 'Daily habits checklist, consistency streaks calculation, weekly success heatmap and goal linkage.',
      icon: Flame,
      color: '#10b981',
      recommendedCol: '6 Col',
      badge: isFa ? 'جدید' : 'New',
    },
    {
      type: 'pomodoro_timer',
      category: 'productivity',
      titleFa: 'تایمر تمرکز عمیق و پومودورو (با صدای امبینت)',
      titleEn: 'Deep Focus & Pomodoro Timer',
      descFa: 'تایمر ۲۵ دقیقه‌ای تمرکز متصل به تسک‌های ماتریس با پخش صداهای آرامش‌بخش باران و نویز سفید.',
      descEn: '25m Pomodoro cycles linked to daily tasks with built-in offline ambient sound synthesizers.',
      icon: Timer,
      color: '#4f46e5',
      recommendedCol: '6 Col',
      badge: isFa ? 'جدید' : 'New',
    },
    {
      type: 'kanban_board',
      category: 'productivity',
      titleFa: 'تخته کانبان پروژه‌ها و جریان کار',
      titleEn: 'Project Kanban Board',
      descFa: 'مدیریت کارت‌های پروژه در ستون‌های ایده، اقدام، بازبینی و تکمیل با امکان ارسال به تسک‌های هفتگی.',
      descEn: 'Flexible project kanban board across 4 columns with one-click transfer to weekly task schedule.',
      icon: Kanban,
      color: '#0284c7',
      recommendedCol: '12 Col',
      badge: isFa ? 'جدید' : 'New',
    },
    {
      type: 'quick_scratchpad',
      category: 'productivity',
      titleFa: 'یادداشت سریع و ضبط صوت هوشمند',
      titleEn: 'Voice & Quick Scratchpad',
      descFa: 'ویرایشگر یادداشت سریع با امکان ضبط صوت از طریق میکروفون و تبدیل فوری به تسک یا هدف.',
      descEn: 'Instant scratchpad with microphone voice memos and one-click conversion to tasks or goals.',
      icon: StickyNote,
      color: '#d97706',
      recommendedCol: '6 Col',
      badge: isFa ? 'جدید' : 'New',
    },
    {
      type: 'bank_accounts',
      category: 'financial',
      titleFa: 'مانده حساب‌های بانکی و کریپتو',
      titleEn: 'Bank Accounts & Balances',
      descFa: 'مدیریت موجودی حساب‌های بانکی، کیف پول‌های تتر و محاسبه نقدینگی کل با حالت حریم خصوصی.',
      descEn: 'Bank treasury overview, crypto wallet balances, and overall liquidity with privacy toggle.',
      icon: Wallet,
      color: '#dc2626',
      recommendedCol: '8 Col',
      badge: isFa ? 'پرطرفدار' : 'Popular',
    },
    {
      type: 'debts_credits',
      category: 'financial',
      titleFa: 'بدهی‌ها و طلب‌ها (سررسید و تسویه‌ها)',
      titleEn: 'Debts & Receivables Ledger',
      descFa: 'ثبت تعهدات پرداختی و دریافتی، تاریخ سررسید، اولویت‌بندی و تطبیق هوشمند با پیامک بانکی.',
      descEn: 'Payables and receivables ledger with settlement deadlines, priority stars, and SMS auto-matcher.',
      icon: Scale,
      color: '#4472C4',
      recommendedCol: '4 Col',
    },
    {
      type: 'cashflow_budget',
      category: 'financial',
      titleFa: 'بودجه‌بندی و تحلیل جریان نقدینگی',
      titleEn: 'Cashflow & Budget Analytics',
      descFa: 'تحلیل درآمد/هزینه ماهانه، سقف مصرف دسته‌ها، پیش‌بینی نقدینگی و نرخ پس‌انداز.',
      descEn: 'Monthly income vs expense summary, budget limits by category, and projected cashflow.',
      icon: TrendingUp,
      color: '#059669',
      recommendedCol: '6 Col',
      badge: isFa ? 'جدید' : 'New',
    },
    {
      type: 'calendar',
      category: 'planning',
      titleFa: 'تقویم خورشیدی و میلادی و بلوک‌های زمانی',
      titleEn: 'Solar & Gregorian Calendar & Timeblocks',
      descFa: 'ساعت زنده، تقویم دوگانه شمسی/میلادی، مناسبت‌ها، نوت روز و بلوک‌بندی زمانی روزانه.',
      descEn: 'Dual Jalali & Gregorian live date, calendar events, day notes, and hourly time-blocking.',
      icon: Calendar,
      color: '#4472C4',
      recommendedCol: '4 Col',
      badge: isFa ? 'اصلی' : 'Core',
    },
    {
      type: 'season_goals',
      category: 'planning',
      titleFa: 'اهداف فصل کاری و نقشه راه',
      titleEn: 'Season Work Goals & Roadmap',
      descFa: 'ثبت و پیگیری پیشرفت اهداف فصلی، سررسیدها و مایلستون‌های کاری با درصد پیشرفت زنده.',
      descEn: 'Quarterly roadmap goals, progress sliders and target deadlines.',
      icon: Target,
      color: '#548235',
      recommendedCol: '8 Col',
      badge: isFa ? 'اصلی' : 'Core',
    },
    {
      type: 'reminder_notes',
      category: 'planning',
      titleFa: 'نوت‌های موقت یادآوری',
      titleEn: 'Temporary Reminder Notes',
      descFa: 'یادداشت‌های سریع با رتبه‌بندی اولویت ستاره‌ای و پین کردن به بالا.',
      descEn: 'Quick notes with 0-5 star priority rating and pin-to-top feature.',
      icon: StickyNote,
      color: '#7030A0',
      recommendedCol: '4 Col',
    },
    {
      type: 'meeting_chat',
      category: 'ai',
      titleFa: 'اتاق جلسات و چت با ایجنت‌های هوش مصنوعی',
      titleEn: 'AI Meeting Room & Multi-Agent Chat',
      descFa: 'گفتگوی هماهنگ با چند ایجنت تخصصی همزمان و اجرای اتوماتیک اکشن‌ها (تسک، هدف، مالی).',
      descEn: 'Collaborative meeting room with specialized multi-agent AI assistants and actionable tool triggers.',
      icon: MessageSquare,
      color: '#1e1b4b',
      recommendedCol: '6 Col',
      badge: isFa ? 'هوشمند' : 'AI Powered',
    },
    {
      type: 'ai_season_report',
      category: 'ai',
      titleFa: 'تحلیلگر هوشمند عملکرد فصلی (Gemini AI)',
      titleEn: 'AI Seasonal Performance Analyst',
      descFa: 'تولید خودکار پیش‌نویس گزارش فصلی با تحلیل هوشمند تمام لاگ‌ها، تسک‌ها و دارایی‌ها.',
      descEn: 'Automated synthesis of all audit logs, tasks, and treasury metrics via Gemini AI.',
      icon: Sparkles,
      color: '#0f172a',
      recommendedCol: '4 Col',
      badge: isFa ? 'هوشمند' : 'AI Powered',
    },
    {
      type: 'activity_logs',
      category: 'ai',
      titleFa: 'مرکز لاگ‌ها و رخدادهای سامانه',
      titleEn: 'System & Agent Activity Logs',
      descFa: 'ثبت منظم تمام رویدادها با تفکیک انجام‌دهنده (کاربر/ایجنت) و مشخصات اجازه‌دهنده.',
      descEn: 'Comprehensive multi-actor audit log with actor and authorizer tracking.',
      icon: ListFilter,
      color: '#475569',
      recommendedCol: '12 Col',
    },
    {
      type: 'file_manager',
      category: 'tools',
      titleFa: 'مدیریت و مخزن اسناد و فایل‌ها',
      titleEn: 'Workspace File & Asset Manager',
      descFa: 'آپلود، پیش‌نمایش، دانلود و ارسال فایل‌ها به چت ایجنت‌ها با فضای ایزوله هاست.',
      descEn: 'Upload, preview, download and attach documents/assets directly with AI agents.',
      icon: FileText,
      color: '#0f766e',
      recommendedCol: '6 Col',
    },
    {
      type: 'social_hub',
      category: 'tools',
      titleFa: 'رصد شبکه‌های اجتماعی (یوتیوب، X، لینکدین)',
      titleEn: 'Social Channels Tracker',
      descFa: 'ماتریس رصد اعلان‌ها، کامنت‌ها، آمار و پیام‌های شبکه‌های اجتماعی.',
      descEn: 'Matrix tracking YouTube, LinkedIn, X, Instagram, and Reddit metrics.',
      icon: Share2,
      color: '#0891b2',
      recommendedCol: '8 Col',
    },
  ];

  // Filter Catalog
  const filteredWidgets = ALL_WIDGET_CATALOG.filter((w) => {
    const matchesCategory = selectedCategory === 'all' || w.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      w.titleFa.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.descFa.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const isWidgetActive = (type: WidgetType) => {
    return existingWidgets.some((w) => w.type === type && w.enabled !== false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
                {isFa ? 'فروشگاه و کتابخانه دسته‌بندی‌شده ماژول‌ها' : 'Categorized Widget Library & Store'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isFa
                  ? 'انتخاب آسان ماژول‌های تخصصی یا اعمال قالب‌های آماده محیط کار با یک کلیک'
                  : 'Choose specialized modules or apply 1-click workspace presets'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switch: Store vs Presets */}
            <div className="flex bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('store')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                  activeTab === 'store'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {isFa ? 'کتابخانه ماژول‌ها' : 'Widget Catalog'}
              </button>
              <button
                onClick={() => setActiveTab('presets')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1 ${
                  activeTab === 'presets'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{isFa ? 'قالب‌های آماده (Presets)' : 'Presets'}</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {activeTab === 'store' ? (
          <>
            {/* Search & Category Filter Header */}
            <div className="p-3 sm:px-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 flex flex-col sm:flex-row gap-2.5 items-center justify-between">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar w-full sm:w-auto pb-1 sm:pb-0">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const count =
                    cat.id === 'all'
                      ? ALL_WIDGET_CATALOG.length
                      : ALL_WIDGET_CATALOG.filter((w) => w.category === cat.id).length;
                  const active = selectedCategory === cat.id;

                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 flex items-center gap-1.5 transition cursor-pointer ${
                        active
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{isFa ? cat.labelFa : cat.labelEn}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          active ? 'bg-indigo-700 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-64 shrink-0">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 rtl:right-3 rtl:left-auto ltr:left-3 ltr:right-auto" />
                <input
                  type="text"
                  placeholder={isFa ? 'جستجو در نام یا شرح ماژول...' : 'Search widgets...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs py-2 pr-9 pl-3 rtl:pr-9 rtl:pl-3 ltr:pl-9 ltr:pr-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Widgets Grid */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredWidgets.map((item) => {
                const Icon = item.icon;
                const active = isWidgetActive(item.type);

                return (
                  <div
                    key={item.type}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                      active
                        ? 'bg-slate-50/80 dark:bg-slate-800/40 border-indigo-500/30 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 shadow-2xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                            style={{ backgroundColor: item.color }}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                              {isFa ? item.titleFa : item.titleEn}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-slate-400 font-mono">
                                {item.recommendedCol}
                              </span>
                              {item.badge && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {active && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full shrink-0 border border-emerald-500/30">
                            <Check className="w-3 h-3" />
                            <span>{isFa ? 'فعال' : 'Active'}</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                        {isFa ? item.descFa : item.descEn}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        {active
                          ? isFa
                            ? 'در داشبورد موجود است'
                            : 'Already in canvas'
                          : isFa
                          ? 'آماده اضافه شدن'
                          : 'Ready to add'}
                      </span>

                      <button
                        onClick={() => {
                          onAddWidget(item.type);
                          onClose();
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                          active
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>
                          {active
                            ? isFa
                              ? 'افزودن نمونه دیگر'
                              : 'Add Duplicate'
                            : isFa
                            ? 'افزودن به داشبورد'
                            : 'Add Widget'}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* Presets Tab */
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2.5 text-xs text-amber-800 dark:text-amber-300">
              <Sparkles className="w-5 h-5 shrink-0 text-amber-500" />
              <span>
                {isFa
                  ? 'قالب‌های کاری چینش ماژول‌ها را متناسب با نقش شما (فریلنسر، مدیر، مالی، تمرکز عمیق) با یک کلیک بهینه‌سازی می‌کنند.'
                  : 'Workspace presets configure and organize your dashboard layout according to your role in 1 click.'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {WORKSPACE_PRESETS.map((preset) => (
                <div
                  key={preset.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2.5 mb-2">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs"
                        style={{ backgroundColor: preset.color }}
                      >
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {isFa ? preset.nameFa : preset.nameEn}
                        </h4>
                        <span className="text-[10px] text-slate-400">
                          {preset.widgetTypes.length} {isFa ? 'ماژول مرتبط' : 'widgets'}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                      {isFa ? preset.descFa : preset.descEn}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {preset.widgetTypes.map((wt) => {
                        const info = ALL_WIDGET_CATALOG.find((w) => w.type === wt);
                        return (
                          <span
                            key={wt}
                            className="text-[9px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                          >
                            {isFa ? info?.titleFa.split(' ')[0] || wt : wt}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (onApplyPreset) {
                        onApplyPreset(preset);
                        onClose();
                      }
                    }}
                    className="w-full py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isFa ? 'اعمال این قالب روی داشبورد' : 'Apply Workspace Preset'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 px-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-xs text-slate-500">
          <span>
            {isFa
              ? `تعداد کل ماژول‌های کتابخانه: ${ALL_WIDGET_CATALOG.length} عدد`
              : `Total Available Widgets: ${ALL_WIDGET_CATALOG.length}`}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold transition cursor-pointer"
          >
            {isFa ? 'بستن' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
