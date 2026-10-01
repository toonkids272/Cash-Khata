import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  signInWithPopup,
  signInWithRedirect,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
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
  provider: 'google' | 'email' | 'local';
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  currentOrigin: string;
  hostname: string;
  oAuthClientId: string;
  projectId: string;
  signInWithGoogle: () => Promise<void>;
  signInWithGoogleRedirect: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<void>;
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
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
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
        const isGoogle = fbUser.providerData.some((p) => p.providerId === 'google.com');
        const authUser: AuthUser = {
          uid: fbUser.uid,
          email: fbUser.email || '',
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Business Owner',
          photoURL: fbUser.photoURL || undefined,
          provider: isGoogle ? 'google' : 'email',
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

  // Primary Google Sign-In with GIS Token Client
  const signInWithGoogle = async () => {
    setError(null);
    setLoading(true);

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
                  `Error 400: origin_mismatch. Register "${currentOrigin}" in Google Cloud Console > APIs & Services > Credentials.`
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
              if (!profile.email) {
                throw new Error('No verified email returned from Google.');
              }

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
        console.warn('GIS TokenClient initiation failed, attempting Firebase popup fallback:', gisErr);
      }
    }

    // Fallback to Firebase Auth popup
    try {
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
      if (fbErr.code === 'auth/unauthorized-domain') {
        setError(
          `Unauthorized Domain: "${hostname}" must be added to Firebase Console > Authentication > Settings > Authorized Domains.`
        );
      } else if (fbErr.code !== 'auth/popup-closed-by-user') {
        setError(fbErr.message || 'Google sign in failed.');
      }
      setLoading(false);
    }
  };

  // Google Sign-In with Redirect (For mobile WebView / TWA)
  const signInWithGoogleRedirect = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithRedirect(auth, googleAuthProvider);
    } catch (err: any) {
      console.error('Redirect sign-in error:', err);
      if (err.code === 'auth/unauthorized-domain') {
        setError(
          `Unauthorized Domain: "${hostname}" must be added to Firebase Console > Authentication > Settings > Authorized Domains.`
        );
      } else {
        setError(err.message || 'Failed to initiate Google Redirect.');
      }
      setLoading(false);
    }
  };

  // Firebase Email & Password Sign-In
  const signInWithEmail = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const authUser: AuthUser = {
        uid: cred.user.uid,
        email: cred.user.email || email,
        displayName: cred.user.displayName || email.split('@')[0],
        photoURL: cred.user.photoURL || undefined,
        provider: 'email',
      };
      saveUserSession(authUser);
    } catch (err: any) {
      console.error('Email sign-in error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please check your credentials.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError(err.message || 'Email sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Firebase Email & Password Sign-Up
  const signUpWithEmail = async (email: string, password: string, displayName?: string) => {
    setError(null);
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName && cred.user) {
        await updateProfile(cred.user, { displayName }).catch(() => {});
      }
      const authUser: AuthUser = {
        uid: cred.user.uid,
        email: cred.user.email || email,
        displayName: displayName || email.split('@')[0],
        provider: 'email',
      };
      saveUserSession(authUser);
    } catch (err: any) {
      console.error('Email sign-up error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Please sign in instead.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters long.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Quick Start / Local Vyapari Sign-In
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
        hostname,
        oAuthClientId,
        projectId,
        signInWithGoogle,
        signInWithGoogleRedirect,
        signInWithEmail,
        signUpWithEmail,
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
