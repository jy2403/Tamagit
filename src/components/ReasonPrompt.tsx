import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ClayButton } from '@/components/clay/ClayButton';
import { ClaySurface } from '@/components/clay/ClaySurface';
import { useReasonPrompt } from '@/hooks/useReasonPrompt';
import { clay, radios, sombras } from '@/estilos';

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
        accessibilityRole="button"
        accessibilityLabel="Cerrar motivo">
        <KeyboardAvoidingView
          style={{ width: '100%' }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <Pressable
            onPress={(event) => event.stopPropagation()}
            style={{ width: '100%', maxWidth: 380 }}>
            <ClaySurface
              colors={clay.blanco}
              radius={radios.tarjetaGrande}
              glass
              border
              style={sombras.tarjeta}
              contentStyle={{ padding: 20 }}>
              <Text style={{ fontSize: 15, fontWeight: '900', color: clay.texto }}>{title}</Text>
              <ClaySurface
                colors={clay.fondoClaro}
                radius={radios.input}
                contentStyle={{ paddingHorizontal: 12, paddingVertical: 4, marginTop: 12 }}>
                <TextInput
                  value={reason}
                  onChangeText={setReason}
                  placeholder={placeholder}
                  placeholderTextColor={clay.textoTenue}
                  multiline
                  style={{ minHeight: 92, color: clay.texto, fontSize: 13, lineHeight: 19 }}
                />
              </ClaySurface>
              <View style={{ marginTop: 14, flexDirection: 'row', gap: 10 }}>
                <ClayButton
                  title="Cancelar"
                  colors={clay.blanco}
                  textColor={clay.texto}
                  pixel={false}
                  size="md"
                  onPress={() => cancel(onCancel)}
                  disabled={loading}
                  style={{ flex: 1 }}
                />
                <ClayButton
                  title={loading ? 'Enviando...' : 'Confirmar'}
                  colors={clay.fucsia}
                  textColor="#FFFFFF"
                  pixel={false}
                  size="md"
                  onPress={() => confirm(onConfirm)}
                  disabled={loading}
                  style={{ flex: 1 }}
                />
              </View>
            </ClaySurface>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}
