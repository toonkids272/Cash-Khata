import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Calendar,
  Clock,
  Tag,
  CreditCard,
  FileText,
  User,
  ArrowRight,
} from 'lucide-react';
import { useCashBook } from '../context/CashBookContext';
import { PaymentMode, TransactionType } from '../types';
import { getTodayDateStr, getCurrentTimeStr, formatINR } from '../utils/formatters';

interface TransactionModalProps {
  type: TransactionType;
  isOpen: boolean;
  onClose: () => void;
}

const PAYMENT_MODES: PaymentMode[] = ['Cash', 'Online/UPI', 'Bank Transfer', 'Cheque'];

export const TransactionModal: React.FC<TransactionModalProps> = ({ type, isOpen, onClose }) => {
  const {
    addTransaction,
    currentAccount,
    accounts,
    presetNames,
    categories,
    addCategory,
  } = useCashBook();

  const [amount, setAmount] = useState<string>('');
  const [partyName, setPartyName] = useState<string>('');
  const [category, setCategory] = useState<string>(''); // Default blank
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Cash');
  const [date, setDate] = useState<string>(getTodayDateStr());
  const [time, setTime] = useState<string>(getCurrentTimeStr());
  const [remarks, setRemarks] = useState<string>('');
  const [targetAccountId, setTargetAccountId] = useState<string>(currentAccount?.id || '');

  // Add custom category state
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setPartyName('');
      setCategory(''); // Default blank option as requested
      setPaymentMode('Cash');
      setDate(getTodayDateStr());
      setTime(getCurrentTimeStr());
      setRemarks('');
      setTargetAccountId(currentAccount?.id || '');
      setIsAddingCategory(false);
      setNewCategoryName('');
    }
  }, [isOpen, type, currentAccount?.id]);

  if (!isOpen) return null;

  const isCashIn = type === 'in';
  const numAmount = parseFloat(amount) || 0;

  const handleSaveCategory = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    addCategory(type, trimmed);
    setCategory(trimmed);
    setNewCategoryName('');
    setIsAddingCategory(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    addTransaction({
      accountId: targetAccountId,
      type,
      amount: numAmount,
      partyName: partyName.trim() || (isCashIn ? 'Cash Inflow' : 'Cash Outflow'),
      category: category.trim(), // Can be blank
      paymentMode,
      date,
      time,
      remarks: remarks.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Sheet / Dialog */}
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden z-10 animate-in slide-in-from-bottom duration-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div
          className={`flex items-center justify-between px-5 py-4 text-white ${
            isCashIn ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          <div>
            <h3 className="text-lg font-bold">
              {isCashIn ? 'Cash In (Credit)' : 'Cash Out (Debit)'}
            </h3>
            <p className="text-xs opacity-90">
              Account: {accounts.find((a) => a.id === targetAccountId)?.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/15 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-slate-800">
          {/* Amount Input with Currency */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Amount (₹) *
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 font-bold text-2xl text-slate-400 select-none">
                ₹
              </span>
              <input
                type="number"
                step="any"
                inputMode="decimal"
                required
                autoFocus
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-2xl text-2xl font-bold font-mono tracking-tight focus:bg-white focus:outline-none focus:ring-2 ${
                  isCashIn
                    ? 'border-emerald-200 text-emerald-700 focus:ring-emerald-500'
                    : 'border-rose-200 text-rose-700 focus:ring-rose-500'
                }`}
              />
            </div>
          </div>

          {/* Quick Preset Particulars / Names */}
          {presetNames.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Quick Description Suggestions
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {presetNames.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setPartyName(name)}
                    className="px-2.5 py-1 text-xs rounded-full border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 whitespace-nowrap transition-colors"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Party Name / Particulars Input */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-500 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400" /> Party / Description *
            </label>
            <input
              type="text"
              required
              value={partyName}
              onChange={(e) => setPartyName(e.target.value)}
              placeholder={isCashIn ? 'Received from / Sales item' : 'Paid to / Expense purpose'}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none font-medium"
            />
          </div>

          {/* Category & Cash Book Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Category */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-500 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-slate-400" /> Category
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddingCategory((prev) => !prev)}
                  className="text-[11px] font-semibold text-[#0288D1] hover:underline flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3 stroke-[2.5]" /> Add Category
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
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                {/* Default Blank Option */}
                <option value="">-- None (Blank) --</option>
                {(categories[type] || []).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="__add_new__" className="text-[#0288D1] font-bold">
                  + Add New Category...
                </option>
              </select>

              {/* Inline Add Category Drawer */}
              {isAddingCategory && (
                <div className="p-2.5 bg-sky-50 border border-sky-200 rounded-xl space-y-2 mt-1.5 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-sky-900">
                      New {isCashIn ? 'Income' : 'Expense'} Category
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAddingCategory(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      autoFocus
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="e.g. Packaging, Printing, Fuel"
                      className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-sky-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSaveCategory();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleSaveCategory}
                      className="px-3 py-1.5 bg-[#0288D1] hover:bg-sky-600 text-white rounded-lg text-xs font-bold transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Target Account */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-500">
                Cash Book / Account
              </label>
              <select
                value={targetAccountId}
                onChange={(e) => setTargetAccountId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Payment Mode Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-500 flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-slate-400" /> Payment Mode
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {PAYMENT_MODES.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPaymentMode(mode)}
                  className={`py-2 px-1 text-center text-xs font-medium rounded-lg border transition-colors truncate ${
                    paymentMode === mode
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Remarks (Optional) */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-500 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" /> Remarks (Optional)
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Invoice #, Bill photo ref, Cheque number, etc."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              className={`w-full py-3.5 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-[0.99] flex items-center justify-center gap-2 text-sm sm:text-base ${
                isCashIn
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              <span>Record {isCashIn ? 'Cash In' : 'Cash Out'}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
