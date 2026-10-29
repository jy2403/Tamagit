import type { Item, Slot } from '@/lib/types';

export const SLOTS: readonly Slot[] = ['HEAD', 'BODY', 'LEGS'];

export const SLOT_LABELS: Record<Slot, string> = {
  HEAD: 'Cabeza',
  BODY: 'Cuerpo',
  LEGS: 'Patas',
};

const SLOT_EMOJIS: Record<Slot, string> = {
  HEAD: '🧢',
  BODY: '👕',
  LEGS: '👖',
};

export function itemEmoji(item: Pick<Item, 'slot'>): string {
  return item.slot ? SLOT_EMOJIS[item.slot] : '🎁';
}
