import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '@/theme/tokens';
import React from 'react';

type Props = {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

/**
 * Boton circular de volver: fondo verde menta, borde negro y flecha pixel.
 */
export function BackButton({ onPress, style, accessibilityLabel = 'Volver' }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.button, pressed && styles.pressed, style]}>
      <View style={styles.inner}>
        <Svg width={20} height={20} viewBox="0 0 20 20">
          <Path
            d="M13 4L7 10L13 16"
            stroke={colors.ink}
            strokeWidth={4}
            strokeLinecap="square"
            strokeLinejoin="miter"
            fill="none"
          />
        </Svg>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.mint,
    borderWidth: 3,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
    elevation: 4,
  },
  inner: {
    transform: [{ translateX: -1 }],
  },
  pressed: {
    transform: [{ scale: 0.94 }],
    backgroundColor: colors.mintSoft,
  },
});
