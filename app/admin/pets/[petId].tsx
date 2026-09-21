import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import type { Item, PetDetail } from '@/lib/types';
import { Button } from '@/layout/Button';
import { ReasonPrompt } from '@/components/ReasonPrompt';
import { lista, modal, pantalla, tarjeta, tipografia } from '@/estilos';

export default function AdminPetDetailScreen() {
  const { petId } = useLocalSearchParams<{ petId: string }>();
  const { token, user: currentUser, isLoading } = useAuth();
  const router = useRouter();
  const [pet, setPet] = useState<PetDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<null | {
    kind: 'removeItem' | 'deletePet';
    itemId?: number;
    itemName?: string;
  }>(null);
  const [submitting, setSubmitting] = useState(false);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [catalog, setCatalog] = useState<Item[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);

  const load = useCallback(async () => {
    if (!token || !petId) return;
    try {
      const data = await apiFetch<PetDetail>(`/pets/${petId}`, { token });
      setPet(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar la mascota');
    } finally {
      setLoading(false);
    }
  }, [token, petId]);

  useEffect(() => {
    void load();
  }, [load]);

  const openPicker = useCallback(async () => {
    if (!token) return;
    setPickerOpen(true);
    setCatalogLoading(true);
    try {
      const data = await apiFetch<Item[]>('/items', { token });
      setCatalog(data);
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'No se pudieron cargar los items');
    } finally {
      setCatalogLoading(false);
    }
  }, [token]);

  const addItem = useCallback(
    async (item: Item) => {
      if (!token || !petId) return;
      try {
        await apiFetch(`/pets/${petId}/items`, {
          token,
          method: 'POST',
          body: { itemId: item.id },
        });
        setPickerOpen(false);
        await load();
      } catch (e) {
        Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo añadir el item');
      }
    },
    [token, petId, load]
  );

  const confirmWithReason = useCallback(
    (reason: string) => {
      if (!token || !petId || !prompt) return;
      setSubmitting(true);
      const r = reason || 'Sin motivo indicado';
      void (async () => {
        try {
          if (prompt.kind === 'removeItem' && prompt.itemId) {
            await apiFetch(`/pets/${petId}/items/${prompt.itemId}`, {
              token,
              method: 'DELETE',
              body: { reason: r },
            });
            await load();
          } else if (prompt.kind === 'deletePet') {
            await apiFetch(`/pets/${petId}`, { token, method: 'DELETE', body: { reason: r } });
            router.back();
          }
        } catch (e) {
          Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo completar la acción');
        } finally {
          setSubmitting(false);
        }
      })();
    },
    [token, petId, prompt, load, router]
  );

  if (isLoading || loading) {
    return (
      <View className={pantalla.rootCentered}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  if (!token) {
    return <Redirect href="/login" />;
  }

  if (!currentUser?.isAdmin) {
    return (
      <View className={pantalla.rootCentered}>
        <Text className="text-neutral-400">Sin permisos de administrador.</Text>
      </View>
    );
  }

  return (
    <View className={pantalla.root}>
      <View className={pantalla.header}>
        <Pressable onPress={() => router.back()} className="pr-4">
          <Text className={tipografia.enlace}>Atras</Text>
        </Pressable>
        <Text className={tipografia.titulo} numberOfLines={1}>
          {pet?.name}
        </Text>
      </View>

      {error ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-sm text-red-400">{error}</Text>
          <Pressable onPress={() => void load()} className="mt-4 rounded-lg bg-white/10 px-4 py-2">
            <Text className={tipografia.enlace}>Reintentar</Text>
          </Pressable>
        </View>
      ) : pet ? (
        <ScrollView contentContainerStyle={pantalla.contenido}>
          <View className={tarjeta.grande}>
            <Text className="text-base font-bold text-white">Mascota</Text>
            <Text className="mt-1 text-sm text-neutral-400">Especie: {pet.species}</Text>
            <Text className="text-sm text-neutral-400">Proyecto: {pet.project.name}</Text>
            <View className="mt-3 flex-row flex-wrap gap-1.5">
              <Pill label={`${pet.health} salud`} />
              <Pill label={`${pet.hunger} hambre`} />
              <Pill label={`felicidad ${pet.happiness}`} />
              <Pill label={`rama ${pet.lifeBranch}`} />
            </View>
            <Button
              title="Eliminar mascota"
              onPress={() => setPrompt({ kind: 'deletePet' })}
              variant="ghost"
              style={{ marginTop: 12 }}
            />
          </View>

          <View>
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-white">Items ({pet.items.length})</Text>
              <Pressable
                className="rounded-lg bg-emerald-600 px-3 py-2"
                onPress={() => void openPicker()}>
                <Text className="text-sm font-medium text-white">Añadir</Text>
              </Pressable>
            </View>

            {pet.items.length === 0 ? (
              <Text className={tipografia.muted}>
                Esta mascota no tiene items. Usa «Añadir» para darle uno.
              </Text>
            ) : (
              pet.items.map((pi) => (
                <View key={pi.id} className={lista.fila}>
                  <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-white/10">
                    <Text className="text-lg">{pi.item.imageUrl || '🎁'}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-white">{pi.item.name}</Text>
                    <Text className={tipografia.subtitulo} numberOfLines={1}>
                      {pi.item.category ?? 'General'} {pi.quantity > 1 ? `· x${pi.quantity}` : ''}
                    </Text>
                  </View>
                  <Pressable
                    className="rounded-lg bg-white/10 px-3 py-2"
                    onPress={() =>
                      setPrompt({ kind: 'removeItem', itemId: pi.itemId, itemName: pi.item.name })
                    }>
                    <Text className={tipografia.error}>Quitar</Text>
                  </Pressable>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      ) : null}

      <ReasonPrompt
        visible={prompt !== null}
        title={
          prompt?.kind === 'deletePet'
            ? `Eliminar a ${pet?.name}`
            : `Quitar item ${prompt?.itemName ? `"${prompt.itemName}"` : ''}`
        }
        placeholder={
          prompt?.kind === 'deletePet'
            ? 'Motivo que verá el usuario (ej: uso de trucos)...'
            : 'Motivo que verá el usuario (ej: item obtenido con trampa)...'
        }
        loading={submitting}
        onConfirm={confirmWithReason}
        onCancel={() => setPrompt(null)}
      />

      <Modal
        visible={pickerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerOpen(false)}>
        <View className={modal.overlayInferior}>
          <View className={modal.fondoInferior}>
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-white">Elegir item</Text>
              <Pressable onPress={() => setPickerOpen(false)} className="px-2 py-1">
                <Text className={tipografia.enlace}>Cerrar</Text>
              </Pressable>
            </View>
            {catalogLoading ? (
              <View className="items-center py-10">
                <ActivityIndicator color="#10b981" />
              </View>
            ) : (
              <FlatList
                data={catalog}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                  <Pressable
                    className="mb-2 flex-row items-center rounded-xl border border-neutral-800 bg-neutral-950 p-3"
                    onPress={() => void addItem(item)}>
                    <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-white/10">
                      <Text className="text-lg">{item.imageUrl || '🎁'}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-white">{item.name}</Text>
                      <Text className={tipografia.subtitulo}>
                        {item.category ?? 'General'} · {item.price} coins
                      </Text>
                    </View>
                    <Text className={tipografia.enlace}>Añadir</Text>
                  </Pressable>
                )}
                ListEmptyComponent={
                  <Text className={lista.vacio}>No hay items en el catálogo.</Text>
                }
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Pill({ label }: { label: string }) {
  return (
    <View className={lista.pill}>
      <Text className={lista.pillTexto}>{label}</Text>
    </View>
  );
}
