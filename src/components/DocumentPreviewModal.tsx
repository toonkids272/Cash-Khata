import React, { useState, useMemo } from 'react';
import {
  X,
  Share2,
  Download,
  Printer,
  FileText,
  FileSpreadsheet,
  Search,
  Building2,
  Calendar,
  CreditCard,
  Tag,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { useCashBook } from '../context/CashBookContext';
import { shareOrSaveFile, downloadBlob } from '../utils/fileSharing';
import { formatINR, formatTableDate } from '../utils/formatters';

export const DocumentPreviewModal: React.FC = () => {
  const { previewDoc, setPreviewDoc, currentAccount } = useCashBook();
  const [activeTab, setActiveTab] = useState<'sheet1' | 'sheet2'>('sheet1');
  const [pdfViewMode, setPdfViewMode] = useState<'document' | 'raw'>('document');
  const [searchFilter, setSearchFilter] = useState('');

  const data = previewDoc?.reportData;

  // Chronologically sorted transactions with running balance (called unconditionally)
  const sortedTransactionsWithBalance = useMemo(() => {
    if (!data?.transactions) return [];

    const sorted = [...data.transactions].sort((a, b) => {
      const dtA = new Date(`${a.date}T${a.time || '00:00'}`).getTime();
      const dtB = new Date(`${b.date}T${b.time || '00:00'}`).getTime();
      return dtA - dtB;
    });

    let balance = data.openingBalance || 0;
    return sorted.map((t, idx) => {
      if (t.type === 'in') {
        balance += t.amount;
      } else {
        balance -= t.amount;
      }
      return {
        ...t,
        sNo: idx + 1,
        runningBalance: balance,
      };
    });
  }, [data]);

  // Filtered rows for Excel search (called unconditionally)
  const filteredTransactions = useMemo(() => {
    if (!searchFilter.trim()) return sortedTransactionsWithBalance;
    const q = searchFilter.toLowerCase();
    return sortedTransactionsWithBalance.filter(
      (t) =>
        t.partyName.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.paymentMode.toLowerCase().includes(q) ||
        (t.remarks && t.remarks.toLowerCase().includes(q)) ||
        t.amount.toString().includes(q) ||
        t.date.includes(q)
    );
  }, [sortedTransactionsWithBalance, searchFilter]);

  // Category breakdown data (called unconditionally)
  const categoryBreakdown = useMemo(() => {
    if (!data?.transactions) return { inList: [], outList: [] };

    const inMap: { [cat: string]: { total: number; count: number } } = {};
    const outMap: { [cat: string]: { total: number; count: number } } = {};

    data.transactions.forEach((t) => {
      const targetMap = t.type === 'in' ? inMap : outMap;
      if (!targetMap[t.category]) {
        targetMap[t.category] = { total: 0, count: 0 };
      }
      targetMap[t.category].total += t.amount;
      targetMap[t.category].count += 1;
    });

    const inList = Object.entries(inMap).map(([category, stats]) => ({
      category,
      total: stats.total,
      count: stats.count,
    })).sort((a, b) => b.total - a.total);

    const outList = Object.entries(outMap).map(([category, stats]) => ({
      category,
      total: stats.total,
      count: stats.count,
    })).sort((a, b) => b.total - a.total);

    return { inList, outList };
  }, [data]);

  // Early return strictly AFTER all hooks have been declared
  if (!previewDoc) return null;

  const handleShare = async () => {
    await shareOrSaveFile(
      previewDoc.blob,
      previewDoc.fileName,
      previewDoc.type === 'pdf' ? 'Cash Book PDF Statement' : 'Cash Book Excel Spreadsheet'
    );
  };

  const handleDownload = () => {
    downloadBlob(previewDoc.blob, previewDoc.fileName);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleClose = () => {
    if (previewDoc.url) URL.revokeObjectURL(previewDoc.url);
    setPreviewDoc(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 print:p-0 print:static print:inset-auto">
      {/* Backdrop (hidden in print) */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity print:hidden"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-5xl h-[92vh] bg-white rounded-2xl shadow-2xl flex flex-col z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-150 print:h-auto print:max-w-none print:shadow-none print:rounded-none">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-3 sm:px-5 py-3 bg-slate-900 text-white shrink-0 print:hidden">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                previewDoc.type === 'pdf' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
              }`}
            >
              {previewDoc.type === 'pdf' ? (
                <FileText className="w-4 h-4" />
              ) : (
                <FileSpreadsheet className="w-4 h-4" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-xs sm:text-sm truncate">{previewDoc.fileName}</h3>
              <p className="text-[11px] text-slate-400 truncate">
                {previewDoc.type === 'pdf' ? 'Printable PDF Statement' : 'Excel OpenXML Workbook (.xlsx)'} •{' '}
                {(previewDoc.blob.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {previewDoc.type === 'pdf' && (
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                title="Print Statement"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Print</span>
              </button>
            )}

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0288D1] hover:bg-sky-600 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="Share via WhatsApp / Android"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              title="Download File"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>

            <button
              onClick={handleClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors ml-1 cursor-pointer"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Mode & Tab Navigation Bar */}
        <div className="px-4 py-2 bg-slate-800 text-white flex items-center justify-between border-t border-slate-700/60 shrink-0 text-xs print:hidden">
          {previewDoc.type === 'pdf' ? (
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">View Mode:</span>
              <button
                onClick={() => setPdfViewMode('document')}
                className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  pdfViewMode === 'document' ? 'bg-[#0288D1] text-white' : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                Visual Sheet Preview (Recommended)
              </button>
              {previewDoc.url && (
                <button
                  onClick={() => setPdfViewMode('raw')}
                  className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                    pdfViewMode === 'raw' ? 'bg-[#0288D1] text-white' : 'text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Raw PDF Viewer
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px]">Excel Sheets:</span>
              <button
                onClick={() => setActiveTab('sheet1')}
                className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'sheet1' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>Ledger Statement</span>
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-800 text-[10px]">
                  {sortedTransactionsWithBalance.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('sheet2')}
                className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'sheet2' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>Category Breakdown</span>
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-800 text-[10px]">
                  {categoryBreakdown.inList.length + categoryBreakdown.outList.length}
                </span>
              </button>
            </div>
          )}

          <div className="text-slate-400 text-[11px] hidden sm:block">
            {data?.accountName} • {data?.dateRangeLabel}
          </div>
        </div>

        {/* Content Viewer Body */}
        <div className="flex-1 overflow-y-auto bg-slate-200/70 p-3 sm:p-6 print:bg-white print:p-0">
          {/* ===================================================
              RAW PDF IFRAME FALLBACK (IF USER SELECTS RAW)
             =================================================== */}
          {previewDoc.type === 'pdf' && pdfViewMode === 'raw' && previewDoc.url ? (
            <iframe
              src={previewDoc.url}
              className="w-full h-full min-h-[500px] rounded-xl border border-slate-300 bg-white"
              title="Raw PDF Document Preview"
            />
          ) : null}

          {/* ===================================================
              PDF VISUAL SHEET PREVIEW (100% RELIABLE IN MOBILE & IFRAME)
             =================================================== */}
          {previewDoc.type === 'pdf' && pdfViewMode === 'document' ? (
            <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden text-slate-800 print:shadow-none print:border-none print:rounded-none">
              {/* Document Banner */}
              <div className="bg-[#1976D2] text-white p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/20 pb-4">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                      {data?.settings?.businessName || 'Cash Khata'}
                    </h1>
                    {data?.settings?.ownerName && (
                      <p className="text-xs text-sky-100 font-medium mt-0.5">
                        Prop: {data.settings.ownerName}
                      </p>
                    )}
                  </div>
                  <div className="sm:text-right text-xs text-sky-100 space-y-0.5">
                    <p className="font-bold text-white text-sm">CASH BOOK STATEMENT</p>
                    <p>Generated: {new Date().toLocaleString('en-IN')}</p>
                    {data?.settings?.phone && <p>Phone: {data.settings.phone}</p>}
                    {data?.settings?.gstNumber && <p>GSTIN: {data.settings.gstNumber}</p>}
                  </div>
                </div>

                {/* Sub-bar */}
                <div className="pt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-sky-100">
                  <div className="flex items-center gap-1.5 font-semibold text-white">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Account: {data?.accountName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Period: {data?.dateRangeLabel}</span>
                  </div>
                  <div>
                    <span>Total Entries: {sortedTransactionsWithBalance.length}</span>
                  </div>
                </div>
              </div>

              {/* 4 Financial Metric Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 sm:p-6 bg-slate-50 border-b border-slate-200">
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                    Opening Balance
                  </p>
                  <p className="text-sm sm:text-base font-extrabold text-slate-700 mt-1 font-mono">
                    {formatINR(data?.openingBalance || 0)}
                  </p>
                </div>

                <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 shadow-2xs">
                  <p className="text-[10px] font-bold uppercase text-emerald-700 tracking-wider flex items-center gap-1">
                    <ArrowDownLeft className="w-3 h-3 text-emerald-600" /> Total Cash In
                  </p>
                  <p className="text-sm sm:text-base font-extrabold text-emerald-700 mt-1 font-mono">
                    {formatINR(data?.totalCashIn || 0)}
                  </p>
                </div>

                <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-200 shadow-2xs">
                  <p className="text-[10px] font-bold uppercase text-rose-700 tracking-wider flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3 text-rose-600" /> Total Cash Out
                  </p>
                  <p className="text-sm sm:text-base font-extrabold text-rose-700 mt-1 font-mono">
                    {formatINR(data?.totalCashOut || 0)}
                  </p>
                </div>

                <div className="p-3 bg-sky-50/70 rounded-xl border border-sky-200 shadow-2xs">
                  <p className="text-[10px] font-bold uppercase text-[#0288D1] tracking-wider">
                    Net / Closing
                  </p>
                  <p
                    className={`text-sm sm:text-base font-extrabold mt-1 font-mono ${
                      (data?.netBalance || 0) >= 0 ? 'text-[#0288D1]' : 'text-rose-700'
                    }`}
                  >
                    {formatINR(data?.netBalance || 0)}
                  </p>
                </div>
              </div>

              {/* Transactions Ledger Table */}
              <div className="p-4 sm:p-6 overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-800 text-white font-semibold">
                      <th className="py-2.5 px-3 rounded-l-md w-10 text-center">#</th>
                      <th className="py-2.5 px-3">Date &amp; Time</th>
                      <th className="py-2.5 px-3">Party / Particulars</th>
                      <th className="py-2.5 px-2">Category</th>
                      <th className="py-2.5 px-2">Mode</th>
                      <th className="py-2.5 px-3 text-right">Cash In (₹)</th>
                      <th className="py-2.5 px-3 text-right">Cash Out (₹)</th>
                      <th className="py-2.5 px-3 text-right rounded-r-md">Balance (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {/* Opening Balance Row */}
                    <tr className="bg-slate-50 font-bold text-slate-700">
                      <td className="py-2 px-3 text-center">-</td>
                      <td className="py-2 px-3 text-slate-500 font-mono">
                        {data?.dateRangeLabel.split(' - ')[0] || 'Start'}
                      </td>
                      <td className="py-2 px-3">Opening Balance B/F</td>
                      <td className="py-2 px-2 text-slate-400">Ledger</td>
                      <td className="py-2 px-2 text-slate-400">-</td>
                      <td className="py-2 px-3 text-right font-mono">
                        {(data?.openingBalance || 0) > 0 ? formatINR(data?.openingBalance || 0) : '-'}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-slate-400">-</td>
                      <td className="py-2 px-3 text-right font-mono text-[#0288D1]">
                        {formatINR(data?.openingBalance || 0)}
                      </td>
                    </tr>

                    {sortedTransactionsWithBalance.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-400">
                          No transactions found for this period.
                        </td>
                      </tr>
                    ) : (
                      sortedTransactionsWithBalance.map((t, idx) => (
                        <tr
                          key={t.id}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            idx % 2 === 1 ? 'bg-slate-50/30' : 'bg-white'
                          }`}
                        >
                          <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">
                            {t.sNo}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className="font-semibold text-slate-700">
                              {formatTableDate(t.date)}
                            </span>
                            <span className="block text-[10px] text-slate-400">{t.time}</span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-slate-900 block">{t.partyName}</span>
                            {t.remarks && (
                              <span className="text-[11px] text-slate-500 italic block">
                                {t.remarks}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-2">
                            <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium">
                              {t.category}
                            </span>
                          </td>
                          <td className="py-2.5 px-2 text-[11px] text-slate-500">
                            {t.paymentMode}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600">
                            {t.type === 'in' ? `+${formatINR(t.amount)}` : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-600">
                            {t.type === 'out' ? `-${formatINR(t.amount)}` : '-'}
                          </td>
                          <td
                            className={`py-2.5 px-3 text-right font-mono font-bold ${
                              t.runningBalance >= 0 ? 'text-[#0288D1]' : 'text-rose-600'
                            }`}
                          >
                            {formatINR(t.runningBalance)}
                          </td>
                        </tr>
                      ))
                    )}

                    {/* Summary Totals Row */}
                    <tr className="bg-slate-100 font-extrabold text-slate-900 border-t-2 border-slate-300">
                      <td colSpan={5} className="py-3 px-3 uppercase text-right tracking-wider text-[11px]">
                        Period Grand Total:
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-emerald-700 text-xs sm:text-sm">
                        +{formatINR(data?.totalCashIn || 0)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-rose-700 text-xs sm:text-sm">
                        -{formatINR(data?.totalCashOut || 0)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-[#0288D1] text-xs sm:text-sm">
                        {formatINR(data?.netBalance || 0)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Signatures & Footer Note */}
              <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 text-xs text-slate-500">
                <div>
                  <p className="font-bold text-slate-700">Notice:</p>
                  <p className="text-[11px] mt-0.5">
                    This statement is system-generated from Cash Khata Vyapar Ledger.
                  </p>
                  {data?.settings?.address && (
                    <p className="text-[11px] mt-0.5">Address: {data.settings.address}</p>
                  )}
                </div>

                <div className="text-center sm:text-right">
                  <div className="w-48 h-12 border-b border-slate-400 mx-auto sm:ml-auto mb-1 flex items-end justify-center pb-1">
                    <span className="text-[10px] text-slate-400 italic">Authorized Signature</span>
                  </div>
                  <p className="font-bold text-slate-800">
                    For {data?.settings?.businessName || 'Business Owner'}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {/* ===================================================
              EXCEL WORKBOOK SPREADSHEET VIEWER (TABS 1 & 2)
             =================================================== */}
          {previewDoc.type === 'excel' ? (
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden text-slate-800 max-w-4xl mx-auto">
              {/* Excel Application Ribbon Header */}
              <div className="bg-[#107C41] text-white px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5" />
                  <span className="font-bold text-sm">Microsoft Excel Viewer</span>
                  <span className="text-emerald-200 text-xs">({previewDoc.fileName})</span>
                </div>
                <div className="text-xs text-emerald-100 hidden sm:block">
                  AutoFilters &amp; Formulated Math Active
                </div>
              </div>

              {/* Sheet 1: Ledger Statement */}
              {activeTab === 'sheet1' && (
                <div className="p-4 sm:p-5">
                  {/* Search and Filters */}
                  <div className="mb-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="relative w-full sm:w-72">
                      <input
                        type="text"
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        placeholder="Search particulars, category, mode..."
                        className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                      {searchFilter && (
                        <button
                          onClick={() => setSearchFilter('')}
                          className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 font-bold text-xs"
                        >
                          ×
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <span className="font-medium">Showing:</span>
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {filteredTransactions.length} of {sortedTransactionsWithBalance.length} rows
                      </span>
                    </div>
                  </div>

                  {/* Spreadsheet Grid */}
                  <div className="overflow-x-auto border border-slate-300 rounded-lg">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-300">
                          <th className="py-2 px-2 text-center w-8 bg-slate-200 border-r border-slate-300">A</th>
                          <th className="py-2 px-3 border-r border-slate-300">Date</th>
                          <th className="py-2 px-3 border-r border-slate-300">Time</th>
                          <th className="py-2 px-4 border-r border-slate-300">Particulars / Party</th>
                          <th className="py-2 px-3 border-r border-slate-300">Category</th>
                          <th className="py-2 px-3 border-r border-slate-300">Mode</th>
                          <th className="py-2 px-3 text-right border-r border-slate-300 text-emerald-800">
                            Cash In (₹)
                          </th>
                          <th className="py-2 px-3 text-right border-r border-slate-300 text-rose-800">
                            Cash Out (₹)
                          </th>
                          <th className="py-2 px-3 text-right border-r border-slate-300 text-sky-800">
                            Balance (₹)
                          </th>
                          <th className="py-2 px-3">Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {filteredTransactions.map((t, idx) => (
                          <tr
                            key={t.id}
                            className={`hover:bg-emerald-50/50 ${idx % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'}`}
                          >
                            <td className="py-2 px-2 text-center font-mono text-[10px] text-slate-400 bg-slate-100 border-r border-slate-300">
                              {t.sNo}
                            </td>
                            <td className="py-2 px-3 whitespace-nowrap font-medium border-r border-slate-200">
                              {t.date}
                            </td>
                            <td className="py-2 px-3 whitespace-nowrap text-slate-500 font-mono text-[11px] border-r border-slate-200">
                              {t.time}
                            </td>
                            <td className="py-2 px-4 font-bold text-slate-900 border-r border-slate-200">
                              {t.partyName}
                            </td>
                            <td className="py-2 px-3 border-r border-slate-200">
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px]">
                                {t.category}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-slate-600 border-r border-slate-200">
                              {t.paymentMode}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-emerald-600 border-r border-slate-200">
                              {t.type === 'in' ? formatINR(t.amount) : ''}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-rose-600 border-r border-slate-200">
                              {t.type === 'out' ? formatINR(t.amount) : ''}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-[#0288D1] border-r border-slate-200">
                              {formatINR(t.runningBalance)}
                            </td>
                            <td className="py-2 px-3 text-slate-500 italic text-[11px]">
                              {t.remarks || '-'}
                            </td>
                          </tr>
                        ))}

                        {/* Grand Totals */}
                        <tr className="bg-emerald-50 font-black text-slate-900 border-t-2 border-emerald-300">
                          <td className="py-2 px-2 text-center bg-emerald-100 border-r border-emerald-300 font-mono text-[10px]">
                            Σ
                          </td>
                          <td colSpan={5} className="py-2 px-4 uppercase text-right tracking-wider text-[11px] border-r border-emerald-200">
                            Totals:
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-emerald-700 border-r border-emerald-200">
                            {formatINR(data?.totalCashIn || 0)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-rose-700 border-r border-emerald-200">
                            {formatINR(data?.totalCashOut || 0)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-[#0288D1] border-r border-emerald-200">
                            {formatINR(data?.netBalance || 0)}
                          </td>
                          <td className="py-2 px-3 text-[10px] text-slate-400">Formula =SUM()</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Sheet 2: Category Breakdown */}
              {activeTab === 'sheet2' && (
                <div className="p-4 sm:p-5 space-y-6">
                  {/* Cash In Categories */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2 flex items-center gap-1.5">
                      <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                      <span>Cash Inflow by Category</span>
                    </h4>
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                          <tr>
                            <th className="py-2 px-3">Category Name</th>
                            <th className="py-2 px-3 text-center">Entries Count</th>
                            <th className="py-2 px-3 text-right">Total Amount (₹)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {categoryBreakdown.inList.map((c) => (
                            <tr key={c.category} className="hover:bg-slate-50">
                              <td className="py-2 px-3 font-semibold text-slate-800">{c.category}</td>
                              <td className="py-2 px-3 text-center font-mono text-slate-500">{c.count}</td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-emerald-600">
                                {formatINR(c.total)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Cash Out Categories */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700 mb-2 flex items-center gap-1.5">
                      <ArrowUpRight className="w-4 h-4 text-rose-600" />
                      <span>Cash Outflow / Expense by Category</span>
                    </h4>
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                          <tr>
                            <th className="py-2 px-3">Category Name</th>
                            <th className="py-2 px-3 text-center">Entries Count</th>
                            <th className="py-2 px-3 text-right">Total Amount (₹)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {categoryBreakdown.outList.map((c) => (
                            <tr key={c.category} className="hover:bg-slate-50">
                              <td className="py-2 px-3 font-semibold text-slate-800">{c.category}</td>
                              <td className="py-2 px-3 text-center font-mono text-slate-500">{c.count}</td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-rose-600">
                                {formatINR(c.total)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Excel Bottom Status Bar */}
              <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-slate-700">Ready</span>
                  <span>Count: {sortedTransactionsWithBalance.length}</span>
                  <span>Sum: {formatINR(data?.netBalance || 0)}</span>
                </div>
                <div className="font-mono text-[10px] text-slate-400">100% Zoom</div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
