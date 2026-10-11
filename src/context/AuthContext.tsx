import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
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
  hostname: string;
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

const AUTH_STORAGE_KEY = 'cashbook_cloud_user_session_v2';

declare global {
  interface Window {
    google?: any;
  }
}

// Safely decode Google JWT ID Token payload if received
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

  const [loading, setLoading] = useState<boolean>(false);
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

  // Handle Google Identity Services response (when ID token is received)
  const handleGoogleCredentialResponse = useCallback(
    async (response: any) => {
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

        const uid = `google_${decoded.sub || decoded.email.replace(/[^a-zA-Z0-9]/g, '_')}`;
        const authUser: AuthUser = {
          uid,
          email: decoded.email,
          displayName: decoded.name || decoded.email.split('@')[0],
          photoURL: decoded.picture || undefined,
          provider: 'google',
        };

        // Register / sync user profile in Cloud Firestore
        try {
          const userDocRef = doc(db, 'users', uid);
          await setDoc(
            userDocRef,
            {
              email: decoded.email,
              displayName: authUser.displayName,
              photoURL: authUser.photoURL || null,
              provider: 'google',
              lastLoginAt: new Date().toISOString(),
            },
            { merge: true }
          );
        } catch (dbErr) {
          console.warn('Firestore profile sync note:', dbErr);
        }

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

  // Google Sign-In with Google Identity Services (Direct token client)
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
              if (
                tokenResponse.error === 'origin_mismatch' ||
                tokenResponse.error_description?.includes('origin_mismatch')
              ) {
                setError(
                  `Error 400: origin_mismatch on origin "${currentOrigin}". Please register your domain in Google Cloud Console.`
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

              const uid = `google_${profile.sub || profile.email.replace(/[^a-zA-Z0-9]/g, '_')}`;
              const authUser: AuthUser = {
                uid,
                email: profile.email,
                displayName: profile.name || profile.email.split('@')[0],
                photoURL: profile.picture || undefined,
                provider: 'google',
              };

              // Sync profile to Firestore
              try {
                const userDocRef = doc(db, 'users', uid);
                await setDoc(
                  userDocRef,
                  {
                    email: profile.email,
                    displayName: authUser.displayName,
                    photoURL: authUser.photoURL || null,
                    provider: 'google',
                    lastLoginAt: new Date().toISOString(),
                  },
                  { merge: true }
                );
              } catch (dbErr) {
                console.warn('Firestore profile sync note:', dbErr);
              }

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
        console.warn('GIS TokenClient error:', gisErr);
        setError('Google Sign-In is initializing. Please try again in a moment.');
        setLoading(false);
        return;
      }
    }

    setError('Google Sign-In service is loading. Please try again.');
    setLoading(false);
  };

  const signInWithGoogleRedirect = async () => {
    signInWithGoogle();
  };

  // Quick Start / Local Vyapari Sign-In
  const signInAsLocalBusiness = async (name: string = 'Vyapar Owner') => {
    setError(null);
    setLoading(true);
    const authUser: AuthUser = {
      uid: 'biz_local_default_owner',
      email: 'owner@cashkhata.local',
      displayName: name,
      provider: 'local',
    };
    saveUserSession(authUser);
    setLoading(false);
  };

  const signOutUser = async () => {
    setError(null);
    try {
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
