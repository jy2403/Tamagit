import { Redirect } from 'expo-router';
import { View } from 'react-native';
import { useAuth } from '@/context/AuthContext';

export default function OAuthRedirectScreen() {
  const { token } = useAuth();

  if (!token) {
    return <View className="flex-1 bg-neutral-950" />;
  }

  return <Redirect href="/projects" />;
}