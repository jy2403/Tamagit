import { Text, TextInput, View, type TextInputProps } from 'react-native';
import { formulario } from '@/estilos';

type FieldProps = TextInputProps & {
  label: string;
  error?: string;
  required?: boolean;
  maxLength?: number;
};

export function Field({ label, error, required, maxLength, value, ...rest }: FieldProps) {
  return (
    <View className="gap-1.5">
      <View className={formulario.filaEtiqueta}>
        <Text className={formulario.etiqueta}>
          {label}
          {required ? <Text className={formulario.requerido}> *</Text> : null}
        </Text>
        {maxLength != null ? (
          <Text className={formulario.contador}>
            {value?.length ?? 0}/{maxLength}
          </Text>
        ) : null}
      </View>
      <TextInput
        className={formulario.input}
        placeholderTextColor="#737373"
        maxLength={maxLength}
        value={value}
        {...rest}
      />
      {error ? <Text className={formulario.error}>{error}</Text> : null}
    </View>
  );
}