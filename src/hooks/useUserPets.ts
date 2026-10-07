import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import type { UserPets } from '@/lib/types';

export function useUserPets(userId: string) {
  const { token } = useAuth();
  const [data, setData] = useState<UserPets | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token || !userId) return;
    try {
      const result = await apiFetch<UserPets>(`/users/${userId}/pets`, { token });
      setData(result);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar las mascotas');
    } finally {
      setLoading(false);
    }
  }, [token, userId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  return { data, loading, error, load };
}
