import { useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, ClipPath, Defs, G, Line, Rect, Text as SvgText } from 'react-native-svg';

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
  const margin = { top: 12, right: 12, bottom: 20, left: 24 };
  const plotW = Math.max(0, width - margin.left - margin.right);
  const plotH = Math.max(0, height - margin.top - margin.bottom);

  const x = (value: number) => margin.left + (Math.max(0, Math.min(100, value)) / 100) * plotW;
  const y = (value: number) =>
    margin.top + plotH - (Math.max(0, Math.min(100, value)) / 100) * plotH;

  const R = 6.5; // Tamaño constante para todos los puntos

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
          <Defs>
            {data.map((punto) => (
              <ClipPath key={`clip-${punto.id}`} id={`battery-clip-${punto.id}`}>
                <Circle cx={x(punto.hambre)} cy={y(punto.felicidad)} r={R} />
              </ClipPath>
            ))}
          </Defs>

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

          {/* Puntos tipo batería de celular: base blanca rellena de abajo a arriba con el color de la mascota */}
          {data.map((punto) => {
            const px = x(punto.hambre);
            const py = y(punto.felicidad);
            const vidaClamped = Math.max(0, Math.min(100, punto.vida)) / 100;
            const fillHeight = 2 * R * vidaClamped;
            const fillY = py + R - fillHeight;

            return (
              <G key={punto.id}>
                {/* Contenedor recortado en círculo */}
                <G clipPath={`url(#battery-clip-${punto.id})`}>
                  {/* Base blanca */}
                  <Rect
                    x={px - R}
                    y={py - R}
                    width={2 * R}
                    height={2 * R}
                    fill="#FFFFFF"
                  />
                  {/* Relleno desde abajo hacia arriba con el color de la mascota */}
                  <Rect
                    x={px - R}
                    y={fillY}
                    width={2 * R}
                    height={fillHeight}
                    fill={punto.color}
                  />
                </G>
                {/* Borde exterior sutil para definir el círculo */}
                <Circle
                  cx={px}
                  cy={py}
                  r={R}
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth={1.2}
                />
              </G>
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
