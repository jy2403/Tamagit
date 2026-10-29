import { useMemo, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { ClayButton } from '@/components/clay/ClayButton';
import { ClayIconButton } from '@/components/clay/ClayIconButton';
import { ClayInput } from '@/components/clay/ClayInput';
import { ClaySurface } from '@/components/clay/ClaySurface';
import { ColorWheel } from '@/components/project/ColorWheel';
import { useAppearance } from '@/hooks/useAppearance';
import { SLOTS, SLOT_LABELS, type PetItem, type Slot } from '@/lib/appearance';
import { normalizeHex } from '@/lib/color';
import { COLORES_MASCOTA, clay, fuentes, paleta, radios, sombras, textoClay } from '@/estilos';

type EquipMenuProps = {
  visible: boolean;
  onClose: () => void;
  bodyColor?: string | null;
  onBodyColorChange?: (hex: string) => void;
};

type MenuMode = 'home' | 'COLOR' | Slot;

function ItemPreview({ item, size }: { item: PetItem | null; size: number }) {
  if (!item) {
    return <Text style={{ fontSize: size * 0.7, color: clay.textoTenue }}>＋</Text>;
  }
  if (item.imageUrl) {
    return (
      <Image
        source={{ uri: item.imageUrl }}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    );
  }
  return <Text style={{ fontSize: size * 0.8 }}>{item.emoji}</Text>;
}

function PartButton({
  label,
  detail,
  onPress,
  preview,
  accessibilityLabel,
}: {
  label: string;
  detail: string;
  onPress: () => void;
  preview: ReactNode;
  accessibilityLabel: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [{ width: '48%' }, pressed ? { opacity: 0.82 } : null]}>
      <ClaySurface
        colors={clay.blanco}
        radius={radios.tarjeta}
        border
        shadow="suave"
        contentStyle={{ minHeight: 104, padding: 12, justifyContent: 'space-between' }}>
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 14,
            backgroundColor: paleta.indigo.fondoSuave,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          {preview}
        </View>
        <View>
          <Text style={{ fontSize: 13, fontWeight: '900', color: clay.texto }}>{label}</Text>
          <Text numberOfLines={1} style={{ marginTop: 2, fontSize: 10, color: clay.textoSuave }}>
            {detail}
          </Text>
        </View>
      </ClaySurface>
    </Pressable>
  );
}

