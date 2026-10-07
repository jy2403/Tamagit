import { Redirect } from 'expo-router';
import { View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { pantalla } from '@/estilos';

export default function OAuthRedirectScreen() {
  const { token, authError } = useAuth();

  if (authError) {
    return <Redirect href="/login" />;
  }

  if (!token) {
    return <View className={pantalla.root} />;
  }

  return <Redirect href="/projects" />;
}
