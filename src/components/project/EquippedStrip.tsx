import { Text, View } from 'react-native';
import { useAppearance } from '@/hooks/useAppearance';
import { SLOTS, SLOT_LABELS } from '@/lib/appearance';
import { equipar } from '@/estilos';

export function EquippedStrip() {
  const { equippedBySlot } = useAppearance();

  return (
    <View>
      <Text className={equipar.resumenTitulo}>Vestimenta</Text>
      <View className={equipar.resumen}>
        {SLOTS.map((slot) => {
          const item = equippedBySlot[slot];
          return (
            <View key={slot} className={equipar.resumenHueco}>
              <Text className={equipar.resumenEtiqueta}>{SLOT_LABELS[slot]}</Text>
              <Text
                className={item ? equipar.resumenValor : equipar.resumenVacio}
                numberOfLines={1}>
                {item ? `${item.emoji} ${item.name}` : 'Vacío'}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
