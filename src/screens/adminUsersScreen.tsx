import { Redirect, useRouter } from 'expo-router';
import { FlatList, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ClayBackground } from '@/components/clay/ClayBackground';
import { ClayButton } from '@/components/clay/ClayButton';
import { ClayHeader } from '@/components/clay/ClayHeader';
import { ClayPill } from '@/components/clay/ClayPill';
import { ClayRow } from '@/components/clay/ClayRow';
import {
  ClayEmptyState,
  ClayForbiddenScreen,
  ClayLoadingScreen,
} from '@/components/clay/ClayStates';
import { useAuth } from '@/context/AuthContext';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { clay } from '@/estilos';

export default function AdminUsersScreen() {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { users, loading, toggleBan } = useAdminUsers();
  const authStatus = useRequireAuth({ admin: true, extraLoading: loading });

  if (authStatus === 'loading') return <ClayLoadingScreen />;
  if (authStatus === 'anonymous') return <Redirect href="/login" />;
  if (authStatus === 'forbidden') return <ClayForbiddenScreen title="Usuarios" />;

  const openPets = (id: number) =>
    router.push({ pathname: '/admin/users/[id]', params: { id: String(id) } });

  return (
    <ClayBackground>
      <ClayHeader title="Usuarios" subtitle={`${users.length} registrados`} />
      <FlatList
        data={users}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom + 24, 36),
          gap: 12,
        }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isSelf = item.id === currentUser?.id;
          return (
            <ClayRow
              icon={<Text style={{ fontSize: 22 }}>{item.avatarUrl ? '👤' : '❓'}</Text>}
              title={item.githubUsername ?? item.name ?? 'Sin nombre'}
              subtitle={item.email ?? '—'}
              onPress={() => openPets(item.id)}
              accessibilityLabel={`Ver mascotas de ${item.githubUsername ?? item.name ?? 'usuario'}`}
              footer={
                <>
                  <ClayButton
                    title="Mascotas"
                    onPress={() => openPets(item.id)}
                    colors={clay.blanco}
                    textColor={clay.texto}
                    pixel={false}
                    size="md"
                    style={{ flex: 1 }}
                  />
                  {!isSelf ? (
                    <ClayButton
                      title={item.isBanned ? 'Desbanear' : 'Banear'}
                      onPress={() => void toggleBan(item)}
                      colors={item.isBanned ? clay.menta : clay.rojo}
                      textColor={item.isBanned ? clay.texto : '#FFFFFF'}
                      pixel={false}
                      size="md"
                      style={{ flex: 1 }}
                    />
                  ) : null}
                </>
              }>
              {item.isAdmin || item.isBanned ? (
                <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
                  {item.isAdmin ? (
                    <ClayPill label="Admin" colors={clay.ambar} textColor="#1A1A1C" />
                  ) : null}
                  {item.isBanned ? <ClayPill label="Baneado" colors={clay.rojo} /> : null}
                </View>
              ) : null}
            </ClayRow>
          );
        }}
        ListEmptyComponent={<ClayEmptyState emoji="👥" title="No hay usuarios registrados." />}
      />
    </ClayBackground>
  );
}
