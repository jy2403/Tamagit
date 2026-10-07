import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import type { User } from '@/lib/types';

export function useAdminUsers() {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    try {
      const data = await apiFetch<User[]>('/users', { token });
      setUsers(data);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar los usuarios');
    }
  }, [token]);

  const load = useCallback(async () => {
    setLoading(true);
    await fetchUsers();
    setLoading(false);
  }, [fetchUsers]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoading(true);
      fetchUsers().then(() => {
        if (!cancelled) setLoading(false);
      });
      return () => {
        cancelled = true;
      };
    }, [fetchUsers])
  );

  const toggleBan = useCallback(
    (target: User) => {
      if (!token || !currentUser?.isAdmin) return;
      const newBanned = !target.isBanned;
      const action = newBanned ? 'banear' : 'desbanear';
      Alert.alert(
        `${newBanned ? 'Banear' : 'Desbanear'}`,
        `¿Seguro que quieres ${action} a ${target.githubUsername ?? target.name ?? target.email}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: newBanned ? 'Banear' : 'Desbanear',
            style: 'destructive',
            onPress: async () => {
              try {
                await apiFetch(`/users/${target.id}/ban`, {
                  token,
                  method: 'PATCH',
                  body: { isBanned: newBanned },
                });
                await load();
              } catch (e) {
                Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo actualizar');
              }
            },
          },
        ]
      );
    },
    [token, currentUser, load]
  );

  return { users, loading, load, toggleBan };
}
