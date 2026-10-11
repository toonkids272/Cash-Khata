import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ShieldCheck, Sparkles, ExternalLink } from 'lucide-react';
import { ADMOB_CONFIG } from '../config/admob';
import { useCashBook } from '../context/CashBookContext';

const APP_OPEN_AD_STORAGE_KEY = 'cashkhata_last_app_open_ad_time';

export const AppOpenAd: React.FC = () => {
  const { isPro } = useCashBook();
  const [isVisible, setIsVisible] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(ADMOB_CONFIG.appOpen.skipCountdownSeconds);
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    if (isPro) return;
    // Check frequency cap: show only once per session or after frequencyCapMinutes
    try {
      const lastShownStr = sessionStorage.getItem(APP_OPEN_AD_STORAGE_KEY);
      const now = Date.now();

      if (!lastShownStr) {
        // First app opening in this browser session
        setIsVisible(true);
        sessionStorage.setItem(APP_OPEN_AD_STORAGE_KEY, now.toString());
      } else {
        const lastShown = parseInt(lastShownStr, 10);
        const minutesSinceLast = (now - lastShown) / (1000 * 60);
        if (minutesSinceLast >= ADMOB_CONFIG.appOpen.frequencyCapMinutes) {
          setIsVisible(true);
          sessionStorage.setItem(APP_OPEN_AD_STORAGE_KEY, now.toString());
        }
      }
    } catch {
      // If storage restricted, do not block
    }
  }, []);

  // Countdown timer for Skip action
  useEffect(() => {
    if (!isVisible) return;

    if (secondsRemaining > 0) {
      const timer = setTimeout(() => {
        setSecondsRemaining((prev: number) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanSkip(true);
    }
  }, [isVisible, secondsRemaining]);

  // Request adsbygoogle to fill the slot if available
  useEffect(() => {
    if (!isVisible) return;

    try {
      if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (e) {
      console.warn('AdMob push notice:', e);
    }
  }, [isVisible]);

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (isPro || !isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col justify-between text-white animate-in fade-in duration-200">
      {/* Top App Open Ad Header */}
      <div className="w-full bg-slate-900/90 backdrop-blur-md px-4 py-3 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <img
            src="/app-icon.png"
            alt="Cash Khata"
            className="w-8 h-8 rounded-xl object-cover shadow-xs border border-white/20"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs sm:text-sm text-slate-100">Cash Khata</span>
              <span className="px-1.5 py-0.5 rounded-sm bg-amber-500/20 text-amber-300 text-[10px] font-bold tracking-wider uppercase border border-amber-500/30">
                Ad
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Google AdMob Sponsored</p>
          </div>
        </div>

        {/* Skip / Continue Button */}
        <div>
          {canSkip ? (
            <button
              onClick={handleDismiss}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0288D1] hover:bg-sky-500 text-white rounded-lg text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <span>Continue to App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 text-xs font-semibold">
              Skip in {secondsRemaining}s
            </div>
          )}
        </div>
      </div>

      {/* Main Ad Stage */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Google AdMob Container */}
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[320px] shadow-2xl relative">
          <ins
            className="adsbygoogle"
            style={{ display: 'block', width: '100%', minHeight: '280px' }}
            data-ad-client={ADMOB_CONFIG.publisherId}
            data-ad-slot={ADMOB_CONFIG.appOpen.slotId}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />

          {/* AdMob Notice & Unit Info */}
          <div className="w-full text-center mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span className="font-mono text-[10px] truncate max-w-[240px]">
              Unit: {ADMOB_CONFIG.appOpen.unitId}
            </span>
            <span className="text-slate-400 font-semibold">Google AdMob</span>
          </div>
        </div>
      </div>

      {/* Bottom Footer Bar */}
      <div className="w-full bg-slate-900/90 px-4 py-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Secure Business Ledger</span>
        </div>
        <button
          onClick={handleDismiss}
          className="text-slate-400 hover:text-white transition-colors cursor-pointer text-xs font-medium underline"
        >
          Skip to Cash Khata
        </button>
      </div>
    </div>
  );
};
