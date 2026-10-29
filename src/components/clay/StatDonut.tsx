import type { ReactNode } from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { sombras } from '@/estilos';
import { IconoImagen, type NombreIcono } from './IconoImagen';

type StatDonutProps = {
  value: number;
  color: string;
  icon: ReactNode | NombreIcono | string;
  label: string;
  size?: number;
  strokeWidth?: number;
  innerBg?: string;
  iconColor?: string;
  trackColor?: string;
  shadow?: boolean;
  style?: StyleProp<ViewStyle>;
  linecap?: 'round' | 'butt';
};

export function StatDonut({
  value,
  color,
  icon,
  label,
  size = 44,
  strokeWidth = 6,
  innerBg,
  iconColor,
  trackColor = '#E1E1E6',
  shadow = true,
  style,
  linecap = 'round',
}: StatDonutProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const center = size / 2;
  const radius = center - strokeWidth / 2 - 0.5;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);
  const iconSize = Math.round(size * 0.38);
  const tint = iconColor ?? color;

  const renderIcon = () => {
    if (typeof icon === 'string') {
      if (icon === '♥' || icon === 'vida') {
        return <IconoImagen nombre="vida" size={iconSize} tintColor={tint} />;
      }
      if (icon === '🍎' || icon === '●' || icon === 'hambre') {
        return <IconoImagen nombre="hambre" size={iconSize} tintColor={tint} />;
      }
      if (icon === '☺' || icon === 'felicidad') {
        return <IconoImagen nombre="felicidad" size={iconSize} tintColor={tint} />;
      }
      return <Text style={{ fontSize: iconSize, lineHeight: iconSize + 3 }}>{icon}</Text>;
    }
    return icon;
  };

  const innerRadius = Math.max(0, radius - strokeWidth / 2);

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`${label}: ${clamped}%`}
      accessibilityValue={{ min: 0, max: 100, now: clamped }}
      style={[
        shadow ? sombras.suave : null,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: '#FFFFFF',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        },
        style,
      ]}>
      <Svg width={size} height={size}>
        {innerBg ? <Circle cx={center} cy={center} r={innerRadius} fill={innerBg} /> : null}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap={linecap}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      <View
        pointerEvents="none"
        style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center' }}>
        {renderIcon()}
      </View>
    </View>
  );
}
