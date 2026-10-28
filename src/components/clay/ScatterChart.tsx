import { useState } from 'react';
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

export function ScatterChart({ data, height = 132 }: ScatterChartProps) {
  const [width, setWidth] = useState(0);
  const margin = { top: 10, right: 10, bottom: 20, left: 22 };
  const plotW = Math.max(0, width - margin.left - margin.right);
  const plotH = Math.max(0, height - margin.top - margin.bottom);

  const x = (value: number) => margin.left + (Math.max(0, Math.min(100, value)) / 100) * plotW;
  const y = (value: number) =>
    margin.top + plotH - (Math.max(0, Math.min(100, value)) / 100) * plotH;

  return (
    <View
      style={{ height }}
      accessible
      accessibilityLabel={`Dispersión de ${data.length} mascotas. ${data
        .map((p) => `${p.nombre}: hambre ${p.hambre}, felicidad ${p.felicidad}, vida ${p.vida}`)
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

          {data.map((punto) => {
            const radius = 3.5 + (Math.max(0, Math.min(100, punto.vida)) / 100) * 4.5;
            return (
              <Circle
                key={punto.id}
                cx={x(punto.hambre)}
                cy={y(punto.felicidad)}
                r={radius}
                fill={punto.color}
                stroke="#FFFFFF"
                strokeOpacity={0.55}
                strokeWidth={1}
              />
            );
          })}

          <SvgText
            x={margin.left + plotW / 2}
            y={height - 4}
            fontSize={8}
            fill="#B9B9C2"
            textAnchor="middle">
            Hambre
          </SvgText>
          <SvgText
            x={margin.left - 4}
            y={margin.top + 2}
            fontSize={8}
            fill="#B9B9C2"
            textAnchor="start">
            Feliz
          </SvgText>
        </Svg>
      ) : null}
    </View>
  );
}
