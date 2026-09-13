import { Redirect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, RefreshControl, Text, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import type { Project } from '@/lib/types';
import { Button } from '@/layout/Button';

export default function ProjectsScreen() {
  const { token, user, signOut, isLoading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    if (!token) return [] as Project[];
    return apiFetch<Project[]>('/projects', { token });
  }, [token]);

  const applyProjects = useCallback((data: Project[]) => {
    setProjects(data);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!token) return;
    fetchProjects()
      .then(applyProjects)
      .catch((e) => {
        setError(e instanceof Error ? e.message : 'No se pudieron cargar los proyectos');
        setLoading(false);
      });
  }, [token, fetchProjects, applyProjects]);

  const sync = useCallback(async () => {
    if (!token) return;
    setSyncing(true);
    setError(null);
    try {
      await apiFetch('/projects/sync', { token, method: 'POST', body: {} });
      const data = await fetchProjects();
      applyProjects(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo sincronizar');
    } finally {
      setSyncing(false);
    }
  }, [token, fetchProjects, applyProjects]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProjects()
      .then(applyProjects)
      .catch((e) => {
        setError(e instanceof Error ? e.message : 'No se pudieron cargar los proyectos');
      })
      .finally(() => setRefreshing(false));
  }, [fetchProjects, applyProjects]);

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

  const firstPet = projects.find((p) => p.pet)?.pet;

  return (
    <View className="flex-1 bg-neutral-950">
      <View className="flex-row items-center justify-between px-5 pb-3 pt-16">
        <View>
          <Text className="text-2xl font-bold text-white">Mis proyectos</Text>
          <Text className="text-sm text-emerald-400">
            {user?.githubUsername ? `@${user.githubUsername}` : 'Conectado con GitHub'}
          </Text>
        </View>
        <Pressable onPress={() => void signOut()} className="rounded-lg px-3 py-2">
          <Text className="font-medium text-emerald-400">Salir</Text>
        </Pressable>
      </View>

      {firstPet ? (
        <View className="mx-5 mb-3 items-center rounded-2xl border-2 border-emerald-800 bg-emerald-950/40 py-4">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-white/10">
            {firstPet.imageUrl ? (
              <Image source={{ uri: firstPet.imageUrl }} className="h-full w-full" resizeMode="contain" />
            ) : (
              <Text className="text-3xl">🥚</Text>
            )}
          </View>
          <Text className="mt-2 font-semibold text-white">{firstPet.name}</Text>
          <Text className="text-xs text-emerald-300">
            {firstPet.species} · nivel {firstPet.level}
          </Text>
        </View>
      ) : null}

      <View className="px-5 pb-3">
        <Button
          title={syncing ? 'Sincronizando...' : 'Sincronizar con GitHub'}
          onPress={() => void sync()}
          disabled={syncing}
        />
      </View>

      {error ? <Text className="px-5 pb-2 text-sm text-red-400">{error}</Text> : null}

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />}
          ListEmptyComponent={
            <View className="items-center justify-center px-6 py-16">
              <Text className="text-center text-base text-neutral-400">
                Aún no hay proyectos. Presiona el botón Sincronizar con GitHub para empezar.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 active:bg-neutral-800"
              onPress={() =>
                router.push({
                  pathname: '/project/[id]',
                  params: { id: String(item.id), fullName: item.fullName ?? '', name: item.name },
                })
              }>
              <Text className="text-base font-semibold text-white">{item.name}</Text>
              {item.fullName ? (
                <Text className="text-sm text-neutral-400">{item.fullName}</Text>
              ) : null}
              <View className="mt-2 flex-row flex-wrap gap-1.5">
                {item.mainLanguage ? (
                  <View className="rounded-full bg-emerald-900/60 px-2.5 py-1">
                    <Text className="text-xs font-medium text-emerald-300">{item.mainLanguage}</Text>
                  </View>
                ) : null}
                {item.tools.slice(0, 4).map((tool) => (
                  <View key={tool} className="rounded-full bg-neutral-800 px-2.5 py-1">
                    <Text className="text-xs text-neutral-300">{tool}</Text>
                  </View>
                ))}
              </View>
              <View className="mt-3 flex-row items-center justify-between">
                {item.pet ? (
                  <Text className="text-sm text-neutral-300">
                    {item.pet.name} · {item.pet.species} · nivel {item.pet.level}
                  </Text>
                ) : (
                  <Text className="text-sm text-neutral-500">Sin mascota aún</Text>
                )}
                <Text className="text-xs text-emerald-400">Ver más</Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}