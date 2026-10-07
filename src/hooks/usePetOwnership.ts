import { useMemo } from 'react';
import type { User } from '@/lib/types';

export function usePetOwnership(
  project: { ownerId: number } | null | undefined,
  currentUser: User | null
) {
  return useMemo(
    () => project != null && project.ownerId === currentUser?.id,
    [project, currentUser]
  );
}
