import { Redirect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';
import { AdminCrudList, type CrudField, type CrudRow } from '@/components/AdminCrudList';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import type { Item } from '@/lib/types';
import { pantalla } from '@/estilos';

const fields: CrudField[] = [
  { key: 'name', label: 'Nombre', placeholder: 'Ej: Gorra Neo' },
  { key: 'price', label: 'Precio', placeholder: 'Ej: 150', isNumber: true },
  { key: 'category', label: 'Categoría', placeholder: 'Ej: sombreros' },
];

function toRow(item: Item): CrudRow {
  return {
    id: String(item.id),
    name: item.name,
    price: String(item.price),
    category: item.category ?? '',
  };
}

export default function AdminItemsScreen() {
  const { token, isLoading } = useAuth();
  const [rows, setRows] = useState<CrudRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const data = await apiFetch<Item[]>('/items', { token });
      setRows(data.map(toRow));
    } catch {
      Alert.alert('Error', 'No se pudieron cargar los items');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const onCreate = useCallback(
    async (data: Record<string, string>) => {
      if (!token) return;
      await apiFetch('/items', {
        token,
        method: 'POST',
        body: { name: data.name, price: Number(data.price) || 0, category: data.category || null },
      });
      await load();
    },
    [token, load]
  );

  const onUpdate = useCallback(
    async (id: string, data: Record<string, string>) => {
      if (!token) return;
      await apiFetch(`/items/${id}`, {
        token,
        method: 'PATCH',
        body: { name: data.name, price: Number(data.price) || 0, category: data.category || null },
      });
      await load();
    },
    [token, load]
  );

  const onDelete = useCallback(
    async (id: string) => {
      if (!token) return;
      await apiFetch(`/items/${id}`, { token, method: 'DELETE' });
      await load();
    },
    [token, load]
  );

  if (isLoading || loading) {
    return (
      <View className={pantalla.rootCentered}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  if (!token) {
    return <Redirect href="/login" />;
  }

  return (
    <AdminCrudList
      title="Items"
      singular="item"
      emptyMessage="Aún no hay items. Crea el primero con el botón Nuevo."
      fields={fields}
      rows={rows}
      onCreate={onCreate}
      onUpdate={onUpdate}
      onDelete={onDelete}
    />
  );
}
