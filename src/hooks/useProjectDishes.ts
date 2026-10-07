import { useCallback, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import type { AnalyzeResult, Dish } from '@/lib/types';

export function useProjectDishes(projectId: string) {
  const { token } = useAuth();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [dishesLoading, setDishesLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [latest, setLatest] = useState<AnalyzeResult['latest']>(null);
  const [feedOpen, setFeedOpen] = useState(false);

  const loadDishes = useCallback(async () => {
    if (!token) return;
    setDishesLoading(true);
    try {
      const list = await apiFetch<Dish[]>(`/projects/${projectId}/dishes`, { token });
      setDishes(list);
      const first = list.find((d) => d.summary);
      if (first) {
        setLatest({
          sha: first.sha,
          branch: first.branch ?? '',
          message: first.message,
          date: first.date,
          score: first.score,
          summary: first.summary ?? null,
        });
      }
    } catch {
      setDishes([]);
    } finally {
      setDishesLoading(false);
    }
  }, [token, projectId]);

  const syncNow = useCallback(async () => {
    if (!token) return null;
    setSyncing(true);
    try {
      const data = await apiFetch<AnalyzeResult>(`/projects/${projectId}/analyze`, {
        token,
        method: 'POST',
        body: {},
      });
      if (data.latest?.summary) setLatest(data.latest);
      return data;
    } finally {
      setSyncing(false);
    }
  }, [token, projectId]);

  const openFeed = useCallback(() => {
    setFeedOpen((open) => {
      if (!open) void loadDishes();
      return !open;
    });
  }, [loadDishes]);

  return {
    dishes,
    setDishes,
    dishesLoading,
    syncing,
    latest,
    setLatest,
    loadDishes,
    syncNow,
    feedOpen,
    openFeed,
  };
}
