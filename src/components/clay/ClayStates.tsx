import type { ReactNode } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { clay, paleta, radios } from '@/estilos';
import { ClayBackground } from './ClayBackground';
import { ClayButton } from './ClayButton';
import { ClayHeader } from './ClayHeader';

export function ClayLoadingScreen() {
  return (
    <ClayBackground>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={paleta.fucsia.base} />
      </View>
    </ClayBackground>
  );
}

export function ClayForbiddenScreen({ title = 'Admin' }: { title?: string }) {
  return (
    <ClayBackground>
      <ClayHeader title={title} />
      <View
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 10 }}>
        <Text style={{ textAlign: 'center', fontSize: 16, fontWeight: '800', color: clay.texto }}>
          No tienes permisos de administrador.
        </Text>
        <Text style={{ textAlign: 'center', fontSize: 12, color: clay.textoSuave }}>
          Contacta al administrador para obtener acceso.
        </Text>
      </View>
    </ClayBackground>
  );
}

type ClayEmptyStateProps = {
  title: string;
  message?: string;
  emoji?: string;
  action?: ReactNode;
};

export function ClayEmptyState({ title, message, emoji = '🥚', action }: ClayEmptyStateProps) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 40, gap: 6 }}>
      <Text style={{ fontSize: 34 }}>{emoji}</Text>
      <Text style={{ fontSize: 14, fontWeight: '900', color: clay.texto, textAlign: 'center' }}>
        {title}
      </Text>
      {message ? (
        <Text style={{ fontSize: 11, color: clay.textoSuave, textAlign: 'center' }}>{message}</Text>
      ) : null}
      {action}
    </View>
  );
}

type ClayErrorStateProps = {
  message: string;
  onRetry?: () => void;
};

export function ClayErrorState({ message, onRetry }: ClayErrorStateProps) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24, gap: 14 }}>
      <View
        style={{
          backgroundColor: 'rgba(253, 19, 90, 0.1)',
          borderWidth: 1,
          borderColor: paleta.fucsia.claro,
          borderRadius: radios.chip,
          padding: 12,
        }}>
        <Text style={{ color: paleta.fucsia.base, fontSize: 12, textAlign: 'center' }}>
          {message}
        </Text>
      </View>
      {onRetry ? (
        <ClayButton
          title="Reintentar"
          colors={clay.blanco}
          textColor={clay.texto}
          pixel={false}
          size="md"
          onPress={onRetry}
        />
      ) : null}
    </View>
  );
}
