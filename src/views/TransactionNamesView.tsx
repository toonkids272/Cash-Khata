import React, { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Tag } from 'lucide-react';
import { useCashBook } from '../context/CashBookContext';

export const TransactionNamesView: React.FC = () => {
  const { presetNames, addPresetName, deletePresetName, setActiveView } = useCashBook();
  const [newName, setNewName] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    addPresetName(newName.trim());
    setNewName('');
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
            <h2 className="text-lg font-bold">Transaction Names</h2>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-xl mx-auto w-full space-y-4">
        {/* Add Preset Form */}
        <form onSubmit={handleAdd} className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex gap-2">
          <input
            type="text"
            required
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Add new frequent transaction name..."
            className="flex-1 px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#0288D1] hover:bg-sky-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </form>

        {/* Preset List */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden divide-y divide-slate-100">
          <div className="px-4 py-2.5 bg-slate-50 text-xs font-semibold text-slate-500">
            {presetNames.length} Preset Transaction Names (Available for 1-Tap Entry)
          </div>

          {presetNames.map((name) => (
            <div key={name} className="px-4 py-3 flex items-center justify-between hover:bg-slate-50">
              <div className="flex items-center gap-2.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-sm font-medium text-slate-800">{name}</span>
              </div>
              <button
                onClick={() => deletePresetName(name)}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                title="Remove preset"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
