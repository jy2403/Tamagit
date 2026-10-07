import { useEffect, useState } from 'react';
import { Animated } from 'react-native';
import type { Feedback } from '@/components/FeedbackBanner';

export function useFeedbackAnimation(feedback: Feedback, onDone: () => void) {
  const [anim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!feedback) return;
    anim.setValue(0);
    Animated.sequence([
      Animated.spring(anim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
      }),
      Animated.delay(2200),
      Animated.timing(anim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) onDone();
    });
  }, [feedback, anim, onDone]);

  return anim;
}
