import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  type View as RNView,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { ConfirmModal } from '@/components/ConfirmModal';
import { FeedbackBanner } from '@/components/FeedbackBanner';
import { Pet3DView } from '@/components/Pet3DView';
import { DishCarousel } from '@/components/project/DishCarousel';
import { SpeechBubble } from '@/components/project/SpeechBubble';
import { StatBar } from '@/components/project/StatBar';
import { useDragToFeed } from '@/hooks/useDragToFeed';
import { usePetActions } from '@/hooks/usePetActions';
import type { Dish } from '@/lib/types';
import { usePetOwnership } from '@/hooks/usePetOwnership';
import { useProjectBranches } from '@/hooks/useProjectBranches';
import { useProjectDishes } from '@/hooks/useProjectDishes';
import { useProjectPet } from '@/hooks/useProjectPet';
import { useSpeechBubble } from '@/hooks/useSpeechBubble';
import { Button } from '@/layout/Button';
import { formulario, pantalla, tarjeta, tipografia } from '@/estilos';

const TIER_META = {
  small: { emoji: '🍇' },
  medium: { emoji: '🥟' },
  large: { emoji: '🍱' },
} as const;

export default function ProjectDetailScreen() {
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

  const handleFeed = (dish: Dish) => {
    void feedPet(dish, () => {
      setDishes((prev) =>
        prev.map((d) => (d.commitId === dish.commitId ? { ...d, fed: true } : d))
      );
    });
  };

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

  const onSyncPress = async () => {
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
  };

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
                  <View className="flex-row items-baseline justify-between">
                    <Text className="text-xl font-bold text-white">{pet.pet.name}</Text>
                    <Pressable
                      onPress={() => void onSyncPress()}
                      disabled={syncing}
                      className="rounded-lg bg-neutral-800 px-3 py-2"
                      hitSlop={8}>
                      {syncing ? (
                        <ActivityIndicator color="#10b981" size="small" />
                      ) : (
                        <Text className="text-xs font-medium text-emerald-300">Sincronizar</Text>
                      )}
                    </Pressable>
                  </View>
                  <Text className="text-xs text-neutral-500">
                    Rama de vida: {pet.pet.lifeBranch}
                  </Text>

                  <View
                    ref={petAreaRef}
                    className="mt-3 h-80 w-full overflow-hidden rounded-2xl border border-neutral-800">
                    <Pet3DView species={pet.pet.species} style={{ flex: 1 }} />
                    <SpeechBubble text={bubbleText} loading={syncing} />
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
                    <Button
                      title={feedOpen ? 'Cerrar platillos' : 'Alimentar'}
                      onPress={openFeed}
                      style={{ flex: 1 }}
                    />
                    <Button
                      title="Cambiar nombre"
                      onPress={startRename}
                      variant="secondary"
                      style={{ flex: 1 }}
                    />
                  </View>

                  {feedOpen ? (
                    <View className="mt-4">
                      <DishCarousel
                        dishes={dishes.filter((d) => !d.fed)}
                        loading={dishesLoading}
                        onStart={startDrag}
                        onMove={moveDrag}
                        onEnd={endDrag}
                      />
                    </View>
                  ) : null}

                  <View className="mt-3 flex-row gap-3">
                    {isRepoOwner ? (
                      <Button
                        title="Eliminar definitivamente"
                        onPress={() => setConfirmOpen(true)}
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
              <Button title="Crear mascota" onPress={() => void createPet(lifeBranch)} />
            </View>
          )}
        </View>
      </ScrollView>

      {dragging ? (
        <Animated.View
          className="pointer-events-none absolute left-0 top-0 z-50"
          style={{
            transform: [
              { translateX: Animated.subtract(dragAnim.x, 70) },
              { translateY: Animated.subtract(dragAnim.y, 70) },
            ],
          }}>
          <View className="h-[140px] w-[140px] items-center justify-center rounded-2xl border border-emerald-400 bg-emerald-500/30">
            <Text className="text-6xl">
              {dragging.food?.imageUrl ?? TIER_META[dragging.tier].emoji}
            </Text>
          </View>
        </Animated.View>
      ) : null}

      <FeedbackBanner feedback={feedback} onDone={() => setFeedback(null)} />

      <ConfirmModal
        visible={confirmOpen}
        title={`¿Eliminar a ${pet?.pet?.name ?? 'tu mascota'}?`}
        message="Esta acción no se puede deshacer. La mascota y todos sus datos desaparecerán para todo el equipo."
        confirmText="Eliminar"
        loading={deleting}
        onConfirm={() => void deletePet()}
        onCancel={() => setConfirmOpen(false)}
      />
    </View>
  );
}
