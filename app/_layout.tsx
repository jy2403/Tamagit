import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';
import '../global.css';
import { AuthProvider } from '@/context/AuthContext';
import { clay } from '@/estilos';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ PressStart2P_400Regular });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: clay.fondo[0] },
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="(drawer)" />
        <Stack.Screen name="project/[id]" />
        <Stack.Screen name="nuevo" />
        <Stack.Screen name="editar/[id]" />
      </Stack>
    </AuthProvider>
  );
}
