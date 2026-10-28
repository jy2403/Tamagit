import { useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';
import { clay } from '@/estilos';

export type DiaGrafica = {
  inicial: string;
  commits: number;
  score: number;
  esHoy: boolean;
  tieneActividad: boolean;
};

type LineChartProps = {
  data: readonly DiaGrafica[];
  height?: number;
  colorCommits?: string;
  colorScore?: string;
};

export function LineChart({
  data,
  height = 132,
  colorCommits = clay.naranja[0],
  colorScore = clay.violeta[0],
}: LineChartProps) {
  const [width, setWidth] = useState(0);
  const margin = { top: 10, right: 8, bottom: 20, left: 8 };
  const plotW = Math.max(0, width - margin.left - margin.right);
  const plotH = Math.max(0, height - margin.top - margin.bottom);
  const maxCommits = Math.max(1, ...data.map((d) => d.commits));
  const stepX = data.length > 1 ? plotW / (data.length - 1) : plotW;

  const x = (index: number) => margin.left + index * stepX;
  const yCommits = (value: number) => margin.top + plotH - (value / maxCommits) * plotH;
  const yScore = (value: number) => margin.top + plotH - (Math.min(100, value) / 100) * plotH;

  const path = (getY: (index: number) => number) =>
    data.map((_, index) => `${index === 0 ? 'M' : 'L'} ${x(index)} ${getY(index)}`).join(' ');

  return (
    <View
      style={{ height }}
      accessible
      accessibilityLabel={`Gráfica semanal. Commits: ${data
        .map((d) => `${d.inicial} ${d.commits}`)
        .join(', ')}. Buenas prácticas: ${data
        .map((d) => `${d.inicial} ${Math.round(d.score)}`)
        .join(', ')}.`}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
      {width > 0 ? (
        <Svg width={width} height={height}>
          {[0, 0.5, 1].map((tick) => {
            const y = margin.top + plotH * tick;
            return (
              <Line
                key={tick}
                x1={margin.left}
                y1={y}
                x2={width - margin.right}
                y2={y}
                stroke="#E6E6EB"
                strokeWidth={1}
              />
            );
          })}

          <Path
            d={path((index) => yScore(data[index].score))}
            stroke={colorScore}
            strokeWidth={2.5}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d={path((index) => yCommits(data[index].commits))}
            stroke={colorCommits}
            strokeWidth={2.5}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {data.map((dia, index) => (
            <Circle
              key={`s-${dia.inicial}`}
              cx={x(index)}
              cy={yScore(dia.score)}
              r={dia.esHoy ? 3.5 : 2.5}
              fill={dia.esHoy ? '#FFFFFF' : colorScore}
              stroke={colorScore}
              strokeWidth={1.5}
            />
          ))}
          {data.map((dia, index) => (
            <Circle
              key={`c-${dia.inicial}`}
              cx={x(index)}
              cy={yCommits(dia.commits)}
              r={dia.esHoy ? 3.5 : 2.5}
              fill={dia.esHoy ? '#FFFFFF' : colorCommits}
              stroke={colorCommits}
              strokeWidth={1.5}
            />
          ))}

          {data.map((dia, index) => (
            <SvgText
              key={`l-${dia.inicial}`}
              x={x(index)}
              y={height - 5}
              fontSize={8}
              fontWeight={dia.esHoy ? 'bold' : 'normal'}
              fill={dia.esHoy ? clay.texto : clay.textoTenue}
              textAnchor="middle">
              {dia.inicial}
            </SvgText>
          ))}
        </Svg>
      ) : null}
    </View>
  );
}
