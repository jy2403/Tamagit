import { useMemo } from 'react';
import { PanResponder } from 'react-native';
import type { Dish } from '@/lib/types';

export type DragGesture = {
  moveX: number;
  moveY: number;
};

type DishDragHandlers = {
  onStart: (dish: Dish, g: DragGesture) => void;
  onMove: (g: DragGesture) => void;
  onEnd: (dish: Dish, g: DragGesture) => void;
};

export function useDishDrag(dish: Dish, h: DishDragHandlers) {
  const { onStart, onMove, onEnd } = h;

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

  return { panHandlers: panResponder.panHandlers };
}
