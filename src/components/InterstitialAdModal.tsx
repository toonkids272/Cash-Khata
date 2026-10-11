import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, ArrowRight } from 'lucide-react';
import { ADMOB_CONFIG } from '../config/admob';

const LAST_INTERSTITIAL_KEY = 'cashkhata_last_interstitial_ad_time';

interface InterstitialAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerEventName?: string;
}

export const InterstitialAdModal: React.FC<InterstitialAdModalProps> = ({
  isOpen,
  onClose,
  triggerEventName = 'Statement Exported',
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(3);
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setSecondsRemaining(3);
    setCanClose(false);

    // Save timestamp for cooldown
    sessionStorage.setItem(LAST_INTERSTITIAL_KEY, Date.now().toString());

    // Request adsbygoogle
    try {
      if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (e) {
      console.warn('Interstitial AdMob notice:', e);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    if (secondsRemaining > 0) {
      const timer = setTimeout(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanClose(true);
    }
  }, [isOpen, secondsRemaining]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-slate-950/95 backdrop-blur-md flex flex-col justify-between text-white animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <div className="w-full bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 rounded-sm bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-500/30">
            Ad
          </span>
          <span className="text-xs text-slate-300 font-semibold">{triggerEventName}</span>
        </div>

        {/* Close Button */}
        <div>
          {canClose ? (
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold border border-slate-700 transition-all cursor-pointer"
            >
              <span>Close</span>
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="px-3 py-1 bg-slate-800/80 rounded-lg text-slate-400 text-xs font-semibold">
              Reward in {secondsRemaining}s
            </div>
          )}
        </div>
      </div>

      {/* Main Full-Screen Interstitial Ad Stage */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col items-center justify-center min-h-[380px] shadow-2xl relative">
          <ins
            className="adsbygoogle"
            style={{ display: 'block', width: '100%', minHeight: '320px' }}
            data-ad-client={ADMOB_CONFIG.publisherId}
            data-ad-slot={ADMOB_CONFIG.interstitial.slotId}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />

          <div className="w-full text-center mt-3 pt-3 border-t border-slate-800 text-[10px] text-slate-500 flex items-center justify-between font-mono">
            <span>Unit: {ADMOB_CONFIG.interstitial.unitId}</span>
            <span className="text-slate-400 font-sans font-bold">AdMob Interstitial</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="w-full bg-slate-900 px-4 py-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Cash Khata - Fast &amp; Secure</span>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors cursor-pointer text-xs underline"
        >
          Return to app
        </button>
      </div>
    </div>
  );
};

/**
 * Utility helper to check if an interstitial can be shown according to cooldown guidelines
 */
export function canShowInterstitialAd(): boolean {
  try {
    const lastShownStr = sessionStorage.getItem(LAST_INTERSTITIAL_KEY);
    if (!lastShownStr) return true;
    const lastShown = parseInt(lastShownStr, 10);
    const secondsSince = (Date.now() - lastShown) / 1000;
    return secondsSince >= ADMOB_CONFIG.interstitial.cooldownSeconds;
  } catch {
    return true;
  }
}
