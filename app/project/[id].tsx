import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import type { AnalyzeResult, Branch, CommitAnalysis, Pet, ProjectPet } from '@/lib/types';
import { Button } from '@/layout/Button';
import { Pet3DView } from '@/components/Pet3DView';
import { FeedbackBanner, type Feedback } from '@/components/FeedbackBanner';
import { ConfirmModal } from '@/components/ConfirmModal';
import { formulario, pantalla, tarjeta, tipografia } from '@/estilos';

export default function ProjectDetailScreen() {
  const { id, fullName } = useLocalSearchParams<{ id: string; fullName?: string; name?: string }>();
  const { token, user } = useAuth();
  const router = useRouter();
  const [pet, setPet] = useState<ProjectPet | null>(null);
  const [petLoading, setPetLoading] = useState(true);
  const [analyses, setAnalyses] = useState<CommitAnalysis[]>([]);
  const [analysesLoading, setAnalysesLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [confirmBorrado, setConfirmBorrado] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [branches, setBranches] = useState<string[] | null>(null);
  const [lifeBranch, setLifeBranch] = useState<string | null>(null);

  const onFeedbackDone = useCallback(() => setFeedback(null), []);

  useEffect(() => {
    if (!token) return;
    apiFetch<ProjectPet>(`/projects/${id}/pet`, { token })
      .then(setPet)
      .catch(() => setPet(null))
      .finally(() => setPetLoading(false));
  }, [token, id]);

  useEffect(() => {
    if (!token || !fullName || pet?.pet) return;
    apiFetch<Branch[]>(`/github/repos/${fullName}/branches`, { token })
      .then((data) => {
        const names = data.map((b) => b.name);
        setBranches(names);
        setLifeBranch((prev) => prev ?? pet?.project.defaultBranch ?? names[0] ?? 'main');
      })
      .catch(() => setBranches([]));
  }, [token, fullName, pet?.pet, pet?.project.defaultBranch]);

  useEffect(() => {
    if (!token) return;
    apiFetch<CommitAnalysis[]>(`/projects/${id}/analyses`, { token })
      .then(setAnalyses)
      .catch(() => setAnalyses([]))
      .finally(() => setAnalysesLoading(false));
  }, [token, id]);

  const analyzeProject = useCallback(async () => {
    if (!token) return;
    setAnalyzing(true);
    setFeedback(null);
    try {
      const data = await apiFetch<AnalyzeResult>(`/projects/${id}/analyze`, {
        token,
        method: 'POST',
        body: {},
      });
      if (data.pet) setPet((prev) => (prev ? { ...prev, pet: data.pet } : prev));
      const list = await apiFetch<CommitAnalysis[]>(`/projects/${id}/analyses`, { token });
      setAnalyses(list);
      setFeedback({
        tipo: 'exito',
        texto: `Análisis completado: ${data.analyzed} commits, ${data.applied} con efecto en la mascota (rama ${data.lifeBranch}).`,
      });
    } catch (e) {
      setFeedback({
        tipo: 'error',
        texto: e instanceof Error ? e.message : 'No se pudo analizar el proyecto',
      });
    } finally {
      setAnalyzing(false);
    }
  }, [token, id]);

  const createPet = useCallback(async () => {
    if (!token) return;
    setFeedback(null);
    try {
      const data = await apiFetch<ProjectPet>(`/projects/${id}/pet`, {
        token,
        method: 'POST',
        body: { lifeBranch: lifeBranch ?? undefined },
      });
      setPet(data);
      setFeedback({ tipo: 'exito', texto: `Mascota "${data.pet?.name}" creada correctamente.` });
    } catch (e) {
      setFeedback({
        tipo: 'error',
        texto: e instanceof Error ? e.message : 'No se pudo crear la mascota',
      });
    }
  }, [token, id, lifeBranch]);

  const feedPet = useCallback(async () => {
    if (!token || !pet?.pet) return;
    setFeedback(null);
    try {
      const data = await apiFetch<Pet>(`/pets/${pet.pet.id}/feed`, {
        token,
        method: 'POST',
        body: {},
      });
      setPet((prev) => (prev ? { ...prev, pet: data } : prev));
      setFeedback({ tipo: 'exito', texto: `${pet.pet.name} comió y su hambre bajó.` });
    } catch (e) {
      setFeedback({
        tipo: 'error',
        texto: e instanceof Error ? e.message : 'No se pudo alimentar a la mascota',
      });
    }
  }, [token, pet]);

  const hidePet = useCallback(async () => {
    if (!token || !pet?.pet) return;
    setFeedback(null);
    try {
      await apiFetch(`/pets/${pet.pet.id}/hide`, { token, method: 'POST', body: {} });
      setPet({ ...pet, pet: null, hiddenByUser: true });
      setFeedback({ tipo: 'exito', texto: 'Mascota ocultada para tu cuenta.' });
    } catch (e) {
      setFeedback({
        tipo: 'error',
        texto: e instanceof Error ? e.message : 'No se pudo ocultar la mascota',
      });
    }
  }, [token, pet]);

  const unhidePet = useCallback(async () => {
    if (!token || !pet?.pet) return;
    setFeedback(null);
    try {
      await apiFetch(`/pets/${pet.pet.id}/unhide`, { token, method: 'POST', body: {} });
    } catch (e) {
      setFeedback({
        tipo: 'error',
        texto: e instanceof Error ? e.message : 'No se pudo mostrar la mascota',
      });
    }
  }, [token, pet]);

  const deletePet = useCallback(async () => {
    if (!token || !pet?.pet) return;
    setDeleting(true);
    setFeedback(null);
    try {
      await apiFetch(`/pets/${pet.pet.id}`, { token, method: 'DELETE' });
      setPet({ ...pet, pet: null, hiddenByUser: false });
      setConfirmBorrado(false);
      router.back();
    } catch (e) {
      setConfirmBorrado(false);
      setFeedback({
        tipo: 'error',
        texto: e instanceof Error ? e.message : 'No se pudo eliminar la mascota',
      });
    } finally {
      setDeleting(false);
    }
  }, [pet, token, router]);

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
        setPet((prev) => (prev ? { ...prev, pet: data } : prev));
        setFeedback({ tipo: 'exito', texto: `Tu mascota ahora se llama "${trimmed}".` });
      } catch (e) {
        setFeedback({
          tipo: 'error',
          texto: e instanceof Error ? e.message : 'No se pudo cambiar el nombre',
        });
      }
    }
    setEditingName(false);
  }, [pet, token, nameDraft]);

  const isRepoOwner = pet?.project.ownerId === user?.id;

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
          ) : pet?.pet ? (
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
                  <Text className="text-xl font-bold text-white">{pet.pet.name}</Text>
                  <Text className="text-xs text-neutral-500">
                    Rama de vida: {pet.pet.lifeBranch}
                  </Text>
                  <View className="mt-3 h-80 w-full overflow-hidden rounded-2xl border border-neutral-800">
                    <Pet3DView species={pet.pet.species} style={{ flex: 1 }} />
                  </View>
                  <Text className="mt-2 text-center text-xs text-neutral-500">
                    Desliza para girar · Pellizca para hacer zoom
                  </Text>
                  <View className="mt-3 gap-1.5">
                    <StatBar label="Salud" value={pet.pet.health} />
                    <StatBar label="Hambre" value={pet.pet.hunger} />
                    <StatBar label="Felicidad" value={pet.pet.happiness} />
                  </View>
                  <View className="mt-4 flex-row gap-3">
                    <Button title="Alimentar" onPress={() => void feedPet()} style={{ flex: 1 }} />
                    <Button
                      title="Cambiar nombre"
                      onPress={startRename}
                      variant="secondary"
                      style={{ flex: 1 }}
                    />
                  </View>
                  <View className="mt-3 flex-row gap-3">
                    {isRepoOwner ? (
                      <Button
                        title="Eliminar definitivamente"
                        onPress={() => setConfirmBorrado(true)}
                        variant="ghost"
                        style={{ flex: 1 }}
                      />
                    ) : (
                      <Button
                        title="Ocultar para mi"
                        onPress={() => void hidePet()}
                        variant="ghost"
                        style={{ flex: 1 }}
                      />
                    )}
                  </View>
                  {isRepoOwner ? (
                    <Text className="mt-3 text-center text-xs text-neutral-500">
                      Eres el dueño del repositorio. La eliminación borra la mascota para todos; usa
                      ocultar si solo quieres no verla.
                    </Text>
                  ) : (
                    <Text className="mt-3 text-center text-xs text-neutral-500">
                      Solo el dueño del repositorio puede eliminar la mascota de forma definitiva.
                    </Text>
                  )}
                </>
              )}
            </>
          ) : pet?.hiddenByUser ? (
            <View className="items-center gap-3 py-2">
              <Text className="text-center text-neutral-400">
                Ocultaste esta mascota para tu cuenta.
              </Text>
              <Button title="Mostrar mascota" onPress={() => void unhidePet()} />
            </View>
          ) : (
            <View className="items-center gap-3 py-2">
              <Text className="text-center text-neutral-400">
                Este proyecto aún no tiene mascota. Crea una para empezar a cuidarla con tu equipo.
              </Text>
              {fullName ? (
                <View className="w-full">
                  <Text className={tipografia.hint}>Rama de vida (de dónde se cuenta el daño)</Text>
                  {branches === null ? (
                    <ActivityIndicator color="#10b981" style={{ marginTop: 8 }} />
                  ) : branches.length > 0 ? (
                    <View className="mt-2 flex-row flex-wrap gap-2">
                      {branches.map((b) => {
                        const selected = lifeBranch === b;
                        return (
                          <Pressable
                            key={b}
                            onPress={() => setLifeBranch(b)}
                            className={`rounded-full border px-3 py-1.5 ${
                              selected
                                ? 'border-emerald-500 bg-emerald-500/20'
                                : 'border-neutral-700'
                            }`}>
                            <Text
                              className={`text-xs ${selected ? 'text-emerald-300' : 'text-neutral-300'}`}>
                              {b}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  ) : (
                    <Text className={tipografia.muted}>
                      No se pudieron cargar las ramas. Se usará la rama por defecto.
                    </Text>
                  )}
                </View>
              ) : null}
              <Button title="Crear mascota" onPress={() => void createPet()} />
            </View>
          )}
        </View>

        <View>
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-white">Análisis de commits</Text>
            <Pressable
              className="rounded-lg bg-emerald-600 px-3 py-2"
              onPress={() => void analyzeProject()}
              disabled={analyzing}>
              {analyzing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-sm font-medium text-white">Analizar</Text>
              )}
            </Pressable>
          </View>
          {analysesLoading ? (
            <ActivityIndicator color="#10b981" />
          ) : analyses.length === 0 ? (
            <Text className={tipografia.muted}>
              Sin análisis todavía. Pulsa «Analizar» para revisar los últimos commits (usa la IA si
              hay clave configurada).
            </Text>
          ) : (
            analyses.map((a) => (
              <View key={a.sha} className={tarjeta.base}>
                <View className="flex-row items-center justify-between gap-2">
                  <Text className="flex-1 text-sm font-medium text-white" numberOfLines={2}>
                    {a.message}
                  </Text>
                  <View
                    className={`rounded-full px-2.5 py-0.5 ${
                      a.score >= 70
                        ? 'bg-emerald-500/20'
                        : a.score >= 40
                          ? 'bg-yellow-500/20'
                          : 'bg-red-500/20'
                    }`}>
                    <Text
                      className={`text-xs font-bold ${
                        a.score >= 70
                          ? 'text-emerald-300'
                          : a.score >= 40
                            ? 'text-yellow-300'
                            : 'text-red-300'
                      }`}>
                      {a.score}
                    </Text>
                  </View>
                </View>
                <Text className={tipografia.subtitulo}>
                  {a.branch ?? 'rama?'}
                  {a.author ? ` · ${a.author}` : ''}
                </Text>
                {a.summary ? (
                  <Text className="mt-1.5 text-sm text-neutral-300">💬 {a.summary}</Text>
                ) : null}
                {a.findings && a.findings.length > 0 ? (
                  <View className="mt-1.5 gap-1">
                    {a.findings.map((f) => (
                      <Text key={f} className="text-xs text-neutral-400">
                        • {f}
                      </Text>
                    ))}
                  </View>
                ) : null}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <FeedbackBanner feedback={feedback} onDone={onFeedbackDone} />

      <ConfirmModal
        visible={confirmBorrado}
        title={`¿Eliminar a ${pet?.pet?.name ?? 'tu mascota'}?`}
        message="Esta acción no se puede deshacer. La mascota y todos sus datos desaparecerán para todo el equipo."
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
