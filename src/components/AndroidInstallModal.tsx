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
} from 'lucide-react';

interface AndroidInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  const sharedUrl = window.location.origin;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 text-slate-800">
        {/* Top Header */}
        <div className="bg-[#0288D1] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Test &amp; Install on Android</h3>
              <p className="text-xs text-sky-100">Run as a standalone mobile app</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[82vh] overflow-y-auto">
          {/* Direct Install Button (If on Android / Chrome) */}
          {isInstallable && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
              <div>
                <p className="font-bold text-xs text-emerald-900">Chrome Detected</p>
                <p className="text-[11px] text-emerald-700">Install directly to your Android device</p>
              </div>
              <button
                onClick={handleNativeInstall}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 stroke-[3]" /> Install Now
              </button>
            </div>
          )}

          {/* Option 1: Scan QR Code */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center space-y-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Method 1: Scan with Phone Camera
            </span>

            <div className="w-44 h-44 mx-auto bg-white p-2.5 rounded-2xl shadow-xs border border-slate-200 flex items-center justify-center">
              <img
                src={qrImageUrl}
                alt="QR Code to test Cash Khata"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Scan with your Android camera or Google Lens to instantly open on your phone.
            </p>
          </div>

          {/* Option 2: Copy Live Link */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Method 2: Open Link in Chrome
            </span>
            <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-xl border border-slate-200">
              <input
                type="text"
                readOnly
                value={sharedUrl}
                className="bg-transparent text-xs text-slate-700 font-mono flex-1 outline-none px-1 select-all truncate"
              />
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 bg-[#0288D1] hover:bg-sky-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 transition-colors shadow-2xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Instructions for Android Chrome */}
          <div className="border-t border-slate-100 pt-3 space-y-2">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#0288D1]" /> How to add to your Home Screen:
            </h4>
            <ol className="text-xs text-slate-600 space-y-1.5 list-decimal list-inside pl-1 leading-relaxed">
              <li>Open the link on your Android phone in <strong>Google Chrome</strong>.</li>
              <li>
                Tap the <strong>three dots menu (⋮)</strong> in the top-right corner of Chrome.
              </li>
              <li>
                Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
              </li>
              <li>
                The <strong>Cash Khata</strong> app icon will be installed on your phone. It launches full-screen like a native Android app without any browser URL bars!
              </li>
            </ol>
          </div>

          {/* APK Packaging Tip */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
            <p className="font-bold flex items-center gap-1">
              Need a standalone .APK file for Google Play?
            </p>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              You can paste this live URL into <strong>PWABuilder.com</strong> to generate a signed Android APK package or Google Play Store bundle with 1 click.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
