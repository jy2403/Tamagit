import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { colors, fonts } from '@/theme/tokens';

export function IntroAnimation({ onFinish }: { onFinish: () => void }) {
  const [opacity] = useState(() => new Animated.Value(1));
  const [scale] = useState(() => new Animated.Value(0.8));

  useEffect(() => {
    Animated.sequence([
      // entra el logo
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 5 }),
      // espera un toque
      Animated.delay(600),
      // se desvanece todo el overlay
      Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(() => onFinish());
  }, [scale, opacity, onFinish]);

  return (
    <Animated.View style={[styles.overlay, { opacity }]} pointerEvents="none">
      <Animated.Text style={[styles.logo, { transform: [{ scale }] }]}>TAMAGIT</Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.bgDeep,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  logo: {
    color: colors.mint,
    fontSize: 24,
    fontFamily: fonts.pixel,
  },
});
