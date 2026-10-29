import { View, type StyleProp, type ViewStyle } from 'react-native';
import { Pet3DView } from '@/components/Pet3DView';
import { colorMascotaPorId, sombras } from '@/estilos';

type PetAvatarProps = {
  pet: {
    id: number;
    name: string;
    bodyColor?: string | null;
  };
  size?: number;
  shadow?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function PetAvatar({ pet, size = 68, shadow = true, style }: PetAvatarProps) {
  const color = pet.bodyColor ?? colorMascotaPorId(pet.id).hex;

  return (
    <View
      style={[
        shadow ? sombras.suave : null,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: '#FFFFFF',
          overflow: 'hidden',
        },
        style,
      ]}>
      <Pet3DView
        key={`${pet.id}-${color}`}
        simple
        camera="portrait"
        bodyColor={color}
        background="#FFFFFF"
        style={{ width: size, height: size }}
      />
    </View>
  );
}
