import { useState } from 'react';
import { ActivityIndicator, FlatList, Image, Modal, Pressable, Text, View } from 'react-native';
import { useAppearance, type InventoryStatus } from '@/hooks/useAppearance';
import { SLOTS, SLOT_LABELS, type PetItem, type Slot } from '@/lib/appearance';
import { Button } from '@/layout/Button';
import { colores, equipar, mensajesError, modal } from '@/estilos';

type EquipMenuProps = {
  visible: boolean;
  onClose: () => void;
};

type SlotFilter = 'ALL' | Slot;

const FILTERS: readonly SlotFilter[] = ['ALL', ...SLOTS];

const DEMO_STATES: readonly { status: InventoryStatus; label: string }[] = [
  { status: 'ready', label: 'Normal' },
  { status: 'loading', label: 'Cargando' },
  { status: 'empty', label: 'Vacío' },
  { status: 'error', label: 'Error' },
];

function ItemPreview({ item, variant }: { item: PetItem | null; variant: 'slot' | 'row' }) {
  const wrapper = variant === 'slot' ? equipar.huecoPreview : equipar.filaImagen;
  const imageStyle = variant === 'slot' ? equipar.huecoImagen : equipar.filaImagenImg;
  const emojiStyle = variant === 'slot' ? equipar.huecoEmoji : equipar.filaEmoji;

  if (!item) {
    return (
      <View className={wrapper}>
        <Text className={equipar.huecoPlaceholder}>＋</Text>
      </View>
    );
  }

  return (
    <View className={wrapper}>
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} className={imageStyle} resizeMode="contain" />
      ) : (
        <Text className={emojiStyle}>{item.emoji}</Text>
      )}
    </View>
  );
}

export function EquipMenu({ visible, onClose }: EquipMenuProps) {
  const [filter, setFilter] = useState<SlotFilter>('ALL');
  const { items, status, equippedBySlot, equip, unequip, setStatus } = useAppearance();

  const filteredItems = filter === 'ALL' ? items : items.filter((item) => item.slot === filter);
  const showEmpty = status === 'empty' || (status === 'ready' && filteredItems.length === 0);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className={modal.overlayInferior} onPress={onClose}>
        <Pressable className={equipar.hoja} onPress={(event) => event.stopPropagation()}>
          <View className={equipar.encabezado}>
            <Text
              className={equipar.titulo}
              style={equipar.tituloFuente}
              accessibilityRole="header">
              VESTIR
            </Text>
            <Pressable
              className={equipar.cerrar}
              onPress={onClose}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Cerrar menú de vestimenta">
              <Text className={equipar.cerrarTexto}>✕</Text>
            </Pressable>
          </View>

          <Text className={equipar.subtitulo}>
            Toca una prenda para equiparla. Toca un hueco ocupado para quitarla.
          </Text>

          <View className={equipar.huecos}>
            {SLOTS.map((slot) => {
              const item = equippedBySlot[slot];
              return (
                <Pressable
                  key={slot}
                  className={`${equipar.hueco} ${item ? equipar.huecoActivo : ''}`}
                  onPress={() => item && unequip(item.id)}
                  disabled={!item}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: !item }}
                  accessibilityLabel={
                    item
                      ? `Hueco ${SLOT_LABELS[slot]}: ${item.name} equipada. Toca para desequipar`
                      : `Hueco ${SLOT_LABELS[slot]} vacío`
                  }>
                  <Text className={equipar.huecoEtiqueta}>
                    {slot} · {SLOT_LABELS[slot]}
                  </Text>
                  <ItemPreview item={item} variant="slot" />
                  <Text
                    className={item ? equipar.huecoNombre : equipar.huecoVacio}
                    numberOfLines={1}>
                    {item ? item.name : 'Vacío'}
                  </Text>
                  {item ? <Text className={equipar.equipado}>✓ Equipado</Text> : null}
                </Pressable>
              );
            })}
          </View>

          <Text className={equipar.seccion}>Inventario</Text>

          <View className={equipar.filtros}>
            {FILTERS.map((value) => {
              const label = value === 'ALL' ? 'Todas' : SLOT_LABELS[value];
              const selected = filter === value;
              return (
                <Pressable
                  key={value}
                  className={`${equipar.chip} ${selected ? equipar.chipActivo : ''}`}
                  onPress={() => setFilter(value)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={
                    value === 'ALL' ? 'Mostrar todas las prendas' : `Filtrar por ${label}`
                  }>
                  <Text className={selected ? equipar.chipTextoActivo : equipar.chipTexto}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View className={equipar.demo}>
            <Text className={equipar.demoEtiqueta}>Demo</Text>
            {DEMO_STATES.map(({ status: demoStatus, label }) => {
              const selected = status === demoStatus;
              return (
                <Pressable
                  key={demoStatus}
                  className={`${equipar.chip} ${selected ? equipar.chipActivo : ''}`}
                  onPress={() => setStatus(demoStatus)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`Simular estado ${label}`}>
                  <Text className={selected ? equipar.chipTextoActivo : equipar.chipTexto}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View className={equipar.listaContenedor}>
            {status === 'loading' ? (
              <View className={equipar.estadoBloque}>
                <ActivityIndicator color={colores.acento} />
                <Text className={equipar.estadoTexto}>Cargando prendas...</Text>
              </View>
            ) : status === 'error' ? (
              <View className={equipar.estadoBloque}>
                <Text className={mensajesError.inline}>No se pudieron cargar las prendas.</Text>
                <Button title="Reintentar" variant="secondary" onPress={() => setStatus('ready')} />
              </View>
            ) : showEmpty ? (
              <View className={equipar.vacioBloque}>
                <Text className={equipar.vacioEmoji}>👕</Text>
                <Text className={equipar.vacioTitulo}>No hay prendas aquí</Text>
                <Text className={equipar.vacioHint}>
                  Prueba otro slot o vuelve cuando tengas más inventario.
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredItems}
                keyExtractor={(item) => item.id}
                contentContainerStyle={equipar.listaContenido}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <Pressable
                    className={`${equipar.fila} ${item.equipped ? equipar.filaActiva : ''}`}
                    onPress={() => equip(item.id)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: item.equipped }}
                    accessibilityLabel={
                      item.equipped
                        ? `${item.name} ya equipada en ${SLOT_LABELS[item.slot]}`
                        : `Equipar ${item.name} en ${SLOT_LABELS[item.slot]}`
                    }>
                    <ItemPreview item={item} variant="row" />
                    <View className={equipar.filaInfo}>
                      <Text className={equipar.filaNombre}>{item.name}</Text>
                      <Text className={equipar.filaSlot}>
                        {item.slot} · {SLOT_LABELS[item.slot]}
                      </Text>
                    </View>
                    <View className={equipar.filaEstado}>
                      <Text className={item.equipped ? equipar.estado : equipar.accion}>
                        {item.equipped ? '✓ Equipado' : 'Equipar'}
                      </Text>
                    </View>
                  </Pressable>
                )}
              />
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
