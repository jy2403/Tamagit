import { useEffect, useRef } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { GLView } from 'expo-gl';
import { usePet3DScene } from '@/hooks/usePet3DScene';
import { usePetControls } from '@/hooks/usePetControls';

type Pet3DViewProps = {
  species?: string;
  style?: StyleProp<ViewStyle>;
  simple?: boolean;
  autoRotate?: boolean;
  idle?: boolean;
  backdrop?: 'none' | 'egg';
  bodyColor?: string | null;
  background?: string;
};

export function Pet3DView({
  style,
  simple = false,
  autoRotate,
  idle = false,
  backdrop = 'none',
  bodyColor,
  background,
}: Pet3DViewProps) {
  const yawRef = useRef(0);
  const distRef = useRef(backdrop === 'egg' ? 4.3 : 3.2);
  const backgroundColor = background ?? (simple ? '#EDEDF0' : '#F4F4F6');

  const { onContextCreate, cleanup } = usePet3DScene({
    simple,
    yawRef,
    distRef,
    autoRotate,
    idle,
    backdrop,
    bodyColor,
    background: backgroundColor,
  });
  const panResponder = usePetControls(yawRef, distRef, !simple);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return (
    <View
      style={[{ overflow: 'hidden', backgroundColor }, style]}
      {...(simple ? {} : panResponder.panHandlers)}>
      <GLView style={{ flex: 1 }} onContextCreate={onContextCreate} />
    </View>
  );
}
