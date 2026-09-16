import { Text, TextInput, View, type TextInputProps } from 'react-native';

type FieldProps = TextInputProps & {
  label: string;
  error?: string;
  required?: boolean;
  maxLength?: number;
};

export function Field({ label, error, required, maxLength, value, ...rest }: FieldProps) {
  return (
    <View className="gap-1.5">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-medium text-neutral-400">
          {label}
          {required ? <Text className="text-red-400"> *</Text> : null}
        </Text>
        {maxLength != null ? (
          <Text className="text-xs text-neutral-500">
            {value?.length ?? 0}/{maxLength}
          </Text>
        ) : null}
      </View>
      <TextInput
        className="rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white"
        placeholderTextColor="#737373"
        maxLength={maxLength}
        value={value}
        {...rest}
      />
      {error ? <Text className="text-xs text-red-400">{error}</Text> : null}
    </View>
  );
}
