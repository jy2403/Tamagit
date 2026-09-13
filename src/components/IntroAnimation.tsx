import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

export function IntroAnimation({ onFinish }: { onFinish: () => void }) {
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.sequence([
      // entra el logo
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 5 }),
      // espera un toque
      Animated.delay(600),
      // se desvanece todo el overlay
      Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(() => onFinish());
  }, []);

  return (
    <Animated.View style={[styles.overlay, { opacity }]} pointerEvents="none">
      <Animated.Text style={[styles.logo, { transform: [{ scale }] }]}>
        Tamagit
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#0f0f0f',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  logo: {
    color: '#fff',
    fontSize: 28,
    fontFamily: 'PressStart2P_400Regular',
  },
});