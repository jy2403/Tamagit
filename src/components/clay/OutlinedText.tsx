import { Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { fuentes } from '@/estilos';

type OutlinedTextProps = {
  children: string;
  size?: number;
  color?: string;
  outlineColor?: string;
  outlineWidth?: number;
  pixel?: boolean;
  style?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  numberOfLines?: number;
  align?: 'left' | 'center' | 'right';
};

const OFFSETS = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
  [-1, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
] as const;

export function OutlinedText({
  children,
  size = 16,
  color = '#FFFFFF',
  outlineColor = '#161616',
  outlineWidth = 2,
  pixel = false,
  style,
  containerStyle,
  numberOfLines,
  align,
}: OutlinedTextProps) {
  const base: TextStyle = {
    fontSize: size,
    lineHeight: Math.round(size * (pixel ? 1.6 : 1.35)),
    fontFamily: pixel ? fuentes.pixel : undefined,
    fontWeight: pixel ? '400' : '800',
    textAlign: align,
  };

  return (
    <View style={[{ alignSelf: 'flex-start' }, containerStyle]}>
      {OFFSETS.map(([dx, dy]) => (
        <Text
          key={`${dx}-${dy}`}
          numberOfLines={numberOfLines}
          style={[
            base,
            {
              position: 'absolute',
              left: outlineWidth + dx * outlineWidth,
              top: outlineWidth + dy * outlineWidth,
              color: outlineColor,
            },
            style,
          ]}>
          {children}
        </Text>
      ))}
      <Text numberOfLines={numberOfLines} style={[base, { color, margin: outlineWidth }, style]}>
        {children}
      </Text>
    </View>
  );
}
