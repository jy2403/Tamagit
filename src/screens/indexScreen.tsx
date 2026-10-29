import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { Animated, Image, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { useAuth } from '@/context/AuthContext';
import { ClayButton } from '@/components/clay/ClayButton';
import { ClaySurface } from '@/components/clay/ClaySurface';
import { clay, paleta, sombras, type Gradiente } from '@/estilos';

type BlobLayer = {
  colors: Gradiente;
  radius: number;
  lobes: number;
};

const BLOB_LAYERS: readonly BlobLayer[] = [
  { colors: clay.violeta, radius: 114, lobes: 8 },
  { colors: clay.menta, radius: 96, lobes: 8 },
  { colors: clay.rosa, radius: 78, lobes: 8 },
  { colors: clay.fucsia, radius: 62, lobes: 8 },
];

function concentricBlobPath(cx: number, cy: number, radius: number, lobes: number) {
  const total = 48;
  const wobble = 0.09;
  const points = Array.from({ length: total }, (_, index) => {
    const angle = (index / total) * Math.PI * 2;
    const radio = radius * (1 + wobble * Math.sin(lobes * angle));
    return {
      x: cx + Math.cos(angle) * radio,
      y: cy + Math.sin(angle) * radio,
    };
  });

  const mid = (a: { x: number; y: number }, b: { x: number; y: number }) => ({
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  });

  const start = mid(points[0], points[1]);
  let d = `M ${start.x} ${start.y} `;
  for (let index = 0; index < total; index += 1) {
    const point = points[(index + 1) % total];
    const next = points[(index + 2) % total];
    const end = mid(point, next);
    d += `Q ${point.x} ${point.y} ${end.x} ${end.y} `;
  }
  return `${d}Z`;
}

type Bubble = { size: number; left?: number; right?: number; top: number; colors: Gradiente };

const SYMMETRIC_BUBBLES: readonly Bubble[] = [
  { size: 18, left: -22, top: 8, colors: clay.rosa },
  { size: 12, left: -14, top: 44, colors: clay.menta },
  { size: 9, left: -24, top: 66, colors: clay.violeta },
  { size: 18, right: -22, top: 8, colors: clay.rosa },
  { size: 12, right: -14, top: 44, colors: clay.menta },
  { size: 9, right: -24, top: 66, colors: clay.violeta },
];

function LandingBackdrop() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id="landingBg" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#160B36" />
            <Stop offset="0.5" stopColor={paleta.indigo.base} />
            <Stop offset="1" stopColor="#3B207F" />
          </LinearGradient>
          <LinearGradient id="landingGlow" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={paleta.indigo.brillante} stopOpacity="0.55" />
            <Stop offset="1" stopColor={paleta.indigo.brillante} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#landingBg)" />
        <Circle cx="88%" cy="12%" r="38%" fill="url(#landingGlow)" />
        <Circle cx="8%" cy="82%" r="32%" fill={paleta.menta.base} fillOpacity="0.16" />
        <Circle cx="95%" cy="78%" r="18%" fill={paleta.fucsia.base} fillOpacity="0.14" />
      </Svg>
    </View>
  );
}

