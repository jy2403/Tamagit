import { Redirect } from 'expo-router';
import { ActivityIndicator, Image, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { ClayBackground } from '@/components/clay/ClayBackground';
import { ClayButton } from '@/components/clay/ClayButton';
import { ClaySurface } from '@/components/clay/ClaySurface';
import { IconoImagen } from '@/components/clay/IconoImagen';
import { clay, paleta, radios, sombras } from '@/estilos';

const FEATURES = [
  'Sincroniza tus repositorios y commits.',
  'Alimenta, cuida y sube de nivel a tu mascota.',
  'Personaliza su color y su vestuario.',
] as const;

export default function LoginScreen() {
  const { token, isLoading, signIn, authError } = useAuth();
  const insets = useSafeAreaInsets();

  if (token) {
    return <Redirect href="/projects" />;
  }

  return (
    <ClayBackground>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + 24,
          paddingBottom: Math.max(insets.bottom + 22, 34),
          paddingHorizontal: 22,
          justifyContent: 'center',
          alignItems: 'center',
          gap: 20,
        }}
        showsVerticalScrollIndicator={false}>
        <View style={{ width: '100%', maxWidth: 360, alignItems: 'center', gap: 18 }}>
          <ClaySurface
            colors={clay.vino}
            radius={radios.pastilla}
            shadow="suave"
            contentStyle={{ paddingHorizontal: 14, paddingVertical: 7 }}>
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 9,
                fontWeight: '900',
                letterSpacing: 1.6,
              }}>
              TAMAGIT · GITHUB
            </Text>
          </ClaySurface>

          <View style={[sombras.tarjeta, { width: '100%' }]}>
            <ClaySurface
              colors={clay.blanco}
              radius={radios.tarjetaGrande}
              border
              contentStyle={{
                paddingVertical: 24,
                paddingHorizontal: 20,
                alignItems: 'center',
                gap: 14,
              }}>
              <View style={[sombras.suave, { width: 90, height: 90 }]}>
                <ClaySurface
                  colors={clay.fucsia}
                  radius={45}
                  style={{ width: 90, height: 90 }}
                  contentStyle={{
                    width: 90,
                    height: 90,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <IconoImagen nombre="huevo" size={48} tintColor="#FFFFFF" />
                </ClaySurface>
              </View>

              <Text
                style={{
                  fontFamily: 'PressStart2P_400Regular',
                  fontSize: 20,
                  color: clay.texto,
                  textAlign: 'center',
                }}>
                TAMAGIT
              </Text>

              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '900',
                  lineHeight: 24,
                  color: clay.texto,
                  textAlign: 'center',
                }}>
                Tu repo, ahora es una mascota.
              </Text>

              <Text
                style={{
                  fontSize: 13,
                  lineHeight: 20,
                  color: clay.textoSuave,
                  textAlign: 'center',
                }}>
                Conecta GitHub y transforma cada proyecto en una criatura que crece con tus commits.
                Si el equipo programa, la mascota vive.
              </Text>
            </ClaySurface>
          </View>

          <View style={{ width: '100%', gap: 9 }}>
            {FEATURES.map((feature) => (
              <View key={feature} style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 8,
                    backgroundColor: paleta.menta.fondoSuave,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: paleta.menta.base,
                    }}
                  />
                </View>
                <Text style={{ flex: 1, fontSize: 11, lineHeight: 16, color: clay.textoSuave }}>
                  {feature}
                </Text>
              </View>
            ))}
          </View>

          {authError ? (
            <View
              style={{
                backgroundColor: 'rgba(248, 25, 95, 0.1)',
                borderWidth: 1,
                borderColor: paleta.fucsia.claro,
                borderRadius: radios.chip,
                paddingHorizontal: 16,
                paddingVertical: 10,
                width: '100%',
              }}>
              <Text
                style={{
                  color: paleta.fucsia.base,
                  fontSize: 12,
                  textAlign: 'center',
                  fontWeight: '700',
                }}>
                {authError}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={{ width: '100%', maxWidth: 330, gap: 12, alignItems: 'center' }}>
          {isLoading ? (
            <View style={{ height: 48, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color={paleta.fucsia.base} />
            </View>
          ) : (
            <ClayButton
              title="Conectar con GitHub"
              onPress={() => void signIn()}
              colors={clay.fucsia}
              textColor="#FFFFFF"
              pixel={false}
              size="md"
              accessibilityLabel="Conectar con GitHub"
              style={{ width: 240, height: 46, alignSelf: 'center' }}
              contentStyle={{
                minHeight: 46,
                height: 46,
                paddingHorizontal: 16,
              }}
              icon={
                <Image
                  source={require('../../assets/github-icon.webp')}
                  style={{ width: 20, height: 20, resizeMode: 'contain' }}
                />
              }
            />
          )}
          <Text style={{ fontSize: 10, color: clay.textoTenue, textAlign: 'center' }}>
            Autoriza tu cuenta para sincronizar tus proyectos.
          </Text>
        </View>
      </ScrollView>
    </ClayBackground>
  );
}
