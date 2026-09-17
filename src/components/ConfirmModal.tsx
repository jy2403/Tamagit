import { Modal, Text, View } from 'react-native';
import { Button } from '@/layout/Button';
import { confirmar } from '@/estilos';

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
      <View className={confirmar.overlay}>
        <View className={confirmar.fondo}>
          <View className={confirmar.icono}>
            <Text className={confirmar.iconoLlave}>!</Text>
          </View>
          <Text className={confirmar.titulo}>{title}</Text>
          <Text className={confirmar.mensaje}>{message}</Text>
          <View className={confirmar.acciones}>
            <Button
              title="Cancelar"
              variant="secondary"
              onPress={onCancel}
              disabled={loading}
              style={{ flex: 1 }}
            />
            <Button
              title={loading ? 'Eliminando...' : confirmText}
              variant="danger"
              onPress={onConfirm}
              disabled={loading}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}