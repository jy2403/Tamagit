import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { clay, radios, type Gradiente } from '@/estilos';
import { ClaySurface } from './ClaySurface';

type ClayCardProps = {
  children?: ReactNode;
  colors?: Gradiente;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  padding?: number;
  shadow?: 'tarjeta' | 'boton' | 'suave' | 'hundido' | false;
};

export function ClayCard({
  children,
  colors = clay.blanco,
  radius = radios.tarjeta,
  style,
  contentStyle,
  padding = 18,
  shadow = 'tarjeta',
}: ClayCardProps) {
  return (
    <ClaySurface
      colors={colors}
      radius={radius}
      shadow={shadow}
      style={style}
      contentStyle={[{ padding }, contentStyle]}>
      {children}
    </ClaySurface>
  );
}
