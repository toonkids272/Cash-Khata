import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search, Filter, FileText } from 'lucide-react';
import { useCashBook } from '../context/CashBookContext';
import { formatINR, formatDisplayDate } from '../utils/formatters';

export const AllAccountsTransactionsView: React.FC = () => {
  const {
    transactions,
    accounts,
    setActiveView,
    setIsExportModalOpen,
    setSelectedTransaction,
  } = useCashBook();

  const [selectedAccFilter, setSelectedAccFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const accountMap = useMemo(() => {
    const map = new Map<string, typeof accounts[0]>();
    accounts.forEach((a) => map.set(a.id, a));
    return map;
  }, [accounts]);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (selectedAccFilter !== 'all' && t.accountId !== selectedAccFilter) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          t.partyName.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          (t.remarks && t.remarks.toLowerCase().includes(q)) ||
          t.amount.toString().includes(q)
        );
      }
      return true;
    });
  }, [transactions, selectedAccFilter, searchTerm]);

  // Sort chronological descending
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const d = b.date.localeCompare(a.date);
      if (d !== 0) return d;
      return (b.time || '').localeCompare(a.time || '');
    });
  }, [filtered]);

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
            <h2 className="text-lg font-bold">Transaction-All Accounts</h2>
          </div>

          <button
            onClick={() => setIsExportModalOpen(true)}
            className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
            title="Export Report"
          >
            <FileText className="w-5 h-5" />
          </button>
        </div>

        {/* Filter controls */}
        <div className="px-3 pb-3 flex gap-2">
          <select
            value={selectedAccFilter}
            onChange={(e) => setSelectedAccFilter(e.target.value)}
            className="bg-white/15 text-white text-xs px-2.5 py-1.5 rounded-lg border border-white/20 focus:outline-none"
          >
            <option value="all" className="text-slate-900">All Accounts</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id} className="text-slate-900">
                {acc.name}
              </option>
            ))}
          </select>

          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search all..."
              className="w-full pl-7 pr-3 py-1.5 bg-white/15 text-white placeholder-white/60 text-xs rounded-lg border border-white/20 focus:outline-none"
            />
            <Search className="w-3.5 h-3.5 text-white/70 absolute left-2 top-2" />
          </div>
        </div>
      </div>

      {/* Subheader info */}
      <div className="bg-[#0288D1]/90 text-white px-4 py-1.5 text-center text-xs font-semibold tracking-wide">
        Showing {sorted.length} transactions across {selectedAccFilter === 'all' ? 'all accounts' : 'selected account'}
      </div>

      {/* Transactions List */}
      <div className="divide-y divide-slate-100 bg-white flex-1 max-w-xl mx-auto w-full">
        {sorted.map((tx) => {
          const acc = accountMap.get(tx.accountId);
          const isCashIn = tx.type === 'in';

          return (
            <div
              key={tx.id}
              onClick={() => setSelectedTransaction(tx)}
              className="px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between"
            >
              <div className="space-y-0.5 truncate pr-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: acc?.color || '#0288D1' }}
                  />
                  <h4 className="font-semibold text-slate-900 text-sm truncate">
                    {tx.partyName}
                  </h4>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                    {acc?.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span>{formatDisplayDate(tx.date)}</span>
                  <span>·</span>
                  <span>{tx.time}</span>
                  {tx.category && (
                    <>
                      <span>·</span>
                      <span>{tx.category}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="text-right shrink-0">
                <span
                  className={`font-bold font-mono text-base tabular-nums ${
                    isCashIn ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {isCashIn ? '+' : '-'}{formatINR(tx.amount)}
                </span>
                <p className="text-[11px] text-slate-400">{tx.paymentMode}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
