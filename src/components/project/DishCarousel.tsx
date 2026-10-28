import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import type { Dish } from '@/lib/types';
import { clay } from '@/estilos';
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
      <Text style={{ fontSize: 13, fontWeight: '900', color: clay.texto }}>
        Platillos del repo 🍽️
      </Text>
      <Text style={{ marginTop: 2, fontSize: 10, color: clay.textoSuave }}>
        Arrastra un platillo (un commit) a la mascota para alimentarla.
      </Text>

      <View style={{ marginTop: 10 }}>
        {loading ? (
          <ActivityIndicator color={clay.violeta[0]} />
        ) : dishes.length === 0 ? (
          <View
            style={{
              alignItems: 'center',
              gap: 6,
              borderWidth: 1,
              borderStyle: 'dashed',
              borderColor: '#CFCFD6',
              borderRadius: 22,
              paddingVertical: 24,
              paddingHorizontal: 16,
            }}>
            <Text style={{ fontSize: 34 }}>🍽️</Text>
            <Text
              style={{ textAlign: 'center', fontSize: 12, fontWeight: '800', color: clay.texto }}>
              No hay platillos por ahora.
            </Text>
            <Text style={{ textAlign: 'center', fontSize: 9, color: clay.textoSuave }}>
              Aparecen con cada commit nuevo que hagas en el repo desde que creaste la mascota.
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
