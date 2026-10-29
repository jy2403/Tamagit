export type Slot = 'HEAD' | 'BODY' | 'LEGS';

export type Item = {
  id: string;
  name: string;
  slot: Slot;
  imageUrl: string | null;
  emoji: string;
};

export type PetItem = Item & {
  equipped: boolean;
};

export const SLOTS: readonly Slot[] = ['HEAD', 'BODY', 'LEGS'];

export const SLOT_LABELS: Record<Slot, string> = {
  HEAD: 'Cabeza',
  BODY: 'Cuerpo',
  LEGS: 'Parte baja',
};
