import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { ClayButton } from '@/components/clay/ClayButton';
import { ClayIconButton } from '@/components/clay/ClayIconButton';
import { ClaySurface } from '@/components/clay/ClaySurface';
import { FeedbackBanner } from '@/components/FeedbackBanner';
import type { Appearance } from '@/hooks/useAppearance';
import { SLOTS, SLOT_LABELS, itemEmoji } from '@/lib/appearance';
import type { Item, Slot } from '@/lib/types';
import { clay, fuentes, radios, sombras, textoClay } from '@/estilos';

type EquipMenuProps = {
  visible: boolean;
  onClose: () => void;
  appearance: Appearance;
};

type SlotFilter = 'ALL' | Slot;

const FILTERS: readonly SlotFilter[] = ['ALL', ...SLOTS];

function ItemPreview({ item, size }: { item: Item | null; size: number }) {
  const [imageFailed, setImageFailed] = useState(false);

  if (!item) {
    return <Text style={{ fontSize: size * 0.7, color: clay.textoTenue }}>＋</Text>;
  }
  if (item.imageUrl && !imageFailed) {
    return (
      <Image
        source={{ uri: item.imageUrl }}
        style={{ width: size, height: size }}
        resizeMode="contain"
        onError={() => setImageFailed(true)}
      />
    );
  }
  return <Text style={{ fontSize: size * 0.8 }}>{itemEmoji(item)}</Text>;
}

