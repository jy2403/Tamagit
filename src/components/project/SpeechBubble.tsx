import { useMemo, useRef, useState } from 'react';
import { Modal, PanResponder, Pressable, ScrollView, Text, View } from 'react-native';
import { FormattedText } from './FormattedText';

const TRACK_H = 120;

type SpeechBubbleProps = {
  text: string;
  loading?: boolean;
};

export function SpeechBubble({ text, loading }: SpeechBubbleProps) {
  const [expanded, setExpanded] = useState(false);
  const [scrollPos, setScrollPos] = useState(0);
  const [vpH, setVpH] = useState(0);
  const [cH, setCH] = useState(0);
  const content = loading ? 'Pensando...' : text || '';
  const scrollViewRef = useRef<ScrollView>(null);

  const isScrollable = cH > vpH + 1;
  const thumbH = isScrollable && cH > 0 ? Math.max(18, TRACK_H * (vpH / cH)) : TRACK_H;
  const thumbPos = isScrollable && cH - vpH > 0 ? scrollPos * ((TRACK_H - thumbH) / (cH - vpH)) : 0;
  const thumbPosAtGrant = useRef(0);

  const scrollTo = (target: number) => {
    scrollViewRef.current?.scrollTo({ y: target, animated: false });
  };

  const startDrag = () => {
    thumbPosAtGrant.current = thumbPos;
  };

  const moveDrag = (dy: number) => {
    const maxTrack = TRACK_H - thumbH;
    const clamped = Math.max(0, Math.min(maxTrack, thumbPosAtGrant.current + dy));
    scrollTo((clamped / maxTrack) * (cH - vpH));
  };

  const tapTrack = (yWithinTrack: number) => {
    const ratio = Math.max(0, Math.min(1, yWithinTrack / TRACK_H));
    scrollTo(ratio * (cH - vpH));
  };

  const thumbDrag = useMemo(
    () =>
      // eslint-disable-next-line react-hooks/refs
      PanResponder.create({
        onStartShouldSetPanResponder: () => isScrollable,
        onMoveShouldSetPanResponder: () => isScrollable,
        onPanResponderGrant: startDrag,
        onPanResponderMove: (_, g) => moveDrag(g.dy),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isScrollable]
  );

  return (
    <>
      <View pointerEvents="box-none" className="absolute bottom-2 left-2 max-w-[70%]">
        <Pressable
          onPress={() => !loading && setExpanded(true)}
          disabled={loading}
          className="w-fit">
          <View className="rounded-2xl rounded-bl-md border-2 border-neutral-900 bg-white px-3 py-2 shadow-sm">
            {loading ? (
              <Text className="text-xs font-medium leading-snug text-neutral-800">Pensando...</Text>
            ) : (
              <>
                <FormattedText
                  text={content}
                  className="text-xs font-medium leading-snug text-neutral-800"
                  numberOfLines={4}
                />
                {content.length > 90 ? (
                  <Text className="mt-0.5 text-[10px] font-semibold text-neutral-500">
                    Toca para ver completo ▼
                  </Text>
                ) : null}
              </>
            )}
          </View>
          <View className="ml-5 h-0 w-0 border-b-8 border-l-8 border-r-8 border-b-neutral-900 border-l-transparent border-r-transparent" />
          <View className="border-l-6 border-r-6 border-b-6 -mt-2 ml-6 h-0 w-0 border-b-white border-l-transparent border-r-transparent" />
        </Pressable>
      </View>

      <Modal
        visible={expanded}
        transparent
        animationType="fade"
        onRequestClose={() => setExpanded(false)}
        onShow={() => {
          setScrollPos(0);
          setVpH(0);
          setCH(0);
        }}>
        <Pressable
          className="flex-1 items-center justify-center bg-black/70 px-6"
          onPress={() => setExpanded(false)}>
          <Pressable
            className="w-full max-w-[90%] rounded-2xl border border-neutral-700 bg-neutral-900 p-4 pb-6"
            onPress={(e) => e.stopPropagation()}>
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-bold text-white">La mascota dijo...</Text>
              <View className="flex-row items-center gap-1 rounded-full bg-neutral-800 px-2 py-1">
                <Text className="text-[10px] text-neutral-400">Cerrar</Text>
                <Text className="text-[10px] text-neutral-500">✕</Text>
              </View>
            </View>

            <View className="flex-row">
              <ScrollView
                ref={scrollViewRef}
                className="mt-2 flex-1"
                style={{ maxHeight: 260 }}
                showsVerticalScrollIndicator={false}
                onLayout={(e) => setVpH(e.nativeEvent.layout.height)}
                onContentSizeChange={(_w, h) => setCH(h)}
                onScroll={(e) => setScrollPos(e.nativeEvent.contentOffset.y)}
                scrollEventThrottle={16}>
                <FormattedText
                  text={content}
                  className="text-base leading-relaxed text-neutral-100"
                />
              </ScrollView>

              {isScrollable ? (
                <Pressable
                  className="ml-3 mt-2 w-3 justify-start"
                  style={{ height: 260 }}
                  onPress={(e) => {
                    e.nativeEvent.locationY !== undefined && tapTrack(e.nativeEvent.locationY);
                  }}
                  hitSlop={4}>
                  <View className="h-full w-full rounded-full bg-neutral-800/70">
                    <Pressable
                      {...thumbDrag.panHandlers}
                      className="w-full rounded-full bg-emerald-400/90"
                      style={{ height: thumbH, transform: [{ translateY: thumbPos }] }}
                      hitSlop={8}
                    />
                  </View>
                </Pressable>
              ) : null}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
