import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  UserPlus,
  Lock,
  Mail,
  User,
  FolderTree,
  Database,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Shield,
  LogOut,
  Layers,
} from 'lucide-react';
import { UserAccount, Language } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserAccount | null;
  onLoginSuccess: (user: UserAccount, state?: any) => void;
  onLogout: () => void;
  language: Language;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout,
  language,
}) => {
  const [tab, setTab] = useState<'login' | 'register' | 'profile'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [availableUsers, setAvailableUsers] = useState<UserAccount[]>([]);

  const isFa = language === 'fa';

  useEffect(() => {
    if (isOpen) {
      fetchExistingUsers();
      if (currentUser) {
        setTab('profile');
      } else {
        setTab('login');
      }
    }
  }, [isOpen, currentUser]);

  const fetchExistingUsers = async () => {
    try {
      const res = await fetch('/api/auth/users');
      if (res.ok) {
        const data = await res.json();
        setAvailableUsers(data.users || []);
      }
    } catch (e) {
      console.error('Error fetching users:', e);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim()) {
      setErrorMessage(isFa ? 'لطفاً نام کاربری و ایمیل را وارد کنید.' : 'Username and email are required.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          name: name.trim() || username.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register');
      }

      setSuccessMessage(
        isFa
          ? `پوشه اختصاصی دیتابیس در هاست (/data/users/${data.user.id}/) ایجاد گردید!`
          : `Tenant database created at (/data/users/${data.user.id}/)!`
      );

      setTimeout(() => {
        onLoginSuccess(data.user);
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'خطا در ثبت نام و ایجاد دیتابیس');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (usernameOrEmail: string) => {
    if (!usernameOrEmail.trim()) {
      setErrorMessage(isFa ? 'لطفاً نام کاربری یا ایمیل را وارد کنید.' : 'Enter username or email.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail: usernameOrEmail.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to login');
      }

      onLoginSuccess(data.user, data.state);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'ورود ناموفق بود.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full overflow-hidden animate-scaleUp">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center">
                <Database className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="font-extrabold text-sm sm:text-base">
                  {isFa ? 'ورود و ساخت پایگاه داده اختصاصی' : 'Authentication & Tenant Storage'}
                </h2>
                <p className="text-[11px] text-blue-100 opacity-90">
                  {isFa
                    ? 'ایجاد پوشه ایزوله و دیتابیس اختصاصی هاست برای هر کاربر'
                    : 'Isolated Host Directory & Database Provisioning'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => {
                setTab('login');
                setErrorMessage(null);
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                tab === 'login'
                  ? 'bg-white text-indigo-900 shadow-xs'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{isFa ? 'ورود به فضا' : 'Sign In'}</span>
            </button>
            <button
              onClick={() => {
                setTab('register');
                setErrorMessage(null);
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                tab === 'register'
                  ? 'bg-white text-indigo-900 shadow-xs'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{isFa ? 'ثبت‌نام کاربر جدید' : 'New Tenant'}</span>
            </button>
            {currentUser && (
              <button
                onClick={() => setTab('profile')}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
                  tab === 'profile'
                    ? 'bg-white text-indigo-900 shadow-xs'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {isFa ? 'پروفایل' : 'Profile'}
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4">
          {/* Alerts */}
          {errorMessage && (
            <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 p-2.5 rounded-lg text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 p-2.5 rounded-lg text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Profile Tab */}
          {tab === 'profile' && currentUser && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                    {currentUser.name.slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {currentUser.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      @{currentUser.username} • {currentUser.email}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-xs space-y-1 text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <FolderTree className="w-3.5 h-3.5 text-teal-500" />
                    <span>/data/users/{currentUser.id}/</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <Database className="w-3.5 h-3.5 text-blue-500" />
                    <span>database.json (ایزوله و اختصاصی)</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  onLogout();
                  setTab('login');
                }}
                className="w-full py-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{isFa ? 'خروج از حساب کاربری' : 'Sign Out'}</span>
              </button>
            </div>
          )}

          {/* Login Tab */}
          {tab === 'login' && (
            <div className="space-y-4">
              {/* Quick Select from existing provisioned users */}
              {availableUsers.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    {isFa ? 'انتخاب از پایگاه‌های داده موجود در هاست:' : 'Existing Provisioned Tenants:'}
                  </label>
                  <div className="space-y-1 max-h-[140px] overflow-y-auto custom-scrollbar">
                    {availableUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => handleLogin(u.username)}
                        disabled={isLoading}
                        className="w-full text-start flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                            {u.name.slice(0, 1)}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block truncate">
                              {u.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              @{u.username}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Or manual input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleLogin(username);
                }}
                className="space-y-3 pt-1"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isFa ? 'نام کاربری یا ایمیل' : 'Username or Email'}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={isFa ? 'مثال: manager یا ایمیل' : 'e.g. manager'}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pr-9 pl-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !username.trim()}
                  className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{isLoading ? (isFa ? 'در حال بارگذاری...' : 'Loading...') : (isFa ? 'ورود به فضای اختصاصی' : 'Sign In')}</span>
                </button>
              </form>
            </div>
          )}

          {/* Register Tab */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isFa ? 'نام کامل و عنوان نمایشی' : 'Full Name'}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isFa ? 'مثال: اسماعیل کارگر' : 'e.g. John Doe'}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isFa ? 'نام کاربری (شناسه پوشه هاست)' : 'Username (Tenant Folder Identifier)'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. esmaeel_k"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pr-9 pl-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isFa ? 'ایمیل کاری' : 'Email'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@domain.com"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pr-9 pl-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              {/* Host directory preview info */}
              <div className="bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 p-2.5 rounded-lg text-[11px] text-teal-800 dark:text-teal-200 space-y-1">
                <div className="flex items-center gap-1 font-bold">
                  <Sparkles className="w-3 h-3 text-teal-500" />
                  <span>{isFa ? 'فرایند خودکار ساخت فضای هاست:' : 'Automatic Host Provisioning:'}</span>
                </div>
                <p className="leading-relaxed text-[10px]">
                  {isFa
                    ? 'پس از ثبت‌نام، پوشه /data/users/[userId]/ و فایل پایگاه داده اختصاصی database.json به همراه فولدر files/ در سرور هاست ایجاد خواهد شد.'
                    : 'A dedicated directory /data/users/[userId]/ with database.json and files/ will be created on the host.'}
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || !username.trim() || !email.trim()}
                className="w-full py-2 bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isLoading ? (isFa ? 'در حال ایجاد دیتابیس در هاست...' : 'Provisioning Tenant...') : (isFa ? 'ثبت‌نام و ایجاد دیتابیس هاست' : 'Register & Provision')}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