function Chip({
  label,
  selected,
  onPress,
  accessibilityLabel,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  accessibilityLabel: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel}>
      <ClaySurface
        colors={selected ? clay.negro : clay.blanco}
        radius={radios.pastilla}
        contentStyle={{
          paddingHorizontal: 13,
          paddingVertical: 8,
          minHeight: 36,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text
          style={{
            color: selected ? clay.textoClaro : clay.texto,
            fontSize: 11,
            fontWeight: '800',
          }}>
          {label}
        </Text>
      </ClaySurface>
    </Pressable>
  );
}

export function EquipMenu({ visible, onClose, appearance }: EquipMenuProps) {
  const [filter, setFilter] = useState<SlotFilter>('ALL');
  const { height } = useWindowDimensions();
  const {
    entries,
    status,
    busyItemId,
    feedback,
    setFeedback,
    equippedBySlot,
    equip,
    unequip,
    reload,
  } = appearance;
  const clearFeedback = useCallback(() => setFeedback(null), [setFeedback]);

  const filteredItems =
    filter === 'ALL' ? entries : entries.filter(({ item }) => item.slot === filter);
  const showEmpty = status === 'empty' || (status === 'ready' && filteredItems.length === 0);
  const listHeight = Math.max(180, Math.min(340, height * 0.34));

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        style={{
          flex: 1,
          backgroundColor: 'rgba(26,26,31,0.58)',
          justifyContent: 'flex-end',
        }}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Cerrar menú de vestimenta">
        <Pressable
          onPress={(event) => event.stopPropagation()}
          style={{ width: '100%', paddingHorizontal: 12, paddingBottom: 12 }}
          accessibilityViewIsModal>
          <ClaySurface
            colors={clay.fondoClaro}
            radius={radios.tarjetaGrande}
            border
            style={sombras.tarjeta}
            contentStyle={{ padding: 18 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: fuentes.pixel,
                    fontSize: 15,
                    color: clay.texto,
                    letterSpacing: 1,
                  }}
                  accessibilityRole="header">
                  VESTIR
                </Text>
                <Text
                  style={{ marginTop: 6, color: clay.textoSuave, fontSize: textoClay.etiqueta }}>
                  Toca una prenda para equiparla. Toca un hueco ocupado para quitarla.
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

            <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
              {SLOTS.map((slot) => {
                const item = equippedBySlot[slot];
                return (
                  <Pressable
                    key={slot}
                    style={{ flex: 1 }}
                    onPress={() => item && unequip(item)}
                    disabled={!item || busyItemId !== null}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: !item, selected: Boolean(item) }}
                    accessibilityLabel={
                      item
                        ? `Hueco ${SLOT_LABELS[slot]}: ${item.name} equipada. Toca para desequipar`
                        : `Hueco ${SLOT_LABELS[slot]} vacío`
                    }>
                    <ClaySurface
                      colors={item ? clay.lila : clay.blanco}
                      radius={18}
                      border
                      shadow="suave"
                      contentStyle={{
                        paddingVertical: 10,
                        paddingHorizontal: 6,
                        alignItems: 'center',
                        minHeight: 104,
                        justifyContent: 'center',
                      }}>
                      <Text
                        style={{
                          fontSize: textoClay.micro,
                          fontWeight: '800',
                          color: clay.textoSuave,
                          textTransform: 'uppercase',
                        }}>
                        {SLOT_LABELS[slot]}
                      </Text>
                      <View style={{ height: 34, justifyContent: 'center' }}>
                        <ItemPreview item={item} size={30} />
                      </View>
                      <Text
                        numberOfLines={1}
                        style={{ fontSize: 10, fontWeight: '800', color: clay.texto }}>
                        {item ? item.name : 'Vacío'}
                      </Text>
                    </ClaySurface>
                  </Pressable>
                );
              })}
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 18,
                marginBottom: 8,
              }}>
              <Text style={{ fontSize: 13, fontWeight: '900', color: clay.texto }}>Inventario</Text>
              <Text style={{ fontSize: 10, color: clay.textoTenue }}>
                {filteredItems.length} prendas
              </Text>
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {FILTERS.map((value) => {
                const label = value === 'ALL' ? 'Todas' : SLOT_LABELS[value];
                return (
                  <Chip
                    key={value}
                    label={label}
                    selected={filter === value}
                    onPress={() => setFilter(value)}
                    accessibilityLabel={
                      value === 'ALL' ? 'Mostrar todas las prendas' : `Filtrar por ${label}`
                    }
                  />
                );
              })}
            </View>

            <View
              style={{
                marginTop: 12,
                borderRadius: radios.tarjeta,
                overflow: 'hidden',
              }}>
              {status === 'loading' ? (
                <View
                  style={{ height: listHeight, alignItems: 'center', justifyContent: 'center' }}>
                  <ActivityIndicator color={clay.violeta[0]} size="large" />
                  <Text style={{ marginTop: 10, color: clay.textoSuave, fontSize: 12 }}>
                    Cargando prendas...
                  </Text>
                </View>
              ) : status === 'error' ? (
                <View
                  style={{
                    height: listHeight,
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 20,
                  }}>
                  <Text
                    style={{
                      color: clay.texto,
                      fontSize: 13,
                      fontWeight: '800',
                      textAlign: 'center',
                    }}>
                    No se pudieron cargar las prendas.
                  </Text>
                  <ClayButton
                    title="Reintentar"
                    colors={clay.blanco}
                    textColor={clay.texto}
                    pixel={false}
                    size="md"
                    onPress={() => void reload()}
                    style={{ marginTop: 14, alignSelf: 'stretch' }}
                  />
                </View>
              ) : showEmpty ? (
                <View
                  style={{
                    height: listHeight,
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 20,
                  }}>
                  <Text style={{ fontSize: 42 }}>👕</Text>
                  <Text
                    style={{
                      marginTop: 8,
                      color: clay.texto,
                      fontSize: 14,
                      fontWeight: '900',
                      textAlign: 'center',
                    }}>
                    No hay prendas aquí
                  </Text>
                  <Text
                    style={{
                      marginTop: 4,
                      color: clay.textoSuave,
                      fontSize: 12,
                      textAlign: 'center',
                    }}>
                    Prueba otro slot o vuelve cuando tengas más inventario.
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={filteredItems}
                  keyExtractor={({ item }) => String(item.id)}
                  style={{ height: listHeight }}
                  contentContainerStyle={{ paddingVertical: 4, gap: 8 }}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item: entry }) => {
                    const { item, owned, equipped: active } = entry;
                    const slotLabel = item.slot ? SLOT_LABELS[item.slot] : 'Sin slot';
                    return (
                      <Pressable
                        onPress={() => equip(item)}
                        disabled={busyItemId !== null}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active, busy: busyItemId === item.id }}
                        accessibilityLabel={
                          active
                            ? `${item.name} ya equipada en ${slotLabel}`
                            : `Equipar ${item.name} en ${slotLabel}`
                        }>
                        <ClaySurface
                          colors={active ? clay.verde : clay.blanco}
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
                              backgroundColor: 'rgba(255,255,255,0.55)',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                            <ItemPreview item={item} size={30} />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text
                              numberOfLines={1}
                              style={{ fontSize: 13, fontWeight: '900', color: clay.oscuro }}>
                              {item.name}
                            </Text>
                            <Text
                              style={{
                                fontSize: 10,
                                color: active ? clay.oscuro : clay.textoSuave,
                                marginTop: 2,
                              }}>
                              {slotLabel}
                            </Text>
                          </View>
                          <Text
                            style={{
                              fontSize: 10,
                              fontWeight: '900',
                              color: active ? clay.oscuro : clay.textoSuave,
                            }}>
                            {active ? '✓ Equipado' : owned ? 'Equipar' : 'No la tienes'}
                          </Text>
                        </ClaySurface>
                      </Pressable>
                    );
                  }}
                />
              )}
            </View>
          </ClaySurface>
        </Pressable>
      </Pressable>
      <FeedbackBanner feedback={feedback} onDone={clearFeedback} placement="top" />
    </Modal>
  );
}
