import { Text, TextInput, View, type TextInputProps } from 'react-native';

type FieldProps = TextInputProps & {
  label: string;
  error?: string;
};

export function Field({ label, error, ...rest }: FieldProps) {
  return (
    <View className="gap-1.5">
      <Text className="text-sm font-medium text-neutral-400">{label}</Text>
      <TextInput
        className="rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white"
        placeholderTextColor="#737373"
        {...rest}
      />
      {error ? <Text className="text-xs text-red-400">{error}</Text> : null}
    </View>
  );
}
