import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import type { Commit, Pet } from '@/lib/types';
import { Button } from '@/layout/Button';
import { Pet3DView } from '@/components/Pet3DView';

export default function ProjectDetailScreen() {
  const { id, fullName } = useLocalSearchParams<{ id: string; fullName?: string; name?: string }>();
  const { token } = useAuth();
  const router = useRouter();
  const [pet, setPet] = useState<Pet | null>(null);
  const [petLoading, setPetLoading] = useState(true);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [commitsLoading, setCommitsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');

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
    setError(null);
    try {
      const data = await apiFetch<Pet>(`/projects/${id}/pet`, { token, method: 'POST', body: {} });
      setPet(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo crear la mascota');
    }
  }, [token, id]);

  const feedPet = useCallback(async () => {
    if (!token || !pet) return;
    setError(null);
    try {
      const data = await apiFetch<Pet>(`/pets/${pet.id}`, {
        token,
        method: 'PATCH',
        body: { hunger: Math.min(100, pet.hunger + 15) },
      });
      setPet(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo alimentar a la mascota');
    }
  }, [token, pet]);

  const trainPet = useCallback(async () => {
    if (!token || !pet) return;
    setError(null);
    try {
      const data = await apiFetch<Pet>(`/pets/${pet.id}`, {
        token,
        method: 'PATCH',
        body: { xp: pet.xp + 10 },
      });
      setPet(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo entrenar a la mascota');
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
      try {
        const data = await apiFetch<Pet>(`/pets/${pet.id}`, {
          token,
          method: 'PATCH',
          body: { name: trimmed },
        });
        setPet(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'No se pudo cambiar el nombre');
      }
    }
    setEditingName(false);
  }, [pet, token, nameDraft]);

  const deletePet = useCallback(() => {
    if (!pet || !token) return;
    Alert.alert('Eliminar mascota', `¿Seguro que quieres eliminar a ${pet.name}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiFetch(`/pets/${pet.id}`, { token, method: 'DELETE' });
            setPet(null);
            router.back();
          } catch (e) {
            setError(e instanceof Error ? e.message : 'No se pudo eliminar la mascota');
          }
        },
      },
    ]);
  }, [pet, token, router]);

  return (
    <View className="flex-1 bg-neutral-950">
      <View className="flex-row items-center px-5 pb-3 pt-16">
        <Pressable onPress={() => router.back()} className="pr-4">
          <Text className="text-emerald-400">Atras</Text>
        </Pressable>
        <Text className="flex-1 text-2xl font-bold text-white" numberOfLines={1}>
          {fullName}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 20 }}>
        {error ? <Text className="text-sm text-red-400">{error}</Text> : null}

        <View className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
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
                    className="rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white"
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
                    <Button title="Eliminar" onPress={deletePet} variant="ghost" style={{ flex: 1 }} />
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
            <Text className="text-sm text-neutral-500">Sin commits para mostrar.</Text>
          ) : (
            commits.map((c) => (
              <View key={c.sha} className="mb-2 rounded-xl border border-neutral-800 bg-neutral-900 p-3">
                <Text className="text-sm font-medium text-white">{c.message}</Text>
                <Text className="text-xs text-neutral-400">{c.author}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function StatBar({ label, value }: { label: string; value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <View>
      <View className="flex-row justify-between">
        <Text className="text-xs text-neutral-400">{label}</Text>
        <Text className="text-xs text-neutral-400">{clamped}</Text>
      </View>
      <View className="mt-1 h-2 overflow-hidden rounded-full bg-neutral-800">
        <View className="h-full rounded-full bg-emerald-600" style={{ width: `${clamped}%` }} />
      </View>
    </View>
  );
}