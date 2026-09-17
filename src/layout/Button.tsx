import { Pressable, Text, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { boton } from '@/estilos';

type ButtonProps = PressableProps & {
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  style?: StyleProp<ViewStyle>;
};

const variantStyles = {
  primary: boton.primario,
  secondary: boton.secundario,
  ghost: boton.fantasma,
  danger: boton.peligro,
} as const;

const textStyles = {
  primary: boton.textoPrimario,
  secondary: boton.textoSecundario,
  ghost: boton.textoFantasma,
  danger: boton.textoDanger,
} as const;

export function Button({ title, variant = 'primary', disabled, style, ...rest }: ButtonProps) {
  const stateStyle = disabled ? boton.deshabilitado : '';

  return (
    <Pressable
      className={`${boton.base} ${variantStyles[variant]} ${stateStyle}`}
      disabled={disabled}
      style={style}
      {...rest}>
      <Text className={`font-semibold ${textStyles[variant]}`}>{title}</Text>
    </Pressable>
  );
}