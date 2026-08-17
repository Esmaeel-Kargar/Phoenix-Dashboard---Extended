import React, { useState } from 'react';
import {
  ListFilter,
  User,
  Bot,
  ShieldCheck,
  Calendar,
  Layers,
  Search,
  CheckCircle2,
  Clock,
  Download,
  Plus,
  Trash2,
} from 'lucide-react';
import { ActivityLog, Language } from '../types';
import { useWidgetTheme } from '../context/WidgetThemeContext';

interface ActivityLogsWidgetProps {
  logs: ActivityLog[];
  onAddLog?: (log: ActivityLog) => void;
  language: Language;
}

export const ActivityLogsWidget: React.FC<ActivityLogsWidgetProps> = ({
  logs,
  onAddLog,
  language,
}) => {
  const theme = useWidgetTheme();
  const [filterActor, setFilterActor] = useState<'all' | 'user' | 'agent'>('all');
  const [filterModule, setFilterModule] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddingLog, setIsAddingLog] = useState<boolean>(false);

  // New Log Form state
  const [newDesc, setNewDesc] = useState<string>('');
  const [newActorType, setNewActorType] = useState<'user' | 'agent'>('user');
  const [newAuthorizer, setNewAuthorizer] = useState<string>('اسماعیل کارگر (مدیر فضا)');
  const [newModule, setNewModule] = useState<any>('tasks');

  const isFa = language === 'fa';

  const filteredLogs = logs.filter((log) => {
    if (filterActor !== 'all' && log.actorType !== filterActor) return false;
    if (filterModule !== 'all' && log.module !== filterModule) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText =
        log.descriptionFa.toLowerCase().includes(q) ||
        log.actorName.toLowerCase().includes(q) ||
        log.authorizerName.toLowerCase().includes(q) ||
        log.shamsiDate.includes(q);
      if (!matchText) return false;
    }
    return true;
  });

  const handleCreateCustomLog = () => {
    if (!newDesc.trim()) return;
    const now = new Date();
    const newLogItem: ActivityLog = {
      id: `log-${Date.now()}`,
      actorType: newActorType,
      actorId: newActorType === 'user' ? 'user_esmaeel' : 'agent_gemini_custom',
      actorName: newActorType === 'user' ? 'اسماعیل کارگر (کاربر)' : 'ایجنت هوش مصنوعی',
      authorizerType: 'direct_user',
      authorizerId: 'user_esmaeel',
      authorizerName: newAuthorizer,
      module: newModule,
      action: 'update',
      descriptionFa: newDesc,
      descriptionEn: newDesc,
      timestamp: now.toISOString(),
      shamsiDate: '۱۴۰۵/۰۵/۲۳ ' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0'),
      status: 'success',
    };
    if (onAddLog) onAddLog(newLogItem);
    setNewDesc('');
    setIsAddingLog(false);
  };

  const handleExportCSV = () => {
    const headers = 'ID,Timestamp,ShamsiDate,ActorType,ActorName,AuthorizerName,Module,Action,Description,Status\n';
    const rows = logs
      .map(
        (l) =>
          `"${l.id}","${l.timestamp}","${l.shamsiDate}","${l.actorType}","${l.actorName}","${l.authorizerName}","${l.module}","${l.action}","${l.descriptionFa}","${l.status}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Activity_Logs_Audit_1405.csv`;
    link.click();
  };

  return (
    <div className="flex flex-col h-full space-y-3 text-xs">
      {/* Top Filter & Actions Bar */}
      <div className={`flex flex-wrap items-center justify-between gap-2 border-b ${theme.borderClass} pb-2`}>
        {/* Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Actor Selector */}
          <div className={`flex items-center ${theme.buttonBgClass} p-0.5 rounded-lg border ${theme.borderClass}`}>
            <button
              onClick={() => setFilterActor('all')}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
                filterActor === 'all'
                  ? 'bg-sky-600 text-white'
                  : `${theme.mutedTextClass} hover:opacity-100`
              }`}
            >
              {isFa ? 'همه لاگ‌ها' : 'All'}
            </button>
            <button
              onClick={() => setFilterActor('user')}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                filterActor === 'user'
                  ? 'bg-sky-600 text-white'
                  : `${theme.mutedTextClass} hover:opacity-100`
              }`}
            >
              <User className="w-3 h-3" />
              <span>{isFa ? 'فقط کاربر' : 'User'}</span>
            </button>
            <button
              onClick={() => setFilterActor('agent')}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                filterActor === 'agent'
                  ? 'bg-sky-600 text-white'
                  : `${theme.mutedTextClass} hover:opacity-100`
              }`}
            >
              <Bot className="w-3 h-3" />
              <span>{isFa ? 'فقط ایجنت‌ها' : 'Agents'}</span>
            </button>
          </div>

          {/* Module Selector */}
          <select
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value)}
            className={`${theme.inputClass} rounded-lg px-2 py-1 text-[11px] focus:outline-none`}
          >
            <option value="all" className="text-slate-900 bg-white">{isFa ? 'همه ماژول‌ها' : 'All Modules'}</option>
            <option value="season_goals" className="text-slate-900 bg-white">{isFa ? 'اهداف فصلی' : 'Season Goals'}</option>
            <option value="tasks" className="text-slate-900 bg-white">{isFa ? 'تسک‌ها' : 'Tasks'}</option>
            <option value="finances" className="text-slate-900 bg-white">{isFa ? 'مالی و خزانه‌داری' : 'Finances'}</option>
            <option value="social" className="text-slate-900 bg-white">{isFa ? 'شبکه‌های اجتماعی' : 'Social'}</option>
            <option value="system" className="text-slate-900 bg-white">{isFa ? 'سیستم و گزارش‌دهی' : 'System'}</option>
          </select>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className={`w-3.5 h-3.5 absolute start-2 top-2 ${theme.mutedTextClass}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isFa ? 'جستجو در لاگ‌ها...' : 'Search logs...'}
              className={`${theme.inputClass} ps-7 pe-2 py-1 rounded-lg text-[11px] focus:outline-none w-32 sm:w-44`}
            />
          </div>

          <button
            onClick={() => setIsAddingLog(!isAddingLog)}
            className="bg-sky-600 hover:bg-sky-500 text-white px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
            title={isFa ? 'ثبت لاگ دستی' : 'Add manual log'}
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isFa ? 'ثبت رخداد' : 'Add Log'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className={`p-1.5 ${theme.buttonBgClass} rounded-lg text-[11px] transition cursor-pointer border ${theme.borderClass}`}
            title={isFa ? 'خروجی CSV لاگ‌ها' : 'Export Audit CSV'}
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Inline Add Log Drawer */}
      {isAddingLog && (
        <div className={`p-3 ${theme.cardBgClass} border ${theme.borderClass} rounded-xl space-y-2 animate-in fade-in`}>
          <div className="font-bold text-sky-400 text-xs">
            {isFa ? 'ثبت رویداد جدید در دیتابیس لاگ‌ها' : 'Record New Audit Event'}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className={`text-[10px] ${theme.mutedTextClass} block mb-0.5`}>{isFa ? 'انجام دهنده:' : 'Actor:'}</label>
              <select
                value={newActorType}
                onChange={(e: any) => setNewActorType(e.target.value)}
                className={`w-full ${theme.inputClass} rounded p-1 text-xs`}
              >
                <option value="user" className="text-slate-900 bg-white">{isFa ? 'کاربر (اسماعیل کارگر)' : 'User (Esmaeel)'}</option>
                <option value="agent" className="text-slate-900 bg-white">{isFa ? 'ایجنت هوش مصنوعی' : 'AI Agent'}</option>
              </select>
            </div>
            <div>
              <label className={`text-[10px] ${theme.mutedTextClass} block mb-0.5`}>{isFa ? 'اجازه‌دهنده / مجوزدهنده:' : 'Authorizer:'}</label>
              <input
                type="text"
                value={newAuthorizer}
                onChange={(e) => setNewAuthorizer(e.target.value)}
                className={`w-full ${theme.inputClass} rounded p-1 text-xs`}
              />
            </div>
            <div>
              <label className={`text-[10px] ${theme.mutedTextClass} block mb-0.5`}>{isFa ? 'ماژول مربوطه:' : 'Module:'}</label>
              <select
                value={newModule}
                onChange={(e: any) => setNewModule(e.target.value)}
                className={`w-full ${theme.inputClass} rounded p-1 text-xs`}
              >
                <option value="tasks" className="text-slate-900 bg-white">{isFa ? 'تسک‌ها' : 'Tasks'}</option>
                <option value="season_goals" className="text-slate-900 bg-white">{isFa ? 'اهداف فصلی' : 'Season Goals'}</option>
                <option value="finances" className="text-slate-900 bg-white">{isFa ? 'مالی' : 'Finances'}</option>
                <option value="social" className="text-slate-900 bg-white">{isFa ? 'شبکه‌های اجتماعی' : 'Social'}</option>
              </select>
            </div>
          </div>
          <input
            type="text"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder={isFa ? 'شرح دقیق عملیات انجام شده...' : 'Description of operation...'}
            className={`w-full ${theme.inputClass} rounded p-1.5 text-xs`}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsAddingLog(false)}
              className={`px-2 py-1 ${theme.subtleTextClass} text-xs hover:opacity-100 rounded`}
            >
              {isFa ? 'انصراف' : 'Cancel'}
            </button>
            <button
              onClick={handleCreateCustomLog}
              className="px-3 py-1 bg-sky-600 text-white text-xs font-bold rounded hover:bg-sky-500"
            >
              {isFa ? 'ثبت نهایی' : 'Save Log'}
            </button>
          </div>
        </div>
      )}

      {/* Logs Table / Timeline List */}
      <div className="overflow-y-auto flex-1 min-h-[140px] custom-scrollbar space-y-2 pe-1">
        {filteredLogs.length === 0 ? (
          <div className={`text-center py-8 ${theme.mutedTextClass} italic`}>
            {isFa ? 'هیچ رخدادی با این فیلتر یافت نشد.' : 'No activity logs match the filter.'}
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className={`p-2.5 rounded-lg ${theme.cardBgClass} border ${theme.borderClass} flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition`}
            >
              <div className="space-y-1">
                {/* Badges: Actor + Authorizer */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Actor Badge */}
                  <span
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      log.actorType === 'user'
                        ? 'bg-sky-500/20 text-sky-400 border border-sky-400/30'
                        : 'bg-purple-500/20 text-purple-400 border border-purple-400/30'
                    }`}
                  >
                    {log.actorType === 'user' ? <User className="w-2.5 h-2.5" /> : <Bot className="w-2.5 h-2.5" />}
                    <span>{log.actorName}</span>
                  </span>

                  {/* Authorizer Badge */}
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-400/30">
                    <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                    <span>{isFa ? 'مجوز دهنده:' : 'Auth:'} {log.authorizerName}</span>
                  </span>

                  {/* Module Badge */}
                  <span className={`text-[10px] ${theme.badgeBgClass} ${theme.subtleTextClass} px-1.5 py-0.5 rounded font-mono border ${theme.borderClass}`}>
                    {log.module}
                  </span>
                </div>

                {/* Description */}
                <div className="text-xs font-medium leading-relaxed">
                  {log.descriptionFa}
                </div>
              </div>

              {/* Timestamp & Status */}
              <div className="flex sm:flex-col items-end justify-between sm:justify-center text-start sm:text-end shrink-0 gap-0.5">
                <span className={`text-[11px] font-mono ${theme.mutedTextClass} flex items-center gap-1`}>
                  <Clock className="w-3 h-3 opacity-60" />
                  <span>{log.shamsiDate}</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{isFa ? 'موفق' : 'Success'}</span>
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
