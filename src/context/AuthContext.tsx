import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import firebaseConfigData from '../../firebase-applet-config.json';

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  provider: 'google';
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
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

  const saveUserSession = useCallback((authUser: AuthUser) => {
    setUser(authUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
  }, []);

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

  // Initialize Google Identity Services (GIS) with FedCM disabled
  useEffect(() => {
    let checkGsiInterval: any = null;

    const setupGsi = () => {
      if (window.google?.accounts && firebaseConfigData.oAuthClientId) {
        try {
          if (window.google.accounts.id) {
            window.google.accounts.id.initialize({
              client_id: firebaseConfigData.oAuthClientId,
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

    setLoading(false);

    return () => {
      if (checkGsiInterval) clearInterval(checkGsiInterval);
    };
  }, [handleGoogleCredentialResponse]);

  // Google OAuth Popup Flow - Authenticates with real Google account password & 2FA
  const signInWithGoogle = async () => {
    setError(null);
    setLoading(true);

    try {
      if (window.google?.accounts?.oauth2 && firebaseConfigData.oAuthClientId) {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: firebaseConfigData.oAuthClientId,
          scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid',
          prompt: 'select_account',
          callback: async (tokenResponse: any) => {
            if (tokenResponse.error) {
              console.warn('Google token error:', tokenResponse);
              if (tokenResponse.error !== 'popup_closed_by_user') {
                setError(tokenResponse.error_description || 'Google sign-in was cancelled.');
              }
              setLoading(false);
              return;
            }

            try {
              // Fetch user info using verified OAuth access token
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
            } catch (err: any) {
              console.error('Fetch profile error:', err);
              setError(err.message || 'Failed to complete Google Sign-In.');
            } finally {
              setLoading(false);
            }
          },
        });

        client.requestAccessToken({ prompt: 'select_account' });
      } else {
        throw new Error('Google Sign-In is initializing. Please wait a moment and try again.');
      }
    } catch (err: any) {
      console.error('Sign-in error:', err);
      setError(err.message || 'Failed to start Google Sign-In.');
      setLoading(false);
    }
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
        signInWithGoogle,
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
