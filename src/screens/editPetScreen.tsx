import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ConfirmModal } from '@/components/ConfirmModal';
import { FeedbackBanner } from '@/components/FeedbackBanner';
import { Pet3DView } from '@/components/Pet3DView';
import { ClayBackground } from '@/components/clay/ClayBackground';
import { ClayButton } from '@/components/clay/ClayButton';
import { ClayIconButton } from '@/components/clay/ClayIconButton';
import { ClayInput } from '@/components/clay/ClayInput';
import { ClayPill } from '@/components/clay/ClayPill';
import { ClaySurface } from '@/components/clay/ClaySurface';
import { IconoImagen } from '@/components/clay/IconoImagen';
import { EquipMenu } from '@/components/project/EquipMenu';
import { useAuth } from '@/context/AuthContext';
import { useAppearance } from '@/hooks/useAppearance';
import { usePetActions } from '@/hooks/usePetActions';
import { usePetOwnership } from '@/hooks/usePetOwnership';
import { useProjectBranches } from '@/hooks/useProjectBranches';
import { useProjectPet } from '@/hooks/useProjectPet';
import { SLOTS } from '@/lib/appearance';
import { clay, colorMascotaPorId, paleta, radios, sombras } from '@/estilos';

export default function EditPetScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string; petName?: string }>();
  const { user } = useAuth();
  const { pet, setPet, loading } = useProjectPet(id);
  const {
    feedback,
    setFeedback,
    deleting,
    editingName,
    setEditingName,
    nameDraft,
    setNameDraft,
    saveName,
    saveColors,
    deletePet,
    hidePet,
    startRename,
  } = usePetActions(id, { pet, setPet });
  const isRepoOwner = usePetOwnership(pet?.project, user);

  const { branches } = useProjectBranches(
    pet?.project.fullName,
    pet?.pet?.lifeBranch ?? pet?.project.defaultBranch,
    true
  );

  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [bodyColor, setBodyColor] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [equipOpen, setEquipOpen] = useState(false);
  const appearance = useAppearance(pet?.pet?.id);

  const { equippedBySlot } = appearance;
  const fallbackColor = colorMascotaPorId(pet?.pet?.id ?? 0);
  const shownBody = bodyColor ?? pet?.pet?.bodyColor ?? fallbackColor.hex;
  const lookKey = SLOTS.map((slot) => equippedBySlot[slot]?.id ?? '-').join('|');
  const currentBranch =
    selectedBranch ?? pet?.pet?.lifeBranch ?? pet?.project.defaultBranch ?? 'main';

  const save = useCallback(async () => {
    setSaving(true);
    const ok = await saveColors({
      bodyColor: shownBody,
      healthColor: shownBody,
      hungerColor: shownBody,
      happinessColor: shownBody,
      lifeBranch: currentBranch,
    });
    setSaving(false);
    if (ok) {
      setTimeout(() => router.back(), 550);
    }
  }, [currentBranch, router, saveColors, shownBody]);

  const header = (
    <View
      style={{
        paddingTop: insets.top + 8,
        paddingHorizontal: 16,
        paddingBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      }}>
      <ClayIconButton
        icon="←"
        accessibilityLabel="Volver"
        onPress={() => router.back()}
        size={48}
      />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontSize: 18, fontWeight: '900', color: clay.texto }}>Editar mascota</Text>
        <Text numberOfLines={1} style={{ fontSize: 10, color: clay.textoSuave }}>
          {pet?.pet?.name ?? 'Personaliza su estilo'}
        </Text>
      </View>
      {pet?.project ? (
        <ClayPill label={pet.project.name} colors={clay.vino} textColor="#FFFFFF" />
      ) : null}
    </View>
  );

  if (loading) {
    return (
      <ClayBackground>
        {header}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={clay.fucsia[0]} />
        </View>
      </ClayBackground>
    );
  }

  if (!pet?.pet) {
    return (
      <ClayBackground>
        {header}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Text style={{ textAlign: 'center', fontSize: 14, color: clay.texto }}>
            Esta mascota ya no está disponible.
          </Text>
          <ClayButton
            title="Volver"
            colors={clay.fucsia}
            onPress={() => router.back()}
            style={{ marginTop: 16, alignSelf: 'stretch' }}
          />
        </View>
      </ClayBackground>
    );
  }

  return (
    <ClayBackground>
      {header}
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 4,
          paddingBottom: Math.max(insets.bottom + 24, 36),
          gap: 14,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {/* Preview proporcionado de la mascota arriba */}
        <View style={[sombras.tarjeta, { borderRadius: radios.tarjetaGrande }]}>
          <View
            style={{
              height: 210,
              borderRadius: radios.tarjetaGrande,
              overflow: 'hidden',
              backgroundColor: '#EFEFF3',
            }}>
            <Pet3DView
              key={`${shownBody}-${lookKey}`}
              bodyColor={shownBody}
              backdrop="egg"
              idle
              autoRotate={false}
              style={{ flex: 1 }}
            />
          </View>
        </View>

        {/* Nombre y Rama de vida */}
        <View style={sombras.tarjeta}>
          <ClaySurface colors={clay.blanco} radius={radios.tarjeta} border>
            <View style={{ padding: 14, gap: 10 }}>
              {/* Nombre */}
              <View>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '900',
                    color: clay.textoSuave,
                    textTransform: 'uppercase',
                  }}>
                  Nombre
                </Text>
                {editingName ? (
                  <View style={{ marginTop: 6, gap: 8 }}>
                    <ClayInput
                      value={nameDraft}
                      onChangeText={setNameDraft}
                      autoFocus
                      maxLength={30}
                      placeholder="Nuevo nombre"
                      accessibilityLabel="Nuevo nombre de la mascota"
                    />
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <ClayButton
                        title="Guardar"
                        colors={clay.menta}
                        size="md"
                        onPress={() => void saveName()}
                        style={{ flex: 1 }}
                      />
                      <ClayButton
                        title="Cancelar"
                        colors={clay.blanco}
                        textColor={clay.texto}
                        pixel={false}
                        size="md"
                        onPress={() => setEditingName(false)}
                        style={{ flex: 1 }}
                      />
                    </View>
                  </View>
                ) : (
                  <View
                    style={{
                      marginTop: 4,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                    }}>
                    <Text
                      numberOfLines={1}
                      style={{ flex: 1, fontSize: 16, fontWeight: '900', color: clay.texto }}>
                      {pet.pet.name}
                    </Text>
                    <Pressable
                      onPress={startRename}
                      disabled={!isRepoOwner}
                      accessibilityRole="button"
                      accessibilityLabel="Cambiar nombre"
                      accessibilityState={{ disabled: !isRepoOwner }}
                      style={{ minHeight: 36, justifyContent: 'center' }}>
                      <Text style={{ fontSize: 10, fontWeight: '900', color: paleta.rosa.base }}>
                        Cambiar
                      </Text>
                    </Pressable>
                  </View>
                )}
              </View>

              <View style={{ height: 1, backgroundColor: 'rgba(64,32,42,0.08)' }} />

              {/* Selector de Rama de vida (movido aquí desde detalle) */}
              <View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: '900',
                      color: clay.textoSuave,
                      textTransform: 'uppercase',
                    }}>
                    Rama de vida
                  </Text>
                  <ClayPill
                    label={currentBranch}
                    colors={clay.vino}
                    textColor="#FFFFFF"
                    accessibilityLabel={`Rama actual: ${currentBranch}`}
                  />
                </View>

                {branches && branches.length > 0 ? (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                    {branches.map((b) => {
                      const selected = b === currentBranch;
                      return (
                        <Pressable
                          key={b}
                          onPress={() => setSelectedBranch(b)}
                          accessibilityRole="button"
                          accessibilityLabel={`Seleccionar rama ${b}`}
                          style={({ pressed }) => [pressed ? { opacity: 0.8 } : null]}>
                          <ClaySurface
                            colors={selected ? clay.fucsia : clay.fondoClaro}
                            radius={radios.chip}
                            border
                            contentStyle={{ paddingHorizontal: 10, paddingVertical: 5 }}>
                            <Text
                              style={{
                                fontSize: 9,
                                fontWeight: '800',
                                color: selected ? '#FFFFFF' : clay.texto,
                              }}>
                              {b}
                            </Text>
                          </ClaySurface>
                        </Pressable>
                      );
                    })}
                  </View>
                ) : (
                  <Text style={{ marginTop: 4, fontSize: 9, color: clay.textoTenue }}>
                    {branches === null ? 'Cargando ramas…' : `Rama configurada: ${currentBranch}`}
                  </Text>
                )}
              </View>
            </View>
          </ClaySurface>
        </View>

        {/* Vestimenta actual / "Lleva" (aquí sí se muestra) */}
        <View style={sombras.tarjeta}>
          <ClaySurface colors={clay.blanco} radius={radios.tarjeta} border>
            <View style={{ padding: 14, gap: 10 }}>
              <Text style={{ fontSize: 10, lineHeight: 15, color: clay.textoSuave }}>
                Cambia cabeza, cuerpo, parte baja y el color de toda la mascota.
              </Text>
              <ClayButton
                title="Vestir"
                colors={clay.menta}
                textColor={clay.texto}
                size="md"
                pixel={false}
                onPress={() => setEquipOpen(true)}
                icon={<IconoImagen nombre="perchero" size={20} tintColor={clay.texto} />}
                accessibilityLabel="Abrir menú para vestir la mascota"
              />
            </View>
          </ClaySurface>
        </View>

        {/* Botones de acción finales */}
        <View style={{ gap: 10, marginTop: 6 }}>
          <ClayButton
            title={saving ? 'Guardando…' : 'Guardar cambios'}
            colors={clay.fucsia}
            disabled={saving}
            onPress={() => void save()}
            accessibilityLabel="Guardar cambios de la mascota"
          />

          {isRepoOwner ? (
            <ClayButton
              title="Eliminar mascota"
              colors={clay.vino}
              textColor="#FFFFFF"
              size="md"
              onPress={() => setConfirmOpen(true)}
              accessibilityLabel="Eliminar mascota"
            />
          ) : (
            <ClayButton
              title="Ocultar para mí"
              colors={clay.blanco}
              textColor={clay.texto}
              pixel={false}
              size="md"
              onPress={() => void hidePet()}
              accessibilityLabel="Ocultar mascota para mi cuenta"
            />
          )}
        </View>
      </ScrollView>

      <FeedbackBanner feedback={feedback} onDone={() => setFeedback(null)} />
      <EquipMenu
        visible={equipOpen}
        onClose={() => setEquipOpen(false)}
        appearance={appearance}
        bodyColor={shownBody}
        onBodyColorChange={setBodyColor}
      />
      <ConfirmModal
        visible={confirmOpen}
        title={`¿Eliminar a ${pet.pet.name}?`}
        message="Esta acción no se puede deshacer. La mascota y todos sus datos desaparecerán para todo el equipo."
        confirmText="Eliminar"
        loading={deleting}
        onConfirm={() => void deletePet()}
        onCancel={() => setConfirmOpen(false)}
      />
    </ClayBackground>
  );
}
