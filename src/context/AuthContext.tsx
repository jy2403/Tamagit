import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { apiFetch, buildLoginUrl } from '@/lib/api';
import { clearSession, getToken, getUser, setToken, setUser } from '@/lib/storage';
import type { User } from '@/lib/types';

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  authError: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  clearAuthError: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const applyToken = useCallback(async (newToken: string) => {
    await setToken(newToken);
    setTokenState(newToken);
    try {
      const profile = await apiFetch<User>('/users/me', { token: newToken });
      await setUser(profile);
      setUserState(profile);
      setAuthError(null);
    } catch (e) {
      await clearSession();
      setTokenState(null);
      setUserState(null);
      setAuthError(e instanceof Error ? e.message : 'No se pudo validar la sesión');
    }
  }, []);

  const signOut = useCallback(async () => {
    await clearSession();
    setTokenState(null);
    setUserState(null);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([getToken(), getUser()]);
        if (storedToken) {
          setTokenState(storedToken);
          setUserState(storedUser);

          try {
            const profile = await apiFetch<User>('/users/me', { token: storedToken });
            if (profile.isBanned) {
              await clearSession();
              setTokenState(null);
              setUserState(null);
            } else {
              await setUser(profile);
              setUserState(profile);
            }
          } catch {
            // Keep existing session if fetch fails (e.g., offline)
          }
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleUrl = useCallback(
    (url: string) => {
      const params = Linking.parse(url);
      const newToken = params.queryParams?.token;
      if (typeof newToken === 'string' && newToken) {
        void applyToken(newToken);
      }
    },
    [applyToken]
  );

  useEffect(() => {
    const sub = Linking.addEventListener('url', ({ url }) => handleUrl(url));
    return () => sub.remove();
  }, [handleUrl]);

  const signIn = useCallback(async () => {
    setAuthError(null);
    const redirectUri = Linking.createURL('auth');
    try {
      const result = await WebBrowser.openAuthSessionAsync(buildLoginUrl(redirectUri), redirectUri);
      if (result.type === 'success') {
        handleUrl(result.url);
      } else if (result.type === 'locked') {
        setAuthError('No se pudo completar el inicio de sesión con GitHub');
      }
    } catch (e) {
      setAuthError(e instanceof Error ? e.message : 'No se pudo abrir la ventana de GitHub');
    }
  }, [handleUrl]);

  const clearAuthError = useCallback(() => setAuthError(null), []);

  const value = useMemo(
    () => ({ user, token, isLoading, authError, signIn, signOut, clearAuthError }),
    [user, token, isLoading, authError, signIn, signOut, clearAuthError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return ctx;
}
