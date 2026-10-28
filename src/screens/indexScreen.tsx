import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { Animated, Image, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, Ellipse, LinearGradient, Path, Stop } from 'react-native-svg';
import { useAuth } from '@/context/AuthContext';
import { ClayBackground } from '@/components/clay/ClayBackground';
import { ClayButton } from '@/components/clay/ClayButton';
import { ClaySurface } from '@/components/clay/ClaySurface';
import { OutlinedText } from '@/components/clay/OutlinedText';
import { clay, sombras, type Gradiente } from '@/estilos';

type Blob = {
  colors: Gradiente;
  size: number;
  cx: number;
  cy: number;
  radius: number;
  lobes: number;
  phase: number;
  rotate: number;
  offsetX: number;
  offsetY: number;
};

const BLOBS: readonly Blob[] = [
  {
    colors: clay.turquesa,
    size: 260,
    cx: 118,
    cy: 126,
    radius: 96,
    lobes: 7,
    phase: 0.4,
    rotate: -16,
    offsetX: -18,
    offsetY: 14,
  },
  {
    colors: clay.verde,
    size: 254,
    cx: 108,
    cy: 110,
    radius: 92,
    lobes: 8,
    phase: 1.3,
    rotate: 12,
    offsetX: -30,
    offsetY: -8,
  },
  {
    colors: clay.amarillo,
    size: 242,
    cx: 116,
    cy: 100,
    radius: 82,
    lobes: 7,
    phase: 2.4,
    rotate: -6,
    offsetX: 10,
    offsetY: -20,
  },
  {
    colors: clay.naranja,
    size: 222,
    cx: 112,
    cy: 112,
    radius: 70,
    lobes: 9,
    phase: 0.9,
    rotate: 22,
    offsetX: 18,
    offsetY: 6,
  },
];

