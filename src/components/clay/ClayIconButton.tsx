import type { ReactNode } from 'react';
import { Pressable, Text, type StyleProp, type ViewStyle } from 'react-native';
import { clay, sombras, type Gradiente } from '@/estilos';
import { ClaySurface } from './ClaySurface';
import { IconoImagen, type NombreIcono } from './IconoImagen';

type ClayIconButtonProps = {
  icon: ReactNode | NombreIcono | string;
  accessibilityLabel: string;
  onPress?: () => void;
  colors?: Gradiente;
  iconColor?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
};

const ICON_NAMES: ReadonlySet<string> = new Set<NombreIcono>([
  'vida',
  'hambre',
  'felicidad',
  'editar',
  'huevo',
  'perchero',
  'volver',
  'salir',
  'home',
  'usuario',
  'engranaje',
  'corazon',
  'manzana',
  'feliz',
  'vestir',
  'atras',
  'perfil',
  'admin',
  'door',
]);

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
  const iconContent =
    typeof icon === 'string' ? (
      ICON_NAMES.has(icon) ? (
        <IconoImagen
          nombre={icon as NombreIcono}
          size={Math.round(size * 0.48)}
          tintColor={iconColor}
        />
      ) : icon === '←' ? (
        <IconoImagen nombre="volver" size={Math.round(size * 0.48)} tintColor={iconColor} />
      ) : icon === '✎' ? (
        <IconoImagen nombre="editar" size={Math.round(size * 0.48)} tintColor={iconColor} />
      ) : icon === '🚪' ? (
        <IconoImagen nombre="salir" size={Math.round(size * 0.48)} tintColor={iconColor} />
      ) : icon === '🏠' ? (
        <IconoImagen nombre="home" size={Math.round(size * 0.48)} tintColor={iconColor} />
      ) : icon === '👤' ? (
        <IconoImagen nombre="usuario" size={Math.round(size * 0.48)} tintColor={iconColor} />
      ) : icon === '🛠️' || icon === '⚙️' ? (
        <IconoImagen nombre="engranaje" size={Math.round(size * 0.48)} tintColor={iconColor} />
      ) : (
        <Text style={{ fontSize: size * 0.42, color: iconColor }}>{icon}</Text>
      )
    ) : (
      icon
    );

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
        pressed && !disabled
          ? [{ transform: [{ translateY: 2 }, { scale: 0.95 }] }, sombras.hundido]
          : null,
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
        {iconContent}
      </ClaySurface>
    </Pressable>
  );
}
