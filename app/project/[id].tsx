import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import type { AnalyzeResult, Branch, Dish, FeedResult, Pet, ProjectPet } from '@/lib/types';
import { Button } from '@/layout/Button';
import { Pet3DView } from '@/components/Pet3DView';
import { FeedbackBanner, type Feedback } from '@/components/FeedbackBanner';
import { ConfirmModal } from '@/components/ConfirmModal';
import { formulario, pantalla, tarjeta, tipografia } from '@/estilos';

const TIER_META = {
  small: { label: 'Pequeño', emoji: '🍇', color: 'bg-yellow-500/20', text: 'text-yellow-300' },
  medium: { label: 'Mediano', emoji: '🥟', color: 'bg-orange-500/20', text: 'text-orange-300' },
  large: { label: 'Grande', emoji: '🍱', color: 'bg-emerald-500/20', text: 'text-emerald-300' },
} as const;

export default function ProjectDetailScreen() {
  const { id, fullName } = useLocalSearchParams<{ id: string; fullName?: string; name?: string }>();
  const { token, user } = useAuth();
  const router = useRouter();
  const [pet, setPet] = useState<ProjectPet | null>(null);
  const [petLoading, setPetLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [latest, setLatest] = useState<AnalyzeResult['latest']>(null);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [dishesLoading, setDishesLoading] = useState(false);
  const [feedOpen, setFeedOpen] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [confirmBorrado, setConfirmBorrado] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [branches, setBranches] = useState<string[] | null>(null);
  const [lifeBranch, setLifeBranch] = useState<string | null>(null);

  const petAreaRef = useRef<View>(null);

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

  const syncNow = useCallback(async () => {
    if (!token) return;
    setSyncing(true);
    setFeedback(null);
    try {
      const data = await apiFetch<AnalyzeResult>(`/projects/${id}/analyze`, {
        token,
        method: 'POST',
        body: {},
      });
      setLatest((prev) => prev ?? data.latest);
      if (data.latest?.summary) setLatest(data.latest);
      const list = await apiFetch<Dish[]>(`/projects/${id}/dishes`, { token });
      setDishes(list);
    } catch (e) {
      setFeedback({
        tipo: 'error',
        texto: e instanceof Error ? e.message : 'No se pudo sincronizar',
      });
    } finally {
      setSyncing(false);
    }
  }, [token, id]);

  const loadDishes = useCallback(async () => {
    if (!token) return;
    setDishesLoading(true);
    try {
      const list = await apiFetch<Dish[]>(`/projects/${id}/dishes`, { token });
      setDishes(list);
      const first = list.find((d) => d.summary);
      if (first)
        setLatest({
          sha: first.sha,
          branch: first.branch ?? '',
          message: first.message,
          date: first.date,
          score: first.score,
          summary: first.summary ?? null,
        });
    } catch {
      setDishes([]);
    } finally {
      setDishesLoading(false);
    }
  }, [token, id]);

  useEffect(() => {
    if (!pet?.pet?.id || !token) return;
    const timer = setTimeout(() => {
      void syncNow();
      void loadDishes();
    }, 0);
    return () => clearTimeout(timer);
  }, [pet?.pet?.id, token, syncNow, loadDishes]);

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

  const feedPet = useCallback(
    async (dish: Dish) => {
      if (!token || !pet?.pet) return;
      setFeedback(null);
      try {
        const data = await apiFetch<FeedResult>(`/pets/${pet.pet.id}/feed`, {
          token,
          method: 'POST',
          body: { commitId: dish.commitId },
        });
        setPet((prev) => (prev ? { ...prev, pet: data.pet } : prev));
        setDishes((prev) =>
          prev.map((d) => (d.commitId === dish.commitId ? { ...d, fed: true } : d))
        );
        setFeedback({
          tipo: 'exito',
          texto: `¡${data.pet.name} se comió "${dish.message}" y recuperó ${data.dish.healed.hungerRestore} de hambre! 🍽️`,
        });
      } catch (e) {
        setFeedback({
          tipo: 'error',
          texto: e instanceof Error ? e.message : 'No se pudo alimentar a la mascota',
        });
      }
    },
    [token, pet]
  );

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

  const openFeed = useCallback(() => {
    setFeedOpen((open) => {
      if (!open) void loadDishes();
      return !open;
    });
  }, [loadDishes]);

  const handleFeed = useCallback(
    (dish: Dish) => {
      void feedPet(dish);
    },
    [feedPet]
  );

  const [dragging, setDragging] = useState<Dish | null>(null);
  const [dragAnim] = useState(() => new Animated.ValueXY());

  const startDrag = useCallback(
    (dish: Dish, g: { moveX: number; moveY: number }) => {
      setDragging(dish);
      dragAnim.setValue({ x: g.moveX, y: g.moveY });
    },
    [dragAnim]
  );

  const moveDrag = useCallback(
    (g: { moveX: number; moveY: number }) => {
      dragAnim.setValue({ x: g.moveX, y: g.moveY });
    },
    [dragAnim]
  );

  const endDrag = useCallback(
    (dish: Dish, g: { moveX: number; moveY: number }) => {
      setDragging(null);
      petAreaRef.current?.measureInWindow((x, y, w, h) => {
        const inside = g.moveX >= x && g.moveX <= x + w && g.moveY >= y && g.moveY <= y + h;
        if (inside) {
          handleFeed(dish);
        }
      });
    },
    [handleFeed, petAreaRef]
  );

  const pendingDishes = dishes.filter((d) => !d.fed);
  const bubbleText =
    latest?.summary ??
    latest?.message ??
    (dishes.length === 0
      ? '¡Haz tu primer commit y dame de comer! 🐾'
      : (dishes[0]?.summary ?? dishes[0]?.message));

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
                  <View className="flex-row items-baseline justify-between">
                    <Text className="text-xl font-bold text-white">{pet.pet.name}</Text>
                    <Pressable
                      onPress={() => void syncNow()}
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
                        dishes={pendingDishes}
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

function FormattedText({
  text,
  className,
  numberOfLines,
}: {
  text: string;
  className?: string;
  numberOfLines?: number;
}) {
  const parts = useMemo(() => {
    // Soporta **negrita**, *cursiva*, `codigo` y saltos de línea.
    const regex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
    return text.split(regex).map((token, i) => {
      if (/^\*\*.+\*\*$/.test(token)) {
        return (
          <Text key={i} className="font-bold">
            {token.slice(2, -2)}
          </Text>
        );
      }
      if (/^`.+`$/.test(token)) {
        return (
          <Text key={i} className="font-mono">
            {token.slice(1, -1)}
          </Text>
        );
      }
      if (/^\*.+\*$/.test(token)) {
        return (
          <Text key={i} className="italic">
            {token.slice(1, -1)}
          </Text>
        );
      }
      return token;
    });
  }, [text]);

  return (
    <Text className={className} numberOfLines={numberOfLines}>
      {parts}
    </Text>
  );
}

function SpeechBubble({ text, loading }: { text: string; loading?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const content = loading ? 'Pensando...' : text || '';

  return (
    <>
      <View pointerEvents="box-none" className="absolute bottom-2 left-2 max-w-[70%]">
        <Pressable
          onPress={() => !loading && setExpanded(true)}
          disabled={loading}
          className="w-fit">
          <View className="rounded-2xl rounded-bl-md border-2 border-neutral-900 bg-white px-3 py-2 shadow-sm">
            {loading ? (
              <Text className="text-xs font-medium leading-snug text-neutral-800">
                Pensando...
              </Text>
            ) : (
              <>
                <FormattedText
                  text={content}
                  className="text-xs font-medium leading-snug text-neutral-800"
                  numberOfLines={4}
                />
                {content.length > 90 ? (
                  <Text className="mt-0.5 text-[10px] font-semibold text-neutral-500">
                    Toca para ver completo ▼
                  </Text>
                ) : null}
              </>
            )}
          </View>
          <View className="ml-5 h-0 w-0 border-b-8 border-l-8 border-r-8 border-b-neutral-900 border-l-transparent border-r-transparent" />
          <View className="border-l-6 border-r-6 border-b-6 -mt-2 ml-6 h-0 w-0 border-b-white border-l-transparent border-r-transparent" />
        </Pressable>
      </View>

      <Modal
        visible={expanded}
        transparent
        animationType="fade"
        onRequestClose={() => setExpanded(false)}>
        <View className="flex-1 items-center justify-center bg-black/70 px-6">
          <View className="w-full max-w-[90%] rounded-2xl border border-neutral-700 bg-neutral-900 p-4">
            <Text className="text-sm font-bold text-white">La mascota dijo...</Text>
            <ScrollView className="mt-2 max-h-[50%]" showsVerticalScrollIndicator>
              <FormattedText
                text={content}
                className="text-base leading-relaxed text-neutral-100"
              />
            </ScrollView>
            <Pressable
              onPress={() => setExpanded(false)}
              className="mt-4 self-end rounded-lg bg-emerald-500 px-4 py-2">
              <Text className="text-sm font-bold text-neutral-900">Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

function DishCarousel({
  dishes,
  loading,
  onStart,
  onMove,
  onEnd,
}: {
  dishes: Dish[];
  loading: boolean;
  onStart: (dish: Dish, g: { moveX: number; moveY: number }) => void;
  onMove: (g: { moveX: number; moveY: number }) => void;
  onEnd: (dish: Dish, g: { moveX: number; moveY: number }) => void;
}) {
  return (
    <View>
      <Text className="text-sm font-semibold text-white">Platillos del repo 🍽️</Text>
      <Text className="mt-0.5 text-xs text-neutral-500">
        Elige un platillo (un commit) y arrástralo al muñeco para alimentarlo.
      </Text>

      <View className="mt-3">
        {loading ? (
          <ActivityIndicator color="#10b981" />
        ) : dishes.length === 0 ? (
          <View className="items-center gap-2 rounded-2xl border border-dashed border-neutral-700 py-8">
            <Text className="text-4xl">🍽️</Text>
            <Text className="text-center text-sm text-neutral-300">
              No hay platillos por ahora.
            </Text>
            <Text className="text-center text-xs text-neutral-500">
              Los platillos aparecen con cada commit nuevo que hagas en tu repo desde que creaste la
              mascota.
            </Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingVertical: 8 }}>
            {dishes.map((dish) => (
              <DraggableDish
                key={dish.commitId}
                dish={dish}
                onStart={onStart}
                onMove={onMove}
                onEnd={onEnd}
              />
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

function DraggableDish({
  dish,
  onStart,
  onMove,
  onEnd,
}: {
  dish: Dish;
  onStart: (dish: Dish, g: { moveX: number; moveY: number }) => void;
  onMove: (g: { moveX: number; moveY: number }) => void;
  onEnd: (dish: Dish, g: { moveX: number; moveY: number }) => void;
}) {
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (_, g) => {
          onStart(dish, { moveX: g.moveX, moveY: g.moveY });
        },
        onPanResponderMove: (_, g) => {
          onMove({ moveX: g.moveX, moveY: g.moveY });
        },
        onPanResponderRelease: (_, g) => {
          onEnd(dish, { moveX: g.moveX, moveY: g.moveY });
        },
        onPanResponderTerminate: () => {
          onEnd(dish, { moveX: -9999, moveY: -9999 });
        },
      }),
    [dish, onStart, onMove, onEnd]
  );

  const meta = TIER_META[dish.tier];

  return (
    <View
      {...panResponder.panHandlers}
      className="w-[200px] rounded-2xl border border-neutral-700 bg-neutral-900 p-3">
      <View className="items-center py-2">
        <Text className="text-5xl">{dish.food?.imageUrl ?? meta.emoji}</Text>
      </View>
      <Text className="text-center text-sm font-semibold text-white" numberOfLines={2}>
        {dish.message}
      </Text>
      <View className="mt-2 flex-row items-center justify-between">
        <View className={`rounded-full px-2.5 py-0.5 ${meta.color}`}>
          <Text className={`text-xs font-bold ${meta.text}`}>
            {meta.emoji} {meta.label} · {dish.score}
          </Text>
        </View>
      </View>
      {dish.food ? (
        <Text className="mt-1.5 text-center text-xs text-neutral-500">
          Restaura hambre {dish.food.hungerRestore}
        </Text>
      ) : null}
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
