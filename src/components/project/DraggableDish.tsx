import { useMemo } from 'react';
import { PanResponder, Text, View } from 'react-native';
import type { Dish } from '@/lib/types';

const TIER_META = {
  small: { label: 'Pequeño', emoji: '🍇', color: 'bg-yellow-500/20', text: 'text-yellow-300' },
  medium: { label: 'Mediano', emoji: '🥟', color: 'bg-orange-500/20', text: 'text-orange-300' },
  large: { label: 'Grande', emoji: '🍱', color: 'bg-emerald-500/20', text: 'text-emerald-300' },
} as const;

type DraggableDishProps = {
  dish: Dish;
  onStart: (dish: Dish, g: { moveX: number; moveY: number }) => void;
  onMove: (g: { moveX: number; moveY: number }) => void;
  onEnd: (dish: Dish, g: { moveX: number; moveY: number }) => void;
};

export function DraggableDish({ dish, onStart, onMove, onEnd }: DraggableDishProps) {
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
