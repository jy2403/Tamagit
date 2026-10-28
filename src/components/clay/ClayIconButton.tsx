import type { ReactNode } from 'react';
import { Pressable, Text, type StyleProp, type ViewStyle } from 'react-native';
import { clay, sombras, type Gradiente } from '@/estilos';
import { ClaySurface } from './ClaySurface';

type ClayIconButtonProps = {
  icon: ReactNode | string;
  accessibilityLabel: string;
  onPress?: () => void;
  colors?: Gradiente;
  iconColor?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
};

export function ClayIconButton({
  icon,
  accessibilityLabel,
  onPress,
  colors = clay.blanco,
  iconColor = clay.texto,
  size = 50,
  style,
  disabled = false,
}: ClayIconButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      hitSlop={4}
      style={({ pressed }) => [
        sombras.boton,
        { borderRadius: size },
        pressed && !disabled ? [{ transform: [{ scale: 0.94 }] }, sombras.hundido] : null,
        disabled ? { opacity: 0.45 } : null,
        style,
      ]}>
      <ClaySurface
        colors={colors}
        radius={size}
        style={{ width: size, height: size }}
        contentStyle={{
          width: size,
          height: size,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {typeof icon === 'string' ? (
          <Text style={{ fontSize: size * 0.42, color: iconColor }}>{icon}</Text>
        ) : (
          icon
        )}
      </ClaySurface>
    </Pressable>
  );
}
