import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, fonts } from '@/theme/tokens';
import React from 'react';

type Props = {
  value: number;
  label?: string;
  size?: number;
  strokeWidth?: number;
  trackColor?: string;
  strokeColor?: string;
  style?: StyleProp<ViewStyle>;
  showValue?: boolean;
};

/**
 * Indicador circular de estadistica (progress ring): borde negro exterior,
 * anillo verde menta y valor centrado.
 */
export function ProgressRing({
  value,
  label,
  size = 90,
  strokeWidth = 10,
  trackColor = colors.inkSoft,
  strokeColor = colors.mint,
  style,
  showValue = true,
}: Props) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - strokeWidth) / 2 - 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);

  return (
    <View style={[styles.container, style]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={offset}
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.center}>
        {showValue ? <Text style={styles.value}>{Math.round(clamped)}</Text> : null}
      </View>
      {label ? (
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.ink,
    borderRadius: 999,
    backgroundColor: colors.ink,
    padding: 4,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 2,
    elevation: 3,
  },
  center: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontFamily: fonts.pixel,
    fontSize: 15,
    color: colors.white,
  },
  label: {
    position: 'absolute',
    bottom: 0,
    width: 60,
    left: -30,
    textAlign: 'center',
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    color: colors.mintSoft,
  },
});
