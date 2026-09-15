import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { AdminCrudList, type CrudField, type CrudRow } from '@/components/AdminCrudList';
import { useAuth } from '@/context/AuthContext';

const fields: CrudField[] = [
  { key: 'icon', label: 'Icono', placeholder: 'Ej: 🍎' },
  { key: 'name', label: 'Nombre', placeholder: 'Ej: Manzana' },
];

const initial: CrudRow[] = [
  { id: '1', icon: '🍎', name: 'Manzana' },
  { id: '2', icon: '🍕', name: 'Pizza' },
  { id: '3', icon: '🥗', name: 'Ensalada' },
  { id: '4', icon: '🍣', name: 'Sushi' },
];

export default function AdminFoodsScreen() {
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
      title="Comidas"
      singular="comida"
      emptyMessage="Aún no hay comidas. Crea la primera con el botón Nuevo."
      fields={fields}
      initial={initial}
    />
  );
}
