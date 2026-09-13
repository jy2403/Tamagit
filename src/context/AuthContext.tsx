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
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const applyToken = useCallback(async (newToken: string) => {
    await setToken(newToken);
    setTokenState(newToken);
    try {
      const profile = await apiFetch<User>('/users/me', { token: newToken });
      await setUser(profile);
      setUserState(profile);
    } catch {
      // If the profile fetch fails we still keep the session with partial data.
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([getToken(), getUser()]);
        if (storedToken) {
          setTokenState(storedToken);
          setUserState(storedUser);
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
    const redirectUri = Linking.createURL('auth');
    const result = await WebBrowser.openAuthSessionAsync(buildLoginUrl(redirectUri), redirectUri);
    if (result.type === 'success') {
      handleUrl(result.url);
    }
  }, [handleUrl]);

  const signOut = useCallback(async () => {
    await clearSession();
    setTokenState(null);
    setUserState(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, isLoading, signIn, signOut }),
    [user, token, isLoading, signIn, signOut]
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
