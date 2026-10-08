import { useEffect, useState } from 'react';
import { Animated } from 'react-native';

export function useIntroAnimation(onFinish: () => void) {
  const [opacity] = useState(() => new Animated.Value(1));
  const [scale] = useState(() => new Animated.Value(0.8));

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 5 }),
      Animated.delay(600),
      Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(() => onFinish());
  }, [onFinish, opacity, scale]);

  return { opacity, scale };
}
