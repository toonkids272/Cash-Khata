# Implementation Plan: Paid Ad-Free Subscription (₹49 Micro-Pass & Dual Payout)

Implement a paid subscription system for Cash Khata featuring a ₹49/month micro-pass, dual support for Google Play Billing and Direct UPI bank payouts, and guaranteed ad suppression across the entire app.

## User Requirements & Choices
1. **Pricing Structure**: Low-cost micro-pass at **₹49 / month** (with a discounted ₹399 / year value-saver option).
2. **Payout Mechanism**: **Dual Support** for both Google Play In-App Billing (monthly wire deposit to bank) and Direct UPI QR / Intent (instant T+0 bank settlement).
3. **Core Benefit**: 100% Ad-Free experience (suppressing AdMob Native, Interstitial, and App Open ads) plus Pro badge and priority cloud sync.

---

## Architecture & Implementation Steps

### 1. Subscription State Management in `CashBookContext`
- Add state variables:
  - `isPro: boolean` (derived from active subscription or manual toggle)
  - `subscriptionPlan: 'free' | 'monthly_49' | 'yearly_399'`
  - `subscriptionExpiry: string | null`
  - `activateProSubscription: (plan: 'monthly_49' | 'yearly_399', method: 'google_play' | 'upi', txId?: string) => void`
  - `cancelSubscription: () => void`
- Persist subscription status in `localStorage` and sync to Firestore under `users/{userId}/subscription` when signed in.

### 2. Ad-Free Enforcement
- Audit all ad display points:
  - `AppOpenAd.tsx`: Guard with `if (isPro) return null;`
  - Native & Banner Ad placements: Verify `isPro` check before initializing or rendering AdMob units.
  - Side navigation drawer and top bar: Replace "Pro Active" placeholder with dynamic subscription status, renewal countdown, and "Manage Subscription" action.

### 3. Subscription Paywall & Checkout Modal (`SubscriptionModal.tsx`)
Create a high-converting, professional checkout sheet:
- **Plan Cards**:
  - **₹49 / month** (Micro-Pass, popular for testing)
  - **₹399 / year** (Save 32%, ₹33/month, best value)
- **Features Highlighted**:
  - 🚫 Zero advertisements anywhere in the app
  - ⚡ Instant transaction loading with no interruptions
  - 📄 Unlimited branded PDF statements & Excel exports
  - ☁️ Priority Google Cloud Firestore sync
- **Payment Method Switcher**:
  - **Method 1: Google Play Billing** (Calls Digital Goods API / TWA In-App Billing SKU `cashkhata_pro_monthly_49`).
  - **Method 2: Direct UPI (GPay / PhonePe / Paytm)**:
    - Generates dynamic UPI intent links (`upi://pay?pa=...&pn=CashKhata&am=49&cu=INR&tn=CashKhataPro`)
    - Displays scannable UPI QR code for direct bank-to-bank settlement (0% fees, deposited straight into your bank account).
    - Reference number input with instant activation.

### 4. Merchant Payout Configuration (`SettingsView.tsx`)
- Add a **"Merchant Payout & UPI Settings"** panel inside Settings:
  - Input for your personal or business UPI ID (VPA, e.g., `yourname@okhdfcbank` or `yourbusiness@paytm`).
  - Payee Name configuration.
  - Instructions on linking your Indian Bank Account to Google Play Console Merchant Center for the Google Play Billing route.

### 5. Visual Indicators & Entry Points
- Top AppBar: Add a golden Crown / "Upgrade to Pro" badge (or "Pro Member" badge when active).
- Navigation Drawer: Prominent "Go Ad-Free (₹49/mo)" card.

---

## Verification Plan

### Automated Verification
- Run `lint_applet` to ensure type safety with new context variables and components.
- Run `compile_applet` to confirm successful build.

### User Acceptance Walkthrough
1. Open the app; observe the "Go Ad-Free" crown badge in the top bar.
2. Tap "Go Ad-Free" to launch the subscription sheet.
3. Test selecting the **₹49/month** plan.
4. Test the **Direct UPI Payment** option; verify QR code rendering and UPI intent link.
5. Complete activation; verify that:
   - "Pro Active" badge displays in the header and drawer.
   - App Open ads, banners, and interstitials are completely disabled.
   - Subscription expiry date is calculated accurately (30 days from activation).
