import { Redirect, useFocusEffect, useRouter, type Href } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import type { Project } from '@/lib/types';
import { Button } from '@/layout/Button';
import { Pet3DView } from '@/components/Pet3DView';
import { boton, formulario, lista, mascota, pantalla, tarjeta, tipografia } from '@/estilos';
import { showNotificationsOnce } from '@/lib/notifications';

export default function ProjectsScreen() {
  const { token, user, signOut, isLoading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { width } = useWindowDimensions();
  const anchoTarjeta = Math.min(Math.round(width * 0.42), 190);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.fullName ?? '').toLowerCase().includes(q) ||
        p.tools.some((t) => t.toLowerCase().includes(q))
    );
  }, [projects, query]);

  const fetchProjects = useCallback(async () => {
    if (!token) return [] as Project[];
    return apiFetch<Project[]>('/projects', { token });
  }, [token]);

  const applyProjects = useCallback((data: Project[]) => {
    setProjects(data);
    setError(null);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!token) return;
      fetchProjects()
        .then(applyProjects)
        .catch((e) => {
          setError(e instanceof Error ? e.message : 'No se pudieron cargar los proyectos');
          setLoading(false);
        });
      void showNotificationsOnce(token);
    }, [token, fetchProjects, applyProjects])
  );

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
      <View className={pantalla.rootCentered}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  if (!token) {
    return <Redirect href="/login" />;
  }

  const pets = projects
    .filter((p) => p.pet)
    .map((p) => ({ id: p.id, fullName: p.fullName ?? '', pet: p.pet! }));

  return (
    <View className={pantalla.root}>
      <View className={pantalla.header}>
        <View className="min-w-0 flex-1 flex-row items-center gap-3 pr-2">
          {user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} className="h-11 w-11 rounded-full" />
          ) : null}
          <View className="min-w-0 flex-1">
            <Text className={tipografia.titulo} numberOfLines={1}>
              {user?.name || user?.githubUsername || 'TamaGit'}
            </Text>
            {user?.githubUsername ? (
              <Text className="text-xs text-emerald-400" numberOfLines={1}>
                @{user.githubUsername}
              </Text>
            ) : null}
          </View>
        </View>
        <View className="shrink-0 flex-row items-center">
          {user?.isAdmin ? (
            <Pressable onPress={() => router.push('/admin' as Href)} className={boton.enlace}>
              <Text className={tipografia.enlace}>Admin</Text>
            </Pressable>
          ) : null}
          <Pressable onPress={() => router.push('/profile' as Href)} className={boton.enlace}>
            <Text className={tipografia.enlace}>Perfil</Text>
          </Pressable>
          <Pressable onPress={() => void signOut()} className={boton.enlace}>
            <Text className={tipografia.muted}>Salir</Text>
          </Pressable>
        </View>
      </View>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Buscar proyecto por nombre o herramienta..."
        placeholderTextColor="#737373"
        className={`mx-5 ${formulario.busqueda}`}
      />

      {pets.length > 0 ? (
        <View className="mb-2 mt-4">
          <Text className="mb-2 px-5 text-base font-bold text-white">Mis mascotas</Text>
          <FlatList
            horizontal
            data={pets}
            keyExtractor={(item) => String(item.id)}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
            renderItem={({ item }) => (
              <Pressable
                className={mascota.tarjeta}
                style={{ width: anchoTarjeta }}
                onPress={() =>
                  router.push({
                    pathname: '/project/[id]',
                    params: {
                      id: String(item.id),
                      fullName: item.fullName,
                      name: item.pet.name,
                    },
                  })
                }>
                <View className={mascota.escena} style={{ aspectRatio: 3 / 2 }}>
                  <Pet3DView simple species={item.pet.species} style={{ flex: 1 }} />
                </View>
                <View className={mascota.rotulo}>
                  <Text className={mascota.nombre} numberOfLines={1}>
                    {item.pet.name}
                  </Text>
                  <Text className={tipografia.hint} numberOfLines={1}>
                    {item.pet.species} · Felicidad {item.pet.happiness}
                  </Text>
                </View>
              </Pressable>
            )}
          />
        </View>
      ) : null}

      <View className="mt-3 px-5 pb-2 pt-1">
        <Text className="text-base font-bold text-white">Mis proyectos</Text>
      </View>

      <View className="px-5 pb-3">
        <Button
          title={syncing ? 'Sincronizando...' : 'Sincronizar con GitHub'}
          onPress={() => void sync()}
          disabled={syncing}
        />
      </View>

      {error ? <Text className={`px-5 pb-2 ${tipografia.error}`}>{error}</Text> : null}

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />
          }
          ListEmptyComponent={
            <View className="items-center justify-center px-6 py-16">
              <Text className="text-center text-base text-neutral-400">
                {projects.length === 0
                  ? 'Aún no hay proyectos. Presiona el botón Sincronizar con GitHub para empezar.'
                  : `Sin resultados para "${query}".`}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              className={tarjeta.presionable}
              onPress={() =>
                router.push({
                  pathname: '/project/[id]',
                  params: { id: String(item.id), fullName: item.fullName ?? '', name: item.name },
                })
              }>
              <Text className="text-base font-semibold text-white">{item.name}</Text>
              {item.fullName ? <Text className={tipografia.subtitulo}>{item.fullName}</Text> : null}
              <View className="mt-2 flex-row flex-wrap gap-1.5">
                {item.mainLanguage ? (
                  <View className={lista.pillAcento}>
                    <Text className={lista.pillAcentoTexto}>{item.mainLanguage}</Text>
                  </View>
                ) : null}
                {item.tools.slice(0, 4).map((tool) => (
                  <View key={tool} className={lista.pill}>
                    <Text className={lista.pillTexto}>{tool}</Text>
                  </View>
                ))}
              </View>
              <View className="mt-3 flex-row items-center justify-between">
                {item.pet ? (
                  <Text className={tipografia.cuerpo}>
                    {item.pet.name} · {item.pet.species} · felicidad {item.pet.happiness}
                  </Text>
                ) : (
                  <Text className={tipografia.muted}>Sin mascota aún</Text>
                )}
                <Text className={tipografia.enlace}>Ver más</Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}
