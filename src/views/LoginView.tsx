import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Lock,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Cloud,
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { signInWithGoogle, loading, error, clearError } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-slate-50 to-white flex flex-col justify-between p-4 sm:p-6 text-slate-800">
      {/* Top Branding Section */}
      <div className="w-full max-w-md mx-auto pt-6 sm:pt-10 flex flex-col items-center text-center">
        {/* App Logo Emblem */}
        <div className="relative mb-4">
          <img
            src="/app-icon.png"
            alt="Cash Khata"
            className="w-20 h-20 rounded-3xl object-cover shadow-xl shadow-emerald-900/15 border-2 border-white"
          />
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-emerald-600 border-2 border-white flex items-center justify-center text-white shadow-xs">
            <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
          Cash Khata
        </h1>
        <p className="text-xs font-bold text-[#0288D1] tracking-wider uppercase mt-1">
          Vyapar Ledger &amp; Cash Book
        </p>
        <p className="text-xs text-slate-500 mt-2 max-w-xs leading-relaxed">
          Secure, cloud-synchronized business ledger. Back up and sync your transactions across all your devices.
        </p>
      </div>

      {/* Center Action Card */}
      <div className="w-full max-w-md mx-auto my-4 bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/70 border border-slate-100 flex flex-col items-center">
        <div className="w-full text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-[#0288D1] text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Google Account Authentication</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">Sign in with Google</h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Requires your authentic Google Account credentials. Protected with official Google OAuth 2.0 security.
          </p>
        </div>

        {/* Error Alert if any */}
        {error && (
          <div className="w-full mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <div className="flex-1">
              <p className="font-semibold">Sign-In Notice</p>
              <p className="mt-0.5 text-rose-600 leading-relaxed">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="text-rose-400 hover:text-rose-700 font-bold px-1 cursor-pointer"
            >
              ×
            </button>
          </div>
        )}

        {/* Primary Continue with Google Action Button */}
        <button
          onClick={signInWithGoogle}
          disabled={loading}
          className="w-full min-h-[52px] py-3.5 px-4 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 border-2 border-slate-300 hover:border-[#0288D1] rounded-2xl font-bold text-sm shadow-xs flex items-center justify-center gap-3 transition-all duration-150 disabled:opacity-60 cursor-pointer"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-slate-300 border-t-[#0288D1] rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>{loading ? 'Opening Google Sign-In...' : 'Continue with Google Account'}</span>
        </button>

        {/* Automatic Cloud & Local Merge Note */}
        <div className="w-full mt-4 p-3 rounded-xl bg-sky-50/70 border border-sky-100 flex items-center gap-2.5 text-xs text-sky-900">
          <Cloud className="w-4 h-4 text-[#0288D1] shrink-0" />
          <span className="text-[11px] leading-tight">
            Local cash books and cloud records merge automatically upon sign-in.
          </span>
        </div>

        {/* Trust Badges */}
        <div className="w-full mt-6 pt-5 border-t border-slate-100 grid grid-cols-2 gap-2.5 text-[11px] text-slate-600">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Official Google OAuth</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Private User Isolation</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Automatic Sync</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Multi-Device Ready</span>
          </div>
        </div>
      </div>

      {/* Footer Trust & Security Note */}
      <div className="w-full max-w-md mx-auto text-center pb-3">
        <div className="inline-flex items-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Protected with Google Cloud Firestore</span>
        </div>
      </div>
    </div>
  );
};
