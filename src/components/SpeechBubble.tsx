import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, fonts, radii } from '@/theme/tokens';
import React from 'react';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  tail?: 'top' | 'none';
};

/**
 * Bocadillo de dialogo: cuadro gris claro con borde negro, esquinas
 * redondeadas y una cola apuntando hacia el personaje.
 */
export function SpeechBubble({ children, style, tail = 'top' }: Props) {
  return (
    <View style={[styles.wrapper, tail === 'top' && styles.wrapperTail, style]}>
      {tail === 'top' ? (
        <View style={styles.tailContainer} pointerEvents="none">
          <View style={styles.tail} />
        </View>
      ) : null}
      <View style={styles.bubble}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {},
  wrapperTail: {
    paddingTop: 12,
  },
  tailContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
    height: 14,
  },
  tail: {
    width: 26,
    height: 26,
    backgroundColor: colors.dialog,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: colors.ink,
    transform: [{ rotate: '45deg' }],
    marginTop: 11,
  },
  bubble: {
    backgroundColor: colors.dialog,
    borderWidth: 3,
    borderColor: colors.ink,
    borderRadius: radii.md,
    paddingHorizontal: 18,
    paddingVertical: 16,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
});

export const bubbleTextStyle = {
  fontFamily: fonts.body,
  fontSize: 15,
  lineHeight: 22,
  color: colors.dialogText,
};
