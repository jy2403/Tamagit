import { Animated, Text, View } from 'react-native';
import { useFeedbackAnimation } from '@/hooks/useFeedbackAnimation';
import { mensajes } from '@/estilos';

export type Feedback = { tipo: 'exito' | 'error'; texto: string } | null;

type Props = {
  feedback: Feedback;
  onDone: () => void;
};

export function FeedbackBanner({ feedback, onDone }: Props) {
  const anim = useFeedbackAnimation(feedback, onDone);

  if (!feedback) return null;

  const esExito = feedback.tipo === 'exito';

  return (
    <View className="absolute inset-x-4 bottom-7 z-50" pointerEvents="none">
      <Animated.View
        className={esExito ? mensajes.exito.bloque : mensajes.error.bloque}
        style={{
          opacity: anim,
          transform: [
            { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) },
          ],
        }}>
        <Text className={esExito ? mensajes.exito.icono : mensajes.error.icono}>
          {esExito ? '\u2713' : '!'}
        </Text>
        <Text className={esExito ? mensajes.exito.texto : mensajes.error.texto}>
          {feedback.texto}
        </Text>
      </Animated.View>
    </View>
  );
}
