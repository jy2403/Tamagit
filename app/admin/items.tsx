import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { AdminCrudList, type CrudField, type CrudRow } from '@/components/AdminCrudList';
import { useAuth } from '@/context/AuthContext';

const fields: CrudField[] = [
  { key: 'icon', label: 'Icono', placeholder: 'Ej: 🎩' },
  { key: 'name', label: 'Nombre', placeholder: 'Ej: Gorra Neo' },
  { key: 'precio', label: 'Precio', placeholder: 'Ej: 150', isNumber: true },
];

const initial: CrudRow[] = [
  { id: '1', icon: '🎩', name: 'Gorra Neo', precio: '150' },
  { id: '2', icon: '🧢', name: 'Sombrero Matrix', precio: '250' },
  { id: '3', icon: '🎧', name: 'Auriculares Code', precio: '400' },
  { id: '4', icon: '⌚', name: 'Reloj Hacker', precio: '600' },
];

export default function AdminItemsScreen() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-950">
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
      initial={initial}
    />
  );
}
