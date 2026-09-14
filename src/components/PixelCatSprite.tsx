import { StyleSheet, View } from 'react-native';
import React from 'react';

const CAT_PATTERN = [
  '..##...........##.',
  '.####.........####',
  '########..########',
  '##################',
  '####.##..##.####..',
  '####.##..##.####..',
  '..##############..',
  '.################.',
  '.###############..',
  '###############...',
  '###############...',
  '.##############...',
  '..###########.....',
  '...########.......',
  '.....######.......',
  '.......###........',
  '........#.........',
];

type Props = {
  color?: string;
  cell?: number;
};

/**
 * Silueta pixel-art de un gato (estilo Octocat de GitHub).
 * Se dibuja a partir de un bitmap de filas sin dependencias externas.
 */
export function PixelCatSprite({ color = '#FFFFFF', cell = 7 }: Props) {
  const rows = CAT_PATTERN.map((row) =>
    row
      .split('')
      .filter((c) => c === '#' || c === '.')
      .map((c) => c === '#')
  );

  return (
    <View style={[styles.sprite, { width: rows[0].length * cell, height: rows.length * cell }]}>
      {rows.map((cells, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {cells.map((filled, colIndex) =>
            filled ? (
              <View
                key={colIndex}
                style={{
                  width: cell,
                  height: cell,
                  backgroundColor: color,
                }}
              />
            ) : (
              <View
                key={colIndex}
                style={{
                  width: cell,
                  height: cell,
                }}
              />
            )
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  sprite: {
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
  },
});
