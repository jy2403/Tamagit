import { Redirect, useRouter } from 'expo-router';
import { ActivityIndicator, Image, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { ClayBackground } from '@/components/clay/ClayBackground';
import { ClayButton } from '@/components/clay/ClayButton';
import { ClayIconButton } from '@/components/clay/ClayIconButton';
import { ClayPill } from '@/components/clay/ClayPill';
import { ClaySurface } from '@/components/clay/ClaySurface';
import { IconoImagen } from '@/components/clay/IconoImagen';
import { clay, paleta, radios, sombras } from '@/estilos';

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const authStatus = useRequireAuth();
  const { profile, loading, error } = useProfile();

  if (authStatus === 'loading') {
    return (
      <ClayBackground>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={paleta.fucsia.base} />
        </View>
      </ClayBackground>
    );
  }

  if (authStatus === 'anonymous') {
    return <Redirect href="/login" />;
  }

  return (
    <ClayBackground>
      {/* Header con botón regresar y título */}
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 16,
          paddingBottom: 8,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}>
        <ClayIconButton
          icon="←"
          accessibilityLabel="Volver"
          onPress={() => router.back()}
          size={48}
        />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '900', color: clay.texto }}>Mi perfil</Text>
          <Text style={{ fontSize: 10, color: clay.textoSuave }}>Detalles de tu cuenta de GitHub</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom + 24, 36),
          gap: 14,
        }}
        showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={{ alignItems: 'center', paddingVertical: 10 }}>
            <ActivityIndicator color={paleta.fucsia.base} />
          </View>
        ) : null}

        {error ? (
          <View
            style={{
              backgroundColor: 'rgba(253, 19, 90, 0.1)',
              borderWidth: 1,
              borderColor: paleta.fucsia.claro,
              borderRadius: radios.chip,
              padding: 12,
            }}>
            <Text style={{ color: paleta.fucsia.base, fontSize: 12, textAlign: 'center' }}>
              {error}
            </Text>
          </View>
        ) : null}

        {/* Tarjeta de avatar y nombre */}
        <View style={sombras.tarjeta}>
          <ClaySurface colors={clay.blanco} radius={radios.tarjetaGrande} border contentStyle={{ padding: 20, alignItems: 'center' }}>
            <View
              style={{
                width: 88,
                height: 88,
                borderRadius: 44,
                overflow: 'hidden',
                backgroundColor: '#FFFFFF',
                borderWidth: 3,
                borderColor: paleta.rosa.claro,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              {profile?.avatarUrl ? (
                <Image
                  source={{ uri: profile.avatarUrl }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              ) : (
                <Image
                  source={require('../../assets/github-icon.webp')}
                  style={{ width: 54, height: 54 }}
                  resizeMode="contain"
                />
              )}
            </View>

            <Text style={{ marginTop: 12, fontSize: 18, fontWeight: '900', color: clay.texto }}>
              {profile?.name ?? profile?.githubUsername ?? 'Sin nombre'}
            </Text>

            {profile?.githubUsername ? (
              <View style={{ marginTop: 6 }}>
                <ClayPill
                  label={`@${profile.githubUsername}`}
                  colors={clay.vino}
                  textColor="#FFFFFF"
                />
              </View>
            ) : null}
          </ClaySurface>
        </View>

        {/* Datos del perfil */}
        <View style={sombras.tarjeta}>
          <ClaySurface colors={clay.blanco} radius={radios.tarjeta} border contentStyle={{ padding: 16, gap: 10 }}>
            <ProfileRow label="Email" value={profile?.email ?? '—'} />
            <ProfileRow label="Usuario GitHub" value={profile?.githubUsername ?? '—'} />
            <ProfileRow label="Nombre completo" value={profile?.name ?? '—'} />
            <ProfileRow
              label="ID de GitHub"
              value={profile?.githubId != null ? String(profile.githubId) : '—'}
            />
            <ProfileRow label="Miembro desde" value={formatDate(profile?.createdAt)} isLast />
          </ClaySurface>
        </View>

        {/* Botón cerrar sesión */}
        <View style={{ marginTop: 6 }}>
          <ClayButton
            title="Cerrar sesión"
            colors={clay.fondoClaro}
            textColor={paleta.fucsia.base}
            pixel={false}
            onPress={() => void signOut()}
            icon={<IconoImagen nombre="salir" size={20} tintColor={paleta.fucsia.base} />}
          />
        </View>
      </ScrollView>
    </ClayBackground>
  );
}

function ProfileRow({ label, value, isLast = false }: { label: string; value: string; isLast?: boolean }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: 'rgba(64,32,42,0.07)',
      }}>
      <Text style={{ fontSize: 11, fontWeight: '800', color: clay.textoSuave }}>{label}</Text>
      <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: '700', color: clay.texto }}>
        {value}
      </Text>
    </View>
  );
}

function formatDate(value?: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString();
}
