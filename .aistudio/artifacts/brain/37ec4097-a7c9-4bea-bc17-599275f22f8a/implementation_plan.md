# Implementation Plan: Fix Firebase auth/unauthorized-domain Error

Resolve the `auth/unauthorized-domain` error when clicking **Google Sign-In** so users can sign in immediately without being blocked by Firebase domain whitelist restrictions.

---

## Root Cause Analysis
- **Firebase Auth Domain Whitelist**: Firebase Authentication maintains a strict list of **Authorized Domains** (located at `https://console.firebase.google.com/project/carbide-generator-svr20/authentication/settings`).
- **Domain Mismatch**: The Cloud Run hosted domain `ais-pre-yn5pphds2d2fhlcszl6lrq-79975215899.asia-east1.run.app` is not yet added to Firebase's authorized domains list, causing Firebase's SDK (`signInWithPopup`) to reject the request with `auth/unauthorized-domain`.
- **Google Identity Services (GIS) Advantage**: Direct Google OAuth (`window.google.accounts.oauth2` and Google One Tap) does *not* depend on Firebase's internal domain list; it authenticates directly with Google's verified OAuth token endpoint.

---

## Proposed Solution & Changes

### 1. Update `AuthContext.tsx` to Use Direct Google Identity Services (GIS)
- Make **Google Identity Services (Token Client)** the primary authentication engine for the Google Sign-In button:
  - Invokes `window.google.accounts.oauth2.initTokenClient` directly with the user's authentic Google Account.
  - Verifies identity securely via Google's OAuth userinfo API (`https://www.googleapis.com/oauth2/v3/userinfo`).
  - Seamlessly signs the user into Cash Khata and saves their session.
- If Firebase Auth is specifically invoked and returns `auth/unauthorized-domain`, automatically intercept it and fall back to GIS with zero user friction.

### 2. Update `LoginView.tsx` with 1-Click Firebase Authorized Domain Helper
- Add a direct link to:
  `https://console.firebase.google.com/project/carbide-generator-svr20/authentication/settings`
- Provide a 1-tap button to copy the exact hostname:
  `ais-pre-yn5pphds2d2fhlcszl6lrq-79975215899.asia-east1.run.app`
- Show clear instructions: Paste hostname under **Authorized domains** in Firebase Console.

### 3. Verify Local & Google Cloud Sync
- Ensure the user's Firestore ledger is linked to their Google account UID.
- Verify transactions continue to save offline and sync to Firestore.

---

## Verification Plan
1. Run `lint_applet` and `compile_applet` to confirm zero TypeScript or build errors.
2. Test sign-in button flow: Google account popup opens and successfully authenticates via GIS without throwing `auth/unauthorized-domain`.
3. Verify session persistence in `localStorage` and Firestore.
