import { Text, View } from 'react-native';
import { tipografia } from '@/estilos';

type StatBarProps = {
  label: string;
  value: number;
};

export function StatBar({ label, value }: StatBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <View>
      <View className="flex-row justify-between">
        <Text className={tipografia.hint}>{label}</Text>
        <Text className={tipografia.hint}>{clamped}</Text>
      </View>
      <View className="mt-1 h-2 overflow-hidden rounded-full bg-neutral-800">
        <View className="h-full rounded-full bg-emerald-600" style={{ width: `${clamped}%` }} />
      </View>
    </View>
  );
}
