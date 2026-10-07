import { useMemo, useRef } from 'react';
import { PanResponder } from 'react-native';

const MIN_DIST = 2.0;
const MAX_DIST = 9.0;

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

export function usePetControls(
  yawRef: React.MutableRefObject<number>,
  distRef: React.MutableRefObject<number>,
  enabled: boolean
) {
  const lastXRef = useRef(0);
  const pinchRef = useRef<number | null>(null);

  const panResponder = useMemo(
    () =>
      // eslint-disable-next-line react-hooks/refs
      PanResponder.create({
        onStartShouldSetPanResponder: () => enabled,
        onMoveShouldSetPanResponder: () => enabled,
        onPanResponderGrant: (_, gesture) => {
          lastXRef.current = gesture.moveX;
        },
        onPanResponderMove: (event, gesture) => {
          const touches = (
            event.nativeEvent as unknown as {
              touches: { pageX: number; pageY: number }[];
            }
          ).touches;

          if (touches && touches.length >= 2) {
            const t0 = touches[0];
            const t1 = touches[1];
            const dx = t0.pageX - t1.pageX;
            const dy = t0.pageY - t1.pageY;
            const dist = Math.hypot(dx, dy);
            if (pinchRef.current != null) {
              const ratio = dist / pinchRef.current;
              distRef.current = clamp(distRef.current / ratio, MIN_DIST, MAX_DIST);
            }
            pinchRef.current = dist;
          } else {
            pinchRef.current = null;
            const dx = gesture.moveX - lastXRef.current;
            lastXRef.current = gesture.moveX;
            yawRef.current += dx * 0.012;
          }
        },
        onPanResponderRelease: () => {
          pinchRef.current = null;
        },
        onPanResponderTerminate: () => {
          pinchRef.current = null;
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [enabled]
  );

  return panResponder;
}
