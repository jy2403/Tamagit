import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import type { Item, PetDetail } from '@/lib/types';

export function useAdminPet(petId: string) {
  const { token } = useAuth();
  const router = useRouter();
  const [pet, setPet] = useState<PetDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPet = useCallback(async () => {
    if (!token || !petId) return;
    try {
      const data = await apiFetch<PetDetail>(`/pets/${petId}`, { token });
      setPet(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar la mascota');
    }
  }, [token, petId]);

  const load = useCallback(async () => {
    setLoading(true);
    await fetchPet();
    setLoading(false);
  }, [fetchPet]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoading(true);
      fetchPet().then(() => {
        if (!cancelled) setLoading(false);
      });
      return () => {
        cancelled = true;
      };
    }, [fetchPet])
  );

  const deletePet = useCallback(
    async (reason: string) => {
      if (!token || !petId) return;
      await apiFetch(`/pets/${petId}`, {
        token,
        method: 'DELETE',
        body: { reason: reason || 'Sin motivo indicado' },
      });
      router.back();
    },
    [token, petId, router]
  );

  return { pet, loading, error, load, deletePet };
}

export function usePetItems(petId: string, onAdded?: () => Promise<void>) {
  const { token } = useAuth();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [catalog, setCatalog] = useState<Item[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);

  const openPicker = useCallback(async () => {
    if (!token) return;
    setPickerOpen(true);
    setCatalogLoading(true);
    try {
      const data = await apiFetch<Item[]>('/items', { token });
      setCatalog(data);
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'No se pudieron cargar los items');
    } finally {
      setCatalogLoading(false);
    }
  }, [token]);

  const closePicker = useCallback(() => setPickerOpen(false), []);

  const addItem = useCallback(
    async (item: Item) => {
      if (!token || !petId) return;
      try {
        await apiFetch(`/pets/${petId}/items`, {
          token,
          method: 'POST',
          body: { itemId: item.id },
        });
        setPickerOpen(false);
        await onAdded?.();
      } catch (e) {
        Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo añadir el item');
      }
    },
    [token, petId, onAdded]
  );

  return { pickerOpen, catalog, catalogLoading, openPicker, closePicker, addItem };
}
