import React, { useState, useEffect } from 'react';
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
  Flame,
  Mail,
  KeyRound,
  UserPlus,
  LogIn,
  Info,
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const {
    signInWithGoogle,
    signInWithGoogleRedirect,
    signInWithEmail,
    signUpWithEmail,
    signInAsLocalBusiness,
    loading,
    error,
    clearError,
    currentOrigin,
    hostname,
    oAuthClientId,
    projectId,
  } = useAuth();

  // Detect Android environment or local origin
  const [isAndroidApk, setIsAndroidApk] = useState(false);
  const [activeTab, setActiveTab] = useState<'email' | 'google'>('email');

  useEffect(() => {
    const isAndroid =
      typeof navigator !== 'undefined' &&
      (/android/i.test(navigator.userAgent) ||
        window.location.protocol === 'file:' ||
        window.location.origin.includes('localhost') ||
        window.location.origin === 'null');
    setIsAndroidApk(Boolean(isAndroid));
    // Default to email on Android to prevent origin_mismatch blocker
    if (isAndroid) {
      setActiveTab('email');
    }
  }, []);

  // Modals state
  const [isOriginModalOpen, setIsOriginModalOpen] = useState(false);
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);

  // Copy state
  const [copiedOrigin, setCopiedOrigin] = useState(false);
  const [copiedAllOrigins, setCopiedAllOrigins] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [copiedClientId, setCopiedClientId] = useState(false);

  // Email form state
  const [emailMode, setEmailMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');

  const cleanOrigin = (currentOrigin || window.location.origin).replace(/\/+$/, '');

  const allOriginsToRegister = [
    cleanOrigin,
    'http://localhost',
    'https://localhost',
    'https://ais-pre-yn5pphds2d2fhlcszl6lrq-79975215899.asia-east1.run.app',
    'https://ais-dev-yn5pphds2d2fhlcszl6lrq-79975215899.asia-east1.run.app',
  ].filter((v, i, a) => a.indexOf(v) === i);

  const handleCopyOrigin = () => {
    navigator.clipboard.writeText(cleanOrigin);
    setCopiedOrigin(true);
    setTimeout(() => setCopiedOrigin(false), 2000);
  };

  const handleCopyAllOrigins = () => {
    navigator.clipboard.writeText(allOriginsToRegister.join('\n'));
    setCopiedAllOrigins(true);
    setTimeout(() => setCopiedAllOrigins(false), 2000);
  };

  const handleCopyDomain = () => {
    if (hostname) {
      navigator.clipboard.writeText(hostname);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2000);
    }
  };

  const handleCopyClientId = () => {
    if (oAuthClientId) {
      navigator.clipboard.writeText(oAuthClientId);
      setCopiedClientId(true);
      setTimeout(() => setCopiedClientId(false), 2000);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    if (emailMode === 'signin') {
      await signInWithEmail(email.trim(), password);
    } else {
      await signUpWithEmail(email.trim(), password, businessName.trim() || undefined);
    }
  };

  const cloudConsoleUrl = `https://console.cloud.google.com/apis/credentials?project=${encodeURIComponent(
    projectId || 'carbide-generator-svr20'
  )}`;

  const firebaseAuthSettingsUrl = `https://console.firebase.google.com/project/${encodeURIComponent(
    projectId || 'carbide-generator-svr20'
  )}/authentication/settings`;

  const isUnauthorizedDomain = error?.includes('Unauthorized Domain') || error?.includes('unauthorized-domain');
  const isOriginMismatch = error?.includes('origin_mismatch') || error?.includes('400');

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-slate-50 to-white flex flex-col justify-between p-4 sm:p-6 text-slate-800">
      {/* Top Branding Section */}
      <div className="w-full max-w-md mx-auto pt-4 sm:pt-6 flex flex-col items-center text-center">
        {/* App Logo Emblem */}
        <div className="relative mb-2.5">
          <img
            src="/app-icon.png"
            alt="Cash Khata"
            className="w-18 h-18 rounded-3xl object-cover shadow-xl shadow-emerald-900/15 border-2 border-white"
          />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-xl bg-emerald-600 border-2 border-white flex items-center justify-center text-white shadow-xs">
            <Lock className="w-3 h-3 stroke-[2.5]" />
          </div>
        </div>

        <h1 className="text-2xl font-black tracking-tight text-slate-900">Cash Khata</h1>
        <p className="text-xs font-bold text-[#0288D1] tracking-wider uppercase mt-0.5">
          Vyapar Ledger &amp; Cash Book
        </p>
        <p className="text-[11px] text-slate-500 mt-1 max-w-xs leading-relaxed">
          Cloud-synchronized business ledger for Indian shopkeepers &amp; traders.
        </p>
      </div>

      {/* Center Action Card */}
      <div className="w-full max-w-md mx-auto my-3 bg-white rounded-3xl p-5 sm:p-7 shadow-xl shadow-slate-200/70 border border-slate-100 flex flex-col items-center">
        {/* Auth Method Selector Tabs */}
        <div className="w-full grid grid-cols-2 p-1 bg-slate-100 rounded-2xl mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('email')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'email'
                ? 'bg-white text-[#0288D1] shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email &amp; Password</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('google')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'google'
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
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
            <span>Google Sign-In</span>
          </button>
        </div>

        {/* Error Alert with 1-click Fix Trigger */}
        {error && (
          <div className="w-full mb-3.5 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex flex-col gap-2">
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

            {isOriginMismatch && (
              <button
                onClick={() => setIsOriginModalOpen(true)}
                className="w-full py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Fix Error 400 in Google Cloud Console (Checklist)</span>
              </button>
            )}

            {isUnauthorizedDomain && (
              <button
                onClick={() => setIsFirebaseModalOpen(true)}
                className="w-full py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Fix Unauthorized Domain in Firebase Console</span>
              </button>
            )}
          </div>
        )}

        {/* TAB 1: EMAIL & PASSWORD (RELIABLE FOR ANDROID APK) */}
        {activeTab === 'email' && (
          <div className="w-full space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                100% Reliable Cloud Access
              </span>
              <div className="flex gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setEmailMode('signin')}
                  className={`pb-1 transition-colors cursor-pointer ${
                    emailMode === 'signin'
                      ? 'text-[#0288D1] border-b-2 border-[#0288D1]'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setEmailMode('signup')}
                  className={`pb-1 transition-colors cursor-pointer ${
                    emailMode === 'signup'
                      ? 'text-[#0288D1] border-b-2 border-[#0288D1]'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Create Account
                </button>
              </div>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-2.5">
              {emailMode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">
                    Shop / Owner Name
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Verma Traders"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#0288D1] focus:bg-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@example.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#0288D1] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#0288D1] focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[46px] py-2.5 px-3 bg-[#0288D1] hover:bg-sky-600 active:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-60"
              >
                {emailMode === 'signin' ? (
                  <>
                    <LogIn className="w-3.5 h-3.5" />
                    <span>{loading ? 'Signing in...' : 'Sign In with Email'}</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{loading ? 'Creating...' : 'Register & Start Ledger'}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: GOOGLE SIGN-IN */}
        {activeTab === 'google' && (
          <div className="w-full space-y-3 animate-in fade-in duration-150">
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
              <span>{loading ? 'Connecting...' : 'Continue with Google Account'}</span>
            </button>

            <div className="flex items-center justify-center text-[11px] text-slate-500 pt-1">
              <button
                type="button"
                onClick={signInWithGoogleRedirect}
                className="text-[#0288D1] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5" /> Mobile Browser Redirect Flow
              </button>
            </div>
          </div>
        )}

        {/* Instant Offline Access Button */}
        <div className="w-full mt-4 pt-3 border-t border-slate-100 flex flex-col items-center">
          <button
            type="button"
            onClick={() => signInAsLocalBusiness('My Business')}
            className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Continue as Local Shop (Instant Offline Access)</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
          <span className="text-[10px] text-slate-400 mt-1">
            Zero sign-in setup needed to test all cash book features
          </span>
        </div>

        {/* Automatic Cloud Sync Note */}
        <div className="w-full mt-3.5 p-2.5 rounded-xl bg-sky-50/70 border border-sky-100 flex items-center gap-2 text-xs text-sky-900">
          <Cloud className="w-3.5 h-3.5 text-[#0288D1] shrink-0" />
          <span className="text-[11px] leading-tight">
            Data saves offline on your device and syncs instantly to Firestore when online.
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

      {/* GOOGLE CLOUD ORIGIN_MISMATCH DIAGNOSTIC MODAL */}
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
                  <h3 className="font-bold text-sm sm:text-base">Google Cloud Console Origin Diagnostic</h3>
                  <p className="text-[11px] text-amber-100">
                    Why Error 400 origin_mismatch occurs on Android APK
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOriginModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs text-slate-700">
              {/* Critical Rule Warning */}
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl text-amber-900 text-xs space-y-1">
                <p className="font-bold flex items-center gap-1 text-amber-800">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  Why Downloaded Android APK Shows 400
                </p>
                <p className="leading-relaxed text-[11px]">
                  When you download and run an Android APK, the app runs from an internal local server (like <code>http://localhost</code> or <code>https://localhost</code>), NOT the web domain! Google blocks this unless you add <code>http://localhost</code> to your Google Cloud Console Web Client ID.
                </p>
              </div>

              {/* Step 1: Copy All Origins */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    All Required Origins for Android &amp; Web
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyAllOrigins}
                    className="px-2.5 py-1 bg-[#0288D1] hover:bg-sky-600 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedAllOrigins ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedAllOrigins ? 'Copied All' : 'Copy All URIs'}</span>
                  </button>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-slate-200 font-mono text-[11px] space-y-1 text-slate-800">
                  {allOriginsToRegister.map((uri) => (
                    <div key={uri} className="flex items-center justify-between">
                      <span>{uri}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400">
                  Add each of these under <strong>Authorized JavaScript origins</strong> in Google Cloud Console. Strictly NO trailing slash!
                </p>
              </div>

              {/* Step 2: Open Google Cloud Console */}
              <div className="p-3.5 bg-sky-50/70 border border-sky-200 rounded-2xl space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800 block">
                  Step 2: Google Cloud Console Credentials
                </span>
                <div className="space-y-1.5 text-xs text-sky-950 leading-relaxed">
                  <p>1. Open Google Cloud Project: <strong>carbide-generator-svr20</strong>.</p>
                  <p>2. Go to <strong>APIs &amp; Services &gt; Credentials</strong>.</p>
                  <p>3. Edit your <strong>Web client</strong>:</p>
                  <div className="flex items-center gap-2 bg-white/90 p-2 rounded-lg border border-sky-200 font-mono text-[11px] text-slate-800">
                    <span className="truncate flex-1">{oAuthClientId}</span>
                    <button
                      onClick={handleCopyClientId}
                      className="text-sky-700 hover:text-sky-900 p-0.5 cursor-pointer"
                      title="Copy Client ID"
                    >
                      {copiedClientId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p>4. Under <strong>Authorized JavaScript origins</strong>, click <strong>+ ADD URI</strong> and paste:</p>
                  <div className="p-2 bg-white rounded-lg border border-sky-200 font-mono text-[11px] text-slate-800 space-y-1">
                    <div>http://localhost</div>
                    <div>https://localhost</div>
                    <div>{cleanOrigin}</div>
                  </div>
                  <p>5. Click <strong>SAVE</strong>.</p>
                </div>

                <a
                  href={cloudConsoleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex w-full py-2.5 px-3 bg-[#0288D1] hover:bg-sky-600 text-white rounded-xl text-xs font-bold items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Google Cloud Credentials</span>
                </a>
              </div>

              {/* Instant Alternative: Email Login */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs space-y-1">
                <p className="font-bold flex items-center gap-1 text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Instant Bypass: Use Email &amp; Password
                </p>
                <p className="text-[11px] leading-relaxed">
                  Email &amp; Password sign-in bypasses all Google Cloud origin policies completely. You can register and use the app on Android immediately!
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">Wait 5 mins after saving in Google Cloud</span>
              <button
                onClick={() => setIsOriginModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FIREBASE AUTHORIZED DOMAINS MODAL */}
      {isFirebaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-amber-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-600 to-orange-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
                  <Flame className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base">Authorize Domain in Firebase Console</h3>
                  <p className="text-[11px] text-amber-100">
                    Fixes auth/unauthorized-domain error
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFirebaseModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs text-slate-700">
              <p className="leading-relaxed">
                Firebase Authentication requires every domain that launches Google Sign-In to be added to your project's <strong>Authorized domains</strong> list.
              </p>

              {/* Step 1: Copy Hostname */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Step 1: Copy Your Domain Hostname
                </span>
                <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="font-mono text-xs text-slate-900 font-bold truncate flex-1 select-all">
                    {hostname || window.location.hostname}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyDomain}
                    className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                  >
                    {copiedDomain ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedDomain ? 'Copied' : 'Copy Hostname'}</span>
                  </button>
                </div>
              </div>

              {/* Step 2: Open Firebase Console Settings */}
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block">
                  Step 2: Add in Firebase Console Settings
                </span>
                <div className="space-y-1.5 text-xs text-amber-950 leading-relaxed">
                  <p>1. Open Firebase Console: <strong>Authentication &gt; Settings &gt; Authorized domains</strong>.</p>
                  <p>2. Click <strong>Add domain</strong>.</p>
                  <p>3. Paste <code>{hostname || window.location.hostname}</code> and click <strong>Add</strong>.</p>
                </div>

                <a
                  href={firebaseAuthSettingsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex w-full py-2.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Firebase Console Settings</span>
                </a>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">Takes effect immediately</span>
              <button
                onClick={() => setIsFirebaseModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
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
