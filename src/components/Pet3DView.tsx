import { useEffect, useRef } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { GLView } from 'expo-gl';
import { usePet3DScene } from '@/hooks/usePet3DScene';
import { usePetControls } from '@/hooks/usePetControls';

type Pet3DViewProps = {
  species?: string;
  style?: StyleProp<ViewStyle>;
  simple?: boolean;
};

export function Pet3DView({ style, simple = false }: Pet3DViewProps) {
  const yawRef = useRef(0);
  const distRef = useRef(3.2);

  const { onContextCreate, cleanup } = usePet3DScene({ simple, yawRef, distRef });
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
