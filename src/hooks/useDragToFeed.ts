import { useCallback, useState } from 'react';
import { Animated, type View } from 'react-native';
import type { Dish } from '@/lib/types';

export function useDragToFeed(
  petAreaRef: React.RefObject<View | null>,
  onFeed: (dish: Dish) => void
) {
  const [dragging, setDragging] = useState<Dish | null>(null);
  const [dragAnim] = useState(() => new Animated.ValueXY());

  const startDrag = useCallback(
    (dish: Dish, g: { moveX: number; moveY: number }) => {
      setDragging(dish);
      dragAnim.setValue({ x: g.moveX, y: g.moveY });
    },
    [dragAnim]
  );

  const moveDrag = useCallback(
    (g: { moveX: number; moveY: number }) => {
      dragAnim.setValue({ x: g.moveX, y: g.moveY });
    },
    [dragAnim]
  );

  const endDrag = useCallback(
    (dish: Dish, g: { moveX: number; moveY: number }) => {
      setDragging(null);
      petAreaRef.current?.measureInWindow((x, y, w, h) => {
        const inside = g.moveX >= x && g.moveX <= x + w && g.moveY >= y && g.moveY <= y + h;
        if (inside) {
          onFeed(dish);
        }
      });
    },
    [onFeed, petAreaRef]
  );

  return { dragging, dragAnim, startDrag, moveDrag, endDrag };
}
