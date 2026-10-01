import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Lock,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Cloud,
  Copy,
  Check,
  ExternalLink,
  HelpCircle,
  X,
  Smartphone,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const {
    signInWithGoogle,
    signInWithGoogleRedirect,
    signInAsLocalBusiness,
    loading,
    error,
    clearError,
    currentOrigin,
    oAuthClientId,
    projectId,
  } = useAuth();

  const [isOriginModalOpen, setIsOriginModalOpen] = useState(false);
  const [copiedOrigin, setCopiedOrigin] = useState(false);
  const [copiedClientId, setCopiedClientId] = useState(false);

  const handleCopyOrigin = () => {
    if (currentOrigin) {
      navigator.clipboard.writeText(currentOrigin);
      setCopiedOrigin(true);
      setTimeout(() => setCopiedOrigin(false), 2000);
    }
  };

  const handleCopyClientId = () => {
    if (oAuthClientId) {
      navigator.clipboard.writeText(oAuthClientId);
      setCopiedClientId(true);
      setTimeout(() => setCopiedClientId(false), 2000);
    }
  };

  const cloudConsoleUrl = `https://console.cloud.google.com/apis/credentials?project=${encodeURIComponent(
    projectId || 'carbide-generator-svr20'
  )}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-slate-50 to-white flex flex-col justify-between p-4 sm:p-6 text-slate-800">
      {/* Top Branding Section */}
      <div className="w-full max-w-md mx-auto pt-6 sm:pt-8 flex flex-col items-center text-center">
        {/* App Logo Emblem */}
        <div className="relative mb-3">
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
        <p className="text-xs text-slate-500 mt-1.5 max-w-xs leading-relaxed">
          Cloud-synchronized business ledger. Record daily cash-in, cash-out, and generate customer statements.
        </p>
      </div>

      {/* Center Action Card */}
      <div className="w-full max-w-md mx-auto my-3 bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/70 border border-slate-100 flex flex-col items-center">
        <div className="w-full text-center mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-[#0288D1] text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Google Account Authentication</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">Sign in to your Ledger</h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Secure login protects your shop's accounts and syncs data to Google Cloud.
          </p>
        </div>

        {/* Error Alert with 1-click Origin Fix Trigger */}
        {error && (
          <div className="w-full mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <div>
                  <p className="font-bold text-rose-900">Sign-In Notice</p>
                  <p className="mt-0.5 text-rose-700 leading-relaxed font-mono text-[11px] break-all">
                    {error}
                  </p>
                </div>
              </div>
              <button
                onClick={clearError}
                className="text-rose-400 hover:text-rose-700 font-bold px-1 text-base cursor-pointer"
                title="Dismiss"
              >
                ×
              </button>
            </div>

            {(error.includes('origin_mismatch') || error.includes('Unauthorized Domain') || error.includes('400')) && (
              <button
                onClick={() => setIsOriginModalOpen(true)}
                className="w-full py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Fix Error 400: origin_mismatch (Guide)</span>
              </button>
            )}
          </div>
        )}

        {/* Primary Action Button: Sign In with Google */}
        <button
          onClick={signInWithGoogle}
          disabled={loading}
          className="w-full min-h-[50px] py-3 px-4 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 border-2 border-slate-300 hover:border-[#0288D1] rounded-2xl font-bold text-sm shadow-xs flex items-center justify-center gap-3 transition-all duration-150 disabled:opacity-60 cursor-pointer"
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
          <span>{loading ? 'Connecting to Google...' : 'Continue with Google Account'}</span>
        </button>

        {/* Secondary: Android TWA / Redirect fallback */}
        <div className="w-full mt-3 flex items-center justify-between text-xs text-slate-500">
          <button
            type="button"
            onClick={signInWithGoogleRedirect}
            className="text-[11px] text-[#0288D1] hover:underline font-semibold flex items-center gap-1"
          >
            <Smartphone className="w-3.5 h-3.5" /> Mobile Browser Redirect Flow
          </button>

          <button
            type="button"
            onClick={() => setIsOriginModalOpen(true)}
            className="text-[11px] text-amber-700 hover:underline font-semibold flex items-center gap-1"
          >
            <HelpCircle className="w-3.5 h-3.5" /> Origin 400 Help
          </button>
        </div>

        {/* Instant Local Ledger Bypass (So APK testing is never blocked) */}
        <div className="w-full mt-4 pt-3 border-t border-slate-100 flex flex-col items-center">
          <button
            type="button"
            onClick={() => signInAsLocalBusiness('My Business')}
            className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Continue as Local Shop (Instant Offline Access)</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
          <span className="text-[10px] text-slate-400 mt-1">
            Lets you test full cash book features immediately on Android
          </span>
        </div>

        {/* Automatic Cloud Sync Note */}
        <div className="w-full mt-4 p-3 rounded-xl bg-sky-50/70 border border-sky-100 flex items-center gap-2.5 text-xs text-sky-900">
          <Cloud className="w-4 h-4 text-[#0288D1] shrink-0" />
          <span className="text-[11px] leading-tight">
            Transactions save offline on your phone and sync instantly to Firestore upon sign-in.
          </span>
        </div>
      </div>

      {/* Footer Trust & Security Note */}
      <div className="w-full max-w-md mx-auto text-center pb-2">
        <div className="inline-flex items-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Protected with Google Cloud Firestore</span>
        </div>
      </div>

      {/* GOOGLE CLOUD ORIGIN_MISMATCH HELPER MODAL */}
      {isOriginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-amber-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-600 to-amber-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base">Fix Error 400: origin_mismatch</h3>
                  <p className="text-[11px] text-amber-100">
                    Google OAuth 2.0 Origin Authorization Guide
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOriginModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs text-slate-700">
              <p className="leading-relaxed">
                Google blocks sign-in with <strong>origin_mismatch</strong> if the exact web domain loading your app is not listed in your Google Cloud Console OAuth Client.
              </p>

              {/* Step 1: Copy Current Origin */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Step 1: Your App's Exact Origin URI
                </span>
                <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="font-mono text-xs text-slate-900 font-bold truncate flex-1 select-all">
                    {currentOrigin || window.location.origin}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyOrigin}
                    className="px-2.5 py-1.5 bg-[#0288D1] hover:bg-sky-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 transition-colors"
                  >
                    {copiedOrigin ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedOrigin ? 'Copied' : 'Copy URI'}</span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">
                  Copy this exact URI. It must be added to your Google Cloud Console.
                </p>
              </div>

              {/* Step 2: Open Google Cloud Console */}
              <div className="p-3.5 bg-sky-50/70 border border-sky-200 rounded-2xl space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800 block">
                  Step 2: Add to Google Cloud Console Credentials
                </span>
                <div className="space-y-1.5 text-xs text-sky-950 leading-relaxed">
                  <p>1. Open Google Cloud Console: <strong>APIs &amp; Services &gt; Credentials</strong>.</p>
                  <p>2. Under <strong>OAuth 2.0 Client IDs</strong>, click on your Web Client ID:</p>
                  <div className="flex items-center gap-2 bg-white/90 p-2 rounded-lg border border-sky-200 font-mono text-[11px] text-slate-800">
                    <span className="truncate flex-1">{oAuthClientId}</span>
                    <button
                      onClick={handleCopyClientId}
                      className="text-sky-700 hover:text-sky-900 p-0.5"
                      title="Copy Client ID"
                    >
                      {copiedClientId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p>3. Under <strong>Authorized JavaScript origins</strong>, click <strong>+ ADD URI</strong> and paste your copied Origin.</p>
                  <p>4. Under <strong>Authorized redirect URIs</strong>, add:</p>
                  <div className="bg-white/90 p-2 rounded-lg border border-sky-200 font-mono text-[10px] text-slate-700 space-y-1">
                    <div>https://carbide-generator-svr20.firebaseapp.com/__/auth/handler</div>
                    <div>{currentOrigin}/__/auth/handler</div>
                  </div>
                  <p>5. Click <strong>SAVE</strong> at the bottom of the page.</p>
                </div>

                <a
                  href={cloudConsoleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex w-full py-2.5 px-3 bg-[#0288D1] hover:bg-sky-600 text-white rounded-xl text-xs font-bold items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Google Cloud Console Credentials</span>
                </a>
              </div>

              {/* Step 3: Firebase Authorized Domains */}
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-1.5 text-emerald-950">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">
                  Step 3: Firebase Authorized Domains
                </span>
                <p className="text-xs leading-relaxed">
                  Also make sure <strong>{window.location.hostname}</strong> is added in <strong>Firebase Console &gt; Authentication &gt; Settings &gt; Authorized Domains</strong>.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">Takes 2-5 mins to propagate globally</span>
              <button
                onClick={() => setIsOriginModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
