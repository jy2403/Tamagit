import { useMemo } from 'react';
import type { AnalyzeResult, Dish } from '@/lib/types';

export function useSpeechBubble(latest: AnalyzeResult['latest'], dishes: Dish[], syncing: boolean) {
  return useMemo(() => {
    if (syncing) return 'Pensando...';
    return (
      latest?.summary ??
      latest?.message ??
      (dishes.length === 0
        ? '¡Haz tu primer commit y dame de comer! 🐾'
        : (dishes[0]?.summary ?? dishes[0]?.message))
    );
  }, [latest, dishes, syncing]);
}
