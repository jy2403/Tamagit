import type { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type AccessibilityRole,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { clay, fuentes, radios, sombras, type Gradiente } from '@/estilos';
import { ClaySurface } from './ClaySurface';
import { OutlinedText } from './OutlinedText';

type ClayButtonProps = {
  title: string;
  onPress?: () => void;
  colors?: Gradiente;
  textColor?: string;
  icon?: ReactNode;
  iconRight?: ReactNode;
  pixel?: boolean;
  outline?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
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
  iconRight,
  pixel = true,
  outline = true,
  disabled = false,
  style,
  contentStyle,
  accessibilityLabel,
  accessibilityRole = 'button',
  testID,
  size = 'lg',
}: ClayButtonProps) {
  const buttonHeight = size === 'lg' ? 52 : 46;
  const paddingVertical = size === 'lg' ? 14 : 10;
  const titleSize = pixel ? (size === 'lg' ? 16 : 12) : size === 'lg' ? 17 : 14;

  const flattenedStyle = StyleSheet.flatten(style);
  const defaultAlignSelf =
    flattenedStyle && (flattenedStyle.width !== undefined || flattenedStyle.alignSelf !== undefined)
      ? undefined
      : 'stretch';

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        { minHeight: buttonHeight },
        defaultAlignSelf ? { alignSelf: defaultAlignSelf } : null,
        sombras.boton,
        pressed && !disabled
          ? [{ transform: [{ translateY: 2 }, { scale: 0.97 }] }, sombras.hundido]
          : null,
        disabled ? { opacity: 0.45 } : null,
        style,
      ]}>
      <ClaySurface
        colors={colors}
        radius={radios.boton}
        style={{ width: '100%' }}
        contentStyle={[
          {
            minHeight: buttonHeight,
            paddingHorizontal: 20,
            paddingVertical,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
          },
          contentStyle,
        ]}>
        {icon ? (
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>{icon}</View>
        ) : null}
        {pixel ? (
          outline ? (
            <OutlinedText size={titleSize} color={textColor} outlineWidth={2}>
              {title}
            </OutlinedText>
          ) : (
            <Text
              style={{
                fontFamily: fuentes.pixel,
                fontSize: titleSize,
                color: textColor,
                textAlign: 'center',
                includeFontPadding: false,
              }}>
              {title}
            </Text>
          )
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
        {iconRight ? (
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>{iconRight}</View>
        ) : null}
      </ClaySurface>
    </Pressable>
  );
}
