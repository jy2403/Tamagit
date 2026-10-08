import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { useUserPets } from '@/hooks/useUserPets';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { lista, pantalla, tarjeta, tipografia } from '@/estilos';

export default function AdminUserPetsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data, loading, error, load } = useUserPets(id);
  const authStatus = useRequireAuth({ admin: true, extraLoading: loading });

  if (authStatus === 'loading') {
    return (
      <View className={pantalla.rootCentered}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }
  if (authStatus === 'anonymous') return <Redirect href="/login" />;
  if (authStatus === 'forbidden') {
    return (
      <View className={pantalla.rootCentered}>
        <Text className="text-neutral-400">Sin permisos de administrador.</Text>
      </View>
    );
  }

  const userName = data?.user.githubUsername ?? data?.user.name ?? 'Usuario';

  return (
    <View className={pantalla.root}>
      <View className={pantalla.header}>
        <Pressable onPress={() => router.back()} className="pr-4">
          <Text className={tipografia.enlace}>Atras</Text>
        </Pressable>
        <View className="flex-1">
          <Text className={tipografia.titulo}>Mascotas de {userName}</Text>
          <Text className={tipografia.subtitulo} numberOfLines={1}>
            Gestiona sus mascotas desde aquí
          </Text>
        </View>
      </View>

      {error ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-sm text-red-400">{error}</Text>
          <Pressable onPress={() => void load()} className="mt-4 rounded-lg bg-white/10 px-4 py-2">
            <Text className={tipografia.enlace}>Reintentar</Text>
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
              className={tarjeta.presionable}
              onPress={() =>
                router.push({
                  pathname: '/admin/pets/[petId]',
                  params: { petId: String(item.pet.id) },
                })
              }>
              <View className="flex-row items-center">
                <View className="mr-3 h-11 w-11 items-center justify-center rounded-full bg-white/10">
                  <Text className="text-xl">{item.pet.imageUrl ? '🐾' : '🥚'}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-white">{item.pet.name}</Text>
                  <Text className={tipografia.subtitulo} numberOfLines={1}>
                    {item.pet.projectName}
                  </Text>
                </View>
                <Text className={tipografia.enlace}>Gestionar</Text>
              </View>
              <View className="mt-3 flex-row flex-wrap gap-1.5">
                <Pill label={`${item.pet.species}`} />
                <Pill label={`${item.pet.health} salud`} />
                <Pill label={`felicidad ${item.pet.happiness}`} />
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
    <View className={lista.pill}>
      <Text className={lista.pillTexto}>{label}</Text>
    </View>
  );
}
