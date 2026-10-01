import React, { useMemo } from 'react';
import { ArrowLeft, Calendar, FileText, TrendingUp, TrendingDown, Wallet, PieChart } from 'lucide-react';
import { useCashBook } from '../context/CashBookContext';
import { formatINR } from '../utils/formatters';
import { TimeFilter } from '../types';
import { NativeAdCard } from '../components/NativeAdCard';

export const SummaryView: React.FC = () => {
  const {
    currentAccount,
    transactions,
    timeFilter,
    setTimeFilter,
    setActiveView,
    setIsExportModalOpen,
  } = useCashBook();

  const accountTransactions = useMemo(() => {
    return transactions.filter((t) => t.accountId === currentAccount?.id);
  }, [transactions, currentAccount?.id]);

  const filteredTransactions = useMemo(() => {
    let result = accountTransactions;
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
  }, [accountTransactions, timeFilter]);

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

  // Category Breakdown
  const categoryStats = useMemo(() => {
    const map: { [cat: string]: { inAmount: number; outAmount: number; count: number } } = {};
    filteredTransactions.forEach((t) => {
      const cat = t.category || 'General';
      if (!map[cat]) {
        map[cat] = { inAmount: 0, outAmount: 0, count: 0 };
      }
      map[cat].count += 1;
      if (t.type === 'in') {
        map[cat].inAmount += t.amount;
      } else {
        map[cat].outAmount += t.amount;
      }
    });
    return Object.entries(map).sort((a, b) => (b[1].inAmount + b[1].outAmount) - (a[1].inAmount + a[1].outAmount));
  }, [filteredTransactions]);

  const timeTabs: { key: TimeFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'daily', label: 'Daily' },
    { key: 'weekly', label: 'Weekly' },
    { key: 'monthly', label: 'Monthly' },
    { key: 'yearly', label: 'Yearly' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 pb-28">
      {/* Top Header matching Screenshot 3 */}
      <div className="sticky top-0 z-30 bg-[#0288D1] text-white shadow-md">
        <div className="flex items-center justify-between px-3 h-14">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView('ledger')}
              className="p-2 -ml-1 text-white hover:bg-white/10 active:bg-white/20 rounded-full transition-colors"
              title="Back to Ledger"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-bold">Summary</h2>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveView('calendar')}
              className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
              title="Calendar View"
            >
              <Calendar className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
              title="Export Report"
            >
              <FileText className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Pills matching Screenshot 3 */}
        <div className="px-3 pb-3">
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
      </div>

      {/* Blue Subheader Banner matching Screenshot 3: "All" */}
      <div className="bg-[#0288D1]/90 text-white px-4 py-1.5 text-center text-xs font-semibold tracking-wide">
        {timeFilter.toUpperCase()}
      </div>

      {/* Main Content Card matching Screenshot 3 */}
      <div className="p-4 max-w-xl mx-auto w-full space-y-4">
        {/* Card: Cash Book summary */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 text-center font-bold text-slate-800 text-base">
            {currentAccount.name}
          </div>

          <div className="grid grid-cols-3 divide-x divide-slate-100 py-4 px-2 text-center">
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">Total Cash In</p>
              <p className="text-sm sm:text-base font-bold font-mono tabular-nums text-emerald-700">
                {formatINR(totalCashIn, { showSymbol: false })}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1 text-rose-600">Total Cash Out</p>
              <p className="text-sm sm:text-base font-bold font-mono tabular-nums text-rose-600">
                {formatINR(totalCashOut, { showSymbol: false })}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">Balance</p>
              <p
                className={`text-sm sm:text-base font-bold font-mono tabular-nums ${
                  balance >= 0 ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {formatINR(balance, { showSymbol: false })}
              </p>
            </div>
          </div>
        </div>

        {/* Visual Cash Flow Bar */}
        {(totalCashIn > 0 || totalCashOut > 0) && (
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Cash Flow Ratio
            </h4>
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex">
              <div
                className="bg-emerald-500 transition-all duration-300"
                style={{
                  width: `${
                    totalCashIn + totalCashOut > 0
                      ? (totalCashIn / (totalCashIn + totalCashOut)) * 100
                      : 50
                  }%`,
                }}
                title={`Cash In: ${formatINR(totalCashIn)}`}
              />
              <div
                className="bg-rose-500 transition-all duration-300"
                style={{
                  width: `${
                    totalCashIn + totalCashOut > 0
                      ? (totalCashOut / (totalCashIn + totalCashOut)) * 100
                      : 50
                  }%`,
                }}
                title={`Cash Out: ${formatINR(totalCashOut)}`}
              />
            </div>
            <div className="flex justify-between text-[11px] font-mono tabular-nums text-slate-500 pt-1">
              <span className="text-emerald-700 font-semibold">
                In: {((totalCashIn / (totalCashIn + totalCashOut || 1)) * 100).toFixed(0)}%
              </span>
              <span className="text-rose-700 font-semibold">
                Out: {((totalCashOut / (totalCashIn + totalCashOut || 1)) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        )}

        {/* Google AdMob Native Ad */}
        <NativeAdCard className="my-3" variant="feed" />

        {/* Category Breakdown Table */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h4 className="font-bold text-slate-800 text-sm">Category Breakdown</h4>
            <span className="text-xs text-slate-400">{categoryStats.length} Categories</span>
          </div>

          <div className="divide-y divide-slate-100">
            {categoryStats.map(([cat, stats]) => (
              <div key={cat} className="px-4 py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-800">{cat}</span>
                  <span className="text-[11px] text-slate-400 ml-2">({stats.count} tx)</span>
                </div>
                <div className="text-right space-x-3 font-mono tabular-nums">
                  {stats.inAmount > 0 && (
                    <span className="text-emerald-700 font-medium">+{formatINR(stats.inAmount)}</span>
                  )}
                  {stats.outAmount > 0 && (
                    <span className="text-rose-700 font-medium">-{formatINR(stats.outAmount)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Persistent Bottom Summary Bar matching Screenshot 3 */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-slate-100 border-t border-slate-200 py-3 px-3 shadow-lg">
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
            <p className="text-[11px] font-semibold text-slate-500">Balance</p>
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
  );
};
