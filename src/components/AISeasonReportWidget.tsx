import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  RefreshCw,
  Copy,
  Check,
  Download,
  AlertCircle,
  BarChart3,
} from 'lucide-react';
import { AppState, Language } from '../types';
import { useWidgetTheme } from '../context/WidgetThemeContext';

interface AISeasonReportWidgetProps {
  state: AppState;
  language: Language;
  onAddLog?: (log: any) => void;
}

export const AISeasonReportWidget: React.FC<AISeasonReportWidgetProps> = ({
  state,
  language,
  onAddLog,
}) => {
  const theme = useWidgetTheme();
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [report, setReport] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [customPrompt, setCustomPrompt] = useState<string>('');

  const isFa = language === 'fa';

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError('');
    try {
      const payload = {
        logs: state.activityLogs,
        seasonGoals: state.seasonGoals,
        tasks: state.tasks,
        debtsCredits: state.debtsCredits,
        bankAccounts: state.bankAccounts,
        language,
        customPrompt,
      };

      const response = await fetch('/api/ai/season-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Server returned an error');
      }

      const data = await response.json();
      setReport(data.report);

      if (onAddLog) {
        onAddLog({
          actorType: 'agent',
          actorId: 'agent_gemini_analyst',
          actorName: 'ایجنت تحلیل فصلی هوش مصنوعی (Gemini)',
          authorizerType: 'direct_user',
          authorizerId: 'user_esmaeel',
          authorizerName: 'اسماعیل کارگر (درخواست تولید گزارش)',
          module: 'system',
          action: 'ai_generate',
          descriptionFa: 'تحلیل تمام لاگ‌ها، رویدادها، اهداف فصلی و تولید پیش‌نویس جامع گزارش عملکرد فصلی',
          descriptionEn: 'Analyzed all activity logs, goals, and generated seasonal performance report',
          status: 'success',
        });
      }
    } catch (err: any) {
      console.error('Failed to generate report:', err);
      setError(err.message || 'Error communicating with AI service');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!report) return;
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    if (!report) return;
    const blob = new Blob([report], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Seasonal_Performance_Report_1405.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full space-y-2.5 select-text">
      {/* Header Info */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-bold">
          <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>{isFa ? 'تحلیل خودکار لاگ‌ها و اهداف با هوش مصنوعی' : 'AI Autonomous Audit & Log Synthesis'}</span>
        </div>
        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-mono">
          Gemini 3.7 Flash
        </span>
      </div>

      <p className={`text-[11px] ${theme.subtleTextClass} leading-relaxed`}>
        {isFa
          ? 'هوش مصنوعی تمام لاگ‌های ذخیره‌شده (کاربر و ایجنت‌ها)، مجوزها، پیشرفت اهداف فصلی، وضعیت تسک‌ها و حساب‌های مالی را خوانده و یک پیش‌نویس جامع تحلیلی تهیه می‌کند.'
          : 'Gemini AI scans all multi-actor activity logs, authorizer records, goals, tasks, and treasury metrics to draft a structured executive seasonal review.'}
      </p>

      {/* Input / Filter Controls */}
      <div className="space-y-1.5">
        <input
          type="text"
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder={isFa ? 'دستور یا تاکید خاص (مثلا: تمرکز بیشتر روی عملکرد ایجنت مالی)' : 'Optional custom instruction (e.g. Focus on financial agent audit)...'}
          className={`w-full rounded-lg px-3 py-1.5 text-xs focus:outline-none ${theme.inputClass}`}
        />

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-1.5 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-md transition disabled:opacity-50 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>{isFa ? 'در حال تحلیل تمام رویدادها...' : 'Analyzing logs & generating...'}</span>
              </>
            ) : (
              <>
                <Bot className="w-3.5 h-3.5" />
                <span>{isFa ? 'تولید هوشمند گزارش عملکرد فصلی' : 'Generate Seasonal Report'}</span>
              </>
            )}
          </button>

          {report && (
            <div className="flex items-center gap-1">
              <button
                onClick={handleCopy}
                className={`p-1.5 ${theme.buttonBgClass} rounded-lg transition`}
                title={isFa ? 'کپی متن گزارش' : 'Copy report'}
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={handleDownloadMarkdown}
                className={`p-1.5 ${theme.buttonBgClass} rounded-lg transition`}
                title={isFa ? 'دانلود فایل Markdown' : 'Download Markdown'}
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="p-2 bg-rose-500/20 border border-rose-500/40 rounded-lg text-rose-200 text-xs flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Generated Report Display Area */}
      {report ? (
        <div className={`p-3 rounded-xl flex-1 min-h-[140px] overflow-y-auto custom-scrollbar text-xs leading-relaxed space-y-1.5 whitespace-pre-wrap font-sans border ${theme.borderClass} ${theme.cardBgClass}`}>
          {report}
        </div>
      ) : (
        <div className={`p-4 border border-dashed rounded-xl text-center text-xs ${theme.subtleTextClass} flex-1 flex flex-col justify-center items-center min-h-[100px] ${theme.borderClass}`}>
          <BarChart3 className="w-7 h-7 mx-auto mb-1 opacity-50 text-emerald-400" />
          <span>{isFa ? 'گزارشی هنوز ایجاد نشده است. روی دکمه تولید هوشمند کلیک کنید.' : 'No report generated yet. Click generate above.'}</span>
        </div>
      )}
    </div>
  );
};
