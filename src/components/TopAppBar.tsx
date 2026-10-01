import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  ChevronDown,
  FileText,
  Search,
  MoreVertical,
  X,
  Plus,
  Check,
  Calculator,
  Trash2,
  Settings,
  ArrowDownUp,
  Share2,
  Cloud,
  LogOut,
  User as UserIcon,
  Crown,
} from 'lucide-react';
import { useCashBook } from '../context/CashBookContext';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../utils/formatters';

export const TopAppBar: React.FC = () => {
  const {
    currentAccount,
    accounts,
    setCurrentAccountId,
    setIsDrawerOpen,
    setIsExportModalOpen,
    setIsShareModalOpen,
    isSubscriptionModalOpen,
    setIsSubscriptionModalOpen,
    isPro,
    searchQuery,
    setSearchQuery,
    isSearchOpen,
    setIsSearchOpen,
    setActiveView,
    activeView,
    transactions,
    isCloudSyncing,
  } = useCashBook();

  const { user, signOutUser } = useAuth();

  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close popups on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setIsAccountDropdownOpen(false);
      }
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setIsMoreMenuOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#0288D1] text-white shadow-md select-none">
      {/* Main Top Bar */}
      <div className="flex items-center justify-between px-3 h-14">
        {/* Left: Hamburger */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="p-2 -ml-1 text-white hover:bg-white/10 active:bg-white/20 rounded-full transition-colors flex items-center justify-center min-w-[44px] min-h-[44px]"
            title="Open Menu"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Account Title Dropdown */}
          <div className="relative" ref={accountRef}>
            <button
              onClick={() => setIsAccountDropdownOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-white/10 active:bg-white/20 transition-colors"
              title="Switch Account"
            >
              <span className="font-semibold text-base sm:text-lg tracking-tight max-w-[150px] sm:max-w-[200px] truncate">
                {activeView === 'ledger'
                  ? (accounts.length > 0 ? currentAccount.name : 'Cash Khata')
                  : activeView.replace('_', ' ').toUpperCase()}
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isAccountDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Account Switcher Dropdown */}
            {isAccountDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Saved Cash Books
                </div>

                <div className="max-h-60 overflow-y-auto">
                  {accounts.length === 0 ? (
                    <div className="px-3 py-4 text-xs text-slate-400 text-center">
                      No cash books created yet
                    </div>
                  ) : (
                    accounts.map((acc) => {
                    const isSelected = acc.id === currentAccount?.id;
                    const accTx = transactions.filter((t) => t.accountId === acc.id);
                    const net =
                      acc.initialBalance +
                      accTx.reduce((sum, t) => sum + (t.type === 'in' ? t.amount : -t.amount), 0);

                    return (
                      <button
                        key={acc.id}
                        onClick={() => {
                          setCurrentAccountId(acc.id);
                          setActiveView('ledger');
                          setIsAccountDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-left text-sm transition-colors ${
                          isSelected ? 'bg-sky-50 text-[#0288D1] font-semibold' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: acc.color }}
                          />
                          <span className="truncate">{acc.name}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-mono tabular-nums text-slate-500">
                            {formatINR(net)}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-[#0288D1]" />}
                        </div>
                      </button>
                    );
                  })
                )}
                </div>

                <div className="border-t border-slate-100 mt-1 pt-1">
                  <button
                    onClick={() => {
                      setActiveView('accounts');
                      setIsAccountDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#0288D1] hover:bg-sky-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Manage All Cash Books
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Action Icons: Report, Search, More */}
        <div className="flex items-center gap-0.5">
          {/* Document / Report Icon matching Screenshot 2 */}
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="p-2 text-white hover:bg-white/10 active:bg-white/20 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center relative"
            title="Export Report (PDF / Excel)"
            aria-label="Export Report"
          >
            <FileText className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-400 rounded-full ring-2 ring-[#0288D1]" />
          </button>

          {/* Search Icon */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className={`p-2 text-white hover:bg-white/10 active:bg-white/20 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${
              isSearchOpen ? 'bg-white/20' : ''
            }`}
            title="Search Transactions"
            aria-label="Search Transactions"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Share App & APK Button */}
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="p-2 text-white hover:bg-white/10 active:bg-white/20 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            title="Share App & Download APK"
            aria-label="Share App & Download APK"
          >
            <Share2 className="w-5 h-5" />
          </button>

          {/* Pro / Ad-Free Crown Button */}
          <button
            onClick={() => setIsSubscriptionModalOpen(true)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
              isPro
                ? 'bg-amber-400 hover:bg-amber-300 text-amber-950 shadow-xs'
                : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 hover:brightness-105 text-amber-950 shadow-md active:scale-95'
            }`}
            title={isPro ? 'Pro Member (Ad-Free Active)' : 'Remove Ads (₹49/mo)'}
          >
            <Crown className="w-3.5 h-3.5 fill-amber-950" />
            <span className="hidden sm:inline">{isPro ? 'Pro Active' : 'Ad-Free (₹49)'}</span>
          </button>

          {/* 3-Dots More Menu */}
          <div className="relative" ref={moreRef}>
            <button
              onClick={() => setIsMoreMenuOpen((prev) => !prev)}
              className="p-2 text-white hover:bg-white/10 active:bg-white/20 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              title="More Options"
              aria-label="More Options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {isMoreMenuOpen && (
              <div className="absolute top-full right-0 mt-1 w-52 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={() => {
                    setIsSubscriptionModalOpen(true);
                    setIsMoreMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-left text-sm text-amber-900 bg-amber-50 hover:bg-amber-100 transition-colors font-medium border-b border-amber-100"
                >
                  <Crown className="w-4 h-4 text-amber-600 fill-amber-500" />
                  <span>{isPro ? 'Manage Pro (Ad-Free)' : 'Remove Ads (₹49/mo)'}</span>
                </button>

                <button
                  onClick={() => {
                    setIsShareModalOpen(true);
                    setIsMoreMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-left text-sm text-emerald-700 font-semibold hover:bg-emerald-50 transition-colors"
                >
                  <Share2 className="w-4 h-4 text-emerald-600" />
                  <span>Share App &amp; APK</span>
                </button>

                <button
                  onClick={() => {
                    setIsExportModalOpen(true);
                    setIsMoreMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <FileText className="w-4 h-4 text-[#0288D1]" />
                  <span>Export PDF / Excel</span>
                </button>

                <button
                  onClick={() => {
                    setActiveView('cash_calculator');
                    setIsMoreMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Calculator className="w-4 h-4 text-emerald-600" />
                  <span>Cash Denomination</span>
                </button>

                <button
                  onClick={() => {
                    setActiveView('backup_restore');
                    setIsMoreMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <ArrowDownUp className="w-4 h-4 text-purple-600" />
                  <span>Backup &amp; Restore</span>
                </button>

                <button
                  onClick={() => {
                    setActiveView('deleted_transactions');
                    setIsMoreMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-rose-600" />
                  <span>Recycle Bin</span>
                </button>

                <div className="border-t border-slate-100 my-1" />

                <button
                  onClick={() => {
                    setActiveView('settings');
                    setIsMoreMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-500" />
                  <span>Settings</span>
                </button>

                {user && (
                  <button
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      signOutUser();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 transition-colors border-t border-slate-100"
                  >
                    <LogOut className="w-4 h-4 text-rose-600" />
                    <span>Sign Out</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* User Profile Avatar with Cloud Sync Badge */}
          {user && (
            <div className="relative ml-0.5" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen((prev) => !prev)}
                className="relative p-1 rounded-full hover:bg-white/10 active:bg-white/20 transition-all flex items-center justify-center min-w-[38px] min-h-[38px]"
                title={`Signed in as ${user.displayName || user.email}`}
                aria-label="User Profile and Cloud Sync"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Profile'}
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-white/70 shadow-xs"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-white text-[#0288D1] font-bold text-xs flex items-center justify-center shadow-xs">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                {/* Cloud Sync Pulse Dot */}
                <span
                  className={`absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0288D1] ${
                    isCloudSyncing ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'
                  }`}
                  title={isCloudSyncing ? 'Syncing with Google Cloud...' : 'Cloud Synced'}
                />
              </button>

              {/* Profile Popover Card */}
              {isProfileOpen && (
                <div className="absolute top-full right-0 mt-1 w-64 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-100 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-sky-100 shadow-2xs"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-sky-50 text-[#0288D1] font-bold text-sm flex items-center justify-center border border-sky-100">
                        {(user.displayName || user.email || 'U')[0].toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {user.displayName || 'Google Account'}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    </div>
                  </div>

                  {/* Sync status card */}
                  <div className="my-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Cloud className={`w-4 h-4 ${isCloudSyncing ? 'text-amber-500 animate-pulse' : 'text-emerald-600'}`} />
                      <span className="font-semibold text-slate-700">
                        {isCloudSyncing ? 'Syncing...' : 'Cloud Synced'}
                      </span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>

                  {/* Sign Out Button */}
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      signOutUser();
                    }}
                    className="w-full py-2 px-3 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Expandable Search Input Bar */}
      {isSearchOpen && (
        <div className="px-3 pb-3 pt-1 flex items-center gap-2 bg-[#0288D1] animate-in slide-in-from-top-2 duration-150">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by party, remark, category, or amount..."
              className="w-full pl-9 pr-9 py-2 bg-white text-slate-900 text-sm rounded-lg focus:outline-none shadow-inner"
              autoFocus
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-1 text-slate-400 hover:text-slate-600 absolute right-2.5 top-2"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => {
              setIsSearchOpen(false);
              setSearchQuery('');
            }}
            className="text-xs font-semibold px-2 py-2 text-white hover:text-sky-100"
          >
            Cancel
          </button>
        </div>
      )}
    </header>
  );
};
