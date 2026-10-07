import { useState } from 'react';

export function useReasonPrompt() {
  const [reason, setReason] = useState('');

  const reset = () => setReason('');

  const confirm = (onConfirm: (reason: string) => void) => {
    onConfirm(reason.trim());
    reset();
  };

  const cancel = (onCancel: () => void) => {
    reset();
    onCancel();
  };

  return { reason, setReason, reset, confirm, cancel };
}
