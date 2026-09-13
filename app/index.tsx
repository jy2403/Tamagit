import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';

export default function LandingScreen() {
  const router = useRouter();
  const { token } = useAuth();

  const start = () => {
    router.replace(token ? '/projects' : '/login');
  };

  return (
    <View className="flex-1 items-center justify-center bg-neutral-950 px-8">
      <Text
        className="text-center text-3xl text-white"
        style={{ fontFamily: 'PressStart2P_400Regular' }}>
        TAMAGIT
      </Text>

      <View className="my-12 items-center">
        <Text className="text-7xl">🐙</Text>
      </View>

      <Pressable
        onPress={() => void start()}
        className="rounded-xl border border-neutral-700 bg-neutral-800 px-12 py-4 active:bg-neutral-700">
        <Text className="text-base text-white" style={{ fontFamily: 'PressStart2P_400Regular' }}>
          START
        </Text>
      </Pressable>
    </View>
  );
}