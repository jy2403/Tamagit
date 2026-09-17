import { Redirect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';
import { AdminCrudList, type CrudField, type CrudRow } from '@/components/AdminCrudList';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import type { Food } from '@/lib/types';
import { pantalla } from '@/estilos';

const fields: CrudField[] = [
  { key: 'name', label: 'Nombre', placeholder: 'Ej: Manzana' },
  { key: 'hungerRestore', label: 'Hambre restaurada', placeholder: 'Ej: 30', isNumber: true },
  { key: 'price', label: 'Precio', placeholder: 'Ej: 50', isNumber: true },
];

function toRow(food: Food): CrudRow {
  return {
    id: String(food.id),
    name: food.name,
    hungerRestore: String(food.hungerRestore),
    price: String(food.price),
  };
}

export default function AdminFoodsScreen() {
  const { token, isLoading } = useAuth();
  const [rows, setRows] = useState<CrudRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const data = await apiFetch<Food[]>('/foods', { token });
      setRows(data.map(toRow));
    } catch {
      Alert.alert('Error', 'No se pudieron cargar las comidas');
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
      await apiFetch('/foods', {
        token,
        method: 'POST',
        body: {
          name: data.name,
          hungerRestore: Number(data.hungerRestore) || 30,
          price: Number(data.price) || 0,
        },
      });
      await load();
    },
    [token, load]
  );

  const onUpdate = useCallback(
    async (id: string, data: Record<string, string>) => {
      if (!token) return;
      await apiFetch(`/foods/${id}`, {
        token,
        method: 'PATCH',
        body: {
          name: data.name,
          hungerRestore: Number(data.hungerRestore) || 30,
          price: Number(data.price) || 0,
        },
      });
      await load();
    },
    [token, load]
  );

  const onDelete = useCallback(
    async (id: string) => {
      if (!token) return;
      await apiFetch(`/foods/${id}`, { token, method: 'DELETE' });
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
      title="Comidas"
      singular="comida"
      emptyMessage="Aún no hay comidas. Crea la primera con el botón Nuevo."
      fields={fields}
      rows={rows}
      onCreate={onCreate}
      onUpdate={onUpdate}
      onDelete={onDelete}
    />
  );
}
