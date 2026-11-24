import { useCallback, useState } from 'react';
import { ActivityIndicator, Animated, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ConfirmModal } from '@/components/ConfirmModal';
import { FeedbackBanner } from '@/components/FeedbackBanner';
import { Pet3DView } from '@/components/Pet3DView';
import { ClayBackground } from '@/components/clay/ClayBackground';
import { ClayButton } from '@/components/clay/ClayButton';
import { ClayIconButton } from '@/components/clay/ClayIconButton';
import { ClayPill } from '@/components/clay/ClayPill';
import { ClaySurface } from '@/components/clay/ClaySurface';
import { IconoImagen } from '@/components/clay/IconoImagen';
import { StatDonut } from '@/components/clay/StatDonut';
import { DishCarousel } from '@/components/project/DishCarousel';
import { EquipMenu } from '@/components/project/EquipMenu';
import { EquippedStrip } from '@/components/project/EquippedStrip';
import { SpeechBubble } from '@/components/project/SpeechBubble';
import { useAppearance } from '@/hooks/useAppearance';
import { useProjectDetailScreen } from '@/hooks/useProjectDetailScreen';
import { SLOTS } from '@/lib/appearance';
import { readableStatColor } from '@/lib/color';
import { clay, colorMascotaPorId, fondo3D, radios, sombras } from '@/estilos';

const TIER_META = {
  small: { emoji: '🍇' },
  medium: { emoji: '🥟' },
  large: { emoji: '🍱' },
} as const;

function StatBig({
  label,
  iconNombre,
  value,
  color,
}: {
  label: string;
  iconNombre: 'vida' | 'hambre' | 'felicidad';
  value: number;
  color: string;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 8 }}>
      <StatDonut
        value={clamped}
        color={color}
        icon={<IconoImagen nombre={iconNombre} size={28} tintColor={color} />}
        label={label}
        size={70}
        strokeWidth={7}
        shadow={false}
      />
      <Text style={{ fontSize: 11, fontWeight: '900', color: clay.texto }}>
        {label} {clamped}%
      </Text>
    </View>
  );
}

