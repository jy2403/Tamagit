import type { ReactNode } from 'react';
import {
  Pressable,
  Text,
  View,
  type AccessibilityRole,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { clay, radios, sombras, type Gradiente } from '@/estilos';
import { ClaySurface } from './ClaySurface';
import { OutlinedText } from './OutlinedText';

type ClayButtonProps = {
  title: string;
  onPress?: () => void;
  colors?: Gradiente;
  textColor?: string;
  icon?: ReactNode;
  pixel?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityRole?: AccessibilityRole;
  testID?: string;
  size?: 'lg' | 'md';
};

export function ClayButton({
  title,
  onPress,
  colors = clay.violeta,
  textColor = '#FFFFFF',
  icon,
  pixel = true,
  disabled = false,
  style,
  accessibilityLabel,
  accessibilityRole = 'button',
  testID,
  size = 'lg',
}: ClayButtonProps) {
  const paddingVertical = size === 'lg' ? 16 : 11;
  const titleSize = pixel ? (size === 'lg' ? 13 : 10) : size === 'lg' ? 16 : 14;

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        { alignSelf: 'stretch' },
        sombras.boton,
        pressed && !disabled ? [{ transform: [{ scale: 0.96 }] }, sombras.hundido] : null,
        disabled ? { opacity: 0.45 } : null,
        style,
      ]}>
      <ClaySurface
        colors={colors}
        radius={radios.boton}
        style={{ flexGrow: 1 }}
        contentStyle={{
          minHeight: size === 'lg' ? 56 : 46,
          paddingHorizontal: 20,
          paddingVertical,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
        }}>
        {icon ? (
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>{icon}</View>
        ) : null}
        {pixel ? (
          <OutlinedText size={titleSize} color={textColor} outlineWidth={2}>
            {title}
          </OutlinedText>
        ) : (
          <Text
            style={{
              color: textColor,
              fontSize: titleSize,
              fontWeight: '800',
              textAlign: 'center',
            }}>
            {title}
          </Text>
        )}
      </ClaySurface>
    </Pressable>
  );
}
