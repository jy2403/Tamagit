import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, RadialGradient as SvgRadialGradient, Stop } from 'react-native-svg';
import { colors } from '@/theme/tokens';
import React from 'react';

type Props = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  showGlow?: boolean;
  glowColor?: string;
};

const ABSOLUTE: ViewStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};

/**
 * Fondo base del sistema de diseño: degradado morado/violeta con blobs
 * orgánicos verde menta (decorativos) y un resplandor radial opcional.
 */
export function PixelBackground({
  children,
  style,
  showGlow = false,
  glowColor = colors.bgVioletLight,
}: Props) {
  return (
    <View style={[ABSOLUTE, styles.root]}>
      <LinearGradient
        colors={[colors.bgViolet, colors.bgPurple, colors.bgDeep]}
        locations={[0, 0.5, 1]}
        style={ABSOLUTE}
      />

      {showGlow ? (
        <View style={styles.glowWrap}>
          <Svg width="100%" height="100%" viewBox="0 0 200 200" style={styles.glowSvg}>
            <Defs>
              <SvgRadialGradient id="glow" cx="50%" cy="50%" rx="50%" ry="50%">
                <Stop offset="0%" stopColor={glowColor} stopOpacity="0.55" />
                <Stop offset="55%" stopColor={glowColor} stopOpacity="0.22" />
                <Stop offset="100%" stopColor={glowColor} stopOpacity="0" />
              </SvgRadialGradient>
            </Defs>
            <Circle cx="100" cy="100" r="100" fill="url(#glow)" />
          </Svg>
        </View>
      ) : null}

      <View pointerEvents="none" style={styles.blobLayer}>
        <View style={[styles.blob, styles.blobTopLeft, { backgroundColor: colors.mint }]} />
        <View style={[styles.blob, styles.blobTopLeftSoft, { backgroundColor: colors.mintSoft }]} />
        <View style={[styles.blob, styles.blobRight, { backgroundColor: colors.mint }]} />
        <View style={[styles.blob, styles.blobBottomRight, { backgroundColor: colors.mintSoft }]} />
        <View style={[styles.blob, styles.blobMid, { backgroundColor: colors.mintDeep }]} />
      </View>

      <View style={[styles.content, style]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    overflow: 'hidden',
  },
  content: {
    ...ABSOLUTE,
  },
  glowWrap: {
    ...ABSOLUTE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowSvg: {
    width: '100%',
    height: '100%',
  },
  blobLayer: {
    ...ABSOLUTE,
  },
  blob: {
    position: 'absolute',
    opacity: 0.18,
  },
  blobTopLeft: {
    top: -70,
    left: -60,
    width: 260,
    height: 230,
    borderBottomLeftRadius: 150,
    borderBottomRightRadius: 90,
    borderTopRightRadius: 140,
    transform: [{ rotate: '24deg' }],
  },
  blobTopLeftSoft: {
    top: 30,
    left: -90,
    width: 190,
    height: 170,
    borderBottomLeftRadius: 120,
    borderBottomRightRadius: 70,
    borderTopRightRadius: 100,
    opacity: 0.1,
    transform: [{ rotate: '-18deg' }],
  },
  blobRight: {
    top: -40,
    right: -80,
    width: 220,
    height: 250,
    borderTopLeftRadius: 160,
    borderBottomLeftRadius: 90,
    borderBottomRightRadius: 130,
    opacity: 0.12,
    transform: [{ rotate: '-14deg' }],
  },
  blobBottomRight: {
    bottom: -100,
    right: -70,
    width: 280,
    height: 240,
    borderTopLeftRadius: 160,
    borderTopRightRadius: 80,
    borderBottomLeftRadius: 120,
    opacity: 0.16,
    transform: [{ rotate: '16deg' }],
  },
  blobMid: {
    bottom: 220,
    left: -70,
    width: 180,
    height: 170,
    borderTopRightRadius: 130,
    borderBottomRightRadius: 60,
    borderBottomLeftRadius: 100,
    opacity: 0.1,
    transform: [{ rotate: '-22deg' }],
  },
});