export default function ProjectDetailScreen() {
  const viewModel = useProjectDetailScreen();
  const insets = useSafeAreaInsets();
  const [equipOpen, setEquipOpen] = useState(false);
  const [colorDraft, setColorDraft] = useState<string | null>(null);
  const {
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
    createPet,
    saveColors,
    unhidePet,
    deletePet,
    petAreaRef,
    dragging,
    dragAnim,
    startDrag,
    moveDrag,
    endDrag,
    bubbleText,
    feedOpen,
    openFeed,
  } = viewModel;

  const projectName = pet?.project.name ?? fullName ?? 'Proyecto';
  const petData = pet?.pet ?? null;
  const appearance = useAppearance(petData?.id);
  const { equippedBySlot } = appearance;
  const petColor = petData
    ? (petData.bodyColor ?? colorMascotaPorId(petData.id).hex)
    : colorMascotaPorId(0).hex;
  const shownColor = colorDraft ?? petColor;
  const lookKey = SLOTS.map((slot) => equippedBySlot[slot]?.id ?? '-').join('|');
  const statColor = readableStatColor(shownColor);
  const healthColor = colorDraft ? statColor : (petData?.healthColor ?? statColor);
  const hungerColor = colorDraft ? statColor : (petData?.hungerColor ?? statColor);
  const happinessColor = colorDraft ? statColor : (petData?.happinessColor ?? statColor);

  const openEquip = useCallback(() => {
    setColorDraft(null);
    setEquipOpen(true);
  }, []);

  const closeEquip = useCallback(async () => {
    setEquipOpen(false);
    if (!colorDraft || colorDraft === petColor) {
      setColorDraft(null);
      return;
    }
    const ok = await saveColors({
      bodyColor: colorDraft,
      healthColor: colorDraft,
      hungerColor: colorDraft,
      happinessColor: colorDraft,
    });
    if (ok) setColorDraft(null);
  }, [colorDraft, petColor, saveColors]);

  const header = (
    <View
      style={{
        paddingTop: insets.top + 10,
        paddingHorizontal: 16,
        paddingBottom: 6,
      }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <ClayIconButton
          icon="←"
          accessibilityLabel="Volver"
          onPress={() => router.back()}
          size={48}
        />
        <ClayIconButton
          icon="✎"
          accessibilityLabel="Editar mascota"
          onPress={() =>
            router.push({
              pathname: '/editar/[id]',
              params: { id: String(pet?.project.id ?? ''), petName: petData?.name ?? '' },
            })
          }
          size={48}
          disabled={!petData}
        />
      </View>

      {/* Bloque con nombre de proyecto y mascota bajado y con aire */}
      <View style={{ alignItems: 'center', marginTop: 10, marginBottom: 4, gap: 6 }}>
        <ClayPill
          label={`Proyecto: ${projectName}`}
          colors={clay.vino}
          textColor="#FFFFFF"
          accessibilityLabel={`Proyecto: ${projectName}`}
        />
        {petData ? (
          <>
            <Text
              numberOfLines={1}
              style={{
                fontSize: 19,
                fontWeight: '900',
                color: clay.texto,
              }}>
              {petData.name}
            </Text>
            <Text style={{ fontSize: 10, color: clay.textoTenue }}>
              Tu compañero de cada commit
            </Text>
          </>
        ) : null}
      </View>
    </View>
  );

  return (
    <ClayBackground>
      {header}

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}>
        {petLoading ? (
          <View style={{ alignItems: 'center', paddingVertical: 80 }}>
            <ActivityIndicator size="large" color={clay.violeta[0]} />
          </View>
        ) : petData ? (
          <>
            <View
              ref={petAreaRef}
              style={{
                height: 360,
                borderRadius: 44,
                overflow: 'hidden',
                backgroundColor: fondo3D,
              }}>
              <Pet3DView
                key={`${shownColor}-${lookKey}`}
                species={petData.species}
                bodyColor={shownColor}
                backdrop="egg"
                idle
                autoRotate={false}
                background={fondo3D}
                style={{ flex: 1 }}
              />
              <View pointerEvents="none" style={{ position: 'absolute', top: 14, left: 14 }}>
                <ClayPill
                  label="✦ TU MASCOTA"
                  colors={clay.vino}
                  textColor="#FFFFFF"
                  accessibilityLabel="Tu mascota"
                />
              </View>
              <View
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  right: 14,
                  bottom: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 999,
                  backgroundColor: 'rgba(255,255,255,0.86)',
                }}>
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: shownColor,
                    borderWidth: 2,
                    borderColor: '#FFFFFF',
                  }}
                />
                <Text style={{ fontSize: 10, fontWeight: '900', color: clay.texto }}>
                  {shownColor}
                </Text>
              </View>
            </View>
            <Text
              style={{
                marginTop: 8,
                textAlign: 'center',
                fontSize: 9,
                color: clay.textoTenue,
              }}>
              Desliza para girar · Pellizca para acercar
            </Text>

            <View style={{ marginTop: 16 }}>
              <ClaySurface
                colors={clay.blanco}
                radius={radios.tarjeta}
                glass
                contentStyle={{ paddingVertical: 16, paddingHorizontal: 12 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-evenly',
                    gap: 12,
                  }}>
                  <StatBig
                    label="Hambre"
                    iconNombre="hambre"
                    value={petData.hunger}
                    color={hungerColor}
                  />
                  <StatBig
                    label="Vida"
                    iconNombre="vida"
                    value={petData.health}
                    color={healthColor}
                  />
                  <StatBig
                    label="Felicidad"
                    iconNombre="felicidad"
                    value={petData.happiness}
                    color={happinessColor}
                  />
                </View>
              </ClaySurface>
            </View>

            <View style={{ marginTop: 14 }}>
              <EquippedStrip appearance={appearance} />
            </View>

            <View style={{ marginTop: 14 }}>
              <SpeechBubble text={bubbleText} loading={syncing} petName={petData.name} />
            </View>

            {/* Botones de acción centrados, mismo ancho, sin texto y con imágenes de assets */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'flex-start',
                gap: 16,
                marginTop: 18,
              }}>
              <View style={{ flex: 1, maxWidth: 140, alignItems: 'center', gap: 6 }}>
                <ClayButton
                  title=""
                  colors={clay.fucsia}
                  size="md"
                  onPress={openFeed}
                  accessibilityLabel={feedOpen ? 'Cerrar platillos' : 'Alimentar'}
                  icon={<IconoImagen nombre="hambre" size={26} tintColor="#FFFFFF" />}
                  style={{ width: '100%' }}
                />
                <Text style={{ fontSize: 10, fontWeight: '900', color: clay.textoSuave }}>
                  {feedOpen ? 'CERRAR' : 'ALIMENTAR'}
                </Text>
              </View>
              <View style={{ flex: 1, maxWidth: 140, alignItems: 'center', gap: 6 }}>
                <ClayButton
                  title=""
                  colors={clay.menta}
                  size="md"
                  onPress={openEquip}
                  accessibilityLabel="Vestir"
                  icon={<IconoImagen nombre="perchero" size={26} tintColor={clay.texto} />}
                  style={{ width: '100%' }}
                />
                <Text style={{ fontSize: 10, fontWeight: '900', color: clay.textoSuave }}>
                  VESTIR
                </Text>
              </View>
            </View>

            {feedOpen ? (
              <View style={{ marginTop: 14 }}>
                <DishCarousel
                  dishes={dishes.filter((dish) => !dish.fed)}
                  loading={dishesLoading}
                  onStart={startDrag}
                  onMove={moveDrag}
                  onEnd={endDrag}
                />
              </View>
            ) : null}
          </>
        ) : pet?.hiddenByUser ? (
          <View style={[sombras.suave, { marginTop: 30 }]}>
            <ClaySurface colors={clay.blanco} radius={radios.tarjetaGrande} border>
              <View style={{ padding: 24, alignItems: 'center', gap: 12 }}>
                <Text style={{ fontSize: 34 }}>🙈</Text>
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 14,
                    fontWeight: '900',
                    color: clay.texto,
                  }}>
                  Ocultaste esta mascota para tu cuenta.
                </Text>
                <ClayButton
                  title="Mostrar mascota"
                  colors={clay.verde}
                  onPress={() => void unhidePet()}
                  accessibilityLabel="Mostrar mascota de nuevo"
                  style={{ alignSelf: 'stretch' }}
                />
              </View>
            </ClaySurface>
          </View>
        ) : (
          <View style={[sombras.tarjeta, { marginTop: 12 }]}>
            <ClaySurface colors={clay.blanco} radius={radios.tarjetaGrande} border>
              <View style={{ padding: 20, gap: 12 }}>
                <View style={{ alignItems: 'center' }}>
                  <IconoImagen nombre="huevo" size={40} tintColor={clay.textoSuave} />
                </View>
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 15,
                    fontWeight: '900',
                    color: clay.texto,
                  }}>
                  Este proyecto aún no tiene mascota
                </Text>
                <Text style={{ textAlign: 'center', fontSize: 11, color: clay.textoSuave }}>
                  Crea una para empezar a cuidarla con tu equipo.
                </Text>
                {fullName ? (
                  <View style={{ marginTop: 4 }}>
                    <Text
                      style={{
                        marginBottom: 8,
                        fontSize: 11,
                        fontWeight: '900',
                        color: clay.texto,
                      }}>
                      Rama de vida
                    </Text>
                    {branches === null ? (
                      <ActivityIndicator
                        color={clay.violeta[0]}
                        style={{ alignSelf: 'flex-start' }}
                      />
                    ) : branches.length > 0 ? (
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        {branches.map((branch) => {
                          const active = lifeBranch === branch;
                          return (
                            <Pressable
                              key={branch}
                              onPress={() => setLifeBranch(branch)}
                              accessibilityRole="button"
                              accessibilityState={{ selected: active }}
                              accessibilityLabel={`${branch}${active ? ', seleccionada' : ''}`}
                              style={{ minHeight: 48, justifyContent: 'center' }}>
                              <ClayPill
                                label={`${active ? '✓ ' : ''}${branch}`}
                                colors={active ? clay.violeta : clay.fondoClaro}
                                textColor={active ? '#FFFFFF' : clay.texto}
                              />
                            </Pressable>
                          );
                        })}
                      </View>
                    ) : (
                      <Text style={{ fontSize: 10, color: clay.textoSuave }}>
                        No se pudieron cargar las ramas. Se usará la rama por defecto.
                      </Text>
                    )}
                  </View>
                ) : null}
                <ClayButton
                  title="Crear mascota"
                  colors={clay.verde}
                  onPress={() => void createPet(lifeBranch)}
                  accessibilityLabel="Crear mascota en este proyecto"
                  style={{ marginTop: 6 }}
                />
              </View>
            </ClaySurface>
          </View>
        )}
      </ScrollView>

      {dragging ? (
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            zIndex: 50,
            transform: [
              { translateX: Animated.subtract(dragAnim.x, 60) },
              { translateY: Animated.subtract(dragAnim.y, 60) },
            ],
          }}>
          <View style={[sombras.tarjeta, { borderRadius: 30 }]}>
            <ClaySurface
              colors={clay.blanco}
              radius={30}
              style={{ width: 120, height: 120 }}
              contentStyle={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 54 }}>
                {dragging.food?.imageUrl ?? TIER_META[dragging.tier].emoji}
              </Text>
            </ClaySurface>
          </View>
        </Animated.View>
      ) : null}

      <FeedbackBanner feedback={feedback} onDone={() => setFeedback(null)} />
      <EquipMenu
        visible={equipOpen}
        onClose={() => void closeEquip()}
        appearance={appearance}
        bodyColor={shownColor}
        onBodyColorChange={setColorDraft}
      />
      <ConfirmModal
        visible={confirmOpen}
        title={`¿Eliminar a ${petData?.name ?? 'tu mascota'}?`}
        message="Esta acción no se puede deshacer. La mascota y todos sus datos desaparecerán para todo el equipo."
        confirmText="Eliminar"
        loading={deleting}
        onConfirm={() => void deletePet()}
        onCancel={() => setConfirmOpen(false)}
      />
    </ClayBackground>
  );
}
