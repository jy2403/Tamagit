import { Redirect, useRouter, type Href } from 'expo-router';
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
import { Pet3DView } from '@/components/Pet3DView';
import { useProjects } from '@/hooks/useProjects';
import { Button } from '@/layout/Button';
import { boton, formulario, lista, mascota, pantalla, tarjeta, tipografia } from '@/estilos';

export default function ProjectsScreen() {
  const { token, user, signOut, isLoading } = useAuth();
  const router = useRouter();
  const {
    projects,
    filtered,
    pets,
    loading,
    syncing,
    refreshing,
    query,
    setQuery,
    error,
    sync,
    onRefresh,
  } = useProjects();
  const { width } = useWindowDimensions();
  const anchoTarjeta = Math.min(Math.round(width * 0.42), 190);

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
