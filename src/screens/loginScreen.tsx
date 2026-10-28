import { Redirect } from 'expo-router';
import { ActivityIndicator, Image, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { ClayBackground } from '@/components/clay/ClayBackground';
import { ClayButton } from '@/components/clay/ClayButton';
import { ClaySurface } from '@/components/clay/ClaySurface';
import { IconoImagen } from '@/components/clay/IconoImagen';
import { clay, paleta, radios, sombras } from '@/estilos';

export default function LoginScreen() {
  const { token, isLoading, signIn, authError } = useAuth();
  const insets = useSafeAreaInsets();

  if (token) {
    return <Redirect href="/projects" />;
  }

  return (
    <ClayBackground>
      <View
        style={{
          flex: 1,
          paddingTop: insets.top + 32,
          paddingBottom: Math.max(insets.bottom + 24, 36),
          paddingHorizontal: 24,
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%', maxWidth: 360 }}>
          {/* Tarjeta claymorfista con huevo de assets y título */}
          <View style={[sombras.tarjeta, { width: '100%' }]}>
            <ClaySurface
              colors={clay.blanco}
              radius={radios.tarjetaGrande}
              border
              contentStyle={{
                paddingVertical: 32,
                paddingHorizontal: 20,
                alignItems: 'center',
                gap: 16,
              }}>
              {/* Contenedor circular con imagen del huevo de assets */}
              <View style={[sombras.suave, { width: 96, height: 96 }]}>
                <ClaySurface
                  colors={clay.fucsia}
                  radius={48}
                  style={{ width: 96, height: 96 }}
                  contentStyle={{
                    width: 96,
                    height: 96,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <IconoImagen nombre="huevo" size={52} tintColor="#FFFFFF" />
                </ClaySurface>
              </View>

              <View style={{ alignItems: 'center' }}>
                <Text
                  style={{
                    fontFamily: 'PressStart2P_400Regular',
                    fontSize: 22,
                    color: clay.texto,
                    textAlign: 'center',
                  }}>
                  TAMAGIT
                </Text>
                <Text
                  style={{
                    marginTop: 8,
                    fontSize: 13,
                    color: clay.textoSuave,
                    textAlign: 'center',
                    lineHeight: 18,
                  }}>
                  Cría una mascota por cada repositorio de GitHub.
                </Text>
              </View>
            </ClaySurface>
          </View>

          {authError ? (
            <View
              style={{
                marginTop: 16,
                backgroundColor: 'rgba(253, 19, 90, 0.1)',
                borderWidth: 1,
                borderColor: paleta.fucsia.claro,
                borderRadius: radios.chip,
                paddingHorizontal: 16,
                paddingVertical: 10,
                width: '100%',
              }}>
              <Text style={{ color: paleta.fucsia.base, fontSize: 12, textAlign: 'center', fontWeight: '700' }}>
                {authError}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Botón principal grande y claro para conectar la cuenta */}
        <View style={{ width: '100%', maxWidth: 340, gap: 10, alignItems: 'center' }}>
          {isLoading ? (
            <View style={{ height: 56, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color={paleta.fucsia.base} />
            </View>
          ) : (
            <ClayButton
              title="Conectar con GitHub"
              onPress={() => void signIn()}
              colors={clay.fucsia}
              textColor="#FFFFFF"
              pixel={false}
              accessibilityLabel="Conectar con GitHub"
              icon={
                <Image
                  source={require('../../assets/github-icon.webp')}
                  style={{ width: 22, height: 22, resizeMode: 'contain' }}
                />
              }
            />
          )}
          <Text style={{ fontSize: 11, color: clay.textoTenue, textAlign: 'center' }}>
            Autoriza tu cuenta para sincronizar tus proyectos.
          </Text>
        </View>
      </View>
    </ClayBackground>
  );
}
