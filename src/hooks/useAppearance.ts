import { useSyncExternalStore } from 'react';
import type { Item, PetItem, Slot } from '@/lib/appearance';

export type InventoryStatus = 'loading' | 'ready' | 'empty' | 'error';

type AppearanceState = {
  items: PetItem[];
  status: InventoryStatus;
};

const MOCK_ITEMS: readonly Item[] = [
  { id: 'head-gorra', name: 'Gorra neón', slot: 'HEAD', imageUrl: null, emoji: '🧢' },
  { id: 'head-corona', name: 'Corona pixel', slot: 'HEAD', imageUrl: null, emoji: '👑' },
  { id: 'head-sombrero', name: 'Sombrero Y2K', slot: 'HEAD', imageUrl: null, emoji: '🎩' },
  { id: 'body-hoodie', name: 'Hoodie cyber', slot: 'BODY', imageUrl: null, emoji: '🧥' },
  { id: 'body-camiseta', name: 'Camiseta matrix', slot: 'BODY', imageUrl: null, emoji: '👕' },
  { id: 'body-chaleco', name: 'Chaleco glow', slot: 'BODY', imageUrl: null, emoji: '🦺' },
  { id: 'legs-cargo', name: 'Pantalón cargo', slot: 'LEGS', imageUrl: null, emoji: '👖' },
  { id: 'legs-botas', name: 'Botas glow', slot: 'LEGS', imageUrl: null, emoji: '🥾' },
  { id: 'legs-calcetines', name: 'Calcetines neón', slot: 'LEGS', imageUrl: null, emoji: '🧦' },
];

let state: AppearanceState = {
  items: MOCK_ITEMS.map((item) => ({ ...item, equipped: false })),
  status: 'ready',
};

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

function update(next: AppearanceState) {
  state = next;
  listeners.forEach((listener) => listener());
}

function equip(id: string) {
  const target = state.items.find((item) => item.id === id);
  if (!target) return;

  update({
    ...state,
    items: state.items.map((item) =>
      item.slot === target.slot ? { ...item, equipped: item.id === id } : item
    ),
  });
}

function unequip(id: string) {
  update({
    ...state,
    items: state.items.map((item) => (item.id === id ? { ...item, equipped: false } : item)),
  });
}

function setStatus(status: InventoryStatus) {
  update({ ...state, status });
}

function buildEquippedBySlot(items: PetItem[]) {
  const equipped: Record<Slot, PetItem | null> = { HEAD: null, BODY: null, LEGS: null };
  items.forEach((item) => {
    if (item.equipped) equipped[item.slot] = item;
  });
  return equipped;
}

export function useAppearance() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return {
    items: snapshot.items,
    status: snapshot.status,
    equippedBySlot: buildEquippedBySlot(snapshot.items),
    equip,
    unequip,
    setStatus,
  };
}
