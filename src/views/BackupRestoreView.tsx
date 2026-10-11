import React, { useRef, useState } from 'react';
import { ArrowLeft, Download, Upload, RotateCcw, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useCashBook } from '../context/CashBookContext';
import { downloadBlob } from '../utils/fileSharing';

export const BackupRestoreView: React.FC = () => {
  const {
    exportFullDatabase,
    importFullDatabase,
    resetToInitialData,
    loadDemoData,
    setActiveView,
    accounts,
    transactions,
  } = useCashBook();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleExportBackup = () => {
    const json = exportFullDatabase();
    const blob = new Blob([json], { type: 'application/json' });
    const fileName = `CashBook_Backup_${new Date().toISOString().split('T')[0]}.json`;
    downloadBlob(blob, fileName);
    setStatusMessage({ type: 'success', text: `Backup saved successfully: ${fileName}` });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = importFullDatabase(content);
      if (result.success) {
        setStatusMessage({ type: 'success', text: 'Backup restored successfully!' });
      } else {
        setStatusMessage({ type: 'error', text: result.error || 'Failed to restore backup' });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleResetData = () => {
    resetToInitialData();
    setStatusMessage({ type: 'success', text: 'App reset to clean blank state' });
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
            <h2 className="text-lg font-bold">Backup and Restore</h2>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-xl mx-auto w-full space-y-4">
        {/* Status Notification */}
        {statusMessage && (
          <div
            className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-medium animate-in fade-in ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Info Card */}
        <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 space-y-2">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Local Offline Storage</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            All your financial entries are safely stored in your browser device storage. Create periodic JSON backups to transfer your ledger across devices.
          </p>
          <div className="pt-2 flex justify-between text-xs text-slate-600 border-t border-slate-100 font-mono">
            <span>Accounts: {accounts.length}</span>
            <span>Transactions: {transactions.length}</span>
          </div>
        </div>

        {/* Export Backup Card */}
        <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 space-y-3">
          <div>
            <h4 className="font-bold text-slate-800 text-sm">Create Full Backup</h4>
            <p className="text-xs text-slate-500">
              Downloads a complete JSON file containing all books, transactions, notes, and settings.
            </p>
          </div>
          <button
            onClick={handleExportBackup}
            className="w-full py-3 bg-[#0288D1] hover:bg-sky-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" /> Download Backup (.json)
          </button>
        </div>

        {/* Restore Backup Card */}
        <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 space-y-3">
          <div>
            <h4 className="font-bold text-slate-800 text-sm">Restore from Backup</h4>
            <p className="text-xs text-slate-500">
              Restore previously saved transactions from a .json file.
            </p>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <Upload className="w-4 h-4" /> Select Backup File
          </button>
        </div>

        {/* Factory Reset / Blank Slate Card */}
        <div className="bg-white p-4 rounded-2xl shadow-xs border border-rose-100 space-y-3">
          <div>
            <h4 className="font-bold text-rose-700 text-sm">Clear All &amp; Start Clean</h4>
            <p className="text-xs text-slate-500">
              Permanently clears all accounts and transactions, restoring the pristine ₹0 blank Cash Book.
            </p>
          </div>
          <button
            onClick={() => {
              resetToInitialData();
              setStatusMessage({ type: 'success', text: 'App reset to clean blank state (₹0 balance, 0 transactions)' });
            }}
            className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-rose-200"
          >
            <RotateCcw className="w-4 h-4" /> Reset to Blank Slate (₹0)
          </button>
        </div>

        {/* Optional Demo Loader */}
        <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 space-y-3">
          <div>
            <h4 className="font-bold text-slate-700 text-sm">Testing: Load Sample Demo Data</h4>
            <p className="text-xs text-slate-500">
              Only for testing PDF/Excel exports: loads sample transactions to preview multi-page reports.
            </p>
          </div>
          <button
            onClick={() => {
              loadDemoData();
              setStatusMessage({ type: 'success', text: 'Sample test transactions loaded' });
            }}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            Load Sample Data for Testing
          </button>
        </div>
      </div>
    </div>
  );
};
