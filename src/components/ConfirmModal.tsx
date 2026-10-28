import { Modal, Pressable, Text, View } from 'react-native';
import { ClayButton } from '@/components/clay/ClayButton';
import { ClaySurface } from '@/components/clay/ClaySurface';
import { clay, radios, sombras, textoClay } from '@/estilos';

type ConfirmModalProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  visible,
  title,
  message,
  confirmText = 'Eliminar',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable
        style={{
          flex: 1,
          backgroundColor: 'rgba(26,26,31,0.58)',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
        onPress={onCancel}
        accessibilityRole="button"
        accessibilityLabel="Cerrar confirmación">
        <Pressable
          onPress={(event) => event.stopPropagation()}
          style={{ width: '100%', maxWidth: 360 }}>
          <ClaySurface
            colors={clay.blanco}
            radius={radios.tarjetaGrande}
            border
            style={sombras.tarjeta}>
            <View style={{ padding: 24, alignItems: 'center' }}>
              <ClaySurface
                colors={clay.rojo}
                radius={999}
                shadow="boton"
                contentStyle={{
                  width: 58,
                  height: 58,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text style={{ color: '#FFFFFF', fontSize: 28, fontWeight: '900' }}>!</Text>
              </ClaySurface>
              <Text
                style={{
                  marginTop: 16,
                  fontSize: textoClay.titulo,
                  fontWeight: '900',
                  color: clay.texto,
                  textAlign: 'center',
                }}>
                {title}
              </Text>
              <Text
                style={{
                  marginTop: 8,
                  fontSize: textoClay.cuerpo,
                  lineHeight: 19,
                  color: clay.textoSuave,
                  textAlign: 'center',
                }}>
                {message}
              </Text>
              <View style={{ marginTop: 22, flexDirection: 'row', gap: 12, alignSelf: 'stretch' }}>
                <ClayButton
                  title="Cancelar"
                  colors={clay.blanco}
                  textColor={clay.texto}
                  pixel={false}
                  size="md"
                  disabled={loading}
                  onPress={onCancel}
                  style={{ flex: 1 }}
                />
                <ClayButton
                  title={loading ? 'Eliminando...' : confirmText}
                  colors={clay.rojo}
                  pixel={false}
                  size="md"
                  disabled={loading}
                  onPress={onConfirm}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          </ClaySurface>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
