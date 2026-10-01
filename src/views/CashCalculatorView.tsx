import React, { useState, useMemo } from 'react';
import { ArrowLeft, RotateCcw, Copy, Check, Calculator, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useCashBook } from '../context/CashBookContext';
import { formatINR } from '../utils/formatters';

const DENOMINATIONS = [
  { value: 2000, label: '₹2000', color: 'bg-fuchsia-100 text-fuchsia-900 border-fuchsia-300' },
  { value: 500, label: '₹500', color: 'bg-stone-200 text-stone-900 border-stone-400' },
  { value: 200, label: '₹200', color: 'bg-amber-100 text-amber-900 border-amber-300' },
  { value: 100, label: '₹100', color: 'bg-indigo-100 text-indigo-900 border-indigo-300' },
  { value: 50, label: '₹50', color: 'bg-cyan-100 text-cyan-900 border-cyan-300' },
  { value: 20, label: '₹20', color: 'bg-yellow-100 text-yellow-900 border-yellow-300' },
  { value: 10, label: '₹10', color: 'bg-orange-100 text-orange-900 border-orange-300' },
  { value: 5, label: '₹5', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
  { value: 2, label: '₹2', color: 'bg-slate-200 text-slate-900 border-slate-300' },
  { value: 1, label: '₹1', color: 'bg-slate-200 text-slate-900 border-slate-300' },
];

export const CashCalculatorView: React.FC = () => {
  const { currentAccount, transactions, setActiveView, addNote } = useCashBook();

  const [counts, setCounts] = useState<{ [key: number]: string }>({});
  const [coinsAmount, setCoinsAmount] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [savedNote, setSavedNote] = useState(false);

  // Compute current ledger cash balance
  const currentLedgerBalance = useMemo(() => {
    const accTx = transactions.filter((t) => t.accountId === currentAccount?.id);
    const totalIn = accTx
      .filter((t) => t.type === 'in')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalOut = accTx
      .filter((t) => t.type === 'out')
      .reduce((sum, t) => sum + t.amount, 0);
    return (currentAccount?.initialBalance || 0) + totalIn - totalOut;
  }, [transactions, currentAccount]);

  const updateCount = (denom: number, val: string) => {
    setCounts((prev) => ({ ...prev, [denom]: val }));
  };

  const handleReset = () => {
    setCounts({});
    setCoinsAmount('');
  };

  const { totalPhysicalAmount, totalNotesCount } = useMemo(() => {
    let amount = 0;
    let notes = 0;

    DENOMINATIONS.forEach((d) => {
      const c = parseInt(counts[d.value] || '0', 10);
      if (!isNaN(c) && c > 0) {
        amount += c * d.value;
        notes += c;
      }
    });

    const coins = parseFloat(coinsAmount) || 0;
    amount += coins;

    return { totalPhysicalAmount: amount, totalNotesCount: notes };
  }, [counts, coinsAmount]);

  const difference = totalPhysicalAmount - currentLedgerBalance;

  const handleCopy = () => {
    const lines = [
      `--- CASH DENOMINATION TALLY ---`,
      `Account: ${currentAccount.name}`,
      `Date: ${new Date().toLocaleDateString('en-IN')}`,
      ...DENOMINATIONS.filter((d) => parseInt(counts[d.value] || '0', 10) > 0).map(
        (d) => `${d.label} x ${counts[d.value]} = ${formatINR(parseInt(counts[d.value], 10) * d.value)}`
      ),
      coinsAmount ? `Coins = ${formatINR(parseFloat(coinsAmount))}` : '',
      `Total Notes: ${totalNotesCount}`,
      `Total Physical Cash: ${formatINR(totalPhysicalAmount)}`,
      `Ledger Balance: ${formatINR(currentLedgerBalance)}`,
      `Difference: ${formatINR(difference)} (${difference === 0 ? 'TALLIED' : difference > 0 ? 'SURPLUS' : 'DEFICIT'})`,
    ].filter(Boolean);

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToNotes = () => {
    addNote({
      title: `Cash Tally - ${new Date().toLocaleDateString('en-IN')}`,
      content: `Total Physical Cash: ${formatINR(totalPhysicalAmount)} (${totalNotesCount} notes). Ledger: ${formatINR(currentLedgerBalance)}. Variance: ${formatINR(difference)}.`,
    });
    setSavedNote(true);
    setTimeout(() => setSavedNote(false), 2500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 pb-36">
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
            <h2 className="text-lg font-bold">Cash Calculator</h2>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleReset}
              className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
              title="Reset All Counts"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-xl mx-auto w-full space-y-3">
        {/* Comparison Alert Banner */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
              {currentAccount.name} Balance
            </p>
            <p className="text-lg font-bold font-mono tabular-nums text-slate-800">
              {formatINR(currentLedgerBalance)}
            </p>
          </div>

          <div className="text-right">
            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
              Count Status
            </p>
            {totalPhysicalAmount === 0 ? (
              <span className="text-xs font-semibold text-slate-400">Enter counts</span>
            ) : difference === 0 ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                <CheckCircle2 className="w-3.5 h-3.5" /> Perfect Match
              </span>
            ) : (
              <span
                className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md ${
                  difference > 0
                    ? 'text-amber-700 bg-amber-50'
                    : 'text-rose-700 bg-rose-50'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                {difference > 0 ? `+${formatINR(difference)} Surplus` : `${formatINR(difference)} Short`}
              </span>
            )}
          </div>
        </div>

        {/* Banknote Rows */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden divide-y divide-slate-100">
          {DENOMINATIONS.map((d) => {
            const count = parseInt(counts[d.value] || '0', 10) || 0;
            const rowTotal = count * d.value;

            return (
              <div
                key={d.value}
                className="px-4 py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
              >
                {/* Note Badge */}
                <div
                  className={`w-16 h-8 rounded-lg flex items-center justify-center font-bold font-mono text-xs border ${d.color} shadow-2xs shrink-0`}
                >
                  {d.label}
                </div>

                {/* Multiply sign */}
                <span className="text-slate-400 font-mono text-xs">×</span>

                {/* Input for count */}
                <div className="w-24">
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={counts[d.value] || ''}
                    onChange={(e) => updateCount(d.value, e.target.value)}
                    className="w-full text-center py-1 px-2 border border-slate-200 rounded-lg text-sm font-bold font-mono focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none bg-slate-50 focus:bg-white"
                  />
                </div>

                {/* Equals */}
                <span className="text-slate-400 font-mono text-xs">=</span>

                {/* Line Total */}
                <div className="w-24 text-right font-mono tabular-nums font-bold text-sm text-slate-800">
                  {formatINR(rowTotal, { showSymbol: false })}
                </div>
              </div>
            );
          })}

          {/* Coins input */}
          <div className="px-4 py-2.5 flex items-center justify-between gap-3 bg-slate-50">
            <div className="w-16 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center font-bold text-xs text-amber-800 shrink-0">
              Coins
            </div>
            <span className="text-slate-400 font-mono text-xs">+</span>
            <div className="w-24">
              <input
                type="number"
                min="0"
                step="any"
                placeholder="0"
                value={coinsAmount}
                onChange={(e) => setCoinsAmount(e.target.value)}
                className="w-full text-center py-1 px-2 border border-slate-200 rounded-lg text-sm font-bold font-mono focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none bg-white"
              />
            </div>
            <span className="text-slate-400 font-mono text-xs">=</span>
            <div className="w-24 text-right font-mono tabular-nums font-bold text-sm text-slate-800">
              {formatINR(parseFloat(coinsAmount) || 0, { showSymbol: false })}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Total Summary */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 shadow-xl py-3 px-4">
        <div className="max-w-xl mx-auto flex items-center justify-between mb-2">
          <div>
            <p className="text-xs text-slate-500 font-semibold">Total Banknotes</p>
            <p className="text-sm font-bold font-mono text-slate-800">{totalNotesCount} Notes</p>
          </div>

          <div className="text-right">
            <p className="text-xs text-slate-500 font-semibold">Total Physical Cash</p>
            <p className="text-xl font-black font-mono tabular-nums text-emerald-700">
              {formatINR(totalPhysicalAmount)}
            </p>
          </div>
        </div>

        <div className="max-w-xl mx-auto grid grid-cols-2 gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-1.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-xs transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
            <span>{copied ? 'Tally Copied!' : 'Copy Summary'}</span>
          </button>

          <button
            onClick={handleSaveToNotes}
            className="flex items-center justify-center gap-1.5 py-2.5 bg-[#0288D1] hover:bg-sky-600 text-white font-semibold rounded-xl text-xs shadow-xs transition-colors"
          >
            {savedNote ? <Check className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
            <span>{savedNote ? 'Saved to Notes!' : 'Save to Notebook'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
