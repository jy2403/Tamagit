import {
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, fonts, radii } from '@/theme/tokens';
import React from 'react';

type ButtonProps = PressableProps & {
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  style?: StyleProp<ViewStyle>;
};

const variantBg: Record<'primary' | 'secondary' | 'ghost', string> = {
  primary: colors.ink,
  secondary: colors.mint,
  ghost: 'transparent',
};

const variantText: Record<'primary' | 'secondary' | 'ghost', string> = {
  primary: colors.mint,
  secondary: colors.ink,
  ghost: colors.mint,
};

export function Button({ title, variant = 'primary', disabled, style, ...rest }: ButtonProps) {
  return (
    <Pressable
      {...rest}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: variantBg[variant],
          borderColor: variant === 'ghost' ? 'transparent' : colors.ink,
        },
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}>
      <Text style={[styles.text, { color: variantText[variant] }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderRadius: radii.md,
    paddingVertical: 14,
    paddingHorizontal: 24,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 2,
    elevation: 3,
  },
  text: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ translateY: 1 }],
  },
  disabled: {
    opacity: 0.5,
  },
});
