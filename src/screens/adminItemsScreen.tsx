import { Redirect } from 'expo-router';
import { AdminCrudList, type CrudField, type CrudRow } from '@/components/AdminCrudList';
import { ClayForbiddenScreen, ClayLoadingScreen } from '@/components/clay/ClayStates';
import { useAdminCrud } from '@/hooks/useAdminCrud';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import type { Item } from '@/lib/types';

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
  const { rows, loading, onCreate, onUpdate, onDelete } = useAdminCrud<Item>({
    resourcePath: '/items',
    toRow,
    fromRow,
  });
  const authStatus = useRequireAuth({ admin: true, extraLoading: loading });

  if (authStatus === 'loading') return <ClayLoadingScreen />;
  if (authStatus === 'anonymous') return <Redirect href="/login" />;
  if (authStatus === 'forbidden') return <ClayForbiddenScreen title="Items" />;

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
