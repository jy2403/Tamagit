import { useId, type ReactNode } from 'react';
import { BlurView } from 'expo-blur';
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
  glass?: boolean;
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
  glass = false,
  children,
}: ClaySurfaceProps) {
  const rawId = useId();
  const id = `clay${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const [top, bottom] = colors;
  const opacidad = glass ? 0.58 : 1;

  return (
    <View
      style={[
        shadow ? sombras[shadow] : null,
        {
          borderRadius: radius,
          backgroundColor: glass ? 'rgba(255,255,255,0.32)' : bottom,
        },
        style,
      ]}>
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { borderRadius: radius, overflow: 'hidden' }]}>
        {glass ? (
          <BlurView
            pointerEvents="none"
            intensity={36}
            tint="light"
            blurMethod="dimezisBlurViewSdk31Plus"
            style={StyleSheet.absoluteFill}
          />
        ) : null}
        <Svg width="100%" height="100%">
          <Defs>
            <LinearGradient id={`${id}bg`} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={top} stopOpacity={opacidad} />
              <Stop offset="1" stopColor={bottom} stopOpacity={opacidad} />
            </LinearGradient>
            <LinearGradient id={`${id}depth`} x1="0" y1="0" x2="0" y2="1">
              {glass
                ? [
                    <Stop key="g0" offset="0" stopColor="#FFFFFF" stopOpacity="0.5" />,
                    <Stop key="g1" offset="0.38" stopColor="#FFFFFF" stopOpacity="0.12" />,
                    <Stop key="g2" offset="1" stopColor="#FFFFFF" stopOpacity="0" />,
                  ]
                : [
                    <Stop key="c0" offset="0" stopColor="#FFFFFF" stopOpacity="0.65" />,
                    <Stop key="c1" offset="0.18" stopColor="#FFFFFF" stopOpacity="0.15" />,
                    <Stop key="c2" offset="0.55" stopColor="#FFFFFF" stopOpacity="0" />,
                    <Stop key="c3" offset="0.82" stopColor={paleta.vino.base} stopOpacity="0.08" />,
                    <Stop key="c4" offset="1" stopColor={paleta.vino.base} stopOpacity="0.24" />,
                  ]}
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill={`url(#${id}bg)`} />
          {shine ? <Rect width="100%" height="100%" fill={`url(#${id}depth)`} /> : null}
        </Svg>
      </View>
      {border || glass ? (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: radius,
              borderWidth: 1,
              borderColor: glass ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.45)',
            },
          ]}
        />
      ) : null}
      <View style={contentStyle}>{children}</View>
    </View>
  );
}