export default function LandingScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const compact = height < 720;

  const flowerSize = Math.min(width * 0.68, height * 0.36, compact ? 205 : 255);
  const squareSize = Math.round(flowerSize * 0.5);
  const buttonWidth = Math.min(width - 80, 205);
  const titleBoxWidth = Math.min(width * 0.68, 260);
  const titleBoxHeight = compact ? 70 : 80;

  const [titleY] = useState(() => new Animated.Value(-100));
  const [titleScale] = useState(() => new Animated.Value(0.88));
  const [flowerScale] = useState(() => new Animated.Value(0.45));
  const [flowerRotate] = useState(() => new Animated.Value(0));
  const [squareScale] = useState(() => new Animated.Value(0));
  const [buttonScale] = useState(() => new Animated.Value(0.9));
  const [buttonOpacity] = useState(() => new Animated.Value(0));
  const [buttonPulse] = useState(() => new Animated.Value(1));
  const [bubbleScales] = useState(() => SYMMETRIC_BUBBLES.map(() => new Animated.Value(0)));

  const paths = useMemo(
    () => BLOB_LAYERS.map((layer) => concentricBlobPath(130, 130, layer.radius, layer.lobes)),
    []
  );

  useEffect(() => {
    const intro = Animated.parallel([
      Animated.spring(titleY, { toValue: 0, friction: 6, tension: 70, useNativeDriver: true }),
      Animated.spring(titleScale, { toValue: 1, friction: 5, useNativeDriver: true }),
      Animated.stagger(
        60,
        bubbleScales.map((value) =>
          Animated.spring(value, { toValue: 1, friction: 5, useNativeDriver: true })
        )
      ),
      Animated.sequence([
        Animated.delay(140),
        Animated.spring(flowerScale, { toValue: 1, friction: 6, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.delay(420),
        Animated.spring(squareScale, { toValue: 1, friction: 5, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.delay(650),
        Animated.parallel([
          Animated.spring(buttonScale, { toValue: 1, friction: 5, useNativeDriver: true }),
          Animated.timing(buttonOpacity, {
            toValue: 1,
            duration: 280,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]);

    const rotateLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(flowerRotate, {
          toValue: 1,
          duration: 9000,
          useNativeDriver: true,
        }),
        Animated.timing(flowerRotate, {
          toValue: -1,
          duration: 9000,
          useNativeDriver: true,
        }),
      ])
    );

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(buttonPulse, {
          toValue: 1.02,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(buttonPulse, {
          toValue: 1,
          duration: 1600,
          useNativeDriver: true,
        }),
      ])
    );

    intro.start();
    rotateLoop.start();
    pulseLoop.start();

    return () => {
      intro.stop();
      rotateLoop.stop();
      pulseLoop.stop();
    };
  }, [
    bubbleScales,
    buttonOpacity,
    buttonPulse,
    buttonScale,
    flowerRotate,
    flowerScale,
    squareScale,
    titleScale,
    titleY,
  ]);

  const rotate = flowerRotate.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-10deg', '10deg'],
  });

  const start = () => {
    router.replace(token ? '/projects' : '/login');
  };

  return (
    <View style={{ flex: 1, backgroundColor: paleta.indigo.oscuro }}>
      <LandingBackdrop />
      <View
        style={{
          flex: 1,
          paddingTop: insets.top + (compact ? 14 : 26),
          paddingBottom: Math.max(insets.bottom + 22, 34),
          paddingHorizontal: 20,
          justifyContent: 'space-between',
        }}>
        <View style={{ alignItems: 'center' }}>
          <Animated.View
            style={{
              transform: [{ translateY: titleY }, { scale: titleScale }],
            }}>
            <View
              style={{
                width: titleBoxWidth,
                height: titleBoxHeight,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              {SYMMETRIC_BUBBLES.map((bubble, index) => (
                <Animated.View
                  key={`bubble-${index}`}
                  style={{
                    position: 'absolute',
                    left: bubble.left,
                    right: bubble.right,
                    top: bubble.top,
                    zIndex: 0,
                    transform: [{ scale: bubbleScales[index] }],
                  }}>
                  <ClaySurface
                    colors={bubble.colors}
                    radius={bubble.size}
                    shadow="suave"
                    style={{ width: bubble.size, height: bubble.size }}
                    contentStyle={{ width: bubble.size, height: bubble.size }}
                  />
                </Animated.View>
              ))}

              <ClaySurface
                colors={clay.fucsia}
                radius={22}
                shadow="tarjeta"
                style={{ width: '100%', height: '100%' }}
                contentStyle={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: 16,
                }}>
                <Animated.Text
                  style={{
                    fontFamily: 'PressStart2P_400Regular',
                    fontSize: compact ? 20 : 24,
                    color: '#FFFFFF',
                    textAlign: 'center',
                    includeFontPadding: false,
                  }}>
                  TAMAGIT
                </Animated.Text>
              </ClaySurface>
            </View>
          </Animated.View>
        </View>

        <View
          style={{
            flex: 1,
            minHeight: 0,
            alignItems: 'center',
            justifyContent: 'center',
            marginVertical: 8,
          }}>
          <Animated.View
            style={{
              width: flowerSize,
              height: flowerSize,
              alignItems: 'center',
              justifyContent: 'center',
              transform: [{ scale: flowerScale }],
            }}>
            <Animated.View
              style={{
                position: 'absolute',
                width: flowerSize,
                height: flowerSize,
                alignItems: 'center',
                justifyContent: 'center',
                transform: [{ rotate }],
              }}>
              <Svg width="100%" height="100%" viewBox="0 0 260 260">
                <Defs>
                  {BLOB_LAYERS.map((blob, index) => (
                    <LinearGradient
                      key={`grad-${index}`}
                      id={`blobGrad-${index}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1">
                      <Stop offset="0" stopColor={blob.colors[0]} />
                      <Stop offset="1" stopColor={blob.colors[1]} />
                    </LinearGradient>
                  ))}
                </Defs>
                {BLOB_LAYERS.map((_, index) => (
                  <Path
                    key={`path-${index}`}
                    d={paths[index]}
                    fill={`url(#blobGrad-${index})`}
                    opacity={0.95}
                  />
                ))}
              </Svg>
            </Animated.View>

            <Animated.View
              style={[
                sombras.tarjeta,
                {
                  width: squareSize,
                  height: squareSize,
                  transform: [{ scale: squareScale }],
                },
              ]}>
              <ClaySurface
                colors={clay.vino}
                radius={Math.round(squareSize * 0.28)}
                border
                style={{ flex: 1 }}
                contentStyle={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: squareSize * 0.12,
                }}>
                <Image
                  source={require('../../assets/github-icon.webp')}
                  style={{
                    width: squareSize * 0.62,
                    height: squareSize * 0.62,
                    resizeMode: 'contain',
                  }}
                />
              </ClaySurface>
            </Animated.View>
          </Animated.View>
        </View>

        <View style={{ alignItems: 'center', gap: compact ? 10 : 14 }}>
          <Text
            style={{
              color: '#E9E4FF',
              fontSize: 13,
              lineHeight: 19,
              textAlign: 'center',
              maxWidth: 280,
              fontWeight: '600',
            }}>
            Tus repositorios cobran vida.{'\n'}Cuida el código, cuida tu mascota.
          </Text>
          <Animated.View
            style={{
              opacity: buttonOpacity,
              transform: [{ scale: buttonScale }, { scale: buttonPulse }],
              width: buttonWidth,
            }}>
            <ClayButton
              title="START"
              onPress={start}
              colors={clay.fucsia}
              textColor="#FFFFFF"
              size="md"
              pixel
              outline={false}
              accessibilityLabel="Empezar"
              style={{ width: buttonWidth }}
            />
          </Animated.View>
        </View>
      </View>
    </View>
  );
}
