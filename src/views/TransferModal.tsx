import React, { useState } from 'react';
import { ArrowLeft, ArrowLeftRight, Check, AlertCircle } from 'lucide-react';
import { useCashBook } from '../context/CashBookContext';
import { formatINR, getTodayDateStr, getCurrentTimeStr } from '../utils/formatters';

export const TransferModal: React.FC = () => {
  const { accounts, executeTransfer, setActiveView } = useCashBook();

  const [fromId, setFromId] = useState(accounts[0]?.id || '');
  const [toId, setToId] = useState(accounts[1]?.id || accounts[0]?.id || '');
  const [amount, setAmount] = useState('');
  const [remarks, setRemarks] = useState('');
  const [date, setDate] = useState(getTodayDateStr());
  const [time, setTime] = useState(getCurrentTimeStr());
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!num || num <= 0) {
      alert('Please enter a valid transfer amount');
      return;
    }
    if (fromId === toId) {
      alert('Source and destination accounts must be different');
      return;
    }

    executeTransfer({
      fromAccountId: fromId,
      toAccountId: toId,
      amount: num,
      date,
      time,
      remarks: remarks.trim() || undefined,
    });

    setIsSuccess(true);
    setTimeout(() => {
      setActiveView('account_summary');
    }, 1000);
  };

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
            <h2 className="text-lg font-bold">Inter-Account Transfer</h2>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-xl mx-auto w-full space-y-4">
        {isSuccess ? (
          <div className="p-8 bg-white rounded-2xl shadow-sm text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Transfer Completed</h3>
            <p className="text-xs text-slate-500">
              {formatINR(parseFloat(amount))} successfully transferred. Redirecting...
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4"
          >
            {/* Amount */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Transfer Amount (₹) *
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 font-bold text-2xl text-sky-600">₹</span>
                <input
                  type="number"
                  step="any"
                  required
                  autoFocus
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full pl-11 pr-4 py-3 text-2xl font-bold font-mono tracking-tight bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            </div>

            {/* From & To Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  From Account (Source - Out)
                </label>
                <select
                  value={fromId}
                  onChange={(e) => setFromId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  To Account (Destination - In)
                </label>
                <select
                  value={toId}
                  onChange={(e) => setToId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.type})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {fromId === toId && (
              <div className="p-3 bg-amber-50 text-amber-800 rounded-xl flex items-center gap-2 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>Please select two different accounts for the transfer.</span>
              </div>
            )}

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Time</label>
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Remarks / Purpose
              </label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Cash withdrawal from bank, Petty cash refill"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={fromId === toId}
              className="w-full py-3.5 bg-[#0288D1] hover:bg-sky-600 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-md transition-all mt-3 flex items-center justify-center gap-2"
            >
              <ArrowLeftRight className="w-4 h-4" /> Execute Transfer
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
