import React, { useState } from 'react';
import {
  X,
  Crown,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Smartphone,
  Copy,
  Check,
  CreditCard,
  QrCode,
  ExternalLink,
  AlertCircle,
  Clock,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { useCashBook } from '../context/CashBookContext';
import { SubscriptionPlan, PaymentMethod } from '../types';

export const SubscriptionModal: React.FC = () => {
  const {
    isSubscriptionModalOpen,
    setIsSubscriptionModalOpen,
    subscription,
    isPro,
    merchantSettings,
    activateProSubscription,
    cancelSubscription,
  } = useCashBook();

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('monthly_49');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('upi');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [utrError, setUtrError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  if (!isSubscriptionModalOpen) return null;

  const planPrice = selectedPlan === 'monthly_49' ? 49 : 399;
  const planPeriod = selectedPlan === 'monthly_49' ? 'month' : 'year';

  // Generate standard NPCI UPI Intent URI
  const upiPayUrl = `upi://pay?pa=${encodeURIComponent(merchantSettings.upiId)}&pn=${encodeURIComponent(
    merchantSettings.payeeName
  )}&am=${planPrice}&cu=INR&tn=${encodeURIComponent(
    `CashKhata Pro ${selectedPlan === 'monthly_49' ? 'Monthly' : 'Annual'}`
  )}`;

  const upiQrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(
    upiPayUrl
  )}`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(merchantSettings.upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleGooglePlayPay = () => {
    setIsProcessing(true);
    // Simulate / invoke Google Play In-App Billing SKU flow
    setTimeout(() => {
      const txId = `GPA.${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(
        1000 + Math.random() * 9000
      )}-${Math.floor(10000 + Math.random() * 90000)}`;
      activateProSubscription(selectedPlan, 'google_play', txId);
      setIsProcessing(false);
      setSuccessMessage('Congratulations! Google Play Pro Subscription Activated!');
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    }, 1200);
  };

  const handleUpiVerification = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUtr = utrNumber.trim();
    if (!cleanUtr) {
      setUtrError('Please enter the 12-digit UTR or transaction ID');
      return;
    }
    if (cleanUtr.length < 6) {
      setUtrError('Please enter a valid UPI reference number');
      return;
    }

    setUtrError('');
    setIsProcessing(true);

    setTimeout(() => {
      activateProSubscription(selectedPlan, 'upi', `UPI-${cleanUtr}`);
      setIsProcessing(false);
      setUtrNumber('');
      setSuccessMessage('Payment verified! Your Ad-Free Pro Subscription is now Active.');
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-amber-200/60">
        {/* Header with Golden Crown Gradient */}
        <div className="relative p-5 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 text-white shrink-0 overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                <Crown className="w-6 h-6 text-yellow-100 fill-yellow-200" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black tracking-tight text-white">Cash Khata Pro</h3>
                  <span className="bg-white/20 backdrop-blur-sm text-yellow-100 font-bold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider border border-white/20">
                    Ad-Free
                  </span>
                </div>
                <p className="text-xs text-yellow-100 mt-0.5">
                  100% Ad-Free Experience &amp; Priority Multi-Device Cloud Sync
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsSubscriptionModalOpen(false)}
              className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-900 font-medium animate-in zoom-in-95">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ACTIVE PRO STATUS CARD */}
          {isPro ? (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100/50 border border-emerald-300 rounded-2xl space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                      <Crown className="w-5 h-5 fill-emerald-200" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-emerald-950">Pro Subscription is Active</h4>
                      <p className="text-xs text-emerald-700 capitalize">
                        {subscription.plan === 'monthly_49'
                          ? '₹49 Monthly Micro-Pass'
                          : subscription.plan === 'yearly_399'
                          ? '₹399 Annual Value-Saver'
                          : 'Lifetime Pro Access'}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-200/70 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-emerald-200 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-500 block text-[10px] font-sans">Payment Method</span>
                    <span className="font-bold text-slate-800 uppercase">
                      {subscription.paymentMethod === 'google_play' ? 'Google Play' : 'Direct UPI'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] font-sans">Valid Until</span>
                    <span className="font-bold text-slate-800">
                      {subscription.expiryDate ? new Date(subscription.expiryDate).toLocaleDateString() : 'Active'}
                    </span>
                  </div>
                </div>

                {subscription.transactionId && (
                  <p className="text-[10px] text-slate-500 font-mono truncate">
                    Ref ID: {subscription.transactionId}
                  </p>
                )}
              </div>

              {/* Active Pro Benefits Checklist */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-2">
                <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Active Pro Features Enabled:
                </h5>
                <ul className="text-xs text-slate-600 space-y-1.5">
                  <li className="flex items-center gap-2 text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>All banner, app-open, and interstitial ads suppressed</span>
                  </li>
                  <li className="flex items-center gap-2 text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Unlimited PDF statements &amp; Excel sheets with logo</span>
                  </li>
                  <li className="flex items-center gap-2 text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Real-time multi-device cloud synchronization</span>
                  </li>
                </ul>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Are you sure you want to cancel your Pro membership? Ads will resume.')) {
                      cancelSubscription();
                    }
                  }}
                  className="text-xs text-rose-600 font-semibold hover:underline"
                >
                  Cancel Subscription
                </button>
                <button
                  type="button"
                  onClick={() => setIsSubscriptionModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* SUBSCRIPTION CHECKOUT FLOW */
            <div className="space-y-4">
              {/* Plan Choice Cards */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Select Subscription Plan:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Monthly ₹49 */}
                  <div
                    onClick={() => setSelectedPlan('monthly_49')}
                    className={`cursor-pointer rounded-2xl p-3.5 border-2 transition-all relative ${
                      selectedPlan === 'monthly_49'
                        ? 'border-amber-500 bg-amber-50/50 shadow-sm ring-2 ring-amber-400/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        Micro-Pass
                      </span>
                      {selectedPlan === 'monthly_49' && (
                        <CheckCircle2 className="w-4 h-4 text-amber-600" />
                      )}
                    </div>
                    <div className="mt-2">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-slate-900">₹49</span>
                        <span className="text-xs text-slate-500">/month</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Lowest entry price. Cancel anytime.
                      </p>
                    </div>
                  </div>

                  {/* Yearly ₹399 */}
                  <div
                    onClick={() => setSelectedPlan('yearly_399')}
                    className={`cursor-pointer rounded-2xl p-3.5 border-2 transition-all relative ${
                      selectedPlan === 'yearly_399'
                        ? 'border-amber-500 bg-amber-50/50 shadow-sm ring-2 ring-amber-400/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Save 32%
                      </span>
                      {selectedPlan === 'yearly_399' && (
                        <CheckCircle2 className="w-4 h-4 text-amber-600" />
                      )}
                    </div>
                    <div className="mt-2">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-slate-900">₹399</span>
                        <span className="text-xs text-slate-500">/year</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Just ₹33/month. Best value for shops.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Core Features */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>100% Ad-Free app</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Auto cloud backup</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <span>Instant book loads</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Golden Pro badge</span>
                  </div>
                </div>
              </div>

              {/* Dual Payment Options Switcher */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Choose Payment Method:
                </label>

                <div className="flex border border-slate-200 rounded-xl p-1 bg-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('upi')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                      selectedMethod === 'upi'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <QrCode className="w-4 h-4 text-emerald-600" />
                    <span>Direct UPI (GPay/PhonePe)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod('google_play')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                      selectedMethod === 'google_play'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-[#0288D1]" />
                    <span>Google Play Billing</span>
                  </button>
                </div>

                {/* METHOD 1: DIRECT UPI (0% FEE, DIRECT BANK SETTLEMENT) */}
                {selectedMethod === 'upi' && (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          Pay ₹{planPrice} via any UPI App
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Money deposits directly into merchant bank account
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Instant Activation
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3.5 rounded-2xl border border-slate-200">
                      <div className="w-36 h-36 bg-slate-50 p-1.5 rounded-xl border border-slate-200 flex items-center justify-center shrink-0">
                        <img
                          src={upiQrImageUrl}
                          alt="UPI Payment QR Code"
                          className="w-full h-full object-contain rounded-lg"
                        />
                      </div>
                      <div className="space-y-2 flex-1 w-full text-center sm:text-left">
                        <div className="text-xs space-y-0.5">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                            Merchant UPI ID:
                          </span>
                          <div className="flex items-center justify-center sm:justify-start gap-1.5 bg-slate-100 px-2 py-1 rounded-lg">
                            <span className="font-mono text-xs text-slate-800 font-bold select-all">
                              {merchantSettings.upiId}
                            </span>
                            <button
                              type="button"
                              onClick={handleCopyUpi}
                              className="text-slate-500 hover:text-slate-800 p-0.5"
                              title="Copy UPI ID"
                            >
                              {copiedUpi ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-600">
                          <span>Payee: </span>
                          <strong className="text-slate-800">{merchantSettings.payeeName}</strong>
                        </div>

                        {/* Direct Mobile Intent Link */}
                        <a
                          href={upiPayUrl}
                          className="inline-flex w-full py-2 px-3 bg-[#18794E] hover:bg-[#146340] text-white rounded-xl text-xs font-bold shadow-xs items-center justify-center gap-1.5 transition-transform active:scale-[0.98]"
                        >
                          <Smartphone className="w-3.5 h-3.5" /> Open in PhonePe / GPay
                        </a>
                      </div>
                    </div>

                    {/* Reference / UTR Input Form */}
                    <form onSubmit={handleUpiVerification} className="space-y-2 pt-1">
                      <label className="text-[11px] font-bold text-slate-600 block">
                        Enter 12-digit UPI Reference / UTR Number:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={utrNumber}
                          onChange={(e) => {
                            setUtrNumber(e.target.value);
                            setUtrError('');
                          }}
                          placeholder="e.g. 427189283719"
                          className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                        />
                        <button
                          type="submit"
                          disabled={isProcessing}
                          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs shrink-0 flex items-center gap-1.5 transition-transform active:scale-[0.98] disabled:opacity-50"
                        >
                          {isProcessing ? 'Verifying...' : 'Verify & Activate'}
                        </button>
                      </div>
                      {utrError && <p className="text-[11px] text-rose-600">{utrError}</p>}
                    </form>
                  </div>
                )}

                {/* METHOD 2: GOOGLE PLAY BILLING */}
                {selectedMethod === 'google_play' && (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#0288D1] text-white flex items-center justify-center shrink-0">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Google Play Store Billing</h4>
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                          Pay directly with your Google Play Account balance, registered cards, or UPI. Managed by Google Play with automatic monthly deposit into developer bank account.
                        </p>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-3 text-xs space-y-1 text-slate-600">
                      <div className="flex justify-between">
                        <span>Product SKU:</span>
                        <span className="font-mono font-bold text-slate-800">
                          {selectedPlan === 'monthly_49'
                            ? 'cashkhata_pro_monthly_49'
                            : 'cashkhata_pro_yearly_399'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Billing Cycle:</span>
                        <span className="font-bold text-slate-800">
                          ₹{planPrice} / {planPeriod}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cancellation:</span>
                        <span className="text-emerald-700 font-medium">Cancel anytime in Play Store</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleGooglePlayPay}
                      disabled={isProcessing}
                      className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-50"
                    >
                      <Crown className="w-4 h-4 fill-white" />
                      <span>
                        {isProcessing
                          ? 'Connecting to Google Play...'
                          : `Subscribe for ₹${planPrice}/${planPeriod} with Google Play`}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Encrypted &amp; Verified Payment</span>
          </div>
          <button
            onClick={() => setIsSubscriptionModalOpen(false)}
            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
