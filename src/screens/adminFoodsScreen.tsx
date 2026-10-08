import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { AdminCrudList, type CrudField, type CrudRow } from '@/components/AdminCrudList';
import { useAdminCrud } from '@/hooks/useAdminCrud';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import type { Food } from '@/lib/types';
import { pantalla } from '@/estilos';

const fields: CrudField[] = [
  { key: 'name', label: 'Nombre', placeholder: 'Ej: Manzana' },
  {
    key: 'size',
    label: 'Tamaño',
    placeholder: 'small | medium | large',
    maxLength: 10,
  },
  { key: 'hungerRestore', label: 'Hambre restaurada', placeholder: 'Ej: 30', isNumber: true },
  { key: 'price', label: 'Precio', placeholder: 'Ej: 50', isNumber: true },
];

function toRow(food: Food): CrudRow {
  return {
    id: String(food.id),
    name: food.name,
    size: food.size ?? 'medium',
    hungerRestore: String(food.hungerRestore),
    price: String(food.price),
  };
}

function fromRow(data: Record<string, string>) {
  return {
    name: data.name,
    size: data.size || 'medium',
    hungerRestore: Number(data.hungerRestore) || 30,
    price: Number(data.price) || 0,
  };
}

export default function AdminFoodsScreen() {
  const { rows, loading, onCreate, onUpdate, onDelete } = useAdminCrud<Food>({
    resourcePath: '/foods',
    toRow,
    fromRow,
  });
  const authStatus = useRequireAuth({ extraLoading: loading });

  if (authStatus === 'loading') {
    return (
      <View className={pantalla.rootCentered}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  if (authStatus === 'anonymous') {
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
