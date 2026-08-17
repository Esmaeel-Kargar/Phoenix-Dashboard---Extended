import React, { useState } from 'react';
import {
  Share2,
  Bell,
  MessageSquare,
  BarChart3,
  Mail,
  Youtube,
  Linkedin,
  Twitter,
  Instagram,
  Flame,
  Edit2,
  Check,
  TrendingUp,
  ExternalLink,
} from 'lucide-react';
import { SocialPlatformKey, SocialChannelMetrics, Language } from '../types';
import { toPersianDigits } from '../utils/jalali';
import { useWidgetTheme } from '../context/WidgetThemeContext';

interface SocialChannelsMatrixProps {
  metrics: Record<SocialPlatformKey, SocialChannelMetrics>;
  onUpdateMetrics: (metrics: Record<SocialPlatformKey, SocialChannelMetrics>) => void;
  language: Language;
}

interface PlatformConfig {
  key: SocialPlatformKey;
  name: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  accentBg: string;
  url: string;
}

const PLATFORMS: PlatformConfig[] = [
  {
    key: 'youtube',
    name: 'YouTube',
    color: '#FF0000',
    icon: Youtube,
    accentBg: 'hover:bg-red-500/10',
    url: 'https://youtube.com',
  },
  {
    key: 'linkedin',
    name: 'LinkedIn',
    color: '#0A66C2',
    icon: Linkedin,
    accentBg: 'hover:bg-blue-500/10',
    url: 'https://linkedin.com',
  },
  {
    key: 'x',
    name: 'X',
    color: '#000000',
    icon: Twitter,
    accentBg: 'hover:bg-slate-500/10',
    url: 'https://x.com',
  },
  {
    key: 'instagram',
    name: 'Instagram',
    color: '#E4405F',
    icon: Instagram,
    accentBg: 'hover:bg-pink-500/10',
    url: 'https://instagram.com',
  },
  {
    key: 'reddit',
    name: 'Reddit',
    color: '#FF4500',
    icon: Flame,
    accentBg: 'hover:bg-orange-500/10',
    url: 'https://reddit.com',
  },
];

type MetricRowKey = 'notifications' | 'comments' | 'statistics' | 'messages';

