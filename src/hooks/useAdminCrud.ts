import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import type { CrudRow } from '@/components/AdminCrudList';

export type AdminCrudConfig<T> = {
  resourcePath: string;
  toRow: (item: T) => CrudRow;
  fromRow: (data: Record<string, string>) => unknown;
};

export function useAdminCrud<T>({ resourcePath, toRow, fromRow }: AdminCrudConfig<T>) {
  const { token } = useAuth();
  const [rows, setRows] = useState<CrudRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      const data = await apiFetch<T[]>(resourcePath, { token });
      setRows(data.map(toRow));
    } catch {
      setRows([]);
    }
  }, [token, resourcePath, toRow]);

  const load = useCallback(async () => {
    setLoading(true);
    await fetchData();
    setLoading(false);
  }, [fetchData]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoading(true);
      fetchData().then(() => {
        if (!cancelled) setLoading(false);
      });
      return () => {
        cancelled = true;
      };
    }, [fetchData])
  );

  const onCreate = useCallback(
    async (data: Record<string, string>) => {
      if (!token) return;
      await apiFetch(resourcePath, {
        token,
        method: 'POST',
        body: fromRow(data),
      });
      await load();
    },
    [token, resourcePath, fromRow, load]
  );

  const onUpdate = useCallback(
    async (id: string, data: Record<string, string>) => {
      if (!token) return;
      await apiFetch(`${resourcePath}/${id}`, {
        token,
        method: 'PATCH',
        body: fromRow(data),
      });
      await load();
    },
    [token, resourcePath, fromRow, load]
  );

  const onDelete = useCallback(
    async (id: string) => {
      if (!token) return;
      await apiFetch(`${resourcePath}/${id}`, { token, method: 'DELETE' });
      await load();
    },
    [token, resourcePath, load]
  );

  return { rows, loading, load, onCreate, onUpdate, onDelete };
}
