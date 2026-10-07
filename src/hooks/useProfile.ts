import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import type { User } from '@/lib/types';

export function useProfile() {
  const { token, user } = useAuth();
  const [profile, setProfile] = useState<User | null>(user);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!token) return;
      let cancelled = false;
      apiFetch<User>('/users/me', { token })
        .then((data) => {
          if (!cancelled) setProfile(data);
        })
        .catch((e) => {
          if (!cancelled) {
            setError(e instanceof Error ? e.message : 'No se pudo cargar tu perfil');
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
      return () => {
        cancelled = true;
      };
    }, [token])
  );

  return { profile, loading, error };
}
