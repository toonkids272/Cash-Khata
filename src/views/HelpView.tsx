import React from 'react';
import { ArrowLeft, FileText, FileSpreadsheet, Share2, HelpCircle, CheckCircle } from 'lucide-react';
import { useCashBook } from '../context/CashBookContext';

export const HelpView: React.FC = () => {
  const { setActiveView, setIsExportModalOpen } = useCashBook();

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
            <h2 className="text-lg font-bold">Help &amp; Export Guide</h2>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-xl mx-auto w-full space-y-4 text-slate-800">
        {/* Core Export Guidance Card */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 space-y-3">
          <div className="flex items-center gap-2 text-[#0288D1] font-bold text-sm">
            <FileText className="w-5 h-5" />
            <span>PDF &amp; Excel Export Features</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Cash Khata generates production-grade, standard-compliant files right on your device:
          </p>

          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <strong className="text-slate-800">Multi-Page PDF Statements:</strong> Includes company header, verified opening &amp; closing balances, authorized signature seal line, and running balance column.
              </div>
            </div>

            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <strong className="text-slate-800">True Excel (.xlsx) Files:</strong> Compatible with Microsoft Excel, Google Sheets, LibreOffice, and WPS Office. Features formatted numbers, calculated totals, and automatic column filters.
              </div>
            </div>

            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <strong className="text-slate-800">Android Share Sheet:</strong> Tap the Share button in the Report dialog to send PDF or Excel statements directly to WhatsApp contacts, Gmail, or save to Google Drive.
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsExportModalOpen(true)}
            className="w-full mt-2 py-2.5 bg-[#0288D1] hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Open Report Generator
          </button>
        </div>

        {/* FAQ Accordion / Cards */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 space-y-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-slate-500" /> Frequently Asked Questions
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <h4 className="font-bold text-slate-800">How do I switch between different accounts?</h4>
              <p className="text-slate-500 mt-0.5">
                Tap on the account name dropdown in the top blue header (or open the menu drawer &gt; Accounts) to switch between Cash Book, Bank, and Petty Cash.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <h4 className="font-bold text-slate-800">How does the Cash Calculator help?</h4>
              <p className="text-slate-500 mt-0.5">
                At the end of the business day, count physical Indian notes (₹500, ₹200, ₹100, etc.) in your cash drawer. The calculator instantly checks if physical cash matches your Cash Book balance.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <h4 className="font-bold text-slate-800">Is my data safe and private?</h4>
              <p className="text-slate-500 mt-0.5">
                Yes. 100% of your data remains on your local device. No third-party servers, tracker cookies, or remote logging are used.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
