import React from 'react';
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from 'react-hook-form';
import { Text, TextInput, View, type TextInputProps } from 'react-native';

// Hereda todas las props de TextInput (keyboardType, secureTextEntry...) y
// añade las del formulario.
type Props<T extends FieldValues> = TextInputProps & {
  control: Control<T>;
  /** Nombre del campo dentro del formulario. TypeScript solo acepta los que existen. */
  name: Path<T>;
  label: string;
  /** Reglas de validación: required, minLength, pattern, validate... */
  rules?: RegisterOptions<T, Path<T>>;
};

export default function Field<T extends FieldValues>({
  control,
  name,
  label,
  rules,
  className,
  ...input
}: Props<T>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <View className="gap-1.5">
          <Text className="font-semibold text-neutral-700">{label}</Text>
          <TextInput
            // El `className` que llegue desde fuera se suma al de aquí; si se
            // pasara dentro de `...input` reemplazaría estos estilos base.
            className={`rounded-xl border bg-white p-3.5 ${
              error ? 'border-red-500' : 'border-neutral-300'
            } ${className ?? ''}`}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            autoCapitalize="none"
            placeholderTextColor="#a3a3a3"
            {...input}
          />
          {/* El mensaje sale de las `rules`: quien define la regla define el texto. */}
          {!!error && <Text className="text-xs text-red-600">{error.message}</Text>}
        </View>
      )}
    />
  );
}