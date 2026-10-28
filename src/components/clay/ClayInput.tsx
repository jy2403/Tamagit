import { TextInput, type TextInputProps } from 'react-native';
import { clay, radios } from '@/estilos';
import { ClaySurface } from './ClaySurface';

export function ClayInput(props: TextInputProps) {
  return (
    <ClaySurface
      colors={clay.fondoClaro}
      radius={radios.input}
      shadow="suave"
      border
      contentStyle={{ paddingHorizontal: 16, paddingVertical: 2 }}>
      <TextInput
        placeholderTextColor={clay.textoTenue}
        {...props}
        style={[
          {
            minHeight: 48,
            color: clay.texto,
            fontSize: 15,
            fontWeight: '600',
            paddingVertical: 12,
          },
          props.style,
        ]}
      />
    </ClaySurface>
  );
}
