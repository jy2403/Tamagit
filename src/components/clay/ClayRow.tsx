import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { clay, radios, sombras } from '@/estilos';
import { ClaySurface } from './ClaySurface';

type ClayRowProps = {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  /** Contenido bajo el subtítulo (p. ej. pastillas de estado). */
  children?: ReactNode;
  /** Contenido a la derecha de la fila (p. ej. un indicador). */
  right?: ReactNode;
  /** Fila de acciones a todo el ancho bajo la información. */
  footer?: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
};

export function ClayRow({
  icon,
  title,
  subtitle,
  children,
  right,
  footer,
  onPress,
  accessibilityLabel,
}: ClayRowProps) {
  const content = (
    <View style={sombras.suave}>
      <ClaySurface
        colors={clay.blanco}
        radius={radios.input}
        border
        contentStyle={{ padding: 10, gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {icon ? (
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: 'rgba(64,32,42,0.06)',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              {icon}
            </View>
          ) : null}
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: '900', color: clay.texto }}>
              {title}
            </Text>
            {subtitle ? (
              <Text
                numberOfLines={1}
                style={{ marginTop: 2, fontSize: 10, color: clay.textoSuave }}>
                {subtitle}
              </Text>
            ) : null}
            {children}
          </View>
          {right}
        </View>
        {footer ? <View style={{ flexDirection: 'row', gap: 8 }}>{footer}</View> : null}
      </ClaySurface>
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      style={({ pressed }) =>
        pressed ? { transform: [{ translateY: 2 }, { scale: 0.98 }] } : null
      }>
      {content}
    </Pressable>
  );
}
