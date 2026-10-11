import React, { useState } from 'react';
import { X, Plus, Check, Wallet, Landmark, Briefcase, UserCheck } from 'lucide-react';
import { useCashBook } from '../context/CashBookContext';
import { formatINR } from '../utils/formatters';

const ACCOUNT_COLORS = [
  '#0288D1', // Sky Blue
  '#16A34A', // Emerald Green
  '#E11D48', // Crimson Red
  '#8B5CF6', // Purple
  '#EA580C', // Amber/Orange
  '#0D9488', // Teal
  '#4F46E5', // Indigo
];

const PRESET_SUGGESTIONS = [
  { name: 'Shop Cash Drawer', type: 'cash', color: '#0288D1' },
  { name: 'HDFC / SBI Bank', type: 'bank', color: '#16A34A' },
  { name: 'Petty Cash Book', type: 'cash', color: '#E11D48' },
  { name: 'Personal Expenses', type: 'personal', color: '#8B5CF6' },
  { name: 'Branch 2 Ledger', type: 'business', color: '#EA580C' },
  { name: 'Client Advance Book', type: 'business', color: '#0D9488' },
];

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddAccountModal: React.FC<AddAccountModalProps> = ({ isOpen, onClose }) => {
  const { addAccount } = useCashBook();

  const [name, setName] = useState('');
  const [type, setType] = useState<'cash' | 'bank' | 'personal' | 'business'>('cash');
  const [color, setColor] = useState(ACCOUNT_COLORS[0]);
  const [initialBalance, setInitialBalance] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addAccount({
      name: name.trim(),
      type,
      color,
      initialBalance: parseFloat(initialBalance) || 0,
    });

    setName('');
    setInitialBalance('');
    onClose();
  };

  const handlePickPreset = (preset: typeof PRESET_SUGGESTIONS[0]) => {
    setName(preset.name);
    setType(preset.type as any);
    setColor(preset.color);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-[#0288D1] text-white px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base">Add New Cash Book / Account</h3>
            <p className="text-xs text-sky-100">Maintain multiple independent ledgers</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[85vh] overflow-y-auto text-slate-800">
          {/* Quick Presets */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Quick Suggestions
            </label>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {PRESET_SUGGESTIONS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handlePickPreset(preset)}
                  className="px-2.5 py-1 text-xs rounded-full border border-slate-200 hover:border-sky-400 bg-slate-50 hover:bg-sky-50 text-slate-700 whitespace-nowrap transition-colors"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Book / Account Name */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-600">
              Cash Book Name *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Shop Counter, SBI Current A/c, Petty Cash"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-[#0288D1] focus:outline-none"
            />
          </div>

          {/* Account Type & Opening Balance */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-600">Account Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#0288D1] focus:outline-none"
              >
                <option value="cash">Cash in Hand</option>
                <option value="bank">Bank Account</option>
                <option value="business">Business Ledger</option>
                <option value="personal">Personal Diary</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-600">
                Opening Balance (₹)
              </label>
              <input
                type="number"
                step="any"
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-[#0288D1] focus:outline-none"
              />
            </div>
          </div>

          {/* Color Tag Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-600">
              Color Tag
            </label>
            <div className="flex gap-2">
              {ACCOUNT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-transform active:scale-90"
                  style={{ backgroundColor: c }}
                >
                  {color === c && <Check className="w-4 h-4 text-white stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Action Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-[#0288D1] hover:bg-sky-600 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Create Cash Book
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
