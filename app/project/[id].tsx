import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import type { Commit, Pet } from '@/lib/types';
import { Button } from '@/layout/Button';

export default function ProjectDetailScreen() {
  const { id, fullName } = useLocalSearchParams<{ id: string; fullName?: string; name?: string }>();
  const { token } = useAuth();
  const router = useRouter();
  const [pet, setPet] = useState<Pet | null>(null);
  const [petLoading, setPetLoading] = useState(true);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [commitsLoading, setCommitsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center px-5 pb-3 pt-16">
        <Pressable onPress={() => router.back()} className="pr-4">
          <Text className="text-indigo-600">Atras</Text>
        </Pressable>
        <Text className="flex-1 text-2xl font-bold text-gray-900" numberOfLines={1}>
          {fullName}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 20 }}>
        {error ? <Text className="text-sm text-red-500">{error}</Text> : null}

        <View className="rounded-2xl border border-gray-200 p-5">
          {petLoading ? (
            <ActivityIndicator color="#4f46e5" />
          ) : pet ? (
            <>
              <Text className="text-xl font-bold text-gray-900">{pet.name}</Text>
              <Text className="text-sm text-gray-500">Especie: {pet.species}</Text>
              <View className="mt-3 gap-1.5">
                <StatBar label="Salud" value={pet.health} />
                <StatBar label="Hambre" value={pet.hunger} />
                <StatBar label="XP" value={pet.xp} />
              </View>
              <Text className="mt-2 text-sm text-gray-500">Nivel {pet.level}</Text>
              <View className="mt-4 flex-row gap-3">
                <Button title="Alimentar" onPress={() => void feedPet()} style={{ flex: 1 }} />
                <Button
                  title="Entrenar"
                  onPress={() => void trainPet()}
                  variant="secondary"
                  style={{ flex: 1 }}
                />
              </View>
            </>
          ) : (
            <View className="items-center gap-3 py-2">
              <Text className="text-center text-gray-500">
                Este proyecto aún no tiene mascota. Créala para empezar a cuidarla.
              </Text>
              <Button title="Crear mascota" onPress={() => void createPet()} />
            </View>
          )}
        </View>

        <View>
          <Text className="mb-2 text-lg font-semibold text-gray-900">Commits recientes</Text>
          {commitsLoading ? (
            <ActivityIndicator color="#4f46e5" />
          ) : commits.length === 0 ? (
            <Text className="text-sm text-gray-400">Sin commits para mostrar.</Text>
          ) : (
            commits.map((c) => (
              <View key={c.sha} className="mb-2 rounded-xl border border-gray-100 p-3">
                <Text className="text-sm font-medium text-gray-900">{c.message}</Text>
                <Text className="text-xs text-gray-500">{c.author}</Text>
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
        <Text className="text-xs text-gray-500">{label}</Text>
        <Text className="text-xs text-gray-500">{clamped}</Text>
      </View>
      <View className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100">
        <View className="h-full rounded-full bg-indigo-500" style={{ width: `${clamped}%` }} />
      </View>
    </View>
  );
}
