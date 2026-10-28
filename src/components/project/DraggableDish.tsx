import { Text, View } from 'react-native';
import { useDishDrag } from '@/hooks/useDishDrag';
import { ClaySurface } from '@/components/clay/ClaySurface';
import { ClayPill } from '@/components/clay/ClayPill';
import { clay, radios, sombras } from '@/estilos';
import type { Dish } from '@/lib/types';

const TIER_META = {
  small: { label: 'Pequeño', emoji: '🍇', colors: clay.amarillo },
  medium: { label: 'Mediano', emoji: '🥟', colors: clay.naranja },
  large: { label: 'Grande', emoji: '🍱', colors: clay.verde },
} as const;

type DraggableDishProps = {
  dish: Dish;
  onStart: (dish: Dish, g: { moveX: number; moveY: number }) => void;
  onMove: (g: { moveX: number; moveY: number }) => void;
  onEnd: (dish: Dish, g: { moveX: number; moveY: number }) => void;
};

export function DraggableDish({ dish, onStart, onMove, onEnd }: DraggableDishProps) {
  const { panHandlers } = useDishDrag(dish, { onStart, onMove, onEnd });
  const meta = TIER_META[dish.tier];

  return (
    <View {...panHandlers} style={[{ width: 200 }, sombras.suave]}>
      <ClaySurface colors={clay.blanco} radius={radios.tarjeta} border>
        <View style={{ padding: 12 }}>
          <View style={{ alignItems: 'center', paddingVertical: 8 }}>
            <Text style={{ fontSize: 46 }}>{dish.food?.imageUrl ?? meta.emoji}</Text>
          </View>
          <Text
            numberOfLines={2}
            style={{ textAlign: 'center', fontSize: 12, fontWeight: '800', color: clay.texto }}>
            {dish.message}
          </Text>
          <View style={{ marginTop: 8, alignItems: 'center' }}>
            <ClayPill
              label={`${meta.emoji} ${meta.label} · ${dish.score}`}
              colors={meta.colors}
              textColor="#1A1A1C"
              accessibilityLabel={`${meta.label}, puntuación ${dish.score}`}
            />
          </View>
          {dish.food ? (
            <Text
              style={{ marginTop: 6, textAlign: 'center', fontSize: 9, color: clay.textoSuave }}>
              Restaura hambre {dish.food.hungerRestore}
            </Text>
          ) : null}
        </View>
      </ClaySurface>
    </View>
  );
}
