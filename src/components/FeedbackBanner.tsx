import { Animated, Text, View } from 'react-native';
import { ClaySurface } from '@/components/clay/ClaySurface';
import { useFeedbackAnimation } from '@/hooks/useFeedbackAnimation';
import { clay, radios, sombras } from '@/estilos';

export type Feedback = { tipo: 'exito' | 'error'; texto: string } | null;

type Props = {
  feedback: Feedback;
  onDone: () => void;
};

export function FeedbackBanner({ feedback, onDone }: Props) {
  const anim = useFeedbackAnimation(feedback, onDone);

  if (!feedback) return null;

  const esExito = feedback.tipo === 'exito';
  const textColor = esExito ? clay.oscuro : '#FFFFFF';

  return (
    <View
      style={{ position: 'absolute', left: 16, right: 16, bottom: 28, zIndex: 50 }}
      pointerEvents="none">
      <Animated.View
        style={{
          opacity: anim,
          transform: [
            { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) },
          ],
          ...sombras.tarjeta,
        }}>
        <ClaySurface
          colors={esExito ? clay.verde : clay.rojo}
          radius={radios.boton}
          border
          contentStyle={{
            minHeight: 54,
            paddingHorizontal: 16,
            paddingVertical: 12,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}>
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              borderWidth: 2,
              borderColor: textColor,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text style={{ color: textColor, fontSize: 14, fontWeight: '900' }}>
              {esExito ? '\u2713' : '!'}
            </Text>
          </View>
          <Text
            style={{
              flex: 1,
              color: textColor,
              fontSize: 13,
              fontWeight: '800',
              lineHeight: 18,
            }}>
            {feedback.texto}
          </Text>
        </ClaySurface>
      </Animated.View>
    </View>
  );
}
