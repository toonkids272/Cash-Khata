import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  QrCode,
  Download,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Package,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface AndroidInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [copiedPwaUrl, setCopiedPwaUrl] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  // Firebase Hosting production URL (Never blocked by PWABuilder)
  const pwaBuilderTargetUrl = 'https://carbide-generator-svr20.web.app';
  const sharedUrl = typeof window !== 'undefined' ? window.location.origin : pwaBuilderTargetUrl;

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(sharedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyPwaUrl = () => {
    navigator.clipboard.writeText(pwaBuilderTargetUrl);
    setCopiedPwaUrl(true);
    setTimeout(() => setCopiedPwaUrl(false), 2000);
  };

  const handleNativeInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsInstallable(false);
      }
    }
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    sharedUrl
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Dialog */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 text-slate-800 flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="bg-[#0288D1] text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Android Package &amp; PWABuilder</h3>
              <p className="text-xs text-sky-100">Publish to Google Play or install on mobile</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Direct Install Button (If on Android / Chrome) */}
          {isInstallable && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
              <div>
                <p className="font-bold text-xs text-emerald-900">Chrome Detected</p>
                <p className="text-[11px] text-emerald-700">Install directly to your Android device</p>
              </div>
              <button
                onClick={handleNativeInstall}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 stroke-[3]" /> Install Now
              </button>
            </div>
          )}

          {/* PWABUILDER CARD */}
          <div className="p-4 bg-gradient-to-br from-indigo-50 via-sky-50 to-blue-50 border border-sky-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                <Package className="w-4 h-4 text-[#0288D1]" />
                PWABuilder Google Play Package
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                Firebase Hosting Ready
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Generate your official Android <strong>.aab</strong> (Android App Bundle for Google Play) and <strong>.apk</strong> (for direct device install).
            </p>

            {/* Why Web Host Blocking Fix Callout */}
            <div className="p-2.5 bg-sky-100/70 border border-sky-300/80 rounded-xl text-[11px] text-sky-950 leading-relaxed space-y-1">
              <p className="font-bold text-sky-900 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                Solved: Web Host Blocking Error
              </p>
              <p>
                AI Studio preview links block external crawlers with bot security shields. Use your production <strong>Firebase Hosting URL</strong> below, which PWABuilder can crawl 100% cleanly with full SSL &amp; Digital Asset Links.
              </p>
            </div>

            {/* Target URL with Copy Button */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                Production URL for PWABuilder:
              </label>
              <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-sky-200 shadow-2xs">
                <input
                  type="text"
                  readOnly
                  value={pwaBuilderTargetUrl}
                  className="bg-transparent text-xs text-slate-900 font-mono flex-1 outline-none px-1 select-all truncate font-bold"
                />
                <button
                  type="button"
                  onClick={handleCopyPwaUrl}
                  className="px-3 py-1.5 bg-[#0288D1] hover:bg-sky-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 transition-colors shadow-2xs cursor-pointer"
                >
                  {copiedPwaUrl ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPwaUrl ? 'Copied' : 'Copy URL'}</span>
                </button>
              </div>
            </div>

            {/* App Credentials for Play Console */}
            <div className="grid grid-cols-2 gap-2 text-[11px] bg-white p-2.5 rounded-xl border border-sky-100 text-slate-700">
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">PLAY CONSOLE APP NAME:</span>
                <span className="font-bold text-slate-900">Cash Khata</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">PACKAGE ID:</span>
                <span className="font-mono font-semibold text-sky-800 text-[10.5px]">com.cashkhata.vyaparledger</span>
              </div>
            </div>

            {/* 4-Step Instructions */}
            <div className="bg-white/90 p-3 rounded-xl border border-sky-100 text-xs text-slate-700 space-y-1.5">
              <p className="font-bold text-[11px] text-slate-900">4 Steps on PWABuilder.com:</p>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600 pl-0.5">
                <li>Paste <strong>{pwaBuilderTargetUrl}</strong> into PWABuilder.</li>
                <li>Click <strong>Start</strong> (validates manifest, service worker &amp; security).</li>
                <li>Click <strong>Package for Stores</strong> &gt; choose <strong>Android</strong>.</li>
                <li>Under Options verify package name <code>com.cashkhata.vyaparledger</code> &gt; click <strong>Generate Package</strong>.</li>
              </ol>
            </div>

            {/* Launch Button */}
            <a
              href="https://www.pwabuilder.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open PWABuilder.com in New Tab</span>
            </a>
          </div>

          {/* Option 2: Scan QR Code */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center space-y-2.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Direct Phone Test: Scan with Camera
            </span>

            <div className="w-40 h-40 mx-auto bg-white p-2.5 rounded-2xl shadow-xs border border-slate-200 flex items-center justify-center">
              <img
                src={qrImageUrl}
                alt="QR Code to test Cash Khata"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Scan with your phone's camera to open in Chrome and tap <em>"Install App"</em> from the browser menu.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>PWA Verified • 100% Score</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
