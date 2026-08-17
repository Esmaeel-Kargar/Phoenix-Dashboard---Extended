import React, { useState } from 'react';
import {
  Settings,
  Bot,
  Shield,
  ShieldCheck,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Globe,
  Sun,
  Moon,
  Database,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  FolderTree,
  Eye,
  EyeOff,
  User,
  Calendar,
  Lock,
  Layers,
  Save,
} from 'lucide-react';
import {
  AIAgentConfig,
  AIAgentPermissions,
  Language,
  ThemeMode,
  UserAccount,
  AppState,
} from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  isPrivacyMode: boolean;
  onTogglePrivacy: () => void;
  useLiveDate: boolean;
  onToggleDateMode: () => void;
  agents: AIAgentConfig[];
  onSaveAgents: (agents: AIAgentConfig[]) => void;
  currentUser?: UserAccount | null;
  onOpenAuth: () => void;
  onExportBackup: () => void;
  onResetDefaults: () => void;
  onSaveHostState: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  language,
  onLanguageChange,
  theme,
  onThemeChange,
  isPrivacyMode,
  onTogglePrivacy,
  useLiveDate,
  onToggleDateMode,
  agents,
  onSaveAgents,
  currentUser,
  onOpenAuth,
  onExportBackup,
  onResetDefaults,
  onSaveHostState,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'agents' | 'host'>('general');
  const [isEditingAgent, setIsEditingAgent] = useState<boolean>(false);
  const [editingAgentId, setEditingAgentId] = useState<string | null>(null);

  // Form state for agent addition / editing
  const [agentName, setAgentName] = useState('');
  const [agentRole, setAgentRole] = useState('');
  const [agentColor, setAgentColor] = useState('#3b82f6');
  const [agentModel, setAgentModel] = useState('gemini-3.7-flash');
  const [agentPrompt, setAgentPrompt] = useState('');
  const [agentPermissions, setAgentPermissions] = useState<AIAgentPermissions>({
    canViewFinances: true,
    canModifyFinances: false,
    canManageTasks: true,
    canAutoSchedule: true,
    canAccessFiles: true,
    canDeleteFiles: false,
    canAccessSocial: false,
    canGenerateReports: true,
    canAuthorizeLogs: false,
  });

  const isFa = language === 'fa';

  if (!isOpen) return null;

  const handleOpenAddAgent = () => {
    setEditingAgentId(null);
    setAgentName('');
    setAgentRole('');
    setAgentColor('#6366f1');
    setAgentModel('gemini-3.7-flash');
    setAgentPrompt('');
    setAgentPermissions({
      canViewFinances: true,
      canModifyFinances: false,
      canManageTasks: true,
      canAutoSchedule: true,
      canAccessFiles: true,
      canDeleteFiles: false,
      canAccessSocial: false,
      canGenerateReports: true,
      canAuthorizeLogs: false,
    });
    setIsEditingAgent(true);
  };

  const handleOpenEditAgent = (agent: AIAgentConfig) => {
    setEditingAgentId(agent.id);
    setAgentName(agent.name);
    setAgentRole(agent.role);
    setAgentColor(agent.avatarColor || '#3b82f6');
    setAgentModel(agent.model || 'gemini-3.7-flash');
    setAgentPrompt(agent.systemPrompt || '');
    setAgentPermissions(
      agent.permissions || {
        canViewFinances: true,
        canModifyFinances: false,
        canManageTasks: true,
        canAutoSchedule: true,
        canAccessFiles: true,
        canDeleteFiles: false,
        canAccessSocial: false,
        canGenerateReports: true,
        canAuthorizeLogs: false,
      }
    );
    setIsEditingAgent(true);
  };

  const handleSaveAgentForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentName.trim()) return;

    if (editingAgentId) {
      // Update existing
      const updated = agents.map((a) =>
        a.id === editingAgentId
          ? {
              ...a,
              name: agentName.trim(),
              role: agentRole.trim() || 'ایجنت هوش مصنوعی',
              avatarColor: agentColor,
              model: agentModel,
              systemPrompt: agentPrompt.trim(),
              permissions: agentPermissions,
            }
          : a
      );
      onSaveAgents(updated);
    } else {
      // Add new
      const newAgent: AIAgentConfig = {
        id: `agent_${Date.now()}`,
        name: agentName.trim(),
        role: agentRole.trim() || (isFa ? 'دستیار هوش مصنوعی تخصصی' : 'Specialized AI Assistant'),
        avatarColor: agentColor,
        model: agentModel,
        systemPrompt: agentPrompt.trim(),
        permissions: agentPermissions,
        enabled: true,
        isDefault: false,
        createdAt: new Date().toISOString(),
      };
      onSaveAgents([...agents, newAgent]);
    }

    setIsEditingAgent(false);
    setEditingAgentId(null);
  };

  const handleDeleteAgent = (agentId: string) => {
    if (agents.length <= 1) {
      alert(isFa ? 'حداقل یک ایجنت باید در سیستم باقی بماند.' : 'At least one agent must remain.');
      return;
    }
    const updated = agents.filter((a) => a.id !== agentId);
    onSaveAgents(updated);
  };

  const handleToggleAgentEnabled = (agentId: string) => {
    const updated = agents.map((a) =>
      a.id === agentId ? { ...a, enabled: a.enabled === false ? true : false } : a
    );
    onSaveAgents(updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                {isFa ? 'تنظیمات فضای کاری و ایجنت‌های هوش مصنوعی' : 'Platform & AI Agent Settings'}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isFa
                  ? 'شخصی‌سازی ظاهر، سطوح دسترسی ایجنت‌ها و مدیریت هاست دیتابیس'
                  : 'Appearance, Agent Permissions & Tenant Host Storage'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-4 bg-slate-50/50 dark:bg-slate-900/50 shrink-0 gap-1 sm:gap-2">
          <button
            onClick={() => {
              setActiveTab('general');
              setIsEditingAgent(false);
            }}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'general'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isFa ? 'عمومی و ظاهر' : 'General & UI'}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('agents');
              setIsEditingAgent(false);
            }}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'agents'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>{isFa ? 'ایجنت‌ها و سطوح دسترسی' : 'AI Agents & Permissions'}</span>
            <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
              {agents.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('host');
              setIsEditingAgent(false);
            }}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'host'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>{isFa ? 'پایگاه داده و هاست کاربر' : 'Host & Tenant Storage'}</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-scrollbar">
          {/* ========================================================= */}
          {/* TAB 1: General Settings */}
          {/* ========================================================= */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              {/* Language & Theme Section */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-3">
                <h3 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-blue-500" />
                  <span>{isFa ? 'زبان و قالب بصری سیستم' : 'Language & Display Theme'}</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Language */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      {isFa ? 'زبان رابط کاربری:' : 'Interface Language:'}
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onLanguageChange('fa')}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          language === 'fa'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        فارسی (Jalali)
                      </button>
                      <button
                        onClick={() => onLanguageChange('en')}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          language === 'en'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        English
                      </button>
                    </div>
                  </div>

                  {/* Theme */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      {isFa ? 'قالب رنگی:' : 'Theme Mode:'}
                    </label>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => onThemeChange('classic')}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          theme === 'classic'
                            ? 'bg-[#4472C4] text-white shadow-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {isFa ? 'کلاسیک' : 'Classic'}
                      </button>
                      <button
                        onClick={() => onThemeChange('modern-dark')}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          theme === 'modern-dark'
                            ? 'bg-slate-950 text-white border border-slate-700 shadow-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {isFa ? 'تیره' : 'Dark'}
                      </button>
                      <button
                        onClick={() => onThemeChange('modern-light')}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          theme === 'modern-light'
                            ? 'bg-indigo-50 text-indigo-900 border border-indigo-300 shadow-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {isFa ? 'روشن' : 'Light'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Functional Toggles */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-2.5">
                <h3 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <span>{isFa ? 'تنظیمات حریم خصوصی و زمان' : 'Privacy & Time Options'}</span>
                </h3>

                <div className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    {isPrivacyMode ? <EyeOff className="w-4 h-4 text-amber-500" /> : <Eye className="w-4 h-4 text-slate-500" />}
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {isFa ? 'حالت حریم خصوصی (پنهان‌سازی مبالغ مالی)' : 'Privacy Mode'}
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        {isFa ? 'نمایش مبالغ و مانده حساب‌ها به‌صورت ستاره‌دار (••••)' : 'Mask financial balances with bullets'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onTogglePrivacy}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      isPrivacyMode ? 'bg-amber-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {isPrivacyMode ? (isFa ? 'فعال' : 'Active') : (isFa ? 'غیرفعال' : 'Inactive')}
                  </button>
                </div>

                <div className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {isFa ? 'مبدأ زمانی تقویم' : 'Calendar Reference Mode'}
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        {useLiveDate
                          ? (isFa ? 'همگام با تاریخ امروز سیستم شما' : 'Synced with current system clock')
                          : (isFa ? 'تاریخ ثابت دیاگرام کاری (۲۳ مرداد ۱۴۰۵)' : 'Fixed diagram reference date')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onToggleDateMode}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      useLiveDate ? 'bg-blue-600 text-white' : 'bg-amber-600 text-white'
                    }`}
                  >
                    {useLiveDate ? (isFa ? 'تاریخ زنده' : 'Live Date') : (isFa ? 'تاریخ طرح' : 'Diagram Date')}
                  </button>
                </div>
              </div>

              {/* Backup & Reset */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={onExportBackup}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-300 dark:border-slate-700"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isFa ? 'دانلود فایل پشتیبان (JSON)' : 'Export JSON Backup'}</span>
                </button>

                <button
                  onClick={onResetDefaults}
                  className="py-2 px-3 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  title={isFa ? 'بازنشانی کامل داده‌ها' : 'Reset defaults'}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isFa ? 'بازنشانی پیش‌فرض' : 'Reset'}</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: AI Agents & Permissions Management */}
          {/* ========================================================= */}
          {activeTab === 'agents' && (
            <div className="space-y-4">
              {!isEditingAgent ? (
                <>
                  {/* Agents Top Action Bar */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                        {isFa ? 'ایجنت‌های هوش مصنوعی پیکربندی‌شده' : 'Configured AI Agents'}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        {isFa
                          ? 'تعیین نقش، مدل و ماتریس مجوزهای دسترسی به بخش‌های مالی، تسک‌ها و فایل‌ها'
                          : 'Configure agent roles, models and security permission matrix'}
                      </p>
                    </div>

                    <button
                      onClick={handleOpenAddAgent}
                      className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isFa ? 'افزودن ایجنت جدید' : 'Add Agent'}</span>
                    </button>
                  </div>

                  {/* Agents List Cards */}
                  <div className="space-y-2.5">
                    {agents.map((agent) => (
                      <div
                        key={agent.id}
                        className={`p-3.5 rounded-xl border transition ${
                          agent.enabled !== false
                            ? 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700'
                            : 'bg-slate-100/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          {/* Agent Info */}
                          <div className="flex items-start gap-2.5 min-w-0 flex-1">
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                              style={{ backgroundColor: agent.avatarColor || '#4f46e5' }}
                            >
                              <Bot className="w-5 h-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                                  {agent.name}
                                </h4>
                                <span className="bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.2 rounded text-[10px] font-mono">
                                  {agent.model || 'gemini-3.7-flash'}
                                </span>
                                {agent.isDefault && (
                                  <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1 py-0.2 rounded text-[9px]">
                                    {isFa ? 'پیش‌فرض' : 'Default'}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                                {agent.role}
                              </p>

                              {/* Permission Badges */}
                              {agent.permissions && (
                                <div className="flex items-center gap-1.5 flex-wrap mt-2">
                                  {agent.permissions.canViewFinances && (
                                    <span className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] px-1.5 py-0.5 rounded-md flex items-center gap-1">
                                      <ShieldCheck className="w-3 h-3" />
                                      <span>{isFa ? 'مشاهده مالی' : 'Finances'}</span>
                                    </span>
                                  )}
                                  {agent.permissions.canManageTasks && (
                                    <span className="bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10px] px-1.5 py-0.5 rounded-md flex items-center gap-1">
                                      <ShieldCheck className="w-3 h-3" />
                                      <span>{isFa ? 'مدیریت تسک‌ها' : 'Tasks'}</span>
                                    </span>
                                  )}
                                  {agent.permissions.canAccessFiles && (
                                    <span className="bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-[10px] px-1.5 py-0.5 rounded-md flex items-center gap-1">
                                      <ShieldCheck className="w-3 h-3" />
                                      <span>{isFa ? 'مخزن فایل‌ها' : 'Files'}</span>
                                    </span>
                                  )}
                                  {agent.permissions.canAccessSocial && (
                                    <span className="bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[10px] px-1.5 py-0.5 rounded-md flex items-center gap-1">
                                      <ShieldCheck className="w-3 h-3" />
                                      <span>{isFa ? 'شبکه‌های اجتماعی' : 'Social'}</span>
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Control Buttons */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleToggleAgentEnabled(agent.id)}
                              className={`text-[10px] px-2 py-1 rounded-md font-bold transition cursor-pointer ${
                                agent.enabled !== false
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                              }`}
                              title={isFa ? 'فعال / غیرفعال‌سازی' : 'Toggle Active'}
                            >
                              {agent.enabled !== false ? (isFa ? 'فعال' : 'Enabled') : (isFa ? 'غیرفعال' : 'Disabled')}
                            </button>

                            <button
                              onClick={() => handleOpenEditAgent(agent)}
                              className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition cursor-pointer"
                              title={isFa ? 'ویرایش ایجنت و مجوزها' : 'Edit Agent'}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {!agent.isDefault && (
                              <button
                                onClick={() => handleDeleteAgent(agent.id)}
                                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition cursor-pointer"
                                title={isFa ? 'حذف ایجنت' : 'Delete Agent'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                /* ========================================================= */
                /* Agent Add / Edit Form */
                /* ========================================================= */
                <form onSubmit={handleSaveAgentForm} className="space-y-3.5 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Bot className="w-4 h-4 text-indigo-600" />
                      <span>
                        {editingAgentId
                          ? (isFa ? 'ویرایش مشخصات و مجوزهای ایجنت' : 'Edit Agent & Permissions')
                          : (isFa ? 'تعریف و ثبت ایجنت هوش مصنوعی جدید' : 'Add New AI Agent')}
                      </span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsEditingAgent(false)}
                      className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                    >
                      {isFa ? 'بازگشت به لیست' : 'Back to list'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {isFa ? 'نام ایجنت:' : 'Agent Name:'}
                      </label>
                      <input
                        type="text"
                        value={agentName}
                        onChange={(e) => setAgentName(e.target.value)}
                        placeholder={isFa ? 'مثال: ایجنت برنامه‌ریزی استراتژیک' : 'e.g. Strategic Planning Agent'}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {isFa ? 'نقش و تخصص:' : 'Role & Specialization:'}
                      </label>
                      <input
                        type="text"
                        value={agentRole}
                        onChange={(e) => setAgentRole(e.target.value)}
                        placeholder={isFa ? 'مثال: مشاور ارشد بودجه‌بندی و مالیات' : 'e.g. Senior Financial Advisor'}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {isFa ? 'مدل هوش مصنوعی هسته:' : 'AI Foundation Model:'}
                      </label>
                      <select
                        value={agentModel}
                        onChange={(e) => setAgentModel(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="gemini-3.7-flash">Gemini 3.7 Flash (سریع‌ترین و چندوجهی)</option>
                        <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                        <option value="gemini-pro">Gemini Pro</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {isFa ? 'رنگ آواتار و شناسه بصری:' : 'Avatar Color:'}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={agentColor}
                          onChange={(e) => setAgentColor(e.target.value)}
                          className="w-8 h-8 rounded border-0 cursor-pointer p-0"
                        />
                        <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                          {agentColor}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* System Prompt */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isFa ? 'دستورالعمل سیستمی و پرامپت اختصاصی ایجنت:' : 'Custom System Prompt:'}
                    </label>
                    <textarea
                      value={agentPrompt}
                      onChange={(e) => setAgentPrompt(e.target.value)}
                      placeholder={
                        isFa
                          ? 'دستورالعمل‌های رفتاری، اصول تحلیل داده و نحوه پاسخگویی اختصاصی این ایجنت را بنویسید...'
                          : 'Enter specific behavioral instructions and analysis rules for this agent...'
                      }
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 min-h-[65px] resize-none"
                    />
                  </div>

                  {/* Permissions Checklist */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{isFa ? 'ماتریس سطوح دسترسی و مجوزهای ایجنت:' : 'Security Permissions Matrix:'}</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <label className="flex items-center gap-2 p-1.5 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={agentPermissions.canViewFinances}
                          onChange={(e) =>
                            setAgentPermissions((p) => ({ ...p, canViewFinances: e.target.checked }))
                          }
                          className="rounded text-indigo-600 focus:ring-0"
                        />
                        <span className="text-slate-800 dark:text-slate-200">
                          {isFa ? 'مشاهده موجودی حساب‌ها و بدهی‌ها' : 'View Financial Balances & Debts'}
                        </span>
                      </label>

                      <label className="flex items-center gap-2 p-1.5 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={agentPermissions.canModifyFinances}
                          onChange={(e) =>
                            setAgentPermissions((p) => ({ ...p, canModifyFinances: e.target.checked }))
                          }
                          className="rounded text-indigo-600 focus:ring-0"
                        />
                        <span className="text-slate-800 dark:text-slate-200">
                          {isFa ? 'ویرایش و ثبت تراکنش‌های مالی' : 'Modify Financial Records'}
                        </span>
                      </label>

                      <label className="flex items-center gap-2 p-1.5 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={agentPermissions.canManageTasks}
                          onChange={(e) =>
                            setAgentPermissions((p) => ({ ...p, canManageTasks: e.target.checked }))
                          }
                          className="rounded text-indigo-600 focus:ring-0"
                        />
                        <span className="text-slate-800 dark:text-slate-200">
                          {isFa ? 'مدیریت و مشاهده ماتریس تسک‌ها' : 'Manage Task Matrix'}
                        </span>
                      </label>

                      <label className="flex items-center gap-2 p-1.5 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={agentPermissions.canAutoSchedule}
                          onChange={(e) =>
                            setAgentPermissions((p) => ({ ...p, canAutoSchedule: e.target.checked }))
                          }
                          className="rounded text-indigo-600 focus:ring-0"
                        />
                        <span className="text-slate-800 dark:text-slate-200">
                          {isFa ? 'پیشنهاد و زمان‌بندی خودکار تسک‌ها' : 'Auto-Schedule Recommended Tasks'}
                        </span>
                      </label>

                      <label className="flex items-center gap-2 p-1.5 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={agentPermissions.canAccessFiles}
                          onChange={(e) =>
                            setAgentPermissions((p) => ({ ...p, canAccessFiles: e.target.checked }))
                          }
                          className="rounded text-indigo-600 focus:ring-0"
                        />
                        <span className="text-slate-800 dark:text-slate-200">
                          {isFa ? 'دسترسی به اسناد و مخزن فایل‌ها' : 'Access Workspace Files'}
                        </span>
                      </label>

                      <label className="flex items-center gap-2 p-1.5 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={agentPermissions.canAccessSocial}
                          onChange={(e) =>
                            setAgentPermissions((p) => ({ ...p, canAccessSocial: e.target.checked }))
                          }
                          className="rounded text-indigo-600 focus:ring-0"
                        />
                        <span className="text-slate-800 dark:text-slate-200">
                          {isFa ? 'رصد و تحلیل شبکه‌های اجتماعی' : 'Access Social Channels Analytics'}
                        </span>
                      </label>

                      <label className="flex items-center gap-2 p-1.5 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={agentPermissions.canGenerateReports}
                          onChange={(e) =>
                            setAgentPermissions((p) => ({ ...p, canGenerateReports: e.target.checked }))
                          }
                          className="rounded text-indigo-600 focus:ring-0"
                        />
                        <span className="text-slate-800 dark:text-slate-200">
                          {isFa ? 'تولید گزارش‌های عملکرد فصلی' : 'Generate Season Reports'}
                        </span>
                      </label>

                      <label className="flex items-center gap-2 p-1.5 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={agentPermissions.canAuthorizeLogs}
                          onChange={(e) =>
                            setAgentPermissions((p) => ({ ...p, canAuthorizeLogs: e.target.checked }))
                          }
                          className="rounded text-indigo-600 focus:ring-0"
                        />
                        <span className="text-slate-800 dark:text-slate-200">
                          {isFa ? 'تایید خودکار لاگ‌های سیستمی' : 'Authorize System Logs'}
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingAgent(false)}
                      className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition cursor-pointer"
                    >
                      {isFa ? 'انصراف' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-xs flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isFa ? 'ذخیره تنظیمات ایجنت' : 'Save Agent'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: Host Tenant & Storage */}
          {/* ========================================================= */}
          {activeTab === 'host' && (
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center">
                      <FolderTree className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        {isFa ? 'پایگاه داده اختصاصی کاربر در هاست' : 'Tenant Storage & Host Directory'}
                      </h3>
                      <p className="text-[10px] text-slate-500">
                        {isFa
                          ? 'هر کاربر دارای پوشه و دیتابیس جداگانه در مسیر فیزیکی سرور است'
                          : 'Each user has an isolated physical directory on the host server'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={onOpenAuth}
                    className="flex items-center gap-1 bg-teal-600 hover:bg-teal-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer shadow-xs"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>{isFa ? 'تعویض / ساخت کاربر' : 'Switch / Register'}</span>
                  </button>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">{isFa ? 'کاربر فعال:' : 'Active User:'}</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {currentUser ? currentUser.name : (isFa ? 'کاربر پیش‌فرض فضای کاری' : 'Default Workspace User')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-slate-500">{isFa ? 'پوشه هاست:' : 'Host Folder:'}</span>
                    <span className="text-teal-600 dark:text-teal-400">
                      /data/users/{currentUser ? currentUser.id : 'user-default'}/
                    </span>
                  </div>

                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-slate-500">{isFa ? 'فایل پایگاه داده:' : 'Database File:'}</span>
                    <span className="text-blue-600 dark:text-blue-400">database.json</span>
                  </div>
                </div>

                <button
                  onClick={onSaveHostState}
                  className="w-full py-2 bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isFa ? 'ذخیره‌سازی آنی کل فضا در دیتابیس هاست' : 'Save Full State to Host Database'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
