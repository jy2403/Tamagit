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
import { EquipMenu } from '@/components/project/EquipMenu';
import { useAuth } from '@/context/AuthContext';
import { usePetActions } from '@/hooks/usePetActions';
import { usePetOwnership } from '@/hooks/usePetOwnership';
import { useProjectPet } from '@/hooks/useProjectPet';
import {
  clay,
  colorMascotaPorId,
  COLORES_MASCOTA,
  radios,
  sombras,
  tonoPorHex,
  type ColorMascota,
} from '@/estilos';

function ColorOption({
  color,
  selected,
  onPress,
  label,
}: {
  color: ColorMascota;
  selected: boolean;
  onPress: () => void;
  label?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${label ?? 'Color'} ${color.nombre}${selected ? ', seleccionado' : ''}`}
      style={({ pressed }) => [
        { alignItems: 'center', gap: 4, width: 52 },
        pressed ? { opacity: 0.8 } : null,
      ]}>
      <View style={[{ width: 44, height: 44 }, sombras.suave]}>
        <ClaySurface
          colors={color.gradiente}
          radius={22}
          style={{
            width: 44,
            height: 44,
            borderWidth: selected ? 3 : 2,
            borderColor: selected ? clay.texto : '#FFFFFF',
          }}
        />
        {selected ? (
          <View
            style={{
              position: 'absolute',
              top: -3,
              right: -3,
              width: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: '#FFFFFF',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text style={{ fontSize: 11, fontWeight: '900', color: clay.texto }}>✓</Text>
          </View>
        ) : null}
      </View>
      <Text
        numberOfLines={1}
        style={{ fontSize: 8, fontWeight: '700', color: selected ? clay.texto : clay.textoTenue }}>
        {color.nombre}
      </Text>
    </Pressable>
  );
}

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

  const [bodyColor, setBodyColor] = useState<string | null>(null);
  const [healthColor, setHealthColor] = useState<string | null>(null);
  const [hungerColor, setHungerColor] = useState<string | null>(null);
  const [happinessColor, setHappinessColor] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [equipOpen, setEquipOpen] = useState(false);

  const fallbackColor = pet?.pet ? colorMascotaPorId(pet.pet.id) : COLORES_MASCOTA[0];
  const fallbackTones = tonoPorHex(pet?.pet?.bodyColor ?? fallbackColor.hex);
  const shownBody = bodyColor ?? pet?.pet?.bodyColor ?? fallbackColor.hex;
  const shownHealth = healthColor ?? pet?.pet?.healthColor ?? shownBody;
  const shownHunger = hungerColor ?? pet?.pet?.hungerColor ?? fallbackTones[1];
  const shownHappiness = happinessColor ?? pet?.pet?.happinessColor ?? fallbackTones[0];

  const save = useCallback(async () => {
    setSaving(true);
    const ok = await saveColors({
      bodyColor: shownBody,
      healthColor: shownHealth,
      hungerColor: shownHunger,
      happinessColor: shownHappiness,
    });
    setSaving(false);
    if (ok) {
      setTimeout(() => router.back(), 550);
    }
  }, [router, saveColors, shownBody, shownHappiness, shownHealth, shownHunger]);

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
        size={50}
      />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontSize: 19, fontWeight: '900', color: clay.texto }}>Editar mascota</Text>
        <Text numberOfLines={1} style={{ fontSize: 10, color: clay.textoSuave }}>
          {pet?.pet?.name ?? 'Personaliza su estilo'}
        </Text>
      </View>
      {pet?.pet ? (
        <ClayPill label={pet.project.name} colors={clay.negro} textColor="#FFFFFF" />
      ) : null}
    </View>
  );

  if (loading) {
    return (
      <ClayBackground>
        {header}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={clay.violeta[0]} />
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
            colors={clay.violeta}
            onPress={() => router.back()}
            style={{ marginTop: 16, alignSelf: 'stretch' }}
          />
        </View>
      </ClayBackground>
    );
  }

  const previewColor = shownBody;
  const statGroups = [
    {
      title: 'Vida',
      icon: '♥',
      value: shownHealth,
      onChange: setHealthColor,
    },
    {
      title: 'Hambre',
      icon: '●',
      value: shownHunger,
      onChange: setHungerColor,
    },
    {
      title: 'Felicidad',
      icon: '☺',
      value: shownHappiness,
      onChange: setHappinessColor,
    },
  ];

  return (
    <ClayBackground>
      {header}
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 30 }}
        keyboardShouldPersistTaps="handled">
        <View style={[sombras.tarjeta, { borderRadius: radios.tarjetaGrande }]}>
          <View
            style={{
              height: 240,
              borderRadius: radios.tarjetaGrande,
              overflow: 'hidden',
              backgroundColor: '#EFEFF3',
            }}>
            <Pet3DView
              key={previewColor}
              bodyColor={previewColor}
              backdrop="egg"
              idle
              autoRotate={false}
              style={{ flex: 1 }}
            />
          </View>
        </View>

        <View style={[sombras.tarjeta, { marginTop: 14 }]}>
          <ClaySurface colors={clay.blanco} radius={radios.tarjeta} border>
            <View style={{ padding: 16 }}>
              <Text style={{ fontSize: 12, fontWeight: '900', color: clay.texto }}>Nombre</Text>
              {editingName ? (
                <View style={{ marginTop: 8, gap: 10 }}>
                  <ClayInput
                    value={nameDraft}
                    onChangeText={setNameDraft}
                    autoFocus
                    maxLength={30}
                    placeholder="Nuevo nombre"
                    accessibilityLabel="Nuevo nombre de la mascota"
                  />
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <ClayButton
                      title="Guardar"
                      colors={clay.verde}
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
                    marginTop: 6,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                  }}>
                  <Text
                    numberOfLines={1}
                    style={{ flex: 1, fontSize: 17, fontWeight: '900', color: clay.texto }}>
                    {pet.pet.name}
                  </Text>
                  <Pressable
                    onPress={startRename}
                    disabled={!isRepoOwner}
                    accessibilityRole="button"
                    accessibilityLabel="Cambiar nombre"
                    accessibilityState={{ disabled: !isRepoOwner }}
                    style={{ minHeight: 48, justifyContent: 'center' }}>
                    <Text style={{ fontSize: 10, fontWeight: '900', color: clay.violeta[1] }}>
                      Cambiar
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          </ClaySurface>
        </View>

        {isRepoOwner ? (
          <>
            <View style={{ marginTop: 18 }}>
              <Text style={{ fontSize: 13, fontWeight: '900', color: clay.texto }}>
                Color de la mascota
              </Text>
              <Text style={{ marginTop: 2, fontSize: 10, color: clay.textoSuave }}>
                Se aplica al modelo 3D y a su tarjeta.
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
                {COLORES_MASCOTA.map((color) => (
                  <ColorOption
                    key={color.hex}
                    color={color}
                    selected={shownBody.toLowerCase() === color.hex.toLowerCase()}
                    onPress={() => setBodyColor(color.hex)}
                    label="Color de mascota"
                  />
                ))}
              </View>
            </View>

            {statGroups.map((group) => (
              <View key={group.title} style={{ marginTop: 18 }}>
                <Text style={{ fontSize: 13, fontWeight: '900', color: clay.texto }}>
                  {group.icon} Color de {group.title.toLowerCase()}
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
                  {COLORES_MASCOTA.map((color) => (
                    <ColorOption
                      key={`${group.title}-${color.hex}`}
                      color={color}
                      selected={group.value?.toLowerCase() === color.hex.toLowerCase()}
                      onPress={() => group.onChange(color.hex)}
                      label={`Color de ${group.title}`}
                    />
                  ))}
                </View>
              </View>
            ))}

            <View style={{ marginTop: 24 }}>
              <ClayButton
                title={saving ? 'Guardando…' : 'Guardar colores'}
                colors={clay.violeta}
                disabled={saving}
                onPress={() => void save()}
                accessibilityLabel="Guardar colores de la mascota"
              />
            </View>
          </>
        ) : (
          <View style={{ marginTop: 18 }}>
            <ClayPill
              label="Solo el dueño puede editar colores"
              colors={clay.ambar}
              textColor="#1A1A1C"
              accessibilityLabel="Solo el dueño del repositorio puede editar los colores"
            />
          </View>
        )}

        <View style={{ marginTop: 20 }}>
          <ClayButton
            title="Vestir"
            colors={clay.menta}
            textColor="#1A1A1C"
            onPress={() => setEquipOpen(true)}
            accessibilityLabel="Abrir menú para vestir la mascota"
          />
        </View>

        <View style={{ marginTop: 22, gap: 10 }}>
          {isRepoOwner ? (
            <ClayButton
              title="Eliminar mascota"
              colors={clay.rojo}
              onPress={() => setConfirmOpen(true)}
              accessibilityLabel="Eliminar mascota"
            />
          ) : (
            <ClayButton
              title="Ocultar para mí"
              colors={clay.blanco}
              textColor={clay.texto}
              pixel={false}
              onPress={() => void hidePet()}
              accessibilityLabel="Ocultar mascota para mi cuenta"
            />
          )}
          <Text style={{ textAlign: 'center', fontSize: 9, color: clay.textoTenue }}>
            {isRepoOwner
              ? 'Eliminar borra la mascota para todo el equipo.'
              : 'Puedes ocultarla de tu cuenta sin afectar al equipo.'}
          </Text>
        </View>
      </ScrollView>

      <FeedbackBanner feedback={feedback} onDone={() => setFeedback(null)} />
      <EquipMenu visible={equipOpen} onClose={() => setEquipOpen(false)} />
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
