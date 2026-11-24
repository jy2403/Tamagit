import { type ReactNode } from 'react';
import { View } from 'react-native';
import { fondo3D } from '@/estilos';

type ClayBackgroundProps = {
  children?: ReactNode;
  color?: string;
};

export function ClayBackground({ children, color }: ClayBackgroundProps) {
  return <View style={{ flex: 1, backgroundColor: color ?? fondo3D }}>{children}</View>;
}
