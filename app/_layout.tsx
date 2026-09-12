import { Stack } from 'expo-router';
import '../global.css';
import { SessionProvider, useSession } from '../src/session/context';
import { IntroAnimation } from '@/components/IntroAnimation';
import { useState } from 'react';

export default function RootLayout() {
  const [showIntro, setShowIntro] = useState(true);
  return (
    <SessionProvider>
      <Navigator />
      {showIntro && <IntroAnimation onFinish={() => setShowIntro(false)} />}
    </SessionProvider>
  );
}

function Navigator() {
  const { user } = useSession();

  return (
    <Stack screenOptions={{ headerTitleStyle: { fontWeight: '600' },headerStyle: { backgroundColor: '#0f0f0f' }, headerTintColor: '#fff' , headerShadowVisible: false, headerTitleAlign: 'center' }}>
      {/* Con sesión iniciada */}
      <Stack.Protected guard={!!user}>
        <Stack.Screen name="tickets/new" options={{ title: 'Nueva solicitud' }} />
      </Stack.Protected>

      {/* Sin sesión */}
      <Stack.Protected guard={!user}>
        <Stack.Screen name="index" options={{ title: 'Tamagit' }} />
        <Stack.Screen name="store" options={{ title: 'Tienda' }} />
        <Stack.Screen name="login" options={{ title: 'Iniciar sesión' }}/>
        <Stack.Screen name="register" options={{ title: 'Crear cuenta' }} />
      </Stack.Protected>
    </Stack>
  );
}