import { Animated, Image, Text } from 'react-native';
import { useIntroAnimation } from '@/hooks/useIntroAnimation';

export function IntroAnimation({ onFinish }: { onFinish: () => void }) {
  const { opacity, scale } = useIntroAnimation(onFinish);

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#0f0f0f',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 999,
        },
        { opacity },
      ]}
      pointerEvents="none">
      <Animated.View
        style={{
          alignItems: 'center',
          gap: 18,
          transform: [{ scale }],
        }}>
        <Image
          source={require('../../assets/github-icon.webp')}
          style={{ width: 96, height: 96, resizeMode: 'contain' }}
        />
        <Text
          style={{
            color: '#fff',
            fontSize: 28,
            fontFamily: 'PressStart2P_400Regular',
          }}>
          Tamagit
        </Text>
      </Animated.View>
    </Animated.View>
  );
}
