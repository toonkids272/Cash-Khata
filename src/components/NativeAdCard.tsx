import React, { useEffect, useRef } from 'react';
import { ADMOB_CONFIG } from '../config/admob';
import { Sparkles } from 'lucide-react';

interface NativeAdCardProps {
  className?: string;
  variant?: 'feed' | 'banner' | 'compact';
}

export const NativeAdCard: React.FC<NativeAdCardProps> = ({
  className = '',
  variant = 'feed',
}) => {
  const adRef = useRef<HTMLModElement>(null);
  const isLoadedRef = useRef(false);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && (window as any).adsbygoogle && !isLoadedRef.current) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        isLoadedRef.current = true;
      }
    } catch (e) {
      console.warn('Native AdMob push notice:', e);
    }
  }, []);

  return (
    <div
      className={`w-full bg-white rounded-2xl border border-slate-200/80 shadow-xs p-3 transition-all overflow-hidden ${className}`}
    >
      {/* Top Header Badge */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="px-1.5 py-0.5 rounded-sm bg-amber-500/15 text-amber-700 text-[10px] font-black uppercase tracking-wider border border-amber-500/25">
            Ad
          </span>
          <span className="text-[11px] font-semibold text-slate-400">Sponsored</span>
        </div>
        <span className="text-[10px] font-mono text-slate-300">
          AdMob
        </span>
      </div>

      {/* Ad Stage */}
      <div className="w-full min-h-[90px] flex flex-col items-center justify-center bg-slate-50/70 rounded-xl overflow-hidden border border-dashed border-slate-200">
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', minHeight: variant === 'compact' ? '60px' : '90px' }}
          data-ad-client={ADMOB_CONFIG.publisherId}
          data-ad-slot={ADMOB_CONFIG.native.slotId}
          data-ad-format={variant === 'feed' ? 'fluid' : 'auto'}
          data-ad-layout-key="-fb+5w+4e-db+86"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
};
