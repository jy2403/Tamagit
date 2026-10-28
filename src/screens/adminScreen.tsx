import { Redirect, useRouter, type Href } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { ClayBackground } from '@/components/clay/ClayBackground';
import { ClayIconButton } from '@/components/clay/ClayIconButton';
import { ClaySurface } from '@/components/clay/ClaySurface';
import { IconoImagen, type NombreIcono } from '@/components/clay/IconoImagen';
import { clay, paleta, radios, sombras } from '@/estilos';

type AdminLinkProps = {
  href: Href;
  icon: NombreIcono;
  title: string;
  description: string;
};

function AdminLink({ href, icon, title, description }: AdminLinkProps) {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push(href)}
      accessibilityRole="button"
      accessibilityLabel={`${title}: ${description}`}
      style={({ pressed }) => [
        sombras.tarjeta,
        { borderRadius: radios.tarjeta },
        pressed ? { transform: [{ translateY: 2 }, { scale: 0.98 }] } : null,
      ]}>
      <ClaySurface
        colors={clay.blanco}
        radius={radios.tarjeta}
        border
        contentStyle={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 16,
          gap: 14,
        }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: 'rgba(64,32,42,0.06)',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <IconoImagen nombre={icon} size={22} tintColor={paleta.fucsia.base} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontSize: 16, fontWeight: '900', color: clay.texto }}>{title}</Text>
          <Text style={{ marginTop: 2, fontSize: 11, color: clay.textoSuave }}>
            {description}
          </Text>
        </View>
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: 'rgba(64,32,42,0.05)',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text style={{ fontSize: 14, fontWeight: '900', color: paleta.fucsia.base }}>→</Text>
        </View>
      </ClaySurface>
    </Pressable>
  );
}

export default function AdminScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const authStatus = useRequireAuth({ admin: true });

  if (authStatus === 'loading') {
    return (
      <ClayBackground>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={paleta.fucsia.base} />
        </View>
      </ClayBackground>
    );
  }

  if (authStatus === 'anonymous') return <Redirect href="/login" />;

  if (authStatus === 'forbidden') {
    return (
      <ClayBackground>
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
          <Text style={{ fontSize: 18, fontWeight: '900', color: clay.texto }}>Admin</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 10 }}>
          <Text style={{ textAlign: 'center', fontSize: 16, fontWeight: '800', color: clay.texto }}>
            No tienes permisos de administrador.
          </Text>
          <Text style={{ textAlign: 'center', fontSize: 12, color: clay.textoSuave }}>
            Contacta al administrador para obtener acceso.
          </Text>
        </View>
      </ClayBackground>
    );
  }

  return (
    <ClayBackground>
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
          <Text style={{ fontSize: 18, fontWeight: '900', color: clay.texto }}>
            Panel de administrador
          </Text>
          <Text style={{ fontSize: 10, color: clay.textoSuave }}>Gestión de contenidos y usuarios</Text>
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
        <Text
          style={{
            marginLeft: 4,
            fontSize: 10,
            fontWeight: '900',
            letterSpacing: 1.2,
            color: clay.textoTenue,
            textTransform: 'uppercase',
          }}>
          Gestión de contenido
        </Text>

        <View style={{ gap: 12 }}>
          <AdminLink
            href="/admin/items"
            icon="perchero"
            title="Items y cosméticos"
            description="Gestiona ropa y accesorios para mascotas"
          />
          <AdminLink
            href="/admin/foods"
            icon="hambre"
            title="Alimentos y comidas"
            description="Platillos para alimentar a las mascotas"
          />
          <AdminLink
            href="/admin/users"
            icon="usuario"
            title="Usuarios"
            description="Gestionar usuarios, roles y baneos"
          />
        </View>
      </ScrollView>
    </ClayBackground>
  );
}
