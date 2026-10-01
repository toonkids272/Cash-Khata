import React from 'react';
import { ArrowLeft, Plus, ArrowLeftRight, FileBarChart, CheckCircle } from 'lucide-react';
import { useCashBook } from '../context/CashBookContext';
import { formatINR } from '../utils/formatters';

export const AccountSummaryView: React.FC = () => {
  const {
    accounts,
    transactions,
    setActiveView,
    setCurrentAccountId,
    setIsExportModalOpen,
  } = useCashBook();

  // Calculate totals per account
  const accountStats = accounts.map((acc) => {
    const accTx = transactions.filter((t) => t.accountId === acc.id);
    const totalIn = accTx
      .filter((t) => t.type === 'in')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalOut = accTx
      .filter((t) => t.type === 'out')
      .reduce((sum, t) => sum + t.amount, 0);
    const currentBalance = acc.initialBalance + totalIn - totalOut;

    return {
      account: acc,
      totalIn,
      totalOut,
      currentBalance,
      txCount: accTx.length,
    };
  });

  const grandTotalIn = accountStats.reduce((sum, s) => sum + s.totalIn, 0);
  const grandTotalOut = accountStats.reduce((sum, s) => sum + s.totalOut, 0);
  const grandNetBalance = accountStats.reduce((sum, s) => sum + s.currentBalance, 0);

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 pb-20">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-[#0288D1] text-white shadow-md">
        <div className="flex items-center justify-between px-3 h-14">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView('ledger')}
              className="p-2 -ml-1 text-white hover:bg-white/10 active:bg-white/20 rounded-full transition-colors"
              title="Back"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-bold">Account Summary</h2>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveView('transfer')}
              className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
              title="Inter-Account Transfer"
            >
              <ArrowLeftRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
              title="Export Report"
            >
              <FileBarChart className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-xl mx-auto w-full space-y-4">
        {/* Consolidated Total Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex justify-between items-center text-xs text-slate-300">
            <span className="uppercase tracking-wider font-semibold">Total Combined Liquidity</span>
            <span className="bg-white/10 px-2 py-0.5 rounded-full">{accounts.length} Accounts</span>
          </div>

          <div className="text-3xl font-extrabold font-mono tabular-nums tracking-tight">
            {formatINR(grandNetBalance)}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-700/60 text-xs">
            <div>
              <span className="text-slate-400">Total All Inflow:</span>
              <p className="text-emerald-400 font-bold font-mono tabular-nums text-sm">
                {formatINR(grandTotalIn)}
              </p>
            </div>
            <div>
              <span className="text-slate-400">Total All Outflow:</span>
              <p className="text-rose-400 font-bold font-mono tabular-nums text-sm">
                {formatINR(grandTotalOut)}
              </p>
            </div>
          </div>
        </div>

        {/* Individual Accounts List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              All Books &amp; Accounts
            </h3>
            <button
              onClick={() => setActiveView('accounts')}
              className="text-xs font-semibold text-[#0288D1] flex items-center gap-1 hover:underline"
            >
              <Plus className="w-3.5 h-3.5" /> Add Account
            </button>
          </div>

          {accountStats.map(({ account, totalIn, totalOut, currentBalance, txCount }) => (
            <div
              key={account.id}
              onClick={() => {
                setCurrentAccountId(account.id);
                setActiveView('ledger');
              }}
              className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 hover:border-sky-300 cursor-pointer transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3.5 h-3.5 rounded-full shadow-xs"
                    style={{ backgroundColor: account.color }}
                  />
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{account.name}</h4>
                    <span className="text-[11px] text-slate-400 capitalize">
                      {account.type} account · {txCount} transactions
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[11px] text-slate-400 font-medium">Net Balance</p>
                  <p
                    className={`text-base font-bold font-mono tabular-nums ${
                      currentBalance >= 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {formatINR(currentBalance)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-slate-100 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Cash In:</span>
                  <span className="font-semibold text-emerald-700 font-mono tabular-nums">
                    +{formatINR(totalIn)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Cash Out:</span>
                  <span className="font-semibold text-rose-700 font-mono tabular-nums">
                    -{formatINR(totalOut)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
