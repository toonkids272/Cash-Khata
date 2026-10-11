import React, { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Check,
  BookText,
  Wallet,
  Landmark,
  Briefcase,
  UserCheck,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import { useCashBook } from '../context/CashBookContext';
import { formatINR } from '../utils/formatters';

const ACCOUNT_COLORS = [
  '#0288D1', // Blue
  '#16A34A', // Green
  '#E11D48', // Red
  '#8B5CF6', // Purple
  '#EA580C', // Orange
  '#0D9488', // Teal
  '#4F46E5', // Indigo
];

export const AccountsManagerView: React.FC = () => {
  const {
    accounts,
    updateAccount,
    deleteAccount,
    deleteAllAccounts,
    currentAccountId,
    setCurrentAccountId,
    setActiveView,
    transactions,
    setIsAddAccountModalOpen,
  } = useCashBook();

  const [editingAccId, setEditingAccId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  // In-app modal states for reliable deletion (no browser confirm dialogs)
  const [accountToDelete, setAccountToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  const handleStartEdit = (acc: typeof accounts[0]) => {
    setEditingAccId(acc.id);
    setEditName(acc.name);
    setEditColor(acc.color);
  };

  const handleSaveEdit = (id: string) => {
    if (!editName.trim()) return;
    updateAccount(id, { name: editName.trim(), color: editColor });
    setEditingAccId(null);
  };

  const handleConfirmSingleDelete = () => {
    if (accountToDelete) {
      deleteAccount(accountToDelete.id);
      setAccountToDelete(null);
    }
  };

  const handleConfirmDeleteAll = () => {
    deleteAllAccounts();
    setIsDeletingAll(false);
  };

  const handleSelectBook = (id: string) => {
    setCurrentAccountId(id);
    setActiveView('ledger');
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 pb-24">
      {/* Top Header */}
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
            <div>
              <h2 className="text-lg font-bold leading-tight">Cash Books</h2>
              <p className="text-[11px] text-sky-100">
                {accounts.length} {accounts.length === 1 ? 'saved book' : 'saved books'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {accounts.length > 0 && (
              <button
                onClick={() => setIsDeletingAll(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-500/80 hover:bg-rose-600 active:bg-rose-700 rounded-lg text-xs font-semibold text-white transition-colors"
                title="Delete All Test Cash Books"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Delete All</span>
              </button>
            )}

            <button
              onClick={() => setIsAddAccountModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 active:bg-white/40 rounded-lg text-xs font-semibold transition-colors"
              title="Add a new Cash Book"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> Add Book
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-xl mx-auto w-full space-y-4">
        {/* If no cash books are saved */}
        {accounts.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-xs border border-slate-200 mt-6">
            <div className="w-16 h-16 rounded-2xl bg-sky-50 text-[#0288D1] flex items-center justify-center mx-auto mb-4">
              <BookText className="w-8 h-8 stroke-[1.5]" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No Cash Books Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
              Nothing is saved yet. The database is 100% clean and blank. Tap '+ Add Book' to create your real cash book.
            </p>
            <button
              onClick={() => setIsAddAccountModalOpen(true)}
              className="mt-5 px-5 py-2.5 bg-[#0288D1] hover:bg-sky-600 text-white rounded-xl text-xs font-bold shadow-xs inline-flex items-center gap-2 transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> Create New Cash Book
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
              <span>Saved Cash Books ({accounts.length})</span>
              <span>Tap to switch</span>
            </div>

            {accounts.map((acc) => {
              const isSelected = acc.id === currentAccountId;
              const accTx = transactions.filter((t) => t.accountId === acc.id);
              const totalIn = accTx
                .filter((t) => t.type === 'in')
                .reduce((sum, t) => sum + t.amount, 0);
              const totalOut = accTx
                .filter((t) => t.type === 'out')
                .reduce((sum, t) => sum + t.amount, 0);
              const netBalance = acc.initialBalance + totalIn - totalOut;

              if (editingAccId === acc.id) {
                return (
                  <div
                    key={acc.id}
                    className="bg-white p-4 rounded-2xl border-2 border-sky-400 space-y-3 shadow-md"
                  >
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Cash Book Name
                      </label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl text-sm font-semibold focus:ring-2 focus:ring-[#0288D1] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Color Theme
                      </label>
                      <div className="flex gap-2">
                        {ACCOUNT_COLORS.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setEditColor(c)}
                            className="w-7 h-7 rounded-full flex items-center justify-center transition-transform active:scale-90"
                            style={{ backgroundColor: c }}
                          >
                            {editColor === c && <Check className="w-4 h-4 text-white stroke-[3]" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-1">
                      <button
                        onClick={() => setEditingAccId(null)}
                        className="px-3.5 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveEdit(acc.id)}
                        className="px-4 py-1.5 text-xs bg-[#0288D1] text-white rounded-lg font-bold shadow-xs"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={acc.id}
                  className={`bg-white rounded-2xl p-4 shadow-xs border transition-all ${
                    isSelected ? 'border-[#0288D1] ring-2 ring-sky-100' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs"
                        style={{ backgroundColor: acc.color }}
                      >
                        {acc.type === 'bank' ? (
                          <Landmark className="w-5 h-5" />
                        ) : acc.type === 'business' ? (
                          <Briefcase className="w-5 h-5" />
                        ) : acc.type === 'personal' ? (
                          <UserCheck className="w-5 h-5" />
                        ) : (
                          <Wallet className="w-5 h-5" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">{acc.name}</h4>
                          {isSelected && (
                            <span className="text-[10px] bg-sky-100 text-[#0288D1] font-bold px-2 py-0.5 rounded-full">
                              Active Book
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-400 capitalize mt-0.5">
                          {acc.type === 'cash'
                            ? 'Cash in Hand'
                            : acc.type === 'bank'
                            ? 'Bank Account'
                            : acc.type === 'business'
                            ? 'Business Ledger'
                            : 'Personal Diary'}{' '}
                          · {accTx.length} {accTx.length === 1 ? 'entry' : 'entries'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStartEdit(acc)}
                        className="p-1.5 text-slate-400 hover:text-sky-600 rounded-lg hover:bg-slate-50 transition-colors"
                        title="Edit Book"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setAccountToDelete({ id: acc.id, name: acc.name })}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Delete Book"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Financial Metrics */}
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block">Total In</span>
                      <span className="text-xs font-mono font-bold text-emerald-700">
                        {formatINR(totalIn)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block">Total Out</span>
                      <span className="text-xs font-mono font-bold text-rose-700">
                        {formatINR(totalOut)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block">Balance</span>
                      <span
                        className={`text-xs font-mono font-bold ${
                          netBalance >= 0 ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {formatINR(netBalance)}
                      </span>
                    </div>
                  </div>

                  {/* Switch to this Book Button */}
                  <div className="mt-3 pt-2">
                    <button
                      onClick={() => handleSelectBook(acc.id)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                        isSelected
                          ? 'bg-sky-50 text-[#0288D1] border border-sky-200 hover:bg-sky-100'
                          : 'bg-slate-900 hover:bg-black text-white shadow-xs'
                      }`}
                    >
                      <span>{isSelected ? 'Currently Viewing Ledger' : 'Open This Cash Book'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* In-App Single Account Delete Confirmation Modal */}
      {accountToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setAccountToDelete(null)}
          />
          <div className="relative w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl z-10 space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6 stroke-[2]" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-base text-slate-900">Delete Cash Book?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to delete <strong className="text-slate-800 font-bold">"{accountToDelete.name}"</strong>? All associated transactions will be permanently deleted.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAccountToDelete(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSingleDelete}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                Delete Book
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App Delete All Accounts Confirmation Modal */}
      {isDeletingAll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsDeletingAll(false)}
          />
          <div className="relative w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl z-10 space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6 stroke-[2]" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-base text-slate-900">Delete All Cash Books?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                This will delete all <strong className="text-slate-800 font-bold">{accounts.length} Cash Books</strong> and all recorded entries. The database will become 100% blank.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDeletingAll(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteAll}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                Yes, Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
