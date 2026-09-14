import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { colors, fonts, radii } from '@/theme/tokens';
import React from 'react';

type Props = {
  children: React.ReactNode;
  tone?: 'mint' | 'dark';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

/**
 * Cartel/badge reutilizable: esquinas redondeadas, borde negro grueso
 * tipo comic/pixel y tipografia pixel-art.
 */
export function PixelBadge({ children, tone = 'dark', style, textStyle }: Props) {
  const isMint = tone === 'mint';
  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: isMint ? colors.mint : colors.ink,
          borderColor: isMint ? colors.mintDark : colors.ink,
        },
        style,
      ]}>
      <Text
        style={[styles.text, { color: isMint ? colors.ink : colors.mint }, textStyle]}
        numberOfLines={1}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 3,
    borderRadius: radii.sm,
    paddingHorizontal: 18,
    paddingVertical: 10,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  text: {
    fontFamily: fonts.pixel,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
  },
});
