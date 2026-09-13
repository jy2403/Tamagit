import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import '../global.css';
import { AuthProvider } from '@/context/AuthContext';
import { IntroAnimation } from '@/components/IntroAnimation';

export default function RootLayout() {
  const [showIntro, setShowIntro] = useState(true);
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0f0f0f' },
        }}
      />
      {showIntro && <IntroAnimation onFinish={() => setShowIntro(false)} />}
    </AuthProvider>
  );
}
