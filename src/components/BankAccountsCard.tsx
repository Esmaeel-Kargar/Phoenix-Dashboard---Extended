import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  ArrowUpDown,
  Check,
  Coins,
  Building2,
  QrCode,
  Copy,
  ExternalLink,
  RefreshCw,
  Sliders,
  Clock,
  HelpCircle,
  X,
  FileSpreadsheet,
  Smartphone,
  CheckCircle2,
  Sparkles,
  Info,
  Globe2,
} from 'lucide-react';
import { BankAccount, Language } from '../types';
import { formatCurrency, toPersianDigits } from '../utils/jalali';
import { useWidgetTheme } from '../context/WidgetThemeContext';
import { BankSyncModal } from './BankSyncModal';

interface BankAccountsCardProps {
  accounts: BankAccount[];
  onUpdateAccounts: (accounts: BankAccount[]) => void;
  isPrivacyMode: boolean;
  onTogglePrivacy: () => void;
  language: Language;
}

type AccountSort = 'default' | 'balance-desc' | 'balance-asc' | 'name' | 'type';
type TabType = 'all' | 'bank' | 'crypto';

const AUTO_SYNC_STORAGE_KEY = 'phoenix_crypto_sync_interval';

export const BankAccountsCard: React.FC<BankAccountsCardProps> = ({
  accounts,
  onUpdateAccounts,
  isPrivacyMode,
  onTogglePrivacy,
  language,
}) => {
  const theme = useWidgetTheme();
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<AccountSort>('default');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Sync states
  const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set());
  const [isSyncingAll, setIsSyncingAll] = useState<boolean>(false);
  const [justSyncedId, setJustSyncedId] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isBankSyncGuideOpen, setIsBankSyncGuideOpen] = useState<boolean>(false);
  const [isBankSyncModalOpen, setIsBankSyncModalOpen] = useState<boolean>(false);
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<string | null>(null);

  // Auto-sync interval in minutes (0 = manual, 15, 30, 60 [default], 360, 1440)
  const [autoSyncInterval, setAutoSyncInterval] = useState<number>(() => {
    const saved = localStorage.getItem(AUTO_SYNC_STORAGE_KEY);
    return saved !== null ? Number(saved) : 60; // default 1 hour
  });

  // Form states
  const [type, setType] = useState<'bank' | 'crypto'>('bank');
  const [name, setName] = useState<string>('');
  const [bankName, setBankName] = useState<string>('');
  const [balance, setBalance] = useState<string>('');
  const [currency, setCurrency] = useState<BankAccount['currency']>('TMN');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [network, setNetwork] = useState<string>('TRC20');
  const [walletAddress, setWalletAddress] = useState<string>('');

  const isFa = language === 'fa';

  // Save auto-sync interval to local storage
  const handleSaveInterval = (interval: number) => {
    setAutoSyncInterval(interval);
    localStorage.setItem(AUTO_SYNC_STORAGE_KEY, String(interval));
  };

  // Background Auto-Sync Timer
  useEffect(() => {
    if (autoSyncInterval <= 0) return;

    const intervalMs = autoSyncInterval * 60 * 1000;
    const timer = setInterval(() => {
      handleRefreshAllCrypto(true);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [autoSyncInterval, accounts]);

  // Approximate Toman equivalents for total balance calculation
  const totalBalanceToman = accounts.reduce((acc, curr) => {
    const val = Number(curr.balance) || 0;
    if (curr.currency === 'TMN') return acc + val;
    if (curr.currency === 'IRR') return acc + val / 10;
    if (curr.currency === 'USD' || curr.currency === 'USDT') return acc + val * 60000;
    if (curr.currency === 'EUR') return acc + val * 65000;
    if (curr.currency === 'BTC') return acc + val * 60000 * 65000;
    if (curr.currency === 'ETH') return acc + val * 60000 * 3500;
    if (curr.currency === 'TON') return acc + val * 60000 * 7;
    if (curr.currency === 'SOL') return acc + val * 60000 * 150;
    return acc + val;
  }, 0);

  // Single Crypto Wallet Refresh Handler (Icon-Only Button Action)
  const handleRefreshWallet = (walletId: string) => {
    setSyncingIds((prev) => new Set(prev).add(walletId));

    setTimeout(() => {
      const nowIso = new Date().toISOString();
      onUpdateAccounts(
        accounts.map((acc) =>
          acc.id === walletId
            ? {
                ...acc,
                lastSyncedAt: nowIso,
                syncStatus: 'success',
              }
            : acc
        )
      );

      setSyncingIds((prev) => {
        const next = new Set(prev);
        next.delete(walletId);
        return next;
      });

      setJustSyncedId(walletId);
      setTimeout(() => setJustSyncedId(null), 2000);
      setLastSyncTime(new Date());
    }, 700);
  };

  // Refresh all crypto wallets
  const handleRefreshAllCrypto = (silent = false) => {
    if (!silent) setIsSyncingAll(true);

    setTimeout(() => {
      const nowIso = new Date().toISOString();
      onUpdateAccounts(
        accounts.map((acc) => {
          const isCrypto =
            acc.type === 'crypto' ||
            ['USDT', 'BTC', 'ETH', 'TON', 'SOL', 'CRYPTO'].includes(acc.currency);
          if (isCrypto) {
            return {
              ...acc,
              lastSyncedAt: nowIso,
              syncStatus: 'success',
            };
          }
          return acc;
        })
      );
      if (!silent) setIsSyncingAll(false);
      setLastSyncTime(new Date());
    }, 800);
  };

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !balance.trim()) return;

    const parsedBalance = parseFloat(balance.replace(/,/g, '')) || 0;
    const newAcc: BankAccount = {
      id: `acc-${Date.now()}`,
      name: name.trim(),
      type,
      bankName: bankName.trim() || undefined,
      balance: parsedBalance,
      currency,
      accountNumber: accountNumber.trim() || undefined,
      network: type === 'crypto' ? network : undefined,
      walletAddress: type === 'crypto' ? walletAddress.trim() : undefined,
      isFavorite: false,
      lastSyncedAt: new Date().toISOString(),
      syncStatus: 'idle',
    };

    onUpdateAccounts([...accounts, newAcc]);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setBankName('');
    setBalance('');
    setCurrency('TMN');
    setAccountNumber('');
    setNetwork('TRC20');
    setWalletAddress('');
    setIsAdding(false);
    setType('bank');
  };

  const handleStartEdit = (acc: BankAccount) => {
    setEditingId(acc.id);
    setType(acc.type || (['USDT', 'BTC', 'ETH', 'TON', 'SOL', 'CRYPTO'].includes(acc.currency) ? 'crypto' : 'bank'));
    setName(acc.name);
    setBankName(acc.bankName || '');
    setBalance(String(acc.balance));
    setCurrency(acc.currency);
    setAccountNumber(acc.accountNumber || '');
    setNetwork(acc.network || 'TRC20');
    setWalletAddress(acc.walletAddress || '');
  };

  const handleSaveEdit = (id: string) => {
    const parsedBalance = parseFloat(balance.replace(/,/g, '')) || 0;
    onUpdateAccounts(
      accounts.map((a) =>
        a.id === id
          ? {
              ...a,
              type,
              name: name.trim() || a.name,
              bankName: bankName.trim() || undefined,
              balance: parsedBalance,
              currency,
              accountNumber: accountNumber.trim() || undefined,
              network: type === 'crypto' ? network : undefined,
              walletAddress: type === 'crypto' ? walletAddress.trim() : undefined,
            }
          : a
      )
    );
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    onUpdateAccounts(accounts.filter((a) => a.id !== id));
  };

  const handleCopyAddress = (id: string, address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter accounts based on active tab
  const filteredAccounts = accounts.filter((acc) => {
    const isCrypto =
      acc.type === 'crypto' ||
      ['USDT', 'BTC', 'ETH', 'TON', 'SOL', 'CRYPTO'].includes(acc.currency);
    if (activeTab === 'bank') return !isCrypto;
    if (activeTab === 'crypto') return isCrypto;
    return true;
  });

  const sortedAccounts = [...filteredAccounts].sort((a, b) => {
    if (sortBy === 'balance-desc') return b.balance - a.balance;
    if (sortBy === 'balance-asc') return a.balance - b.balance;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'type') return (a.type || 'bank').localeCompare(b.type || 'bank');
    return 0;
  });

  const cryptoCount = accounts.filter(
    (a) =>
      a.type === 'crypto' ||
      ['USDT', 'BTC', 'ETH', 'TON', 'SOL', 'CRYPTO'].includes(a.currency)
  ).length;
  const bankCount = accounts.length - cryptoCount;

  return (
    <div
      id="bank-accounts-card"
      className="h-full flex flex-col justify-between relative overflow-hidden transition-all select-text"
    >
      {/* Background Ambience */}
      <div className="absolute -top-10 -left-10 w-36 h-36 bg-current/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className={`flex items-center justify-between border-b ${theme.borderClass} pb-2 mb-2 shrink-0`}>
          <div className="flex items-center gap-1.5 min-w-0">
            <Wallet className={`w-4 h-4 ${theme.isDark ? 'text-amber-300' : 'text-blue-600'} shrink-0`} />
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-bold tracking-tight truncate">
                {isFa ? 'مانده حساب‌ها و کیف‌های پول' : 'Accounts & Crypto Wallets'}
              </h2>
              <span className={`text-[9px] sm:text-[10px] ${theme.subtleTextClass} block truncate`}>
                {isFa
                  ? 'حساب‌های بانکی، تنخواه، تتر و ولت‌های کریپتو'
                  : 'Bank accounts, cash & crypto assets'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Open Bank Sync Hub (SMS Parser / Open Banking / Statement CSV) */}
            <button
              onClick={() => {
                setSelectedBankAccountId(null);
                setIsBankSyncModalOpen(true);
              }}
              className={`px-2 py-1 ${
                theme.isDark
                  ? 'bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-400/30'
                  : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
              } rounded-lg transition cursor-pointer text-xs flex items-center gap-1 font-semibold shadow-xs`}
              title={isFa ? 'سامانه سینک و استعلام حساب‌های بانکی (پیامک / وب‌سرویس / فایل)' : 'Bank Sync Hub'}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">{isFa ? 'سینک بانکی' : 'Bank Sync'}</span>
            </button>

            {/* Instant Refresh All Crypto Wallets (Icon Only) */}
            {cryptoCount > 0 && (
              <button
                onClick={() => handleRefreshAllCrypto(false)}
                disabled={isSyncingAll}
                className={`p-1.5 ${theme.buttonBgClass} rounded-lg transition cursor-pointer ${
                  theme.isDark ? 'text-amber-200 hover:text-white' : 'text-amber-600 hover:text-amber-700'
                }`}
                title={
                  isFa
                    ? `بروزرسانی زنده موجودی تمام ولت‌های کریپتو (تنظیم: هر ${
                        autoSyncInterval === 0
                          ? 'دستی'
                          : autoSyncInterval < 60
                          ? `${autoSyncInterval} دقیقه`
                          : `${autoSyncInterval / 60} ساعت`
                      })`
                    : 'Refresh all crypto wallets'
                }
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin text-amber-300' : ''}`}
                />
              </button>
            )}

            {/* Widget Auto-Sync Settings & Options */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className={`p-1.5 ${theme.buttonBgClass} rounded-lg transition cursor-pointer`}
              title={isFa ? 'تنظیمات بروزرسانی خودکار' : 'Auto-refresh Settings'}
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>

            {/* Privacy Toggle */}
            <button
              onClick={onTogglePrivacy}
              className={`p-1.5 ${theme.buttonBgClass} rounded-lg transition cursor-pointer`}
              title={isPrivacyMode ? (isFa ? 'نمایش موجودی' : 'Show Balance') : (isFa ? 'مخفی‌سازی موجودی' : 'Hide Balance')}
            >
              {isPrivacyMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>

            {/* Add Button */}
            <button
              onClick={() => {
                if (isAdding) resetForm();
                else setIsAdding(true);
              }}
              className={`px-2 py-1 ${theme.buttonBgClass} rounded-lg transition cursor-pointer text-xs flex items-center gap-1 font-medium`}
              title={isFa ? 'افزودن حساب یا ولت جدید' : 'Add Account / Crypto Wallet'}
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="text-[11px]">{isFa ? 'افزودن' : 'Add'}</span>
            </button>
          </div>
        </div>

        {/* Total Assets Summary Banner */}
        <div className={`p-2 rounded-lg border ${theme.cardBgClass} mb-2 flex items-center justify-between shrink-0`}>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className={`text-[11px] ${theme.subtleTextClass} font-medium truncate`}>
              {isFa ? 'مجموع نقدینگی و ارزش تقریبی:' : 'Total Net Worth (Est.):'}
            </span>
            {cryptoCount > 0 && (
              <span className={`hidden sm:inline-flex items-center gap-1 text-[9px] ${
                theme.isDark ? 'bg-amber-500/20 text-amber-200' : 'bg-amber-100 text-amber-800'
              } px-1.5 py-0.2 rounded font-mono`}>
                <Clock className="w-2.5 h-2.5" />
                {autoSyncInterval === 0
                  ? isFa
                    ? 'دستی'
                    : 'Manual'
                  : isFa
                  ? `خودکار (${autoSyncInterval >= 60 ? `${autoSyncInterval / 60}h` : `${autoSyncInterval}m`})`
                  : `Auto (${autoSyncInterval >= 60 ? `${autoSyncInterval / 60}h` : `${autoSyncInterval}m`})`}
              </span>
            )}
          </div>
          <span className={`text-xs sm:text-sm font-bold font-mono ${theme.highlightTextClass} shrink-0`}>
            {isPrivacyMode
              ? '••••••••••'
              : `${formatCurrency(totalBalanceToman, 'TMN', isFa)} تومان`}
          </span>
        </div>

        {/* Filter Tabs & Sort Controls */}
        <div className="flex items-center justify-between gap-1 mb-2 shrink-0">
          {/* Tabs: All / Bank / Crypto */}
          <div className={`flex items-center gap-1 ${theme.isDark ? 'bg-black/25' : 'bg-slate-200/60'} p-0.5 rounded-lg border ${theme.borderClass} text-[10px]`}>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-1.5 py-0.5 rounded transition cursor-pointer font-medium ${
                activeTab === 'all'
                  ? theme.isDark ? 'bg-white/30 text-white shadow-xs' : 'bg-white text-slate-900 shadow-xs'
                  : theme.subtleTextClass
              }`}
            >
              {isFa ? `همه (${accounts.length})` : `All (${accounts.length})`}
            </button>
            <button
              onClick={() => setActiveTab('bank')}
              className={`px-1.5 py-0.5 rounded transition cursor-pointer flex items-center gap-1 font-medium ${
                activeTab === 'bank'
                  ? theme.isDark ? 'bg-white/30 text-white shadow-xs' : 'bg-white text-slate-900 shadow-xs'
                  : theme.subtleTextClass
              }`}
            >
              <Building2 className="w-2.5 h-2.5" />
              <span>{isFa ? `بانکی (${bankCount})` : `Bank (${bankCount})`}</span>
            </button>
            <button
              onClick={() => setActiveTab('crypto')}
              className={`px-1.5 py-0.5 rounded transition cursor-pointer flex items-center gap-1 font-medium ${
                activeTab === 'crypto'
                  ? theme.isDark ? 'bg-amber-500/40 text-amber-200 shadow-xs' : 'bg-amber-500 text-white shadow-xs'
                  : theme.subtleTextClass
              }`}
            >
              <Coins className="w-2.5 h-2.5 text-amber-400" />
              <span>{isFa ? `کریپتو (${cryptoCount})` : `Crypto (${cryptoCount})`}</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Open Banking Guide Quick Link */}
            <button
              onClick={() => setIsBankSyncGuideOpen(true)}
              className={`text-[10px] ${theme.subtleTextClass} hover:text-current flex items-center gap-0.5 px-1.5 py-0.5 rounded ${theme.buttonBgClass} transition cursor-pointer`}
              title={isFa ? 'راهنمای روش‌های سینک بانکی' : 'Bank Sync Guide'}
            >
              <HelpCircle className="w-2.5 h-2.5" />
              <span className="hidden sm:inline">{isFa ? 'راهنما' : 'Guide'}</span>
            </button>

            {/* Sort Selector */}
            <div className={`flex items-center gap-1 ${theme.isDark ? 'bg-black/20' : 'bg-slate-100'} px-1.5 py-0.5 rounded border ${theme.borderClass} shrink-0`}>
              <ArrowUpDown className={`w-2.5 h-2.5 ${theme.subtleTextClass}`} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as AccountSort)}
                className={`bg-transparent ${theme.textColor} text-[10px] focus:outline-none cursor-pointer`}
              >
                <option value="default" className="bg-slate-900 text-white">
                  {isFa ? 'پیش‌فرض' : 'Default'}
                </option>
                <option value="balance-desc" className="bg-slate-900 text-white">
                  {isFa ? 'بیشترین مانده' : 'Highest'}
                </option>
                <option value="balance-asc" className="bg-slate-900 text-white">
                  {isFa ? 'کمترین مانده' : 'Lowest'}
                </option>
                <option value="name" className="bg-slate-900 text-white">
                  {isFa ? 'نام حساب' : 'Name'}
                </option>
                <option value="type" className="bg-slate-900 text-white">
                  {isFa ? 'نوع دارایی' : 'Asset Type'}
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Add Account / Crypto Wallet Form */}
        {isAdding && (
          <form
            onSubmit={handleAddAccount}
            className={`p-2.5 rounded-lg border ${theme.cardBgClass} mb-2 space-y-1.5 text-xs shrink-0 animate-in fade-in`}
          >
            <div className="flex items-center justify-between pb-1 border-b border-current/15">
              <span className="font-bold text-[11px] flex items-center gap-1">
                {type === 'crypto' ? <Coins className="w-3.5 h-3.5 text-amber-300" /> : <Building2 className="w-3.5 h-3.5 text-blue-400" />}
                {type === 'crypto'
                  ? isFa
                    ? 'افزودن ولت ارز دیجیتال / تتر'
                    : 'Add Crypto Wallet'
                  : isFa
                  ? 'افزودن حساب بانکی / تنخواه'
                  : 'Add Bank Account'}
              </span>

              {/* Type Switcher */}
              <div className="flex gap-1 text-[10px]">
                <button
                  type="button"
                  onClick={() => {
                    setType('bank');
                    setCurrency('TMN');
                  }}
                  className={`px-2 py-0.5 rounded cursor-pointer transition ${
                    type === 'bank'
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-current/10 opacity-70'
                  }`}
                >
                  {isFa ? 'حساب بانکی' : 'Bank'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setType('crypto');
                    setCurrency('USDT');
                  }}
                  className={`px-2 py-0.5 rounded cursor-pointer transition ${
                    type === 'crypto'
                      ? 'bg-amber-600 text-white font-bold'
                      : 'bg-current/10 opacity-70'
                  }`}
                >
                  {isFa ? 'کیف پول کریپتو' : 'Crypto'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={
                  type === 'crypto'
                    ? isFa
                      ? 'نام ولت (مثال: تتر Trust Wallet)'
                      : 'Wallet Name'
                    : isFa
                    ? 'نام حساب (مثال: حساب جاری سامان)'
                    : 'Account Name'
                }
                className={`p-1.5 rounded focus:outline-none text-[11px] ${theme.inputClass}`}
                autoFocus
              />
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder={
                  type === 'crypto'
                    ? isFa
                      ? 'نام نرم‌افزار ولت / صرافی'
                      : 'Wallet App / Exchange'
                    : isFa
                    ? 'نام بانک / شعبه'
                    : 'Bank / Branch Name'
                }
                className={`p-1.5 rounded focus:outline-none text-[11px] ${theme.inputClass}`}
              />
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              <input
                type="number"
                step="any"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                placeholder={isFa ? 'موجودی' : 'Balance'}
                className={`col-span-2 p-1.5 rounded focus:outline-none text-[11px] ${theme.inputClass}`}
              />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                className={`p-1 rounded focus:outline-none text-[11px] ${theme.inputClass}`}
              >
                {type === 'crypto' ? (
                  <>
                    <option value="USDT">تتر (USDT)</option>
                    <option value="BTC">بیت‌کوین (BTC)</option>
                    <option value="ETH">اتریوم (ETH)</option>
                    <option value="TON">تون (TON)</option>
                    <option value="SOL">سولانا (SOL)</option>
                    <option value="CRYPTO">سایر کریپتو</option>
                  </>
                ) : (
                  <>
                    <option value="TMN">تومان</option>
                    <option value="IRR">ریال</option>
                    <option value="USD">دلار ($)</option>
                    <option value="EUR">یورو (€)</option>
                  </>
                )}
              </select>
            </div>

            {type === 'crypto' ? (
              <div className="grid grid-cols-3 gap-1.5">
                <select
                  value={network}
                  onChange={(e) => setNetwork(e.target.value)}
                  className={`p-1.5 rounded focus:outline-none text-[11px] ${theme.inputClass}`}
                >
                  <option value="TRC20">شبکه TRC20 (Tron)</option>
                  <option value="ERC20">شبکه ERC20 (Ethereum)</option>
                  <option value="TON">شبکه The Open Network</option>
                  <option value="Solana">شبکه Solana</option>
                  <option value="BEP20">شبکه BSC (BEP20)</option>
                  <option value="Polygon">شبکه Polygon</option>
                  <option value="Bitcoin">شبکه Bitcoin Mainnet</option>
                </select>
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder={isFa ? 'آدرس کیف پول عمومی (Address)' : 'Public Wallet Address'}
                  className={`col-span-2 p-1.5 rounded focus:outline-none text-[11px] font-mono ${theme.inputClass}`}
                />
              </div>
            ) : (
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder={isFa ? 'شماره کارت یا شبا (اختیاری)' : 'Card / IBAN Number (Optional)'}
                className={`w-full p-1.5 rounded focus:outline-none text-[11px] ${theme.inputClass}`}
              />
            )}

            <div className="flex justify-end gap-1.5 pt-1">
              <button
                type="button"
                onClick={resetForm}
                className={`px-2.5 py-0.5 ${theme.buttonBgClass} rounded cursor-pointer transition text-[11px]`}
              >
                {isFa ? 'انصراف' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-3 py-0.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-semibold cursor-pointer transition text-[11px]"
              >
                {type === 'crypto'
                  ? isFa
                    ? 'ثبت ولت کریپتو'
                    : 'Add Crypto Wallet'
                  : isFa
                  ? 'ثبت حساب بانکی'
                  : 'Add Bank Account'}
              </button>
            </div>
          </form>
        )}

        {/* Accounts List with Crypto Badges, Copy Address, & Bank/Crypto Refresh Buttons */}
        <div className="space-y-1.5 flex-1 overflow-y-auto pe-1 custom-scrollbar min-h-0">
          {sortedAccounts.length === 0 ? (
            <div className={`text-center py-4 ${theme.subtleTextClass} text-xs italic rounded-lg border ${theme.borderClass} ${theme.cardBgClass}`}>
              {isFa ? 'هیچ حسابی در این بخش یافت نشد.' : 'No accounts found in this tab.'}
            </div>
          ) : (
            sortedAccounts.map((acc, idx) => {
              const isEditing = editingId === acc.id;
              const isCrypto =
                acc.type === 'crypto' ||
                ['USDT', 'BTC', 'ETH', 'TON', 'SOL', 'CRYPTO'].includes(acc.currency);
              const isSyncingThis = syncingIds.has(acc.id) || isSyncingAll;
              const isJustSynced = justSyncedId === acc.id;
              const defaultLabel = isFa
                ? `حساب ${idx === 0 ? 'اول' : idx === 1 ? 'دوم' : idx === 2 ? 'سوم' : idx + 1}`
                : `Account ${idx + 1}`;

              return (
                <div
                  key={acc.id}
                  className={`border rounded-lg p-2 transition-all ${
                    isJustSynced
                      ? 'bg-emerald-500/20 border-emerald-500/50 shadow-xs'
                      : isCrypto
                      ? theme.isDark
                        ? 'border-amber-400/30 bg-black/25 hover:bg-black/35'
                        : 'border-amber-200 bg-amber-50/70 hover:bg-amber-100/70'
                      : `${theme.borderClass} ${theme.cardBgClass} ${theme.cardHoverClass}`
                  }`}
                >
                  {isEditing ? (
                    <div className="space-y-1.5 text-xs">
                      <div className="grid grid-cols-2 gap-1.5">
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="نام حساب"
                          className={`p-1 rounded focus:outline-none text-[11px] ${theme.inputClass}`}
                        />
                        <input
                          type="text"
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          placeholder={isCrypto ? 'صرافی / ولت' : 'بانک / شعبه'}
                          className={`p-1 rounded focus:outline-none text-[11px] ${theme.inputClass}`}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        <input
                          type="number"
                          step="any"
                          value={balance}
                          onChange={(e) => setBalance(e.target.value)}
                          placeholder="موجودی"
                          className={`col-span-2 p-1 rounded focus:outline-none text-[11px] ${theme.inputClass}`}
                        />
                        <select
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value as any)}
                          className={`p-1 rounded focus:outline-none text-[11px] ${theme.inputClass}`}
                        >
                          {isCrypto ? (
                            <>
                              <option value="USDT">USDT</option>
                              <option value="BTC">BTC</option>
                              <option value="ETH">ETH</option>
                              <option value="TON">TON</option>
                              <option value="SOL">SOL</option>
                              <option value="CRYPTO">CRYPTO</option>
                            </>
                          ) : (
                            <>
                              <option value="TMN">تومان</option>
                              <option value="IRR">ریال</option>
                              <option value="USD">دلار</option>
                              <option value="EUR">یورو</option>
                            </>
                          )}
                        </select>
                      </div>
                      {isCrypto && (
                        <div className="grid grid-cols-2 gap-1.5">
                          <input
                            type="text"
                            value={network}
                            onChange={(e) => setNetwork(e.target.value)}
                            placeholder="شبکه (e.g. TRC20)"
                            className={`p-1 rounded focus:outline-none text-[11px] ${theme.inputClass}`}
                          />
                          <input
                            type="text"
                            value={walletAddress}
                            onChange={(e) => setWalletAddress(e.target.value)}
                            placeholder="آدرس ولت"
                            className={`p-1 rounded focus:outline-none text-[11px] font-mono ${theme.inputClass}`}
                          />
                        </div>
                      )}
                      <div className="flex justify-end gap-1.5 pt-0.5">
                        <button
                          onClick={() => setEditingId(null)}
                          className={`px-2 py-0.5 ${theme.buttonBgClass} rounded text-[10px]`}
                        >
                          {isFa ? 'انصراف' : 'Cancel'}
                        </button>
                        <button
                          onClick={() => handleSaveEdit(acc.id)}
                          className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-semibold flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          {isFa ? 'ذخیره' : 'Save'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {isCrypto ? (
                          <div className="w-5 h-5 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-400 shrink-0">
                            <Coins className="w-3 h-3" />
                          </div>
                        ) : (
                          <div className={`w-5 h-5 rounded-full ${theme.isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'} flex items-center justify-center shrink-0`}>
                            <Building2 className="w-3 h-3" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <p className="text-[11px] sm:text-xs font-semibold truncate">
                              {acc.name || defaultLabel}
                            </p>
                            {isCrypto ? (
                              <span className="text-[9px] px-1 py-0.2 bg-amber-500/20 text-amber-400 rounded font-mono shrink-0">
                                {acc.network || acc.currency}
                              </span>
                            ) : (
                              acc.bankName && (
                                <span className={`text-[9px] px-1 py-0.2 ${theme.isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-50 text-blue-700'} rounded shrink-0`}>
                                  {acc.bankName}
                                </span>
                              )
                            )}
                          </div>
                          {(acc.accountNumber || acc.walletAddress) && (
                            <div className={`flex items-center gap-1 text-[9px] sm:text-[10px] ${theme.subtleTextClass} truncate`}>
                              {acc.accountNumber && (
                                <span className="truncate font-mono">{acc.accountNumber}</span>
                              )}
                              {acc.walletAddress && (
                                <button
                                  onClick={() => handleCopyAddress(acc.id, acc.walletAddress!)}
                                  className="hover:text-amber-400 font-mono transition cursor-pointer flex items-center gap-0.5"
                                  title={isFa ? 'کپی آدرس ولت' : 'Copy Wallet Address'}
                                >
                                  <span className="truncate max-w-[85px] sm:max-w-[120px]">
                                    {acc.walletAddress}
                                  </span>
                                  {copiedId === acc.id ? (
                                    <Check className="w-2.5 h-2.5 text-green-400" />
                                  ) : (
                                    <Copy className="w-2.5 h-2.5" />
                                  )}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <span className={`font-mono font-bold text-[11px] sm:text-xs ${
                          theme.isDark ? 'bg-black/30 text-amber-300' : 'bg-slate-100 text-slate-900 border border-slate-200'
                        } px-1.5 py-0.5 rounded shrink-0`}>
                          {isPrivacyMode
                            ? '••••••••'
                            : formatCurrency(acc.balance, acc.currency, isFa)}
                        </span>

                        <div className="flex items-center gap-0.5">
                          {/* Crypto Wallet Instant Refresh Button (Icon-only) */}
                          {isCrypto ? (
                            <button
                              onClick={() => handleRefreshWallet(acc.id)}
                              disabled={isSyncingThis}
                              className={`p-1 ${theme.buttonBgClass} hover:text-amber-300 rounded transition cursor-pointer`}
                              title={
                                isFa
                                  ? acc.lastSyncedAt
                                    ? `بروزرسانی موجودی ولت (آخرین استعلام: ${new Date(
                                        acc.lastSyncedAt
                                      ).toLocaleTimeString('fa-IR', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })})`
                                    : 'بروزرسانی آنلاین موجودی ولت'
                                  : 'Refresh Wallet Balance'
                              }
                            >
                              <RefreshCw
                                className={`w-3 h-3 ${
                                  isSyncingThis ? 'animate-spin text-amber-400' : 'text-amber-400'
                                }`}
                              />
                            </button>
                          ) : (
                            /* Bank Account Direct Sync Button (Icon-only) */
                            <button
                              onClick={() => {
                                setSelectedBankAccountId(acc.id);
                                setIsBankSyncModalOpen(true);
                              }}
                              className={`p-1 ${theme.buttonBgClass} hover:text-blue-400 rounded transition cursor-pointer`}
                              title={
                                isFa
                                  ? acc.lastSyncedAt
                                    ? `سینک و بروزرسانی مانده بانکی (آخرین استعلام: ${new Date(
                                        acc.lastSyncedAt
                                      ).toLocaleTimeString('fa-IR', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })})`
                                    : 'سینک و بروزرسانی مانده حساب بانکی (پیامک / وب‌سرویس)'
                                  : 'Sync & Update Bank Balance (SMS / API)'
                              }
                            >
                              <RefreshCw className="w-3 h-3 text-blue-400" />
                            </button>
                          )}

                          <button
                            onClick={() => handleStartEdit(acc)}
                            className={`p-1 ${theme.buttonBgClass} rounded transition cursor-pointer`}
                            title={isFa ? 'ویرایش' : 'Edit'}
                          >
                            <Edit2 className="w-2.5 h-2.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(acc.id)}
                            className={`p-1 ${theme.buttonBgClass} hover:text-red-400 rounded transition cursor-pointer`}
                            title={isFa ? 'حذف' : 'Delete'}
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className={`mt-2 pt-1.5 border-t ${theme.borderClass} flex items-center justify-between text-[10px] ${theme.subtleTextClass} shrink-0`}>
        <div className="flex items-center gap-1.5">
          <span>
            {isFa
              ? `${toPersianDigits(bankCount)} حساب بانکی + ${toPersianDigits(cryptoCount)} ولت کریپتو`
              : `${bankCount} Bank accounts + ${cryptoCount} Crypto wallets`}
          </span>
        </div>
        <span className="opacity-80">
          {isFa ? 'خزانه‌داری جامع ریالی و ارزی' : 'Treasury & Liquidity'}
        </span>
      </div>

      {/* Dedicated Bank Sync Infrastructure Modal */}
      <BankSyncModal
        isOpen={isBankSyncModalOpen}
        onClose={() => setIsBankSyncModalOpen(false)}
        accounts={accounts}
        onUpdateAccounts={onUpdateAccounts}
        language={language}
        selectedAccountId={selectedBankAccountId}
      />

      {/* Settings Modal (Auto-Sync Interval & Refresh Frequency) */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-slate-900 text-white rounded-2xl border border-slate-700 shadow-2xl max-w-md w-full p-4.5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">
                    {isFa ? 'تنظیمات بروزرسانی خودکار ولت‌ها' : 'Crypto Auto-Sync Settings'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {isFa
                      ? 'تعیین بازه زمانی استعلام و تطبیق مانده ولت‌های کریپتو'
                      : 'Set background refresh interval for crypto balances'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Interval Options */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                {isFa ? 'بازه زمانی بروزرسانی خودکار:' : 'Auto-refresh frequency:'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 0, labelFa: 'غیرفعال (فقط دستی)', labelEn: 'Manual only' },
                  { value: 15, labelFa: 'هر ۱۵ دقیقه', labelEn: 'Every 15 mins' },
                  { value: 30, labelFa: 'هر ۳۰ دقیقه', labelEn: 'Every 30 mins' },
                  { value: 60, labelFa: 'هر ۱ ساعت (پیش‌فرض)', labelEn: 'Every 1 hour (Default)' },
                  { value: 360, labelFa: 'هر ۶ ساعت', labelEn: 'Every 6 hours' },
                  { value: 1440, labelFa: 'هر ۲۴ ساعت (روزانه)', labelEn: 'Every 24 hours' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleSaveInterval(opt.value)}
                    className={`p-2 rounded-xl text-xs font-medium border text-start transition cursor-pointer flex items-center justify-between ${
                      autoSyncInterval === opt.value
                        ? 'bg-amber-500/20 border-amber-500/60 text-amber-200'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{isFa ? opt.labelFa : opt.labelEn}</span>
                    {autoSyncInterval === opt.value && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Sync Info Banner */}
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-[11px] text-slate-300 space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isFa ? 'نحوه کارکرد بروزرسانی ولت‌ها' : 'How it works'}</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                {isFa
                  ? 'با فعال بودن بازه زمانی، سیستم در پس‌زمینه نرخ تتر و استعلام آدرس‌های ولت (TRC20, ERC20, Solana, TON) را بررسی کرده و مجموع ارزش دارایی‌ها را در داشبورد همگام نگه می‌دارد.'
                  : 'The system periodically queries wallet addresses and updates current exchange valuations in your dashboard.'}
              </p>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => {
                  setIsSettingsOpen(false);
                  setIsBankSyncModalOpen(true);
                }}
                className="text-xs text-blue-400 hover:text-blue-300 underline cursor-pointer flex items-center gap-1"
              >
                <Smartphone className="w-3 h-3" />
                <span>{isFa ? 'سامانه همگام‌سازی حساب‌های بانکی' : 'Open Bank Sync Hub'}</span>
              </button>

              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                {isFa ? 'تایید و بستن' : 'Done'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bank Account Sync Solutions Guide Modal */}
      {isBankSyncGuideOpen && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-slate-900 text-white rounded-2xl border border-slate-700 shadow-2xl max-w-lg w-full p-4.5 space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">
                    {isFa ? 'راهکارهای اتصال و سینک خودکار حساب‌های بانکی' : 'Bank Account Synchronization Solutions'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {isFa
                      ? 'بررسی روش‌های فنی همگام‌سازی موجودی و صورت‌حساب بانک‌ها در ایران'
                      : 'Technical methods for syncing Iranian bank accounts'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBankSyncGuideOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              {/* Method 1: Bank SMS Parsing */}
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1.5">
                <div className="flex items-center justify-between text-emerald-400 font-bold">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-emerald-500/20 flex items-center justify-center text-[10px]">۱</div>
                    <span>{isFa ? 'تحلیل خودکار پیامک‌های بانکی (SMS Parser)' : 'Bank SMS Parsing'}</span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-300">{isFa ? 'عملیاتی و آماده' : 'Active'}</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  {isFa
                    ? 'پیامک واریز یا برداشت دریافتی از بانک را کپی و در سامانه سینک الصاق کنید تا بانک، مبلغ و مانده جدید خودکار استخراج و حساب به‌روزرسانی شود.'
                    : 'Incoming bank transaction SMS messages are parsed to extract real-time balance.'}
                </p>
              </div>

              {/* Method 2: Open Banking APIs */}
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1.5">
                <div className="flex items-center justify-between text-blue-400 font-bold">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-blue-500/20 flex items-center justify-center text-[10px]">۲</div>
                    <span>{isFa ? 'وب‌سرویس‌های بانکداری باز (Open Banking APIs)' : 'Open Banking APIs'}</span>
                  </div>
                  <span className="text-[10px] bg-blue-500/20 px-2 py-0.5 rounded text-blue-300">{isFa ? 'وب‌سرویس فعال' : 'Active API'}</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  {isFa
                    ? 'اتصال مستقیم به ارائه‌دهندگان بوم (توسن بوم، فینوداد، هاب شاهین، زیبال و باهمتا) جهت استعلام آنلاین مانده از طریق شماره شبا و توکن احراز هویت.'
                    : 'Open banking aggregator platforms provide official balance inquiry APIs via client tokens.'}
                </p>
              </div>

              {/* Method 3: Excel / CSV Bank Statement Import */}
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1.5">
                <div className="flex items-center justify-between text-amber-400 font-bold">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-amber-500/20 flex items-center justify-center text-[10px]">۳</div>
                    <span>{isFa ? 'درون‌ریزی فایل اکسل / CSV صورت‌حساب اینترنت‌بانک' : 'Excel/CSV Statement Upload'}</span>
                  </div>
                  <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded text-amber-300">{isFa ? 'پشتیبانی کامل' : 'Supported'}</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  {isFa
                    ? 'فایل خروجی گردش حساب یا مانده را از سامانه بام، همراه کارت یا اینترنت‌بانک الصاق نموده تا مانده نهایی استخراج و حساب همگام گردد.'
                    : 'Download transaction statement from your online bank and upload CSV/Excel to auto-sync.'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => {
                  setIsBankSyncGuideOpen(false);
                  setIsBankSyncModalOpen(true);
                }}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>{isFa ? 'ورود به سامانه سینک بانکی' : 'Open Bank Sync Modal'}</span>
              </button>

              <button
                onClick={() => setIsBankSyncGuideOpen(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                {isFa ? 'بستن' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
