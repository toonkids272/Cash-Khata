import React, { useState } from 'react';
import {
  X,
  FileText,
  FileSpreadsheet,
  Share2,
  Download,
  Eye,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useCashBook } from '../context/CashBookContext';
import { generateCashBookPDF } from '../utils/pdfGenerator';
import { generateCashBookExcel } from '../utils/excelGenerator';
import { shareOrSaveFile, downloadBlob } from '../utils/fileSharing';
import { formatINR } from '../utils/formatters';
import { Transaction } from '../types';
import { InterstitialAdModal, canShowInterstitialAd } from './InterstitialAdModal';

export const ExportModal: React.FC = () => {
  const {
    isExportModalOpen,
    setIsExportModalOpen,
    currentAccount,
    accounts,
    transactions,
    timeFilter,
    settings,
    setPreviewDoc,
  } = useCashBook();

  const [exportScope, setExportScope] = useState<'current' | 'all'>('current');
  const [dateRangeOption, setDateRangeOption] = useState<'current_filter' | 'this_month' | 'all_time'>('current_filter');
  const [isGenerating, setIsGenerating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showInterstitial, setShowInterstitial] = useState<boolean>(false);

  if (!isExportModalOpen) return null;

  // Filter transactions based on selected scope and date range
  const scopedTransactions = transactions.filter((t) => {
    if (exportScope === 'current' && t.accountId !== currentAccount?.id) {
      return false;
    }

    if (dateRangeOption === 'this_month') {
      const now = new Date();
      const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      return t.date.startsWith(yearMonth);
    }

    // current_filter or all_time
    return true;
  });

  const totalCashIn = scopedTransactions
    .filter((t) => t.type === 'in')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalCashOut = scopedTransactions
    .filter((t) => t.type === 'out')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalCashIn - totalCashOut;

  const dateRangeLabel =
    dateRangeOption === 'this_month'
      ? 'This Month'
      : dateRangeOption === 'all_time'
      ? 'All Time Records'
      : timeFilter.toUpperCase();

  const targetAccountName =
    exportScope === 'current' ? (currentAccount?.name || 'Cash Book') : 'All Accounts Consolidated';

  // Handle PDF Export
  const handleExportPDF = async (action: 'share' | 'download' | 'preview') => {
    setIsGenerating(true);
    setSuccessMessage(null);
    try {
      const reportData = {
        accountName: targetAccountName,
        transactions: scopedTransactions,
        dateRangeLabel,
        settings,
        totalCashIn,
        totalCashOut,
        netBalance,
        openingBalance: exportScope === 'current' ? (currentAccount?.initialBalance || 0) : 0,
      };

      const { blob, fileName } = generateCashBookPDF(reportData);

      if (action === 'preview') {
        const url = URL.createObjectURL(blob);
        setPreviewDoc({ type: 'pdf', blob, fileName, url, reportData });
        setIsExportModalOpen(false);
      } else if (action === 'download') {
        downloadBlob(blob, fileName);
        setSuccessMessage(`Saved ${fileName} (${(blob.size / 1024).toFixed(1)} KB)`);
        if (canShowInterstitialAd()) {
          setTimeout(() => setShowInterstitial(true), 500);
        }
      } else {
        const result = await shareOrSaveFile(blob, fileName, 'Cash Book PDF Statement');
        setSuccessMessage(result.message);
        if (canShowInterstitialAd()) {
          setTimeout(() => setShowInterstitial(true), 500);
        }
      }
    } catch (err: unknown) {
      const error = err as Error;
      alert(`PDF Generation failed: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Excel Export
  const handleExportExcel = async (action: 'share' | 'download' | 'preview') => {
    setIsGenerating(true);
    setSuccessMessage(null);
    try {
      const reportData = {
        accountName: targetAccountName,
        transactions: scopedTransactions,
        dateRangeLabel,
        settings,
        totalCashIn,
        totalCashOut,
        netBalance,
        openingBalance: exportScope === 'current' ? (currentAccount?.initialBalance || 0) : 0,
      };

      const { blob, fileName } = generateCashBookExcel(reportData);

      if (action === 'preview') {
        setPreviewDoc({ type: 'excel', blob, fileName, reportData });
        setIsExportModalOpen(false);
      } else if (action === 'download') {
        downloadBlob(blob, fileName);
        setSuccessMessage(`Saved ${fileName} (${(blob.size / 1024).toFixed(1)} KB)`);
        if (canShowInterstitialAd()) {
          setTimeout(() => setShowInterstitial(true), 500);
        }
      } else {
        const result = await shareOrSaveFile(
          blob,
          fileName,
          'Cash Khata Excel Report',
          'Exported XLSX spreadsheet from Cash Khata'
        );
        setSuccessMessage(result.message);
        if (canShowInterstitialAd()) {
          setTimeout(() => setShowInterstitial(true), 500);
        }
      }
    } catch (err: unknown) {
      const error = err as Error;
      alert(`Excel Generation failed: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsExportModalOpen(false)}
      />

      {/* Modal Dialog (inspired by Screenshot 2 "Report" popup) */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-sky-50 to-indigo-50/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0288D1]/10 flex items-center justify-center text-[#0288D1]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Report</h3>
              <p className="text-xs text-slate-500">Export Real PDF &amp; Excel Files</p>
            </div>
          </div>
          <button
            onClick={() => setIsExportModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Success Banner */}
          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{successMessage}</span>
            </div>
          )}

          {/* Scope & Date Filter Selectors */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Scope */}
            <div>
              <label className="block text-slate-500 font-medium mb-1 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-slate-400" /> Account Scope
              </label>
              <select
                value={exportScope}
                onChange={(e) => setExportScope(e.target.value as any)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-[#0288D1] focus:outline-none"
              >
                <option value="current">Current ({currentAccount?.name || 'Cash Book'})</option>
                <option value="all">All Accounts ({accounts.length})</option>
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-slate-500 font-medium mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Date Period
              </label>
              <select
                value={dateRangeOption}
                onChange={(e) => setDateRangeOption(e.target.value as any)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-[#0288D1] focus:outline-none"
              >
                <option value="current_filter">Current Filter ({timeFilter})</option>
                <option value="this_month">This Month</option>
                <option value="all_time">All Time Records</option>
              </select>
            </div>
          </div>

          {/* Report Data Quick Summary */}
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Selected Transactions:</span>
              <span className="font-semibold text-slate-800">{scopedTransactions.length} items</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Cash In / Cash Out:</span>
              <span className="font-mono tabular-nums">
                <span className="text-emerald-600 font-semibold">{formatINR(totalCashIn)}</span>
                {' / '}
                <span className="text-rose-600 font-semibold">{formatINR(totalCashOut)}</span>
              </span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-200/60 font-medium">
              <span className="text-slate-700">Net Ledger Balance:</span>
              <span
                className={`font-mono tabular-nums font-bold ${
                  netBalance >= 0 ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {formatINR(netBalance)}
              </span>
            </div>
          </div>

          {/* Export Options (Matching Screenshot 2: PDF and Excel) */}
          <div className="space-y-3 pt-1">
            {/* PDF Option Card */}
            <div className="p-3.5 border border-slate-200 rounded-xl hover:border-rose-300 transition-colors bg-white shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {/* Red PDF Icon badge */}
                  <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-xs">
                    <span className="text-xs font-black tracking-wider">PDF</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">PDF Statement</h4>
                    <p className="text-[11px] text-slate-500">Printable multi-page document with signature line</p>
                  </div>
                </div>
              </div>

              {/* PDF Actions */}
              <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-100">
                <button
                  disabled={isGenerating}
                  onClick={() => handleExportPDF('share')}
                  className="flex items-center justify-center gap-1.5 py-2 px-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                  title="Share via Android Share Sheet (WhatsApp, Mail, Drive)"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>

                <button
                  disabled={isGenerating}
                  onClick={() => handleExportPDF('download')}
                  className="flex items-center justify-center gap-1.5 py-2 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
                  title="Download PDF directly"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>Download</span>
                </button>

                <button
                  disabled={isGenerating}
                  onClick={() => handleExportPDF('preview')}
                  className="flex items-center justify-center gap-1.5 py-2 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
                  title="Preview PDF inside app"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-600" />
                  <span>Preview</span>
                </button>
              </div>
            </div>

            {/* Excel Option Card */}
            <div className="p-3.5 border border-slate-200 rounded-xl hover:border-emerald-300 transition-colors bg-white shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {/* Green Excel Icon badge */}
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs">
                    <span className="text-xs font-black tracking-wider">XLS</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Excel Spreadsheet</h4>
                    <p className="text-[11px] text-slate-500">True .xlsx with formulas, autofilters &amp; summary sheet</p>
                  </div>
                </div>
              </div>

              {/* Excel Actions */}
              <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-100">
                <button
                  disabled={isGenerating}
                  onClick={() => handleExportExcel('share')}
                  className="flex items-center justify-center gap-1.5 py-2 px-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                  title="Share via Android Share Sheet (WhatsApp, Sheets, Drive)"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>

                <button
                  disabled={isGenerating}
                  onClick={() => handleExportExcel('download')}
                  className="flex items-center justify-center gap-1.5 py-2 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
                  title="Download .xlsx directly"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>Download</span>
                </button>

                <button
                  disabled={isGenerating}
                  onClick={() => handleExportExcel('preview')}
                  className="flex items-center justify-center gap-1.5 py-2 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
                  title="Inspect sheet rows in app"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-600" />
                  <span>Preview</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Genuine .pdf &amp; .xlsx binary generation
          </span>
          <button
            onClick={() => setIsExportModalOpen(false)}
            className="font-medium text-slate-600 hover:text-slate-900"
          >
            Close
          </button>
        </div>
      </div>

      {/* Google AdMob Interstitial Ad (ca-app-pub-2290313694944386/3619661243) */}
      <InterstitialAdModal
        isOpen={showInterstitial}
        onClose={() => setShowInterstitial(false)}
        triggerEventName="Statement Exported"
      />
    </div>
  );
};
