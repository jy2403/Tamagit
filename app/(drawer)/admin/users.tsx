import { Redirect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, Text, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import type { User } from '@/lib/types';
import { boton, lista, pantalla, tipografia } from '@/estilos';

export default function AdminUsersScreen() {
  const { token, user: currentUser, isLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const data = await apiFetch<User[]>('/users', { token });
      setUsers(data);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar los usuarios');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { void load(); }, [load]);

  const toggleBan = useCallback(async (target: User) => {
    if (!token || !currentUser?.isAdmin) return;
    const newBanned = !target.isBanned;
    const action = newBanned ? 'banear' : 'desbanear';
    Alert.alert(`${newBanned ? 'Banear' : 'Desbanear'}`, `¿Seguro que quieres ${action} a ${target.githubUsername ?? target.name ?? target.email}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: newBanned ? 'Banear' : 'Desbanear',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiFetch(`/users/${target.id}/ban`, { token, method: 'PATCH', body: { isBanned: newBanned } });
            await load();
          } catch (e) {
            Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo actualizar');
          }
        },
      },
    ]);
  }, [token, currentUser, load]);

  if (isLoading || loading) {
    return (<View className={pantalla.rootCentered}><ActivityIndicator size="large" color="#10b981" /></View>);
  }
  if (!token) return <Redirect href="/login" />;
  if (!currentUser?.isAdmin) {
    return (<View className={pantalla.rootCentered}><Text className="text-neutral-400">Sin permisos de administrador.</Text></View>);
  }

  return (
    <View className={pantalla.root}>
      <View className={pantalla.header}>
        <Text className={tipografia.titulo}>Usuarios</Text>
      </View>
      <FlatList data={users} keyExtractor={(item) => String(item.id)} contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => {
          const isSelf = item.id === currentUser?.id;
          return (
            <View className={lista.fila}>
              <Pressable className="flex-1 flex-row items-center" onPress={() => router.push({ pathname: '/admin/users/[id]', params: { id: String(item.id) } })}>
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-white/10">
                  <Text className="text-lg">{item.avatarUrl ? '👤' : '❓'}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-white" numberOfLines={1}>{item.githubUsername ?? item.name ?? 'Sin nombre'}</Text>
                  <Text className={tipografia.subtitulo} numberOfLines={1}>{item.email ?? '—'}</Text>
                  <View className="mt-1 flex-row gap-2">
                    {item.isAdmin ? <View className="rounded bg-emerald-900/60 px-1.5 py-0.5"><Text className="text-[10px] text-emerald-300">Admin</Text></View> : null}
                    {item.isBanned ? <View className="rounded bg-red-900/60 px-1.5 py-0.5"><Text className="text-[10px] text-red-300">Baneado</Text></View> : null}
                  </View>
                </View>
              </Pressable>
              <Pressable className={boton.enlace} onPress={() => router.push({ pathname: '/admin/users/[id]', params: { id: String(item.id) } })}>
                <Text className={tipografia.enlace}>Mascotas</Text>
              </Pressable>
              {!isSelf ? (
                <Pressable className={boton.enlace} onPress={() => void toggleBan(item)}>
                  <Text className={tipografia.error}>{item.isBanned ? 'Desbanear' : 'Banear'}</Text>
                </Pressable>
              ) : null}
            </View>
          );
        }}
        ListEmptyComponent={<Text className={lista.vacio}>No hay usuarios registrados.</Text>}
      />
    </View>
  );
}