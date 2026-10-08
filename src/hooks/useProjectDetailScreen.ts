import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { type View as RNView } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useDragToFeed } from '@/hooks/useDragToFeed';
import { usePetActions } from '@/hooks/usePetActions';
import { usePetOwnership } from '@/hooks/usePetOwnership';
import { useProjectBranches } from '@/hooks/useProjectBranches';
import { useProjectDishes } from '@/hooks/useProjectDishes';
import { useProjectPet } from '@/hooks/useProjectPet';
import { useSpeechBubble } from '@/hooks/useSpeechBubble';
import type { Dish } from '@/lib/types';

export function useProjectDetailScreen() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { id, fullName } = useLocalSearchParams<{ id: string; fullName?: string; name?: string }>();
  const { token, user } = useAuth();
  const router = useRouter();

  const { pet, setPet, loading: petLoading } = useProjectPet(id);
  const { branches, lifeBranch, setLifeBranch } = useProjectBranches(
    fullName,
    pet?.project.defaultBranch,
    !!pet?.pet
  );
  const {
    dishes,
    setDishes,
    dishesLoading,
    syncing,
    latest,
    loadDishes,
    syncNow,
    feedOpen,
    openFeed,
  } = useProjectDishes(id);
  const {
    feedback,
    setFeedback,
    deleting,
    editingName,
    setEditingName,
    nameDraft,
    setNameDraft,
    createPet,
    feedPet,
    hidePet,
    unhidePet,
    deletePet,
    startRename,
    saveName,
  } = usePetActions(id, { pet, setPet });

  const petAreaRef = useRef<RNView>(null);

  const handleFeed = useCallback(
    (dish: Dish) => {
      void feedPet(dish, () => {
        setDishes((prev) =>
          prev.map((d) => (d.commitId === dish.commitId ? { ...d, fed: true } : d))
        );
      });
    },
    [feedPet, setDishes]
  );

  const { dragging, dragAnim, startDrag, moveDrag, endDrag } = useDragToFeed(
    petAreaRef,
    handleFeed
  );

  const bubbleText = useSpeechBubble(latest, dishes, false);
  const isRepoOwner = usePetOwnership(pet?.project, user);

  useEffect(() => {
    if (!pet?.pet?.id || !token) return;
    const timer = setTimeout(() => {
      void syncNow();
      void loadDishes();
    }, 0);
    return () => clearTimeout(timer);
  }, [pet?.pet?.id, token, syncNow, loadDishes]);

  const onSyncPress = useCallback(async () => {
    setFeedback(null);
    try {
      await syncNow();
      await loadDishes();
    } catch (e) {
      setFeedback({
        tipo: 'error',
        texto: e instanceof Error ? e.message : 'No se pudo sincronizar',
      });
    }
  }, [setFeedback, syncNow, loadDishes]);

  return {
    confirmOpen,
    setConfirmOpen,
    fullName,
    router,
    pet,
    petLoading,
    branches,
    lifeBranch,
    setLifeBranch,
    dishes,
    dishesLoading,
    syncing,
    feedback,
    setFeedback,
    deleting,
    editingName,
    setEditingName,
    nameDraft,
    setNameDraft,
    createPet,
    hidePet,
    unhidePet,
    deletePet,
    startRename,
    saveName,
    petAreaRef,
    dragging,
    dragAnim,
    startDrag,
    moveDrag,
    endDrag,
    bubbleText,
    isRepoOwner,
    feedOpen,
    openFeed,
    onSyncPress,
  };
}
