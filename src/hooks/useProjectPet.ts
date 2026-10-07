import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import type { ProjectPet } from '@/lib/types';

export function useProjectPet(projectId: string) {
  const { token } = useAuth();
  const [pet, setPet] = useState<ProjectPet | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!token) return;
      let cancelled = false;
      setLoading(true);
      apiFetch<ProjectPet>(`/projects/${projectId}/pet`, { token })
        .then((data) => {
          if (!cancelled) setPet(data);
        })
        .catch(() => {
          if (!cancelled) setPet(null);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
      return () => {
        cancelled = true;
      };
    }, [token, projectId])
  );

  return { pet, setPet, loading };
}