export function EquipMenu({ visible, onClose, bodyColor, onBodyColorChange }: EquipMenuProps) {
  const [mode, setMode] = useState<MenuMode>('home');
  const { height } = useWindowDimensions();
  const { items, status, equippedBySlot, equip, unequip } = useAppearance();

  const color = normalizeHex(bodyColor ?? '') ?? paleta.menta.base;
  const canChangeColor = Boolean(onBodyColorChange);
  const [hexDraft, setHexDraft] = useState(color);
  const listHeight = Math.max(190, Math.min(340, height * 0.4));

  const slotItems = useMemo(
    () => (mode === 'home' || mode === 'COLOR' ? [] : items.filter((item) => item.slot === mode)),
    [items, mode]
  );

  const updateColor = (next: string) => {
    setHexDraft(next);
    onBodyColorChange?.(next);
  };

  const handleHex = (text: string) => {
    setHexDraft(text);
    const parsed = normalizeHex(text);
    if (parsed) updateColor(parsed);
  };

  const title = mode === 'home' ? 'VESTIR' : mode === 'COLOR' ? 'COLOR' : SLOT_LABELS[mode];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      onShow={() => {
        setMode('home');
        setHexDraft(color);
      }}>
      <Pressable
        style={{
          flex: 1,
          backgroundColor: 'rgba(18, 13, 36, 0.62)',
          justifyContent: 'flex-end',
        }}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Cerrar menú de vestimenta">
        <Pressable
          onPress={(event) => event.stopPropagation()}
          style={{ width: '100%', paddingHorizontal: 10, paddingBottom: 10 }}
          accessibilityViewIsModal>
          <ClaySurface
            colors={clay.fondoClaro}
            radius={radios.tarjetaGrande}
            border
            style={[sombras.tarjeta, { maxHeight: height * 0.88 }]}
            contentStyle={{ padding: 18 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              {mode !== 'home' ? (
                <ClayIconButton
                  icon="←"
                  iconColor={clay.texto}
                  size={42}
                  onPress={() => setMode('home')}
                  accessibilityLabel="Volver a las opciones de vestimenta"
                />
              ) : null}
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: fuentes.pixel,
                    fontSize: mode === 'home' ? 15 : 12,
                    color: clay.texto,
                    letterSpacing: 1,
                  }}
                  accessibilityRole="header">
                  {title}
                </Text>
                <Text
                  style={{ marginTop: 5, color: clay.textoSuave, fontSize: textoClay.etiqueta }}>
                  {mode === 'home'
                    ? 'Elige qué parte quieres personalizar.'
                    : mode === 'COLOR'
                      ? 'Mueve el dedo en la rueda o escribe un hex.'
                      : `Tienes ${slotItems.length} prenda${slotItems.length === 1 ? '' : 's'} para esta parte.`}
                </Text>
              </View>
              <ClayIconButton
                icon="✕"
                iconColor={clay.texto}
                size={44}
                onPress={onClose}
                accessibilityLabel="Cerrar menú de vestimenta"
              />
            </View>

            {mode === 'home' ? (
              <View style={{ marginTop: 16 }}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                  {SLOTS.map((slot) => {
                    const equipped = equippedBySlot[slot];
                    return (
                      <PartButton
                        key={slot}
                        label={SLOT_LABELS[slot]}
                        detail={equipped ? equipped.name : 'Sin prenda'}
                        preview={<ItemPreview item={equipped} size={24} />}
                        onPress={() => setMode(slot)}
                        accessibilityLabel={`Elegir ${SLOT_LABELS[slot]}. ${
                          equipped ? `Lleva ${equipped.name}` : 'Vacío'
                        }`}
                      />
                    );
                  })}
                  <PartButton
                    label="Color"
                    detail={color}
                    preview={
                      <View
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 13,
                          backgroundColor: color,
                          borderWidth: 2,
                          borderColor: '#FFFFFF',
                        }}
                      />
                    }
                    onPress={() => setMode('COLOR')}
                    accessibilityLabel={`Elegir color de la mascota. Color actual ${color}`}
                  />
                </View>
                <Text
                  style={{
                    marginTop: 12,
                    fontSize: 10,
                    lineHeight: 15,
                    color: clay.textoTenue,
                    textAlign: 'center',
                  }}>
                  El color que elijas se aplica a toda la mascota y a sus indicadores.
                </Text>
              </View>
            ) : mode === 'COLOR' ? (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: 14, paddingBottom: 4, gap: 12 }}>
                <ColorWheel value={color} size={196} onChange={updateColor} />

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 16,
                      backgroundColor: color,
                      borderWidth: 2,
                      borderColor: '#FFFFFF',
                      ...sombras.suave,
                    }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: '900',
                        color: clay.textoSuave,
                        textTransform: 'uppercase',
                      }}>
                      Hex
                    </Text>
                    <ClayInput
                      value={hexDraft}
                      onChangeText={handleHex}
                      onBlur={() => setHexDraft(color)}
                      autoCapitalize="characters"
                      autoCorrect={false}
                      maxLength={7}
                      placeholder="#77BBA2"
                      accessibilityLabel="Código hexadecimal del color"
                      style={{ fontFamily: undefined, letterSpacing: 1 }}
                    />
                  </View>
                </View>

                <View>
                  <Text
                    style={{
                      marginBottom: 7,
                      fontSize: 10,
                      fontWeight: '900',
                      color: clay.textoSuave,
                      textTransform: 'uppercase',
                    }}>
                    Atajos
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {COLORES_MASCOTA.map((option) => {
                      const selected = option.hex.toLowerCase() === color.toLowerCase();
                      return (
                        <Pressable
                          key={option.hex}
                          onPress={() => updateColor(option.hex)}
                          accessibilityRole="button"
                          accessibilityState={{ selected }}
                          accessibilityLabel={`Usar color ${option.nombre}`}
                          style={({ pressed }) => [
                            {
                              width: 34,
                              height: 34,
                              borderRadius: 17,
                              backgroundColor: option.hex,
                              borderWidth: selected ? 3 : 1.5,
                              borderColor: selected ? clay.texto : '#FFFFFF',
                              ...sombras.suave,
                            },
                            pressed ? { opacity: 0.75 } : null,
                          ]}
                        />
                      );
                    })}
                  </View>
                </View>

                {!canChangeColor ? (
                  <Text style={{ fontSize: 10, color: clay.textoTenue, textAlign: 'center' }}>
                    Este color es de solo lectura.
                  </Text>
                ) : null}

                <ClayButton
                  title="Listo"
                  colors={clay.menta}
                  textColor={clay.texto}
                  size="md"
                  pixel={false}
                  onPress={() => setMode('home')}
                  accessibilityLabel="Volver a las opciones de vestimenta"
                />
              </ScrollView>
            ) : (
              <ScrollView
                style={{ maxHeight: listHeight }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: 14, paddingBottom: 4, gap: 8 }}>
                {status === 'loading' ? (
                  <View style={{ minHeight: 160, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator color={clay.violeta[0]} size="large" />
                    <Text style={{ marginTop: 10, color: clay.textoSuave, fontSize: 12 }}>
                      Cargando prendas...
                    </Text>
                  </View>
                ) : status === 'error' ? (
                  <Text
                    style={{
                      paddingVertical: 24,
                      color: clay.texto,
                      fontSize: 13,
                      fontWeight: '800',
                      textAlign: 'center',
                    }}>
                    No se pudieron cargar las prendas.
                  </Text>
                ) : slotItems.length === 0 ? (
                  <View style={{ paddingVertical: 28, alignItems: 'center' }}>
                    <Text style={{ fontSize: 30 }}>👕</Text>
                    <Text
                      style={{
                        marginTop: 8,
                        color: clay.texto,
                        fontSize: 14,
                        fontWeight: '900',
                        textAlign: 'center',
                      }}>
                      No hay prendas para {SLOT_LABELS[mode].toLowerCase()}
                    </Text>
                    <Text style={{ marginTop: 4, color: clay.textoSuave, fontSize: 11 }}>
                      Vuelve cuando tengas más inventario.
                    </Text>
                  </View>
                ) : (
                  slotItems.map((item) => {
                    const active = item.equipped;
                    return (
                      <Pressable
                        key={item.id}
                        onPress={() => (active ? unequip(item.id) : equip(item.id))}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}
                        accessibilityLabel={
                          active
                            ? `${item.name} equipada. Toca para quitarla`
                            : `Equipar ${item.name}`
                        }>
                        <ClaySurface
                          colors={active ? clay.menta : clay.blanco}
                          radius={radios.input}
                          border
                          shadow="suave"
                          contentStyle={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            padding: 10,
                            gap: 12,
                            minHeight: 64,
                          }}>
                          <View
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: 14,
                              backgroundColor: 'rgba(255,255,255,0.6)',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                            <ItemPreview item={item} size={30} />
                          </View>
                          <View style={{ flex: 1, minWidth: 0 }}>
                            <Text
                              numberOfLines={1}
                              style={{ fontSize: 13, fontWeight: '900', color: clay.oscuro }}>
                              {item.name}
                            </Text>
                            <Text style={{ fontSize: 10, color: clay.textoSuave, marginTop: 2 }}>
                              {SLOT_LABELS[item.slot]}
                            </Text>
                          </View>
                          <Text
                            style={{
                              fontSize: 10,
                              fontWeight: '900',
                              color: clay.oscuro,
                            }}>
                            {active ? 'Quitar' : 'Equipar'}
                          </Text>
                        </ClaySurface>
                      </Pressable>
                    );
                  })
                )}
              </ScrollView>
            )}
          </ClaySurface>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
