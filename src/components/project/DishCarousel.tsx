import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import type { Dish } from '@/lib/types';
import { DraggableDish } from './DraggableDish';

type DishCarouselProps = {
  dishes: Dish[];
  loading: boolean;
  onStart: (dish: Dish, g: { moveX: number; moveY: number }) => void;
  onMove: (g: { moveX: number; moveY: number }) => void;
  onEnd: (dish: Dish, g: { moveX: number; moveY: number }) => void;
};

export function DishCarousel({ dishes, loading, onStart, onMove, onEnd }: DishCarouselProps) {
  return (
    <View>
      <Text className="text-sm font-semibold text-white">Platillos del repo 🍽️</Text>
      <Text className="mt-0.5 text-xs text-neutral-500">
        Elige un platillo (un commit) y arrástralo al muñeco para alimentarlo.
      </Text>

      <View className="mt-3">
        {loading ? (
          <ActivityIndicator color="#10b981" />
        ) : dishes.length === 0 ? (
          <View className="items-center gap-2 rounded-2xl border border-dashed border-neutral-700 py-8">
            <Text className="text-4xl">🍽️</Text>
            <Text className="text-center text-sm text-neutral-300">
              No hay platillos por ahora.
            </Text>
            <Text className="text-center text-xs text-neutral-500">
              Los platillos aparecen con cada commit nuevo que hagas en tu repo desde que creaste la
              mascota.
            </Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingVertical: 8 }}>
            {dishes.map((dish) => (
              <DraggableDish
                key={dish.commitId}
                dish={dish}
                onStart={onStart}
                onMove={onMove}
                onEnd={onEnd}
              />
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}
