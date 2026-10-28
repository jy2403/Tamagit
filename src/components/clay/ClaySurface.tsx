import { useId, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { clay, paleta, sombras, type Gradiente } from '@/estilos';

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
            {/* Degradado base vertical estricto (arriba a abajo) */}
            <LinearGradient id={`${id}bg`} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={top} />
              <Stop offset="1" stopColor={bottom} />
            </LinearGradient>

            {/* Claymorfismo: brillo interior superior blanco y sombra inferior teñida con vino */}
            <LinearGradient id={`${id}depth`} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.65" />
              <Stop offset="0.18" stopColor="#FFFFFF" stopOpacity="0.15" />
              <Stop offset="0.55" stopColor="#FFFFFF" stopOpacity="0" />
              <Stop offset="0.82" stopColor={paleta.vino.base} stopOpacity="0.08" />
              <Stop offset="1" stopColor={paleta.vino.base} stopOpacity="0.24" />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill={`url(#${id}bg)`} />
          {shine ? <Rect width="100%" height="100%" fill={`url(#${id}depth)`} /> : null}
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
              borderColor: 'rgba(255,255,255,0.45)',
            },
          ]}
        />
      ) : null}
      <View style={contentStyle}>{children}</View>
    </View>
  );
}
