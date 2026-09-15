import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { useFonts, PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';
import '../global.css';
import { AuthProvider } from '@/context/AuthContext';
import { IntroAnimation } from '@/components/IntroAnimation';

export default function RootLayout() {
  const [showIntro, setShowIntro] = useState(true);
  const [fontsLoaded] = useFonts({ PressStart2P_400Regular });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0f0f0f' },
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="projects" />
        <Stack.Screen name="project/[id]" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="admin" />
        <Stack.Screen name="admin/items" />
        <Stack.Screen name="admin/foods" />
        <Stack.Screen name="admin/users" />
        <Stack.Screen name="admin/users/[id]" />
        <Stack.Screen name="admin/pets/[petId]" />
      </Stack>
      {showIntro && <IntroAnimation onFinish={() => setShowIntro(false)} />}
    </AuthProvider>
  );
}
