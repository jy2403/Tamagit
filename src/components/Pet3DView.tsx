import { useEffect, useRef } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { GLView } from 'expo-gl';
import { usePet3DScene } from '@/hooks/usePet3DScene';
import { usePetControls } from '@/hooks/usePetControls';

type Pet3DViewProps = {
  color?: number | string;
  species?: string;
  style?: StyleProp<ViewStyle>;
  simple?: boolean;
};

const BODY = 0x10b981;

export function Pet3DView({ color = BODY, style, simple = false }: Pet3DViewProps) {
  const yawRef = useRef(0);
  const distRef = useRef(simple ? 1.35 : 4.2);

  const { onContextCreate, cleanup } = usePet3DScene({ simple, color, yawRef, distRef });
  const panResponder = usePetControls(yawRef, distRef, !simple);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return (
    <View
      style={[{ overflow: 'hidden', backgroundColor: '#171717' }, style]}
      {...(simple ? {} : panResponder.panHandlers)}>
      <GLView style={{ flex: 1 }} onContextCreate={onContextCreate} />
    </View>
  );
}
