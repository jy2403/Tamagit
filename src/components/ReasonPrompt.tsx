import { useState } from 'react';
import { Modal, Text, TextInput, View } from 'react-native';
import { Button } from '@/layout/Button';

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
      <View className="flex-1 items-center justify-center bg-black/70 px-6">
        <View className="w-full rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
          <Text className="text-lg font-semibold text-white">{title}</Text>
          <TextInput
            value={reason}
            onChangeText={setReason}
            placeholder={placeholder}
            placeholderTextColor="#737373"
            multiline
            className="mt-3 min-h-[80px] rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white"
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