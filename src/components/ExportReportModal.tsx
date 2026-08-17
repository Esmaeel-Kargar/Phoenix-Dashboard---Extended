import React, { useState } from 'react';
import {
  FileDown,
  Printer,
  Download,
  Upload,
  X,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Calendar,
  Sparkles,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import { AppState, Language } from '../types';
import { toPersianDigits, getFormattedDateInfo } from '../utils/jalali';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
  onImportState: (importedState: Partial<AppState>) => void;
  language: Language;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  state,
  onImportState,
  language,
}) => {
  if (!isOpen) return null;

  const isFa = language === 'fa';
  const [activeTab, setActiveTab] = useState<'print' | 'data'>('print');
  const [importError, setImportError] = useState<string | null>(null);

  const dateInfo = getFormattedDateInfo(new Date());

  // JSON Download
  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `phoenix_workspace_backup_${dateInfo.dateKey}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // CSV Export for Tasks
  const handleExportTasksCSV = () => {
    const headers = ['ID', 'Date', 'Title', 'Completed', 'Priority', 'Estimate'];
    const rows = state.tasks.map((t) => [
      t.id,
      t.dateKey,
      `"${t.title.replace(/"/g, '""')}"`,
      t.completed ? 'Yes' : 'No',
      t.priority || 'medium',
      t.timeEstimate || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tasks_export_${dateInfo.dateKey}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // JSON Import
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && typeof parsed === 'object') {
          onImportState(parsed);
          alert(isFa ? 'داده‌ها و بک‌آپ با موفقیت بازیابی شد.' : 'Backup restored successfully.');
          onClose();
        }
      } catch (err) {
        setImportError(isFa ? 'فرمت فایل پشتیبان نامعتبر است.' : 'Invalid JSON file.');
      }
    };
    reader.readAsText(file);
  };

  // Print Report
  const handlePrint = () => {
    window.print();
  };

  // Summary Metrics
  const completedTasksCount = state.tasks.filter((t) => t.completed).length;
  const totalTasksCount = state.tasks.length;
  const avgGoalProgress = Math.round(
    state.seasonGoals.reduce((acc, g) => acc + g.progress, 0) / (state.seasonGoals.length || 1)
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                {isFa ? 'مرکز خروجی‌گیری و کارنامه مدیریتی' : 'Export & Performance Report Hub'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isFa
                  ? 'تهیه نسخه چاپی کارنامه فصلی، دریافت خروجی اکسل/CSV و بک‌آپ کامل داده‌ها'
                  : 'Printable executive reports, CSV exports, and full JSON backups'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('print')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                  activeTab === 'print'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {isFa ? 'پیش‌نمایش چاپ / PDF' : 'Printable Report'}
              </button>
              <button
                onClick={() => setActiveTab('data')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                  activeTab === 'data'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {isFa ? 'خروجی داده (JSON/CSV)' : 'Data Export'}
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
          {activeTab === 'print' ? (
            <div className="space-y-4 printable-area">
              {/* Executive Summary Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white shadow-md">
                <div className="flex items-center justify-between border-b border-white/15 pb-2.5 mb-3">
                  <div>
                    <h2 className="text-base sm:text-lg font-black tracking-tight">
                      {isFa ? 'کارنامه جامع عملکرد و بیلان کاری' : 'Executive Performance & Treasury Report'}
                    </h2>
                    <p className="text-xs text-blue-200">
                      {isFa
                        ? `${dateInfo.persianWeekday} ${dateInfo.jd} ${dateInfo.persianMonth} ${dateInfo.jy} • فصل ${dateInfo.seasonFa}`
                        : `${dateInfo.englishWeekday}, ${dateInfo.englishMonth} ${dateInfo.gd}, ${dateInfo.gy} • Season ${dateInfo.seasonEn}`}
                    </p>
                  </div>
                  <button
                    onClick={handlePrint}
                    className="px-3 py-1.5 rounded-xl bg-white text-blue-900 font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-blue-50 transition cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>{isFa ? 'چاپ یا ذخیره PDF' : 'Print / Save PDF'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xs">
                    <span className="text-[11px] text-blue-200 block">{isFa ? 'پیشرفت اهداف فصل' : 'Season Roadmap'}</span>
                    <span className="text-lg font-black">{isFa ? toPersianDigits(avgGoalProgress) : avgGoalProgress}٪</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xs">
                    <span className="text-[11px] text-blue-200 block">{isFa ? 'تسک‌های تکمیل شده' : 'Completed Tasks'}</span>
                    <span className="text-lg font-black">{isFa ? `${toPersianDigits(completedTasksCount)} از ${toPersianDigits(totalTasksCount)}` : `${completedTasksCount}/${totalTasksCount}`}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xs">
                    <span className="text-[11px] text-blue-200 block">{isFa ? 'تعداد عادات فعال' : 'Active Habits'}</span>
                    <span className="text-lg font-black">{isFa ? toPersianDigits(state.habits?.length || 0) : state.habits?.length || 0}</span>
                  </div>
                </div>
              </div>

              {/* Section 1: Season Goals Summary */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{isFa ? 'اهداف فصلی و درصد پیشرفت' : 'Quarterly Goals Progress'}</span>
                </h4>
                <div className="space-y-2">
                  {state.seasonGoals.map((g) => (
                    <div key={g.id} className="flex items-center justify-between text-xs">
                      <span className="text-slate-700 dark:text-slate-300 truncate font-medium">{g.title}</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{isFa ? toPersianDigits(g.progress) : g.progress}٪</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 2: Treasury Balances */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                  <span>{isFa ? 'خلاصه حساب‌های خزانه‌داری' : 'Treasury & Accounts Overview'}</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {state.bankAccounts.map((acc) => (
                    <div key={acc.id} className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-[11px] text-slate-500 block truncate">{acc.name}</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {isFa ? toPersianDigits(acc.balance.toLocaleString('fa-IR')) : acc.balance.toLocaleString()} {acc.currency}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* CSV Export Option */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {isFa ? 'خروجی اکسل / CSV تسک‌ها' : 'Export Tasks as CSV'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {isFa ? 'جدول کامل تسک‌ها با وضعیت، تاریخ و تخمین زمان' : 'Download spreadsheet for Excel or Google Sheets'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleExportTasksCSV}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{isFa ? 'دریافت CSV' : 'Export CSV'}</span>
                </button>
              </div>

              {/* Full JSON Backup Download */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {isFa ? 'پشتیبان‌گیری کامل پایگاه داده (Full JSON Backup)' : 'Download Full JSON Backup'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {isFa ? 'شامل تمامی تنظیمات ویجت‌ها، تسک‌ها، پیام‌های چت و تراکنش‌ها' : 'Complete snapshot of all workspace state'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDownloadJSON}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{isFa ? 'دریافت JSON' : 'Export JSON'}</span>
                </button>
              </div>

              {/* Restore JSON Backup */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {isFa ? 'بازیابی نسخه پشتیبان (Restore Backup)' : 'Restore Backup File'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {isFa ? 'آپلود فایل JSON قبلی برای بازگرداندن داده‌ها' : 'Upload previous backup JSON file'}
                    </p>
                  </div>
                </div>

                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                />
                {importError && <p className="text-xs text-red-500 mt-2">{importError}</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
