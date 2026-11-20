import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { getPushToken, savePushToken } from '@/lib/push';

export function usePushNotifications() {
  const { token, isLoading } = useAuth();
  const lastResponse = Notifications.useLastNotificationResponse();

  // Registers the device on login and also when the app starts with a persisted session.
  useEffect(() => {
    if (isLoading || !token || Platform.OS === 'web') return;

    let cancelled = false;
    (async () => {
      try {
        const pushToken = await getPushToken();
        if (!pushToken || cancelled) return;
        await savePushToken(token, pushToken);
      } catch (e) {
        console.warn(
          'No se pudo registrar el dispositivo para push:',
          e instanceof Error ? e.message : e
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, isLoading]);

  // Opens the related project when the user taps a push notification.
  useEffect(() => {
    if (!lastResponse || isLoading || !token) return;

    const projectId = lastResponse.notification.request.content.data?.projectId;
    if (typeof projectId !== 'string') return;

    Notifications.clearLastNotificationResponse();
    router.push({ pathname: '/project/[id]', params: { id: projectId } });
  }, [lastResponse, isLoading, token]);
}
