import React from 'react';
import { ArrowLeft, RotateCcw, Trash2, AlertCircle } from 'lucide-react';
import { useCashBook } from '../context/CashBookContext';
import { formatINR, formatDisplayDate } from '../utils/formatters';

export const DeletedTransactionsView: React.FC = () => {
  const {
    deletedTransactions,
    restoreTransaction,
    permanentDeleteTransaction,
    clearAllDeleted,
    setActiveView,
  } = useCashBook();

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
            <h2 className="text-lg font-bold">Deleted Transactions</h2>
          </div>

          {deletedTransactions.length > 0 && (
            <button
              onClick={() => clearAllDeleted()}
              className="px-2.5 py-1 text-xs font-semibold bg-white/20 hover:bg-white/30 rounded-lg text-white"
            >
              Empty Bin
            </button>
          )}
        </div>
      </div>

      <div className="p-4 max-w-xl mx-auto w-full space-y-4">
        {deletedTransactions.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center text-slate-400 space-y-2">
            <Trash2 className="w-12 h-12 mx-auto stroke-1 text-slate-300" />
            <h4 className="font-bold text-slate-700 text-sm">Recycle Bin is Empty</h4>
            <p className="text-xs text-slate-400">
              Transactions you delete from the ledger will appear here and can be restored anytime.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 divide-y divide-slate-100 overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-50 text-xs font-semibold text-slate-500 flex justify-between">
              <span>{deletedTransactions.length} deleted items</span>
              <span className="text-[11px] text-slate-400">Can be restored to active book</span>
            </div>

            {deletedTransactions.map((tx) => (
              <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">{tx.partyName}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span>{formatDisplayDate(tx.date)}</span>
                    <span>·</span>
                    <span className={tx.type === 'in' ? 'text-emerald-600' : 'text-rose-600'}>
                      {tx.type === 'in' ? 'Cash In' : 'Cash Out'}
                    </span>
                    <span>·</span>
                    <span className="font-mono tabular-nums font-semibold text-slate-700">
                      {formatINR(tx.amount)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => restoreTransaction(tx.id)}
                    className="p-2 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
                    title="Restore transaction"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span className="hidden sm:inline">Restore</span>
                  </button>

                  <button
                    onClick={() => permanentDeleteTransaction(tx.id)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Permanent Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
