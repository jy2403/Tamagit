import { Redirect, useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ClayBackground } from '@/components/clay/ClayBackground';
import { ClayButton } from '@/components/clay/ClayButton';
import { ClayIconButton } from '@/components/clay/ClayIconButton';
import { ClayPill } from '@/components/clay/ClayPill';
import { ClaySurface } from '@/components/clay/ClaySurface';
import { useAuth } from '@/context/AuthContext';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { clay, radios, sombras } from '@/estilos';

export default function AdminUsersScreen() {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { users, loading, toggleBan } = useAdminUsers();
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
          accessibilityLabel="Volver al panel de administrador"
          onPress={() => router.back()}
          size={46}
        />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontSize: 18, fontWeight: '900', color: clay.texto }}>Usuarios</Text>
          <Text style={{ marginTop: 2, fontSize: 10, color: clay.textoSuave }}>
            {users.length} registrados
          </Text>
        </View>
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: Math.max(insets.bottom + 24, 36),
        }}
        renderItem={({ item }) => {
          const isSelf = item.id === currentUser?.id;
          const initial = (item.githubUsername ?? item.name ?? '?').charAt(0).toUpperCase();
          const openPets = () =>
            router.push({ pathname: '/admin/users/[id]', params: { id: String(item.id) } });
          return (
            <ClaySurface
              colors={clay.blanco}
              radius={radios.tarjeta}
              border
              style={{ marginBottom: 10, ...sombras.suave }}
              contentStyle={{ padding: 12, gap: 10 }}>
              <Pressable
                onPress={openPets}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 21,
                    backgroundColor: 'rgba(139,79,248,0.10)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Text style={{ fontSize: 16, fontWeight: '900', color: clay.violeta[0] }}>
                    {initial}
                  </Text>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    numberOfLines={1}
                    style={{ fontSize: 14, fontWeight: '900', color: clay.texto }}>
                    {item.githubUsername ?? item.name ?? 'Sin nombre'}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={{ marginTop: 2, fontSize: 11, color: clay.textoSuave }}>
                    {item.email ?? '—'}
                  </Text>
                  <View style={{ marginTop: 6, flexDirection: 'row', gap: 6 }}>
                    {item.isAdmin ? (
                      <ClayPill label="Admin" colors={clay.violeta} textColor="#FFFFFF" />
                    ) : null}
                    {item.isBanned ? (
                      <ClayPill label="Baneado" colors={clay.rosa} textColor="#FFFFFF" />
                    ) : null}
                  </View>
                </View>
              </Pressable>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <ClayButton
                  title="Mascotas"
                  colors={clay.menta}
                  textColor={clay.texto}
                  pixel={false}
                  size="md"
                  onPress={openPets}
                  style={{ flex: 1 }}
                />
                {!isSelf ? (
                  <ClayButton
                    title={item.isBanned ? 'Desbanear' : 'Banear'}
                    colors={item.isBanned ? clay.blanco : clay.rosa}
                    textColor={item.isBanned ? clay.texto : '#FFFFFF'}
                    pixel={false}
                    size="md"
                    onPress={() => void toggleBan(item)}
                    style={{ flex: 1 }}
                  />
                ) : null}
              </View>
            </ClaySurface>
          );
        }}
        ListEmptyComponent={
          <ClaySurface
            colors={clay.blanco}
            radius={radios.tarjeta}
            border
            contentStyle={{ padding: 24, alignItems: 'center' }}>
            <Text style={{ textAlign: 'center', fontSize: 13, color: clay.textoSuave }}>
              No hay usuarios registrados.
            </Text>
          </ClaySurface>
        }
        showsVerticalScrollIndicator={false}
      />
    </ClayBackground>
  );
}