function blobPath(cx: number, cy: number, radius: number, lobes: number, phase: number) {
  const total = 48;
  const wobble = 0.09;
  const points = Array.from({ length: total }, (_, index) => {
    const angle = (index / total) * Math.PI * 2;
    const radio = radius * (1 + wobble * Math.sin(lobes * angle + phase));
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

type Splash = { size: number; left: `${number}%`; top: `${number}%`; z: number };

const SPLASHES: readonly Splash[] = [
  { size: 54, left: '78%', top: '-4%', z: 0 },
  { size: 22, left: '10%', top: '2%', z: 0 },
  { size: 16, left: '72%', top: '36%', z: 2 },
  { size: 30, left: '-4%', top: '32%', z: 0 },
  { size: 14, left: '4%', top: '52%', z: 2 },
  { size: 40, left: '84%', top: '52%', z: 0 },
];

export default function LandingScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const compact = height < 720;

  const flowerSize = Math.min(compact ? 240 : 290, width * 0.82);
  const squareSize = Math.round(flowerSize * 0.61);
  const blobScale = flowerSize / 260;

  const [titleY] = useState(() => new Animated.Value(-150));
  const [titleScale] = useState(() => new Animated.Value(0.82));
  const [flowerScale] = useState(() => new Animated.Value(0.4));
  const [flowerRotate] = useState(() => new Animated.Value(0));
  const [squareScale] = useState(() => new Animated.Value(0));
  const [buttonScale] = useState(() => new Animated.Value(0.6));
  const [buttonOpacity] = useState(() => new Animated.Value(0));
  const [buttonPulse] = useState(() => new Animated.Value(1));
  const [splashScales] = useState(() => SPLASHES.map(() => new Animated.Value(0)));

  const paths = useMemo(
    () => BLOBS.map((blob) => blobPath(blob.cx, blob.cy, blob.radius, blob.lobes, blob.phase)),
    []
  );

  useEffect(() => {
    const intro = Animated.parallel([
      Animated.spring(titleY, { toValue: 0, friction: 5, tension: 70, useNativeDriver: true }),
      Animated.spring(titleScale, { toValue: 1, friction: 4, useNativeDriver: true }),
      Animated.stagger(
        90,
        splashScales.map((value) =>
          Animated.spring(value, { toValue: 1, friction: 4, useNativeDriver: true })
        )
      ),
      Animated.sequence([
        Animated.delay(160),
        Animated.spring(flowerScale, { toValue: 1, friction: 5, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.delay(500),
        Animated.spring(squareScale, { toValue: 1, friction: 4, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.delay(880),
        Animated.parallel([
          Animated.spring(buttonScale, { toValue: 1, friction: 4, useNativeDriver: true }),
          Animated.timing(buttonOpacity, {
            toValue: 1,
            duration: 260,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]);

    const rotateLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(flowerRotate, {
          toValue: 1,
          duration: 7000,
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
          toValue: 1.045,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(buttonPulse, {
          toValue: 0.985,
          duration: 900,
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
    buttonOpacity,
    buttonPulse,
    buttonScale,
    flowerRotate,
    flowerScale,
    splashScales,
    squareScale,
    titleScale,
    titleY,
  ]);

  const rotate = flowerRotate.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-7deg', '8deg'],
  });

  const start = () => {
    router.replace(token ? '/projects' : '/login');
  };

  return (
    <ClayBackground>
      <View
        style={{
          flex: 1,
          paddingTop: insets.top + 10,
          paddingBottom: Math.max(insets.bottom + 18, 28),
          paddingHorizontal: 20,
          justifyContent: 'space-between',
        }}>
        <View style={{ alignItems: 'center', marginTop: compact ? 8 : 22 }}>
          <Animated.View
            style={{
              transform: [{ translateY: titleY }, { scale: titleScale }, { rotate: '-3deg' }],
            }}>
            <View style={{ width: Math.min(width * 0.7, 300), height: compact ? 88 : 104 }}>
              {SPLASHES.map((splash, index) => (
                <Animated.View
                  key={`${splash.left}-${splash.top}`}
                  style={{
                    position: 'absolute',
                    left: splash.left,
                    top: splash.top,
                    zIndex: splash.z,
                    transform: [{ scale: splashScales[index] }],
                  }}>
                  <ClaySurface
                    colors={clay.rojo}
                    radius={splash.size}
                    shadow="suave"
                    style={{ width: splash.size, height: splash.size }}
                    contentStyle={{ width: splash.size, height: splash.size }}
                  />
                </Animated.View>
              ))}
              <ClaySurface
                colors={clay.rojo}
                radius={24}
                shadow="tarjeta"
                style={{ flex: 1 }}
                contentStyle={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: 14,
                }}>
                <OutlinedText
                  size={compact ? 22 : 26}
                  pixel
                  color="#FFFFFF"
                  outlineWidth={2.5}
                  numberOfLines={1}>
                  TAMAGIT
                </OutlinedText>
              </ClaySurface>
            </View>
          </Animated.View>
        </View>

        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            marginVertical: compact ? 10 : 18,
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
                transform: [{ rotate }],
              }}>
              {BLOBS.map((blob, index) => (
                <View
                  key={`blob-${index}`}
                  style={{
                    position: 'absolute',
                    width: blob.size * blobScale,
                    height: blob.size * blobScale,
                    left: blob.offsetX * blobScale,
                    top: blob.offsetY * blobScale,
                    transform: [{ rotate: `${blob.rotate}deg` }],
                  }}>
                  <Svg width="100%" height="100%" viewBox={`0 0 ${blob.size} ${blob.size}`}>
                    <Defs>
                      <LinearGradient id={`blob-${index}`} x1="0" y1="0" x2="1" y2="1">
                        <Stop offset="0" stopColor={blob.colors[0]} />
                        <Stop offset="1" stopColor={blob.colors[1]} />
                      </LinearGradient>
                    </Defs>
                    <Path d={paths[index]} fill={`url(#blob-${index})`} />
                    <Ellipse
                      cx={blob.cx - 28}
                      cy={blob.cy - 34}
                      rx={42}
                      ry={26}
                      fill="#FFFFFF"
                      fillOpacity={0.24}
                      transform={`rotate(-28 ${blob.cx - 28} ${blob.cy - 34})`}
                    />
                  </Svg>
                </View>
              ))}
            </Animated.View>

            <Animated.View
              style={[
                sombras.tarjeta,
                {
                  width: squareSize,
                  height: squareSize,
                  transform: [{ scale: squareScale }, { rotate: '3deg' }],
                },
              ]}>
              <ClaySurface
                colors={clay.naranja}
                radius={Math.round(squareSize * 0.22)}
                style={{ flex: 1 }}
                contentStyle={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: squareSize * 0.1,
                }}>
                <Image
                  source={require('../../assets/github-icon.webp')}
                  style={{
                    width: squareSize * 0.58,
                    height: squareSize * 0.58,
                    resizeMode: 'contain',
                  }}
                />
              </ClaySurface>
            </Animated.View>
          </Animated.View>
        </View>

        <Animated.View
          style={{
            alignItems: 'center',
            opacity: buttonOpacity,
            transform: [{ scale: buttonScale }, { scale: buttonPulse }],
          }}>
          <View style={{ width: Math.min(width * 0.72, 280) }}>
            <ClayButton title="START" onPress={start} accessibilityLabel="Empezar" />
          </View>
        </Animated.View>
      </View>
    </ClayBackground>
  );
}
