import React, { useState, useMemo } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar as CalIcon } from 'lucide-react';
import { useCashBook } from '../context/CashBookContext';
import { formatINR, formatDisplayDate } from '../utils/formatters';

export const CalendarView: React.FC = () => {
  const { currentAccount, transactions, setActiveView, setSelectedTransaction } = useCashBook();

  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(8); // 0-indexed, 8 = Sep 2026
  const [selectedDayDate, setSelectedDayDate] = useState<string>('2026-09-07');

  const accountTransactions = useMemo(() => {
    return transactions.filter((t) => t.accountId === currentAccount?.id);
  }, [transactions, currentAccount?.id]);

  // Aggregate by date
  const dateMap = useMemo(() => {
    const map = new Map<string, { inAmount: number; outAmount: number; count: number }>();
    accountTransactions.forEach((t) => {
      const prev = map.get(t.date) || { inAmount: 0, outAmount: 0, count: 0 };
      if (t.type === 'in') {
        prev.inAmount += t.amount;
      } else {
        prev.outAmount += t.amount;
      }
      prev.count += 1;
      map.set(t.date, prev);
    });
    return map;
  }, [accountTransactions]);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const selectedDayTransactions = useMemo(() => {
    if (!selectedDayDate) return [];
    return accountTransactions.filter((t) => t.date === selectedDayDate);
  }, [accountTransactions, selectedDayDate]);

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
            <h2 className="text-lg font-bold">Calendar Timeline</h2>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-xl mx-auto w-full space-y-4">
        {/* Month Navigator Card */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-base">
              {monthNames[currentMonth]} {currentYear}
            </h3>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-600"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-600"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400 mb-2">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty slots for first day offset */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-12" />
            ))}

            {/* Actual Month Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(
                day
              ).padStart(2, '0')}`;
              const stats = dateMap.get(dateStr);
              const isSelected = selectedDayDate === dateStr;

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDayDate(dateStr)}
                  className={`h-12 rounded-xl flex flex-col items-center justify-between p-1 transition-all ${
                    isSelected
                      ? 'bg-sky-500 text-white font-bold shadow-xs'
                      : 'hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <span className="text-xs">{day}</span>
                  <div className="flex gap-1 items-center">
                    {stats?.inAmount ? (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected ? 'bg-white' : 'bg-emerald-500'
                        }`}
                      />
                    ) : null}
                    {stats?.outAmount ? (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected ? 'bg-white' : 'bg-rose-500'
                        }`}
                      />
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Transactions Drawer */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200">
          <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
            <h4 className="font-bold text-slate-800 text-sm">
              {formatDisplayDate(selectedDayDate)}
            </h4>
            <span className="text-xs text-slate-400">
              {selectedDayTransactions.length} entries
            </span>
          </div>

          {selectedDayTransactions.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">
              No transactions recorded on this date.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {selectedDayTransactions.map((tx) => (
                <div
                  key={tx.id}
                  onClick={() => setSelectedTransaction(tx)}
                  className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 px-2 rounded-lg"
                >
                  <div>
                    <h5 className="font-medium text-slate-900 text-sm">{tx.partyName}</h5>
                    <p className="text-[11px] text-slate-400">
                      {tx.time} · {tx.category}
                    </p>
                  </div>
                  <span
                    className={`font-mono font-bold text-sm tabular-nums ${
                      tx.type === 'in' ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {tx.type === 'in' ? '+' : '-'}{formatINR(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
