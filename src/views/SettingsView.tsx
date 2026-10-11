import React, { useState } from 'react';
import {
  ArrowLeft,
  Save,
  Building,
  Phone,
  MapPin,
  FileCheck,
  CheckCircle2,
  Crown,
  QrCode,
  CreditCard,
  ShieldCheck,
  Landmark,
  Sparkles,
} from 'lucide-react';
import { useCashBook } from '../context/CashBookContext';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    setActiveView,
    isPro,
    subscription,
    merchantSettings,
    updateMerchantSettings,
    setIsSubscriptionModalOpen,
  } = useCashBook();

  const [form, setForm] = useState({
    businessName: settings.businessName,
    ownerName: settings.ownerName,
    phone: settings.phone,
    address: settings.address,
    gstNumber: settings.gstNumber || '',
    signatureTitle: settings.signatureTitle || 'Authorized Signatory',
    showSignatureInPdf: settings.showSignatureInPdf ?? true,
    currencySymbol: settings.currencySymbol || '₹',
  });

  const [merchantForm, setMerchantForm] = useState({
    upiId: merchantSettings.upiId,
    payeeName: merchantSettings.payeeName,
  });

  const [saved, setSaved] = useState(false);
  const [merchantSaved, setMerchantSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleMerchantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMerchantSettings(merchantForm);
    setMerchantSaved(true);
    setTimeout(() => setMerchantSaved(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 pb-20">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-[#0288D1] text-white shadow-md">
        <div className="flex items-center justify-between px-3 h-14">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView('ledger')}
              className="p-2 -ml-1 text-white hover:bg-white/10 active:bg-white/20 rounded-full transition-colors"
              title="Back"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-bold">Settings</h2>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-xl mx-auto w-full space-y-4">
        {saved && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Settings saved successfully! PDF statements will use these updated details.</span>
          </div>
        )}

        {/* PRO / AD-FREE MEMBERSHIP CARD */}
        <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border border-amber-300 rounded-2xl p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 text-white flex items-center justify-center shadow-xs shrink-0">
                <Crown className="w-5 h-5 fill-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  Cash Khata Pro
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isPro ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {isPro ? 'Ad-Free Active' : 'Free Tier'}
                  </span>
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  {isPro
                    ? `Active on ${
                        subscription.plan === 'monthly_49' ? '₹49/month' : '₹399/year'
                      } plan. Zero ads displayed.`
                    : 'Upgrade to remove all ads and enable instant cloud backup.'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsSubscriptionModalOpen(true)}
              className="py-2 px-3.5 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white rounded-xl text-xs font-bold shadow-xs transition-transform active:scale-95 shrink-0"
            >
              {isPro ? 'Manage' : 'Go Ad-Free (₹49)'}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 space-y-4">
          <div className="border-b pb-2">
            <h3 className="font-bold text-slate-800 text-sm">Business &amp; PDF Header Profile</h3>
            <p className="text-xs text-slate-500">
              Appears on generated PDF statements and Excel exports
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-slate-400" /> Business / Shop Name *
            </label>
            <input
              type="text"
              required
              value={form.businessName}
              onChange={(e) => setForm({ ...form, businessName: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl text-sm font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Owner Name</label>
              <input
                type="text"
                value={form.ownerName}
                onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> Contact Phone
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-xs font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" /> Business Address
            </label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              GST / Tax Identification Number
            </label>
            <input
              type="text"
              value={form.gstNumber}
              onChange={(e) => setForm({ ...form, gstNumber: e.target.value })}
              placeholder="e.g. 29ABCDE1234F1Z5"
              className="w-full px-3 py-2 border rounded-xl text-xs font-mono"
            />
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-3">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              PDF Statement Formatting
            </h4>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
                <FileCheck className="w-3.5 h-3.5 text-slate-400" /> PDF Signature Title
              </label>
              <input
                type="text"
                value={form.signatureTitle}
                onChange={(e) => setForm({ ...form, signatureTitle: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-xs"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div>
                <p className="text-xs font-semibold text-slate-800">Show Signature Line in PDF</p>
                <p className="text-[11px] text-slate-500">Adds an authorized signatory seal line</p>
              </div>
              <input
                type="checkbox"
                checked={form.showSignatureInPdf}
                onChange={(e) => setForm({ ...form, showSignatureInPdf: e.target.checked })}
                className="w-4 h-4 text-[#0288D1] rounded focus:ring-0"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#0288D1] hover:bg-sky-600 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Business Profile
          </button>
        </form>

        {/* MERCHANT BANK & UPI PAYOUT CONFIGURATION */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Landmark className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-800">Merchant UPI Payout Configuration</h3>
            </div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
              0% Fee Direct Bank Deposit
            </span>
          </div>

          {merchantSaved && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Merchant payout details saved! Subscription QR codes now point directly to your UPI ID.</span>
            </div>
          )}

          <form onSubmit={handleMerchantSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Your Bank UPI ID (VPA)
              </label>
              <input
                type="text"
                value={merchantForm.upiId}
                onChange={(e) => setMerchantForm({ ...merchantForm, upiId: e.target.value })}
                placeholder="e.g. zamura.digt@ybl"
                className="w-full px-3 py-2 border rounded-xl text-xs font-mono"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">
                When users choose "Pay via UPI", funds will transfer 100% directly into the bank account linked to this UPI ID.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Payee / Beneficiary Name
              </label>
              <input
                type="text"
                value={merchantForm.payeeName}
                onChange={(e) => setMerchantForm({ ...merchantForm, payeeName: e.target.value })}
                placeholder="e.g. Cash Khata Technologies"
                className="w-full px-3 py-2 border rounded-xl text-xs"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" /> Save UPI Payout Details
            </button>
          </form>

          {/* Educational Bank Settlement Guide */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs text-slate-600">
            <h5 className="font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#0288D1]" /> How You Receive Your Money:
            </h5>
            <div className="space-y-1.5 text-[11px] leading-relaxed">
              <p>
                <strong>1. Direct UPI Route:</strong> Transferred instantly into your Indian savings or current bank account with 0% platform deductions.
              </p>
              <p>
                <strong>2. Google Play Billing Route:</strong> Users subscribe via Google Play; Google consolidates sales and wires funds to your bank account on the <strong>15th of each month</strong> (link your IFSC &amp; Account in Google Play Console &gt; Payments profile).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
