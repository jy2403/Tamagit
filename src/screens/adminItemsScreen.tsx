import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { AdminCrudList, type CrudField, type CrudRow } from '@/components/AdminCrudList';
import { ClayBackground } from '@/components/clay/ClayBackground';
import { useAdminCrud } from '@/hooks/useAdminCrud';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { SLOT_LABELS, SLOTS } from '@/lib/appearance';
import type { Item } from '@/lib/types';
import { clay } from '@/estilos';

const fields: CrudField[] = [
  { key: 'name', label: 'Nombre', placeholder: 'Ej: Gorra Neo' },
  {
    key: 'slot',
    label: 'Tipo de ropa',
    optional: true,
    options: [
      { label: 'Sin tipo', value: '' },
      ...SLOTS.map((slot) => ({ label: SLOT_LABELS[slot], value: slot })),
    ],
  },
  { key: 'price', label: 'Precio', placeholder: 'Ej: 150', isNumber: true },
];

function toRow(item: Item): CrudRow {
  return {
    id: String(item.id),
    name: item.name,
    slot: item.slot ?? '',
    price: String(item.price),
  };
}

function fromRow(data: Record<string, string>) {
  const slot = SLOTS.find((value) => value === data.slot) ?? null;
  return {
    name: data.name,
    price: Number(data.price) || 0,
    category: slot ? SLOT_LABELS[slot] : null,
    slot,
  };
}

export default function AdminItemsScreen() {
  const { rows, loading, onCreate, onUpdate, onDelete } = useAdminCrud<Item>({
    resourcePath: '/items',
    toRow,
    fromRow,
  });
  const authStatus = useRequireAuth({ extraLoading: loading });

  if (authStatus === 'loading') {
    return (
      <ClayBackground>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={clay.violeta[0]} />
        </View>
      </ClayBackground>
    );
  }

  if (authStatus === 'anonymous') {
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
