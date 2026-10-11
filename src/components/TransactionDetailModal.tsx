import React, { useState } from 'react';
import {
  X,
  Trash2,
  Edit2,
  Copy,
  Share2,
  Calendar,
  Clock,
  Tag,
  CreditCard,
  User,
  FileText,
  Check,
} from 'lucide-react';
import { useCashBook } from '../context/CashBookContext';
import { formatINR, formatDisplayDate } from '../utils/formatters';
import { PaymentMode } from '../types';

export const TransactionDetailModal: React.FC = () => {
  const {
    selectedTransaction,
    setSelectedTransaction,
    updateTransaction,
    softDeleteTransaction,
    addTransaction,
    accounts,
    categories,
    addCategory,
  } = useCashBook();

  const [isEditing, setIsEditing] = useState(false);
  const [amount, setAmount] = useState('');
  const [partyName, setPartyName] = useState('');
  const [category, setCategory] = useState('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Cash');
  const [remarks, setRemarks] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  if (!selectedTransaction) return null;

  const isCashIn = selectedTransaction.type === 'in';
  const account = accounts.find((a) => a.id === selectedTransaction.accountId);

  const startEdit = () => {
    setAmount(selectedTransaction.amount.toString());
    setPartyName(selectedTransaction.partyName);
    setCategory(selectedTransaction.category);
    setPaymentMode(selectedTransaction.paymentMode);
    setRemarks(selectedTransaction.remarks || '');
    setIsEditing(true);
    setIsAddingCategory(false);
  };

  const handleSaveCustomCategory = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    addCategory(selectedTransaction.type, trimmed);
    setCategory(trimmed);
    setNewCategoryName('');
    setIsAddingCategory(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!num || num <= 0) return;

    updateTransaction(selectedTransaction.id, {
      amount: num,
      partyName,
      category,
      paymentMode,
      remarks,
    });

    setIsEditing(false);
    setSelectedTransaction(null);
  };

  const handleDelete = () => {
    softDeleteTransaction(selectedTransaction.id);
    setSelectedTransaction(null);
  };

  const handleDuplicate = () => {
    addTransaction({
      accountId: selectedTransaction.accountId,
      type: selectedTransaction.type,
      amount: selectedTransaction.amount,
      partyName: `${selectedTransaction.partyName} (Copy)`,
      category: selectedTransaction.category,
      paymentMode: selectedTransaction.paymentMode,
      date: new Date().toISOString().split('T')[0],
      time: '12:00 PM',
      remarks: selectedTransaction.remarks,
    });
    setSelectedTransaction(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setSelectedTransaction(null)}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div
          className={`px-5 py-4 text-white flex items-center justify-between ${
            isCashIn ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold opacity-90">
              Transaction Details
            </span>
            <h3 className="text-2xl font-bold font-mono tabular-nums">
              {formatINR(selectedTransaction.amount)}
            </h3>
          </div>
          <button
            onClick={() => setSelectedTransaction(null)}
            className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/15"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!isEditing ? (
          <div className="p-5 space-y-4">
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400">Party / Particulars</p>
                  <p className="font-semibold text-slate-800">{selectedTransaction.partyName}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400">Date</p>
                    <p className="font-medium text-slate-800">{formatDisplayDate(selectedTransaction.date)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400">Time</p>
                    <p className="font-medium text-slate-800">{selectedTransaction.time || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-start gap-3">
                  <Tag className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400">Category</p>
                    <p className="font-medium text-slate-800">{selectedTransaction.category || 'None (Blank)'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CreditCard className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400">Payment Mode</p>
                    <p className="font-medium text-slate-800">{selectedTransaction.paymentMode}</p>
                  </div>
                </div>
              </div>

              {selectedTransaction.remarks && (
                <div className="flex items-start gap-3 pt-1 border-t border-slate-100">
                  <FileText className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400">Remarks</p>
                    <p className="text-slate-700 italic">{selectedTransaction.remarks}</p>
                  </div>
                </div>
              )}

              <div className="pt-2 text-xs text-slate-400 border-t border-slate-100 flex justify-between">
                <span>Account: {account?.name || 'Cash Book'}</span>
                <span>Type: {isCashIn ? 'Cash In (Credit)' : 'Cash Out (Debit)'}</span>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={startEdit}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>

              <button
                onClick={handleDuplicate}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Duplicate</span>
              </button>

              <button
                onClick={handleDelete}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ) : (
          /* Inline Edit Form */
          <form onSubmit={handleSaveEdit} className="p-5 space-y-3 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Amount (₹)</label>
              <input
                type="number"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-lg font-bold font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Party / Name</label>
              <input
                type="text"
                required
                value={partyName}
                onChange={(e) => setPartyName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-500">Category</label>
                <button
                  type="button"
                  onClick={() => setIsAddingCategory((prev) => !prev)}
                  className="text-[11px] font-semibold text-[#0288D1] hover:underline"
                >
                  + Add Category
                </button>
              </div>
              <select
                value={category}
                onChange={(e) => {
                  if (e.target.value === '__add_new__') {
                    setIsAddingCategory(true);
                  } else {
                    setCategory(e.target.value);
                  }
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                <option value="">-- None (Blank) --</option>
                {(categories[selectedTransaction.type] || []).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="__add_new__" className="text-[#0288D1] font-bold">
                  + Add New Category...
                </option>
              </select>

              {isAddingCategory && (
                <div className="flex gap-1.5 pt-1 animate-in fade-in">
                  <input
                    type="text"
                    autoFocus
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="New category..."
                    className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSaveCustomCategory();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleSaveCustomCategory}
                    className="px-3 py-1.5 bg-[#0288D1] text-white rounded-lg text-xs font-bold"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Mode</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              >
                <option value="Cash">Cash</option>
                <option value="Online/UPI">Online/UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Remarks</label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-xl flex items-center justify-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" /> Save Changes
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
