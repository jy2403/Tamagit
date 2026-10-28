import { useId, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { clay, sombras, type Gradiente } from '@/estilos';

type ClaySurfaceProps = {
  colors?: Gradiente;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  shadow?: keyof typeof sombras | false;
  shine?: boolean;
  border?: boolean;
  children?: ReactNode;
};

export function ClaySurface({
  colors = clay.blanco,
  radius = 24,
  style,
  contentStyle,
  shadow = false,
  shine = true,
  border = false,
  children,
}: ClaySurfaceProps) {
  const rawId = useId();
  const id = `clay${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const [top, bottom] = colors;

  return (
    <View
      style={[
        shadow ? sombras[shadow] : null,
        { borderRadius: radius, backgroundColor: bottom },
        style,
      ]}>
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { borderRadius: radius, overflow: 'hidden' }]}>
        <Svg width="100%" height="100%">
          <Defs>
            <LinearGradient id={`${id}bg`} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={top} />
              <Stop offset="1" stopColor={bottom} />
            </LinearGradient>
            <LinearGradient id={`${id}shine`} x1="0" y1="0" x2="0.85" y2="1">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.55" />
              <Stop offset="0.42" stopColor="#FFFFFF" stopOpacity="0.06" />
              <Stop offset="0.72" stopColor="#000000" stopOpacity="0.02" />
              <Stop offset="1" stopColor="#000000" stopOpacity="0.16" />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill={`url(#${id}bg)`} />
          {shine ? <Rect width="100%" height="100%" fill={`url(#${id}shine)`} /> : null}
        </Svg>
      </View>
      {border ? (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: radius,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.35)',
            },
          ]}
        />
      ) : null}
      <View style={contentStyle}>{children}</View>
    </View>
  );
}
