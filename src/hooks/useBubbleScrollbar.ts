import { useMemo, useRef, useState } from 'react';
import {
  PanResponder,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollView,
} from 'react-native';

const TRACK_H = 120;

export function useBubbleScrollbar() {
  const [scrollPos, setScrollPos] = useState(0);
  const [vpH, setVpH] = useState(0);
  const [cH, setCH] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const thumbPosAtGrant = useRef(0);

  const isScrollable = cH > vpH + 1;
  const thumbH = isScrollable && cH > 0 ? Math.max(18, TRACK_H * (vpH / cH)) : TRACK_H;
  const thumbPos = isScrollable && cH - vpH > 0 ? scrollPos * ((TRACK_H - thumbH) / (cH - vpH)) : 0;

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

  const onLayout = (e: LayoutChangeEvent) => setVpH(e.nativeEvent.layout.height);
  const onContentSizeChange = (_w: number, h: number) => setCH(h);
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) =>
    setScrollPos(e.nativeEvent.contentOffset.y);
  const reset = () => {
    setScrollPos(0);
    setVpH(0);
    setCH(0);
  };

  return {
    scrollViewRef,
    isScrollable,
    thumbH,
    thumbPos,
    panHandlers: thumbDrag.panHandlers,
    tapTrack,
    onLayout,
    onContentSizeChange,
    onScroll,
    reset,
  };
}
