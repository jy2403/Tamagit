import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { showNotificationsOnce } from '@/lib/notifications';
import type { Project } from '@/lib/types';

export function useProjects() {
  const { token } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    if (!token) return [] as Project[];
    return apiFetch<Project[]>('/projects', { token });
  }, [token]);

  const applyProjects = useCallback((data: Project[]) => {
    setProjects(data);
    setError(null);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!token) return;
      fetchProjects()
        .then(applyProjects)
        .catch((e) => {
          setError(e instanceof Error ? e.message : 'No se pudieron cargar los proyectos');
          setLoading(false);
        });
      void showNotificationsOnce(token);
    }, [token, fetchProjects, applyProjects])
  );

  const sync = useCallback(async () => {
    if (!token) return;
    setSyncing(true);
    setError(null);
    try {
      await apiFetch('/projects/sync', { token, method: 'POST', body: {} });
      const data = await fetchProjects();
      applyProjects(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo sincronizar');
    } finally {
      setSyncing(false);
    }
  }, [token, fetchProjects, applyProjects]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProjects()
      .then(applyProjects)
      .catch((e) => {
        setError(e instanceof Error ? e.message : 'No se pudieron cargar los proyectos');
      })
      .finally(() => setRefreshing(false));
  }, [fetchProjects, applyProjects]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.fullName ?? '').toLowerCase().includes(q) ||
        p.tools.some((t) => t.toLowerCase().includes(q))
    );
  }, [projects, query]);

  const pets = useMemo(
    () =>
      projects
        .filter((p) => p.pet)
        .map((p) => ({ id: p.id, fullName: p.fullName ?? '', pet: p.pet! })),
    [projects]
  );

  return {
    projects,
    filtered,
    pets,
    loading,
    syncing,
    refreshing,
    query,
    setQuery,
    error,
    sync,
    onRefresh,
    router,
  };
}