interface MetricRowConfig {
  key: MetricRowKey;
  titleFa: string;
  titleEn: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ROWS: MetricRowConfig[] = [
  {
    key: 'notifications',
    titleFa: 'نوتیفیکیشن‌ها',
    titleEn: 'Notifications',
    icon: Bell,
  },
  {
    key: 'comments',
    titleFa: 'کامنت‌های جدید',
    titleEn: 'New Comments',
    icon: MessageSquare,
  },
  {
    key: 'statistics',
    titleFa: 'آمار بازدید و رشد',
    titleEn: 'Growth & Reach',
    icon: BarChart3,
  },
  {
    key: 'messages',
    titleFa: 'پیام‌ها و دایرکت‌ها',
    titleEn: 'Direct Messages',
    icon: Mail,
  },
];

export const SocialChannelsMatrix: React.FC<SocialChannelsMatrixProps> = ({
  metrics,
  onUpdateMetrics,
  language,
}) => {
  const theme = useWidgetTheme();
  const [selectedCell, setSelectedCell] = useState<{
    platform: SocialPlatformKey;
    row: MetricRowKey;
  } | null>(null);

  const [editValue, setEditValue] = useState<string>('');
  const [editNote, setEditNote] = useState<string>('');

  const isFa = language === 'fa';

  const handleCellClick = (platform: SocialPlatformKey, row: MetricRowKey) => {
    setSelectedCell({ platform, row });
    const pData = metrics[platform];
    if (row === 'notifications') {
      setEditValue(String(pData.notifications.count));
      setEditNote(pData.notifications.note || '');
    } else if (row === 'comments') {
      setEditValue(String(pData.comments.count));
      setEditNote(pData.comments.note || '');
    } else if (row === 'statistics') {
      setEditValue(pData.statistics.viewsOrFollowers);
      setEditNote(pData.statistics.growth);
    } else if (row === 'messages') {
      setEditValue(String(pData.messages.count));
      setEditNote(pData.messages.note || '');
    }
  };

  const handleSaveEdit = () => {
    if (!selectedCell) return;
    const { platform, row } = selectedCell;
    const updated = { ...metrics };

    if (row === 'notifications') {
      updated[platform].notifications.count = parseInt(editValue) || 0;
      updated[platform].notifications.note = editNote;
      updated[platform].notifications.unread = (parseInt(editValue) || 0) > 0;
    } else if (row === 'comments') {
      updated[platform].comments.count = parseInt(editValue) || 0;
      updated[platform].comments.note = editNote;
    } else if (row === 'statistics') {
      updated[platform].statistics.viewsOrFollowers = editValue;
      updated[platform].statistics.growth = editNote;
    } else if (row === 'messages') {
      updated[platform].messages.count = parseInt(editValue) || 0;
      updated[platform].messages.note = editNote;
    }

    onUpdateMetrics(updated);
    setSelectedCell(null);
  };

  const handleMarkAllRead = () => {
    const updated = { ...metrics };
    PLATFORMS.forEach((p) => {
      updated[p.key].notifications.unread = false;
      updated[p.key].messages.unread = 0;
    });
    onUpdateMetrics(updated);
  };

  return (
    <div
      id="social-channels-matrix"
      className="h-full flex flex-col justify-between relative overflow-hidden transition-all select-text"
    >
      {/* Top Header Bar */}
      <div className={`flex items-center justify-between border-b ${theme.borderClass} pb-2 mb-2 shrink-0 gap-2`}>
        <div className="flex items-center gap-1.5 min-w-0">
          <Share2 className={`w-4 h-4 ${theme.isDark ? 'text-blue-300' : 'text-blue-600'} shrink-0`} />
          <h2 className="text-xs sm:text-sm font-bold tracking-tight truncate">
            {isFa ? 'داشبورد مانیتورینگ کانال‌ها و شبکه‌های اجتماعی' : 'Social Channels & Engagement Hub'}
          </h2>
        </div>

        <button
          onClick={handleMarkAllRead}
          className={`text-[11px] ${theme.buttonBgClass} px-2 py-1 rounded-md transition cursor-pointer font-medium flex items-center gap-1 shrink-0`}
        >
          <Check className="w-3 h-3" />
          <span>{isFa ? 'خوانده شده' : 'Mark Read'}</span>
        </button>
      </div>

      {/* 5x4 Grid Table */}
      <div className={`overflow-x-auto flex-1 min-h-0 custom-scrollbar rounded-lg border ${theme.borderClass}`}>
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className={`border-b ${theme.borderClass} ${theme.isDark ? 'bg-black/30' : 'bg-slate-100'}`}>
              <th className={`p-2 text-start font-bold w-36 ${theme.subtleTextClass} uppercase tracking-wider text-[10px]`}>
                {isFa ? 'شاخص / پلتفرم' : 'Metric / Channel'}
              </th>
              {PLATFORMS.map((platform) => {
                const Icon = platform.icon;
                return (
                  <th
                    key={platform.key}
                    className={`p-2 text-center font-bold min-w-[110px] border-s ${theme.borderClass}`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <Icon className="w-3.5 h-3.5" />
                      <span className="text-xs">{platform.name}</span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className={`divide-y ${theme.borderClass}`}>
            {ROWS.map((row) => {
              const RowIcon = row.icon;

              return (
                <tr key={row.key} className={`${theme.cardHoverClass} transition-colors`}>
                  {/* Row Header Label */}
                  <td className={`p-2 font-bold border-e ${theme.borderClass} flex items-center gap-1.5 text-[11px]`}>
                    <RowIcon className={`w-3.5 h-3.5 ${theme.isDark ? 'text-blue-300' : 'text-blue-600'} shrink-0`} />
                    <span className="truncate">{isFa ? row.titleFa : row.titleEn}</span>
                  </td>

                  {/* 5 Columns for this Metric */}
                  {PLATFORMS.map((platform) => {
                    const data = metrics[platform.key];
                    let content: React.ReactNode = null;

                    if (row.key === 'notifications') {
                      const count = data.notifications.count;
                      content = (
                        <div className="flex flex-col items-center justify-center py-0.5">
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-xs font-mono">
                              {isFa ? toPersianDigits(count) : count}
                            </span>
                            {data.notifications.unread && (
                              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                            )}
                          </div>
                          {data.notifications.note && (
                            <span className={`text-[9px] ${theme.subtleTextClass} truncate max-w-[90px] mt-0.5`}>
                              {data.notifications.note}
                            </span>
                          )}
                        </div>
                      );
                    } else if (row.key === 'comments') {
                      const count = data.comments.count;
                      content = (
                        <div className="flex flex-col items-center justify-center py-0.5">
                          <div className="flex items-center gap-1 font-bold text-xs font-mono">
                            <span>{isFa ? toPersianDigits(count) : count}</span>
                            {data.comments.pendingReply > 0 && (
                              <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1 rounded-full font-sans font-normal">
                                {isFa ? `${toPersianDigits(data.comments.pendingReply)} پاسخ` : `${data.comments.pendingReply} pend`}
                              </span>
                            )}
                          </div>
                          {data.comments.note && (
                            <span className={`text-[9px] ${theme.subtleTextClass} truncate max-w-[90px] mt-0.5`}>
                              {data.comments.note}
                            </span>
                          )}
                        </div>
                      );
                    } else if (row.key === 'statistics') {
                      content = (
                        <div className="flex flex-col items-center justify-center py-0.5">
                          <div className="font-bold text-[11px] font-mono text-emerald-400">
                            {isFa ? toPersianDigits(data.statistics.viewsOrFollowers) : data.statistics.viewsOrFollowers}
                          </div>
                          <div className="flex items-center gap-0.5 text-[9px] text-emerald-500 dark:text-emerald-400 font-semibold">
                            <TrendingUp className="w-2.5 h-2.5" />
                            <span>{isFa ? toPersianDigits(data.statistics.growth) : data.statistics.growth}</span>
                          </div>
                        </div>
                      );
                    } else if (row.key === 'messages') {
                      const count = data.messages.count;
                      content = (
                        <div className="flex flex-col items-center justify-center py-0.5">
                          <div className="flex items-center gap-1 font-bold text-xs font-mono">
                            <span>{isFa ? toPersianDigits(count) : count}</span>
                            {data.messages.unread > 0 && (
                              <span className="text-[9px] bg-rose-500 text-white px-1 rounded-full font-bold">
                                {isFa ? toPersianDigits(data.messages.unread) : data.messages.unread}
                              </span>
                            )}
                          </div>
                          {data.messages.note && (
                            <span className={`text-[9px] ${theme.subtleTextClass} truncate max-w-[90px] mt-0.5`}>
                              {data.messages.note}
                            </span>
                          )}
                        </div>
                      );
                    }

                    return (
                      <td
                        key={platform.key}
                        onClick={() => handleCellClick(platform.key, row.key)}
                        className={`p-1.5 text-center border-s ${theme.borderClass} cursor-pointer hover:bg-current/10 transition-colors group relative ${platform.accentBg}`}
                      >
                        {content}
                        <div className="absolute top-1 end-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Edit2 className="w-2 h-2 opacity-60" />
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Cell Detail / Edit Modal */}
      {selectedCell && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 text-white rounded-2xl shadow-2xl max-w-sm w-full p-4.5 border border-slate-700 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-blue-400" />
                {isFa ? 'ویرایش داده کانال' : 'Update Channel Metric'}
              </h3>
              <span className="text-xs bg-blue-600/30 text-blue-300 border border-blue-500/40 px-2 py-0.5 rounded font-semibold uppercase">
                {selectedCell.platform}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1 text-[11px]">
                  {selectedCell.row === 'statistics'
                    ? (isFa ? 'مقدار آماری (ویو / فالوور / کارما):' : 'Statistic Value (Views/Followers):')
                    : (isFa ? 'تعداد شمارش‌شده:' : 'Count:')}
                </label>
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1 text-[11px]">
                  {selectedCell.row === 'statistics'
                    ? (isFa ? 'نرخ رشد ماهانه / درصد:' : 'Monthly Growth Rate (%):')
                    : (isFa ? 'توضیحات و نوت مرتبط:' : 'Context / Notes:')}
                </label>
                <input
                  type="text"
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  placeholder={isFa ? 'توضیح کوتاه...' : 'Brief note...'}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <a
                  href={PLATFORMS.find((p) => p.key === selectedCell.platform)?.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-blue-400 hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  {isFa ? 'باز کردن پلتفرم' : 'Open Channel'}
                </a>

                <div className="flex gap-1.5">
                  <button
                    onClick={() => setSelectedCell(null)}
                    className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer font-medium text-xs"
                  >
                    {isFa ? 'انصراف' : 'Cancel'}
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-3.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold cursor-pointer shadow-xs text-xs"
                  >
                    {isFa ? 'ذخیره تغییرات' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
