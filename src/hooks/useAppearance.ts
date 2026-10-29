import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import type { Feedback } from '@/components/FeedbackBanner';
import type { Item, PetDetail, PetItem, Slot } from '@/lib/types';

export type InventoryStatus = 'loading' | 'ready' | 'empty' | 'error';

export type AppearanceEntry = {
  item: Item;
  owned: boolean;
  equipped: boolean;
};

export type Appearance = ReturnType<typeof useAppearance>;

function buildEntries(catalog: Item[], owned: PetItem[]): AppearanceEntry[] {
  const ownedByItem = new Map(owned.map((petItem) => [petItem.itemId, petItem]));
  return catalog.map((item) => {
    const petItem = ownedByItem.get(item.id);
    return { item, owned: Boolean(petItem), equipped: petItem?.equipped ?? false };
  });
}

function buildEquippedBySlot(entries: AppearanceEntry[]) {
  const equipped: Record<Slot, Item | null> = { HEAD: null, BODY: null, LEGS: null };
  entries.forEach(({ item, equipped: isEquipped }) => {
    if (isEquipped && item.slot) equipped[item.slot] = item;
  });
  return equipped;
}

export function useAppearance(petId: number | null | undefined) {
  const { token } = useAuth();
  const [entries, setEntries] = useState<AppearanceEntry[]>([]);
  const [status, setStatus] = useState<InventoryStatus>('loading');
  const [busyItemId, setBusyItemId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const load = useCallback(async () => {
    if (!token || !petId) return;
    try {
      const [catalog, pet] = await Promise.all([
        apiFetch<Item[]>('/items', { token }),
        apiFetch<PetDetail>(`/pets/${petId}`, { token }),
      ]);
      setEntries(buildEntries(catalog, pet.items));
      setStatus(catalog.length === 0 ? 'empty' : 'ready');
    } catch {
      setStatus('error');
    }
  }, [token, petId]);

  const refreshOwned = useCallback(async () => {
    if (!token || !petId) return;
    const pet = await apiFetch<PetDetail>(`/pets/${petId}`, { token });
    setEntries((current) =>
      buildEntries(
        current.map((entry) => entry.item),
        pet.items
      )
    );
  }, [token, petId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const reload = useCallback(() => {
    setStatus('loading');
    return load();
  }, [load]);

  // La regla de negocio vive en el backend: el front solo la dispara y muestra su respuesta.
  const changeEquipment = useCallback(
    async (item: Item, action: 'equip' | 'unequip') => {
      if (!token || !petId || busyItemId !== null) return;
      setFeedback(null);
      setBusyItemId(item.id);
      try {
        await apiFetch(`/pets/${petId}/items/${item.id}/${action}`, {
          token,
          method: 'POST',
          body: {},
        });
        await refreshOwned();
        setFeedback({
          tipo: 'exito',
          texto: action === 'equip' ? `${item.name} equipada.` : `${item.name} desequipada.`,
        });
      } catch (e) {
        setFeedback({
          tipo: 'error',
          texto: e instanceof Error ? e.message : 'No se pudo actualizar la vestimenta',
        });
      } finally {
        setBusyItemId(null);
      }
    },
    [token, petId, busyItemId, refreshOwned]
  );

  const equip = useCallback((item: Item) => changeEquipment(item, 'equip'), [changeEquipment]);
  const unequip = useCallback((item: Item) => changeEquipment(item, 'unequip'), [changeEquipment]);

  return {
    entries,
    status,
    busyItemId,
    feedback,
    setFeedback,
    equippedBySlot: buildEquippedBySlot(entries),
    equip,
    unequip,
    reload,
  };
}
