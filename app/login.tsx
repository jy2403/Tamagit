import { Redirect } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/layout/Button';

export default function LoginScreen() {
  const { token, isLoading, signIn } = useAuth();

  if (token) {
    return <Redirect href="/" />;
  }

  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="text-4xl font-bold text-gray-900">Tamagit</Text>
      <Text className="mb-10 mt-2 text-center text-gray-500">
        Conecta tu GitHub y cría una mascota por cada proyecto.
      </Text>
      {isLoading ? (
        <ActivityIndicator size="large" color="#4f46e5" />
      ) : (
        <Button title="Conectar con GitHub" onPress={() => void signIn()} />
      )}
    </View>
  );
}
