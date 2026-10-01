# Implementation Plan: Diagnose Google Cloud Console origin_mismatch & Add Email Sign-In

Diagnose and resolve the Google OAuth `Error 400: origin_mismatch` in Google Cloud Console while providing Firebase Email & Password authentication alongside Google Sign-In so you are never blocked.

---

## Technical Diagnostic: Why origin_mismatch Occurs
Google's OAuth 2.0 endpoint (`accounts.google.com/o/oauth2/v2/auth`) rejects requests if:
1. **Trailing Slash Error**: The origin was entered in Google Cloud Console as `https://...run.app/` (with a `/` at the end) instead of `https://...run.app` (origins must NOT have a trailing slash).
2. **Client ID Mismatch**: The origin was added to an Android client or a different project rather than the Web Client:
   `731992000609-ajgm3jni8hmp4c93rrbc6l5k9p9qaesu.apps.googleusercontent.com`
   under project `carbide-generator-svr20`.
3. **Propagation Delay**: Google Cloud Console OAuth credential updates typically take 5 to 10 minutes to sync across all Google global edge authentication caches.
4. **Android APK Origin**: If running inside an Android WebView, the origin reported by the device might be `http://localhost` or `android-app://...`.

---

## Proposed Changes

### 1. In-App Interactive Cloud Console Inspector & Validator
- Add an **Interactive OAuth Origin Diagnostic tool** on the login screen that:
  - Displays the active origin: `window.location.origin` (clean, formatted without trailing slash).
  - Validates that the URI has no trailing slash or path.
  - Shows the exact Web Client ID (`731992000609-ajgm3jni8hmp4c93rrbc6l5k9p9qaesu.apps.googleusercontent.com`) and Project ID (`carbide-generator-svr20`).
  - Provides a direct link that opens the exact client edit page in Google Cloud Console.
  - Lists the exact 3 URIs to add under **Authorized JavaScript origins** and **Authorized redirect URIs**.

### 2. Dual Authentication: Add Firebase Email & Password Authentication
- Update `AuthContext.tsx`:
  - Add `signInWithEmail(email, password)` and `signUpWithEmail(email, password, displayName)` using Firebase Auth (`signInWithEmailAndPassword`, `createUserWithEmailAndPassword`).
  - User records in Firestore automatically bind to `users/{uid}`, sharing the same cloud ledger schema.
  - Retain `signInWithGoogle` using direct Google Identity Services with clear diagnostic feedback.
- Update `LoginView.tsx`:
  - Add tabbed or toggleable sign-in: **"Sign In with Google"** (primary) + **"Sign In with Email"** (instant backup).
  - Users can sign in or create an account with any email/password in 5 seconds.

### 3. Verification & Deployment
- Run `lint_applet` and `compile_applet`.
- Verify that users can authenticate via Google Sign-In or Email/Password, and that transactions persist to Firestore.
