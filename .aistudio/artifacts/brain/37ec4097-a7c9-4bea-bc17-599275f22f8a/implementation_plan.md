# Implementation Plan: Fix APK Login & Database Errors Built via GitHub Actions

Resolve login failures and database connection issues occurring in Android APKs built via GitHub Actions.

---

## Root Cause Analysis
1. **Missing Relative Asset Base in Vite (`vite.config.ts`)**:
   - In GitHub Actions APK builds (Capacitor, Cordova, Bubblewrap, or WebView wrappers), assets are bundled locally into `file:///android_asset/` or served from `http://localhost`. Without `base: './'`, Vite generates absolute paths (`/assets/...`) that fail to resolve inside the APK.
2. **Android WebView Firestore Streaming Restriction (`firebase.ts`)**:
   - The default Firestore WebChannel stream relies on HTTP/2 WebSockets, which are often terminated or blocked inside Android WebViews. Firebase requires `initializeFirestore` with `experimentalAutoDetectLongPolling: true` for 100% reliable Android WebView database communication.
3. **Network Timing in APK Login Flow (`AuthContext.tsx`)**:
   - Inside an APK, if internet connectivity is delayed during cold launch, synchronous Firestore network calls can time out. Authentication must be **offline-first and resilient**: registering and logging in immediately with local credential caching while syncing to Firestore in the background.
4. **Android APK Manifest Permissions (`AndroidManifest.xml`)**:
   - Ensure clear instructions are provided for `<uses-permission android:name="android.permission.INTERNET" />` and `android:usesCleartextTraffic="true"` in the GitHub repository's Android build config.

---

## Proposed Changes

### 1. Configure Relative Base Path in `vite.config.ts`
- Add `base: './'` to `vite.config.ts` so all JavaScript, CSS, and manifest assets resolve correctly inside Android APKs built by GitHub Actions.

### 2. Enable Android WebView-Optimized Firestore in `src/lib/firebase.ts`
- Replace default `getFirestore` with `initializeFirestore`:
  - Set `experimentalAutoDetectLongPolling: true` (or long-polling fallback) so Firestore queries succeed reliably inside Android WebViews.
  - Enable persistent offline cache so the database never crashes if the APK launches offline.

### 3. Harden Offline-First Login in `src/context/AuthContext.tsx`
- Make Email/Password registration and sign-in **instant & offline-resilient**:
  - Store credentials locally in secure `localStorage` immediately on sign-up so the user is never blocked by a slow network ping.
  - Push the user profile to Firestore asynchronously in the background.
  - Provide instant offline shop access with 1 tap.

### 4. Provide GitHub Actions Android Configuration Checklist
- Provide a clear, actionable guide for your GitHub repository:
  - Adding `INTERNET` permission in `AndroidManifest.xml`.
  - Ensuring `firebase-applet-config.json` is bundled in the APK assets.

---

## Verification Plan
1. Run `lint_applet` and `compile_applet` to verify build integrity with `base: './'`.
2. Verify that Firestore initializes with `experimentalAutoDetectLongPolling`.
3. Verify that Email sign-in, account creation, and Local Shop access succeed immediately both online and offline.
