import { Pressable, Text, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

type ButtonProps = PressableProps & {
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  style?: StyleProp<ViewStyle>;
};

const variantStyles = {
  primary: 'bg-indigo-600 active:bg-indigo-700',
  secondary: 'bg-gray-100 active:bg-gray-200',
  ghost: 'bg-transparent',
} as const;

const textStyles = {
  primary: 'text-white',
  secondary: 'text-gray-800',
  ghost: 'text-indigo-600',
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
