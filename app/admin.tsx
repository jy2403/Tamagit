import { Redirect, useRouter, type Href } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';

type Metric = {
  label: string;
  value: string;
  icon: string;
};

const metrics: Metric[] = [
  { label: 'Usuarios', value: '—', icon: '👤' },
  { label: 'Proyectos', value: '—', icon: '📦' },
  { label: 'Mascotas', value: '—', icon: '🐙' },
  { label: 'Commits', value: '—', icon: '📈' },
];

export default function AdminScreen() {
  const { token, isLoading } = useAuth();
  const router = useRouter();
  const activeMetrics = metrics.filter((m) => m.value !== '—');

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
    <View className="flex-1 bg-neutral-950">
      <View className="flex-row items-center px-5 pb-3 pt-16">
        <Pressable onPress={() => router.back()} className="pr-4">
          <Text className="text-emerald-400">Atras</Text>
        </Pressable>
        <Text className="flex-1 text-2xl font-bold text-white">Admin</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 20 }}>
        <View className="flex-row flex-wrap gap-3">
          {metrics.map((m) => (
            <View
              key={m.label}
              className="w-[48%] rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
              <Text className="text-2xl">{m.icon}</Text>
              <Text className="mt-2 text-2xl font-bold text-white">{m.value}</Text>
              <Text className="text-sm text-neutral-400">{m.label}</Text>
            </View>
          ))}
        </View>

        {activeMetrics.length === 0 ? (
          <View className="rounded-2xl border border-dashed border-neutral-800 p-6">
            <Text className="text-center text-sm text-neutral-500">
              Vista preliminar de administración. Conecta aquí las estadísticas del backend.
            </Text>
          </View>
        ) : null}

        <View>
          <Text className="mb-2 text-lg font-semibold text-white">Catálogo</Text>
          <View className="gap-2">
            <AdminLink
              href="/admin/items"
              icon="🎩"
              title="Items"
              description="Cosméticos para las mascotas"
            />
            <AdminLink
              href="/admin/foods"
              icon="🍎"
              title="Comidas"
              description="Alimentos para las mascotas"
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

type AdminLinkProps = {
  href: Href;
  icon: string;
  title: string;
  description: string;
};

function AdminLink({ href, icon, title, description }: AdminLinkProps) {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push(href)}
      className="flex-row items-center rounded-2xl border border-neutral-800 bg-neutral-900 p-4 active:bg-neutral-800">
      <View className="mr-3 h-11 w-11 items-center justify-center rounded-full bg-white/10">
        <Text className="text-xl">{icon}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-white">{title}</Text>
        <Text className="text-xs text-neutral-400">{description}</Text>
      </View>
      <Text className="text-sm text-emerald-400">Ver</Text>
    </Pressable>
  );
}
