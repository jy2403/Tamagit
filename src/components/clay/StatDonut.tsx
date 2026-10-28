import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
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
};

export function StatDonut({
  value,
  color,
  icon,
  label,
  size = 44,
  strokeWidth = 6,
}: StatDonutProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const center = size / 2;
  const radius = center - strokeWidth / 2 - 1;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);
  const iconSize = Math.round(size * 0.42);

  const renderIcon = () => {
    if (typeof icon === 'string') {
      if (icon === '♥' || icon === 'vida') {
        return <IconoImagen nombre="vida" size={iconSize} tintColor={color} />;
      }
      if (icon === '🍎' || icon === '●' || icon === 'hambre') {
        return <IconoImagen nombre="hambre" size={iconSize} tintColor={color} />;
      }
      if (icon === '☺' || icon === 'felicidad') {
        return <IconoImagen nombre="felicidad" size={iconSize} tintColor={color} />;
      }
      return <Text style={{ fontSize: iconSize, lineHeight: iconSize + 3 }}>{icon}</Text>;
    }
    return icon;
  };

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`${label}: ${clamped}%`}
      accessibilityValue={{ min: 0, max: 100, now: clamped }}
      style={[
        sombras.suave,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: '#F7F7F9',
          alignItems: 'center',
          justifyContent: 'center',
        },
      ]}>
      <Svg width={size} height={size}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#E1E1E6"
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
          strokeLinecap="round"
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
