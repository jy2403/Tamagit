import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ClayBackground } from '@/components/clay/ClayBackground';
import { ClayButton } from '@/components/clay/ClayButton';
import { ClayIconButton } from '@/components/clay/ClayIconButton';
import { ClayPill } from '@/components/clay/ClayPill';
import { ClaySurface } from '@/components/clay/ClaySurface';
import { useUserPets } from '@/hooks/useUserPets';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { clay, radios, sombras } from '@/estilos';

export default function AdminUserPetsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data, loading, error, load } = useUserPets(id);
  const authStatus = useRequireAuth({ admin: true, extraLoading: loading });

  if (authStatus === 'loading') {
    return (
      <ClayBackground>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={clay.violeta[0]} />
        </View>
      </ClayBackground>
    );
  }
  if (authStatus === 'anonymous') return <Redirect href="/login" />;
  if (authStatus === 'forbidden') {
    return (
      <ClayBackground>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Text style={{ textAlign: 'center', fontSize: 14, color: clay.textoSuave }}>
            Sin permisos de administrador.
          </Text>
        </View>
      </ClayBackground>
    );
  }

  const userName = data?.user.githubUsername ?? data?.user.name ?? 'Usuario';

  return (
    <ClayBackground>
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 16,
          paddingBottom: 10,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}>
        <ClayIconButton
          icon="←"
          accessibilityLabel="Volver a usuarios"
          onPress={() => router.back()}
          size={46}
        />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text numberOfLines={1} style={{ fontSize: 17, fontWeight: '900', color: clay.texto }}>
            Mascotas de {userName}
          </Text>
          <Text style={{ marginTop: 2, fontSize: 10, color: clay.textoSuave }}>
            Gestiona sus mascotas desde aquí
          </Text>
        </View>
      </View>

      {error ? (
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 }}>
          <Text style={{ textAlign: 'center', fontSize: 13, color: '#B4221B' }}>{error}</Text>
          <ClayButton
            title="Reintentar"
            colors={clay.violeta}
            pixel={false}
            size="md"
            onPress={() => void load()}
          />
        </View>
      ) : (
        <FlatList
          data={data?.pets ?? []}
          keyExtractor={(item) => String(item.pet.id)}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: Math.max(insets.bottom + 24, 36),
          }}
          ListEmptyComponent={
            <ClaySurface
              colors={clay.blanco}
              radius={radios.tarjeta}
              border
              contentStyle={{ padding: 24, alignItems: 'center' }}>
              <Text style={{ textAlign: 'center', fontSize: 13, color: clay.textoSuave }}>
                Este usuario no tiene mascotas todavía.
              </Text>
            </ClaySurface>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/admin/pets/[petId]',
                  params: { petId: String(item.pet.id) },
                })
              }
              style={({ pressed }) => [
                { borderRadius: radios.tarjeta },
                pressed ? { transform: [{ scale: 0.98 }] } : null,
              ]}>
              <ClaySurface
                colors={clay.blanco}
                radius={radios.tarjeta}
                border
                style={sombras.tarjeta}
                contentStyle={{ padding: 14, gap: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: 'rgba(119,187,162,0.18)',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Text style={{ fontSize: 16, fontWeight: '900', color: clay.menta[1] }}>
                      {item.pet.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      numberOfLines={1}
                      style={{ fontSize: 15, fontWeight: '900', color: clay.texto }}>
                      {item.pet.name}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={{ marginTop: 2, fontSize: 11, color: clay.textoSuave }}>
                      {item.pet.projectName}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 11, fontWeight: '900', color: clay.fucsia[0] }}>
                    Gestionar
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  <Pill label={item.pet.species} />
                  <Pill label={`${item.pet.health} salud`} />
                  <Pill label={`felicidad ${item.pet.happiness}`} />
                  <Pill label={`${item.pet.itemCount} items`} />
                </View>
              </ClaySurface>
            </Pressable>
          )}
        />
      )}
    </ClayBackground>
  );
}

function Pill({ label }: { label: string }) {
  return <ClayPill label={label} colors={clay.blanco} textColor={clay.texto} />;
}
