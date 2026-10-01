import React, { useState, useEffect } from 'react';
import {
  X,
  Share2,
  Download,
  Copy,
  Check,
  QrCode,
  Smartphone,
  ExternalLink,
  MessageCircle,
  FileCode2,
  CheckCircle2,
  Info,
  Sparkles,
  Send,
  ShieldCheck,
  Image as ImageIcon
} from 'lucide-react';

interface ShareAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareAppModal: React.FC<ShareAppModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'share' | 'apk' | 'install' | 'screenshots'>('share');
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

  const invitationMessage = `Hey! I built this "Cash Khata" (Vyapar Ledger & Cash Book) app. You can test and install it on your phone instantly here:\n\n${sharedUrl}\n\nPlease try it out and give me your valuable suggestions and feedback!`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(sharedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyInvitation = () => {
    navigator.clipboard.writeText(invitationMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(invitationMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Cash Khata - Vyapar Ledger',
          text: invitationMessage,
          url: sharedUrl,
        });
      } catch (err) {
        // user cancelled or share failed
      }
    } else {
      handleWhatsAppShare();
    }
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

  const handleOpenPwaBuilder = () => {
    const pwaBuilderUrl = `https://www.pwabuilder.com?site=${encodeURIComponent(sharedUrl)}`;
    window.open(pwaBuilderUrl, '_blank');
  };

  const handleDownloadConfigPackage = () => {
    const packageConfig = {
      packageId: "com.cashkhata.vyaparledger",
      name: "Cash Khata - Vyapar Ledger & Cash Book",
      shortName: "Cash Khata",
      version: "1.0.0",
      startUrl: sharedUrl,
      themeColor: "#0288D1",
      backgroundColor: "#0288D1",
      display: "standalone",
      dataIsolation: "Strict local SQLite/Room device sandbox. 0 cloud leakage.",
      generatedAt: new Date().toISOString(),
      instructions: [
        "1. Open PWABuilder.com and paste your app URL.",
        "2. Click 'Package for Android'.",
        "3. Download the signed APK / AAB package directly.",
        "4. Sideload the APK on Android phones or upload AAB to Google Play Console."
      ]
    };

    const blob = new Blob([JSON.stringify(packageConfig, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cash-khata-android-config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
        {/* Header */}
        <div className="bg-[#0288D1] text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shadow-xs">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Share App &amp; Download APK</h3>
              <p className="text-xs text-sky-100">Send to friends &amp; generate installable Android package</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 shrink-0 px-3 pt-2 gap-1">
          <button
            onClick={() => setActiveTab('share')}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
              activeTab === 'share'
                ? 'bg-white text-[#0288D1] border-[#0288D1] shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>1. Share with Friends</span>
          </button>

          <button
            onClick={() => setActiveTab('apk')}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
              activeTab === 'apk'
                ? 'bg-white text-[#0288D1] border-[#0288D1] shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <Download className="w-4 h-4 text-sky-600" />
            <span>2. Download APK</span>
          </button>

          <button
            onClick={() => setActiveTab('install')}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
              activeTab === 'install'
                ? 'bg-white text-[#0288D1] border-[#0288D1] shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <Smartphone className="w-4 h-4 text-purple-600" />
            <span>3. How to Install</span>
          </button>

          <button
            onClick={() => setActiveTab('screenshots')}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 shrink-0 ${
              activeTab === 'screenshots'
                ? 'bg-white text-[#0288D1] border-[#0288D1] shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-emerald-600" />
            <span>4. Store Screenshots</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* TAB 1: SHARE WITH FRIENDS */}
          {activeTab === 'share' && (
            <div className="space-y-4">
              {/* WhatsApp & Native Share Action Banner */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-600" /> Share Invitation with Friends
                    </h4>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      Friends can open this link on Android or iPhone to install the app with 1 tap.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={handleWhatsAppShare}
                    className="flex-1 min-w-[140px] py-2.5 px-3 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" /> Share on WhatsApp
                  </button>

                  <button
                    onClick={handleNativeShare}
                    className="flex-1 min-w-[140px] py-2.5 px-3 bg-[#0288D1] hover:bg-sky-600 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
                  >
                    <Share2 className="w-4 h-4" /> Share via Other Apps
                  </button>
                </div>
              </div>

              {/* QR Code and Direct URL */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
                <div className="w-36 h-36 bg-white p-2 rounded-2xl shadow-xs border border-slate-200 flex items-center justify-center shrink-0">
                  <img
                    src={qrImageUrl}
                    alt="QR Code for Cash Khata"
                    className="w-full h-full object-contain rounded-lg"
                  />
                </div>
                <div className="space-y-2 text-center sm:text-left flex-1 w-full">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Scan with Phone Camera
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Have your friend point their phone camera at this QR code. It will instantly launch Cash Khata in their browser with an "Install App" prompt.
                  </p>
                  <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200">
                    <input
                      type="text"
                      readOnly
                      value={sharedUrl}
                      className="bg-transparent text-xs text-slate-700 font-mono flex-1 outline-none px-2 select-all truncate"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 transition-colors shadow-2xs"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Preview Message */}
              <div className="border border-slate-200 rounded-xl p-3 bg-white space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Invitation Text Preview:
                  </span>
                  <button
                    onClick={handleCopyInvitation}
                    className="text-xs text-[#0288D1] font-semibold hover:underline flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> Copy Text
                  </button>
                </div>
                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 whitespace-pre-line font-sans leading-relaxed">
                  {invitationMessage}
                </p>
              </div>

              {/* Data Isolation Notice */}
              <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl flex items-start gap-2.5 text-xs text-sky-900">
                <ShieldCheck className="w-4 h-4 text-[#0288D1] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>100% Device Data Isolation:</strong> When your friends install this, their app starts completely empty with 0 Cash Books. Your personal books and numbers will never appear on their phones.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: DOWNLOAD APK & PLAY STORE BUNDLE */}
          {activeTab === 'apk' && (
            <div className="space-y-4">
              {/* Primary: Android Studio Project (.ZIP) - 100% Reliable for Google Play */}
              <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/60 border border-emerald-300 rounded-2xl p-4 space-y-3 shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">Google Play Ready Android Project (.ZIP)</h4>
                      <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                        Recommended
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                      Pre-configured with your package (<code className="font-mono bg-white px-1 py-0.5 rounded text-[10px] text-emerald-900">com.cashkhata.vyaparledger</code>), official AdMob IDs, full mipmap icon sets, and Gradle 8.2. Generates signed <strong>.aab</strong> for Google Play and <strong>.apk</strong> for testing.
                    </p>
                  </div>
                </div>

                <div className="pt-1 flex flex-wrap gap-2">
                  <a
                    href="/CashKhata-Android-Project.zip"
                    download="CashKhata-Android-Project.zip"
                    className="flex-1 min-w-[200px] py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
                  >
                    <Download className="w-4 h-4 stroke-[2.5]" /> Download Android Studio Project (.ZIP)
                  </a>

                  <button
                    onClick={handleDownloadConfigPackage}
                    className="py-2.5 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-colors"
                  >
                    <FileCode2 className="w-4 h-4 text-slate-500" /> Config JSON
                  </button>
                </div>
              </div>

              {/* 3-Step Google Play AAB Guide */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-3">
                <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" /> How to build .AAB for Google Play:
                </h5>
                <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside pl-1 leading-relaxed">
                  <li>
                    <strong>Download &amp; Extract</strong> <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[11px]">CashKhata-Android-Project.zip</code> on your computer.
                  </li>
                  <li>
                    Open <strong>Android Studio</strong> &gt; click <strong>File &gt; Open...</strong> &gt; select the extracted folder.
                  </li>
                  <li>
                    Click menu <strong>Build &gt; Generate Signed Bundle / APK...</strong> &gt; select <strong>Android App Bundle (.aab)</strong>.
                  </li>
                  <li>
                    Create a keystore key (or select existing) &gt; click <strong>Create</strong>. Your signed <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[11px]">app-release.aab</code> is ready to upload to <strong>Google Play Console</strong>!
                  </li>
                  <li>
                    <em>To test on your phone:</em> Click <strong>Build &gt; Build APK(s)</strong> to get <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[11px]">app-debug.apk</code> and install directly!
                  </li>
                </ol>
              </div>

              {/* PWABuilder Web Host Notice */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5 space-y-2 text-xs text-amber-950">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Why does PWABuilder say "web host is blocking"?</p>
                    <p className="text-[11px] text-amber-900 mt-0.5 leading-relaxed">
                      AI Studio preview URLs are hosted on Google Cloud Run with anti-bot scraper protection that blocks external automated crawlers like PWABuilder. Using the <strong>Android Studio Project above</strong> completely bypasses all web host crawlers and builds the official package natively.
                    </p>
                  </div>
                </div>
              </div>

              {/* Technical Package Metadata */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1.5 text-slate-600">
                <div className="flex justify-between py-0.5 border-b border-slate-200 font-mono text-[11px]">
                  <span className="text-slate-500">Application ID:</span>
                  <span className="font-bold text-slate-800">com.cashkhata.vyaparledger</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-200 font-mono text-[11px]">
                  <span className="text-slate-500">App Name:</span>
                  <span className="font-bold text-slate-800">Cash Khata</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-200 font-mono text-[11px]">
                  <span className="text-slate-500">Display Mode:</span>
                  <span className="font-bold text-emerald-700">Standalone (Full Screen)</span>
                </div>
                <div className="flex justify-between py-0.5 font-mono text-[11px]">
                  <span className="text-slate-500">Local Storage:</span>
                  <span className="font-bold text-slate-800">Device-local Sandbox (Offline)</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HOW TO INSTALL ON PHONE */}
          {activeTab === 'install' && (
            <div className="space-y-4">
              {/* Direct Install Button if in Android Chrome */}
              {isInstallable && (
                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="font-bold text-xs text-emerald-950">Chrome Browser Detected</p>
                    <p className="text-[11px] text-emerald-700">Install directly onto your device right now</p>
                  </div>
                  <button
                    onClick={handleNativeInstall}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 stroke-[3]" /> Install App
                  </button>
                </div>
              )}

              {/* Sideloading APK on Android */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-3">
                <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-[#0288D1]" /> How to install an APK file on Android:
                </h5>
                <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside pl-1 leading-relaxed">
                  <li>
                    Send the <strong>.apk</strong> file to your friend via WhatsApp, Telegram, or Google Drive.
                  </li>
                  <li>
                    When your friend taps the <strong>.apk</strong> file, Android may show a prompt:  
                    <em className="text-slate-800 block my-1 pl-4 font-medium">"For your security, your phone is not allowed to install unknown apps from this source."</em>
                  </li>
                  <li>
                    Tell them to tap <strong>Settings</strong> and toggle on <strong>"Allow from this source"</strong>.
                  </li>
                  <li>
                    Tap <strong>Install</strong>. Cash Khata will be installed in their app drawer!
                  </li>
                </ol>
              </div>

              {/* Web/PWA Install alternative */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-2">
                <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Even Easier: 1-Tap Browser Install (No Security Prompts)
                </h5>
                <p className="text-xs text-slate-600 leading-relaxed">
                  If your friends don't want to enable "unknown apps" in Android settings, they can simply open your link in Chrome, tap <strong>"Install app"</strong> in Chrome's menu (⋮), and it installs instantly as a native app with zero warnings!
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: STORE SCREENSHOTS */}
          {activeTab === 'screenshots' && (
            <div className="space-y-4">
              {/* Top Download Pack Banner */}
              <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-sky-50 border border-emerald-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-emerald-600" /> Google Play &amp; App Store Screenshots
                    </h4>
                    <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                      All 5 high-resolution mobile screenshots (720x1280 portrait) are formatted, packaged, and linked in <code className="font-mono bg-emerald-100/80 px-1 py-0.5 rounded text-[11px]">manifest.json</code> for instant store access.
                    </p>
                  </div>
                </div>

                <div className="pt-1 flex flex-wrap gap-2">
                  <a
                    href="/CashKhata-PlayStore-Screenshots.zip"
                    download="CashKhata-PlayStore-Screenshots.zip"
                    className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-all active:scale-[0.98]"
                  >
                    <Download className="w-4 h-4" /> Download All 5 Screenshots (.ZIP)
                  </a>

                  <a
                    href="/manifest.json"
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-colors"
                  >
                    <FileCode2 className="w-4 h-4 text-slate-500" /> View manifest.json
                  </a>
                </div>
              </div>

              {/* Screenshots Gallery Grid */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Store Listing Previews (5 Assets)
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    {
                      title: '1. Daily Ledger Feed',
                      sub: 'Cash In/Out transaction stream',
                      src: '/screenshots/screenshot-1-ledger.jpg',
                    },
                    {
                      title: '2. Multi-Account Books',
                      sub: 'Multiple saved business khatas',
                      src: '/screenshots/screenshot-2-books.jpg',
                    },
                    {
                      title: '3. Export PDF & Excel',
                      sub: 'Genuine .pdf & .xlsx reports',
                      src: '/screenshots/screenshot-3-report.jpg',
                    },
                    {
                      title: '4. Printable Statement',
                      sub: 'Formal business statements',
                      src: '/screenshots/screenshot-4-pdf.jpg',
                    },
                    {
                      title: '5. Google Cloud Backup',
                      sub: 'Firestore multi-device sync',
                      src: '/screenshots/screenshot-5-login.jpg',
                    },
                  ].map((sc, idx) => (
                    <div
                      key={idx}
                      className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs flex flex-col group hover:border-[#0288D1] transition-colors"
                    >
                      <div className="aspect-[9/16] bg-slate-100 overflow-hidden relative">
                        <img
                          src={sc.src}
                          alt={sc.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                        <div className="min-w-0 pr-1">
                          <p className="text-[11px] font-bold text-slate-800 truncate">{sc.title}</p>
                          <p className="text-[9px] text-slate-500 truncate">{sc.sub}</p>
                        </div>
                        <a
                          href={sc.src}
                          download={`CashKhata-${sc.title.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`}
                          className="p-1 bg-white hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 shadow-2xs shrink-0"
                          title="Download screenshot"
                        >
                          <Download className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400 font-medium">
            Cash Khata v1.0.0 Pro
          </span>
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
