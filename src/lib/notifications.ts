import { Alert } from 'react-native';
import { apiFetch } from '@/lib/api';
import type { Notification } from '@/lib/types';

let shown = false;

export async function showNotificationsOnce(token: string | null) {
  if (shown || !token) return;

  try {
    const notifications = await apiFetch<Notification[]>('/notifications', { token });
    if (!notifications.length) return;

    shown = true;
    const first = notifications[0];
    const more = notifications.length - 1;
    Alert.alert(
      'Aviso del administrador',
      `${first.message}${more > 0 ? `\n\nY ${more} aviso(s) más.` : ''}`,
      [
        {
          text: 'Entendido',
          onPress: () => {
            void notifications.map((n) =>
              apiFetch(`/notifications/${n.id}/read`, { token, method: 'PATCH', body: {} }).catch(() => {})
            );
          },
        },
      ]
    );
  } catch {
    // No notifications or offline – ignore silently
  }
}