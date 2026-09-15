import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import type { UserPets } from '@/lib/types';

export default function AdminUserPetsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token, user: currentUser, isLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<UserPets | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token || !id) return;
    try {
      const result = await apiFetch<UserPets>(`/users/${id}/pets`, { token });
      setData(result);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar las mascotas');
    } finally {
      setLoading(false);
    }
  }, [token, id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (isLoading || loading) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-950">
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  if (!token) {
    return <Redirect href="/login" />;
  }

  if (!currentUser?.isAdmin) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-950">
        <Text className="text-neutral-400">Sin permisos de administrador.</Text>
      </View>
    );
  }

  const userName = data?.user.githubUsername ?? data?.user.name ?? 'Usuario';

  return (
    <View className="flex-1 bg-neutral-950">
      <View className="flex-row items-center px-5 pb-3 pt-16">
        <Pressable onPress={() => router.back()} className="pr-4">
          <Text className="text-emerald-400">Atras</Text>
        </Pressable>
        <View className="flex-1">
          <Text className="text-2xl font-bold text-white">Mascotas de {userName}</Text>
          <Text className="text-sm text-neutral-400" numberOfLines={1}>
            Gestiona sus mascotas desde aquí
          </Text>
        </View>
      </View>

      {error ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-sm text-red-400">{error}</Text>
          <Pressable onPress={() => void load()} className="mt-4 rounded-lg bg-white/10 px-4 py-2">
            <Text className="text-sm text-emerald-400">Reintentar</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={data?.pets ?? []}
          keyExtractor={(item) => String(item.pet.id)}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          ListEmptyComponent={
            <View className="items-center justify-center px-6 py-16">
              <Text className="text-center text-base text-neutral-400">
                Este usuario no tiene mascotas todavía.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 active:bg-neutral-800"
              onPress={() =>
                router.push({ pathname: '/admin/pets/[petId]', params: { petId: String(item.pet.id) } })
              }>
              <View className="flex-row items-center">
                <View className="mr-3 h-11 w-11 items-center justify-center rounded-full bg-white/10">
                  <Text className="text-xl">{item.pet.imageUrl ? '🐾' : '🥚'}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-white">{item.pet.name}</Text>
                  <Text className="text-sm text-neutral-400" numberOfLines={1}>
                    {item.pet.projectName}
                  </Text>
                </View>
                <Text className="text-sm text-emerald-400">Gestionar</Text>
              </View>
              <View className="mt-3 flex-row flex-wrap gap-1.5">
                <Pill label={`${item.pet.species}`} />
                <Pill label={`nivel ${item.pet.level}`} />
                <Pill label={`${item.pet.health} salud`} />
                <Pill label={`${item.pet.itemCount} items`} />
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

function Pill({ label }: { label: string }) {
  return (
    <View className="rounded-full bg-neutral-800 px-2.5 py-1">
      <Text className="text-xs text-neutral-300">{label}</Text>
    </View>
  );
}