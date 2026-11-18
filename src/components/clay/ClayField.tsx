import { Text, View, type TextInputProps } from 'react-native';
import { clay } from '@/estilos';
import { ClayInput } from './ClayInput';

type ClayFieldProps = TextInputProps & {
  label: string;
  error?: string;
  required?: boolean;
  maxLength?: number;
};

export function ClayField({ label, error, required, maxLength, value, ...rest }: ClayFieldProps) {
  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 12, fontWeight: '900', color: clay.texto }}>
          {label}
          {required ? <Text style={{ color: '#B4221B' }}> *</Text> : null}
        </Text>
        {maxLength != null ? (
          <Text style={{ fontSize: 10, color: clay.textoTenue }}>
            {value?.length ?? 0}/{maxLength}
          </Text>
        ) : null}
      </View>
      <ClayInput maxLength={maxLength} value={value} {...rest} />
      {error ? <Text style={{ fontSize: 11, color: '#B4221B' }}>{error}</Text> : null}
    </View>
  );
}
