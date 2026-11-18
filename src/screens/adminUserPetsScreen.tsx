import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { FlatList, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ClayBackground } from '@/components/clay/ClayBackground';
import { ClayHeader } from '@/components/clay/ClayHeader';
import { ClayPill } from '@/components/clay/ClayPill';
import { ClayRow } from '@/components/clay/ClayRow';
import {
  ClayEmptyState,
  ClayErrorState,
  ClayForbiddenScreen,
  ClayLoadingScreen,
} from '@/components/clay/ClayStates';
import { useUserPets } from '@/hooks/useUserPets';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { clay, paleta } from '@/estilos';

export default function AdminUserPetsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data, loading, error, load } = useUserPets(id);
  const authStatus = useRequireAuth({ admin: true, extraLoading: loading });

  if (authStatus === 'loading') return <ClayLoadingScreen />;
  if (authStatus === 'anonymous') return <Redirect href="/login" />;
  if (authStatus === 'forbidden') return <ClayForbiddenScreen title="Mascotas" />;

  const userName = data?.user.githubUsername ?? data?.user.name ?? 'Usuario';

  return (
    <ClayBackground>
      <ClayHeader title={`Mascotas de ${userName}`} subtitle="Gestiona sus mascotas desde aquí" />

      {error ? (
        <ClayErrorState message={error} onRetry={() => void load()} />
      ) : (
        <FlatList
          data={data?.pets ?? []}
          keyExtractor={(item) => String(item.pet.id)}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: Math.max(insets.bottom + 24, 36),
            gap: 12,
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<ClayEmptyState title="Este usuario no tiene mascotas todavía." />}
          renderItem={({ item }) => (
            <ClayRow
              icon={<Text style={{ fontSize: 22 }}>{item.pet.imageUrl ? '🐾' : '🥚'}</Text>}
              title={item.pet.name}
              subtitle={item.pet.projectName}
              onPress={() =>
                router.push({
                  pathname: '/admin/pets/[petId]',
                  params: { petId: String(item.pet.id) },
                })
              }
              accessibilityLabel={`Gestionar a ${item.pet.name}`}
              right={
                <Text style={{ fontSize: 14, fontWeight: '900', color: paleta.fucsia.base }}>
                  →
                </Text>
              }>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                <ClayPill
                  label={item.pet.species}
                  colors={clay.fondoClaro}
                  textColor={clay.texto}
                />
                <ClayPill
                  label={`${item.pet.health} salud`}
                  colors={clay.fondoClaro}
                  textColor={clay.texto}
                />
                <ClayPill
                  label={`felicidad ${item.pet.happiness}`}
                  colors={clay.fondoClaro}
                  textColor={clay.texto}
                />
                <ClayPill
                  label={`${item.pet.itemCount} items`}
                  colors={clay.fondoClaro}
                  textColor={clay.texto}
                />
              </View>
            </ClayRow>
          )}
        />
      )}
    </ClayBackground>
  );
}
