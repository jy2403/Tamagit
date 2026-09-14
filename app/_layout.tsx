import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { useFonts, PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';
import '../global.css';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { IntroAnimation } from '@/components/IntroAnimation';
import { colors } from '@/theme/tokens';

export default function RootLayout() {
  const [showIntro, setShowIntro] = useState(true);
  const [fontsLoaded] = useFonts({
    PressStart2P_400Regular,
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_800ExtraBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <StatusBar style="light" />
      <RootNavigator />
      {showIntro && <IntroAnimation onFinish={() => setShowIntro(false)} />}
    </AuthProvider>
  );
}

function RootNavigator() {
  const { token } = useAuth();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bgDeep },
      }}>
      {/* Grupo 1 - Rutas publicas: accesibles con o sin sesion */}
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />

      {/* Grupo 2 - Callback de OAuth: siempre montada, redirige a /projects al recibir la sesion */}
      <Stack.Screen name="auth" />

      {/* Grupo 3 - Rutas protegidas: solo visibles con sesion iniciada */}
      <Stack.Protected guard={!!token}>
        <Stack.Screen name="projects" />
        <Stack.Screen name="project/[id]" />
      </Stack.Protected>
    </Stack>
  );
}
