import { useMemo } from 'react';
import { PanResponder, View } from 'react-native';
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from 'react-native-svg';
import { hexToHsl, hslToHex } from '@/lib/color';

type ColorWheelProps = {
  value: string;
  size?: number;
  onChange: (hex: string) => void;
};

const WEDGES = 72;

function polar(cx: number, cy: number, radius: number, angle: number) {
  return {
    x: cx + Math.cos(angle) * radius,
    y: cy + Math.sin(angle) * radius,
  };
}

export function ColorWheel({ value, size = 190, onChange }: ColorWheelProps) {
  const radius = size / 2;
  const center = radius;

  const wedges = useMemo(() => {
    return Array.from({ length: WEDGES }, (_, index) => {
      const start = (index / WEDGES) * Math.PI * 2 - Math.PI / 2;
      const end = ((index + 1) / WEDGES) * Math.PI * 2 - Math.PI / 2;
      const from = polar(center, center, radius - 2, start);
      const to = polar(center, center, radius - 2, end);
      const hue = (index / WEDGES) * 360;
      return {
        d: `M ${center} ${center} L ${from.x} ${from.y} A ${radius - 2} ${radius - 2} 0 0 1 ${to.x} ${to.y} Z`,
        fill: hslToHex(hue, 92, 55),
      };
    });
  }, [center, radius]);

  const panResponder = useMemo(() => {
    const pick = (x: number, y: number) => {
      const dx = x - center;
      const dy = y - center;
      const distance = Math.min(Math.hypot(dx, dy), radius);
      const saturation = Math.max(0, Math.min(100, (distance / radius) * 100));
      const hue = ((Math.atan2(dy, dx) * 180) / Math.PI + 90 + 360) % 360;
      onChange(hslToHex(hue, saturation, 100 - saturation * 0.46));
    };

    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (event) => {
        pick(event.nativeEvent.locationX, event.nativeEvent.locationY);
      },
      onPanResponderMove: (event) => {
        pick(event.nativeEvent.locationX, event.nativeEvent.locationY);
      },
    });
  }, [center, onChange, radius]);

  const hsl = hexToHsl(value);
  const angle = (hsl.h * Math.PI) / 180 - Math.PI / 2;
  const markerDistance = (hsl.s / 100) * (radius - 10);
  const marker = polar(center, center, markerDistance, angle);

  return (
    <View
      style={{ width: size, height: size, alignSelf: 'center' }}
      accessible
      accessibilityLabel={`Rueda de color. Color actual ${value}`}
      {...panResponder.panHandlers}>
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id="colorWheelWhite" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity="1" />
            <Stop offset="0.58" stopColor="#FFFFFF" stopOpacity="0.35" />
            <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        {wedges.map((wedge, index) => (
          <Path key={index} d={wedge.d} fill={wedge.fill} />
        ))}
        <Circle cx={center} cy={center} r={radius - 2} fill="url(#colorWheelWhite)" />
        <Circle cx={marker.x} cy={marker.y} r={7} fill={value} stroke="#FFFFFF" strokeWidth={2.5} />
      </Svg>
    </View>
  );
}
