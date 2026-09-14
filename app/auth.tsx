import { Redirect } from 'expo-router';
import { PixelBackground } from '@/components/PixelBackground';
import { useAuth } from '@/context/AuthContext';
import React from 'react';

export default function OAuthRedirectScreen() {
  const { token } = useAuth();

  if (!token) {
    return <PixelBackground />;
  }

  return <Redirect href="/projects" />;
}
