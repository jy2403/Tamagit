import { useCallback, useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import type { Feedback } from '@/components/FeedbackBanner';
import type { Dish, FeedResult, Pet, ProjectPet } from '@/lib/types';

type PetActionsDependencies = {
  pet: ProjectPet | null;
  setPet: (pet: ProjectPet | null) => void;
};

export function usePetActions(projectId: string, deps: PetActionsDependencies) {
  const { token } = useAuth();
  const router = useRouter();
  const { pet, setPet } = deps;

  const [feedback, setFeedback] = useState<Feedback>(null);
  const [deleting, setDeleting] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');

  const setError = useCallback((texto: string) => {
    setFeedback({ tipo: 'error', texto });
  }, []);

  const setSuccess = useCallback((texto: string) => {
    setFeedback({ tipo: 'exito', texto });
  }, []);

  const createPet = useCallback(
    async (lifeBranch: string | null) => {
      if (!token) return;
      setFeedback(null);
      try {
        const data = await apiFetch<ProjectPet>(`/projects/${projectId}/pet`, {
          token,
          method: 'POST',
          body: { lifeBranch: lifeBranch ?? undefined },
        });
        setPet(data);
        setSuccess(`Mascota "${data.pet?.name}" creada correctamente.`);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'No se pudo crear la mascota');
      }
    },
    [token, projectId, setPet, setError, setSuccess]
  );

  const feedPet = useCallback(
    async (dish: Dish, onFed?: (result: FeedResult) => void) => {
      if (!token || !pet?.pet) return;
      setFeedback(null);
      try {
        const data = await apiFetch<FeedResult>(`/pets/${pet.pet.id}/feed`, {
          token,
          method: 'POST',
          body: { commitId: dish.commitId },
        });
        setPet({ ...pet, pet: data.pet });
        onFed?.(data);
        setSuccess(
          `¡${data.pet.name} se comió "${dish.message}" y recuperó ${data.dish.healed.hungerRestore} de hambre! 🍽️`
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : 'No se pudo alimentar a la mascota');
      }
    },
    [token, pet, setPet, setError, setSuccess]
  );

  const hidePet = useCallback(async () => {
    if (!token || !pet?.pet) return;
    setFeedback(null);
    try {
      await apiFetch(`/pets/${pet.pet.id}/hide`, { token, method: 'POST', body: {} });
      setPet({ ...pet, pet: null, hiddenByUser: true });
      setSuccess('Mascota ocultada para tu cuenta.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo ocultar la mascota');
    }
  }, [token, pet, setPet, setError, setSuccess]);

  const unhidePet = useCallback(async () => {
    if (!token || !pet?.pet) return;
    setFeedback(null);
    try {
      await apiFetch(`/pets/${pet.pet.id}/unhide`, { token, method: 'POST', body: {} });
      setSuccess('Mascota visible de nuevo.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo mostrar la mascota');
    }
  }, [token, pet, setError, setSuccess]);

  const deletePet = useCallback(async () => {
    if (!token || !pet?.pet) return;
    setDeleting(true);
    setFeedback(null);
    try {
      await apiFetch(`/pets/${pet.pet.id}`, { token, method: 'DELETE' });
      setPet({ ...pet, pet: null, hiddenByUser: false });
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo eliminar la mascota');
    } finally {
      setDeleting(false);
    }
  }, [token, pet, setPet, router, setError]);

  const startRename = useCallback(() => {
    if (!pet?.pet) return;
    setNameDraft(pet.pet.name);
    setEditingName(true);
  }, [pet]);

  const saveName = useCallback(async () => {
    if (!pet?.pet || !token) return;
    const trimmed = nameDraft.trim();
    if (trimmed && trimmed !== pet.pet.name) {
      setFeedback(null);
      try {
        const data = await apiFetch<Pet>(`/pets/${pet.pet.id}`, {
          token,
          method: 'PATCH',
          body: { name: trimmed },
        });
        setPet({ ...pet, pet: data });
        setSuccess(`Tu mascota ahora se llama "${trimmed}".`);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'No se pudo cambiar el nombre');
      }
    }
    setEditingName(false);
  }, [pet, token, nameDraft, setPet, setError, setSuccess]);

  return {
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
  };
}
