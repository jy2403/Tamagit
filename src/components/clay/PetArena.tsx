import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AppState,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { GLView } from 'expo-gl';
import { usePetArenaScene, type ArenaPet } from '@/hooks/usePetArenaScene';

type PetArenaProps = {
  pets: ArenaPet[];
  paused?: boolean;
  onSelect: (pet: ArenaPet) => void;
  style?: StyleProp<ViewStyle>;
};

export function PetArena({ pets, paused = false, onSelect, style }: PetArenaProps) {
  const [appActive, setAppActive] = useState(AppState.currentState === 'active');
  const [size, setSize] = useState({ width: 1, height: 1 });
  const selectRef = useRef(onSelect);

  useEffect(() => {
    selectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      setAppActive(state === 'active');
    });
    return () => sub.remove();
  }, []);

  const visibles = useMemo(() => pets.slice(0, 10), [pets]);
  const petsKey = useMemo(
    () => visibles.map((pet) => `${pet.id}:${pet.bodyColor ?? ''}`).join('|') || 'empty',
    [visibles]
  );

  const { onContextCreate, cleanup, onTap } = usePetArenaScene({
    pets: visibles,
    paused: paused || !appActive,
    onSelect: (pet) => selectRef.current(pet),
  });

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  return (
    <View
      style={[{ flex: 1, overflow: 'hidden', backgroundColor: '#E7E7EC' }, style]}
      onLayout={(event) =>
        setSize({
          width: event.nativeEvent.layout.width,
          height: event.nativeEvent.layout.height,
        })
      }>
      <GLView key={petsKey} style={StyleSheet.absoluteFill} onContextCreate={onContextCreate} />
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={(event) => {
          const { locationX, locationY } = event.nativeEvent;
          onTap(locationX / Math.max(1, size.width), locationY / Math.max(1, size.height));
        }}
        accessibilityRole="image"
        accessibilityLabel="Escenario 3D de mascotas. Toca una mascota para abrir su detalle."
      />
    </View>
  );
}
