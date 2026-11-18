import { Modal, Pressable, Text, View } from 'react-native';
import { ClayButton } from '@/components/clay/ClayButton';
import { ClayInput } from '@/components/clay/ClayInput';
import { ClaySurface } from '@/components/clay/ClaySurface';
import { useReasonPrompt } from '@/hooks/useReasonPrompt';
import { clay, radios, sombras, textoClay } from '@/estilos';

type ReasonPromptProps = {
  visible: boolean;
  title: string;
  placeholder?: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  loading?: boolean;
};

export function ReasonPrompt({
  visible,
  title,
  placeholder = 'Escribe el motivo (se le mostrará al usuario)...',
  onConfirm,
  onCancel,
  loading = false,
}: ReasonPromptProps) {
  const { reason, setReason, confirm, cancel } = useReasonPrompt();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => cancel(onCancel)}>
      <Pressable
        style={{
          flex: 1,
          backgroundColor: 'rgba(26,26,31,0.58)',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
        onPress={() => cancel(onCancel)}
        accessibilityLabel="Cerrar">
        <Pressable
          onPress={(event) => event.stopPropagation()}
          style={[{ width: '100%', maxWidth: 420 }, sombras.tarjeta]}
          accessibilityViewIsModal>
          <ClaySurface
            colors={clay.blanco}
            radius={radios.tarjetaGrande}
            border
            contentStyle={{ padding: 20, gap: 14 }}>
            <Text style={{ fontSize: textoClay.titulo, fontWeight: '900', color: clay.texto }}>
              {title}
            </Text>
            <ClayInput
              value={reason}
              onChangeText={setReason}
              placeholder={placeholder}
              multiline
              style={{ minHeight: 96, textAlignVertical: 'top' }}
            />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <ClayButton
                title="Cancelar"
                onPress={() => cancel(onCancel)}
                colors={clay.blanco}
                textColor={clay.texto}
                pixel={false}
                size="md"
                disabled={loading}
                style={{ flex: 1 }}
              />
              <ClayButton
                title={loading ? 'Enviando...' : 'Confirmar'}
                onPress={() => confirm(onConfirm)}
                colors={clay.rojo}
                pixel={false}
                size="md"
                disabled={loading}
                style={{ flex: 1 }}
              />
            </View>
          </ClaySurface>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
