import {
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { colors, fonts, radii } from '@/theme/tokens';
import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

type Props = PressableProps & {
  title: string;
  variant?: Variant;
  small?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

const variantBg: Record<Variant, string> = {
  primary: colors.ink,
  secondary: colors.mint,
  ghost: 'transparent',
};

const variantBgActive: Record<Variant, string> = {
  primary: colors.inkSoft,
  secondary: colors.mintSoft,
  ghost: colors.inkSoft,
};

const variantText: Record<Variant, string> = {
  primary: colors.mint,
  secondary: colors.ink,
  ghost: colors.mint,
};

/**
 * Boton principal del sistema: oscuro, borde negro grueso tipo pixel,
 * tipografia pixel-art y esquinas redondeadas.
 */
export function PixelButton({
  title,
  variant = 'primary',
  small,
  disabled,
  style,
  textStyle,
  ...rest
}: Props) {
  const pressedBg = variantBgActive[variant];

  return (
    <Pressable
      {...rest}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        small ? styles.small : styles.normal,
        { backgroundColor: variantBg[variant] },
        pressed && { backgroundColor: pressedBg, transform: [{ translateY: 2 }] },
        disabled && styles.disabled,
        style,
      ]}>
      {({ pressed }) => (
        <Text
          style={[
            styles.text,
            { color: variantText[variant] },
            pressed && styles.textPressed,
            textStyle,
          ]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.ink,
    borderRadius: radii.md,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 2,
    elevation: 4,
  },
  normal: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  small: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  text: {
    fontFamily: fonts.pixel,
    fontSize: 12,
    lineHeight: 18,
  },
  textPressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
});
