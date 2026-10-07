import { useState } from 'react';

type PromptKind = 'removeItem' | 'deletePet';

export type ReasonPromptState = {
  kind: PromptKind;
  itemId?: number;
  itemName?: string;
} | null;

export function useReasonedAction() {
  const [prompt, setPrompt] = useState<ReasonPromptState>(null);
  const [submitting, setSubmitting] = useState(false);

  const start = (state: ReasonPromptState) => setPrompt(state);
  const cancel = () => setPrompt(null);

  const confirm = async (action: () => Promise<void>) => {
    setSubmitting(true);
    try {
      await action();
      setPrompt(null);
    } finally {
      setSubmitting(false);
    }
  };

  return { prompt, submitting, start, cancel, confirm };
}
