import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase';
import firebaseConfigData from '../../firebase-applet-config.json';

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  provider: 'google' | 'local';
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  currentOrigin: string;
  oAuthClientId: string;
  projectId: string;
  signInWithGoogle: () => Promise<void>;
  signInWithGoogleRedirect: () => Promise<void>;
  signInAsLocalBusiness: (name?: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  clearError: () => void;
  isGsiAvailable: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'cashbook_google_auth_user_v1';

declare global {
  interface Window {
    google?: any;
  }
}

// Helper to safely decode Google JWT ID Token payload if received
function decodeJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to parse Google JWT token:', e);
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isGsiAvailable, setIsGsiAvailable] = useState<boolean>(false);

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const oAuthClientId = firebaseConfigData.oAuthClientId || '';
  const projectId = firebaseConfigData.projectId || '';

  const saveUserSession = useCallback((authUser: AuthUser) => {
    setUser(authUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        const authUser: AuthUser = {
          uid: fbUser.uid,
          email: fbUser.email || '',
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Business Owner',
          photoURL: fbUser.photoURL || undefined,
          provider: 'google',
        };
        saveUserSession(authUser);
      }
      setLoading(false);
    });

    // Check redirect result on mobile / TWA app returns
    getRedirectResult(auth)
      .then((result) => {
        if (result && result.user) {
          const fbUser = result.user;
          const authUser: AuthUser = {
            uid: fbUser.uid,
            email: fbUser.email || '',
            displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Business Owner',
            photoURL: fbUser.photoURL || undefined,
            provider: 'google',
          };
          saveUserSession(authUser);
        }
      })
      .catch((err) => {
        console.warn('Redirect auth check notice:', err);
      });

    return () => unsubscribe();
  }, [saveUserSession]);

  // Handle Google Identity Services response (when ID token is received)
  const handleGoogleCredentialResponse = useCallback(
    (response: any) => {
      setLoading(true);
      setError(null);
      try {
        if (!response.credential) {
          throw new Error('No credential received from Google.');
        }

        const decoded = decodeJwt(response.credential);
        if (!decoded || !decoded.email) {
          throw new Error('Unable to extract Google profile details.');
        }

        const authUser: AuthUser = {
          uid: `google_${decoded.sub || decoded.email.replace(/[^a-zA-Z0-9]/g, '_')}`,
          email: decoded.email,
          displayName: decoded.name || decoded.email.split('@')[0],
          photoURL: decoded.picture || undefined,
          provider: 'google',
        };

        saveUserSession(authUser);
      } catch (err: any) {
        console.error('Google credential parse error:', err);
        setError(err.message || 'Google Sign-In failed. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [saveUserSession]
  );

  // Initialize Google Identity Services (GIS)
  useEffect(() => {
    let checkGsiInterval: any = null;

    const setupGsi = () => {
      if (window.google?.accounts && oAuthClientId) {
        try {
          if (window.google.accounts.id) {
            window.google.accounts.id.initialize({
              client_id: oAuthClientId,
              callback: handleGoogleCredentialResponse,
              auto_select: false,
              cancel_on_tap_outside: true,
              use_fedcm_for_prompt: false,
            });
          }
          setIsGsiAvailable(true);
          return true;
        } catch (e) {
          console.warn('GIS initialize notice:', e);
        }
      }
      return false;
    };

    if (!setupGsi()) {
      checkGsiInterval = setInterval(() => {
        if (setupGsi()) {
          clearInterval(checkGsiInterval);
        }
      }, 500);
    }

    return () => {
      if (checkGsiInterval) clearInterval(checkGsiInterval);
    };
  }, [handleGoogleCredentialResponse, oAuthClientId]);

  // Google Sign-In with standard Firebase Auth (Popup) + GIS fallback
  const signInWithGoogle = async () => {
    setError(null);
    setLoading(true);

    try {
      // 1. Try Firebase official Google Auth popup
      const result = await signInWithPopup(auth, googleAuthProvider);
      if (result.user) {
        const authUser: AuthUser = {
          uid: result.user.uid,
          email: result.user.email || '',
          displayName: result.user.displayName || result.user.email?.split('@')[0] || 'Business Owner',
          photoURL: result.user.photoURL || undefined,
          provider: 'google',
        };
        saveUserSession(authUser);
        setLoading(false);
        return;
      }
    } catch (fbErr: any) {
      console.warn('Firebase signInWithPopup failed, testing GIS fallback:', fbErr);

      // Check if popup was blocked or mobile origin error
      if (
        fbErr.code === 'auth/popup-blocked' ||
        fbErr.code === 'auth/operation-not-supported-in-this-environment' ||
        fbErr.code === 'auth/unauthorized-domain'
      ) {
        // Try fallback to Google Identity Services Token Client
        if (window.google?.accounts?.oauth2 && oAuthClientId) {
          try {
            const client = window.google.accounts.oauth2.initTokenClient({
              client_id: oAuthClientId,
              scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid',
              prompt: 'select_account',
              callback: async (tokenResponse: any) => {
                if (tokenResponse.error) {
                  if (tokenResponse.error === 'origin_mismatch' || tokenResponse.error_description?.includes('origin_mismatch')) {
                    setError(
                      `Error 400: origin_mismatch. The origin "${currentOrigin}" must be registered under Authorized JavaScript Origins in Google Cloud Console.`
                    );
                  } else if (tokenResponse.error !== 'popup_closed_by_user') {
                    setError(tokenResponse.error_description || 'Google sign-in was cancelled.');
                  }
                  setLoading(false);
                  return;
                }

                try {
                  const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: {
                      Authorization: `Bearer ${tokenResponse.access_token}`,
                    },
                  });

                  if (!userInfoRes.ok) {
                    throw new Error('Failed to verify profile with Google.');
                  }

                  const profile = await userInfoRes.json();
                  const authUser: AuthUser = {
                    uid: `google_${profile.sub || profile.email.replace(/[^a-zA-Z0-9]/g, '_')}`,
                    email: profile.email,
                    displayName: profile.name || profile.email.split('@')[0],
                    photoURL: profile.picture || undefined,
                    provider: 'google',
                  };

                  saveUserSession(authUser);
                } catch (fetchErr: any) {
                  setError(fetchErr.message || 'Failed to complete Google Sign-In.');
                } finally {
                  setLoading(false);
                }
              },
            });

            client.requestAccessToken({ prompt: 'select_account' });
            return;
          } catch (gisErr: any) {
            console.error('GIS token client error:', gisErr);
          }
        }
      }

      // Format clean error message
      if (fbErr.code === 'auth/unauthorized-domain') {
        setError(
          `Unauthorized Domain: "${currentOrigin}" must be added to Firebase Console > Authentication > Settings > Authorized Domains.`
        );
      } else if (fbErr.message?.includes('origin_mismatch') || fbErr.code === 'auth/internal-error') {
        setError(
          `Error 400: origin_mismatch. Register "${currentOrigin}" in Google Cloud Console > APIs & Services > Credentials.`
        );
      } else if (fbErr.code !== 'auth/popup-closed-by-user') {
        setError(fbErr.message || 'Sign in failed. Please try again.');
      }
      setLoading(false);
    }
  };

  // Google Sign-In with Redirect (Optimized for Android Studio TWA / WebViews)
  const signInWithGoogleRedirect = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithRedirect(auth, googleAuthProvider);
    } catch (err: any) {
      console.error('Redirect sign-in error:', err);
      setError(err.message || 'Failed to initiate Google Redirect.');
      setLoading(false);
    }
  };

  // Quick Start / Local Vyapari Sign-In (For offline/testing without blocking)
  const signInAsLocalBusiness = async (name: string = 'Vyapar Owner') => {
    setError(null);
    setLoading(true);
    const authUser: AuthUser = {
      uid: `local_${Date.now()}`,
      email: 'local.owner@cashkhata.app',
      displayName: name,
      provider: 'local',
    };
    saveUserSession(authUser);
    setLoading(false);
  };

  const signOutUser = async () => {
    setError(null);
    try {
      await signOut(auth).catch(() => {});
      setUser(null);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (err: any) {
      console.error('Sign-out error:', err);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        currentOrigin,
        oAuthClientId,
        projectId,
        signInWithGoogle,
        signInWithGoogleRedirect,
        signInAsLocalBusiness,
        signOutUser,
        clearError,
        isGsiAvailable,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
