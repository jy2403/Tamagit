import { useMemo, useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';

export type PuntoMascota = {
  id: number;
  nombre: string;
  hambre: number;
  felicidad: number;
  vida: number;
  color: string;
};

type ScatterChartProps = {
  data: readonly PuntoMascota[];
  height?: number;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function ScatterChart({ data, height = 132 }: ScatterChartProps) {
  const [width, setWidth] = useState(0);
  const margin = { top: 12, right: 12, bottom: 20, left: 24 };
  const plotW = Math.max(0, width - margin.left - margin.right);
  const plotH = Math.max(0, height - margin.top - margin.bottom);
  const R = 7;

  const points = useMemo(() => {
    if (width <= 0 || plotW <= 0 || plotH <= 0) return [];

    const x = (value: number) => margin.left + (clamp(value, 0, 100) / 100) * plotW;
    const y = (value: number) => margin.top + plotH - (clamp(value, 0, 100) / 100) * plotH;

    const seen = new Map<string, number>();

    return data.map((punto) => {
      const baseX = x(punto.hambre);
      const baseY = y(punto.felicidad);
      const key = `${Math.round(baseX)}:${Math.round(baseY)}`;
      const duplicate = seen.get(key) ?? 0;
      seen.set(key, duplicate + 1);

      const distance = duplicate === 0 ? 0 : 9 + Math.floor(duplicate / 4) * 4;
      const angle = duplicate * 2.25;

      return {
        ...punto,
        px: clamp(baseX + Math.cos(angle) * distance, margin.left + R, width - margin.right - R),
        py: clamp(baseY + Math.sin(angle) * distance, margin.top + R, margin.top + plotH - R),
      };
    });
  }, [data, margin.left, margin.right, margin.top, plotH, plotW, width]);

  return (
    <View
      style={{ height }}
      accessible
      accessibilityLabel={`Dispersión de ${data.length} mascotas. ${data
        .map((p) => `${p.nombre}: hambre ${p.hambre}, felicidad ${p.felicidad}`)
        .join('. ')}`}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
      {width > 0 ? (
        <Svg width={width} height={height}>
          {[0, 0.5, 1].map((tick) => (
            <Line
              key={`h-${tick}`}
              x1={margin.left}
              y1={margin.top + plotH * tick}
              x2={width - margin.right}
              y2={margin.top + plotH * tick}
              stroke="#34343B"
              strokeWidth={1}
            />
          ))}
          {[0, 0.5, 1].map((tick) => (
            <Line
              key={`v-${tick}`}
              x1={margin.left + plotW * tick}
              y1={margin.top}
              x2={margin.left + plotW * tick}
              y2={margin.top + plotH}
              stroke="#34343B"
              strokeWidth={1}
            />
          ))}

          {points.map((punto) => (
            <Circle
              key={punto.id}
              cx={punto.px}
              cy={punto.py}
              r={R}
              fill={punto.color}
              stroke="#FFFFFF"
              strokeWidth={2}
            />
          ))}

          <SvgText
            x={margin.left + plotW / 2}
            y={height - 4}
            fontSize={8}
            fill="#B9B9C2"
            textAnchor="middle">
            Hambre
          </SvgText>
          <SvgText x={0} y={8} fontSize={7} fill="#B9B9C2" textAnchor="start">
            Felicidad
          </SvgText>
        </Svg>
      ) : null}
    </View>
  );
}
