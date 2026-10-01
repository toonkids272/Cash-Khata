import React from 'react';
import {
  X,
  FileText,
  FileSpreadsheet,
  ListFilter,
  Users,
  ArrowLeftRight,
  FileBarChart,
  ListOrdered,
  BookOpen,
  Calendar as CalendarIcon,
  Calculator,
  ArrowDownUp,
  Settings as SettingsIcon,
  Trash2,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  BookText,
  Home,
  Share2,
  LogOut,
  Cloud,
  Crown,
} from 'lucide-react';
import { useCashBook } from '../context/CashBookContext';
import { useAuth } from '../context/AuthContext';
import { ActiveView } from '../types';

export const NavigationDrawer: React.FC = () => {
  const {
    isDrawerOpen,
    setIsDrawerOpen,
    activeView,
    setActiveView,
    deletedTransactions,
    accounts,
    setIsInstallModalOpen,
    setIsShareModalOpen,
    isSubscriptionModalOpen,
    setIsSubscriptionModalOpen,
    isPro,
    isCloudSyncing,
  } = useCashBook();

  const { user, signOutUser } = useAuth();

  if (!isDrawerOpen) return null;

  const navigateTo = (view: ActiveView) => {
    setActiveView(view);
    setIsDrawerOpen(false);
  };

  const navItems: { view: ActiveView; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    {
      view: 'accounts',
      label: 'Cash Books',
      icon: <BookText className="w-5 h-5 text-[#0288D1]" />,
      badge: accounts.length > 0 ? accounts.length : undefined,
    },
    { view: 'ledger', label: 'Daily Ledger', icon: <Home className="w-5 h-5" /> },
    { view: 'summary', label: 'Summary', icon: <FileText className="w-5 h-5" /> },
    { view: 'account_summary', label: 'Account Summary', icon: <FileSpreadsheet className="w-5 h-5" /> },
    { view: 'transactions_all', label: 'Transaction-All Accounts', icon: <ListFilter className="w-5 h-5" /> },
    { view: 'transfer', label: 'Transfer', icon: <ArrowLeftRight className="w-5 h-5" /> },
    { view: 'report_all', label: 'Report-All Accounts', icon: <FileBarChart className="w-5 h-5" /> },
    { view: 'transaction_names', label: 'Transaction names', icon: <ListOrdered className="w-5 h-5" /> },
    { view: 'notebook', label: 'Notebook', icon: <BookOpen className="w-5 h-5" /> },
    { view: 'calendar', label: 'Calendar', icon: <CalendarIcon className="w-5 h-5" /> },
    { view: 'cash_calculator', label: 'Cash Calculator', icon: <Calculator className="w-5 h-5" /> },
    { view: 'backup_restore', label: 'Backup and Restore', icon: <ArrowDownUp className="w-5 h-5" /> },
    { view: 'settings', label: 'Settings', icon: <SettingsIcon className="w-5 h-5" /> },
    {
      view: 'deleted_transactions',
      label: 'Deleted Transactions',
      icon: <Trash2 className="w-5 h-5" />,
      badge: deletedTransactions.length > 0 ? deletedTransactions.length : undefined,
    },
    { view: 'help', label: 'Help', icon: <HelpCircle className="w-5 h-5" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
        onClick={() => setIsDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div className="relative w-80 max-w-[85vw] h-full bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
        {/* Top Header matching Screenshot 1 */}
        <div className="bg-[#0288D1] text-white p-6 pb-5 flex flex-col items-center justify-center relative shadow-sm">
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            title="Close Drawer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* App Icon */}
          <img
            src="/app-icon.png"
            alt="Cash Khata"
            className="w-14 h-14 rounded-2xl shadow-md mb-2 object-cover border-2 border-white"
          />

          <h2 className="text-xl font-bold tracking-tight">Cash Khata</h2>
          <p className="text-xs text-sky-100 mt-0.5">Professional Vyapar Ledger</p>
        </div>

        {/* Logged In Google Account Card */}
        {user && (
          <div className="px-4 py-3 bg-sky-50/80 border-b border-sky-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-[#0288D1]/30 shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#0288D1] text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {(user.displayName || user.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">
                  {user.displayName || 'Google Account'}
                </p>
                <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full shrink-0 font-medium">
              <Cloud className="w-3 h-3" />
              <span>{isCloudSyncing ? 'Syncing' : 'Synced'}</span>
            </div>
          </div>
        )}

        {/* Dynamic Pro / Ad-Free Subscription Action Card */}
        <div className="p-3 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50/70 border-b border-amber-200/70">
          <button
            onClick={() => {
              setIsDrawerOpen(false);
              setIsSubscriptionModalOpen(true);
            }}
            className="w-full flex items-center justify-between p-2.5 bg-white hover:bg-amber-50/60 border border-amber-300 rounded-xl shadow-xs transition-all active:scale-[0.98] group text-left"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-500 text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                <Crown className="w-4 h-4 fill-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 flex items-center gap-1">
                  {isPro ? 'Cash Khata Pro' : 'Remove Ads & Go Pro'}
                </p>
                <p className="text-[10px] text-amber-800">
                  {isPro ? '100% Ad-Free Active' : 'Only ₹49/month micro-pass'}
                </p>
              </div>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs ${
                isPro ? 'text-emerald-800 bg-emerald-100' : 'text-white bg-amber-600'
              }`}
            >
              {isPro ? 'Active' : 'Upgrade'}
            </span>
          </button>
        </div>

        {/* Share App & Download APK Action Card */}
        <div className="p-3 bg-gradient-to-r from-emerald-50 via-sky-50 to-blue-50 border-b border-sky-100 space-y-2">
          <button
            onClick={() => {
              setIsDrawerOpen(false);
              setIsShareModalOpen(true);
            }}
            className="w-full flex items-center justify-between p-2.5 bg-white hover:bg-emerald-50/50 border border-emerald-300 rounded-xl shadow-xs transition-all active:scale-[0.98] group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Share2 className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  Share App &amp; APK
                </p>
                <p className="text-[10px] text-slate-500">Send to friends &amp; get APK</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-white bg-emerald-600 px-2 py-0.5 rounded-full shadow-2xs">
              Share
            </span>
          </button>
        </div>

        {/* Menu Items List */}
        <div className="flex-1 overflow-y-auto py-2 divide-y divide-slate-50">
          <div className="px-3 py-1 space-y-0.5">
            {navItems.map((item) => {
              const isActive = activeView === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => navigateTo(item.view)}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left ${
                    isActive
                      ? 'bg-sky-50 text-[#0288D1]'
                      : 'text-slate-700 hover:bg-slate-100 active:bg-slate-200'
                  }`}
                >
                  <span className={`${isActive ? 'text-[#0288D1]' : 'text-slate-600'}`}>{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-100 text-rose-700">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sign Out Action Button */}
        {user && (
          <div className="p-3 border-t border-slate-100 bg-white">
            <button
              onClick={() => {
                setIsDrawerOpen(false);
                signOutUser();
              }}
              className="w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out ({user.email?.split('@')[0]})</span>
            </button>
          </div>
        )}

        {/* Footer info */}
        <div className="p-3 border-t border-slate-100 text-center text-xs text-slate-400 bg-slate-50">
          <p className="font-medium text-slate-600">Cash Khata v2.4</p>
          <p className="text-[11px] mt-0.5">Google Cloud Firestore Synced • Ad-Free</p>
        </div>
      </div>
    </div>
  );
};
