import { Text, TextInput, View, type TextInputProps } from 'react-native';

type FieldProps = TextInputProps & {
  label: string;
};

export function Field({ label, ...rest }: FieldProps) {
  return (
    <View className="gap-1.5">
      <Text className="text-sm font-medium text-gray-600">{label}</Text>
      <TextInput
        className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900"
        placeholderTextColor="#9ca3af"
        {...rest}
      />
    </View>
  );
}
