import { Pressable, Text, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

type ButtonProps = PressableProps & {
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  style?: StyleProp<ViewStyle>;
};

const variantStyles = {
  primary: 'bg-emerald-600 active:bg-emerald-700',
  secondary: 'bg-white/10 active:bg-white/20',
  ghost: 'bg-transparent',
} as const;

const textStyles = {
  primary: 'text-white',
  secondary: 'text-white',
  ghost: 'text-emerald-400',
} as const;

export function Button({ title, variant = 'primary', disabled, style, ...rest }: ButtonProps) {
  const base = 'items-center justify-center rounded-xl px-5 py-3';
  const stateStyle = disabled ? 'opacity-50' : '';

  return (
    <Pressable
      className={`${base} ${variantStyles[variant]} ${stateStyle}`}
      disabled={disabled}
      style={style}
      {...rest}>
      <Text className={`font-semibold ${textStyles[variant]}`}>{title}</Text>
    </Pressable>
  );
}
