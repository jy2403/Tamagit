import { Text, View } from 'react-native';
import { useAppearance } from '@/hooks/useAppearance';
import { SLOTS, SLOT_LABELS } from '@/lib/appearance';
import { ClaySurface } from '@/components/clay/ClaySurface';
import { clay, radios } from '@/estilos';

export function EquippedStrip() {
  const { equippedBySlot } = useAppearance();

  return (
    <View>
      <Text style={{ marginBottom: 6, fontSize: 10, fontWeight: '900', color: clay.textoSuave }}>
        VESTIMENTA
      </Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {SLOTS.map((slot) => {
          const item = equippedBySlot[slot];
          return (
            <View key={slot} style={{ flex: 1 }}>
              <ClaySurface
                colors={clay.fondoClaro}
                radius={radios.chip}
                border
                contentStyle={{ padding: 9, minHeight: 58 }}>
                <Text style={{ fontSize: 8, fontWeight: '900', color: clay.textoTenue }}>
                  {SLOT_LABELS[slot]}
                </Text>
                <Text
                  numberOfLines={2}
                  style={{
                    marginTop: 3,
                    fontSize: 10,
                    fontWeight: '800',
                    color: item ? clay.texto : clay.textoTenue,
                  }}>
                  {item ? `${item.emoji} ${item.name}` : 'Vacío'}
                </Text>
              </ClaySurface>
            </View>
          );
        })}
      </View>
    </View>
  );
}
