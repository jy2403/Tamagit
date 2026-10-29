import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useBubbleScrollbar } from '@/hooks/useBubbleScrollbar';
import { ClayIconButton } from '@/components/clay/ClayIconButton';
import { ClaySurface } from '@/components/clay/ClaySurface';
import { clay, fuentes, radios, sombras } from '@/estilos';
import { FormattedText } from './FormattedText';

type SpeechBubbleProps = {
  text: string;
  loading?: boolean;
  petName?: string;
};

export function SpeechBubble({ text, loading, petName }: SpeechBubbleProps) {
  const [expanded, setExpanded] = useState(false);
  const content = loading ? 'Pensando...' : text || '';
  const label = petName ? petName.toUpperCase() : 'MASCOTA';
  const {
    scrollViewRef,
    isScrollable,
    thumbH,
    thumbPos,
    panHandlers,
    tapTrack,
    onLayout,
    onContentSizeChange,
    onScroll,
    reset,
  } = useBubbleScrollbar();

  return (
    <>
      <View style={{ width: '100%', alignItems: 'center' }}>
        <View
          style={{
            alignSelf: 'center',
            width: 0,
            height: 0,
            borderLeftWidth: 12,
            borderRightWidth: 12,
            borderBottomWidth: 13,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderBottomColor: clay.vino[0],
          }}
        />
        <Pressable
          onPress={() => !loading && content.length > 0 && setExpanded(true)}
          disabled={loading || content.length === 0}
          accessibilityRole="button"
          accessibilityLabel={
            loading ? 'La mascota está pensando' : `${label} dice: ${content || 'nada'}`
          }
          style={{ width: '100%' }}>
          <ClaySurface
            colors={clay.vino}
            radius={radios.tarjeta}
            shadow="suave"
            border
            contentStyle={{ paddingHorizontal: 18, paddingVertical: 14 }}>
            <Text
              style={{
                fontFamily: fuentes.pixel,
                fontSize: 8,
                lineHeight: 13,
                color: '#F4DDE8',
                marginBottom: 6,
                letterSpacing: 0.8,
              }}>
              {label}
            </Text>
            {loading ? (
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#FFFFFF' }}>Pensando...</Text>
            ) : (
              <>
                <FormattedText
                  text={content || 'Todavía no tengo nada que decir.'}
                  numberOfLines={4}
                  style={{
                    fontFamily: fuentes.pixel,
                    fontSize: 8,
                    lineHeight: 15,
                    color: '#FFFFFF',
                  }}
                />
                {content.length > 90 ? (
                  <Text style={{ marginTop: 8, fontSize: 8, fontWeight: '800', color: '#E5BFD1' }}>
                    Toca para ver completo
                  </Text>
                ) : null}
              </>
            )}
          </ClaySurface>
        </Pressable>
      </View>

      <Modal
        visible={expanded}
        transparent
        animationType="fade"
        onRequestClose={() => setExpanded(false)}
        onShow={reset}>
        <Pressable
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(20,20,22,0.46)',
            paddingHorizontal: 20,
          }}
          onPress={() => setExpanded(false)}>
          <Pressable
            style={[{ width: '100%', maxWidth: 420 }, sombras.tarjeta]}
            onPress={(event) => event.stopPropagation()}>
            <ClaySurface
              colors={clay.blanco}
              radius={radios.tarjetaGrande}
              border
              contentStyle={{ padding: 18 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <Text style={{ fontSize: 15, fontWeight: '900', color: clay.texto }}>
                  La mascota dijo...
                </Text>
                <ClayIconButton
                  icon="✕"
                  accessibilityLabel="Cerrar mensaje"
                  onPress={() => setExpanded(false)}
                  size={44}
                />
              </View>

              <View style={{ flexDirection: 'row', marginTop: 8 }}>
                <ScrollView
                  ref={scrollViewRef}
                  style={{ maxHeight: 260, flex: 1 }}
                  showsVerticalScrollIndicator={false}
                  onLayout={onLayout}
                  onContentSizeChange={onContentSizeChange}
                  onScroll={onScroll}
                  scrollEventThrottle={16}>
                  <FormattedText
                    text={content}
                    style={{ fontSize: 15, lineHeight: 23, color: clay.texto }}
                  />
                </ScrollView>

                {isScrollable ? (
                  <Pressable
                    style={{ marginLeft: 12, marginTop: 8, width: 12, height: 260 }}
                    onPress={(event) => {
                      if (event.nativeEvent.locationY !== undefined) {
                        tapTrack(event.nativeEvent.locationY);
                      }
                    }}
                    hitSlop={4}
                    accessibilityLabel="Barra de desplazamiento del mensaje">
                    <View
                      style={{
                        height: '100%',
                        width: '100%',
                        borderRadius: 8,
                        backgroundColor: '#DDDDE3',
                      }}>
                      <Pressable
                        {...panHandlers}
                        style={{
                          width: '100%',
                          borderRadius: 8,
                          backgroundColor: clay.violeta[0],
                          height: thumbH,
                          transform: [{ translateY: thumbPos }],
                        }}
                        hitSlop={8}
                      />
                    </View>
                  </Pressable>
                ) : null}
              </View>
            </ClaySurface>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
