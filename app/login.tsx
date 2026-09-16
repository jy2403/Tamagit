import { Redirect } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/layout/Button';

export default function LoginScreen() {
  const { token, isLoading, signIn, authError } = useAuth();

  if (token) {
    return <Redirect href="/projects" />;
  }

  return (
    <View className="flex-1 bg-neutral-950">
      <View className="flex-1 items-center justify-center rounded-b-[40px] bg-emerald-600 px-6">
        <View className="h-24 w-24 items-center justify-center rounded-full bg-white/20">
          <Text className="text-4xl font-bold text-white">🥚</Text>
        </View>
        <Text className="mt-4 text-3xl font-bold text-white">Tamagit</Text>
        <Text className="mt-2 text-center text-base text-emerald-300">
          Conecta tu GitHub y cría una mascota por cada proyecto.
        </Text>
      </View>

      <View className="-mt-8 flex-1 rounded-t-[32px] bg-neutral-950 px-6 pt-8">
        <View className="gap-4">
          {isLoading ? (
            <View className="items-center py-6">
              <ActivityIndicator size="large" color="#10b981" />
            </View>
          ) : (
            <Button title="Conectar con GitHub" onPress={() => void signIn()} />
          )}
          {authError ? (
            <Text className="rounded-xl bg-red-500/10 px-4 py-3 text-center text-sm text-red-400">
              {authError}
            </Text>
          ) : null}
          <Text className="text-center text-xs text-neutral-500">
            Se abre una ventana de GitHub para autorizar tu cuenta.
          </Text>
        </View>
      </View>
    </View>
  );
}
