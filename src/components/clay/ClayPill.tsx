import type { ReactNode } from 'react';
import { Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { clay, fuentes, radios, type Gradiente } from '@/estilos';
import { ClaySurface } from './ClaySurface';

type ClayPillProps = {
  label: string;
  colors?: Gradiente;
  textColor?: string;
  icon?: ReactNode;
  pixel?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
};

export function ClayPill({
  label,
  colors = clay.negro,
  textColor = '#FFFFFF',
  icon,
  pixel = false,
  style,
  textStyle,
  accessibilityLabel,
}: ClayPillProps) {
  return (
    <View
      accessible={Boolean(accessibilityLabel)}
      accessibilityLabel={accessibilityLabel}
      style={style}>
      <ClaySurface
        colors={colors}
        radius={radios.pastilla}
        shadow="suave"
        contentStyle={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          paddingHorizontal: 12,
          paddingVertical: 6,
        }}>
        {icon}
        <Text
          numberOfLines={1}
          style={[
            {
              color: textColor,
              fontSize: pixel ? 8 : 11,
              lineHeight: pixel ? 14 : 15,
              fontFamily: pixel ? fuentes.pixel : undefined,
              fontWeight: pixel ? '400' : '800',
            },
            textStyle,
          ]}>
          {label}
        </Text>
      </ClaySurface>
    </View>
  );
}
