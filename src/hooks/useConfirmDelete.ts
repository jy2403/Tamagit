import { useState } from 'react';
import type { CrudRow } from '@/components/AdminCrudList';

type ConfirmDeleteState = {
  removing: CrudRow | null;
  deleting: boolean;
  start: (row: CrudRow) => void;
  confirm: (
    onDelete: (id: string) => Promise<void>,
    onError?: (message: string) => void
  ) => Promise<void>;
  cancel: () => void;
};

export function useConfirmDelete(): ConfirmDeleteState {
  const [removing, setRemoving] = useState<CrudRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const start = (row: CrudRow) => setRemoving(row);
  const cancel = () => setRemoving(null);

  const confirm = async (
    onDelete: (id: string) => Promise<void>,
    onError?: (message: string) => void
  ) => {
    if (!removing || deleting) return;
    setDeleting(true);
    try {
      await onDelete(removing.id);
      setRemoving(null);
    } catch (e) {
      setRemoving(null);
      onError?.(e instanceof Error ? e.message : 'No se pudo eliminar');
    } finally {
      setDeleting(false);
    }
  };

  return { removing, deleting, start, confirm, cancel };
}
