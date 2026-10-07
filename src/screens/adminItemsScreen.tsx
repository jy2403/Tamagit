import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { AdminCrudList, type CrudField, type CrudRow } from '@/components/AdminCrudList';
import { useAuth } from '@/context/AuthContext';
import { useAdminCrud } from '@/hooks/useAdminCrud';
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

function fromRow(data: Record<string, string>) {
  return {
    name: data.name,
    price: Number(data.price) || 0,
    category: data.category || null,
  };
}

export default function AdminItemsScreen() {
  const { token, isLoading } = useAuth();
  const { rows, loading, onCreate, onUpdate, onDelete } = useAdminCrud<Item>({
    resourcePath: '/items',
    toRow,
    fromRow,
  });

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
