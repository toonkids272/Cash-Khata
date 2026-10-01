import React, { useState, useMemo } from 'react';
import {
  Plus,
  Minus,
  Calendar,
  Search,
  ArrowLeftRight,
  BookOpen,
  Layers,
  Check,
  Share2,
} from 'lucide-react';
import { useCashBook } from '../context/CashBookContext';
import { formatINR, formatDisplayDate } from '../utils/formatters';
import { TimeFilter, Transaction } from '../types';
import { NativeAdCard } from '../components/NativeAdCard';

export const LedgerView: React.FC = () => {
  const {
    currentAccount,
    accounts,
    setCurrentAccountId,
    setIsAddAccountModalOpen,
    setIsShareModalOpen,
    setActiveView,
    transactions,
    timeFilter,
    setTimeFilter,
    searchQuery,
    setIsCashInModalOpen,
    setIsCashOutModalOpen,
    setSelectedTransaction,
  } = useCashBook();

  // Mode: 'single' (focused on currentAccount) vs 'all' (all books combined)
  const [isAllBooksMode, setIsAllBooksMode] = useState(false);

  // Compute live balance for each account to show on chips
  const accountBalances = useMemo(() => {
    const map = new Map<string, number>();
    accounts.forEach((acc) => {
      const accTx = transactions.filter((t) => t.accountId === acc.id);
      const totalIn = accTx
        .filter((t) => t.type === 'in')
        .reduce((sum, t) => sum + t.amount, 0);
      const totalOut = accTx
        .filter((t) => t.type === 'out')
        .reduce((sum, t) => sum + t.amount, 0);
      map.set(acc.id, acc.initialBalance + totalIn - totalOut);
    });
    return map;
  }, [accounts, transactions]);

  // Account lookup map
  const accountMap = useMemo(() => {
    const map = new Map<string, typeof accounts[0]>();
    accounts.forEach((a) => map.set(a.id, a));
    return map;
  }, [accounts]);

  // Filter transactions for current account or all accounts
  const scopedTransactions = useMemo(() => {
    if (isAllBooksMode) {
      return transactions;
    }
    return transactions.filter((t) => t.accountId === currentAccount?.id);
  }, [transactions, isAllBooksMode, currentAccount?.id]);

  const filteredTransactions = useMemo(() => {
    let result = scopedTransactions;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.partyName.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          (t.remarks && t.remarks.toLowerCase().includes(q)) ||
          t.amount.toString().includes(q)
      );
    }

    // Time filter
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (timeFilter === 'daily') {
      result = result.filter((t) => t.date === todayStr);
    } else if (timeFilter === 'weekly') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const weekStr = oneWeekAgo.toISOString().split('T')[0];
      result = result.filter((t) => t.date >= weekStr);
    } else if (timeFilter === 'monthly') {
      const currentYearMonth = todayStr.substring(0, 7);
      result = result.filter((t) => t.date.startsWith(currentYearMonth));
    } else if (timeFilter === 'yearly') {
      const currentYear = todayStr.substring(0, 4);
      result = result.filter((t) => t.date.startsWith(currentYear));
    }

    return result;
  }, [scopedTransactions, searchQuery, timeFilter]);

  // Sort descending by date & time for display (newest on top)
  const displaySorted = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => {
      const dateComp = b.date.localeCompare(a.date);
      if (dateComp !== 0) return dateComp;
      return (b.time || '').localeCompare(a.time || '');
    });
  }, [filteredTransactions]);

  // Compute running balance for each transaction chronologically
  const runningBalances = useMemo(() => {
    const chronological = [...scopedTransactions].sort((a, b) => {
      const dateComp = a.date.localeCompare(b.date);
      if (dateComp !== 0) return dateComp;
      return (a.time || '').localeCompare(b.time || '');
    });

    const map = new Map<string, number>();
    let running = isAllBooksMode
      ? accounts.reduce((sum, a) => sum + a.initialBalance, 0)
      : (currentAccount?.initialBalance || 0);

    chronological.forEach((t) => {
      if (t.type === 'in') {
        running += t.amount;
      } else {
        running -= t.amount;
      }
      map.set(t.id, running);
    });

    return map;
  }, [scopedTransactions, isAllBooksMode, accounts, currentAccount?.initialBalance]);

  // Group by Date for display
  const groupedByDate = useMemo(() => {
    const groups: { [date: string]: Transaction[] } = {};
    displaySorted.forEach((t) => {
      if (!groups[t.date]) {
        groups[t.date] = [];
      }
      groups[t.date].push(t);
    });
    return groups;
  }, [displaySorted]);

  // Calculate totals for active filtered set
  const totalCashIn = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === 'in')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const totalCashOut = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === 'out')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const balance = totalCashIn - totalCashOut;

  const timeTabs: { key: TimeFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'daily', label: 'Daily' },
    { key: 'weekly', label: 'Weekly' },
    { key: 'monthly', label: 'Monthly' },
    { key: 'yearly', label: 'Yearly' },
  ];

  if (accounts.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-100">
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-sm mx-auto my-auto">
          <div className="w-20 h-20 rounded-3xl bg-sky-50 text-[#0288D1] flex items-center justify-center mb-4 shadow-sm border border-sky-100">
            <BookOpen className="w-10 h-10 stroke-[1.5]" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">No Cash Books Yet</h2>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Your ledger is completely empty. Create your first Cash Book or Bank Account to begin recording transactions.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
            <button
              onClick={() => setIsAddAccountModalOpen(true)}
              className="w-full sm:w-auto px-6 py-3 bg-[#0288D1] hover:bg-sky-600 text-white font-bold text-sm rounded-xl shadow-md inline-flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> Create Your First Cash Book
            </button>
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="w-full sm:w-auto px-5 py-3 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold text-sm rounded-xl shadow-2xs inline-flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <Share2 className="w-4 h-4 text-emerald-600" /> Share App / APK
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 pb-36">
      {/* Multi-Book Carousel / Switcher Ribbon */}
      <div className="bg-[#0288D1] px-3 pt-1 pb-2 border-b border-sky-400/30">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[11px] font-bold text-sky-100 uppercase tracking-wider flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> Cash Books &amp; Accounts ({accounts.length})
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView('transfer')}
              className="text-[11px] font-semibold text-white/90 hover:text-white flex items-center gap-1 bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded-md transition-colors"
              title="Transfer money between books"
            >
              <ArrowLeftRight className="w-3 h-3" /> Transfer
            </button>
            <button
              onClick={() => setIsAddAccountModalOpen(true)}
              className="text-[11px] font-semibold text-white bg-sky-500 hover:bg-sky-400 px-2 py-0.5 rounded-md shadow-2xs flex items-center gap-1 transition-colors"
              title="Add a new cash book or bank account"
            >
              <Plus className="w-3 h-3 stroke-[3]" /> Add Book
            </button>
          </div>
        </div>

        {/* Scrollable Books Carousel Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {/* Individual Cash Books */}
          {accounts.map((acc) => {
            const isSelected = !isAllBooksMode && acc.id === currentAccount?.id;
            const bal = accountBalances.get(acc.id) || 0;

            return (
              <button
                key={acc.id}
                onClick={() => {
                  setIsAllBooksMode(false);
                  setCurrentAccountId(acc.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                  isSelected
                    ? 'bg-white text-[#0288D1] shadow-xs ring-2 ring-white/50'
                    : 'bg-white/15 text-white hover:bg-white/25 active:bg-white/30'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: isSelected ? acc.color : '#FFFFFF' }}
                />
                <span>{acc.name}</span>
                <span
                  className={`text-[10px] font-mono tabular-nums px-1.5 py-0.2 rounded ${
                    isSelected ? 'bg-sky-50 text-[#0288D1]' : 'bg-black/20 text-sky-100'
                  }`}
                >
                  {formatINR(bal)}
                </span>
              </button>
            );
          })}

          {/* All Books (Consolidated) Chip */}
          <button
            onClick={() => setIsAllBooksMode(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
              isAllBooksMode
                ? 'bg-white text-[#0288D1] shadow-xs ring-2 ring-white/50'
                : 'bg-white/15 text-white hover:bg-white/25 active:bg-white/30'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Books (Combined)</span>
          </button>
        </div>
      </div>

      {/* Time Filter Pills matching Screenshot 2 */}
      <div className="bg-[#0288D1] px-3 pb-3 pt-1">
        <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
          {timeTabs.map((tab) => {
            const isSelected = timeFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setTimeFilter(tab.key)}
                className={`flex-1 py-1 px-3 text-xs sm:text-sm font-semibold rounded-full transition-colors whitespace-nowrap text-center ${
                  isSelected
                    ? 'bg-white text-[#0288D1] shadow-xs'
                    : 'text-white/90 hover:bg-white/10 active:bg-white/20'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Blue Subheader Banner matching Screenshot 2: "All" or Active Book Name */}
      <div className="bg-[#0288D1]/90 text-white px-4 py-1.5 flex items-center justify-between text-xs font-semibold tracking-wide">
        <span>{timeFilter.toUpperCase()}</span>
        <span className="text-[11px] font-medium text-sky-100">
          Book: {isAllBooksMode ? 'All Books (Consolidated)' : currentAccount.name}
        </span>
      </div>

      {/* Ledger Table Headers: Date | Cash In | Cash Out */}
      <div className="bg-slate-200/90 border-b border-slate-300 px-4 py-2 flex items-center justify-between text-xs font-bold text-slate-700 select-none">
        <span className="w-1/2">Date / Particulars</span>
        <div className="w-1/2 flex justify-end gap-6 text-right">
          <span className="text-emerald-700">Cash In</span>
          <span className="text-rose-700">Cash Out</span>
        </div>
      </div>

      {/* Transaction List Grouped by Date */}
      <div className="flex-1 divide-y divide-slate-200">
        {Object.keys(groupedByDate).length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-sky-50 text-[#0288D1] flex items-center justify-center mb-3 shadow-2xs">
              <Calendar className="w-8 h-8 stroke-[1.5]" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">
              {isAllBooksMode
                ? 'No transactions across any book'
                : `No transactions in "${currentAccount.name}"`}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
              {searchQuery
                ? `No transactions matching "${searchQuery}"`
                : 'Your cash book is blank and ready. Record your first transaction using the buttons below.'}
            </p>
            {!searchQuery && (
              <div className="flex gap-2.5 mt-5">
                <button
                  onClick={() => setIsCashInModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-transform active:scale-95"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" /> Cash In
                </button>
                <button
                  onClick={() => setIsCashOutModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition-transform active:scale-95"
                >
                  <Minus className="w-4 h-4 stroke-[2.5]" /> Cash Out
                </button>
              </div>
            )}
          </div>
        ) : (
          Object.entries(groupedByDate).map(([date, txs]) => (
            <div key={date} className="bg-white">
              {/* Date Header matching Screenshot 2: e.g. "Mon, 07 Sep 2026" */}
              <div className="px-4 py-1.5 bg-slate-100 border-y border-slate-200/80 text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>{formatDisplayDate(date)}</span>
                <span className="text-[11px] font-normal text-slate-500">
                  {txs.length} {txs.length === 1 ? 'entry' : 'entries'}
                </span>
              </div>

              {/* Transaction Cards under this Date */}
              <div className="divide-y divide-slate-100">
                {txs.map((tx) => {
                  const isCashIn = tx.type === 'in';
                  const balanceAtTx = runningBalances.get(tx.id) ?? 0;
                  const txAccount = accountMap.get(tx.accountId);

                  return (
                    <div
                      key={tx.id}
                      onClick={() => setSelectedTransaction(tx)}
                      className="px-4 py-3 hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer flex items-center justify-between"
                    >
                      {/* Left: Particulars & Time */}
                      <div className="space-y-0.5 truncate pr-2">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-medium text-slate-900 text-sm truncate">
                            {tx.partyName}
                          </h4>
                          {isAllBooksMode && txAccount && (
                            <span
                              className="text-[10px] px-1.5 py-0.2 rounded font-medium text-white truncate max-w-[90px]"
                              style={{ backgroundColor: txAccount.color }}
                            >
                              {txAccount.name}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span>{tx.time || '12:00 PM'}</span>
                          {tx.category && (
                            <>
                              <span>·</span>
                              <span className="truncate">{tx.category}</span>
                            </>
                          )}
                          {tx.paymentMode && tx.paymentMode !== 'Cash' && (
                            <>
                              <span>·</span>
                              <span className="text-sky-600">{tx.paymentMode}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Right: Amount & Running Balance */}
                      <div className="text-right shrink-0">
                        <div
                          className={`font-bold font-mono text-base tabular-nums ${
                            isCashIn ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {formatINR(tx.amount, { showSymbol: false })}
                        </div>
                        <div className="text-[11px] font-mono tabular-nums text-slate-500">
                          Balance {formatINR(balanceAtTx, { showSymbol: false })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}

        {/* Google AdMob Native Ad Placement */}
        <NativeAdCard className="mt-3 mb-2" variant="feed" />
      </div>

      {/* Persistent Bottom Controls & Summary Container (Matching Screenshots 2, 3 & 4) */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 shadow-xl">
        {/* Big Dual Action Buttons: [ Cash In (Green) ] [ Cash Out (Red) ] */}
        <div className="grid grid-cols-2 gap-2 p-2.5 max-w-xl mx-auto">
          <button
            onClick={() => setIsCashInModalOpen(true)}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm sm:text-base rounded-xl shadow-md transition-all active:scale-[0.98]"
            title="Record Cash In (Receipt)"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>Cash In</span>
          </button>

          <button
            onClick={() => setIsCashOutModalOpen(true)}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-sm sm:text-base rounded-xl shadow-md transition-all active:scale-[0.98]"
            title="Record Cash Out (Payment)"
          >
            <Minus className="w-5 h-5 stroke-[2.5]" />
            <span>Cash Out</span>
          </button>
        </div>

        {/* Persistent Bottom Summary Bar matching Screenshot 2, 3 & 4: Total Cash In | Total Cash Out | Balance */}
        <div className="bg-slate-100 border-t border-slate-200 py-2 px-3">
          <div className="grid grid-cols-3 text-center divide-x divide-slate-200 max-w-xl mx-auto">
            <div>
              <p className="text-[11px] font-semibold text-slate-500">Total Cash In</p>
              <p className="text-xs sm:text-sm font-bold font-mono tabular-nums text-emerald-700">
                {formatINR(totalCashIn, { showSymbol: false })}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500">Total Cash Out</p>
              <p className="text-xs sm:text-sm font-bold font-mono tabular-nums text-rose-700">
                {formatINR(totalCashOut, { showSymbol: false })}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500">
                {isAllBooksMode ? 'All Books Balance' : 'Balance'}
              </p>
              <p
                className={`text-xs sm:text-sm font-bold font-mono tabular-nums ${
                  balance >= 0 ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {formatINR(balance, { showSymbol: false })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
