import { useState } from 'react';
import { Modal, Text, TextInput, View } from 'react-native';
import { Button } from '@/layout/Button';
import { formulario, modal, tipografia } from '@/estilos';

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
  const [reason, setReason] = useState('');

  const close = () => {
    setReason('');
    onCancel();
  };

  const confirm = () => {
    onConfirm(reason.trim());
    setReason('');
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <View className={modal.overlay}>
        <View className={modal.fondo}>
          <Text className={tipografia.seccion}>{title}</Text>
          <TextInput
            value={reason}
            onChangeText={setReason}
            placeholder={placeholder}
            placeholderTextColor="#737373"
            multiline
            className={formulario.textarea}
          />
          <View className="mt-4 flex-row gap-3">
            <Button title={loading ? 'Enviando...' : 'Confirmar'} onPress={confirm} disabled={loading} style={{ flex: 1 }} />
            <Button title="Cancelar" onPress={close} variant="secondary" disabled={loading} style={{ flex: 1 }} />
          </View>
        </View>
      </View>
    </Modal>
  );
}