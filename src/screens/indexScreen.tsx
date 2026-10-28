import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { Animated, Image, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { useAuth } from '@/context/AuthContext';
import { ClayBackground } from '@/components/clay/ClayBackground';
import { ClayButton } from '@/components/clay/ClayButton';
import { ClaySurface } from '@/components/clay/ClaySurface';
import { clay, sombras, type Gradiente } from '@/estilos';

type BlobLayer = {
  colors: Gradiente;
  radius: number;
  lobes: number;
};

// Capas de estrellas/ondas perfectamente concéntricas con simetría radial regular
const BLOB_LAYERS: readonly BlobLayer[] = [
  { colors: clay.menta, radius: 114, lobes: 8 },
  { colors: clay.malva, radius: 96, lobes: 8 },
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

// Burbujitas ordenadas y simétricas respecto al letrero (sin tapar el texto)
type Bubble = { size: number; left?: number; right?: number; top: number; colors: Gradiente };

const SYMMETRIC_BUBBLES: readonly Bubble[] = [
  { size: 20, left: -24, top: 10, colors: clay.rosa },
  { size: 14, left: -16, top: 46, colors: clay.menta },
  { size: 10, left: -26, top: 68, colors: clay.malva },
  { size: 20, right: -24, top: 10, colors: clay.rosa },
  { size: 14, right: -16, top: 46, colors: clay.menta },
  { size: 10, right: -26, top: 68, colors: clay.malva },
];

export default function LandingScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const compact = height < 720;

  const flowerSize = Math.min(compact ? 240 : 280, width * 0.78);
  const squareSize = Math.round(flowerSize * 0.52);

  const [titleY] = useState(() => new Animated.Value(-120));
  const [titleScale] = useState(() => new Animated.Value(0.85));
  const [flowerScale] = useState(() => new Animated.Value(0.4));
  const [flowerRotate] = useState(() => new Animated.Value(0));
  const [squareScale] = useState(() => new Animated.Value(0));
  const [buttonScale] = useState(() => new Animated.Value(0.8));
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
        Animated.delay(700),
        Animated.parallel([
          Animated.spring(buttonScale, { toValue: 1, friction: 5, useNativeDriver: true }),
          Animated.timing(buttonOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]);

    // Rotación suave concéntrica sobre su propio centro
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

    // Latido sutil y lento para el botón START
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(buttonPulse, {
          toValue: 1.025,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(buttonPulse, {
          toValue: 1.0,
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
    outputRange: ['-12deg', '12deg'],
  });

  const start = () => {
    router.replace(token ? '/projects' : '/login');
  };

  const titleBoxWidth = Math.min(width * 0.72, 280);
  const titleBoxHeight = compact ? 76 : 88;

  return (
    <ClayBackground>
      <View
        style={{
          flex: 1,
          paddingTop: insets.top + (compact ? 12 : 24),
          paddingBottom: Math.max(insets.bottom + 32, 44),
          paddingHorizontal: 20,
          justifyContent: 'space-between',
        }}>
        {/* Letrero TAMAGIT derecho, perfectamente centrado, con burbujas simétricas */}
        <View style={{ alignItems: 'center' }}>
          <Animated.View
            style={{
              transform: [{ translateY: titleY }, { scale: titleScale }],
            }}>
            <View style={{ width: titleBoxWidth, height: titleBoxHeight, alignItems: 'center', justifyContent: 'center' }}>
              {/* Burbujitas simétricas en los laterales */}
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

              {/* Letrero con degradado vertical claymorfista fucsia -> rosa */}
              <ClaySurface
                colors={clay.fucsia}
                radius={24}
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
                    fontSize: compact ? 22 : 26,
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

        {/* Ícono de GitHub derecho y centrado con formas onduladas concéntricas */}
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            marginVertical: compact ? 8 : 16,
          }}>
          <Animated.View
            style={{
              width: flowerSize,
              height: flowerSize,
              alignItems: 'center',
              justifyContent: 'center',
              transform: [{ scale: flowerScale }],
            }}>
            {/* Formas redondeadas concéntricas que rotan sobre su propio centro */}
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
                    <LinearGradient key={`grad-${index}`} id={`blobGrad-${index}`} x1="0" y1="0" x2="0" y2="1">
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
                    opacity={0.92}
                  />
                ))}
              </Svg>
            </Animated.View>

            {/* Ícono de GitHub derecho y centrado */}
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

        {/* Botón START: ancho ajustado, texto pixel más grande blanco sin contorno, aire debajo */}
        <Animated.View
          style={{
            alignItems: 'center',
            marginBottom: compact ? 10 : 20,
            opacity: buttonOpacity,
            transform: [{ scale: buttonScale }, { scale: buttonPulse }],
          }}>
          <View style={{ minWidth: 170, alignSelf: 'center' }}>
            <ClayButton
              title="START"
              onPress={start}
              colors={clay.fucsia}
              textColor="#FFFFFF"
              pixel
              outline={false}
              accessibilityLabel="Empezar"
              style={{ paddingHorizontal: 12 }}
            />
          </View>
        </Animated.View>
      </View>
    </ClayBackground>
  );
}
