import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import type { Commit, Pet } from '@/lib/types';
import { Button } from '@/layout/Button';
import { Pet3DView } from '@/components/Pet3DView';
import { FeedbackBanner, type Feedback } from '@/components/FeedbackBanner';
import { ConfirmModal } from '@/components/ConfirmModal';
import { formulario, pantalla, tarjeta, tipografia } from '@/estilos';

export default function ProjectDetailScreen() {
  const { id, fullName } = useLocalSearchParams<{ id: string; fullName?: string; name?: string }>();
  const { token } = useAuth();
  const router = useRouter();
  const [pet, setPet] = useState<Pet | null>(null);
  const [petLoading, setPetLoading] = useState(true);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [commitsLoading, setCommitsLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [confirmBorrado, setConfirmBorrado] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');

  const onFeedbackDone = useCallback(() => setFeedback(null), []);

  useEffect(() => {
    if (!token) return;
    apiFetch<Pet>(`/projects/${id}/pet`, { token })
      .then(setPet)
      .catch(() => setPet(null))
      .finally(() => setPetLoading(false));
  }, [token, id]);

  useEffect(() => {
    if (!token || !fullName) return;
    apiFetch<Commit[]>(`/github/repos/${fullName}/commits`, { token })
      .then(setCommits)
      .catch(() => setCommits([]))
      .finally(() => setCommitsLoading(false));
  }, [token, fullName]);

  const createPet = useCallback(async () => {
    if (!token) return;
    setFeedback(null);
    try {
      const data = await apiFetch<Pet>(`/projects/${id}/pet`, { token, method: 'POST', body: {} });
      setPet(data);
      setFeedback({ tipo: 'exito', texto: `Mascota "${data.name}" creada correctamente.` });
    } catch (e) {
      setFeedback({ tipo: 'error', texto: e instanceof Error ? e.message : 'No se pudo crear la mascota' });
    }
  }, [token, id]);

  const feedPet = useCallback(async () => {
    if (!token || !pet) return;
    setFeedback(null);
    try {
      const data = await apiFetch<Pet>(`/pets/${pet.id}`, {
        token,
        method: 'PATCH',
        body: { hunger: Math.min(100, pet.hunger + 15) },
      });
      setPet(data);
      setFeedback({ tipo: 'exito', texto: `${pet.name} comio y su hambre bajo a ${data.hunger}.` });
    } catch (e) {
      setFeedback({ tipo: 'error', texto: e instanceof Error ? e.message : 'No se pudo alimentar a la mascota' });
    }
  }, [token, pet]);

  const trainPet = useCallback(async () => {
    if (!token || !pet) return;
    setFeedback(null);
    try {
      const data = await apiFetch<Pet>(`/pets/${pet.id}`, {
        token,
        method: 'PATCH',
        body: { xp: pet.xp + 10 },
      });
      setPet(data);
      setFeedback({ tipo: 'exito', texto: `${pet.name} entreno: +10 XP.` });
    } catch (e) {
      setFeedback({ tipo: 'error', texto: e instanceof Error ? e.message : 'No se pudo entrenar a la mascota' });
    }
  }, [token, pet]);

  const startRename = useCallback(() => {
    if (!pet) return;
    setNameDraft(pet.name);
    setEditingName(true);
  }, [pet]);

  const saveName = useCallback(async () => {
    if (!pet || !token) return;
    const trimmed = nameDraft.trim();
    if (trimmed && trimmed !== pet.name) {
      setFeedback(null);
      try {
        const data = await apiFetch<Pet>(`/pets/${pet.id}`, {
          token,
          method: 'PATCH',
          body: { name: trimmed },
        });
        setPet(data);
        setFeedback({ tipo: 'exito', texto: `Tu mascota ahora se llama "${data.name}".` });
      } catch (e) {
        setFeedback({ tipo: 'error', texto: e instanceof Error ? e.message : 'No se pudo cambiar el nombre' });
      }
    }
    setEditingName(false);
  }, [pet, token, nameDraft]);

  const deletePet = useCallback(async () => {
    if (!pet || !token) return;
    setDeleting(true);
    setFeedback(null);
    try {
      await apiFetch(`/pets/${pet.id}`, { token, method: 'DELETE' });
      setPet(null);
      setConfirmBorrado(false);
      router.back();
    } catch (e) {
      setConfirmBorrado(false);
      setFeedback({ tipo: 'error', texto: e instanceof Error ? e.message : 'No se pudo eliminar la mascota' });
    } finally {
      setDeleting(false);
    }
  }, [pet, token, router]);

  return (
    <View className={pantalla.root}>
      <View className={pantalla.header}>
        <Pressable onPress={() => router.back()} className="pr-4">
          <Text className={tipografia.enlace}>Atras</Text>
        </Pressable>
        <Text className={tipografia.titulo} numberOfLines={1}>
          {fullName}
        </Text>
      </View>

      <ScrollView contentContainerStyle={pantalla.contenido}>
        <View className={tarjeta.grande}>
          {petLoading ? (
            <ActivityIndicator color="#10b981" />
          ) : pet ? (
            <>
              {editingName ? (
                <View>
                  <TextInput
                    value={nameDraft}
                    onChangeText={setNameDraft}
                    autoFocus
                    placeholder="Nuevo nombre"
                    placeholderTextColor="#737373"
                    className={formulario.input}
                    onSubmitEditing={saveName}
                  />
                  <View className="mt-3 flex-row gap-3">
                    <Button title="Guardar" onPress={saveName} style={{ flex: 1 }} />
                    <Button
                      title="Cancelar"
                      onPress={() => setEditingName(false)}
                      variant="secondary"
                      style={{ flex: 1 }}
                    />
                  </View>
                </View>
              ) : (
                <>
                  <Text className="text-xl font-bold text-white">{pet.name}</Text>
                  <View className="mt-3 h-80 w-full overflow-hidden rounded-2xl border border-neutral-800">
                    <Pet3DView species={pet.species} style={{ flex: 1 }} />
                  </View>
                  <Text className="mt-2 text-center text-xs text-neutral-500">
                    Desliza para girar · Pellizca para hacer zoom
                  </Text>
                  <View className="mt-3 gap-1.5">
                    <StatBar label="Salud" value={pet.health} />
                    <StatBar label="Hambre" value={pet.hunger} />
                    <StatBar label="XP" value={pet.xp} />
                  </View>
                  <Text className="mt-2 text-sm text-neutral-400">Nivel {pet.level}</Text>
                  <View className="mt-4 flex-row gap-3">
                    <Button title="Alimentar" onPress={() => void feedPet()} style={{ flex: 1 }} />
                    <Button
                      title="Entrenar"
                      onPress={() => void trainPet()}
                      variant="secondary"
                      style={{ flex: 1 }}
                    />
                  </View>
                  <View className="mt-3 flex-row gap-3">
                    <Button
                      title="Cambiar nombre"
                      onPress={startRename}
                      variant="secondary"
                      style={{ flex: 1 }}
                    />
                    <Button title="Eliminar" onPress={() => setConfirmBorrado(true)} variant="ghost" style={{ flex: 1 }} />
                  </View>
                </>
              )}
            </>
          ) : (
            <View className="items-center gap-3 py-2">
              <Text className="text-center text-neutral-400">
                Este proyecto aún no tiene mascota. Créala para empezar a cuidarla.
              </Text>
              <Button title="Crear mascota" onPress={() => void createPet()} />
            </View>
          )}
        </View>

        <View>
          <Text className="mb-2 text-lg font-semibold text-white">Commits recientes</Text>
          {commitsLoading ? (
            <ActivityIndicator color="#10b981" />
          ) : commits.length === 0 ? (
            <Text className={tipografia.muted}>Sin commits para mostrar.</Text>
          ) : (
            commits.map((c) => (
              <View key={c.sha} className={tarjeta.base}>
                <Text className="text-sm font-medium text-white">{c.message}</Text>
                <Text className={tipografia.subtitulo}>{c.author}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <FeedbackBanner feedback={feedback} onDone={onFeedbackDone} />

      <ConfirmModal
        visible={confirmBorrado}
        title={`¿Eliminar a ${pet?.name ?? 'tu mascota'}?`}
        message="Esta acción no se puede deshacer. La mascota y todos sus datos desaparecerán."
        confirmText="Eliminar"
        loading={deleting}
        onConfirm={() => void deletePet()}
        onCancel={() => setConfirmBorrado(false)}
      />
    </View>
  );
}

function StatBar({ label, value }: { label: string; value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <View>
      <View className="flex-row justify-between">
        <Text className={tipografia.hint}>{label}</Text>
        <Text className={tipografia.hint}>{clamped}</Text>
      </View>
      <View className="mt-1 h-2 overflow-hidden rounded-full bg-neutral-800">
        <View className="h-full rounded-full bg-emerald-600" style={{ width: `${clamped}%` }} />
      </View>
    </View>
  );
}