# Implementation Plan: Fix Google OAuth 400 origin_mismatch for Android APK & Mobile

Resolve the `Error 400: origin_mismatch` encountered when signing in from an Android Studio compiled APK or TWA package by configuring authorized origins in Google Cloud Console and hardening the mobile authentication handler.

---

## Root Cause Analysis
- **Google Cloud OAuth 2.0 Policy**: The Web OAuth Client ID (`731992000609-ajgm3jni8hmp4c93rrbc6l5k9p9qaesu.apps.googleusercontent.com`) validates the HTTP `Origin` header against its list of **Authorized JavaScript origins**.
- **Android APK / TWA Origin**: When opened via an Android Studio APK or TWA, the runtime origin matches either:
  1. The deployed Cloud Run host (e.g. `https://ais-pre-yn5pphds2d2fhlcszl6lrq-79975215899.asia-east1.run.app`)
  2. A custom domain configured in `build.gradle` (or `android-app://...`)
  If the exact origin is not present in Google Cloud Console, Google immediately halts the flow with `Error 400: origin_mismatch`.

---

## Proposed Changes

### 1. Step-by-Step Google Cloud Console Origin Registration
In Google Cloud Console under project **`carbide-generator-svr20`**:
1. Navigate to: **APIs & Services > Credentials**.
2. Click on the OAuth 2.0 Client ID: **`731992000609-ajgm3jni8hmp4c93rrbc6l5k9p9qaesu.apps.googleusercontent.com`**.
3. Under **Authorized JavaScript origins**, click **+ ADD URI** and add:
   - `https://ais-pre-yn5pphds2d2fhlcszl6lrq-79975215899.asia-east1.run.app`
   - `https://ais-dev-yn5pphds2d2fhlcszl6lrq-79975215899.asia-east1.run.app`
   - If using a custom domain in your Android Studio project (e.g., `https://mycashkhata.com`), add that domain as well.
4. Under **Authorized redirect URIs**, ensure the following are added:
   - `https://ai-studio-cashbookprovyapa-37ec4097-a7c9-4bea-bc17-599275f22f8a.firebaseapp.com/__/auth/handler`
   - `https://carbide-generator-svr20.firebaseapp.com/__/auth/handler`
   - `https://ais-pre-yn5pphds2d2fhlcszl6lrq-79975215899.asia-east1.run.app`
5. Click **Save** (changes propagate globally across Google accounts in ~2-5 minutes).

### 2. Client-Side Mobile OAuth Optimization (`AuthContext.tsx`)
- Detect mobile and Android APK environments (`navigator.userAgent`, standalone display mode).
- Handle Google Identity Services (GIS) / Token Client origin mismatches gracefully:
  - If a 400 origin mismatch is detected, capture the current `window.location.origin` and show a clear, actionable dialog with a **"Copy Origin"** button.
  - Implement Custom Tab / System Browser fallback so Android doesn't block OAuth with `disallowed_useragent`.

### 3. In-App Mobile Setup Helper Modal (`LoginView.tsx`)
- Add a **"Troubleshoot Mobile Login & Origin Mismatch"** quick-action modal on the login screen.
- Displays the current active origin (e.g. `https://ais-pre-yn5pphds2d2fhlcszl6lrq-79975215899.asia-east1.run.app`) with a 1-click **Copy Origin URI** button and direct link to Google Cloud Console Credentials.
- Provides Android Studio `assetlinks.json` instructions for TWA Digital Asset Links verification.

---

## Verification Plan
1. Run `lint_applet` and `compile_applet` to verify codebase integrity.
2. Verify that `LoginView.tsx` shows the current origin and actionable Google Cloud Console instructions.
3. Test authentication in mobile viewport and verify error handling for origin mismatch.
