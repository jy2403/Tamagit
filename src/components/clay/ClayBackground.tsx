import { useId, type ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { clay } from '@/estilos';

type ClayBackgroundProps = {
  children?: ReactNode;
};

export function ClayBackground({ children }: ClayBackgroundProps) {
  const rawId = useId();
  const id = `bg${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

  return (
    <View style={{ flex: 1, backgroundColor: clay.fondo[0] }}>
      <View
        pointerEvents="none"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <Svg width="100%" height="100%">
          <Defs>
            <LinearGradient id={`${id}fondo`} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={clay.fondo[0]} />
              <Stop offset="1" stopColor={clay.fondo[1]} />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill={`url(#${id}fondo)`} />
          <Circle cx="92%" cy="10%" r="26%" fill="#FFFFFF" fillOpacity={0.18} />
          <Circle cx="4%" cy="88%" r="30%" fill="#8C8C96" fillOpacity={0.08} />
        </Svg>
      </View>
      {children}
    </View>
  );
}
