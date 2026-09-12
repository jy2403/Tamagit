import React from 'react';
import { Pressable, Text } from 'react-native';

interface Props {
  text: string;
  onPress: () => void;
  /** Se ve apagado y deja de responder. Útil mientras se envía un formulario. */
  disabled?: boolean;
  /** Variante secundaria: borde en vez de fondo lleno. */
  secondary?: boolean;
  className?: string;
}

export default function Button({ text, onPress, disabled, secondary, className }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`items-center rounded-xl p-4 active:opacity-80 disabled:opacity-50 ${
      secondary ? 'border border-neutral-300' : 'bg-emerald-600'
      } ${className ?? ''}`}>
      <Text className={`font-semibold ${secondary ? 'text-neutral-700' : 'text-white'}`}>
        {text}
      </Text>
    </Pressable>
  );
}