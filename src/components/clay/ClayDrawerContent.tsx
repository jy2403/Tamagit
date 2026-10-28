import { Image, Pressable, Text, View } from 'react-native';
import { DrawerContentScrollView, type DrawerContentComponentProps } from 'expo-router/drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { ClayPill } from '@/components/clay/ClayPill';
import { ClaySurface } from '@/components/clay/ClaySurface';
import { IconoImagen, type NombreIcono } from '@/components/clay/IconoImagen';
import { clay, paleta, radios, sombras } from '@/estilos';

type ItemProps = {
  icon: NombreIcono;
  label: string;
  active?: boolean;
  onPress: () => void;
};

function Item({ icon, label, active = false, onPress }: ItemProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [
        { borderRadius: radios.chip, marginBottom: 14 },
        pressed ? { transform: [{ translateY: 2 }, { scale: 0.98 }] } : null,
      ]}>
      <ClaySurface
        colors={active ? clay.fucsia : clay.fondoClaro}
        radius={radios.chip}
        shadow={active ? 'boton' : 'suave'}
        border
        contentStyle={{
          minHeight: 52,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
          paddingHorizontal: 16,
        }}>
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: 17,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: active ? 'rgba(255,255,255,0.22)' : 'rgba(64,32,42,0.06)',
          }}>
          <IconoImagen
            nombre={icon}
            size={19}
            tintColor={active ? '#FFFFFF' : clay.texto}
          />
        </View>
        <Text
          style={{
            flex: 1,
            color: active ? '#FFFFFF' : clay.texto,
            fontSize: 15,
            fontWeight: '800',
          }}>
          {label}
        </Text>
      </ClaySurface>
    </Pressable>
  );
}

export function ClayDrawerContent(props: DrawerContentComponentProps) {
  const { user, signOut } = useAuth();
  const insets = useSafeAreaInsets();

  const activeRoute = props.state.routeNames[props.state.index];
  const role = user?.isAdmin ? 'Administrador' : 'Programador';

  const go = (route: string) => {
    props.navigation.navigate(route);
    props.navigation.closeDrawer();
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{
        flexGrow: 1,
        paddingHorizontal: 16,
        paddingTop: insets.top + 16,
        paddingBottom: Math.max(insets.bottom + 16, 24),
      }}>
      {/* Encabezado de perfil: pulsable para llevar a la pantalla de perfil */}
      <Pressable
        onPress={() => go('profile')}
        accessibilityRole="button"
        accessibilityLabel="Ver mi perfil"
        style={({ pressed }) => [
          sombras.tarjeta,
          { borderRadius: radios.tarjeta, marginBottom: 22 },
          pressed ? { opacity: 0.88, transform: [{ scale: 0.98 }] } : null,
        ]}>
        <ClaySurface colors={clay.blanco} radius={radios.tarjeta} border contentStyle={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                overflow: 'hidden',
                backgroundColor: '#FFFFFF',
                borderWidth: 2,
                borderColor: paleta.rosa.claro,
              }}>
              {user?.avatarUrl ? (
                <Image
                  source={{ uri: user.avatarUrl }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              ) : (
                <Image
                  source={require('../../../assets/github-icon.webp')}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="contain"
                />
              )}
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text
                numberOfLines={1}
                style={{ fontSize: 16, fontWeight: '900', color: clay.texto }}>
                {user?.name ?? user?.githubUsername ?? 'TamaGit'}
              </Text>
              <View style={{ alignSelf: 'flex-start', marginTop: 5 }}>
                <ClayPill
                  label={role}
                  colors={clay.vino}
                  textColor="#FFFFFF"
                  accessibilityLabel={`Rol: ${role}`}
                />
              </View>
            </View>
          </View>
        </ClaySurface>
      </Pressable>

      {/* Botones de navegación separados entre sí */}
      <View style={{ gap: 2 }}>
        <Text
          style={{
            marginBottom: 10,
            marginLeft: 6,
            fontSize: 10,
            fontWeight: '900',
            letterSpacing: 1.2,
            color: clay.textoTenue,
            textTransform: 'uppercase',
          }}>
          Navegación
        </Text>
        <Item
          icon="home"
          label="Inicio"
          active={activeRoute === 'projects'}
          onPress={() => go('projects')}
        />
        <Item
          icon="usuario"
          label="Mi perfil"
          active={activeRoute === 'profile'}
          onPress={() => go('profile')}
        />
      </View>

      {/* Panel de administrador al final */}
      {user?.isAdmin ? (
        <View style={{ marginTop: 12 }}>
          <View
            style={{
              height: 1,
              backgroundColor: 'rgba(64,32,42,0.1)',
              marginHorizontal: 8,
              marginBottom: 16,
            }}
          />
          <Text
            style={{
              marginBottom: 10,
              marginLeft: 6,
              fontSize: 10,
              fontWeight: '900',
              letterSpacing: 1.2,
              color: clay.textoTenue,
              textTransform: 'uppercase',
            }}>
            Administración
          </Text>
          <Item
            icon="engranaje"
            label="Panel de administrador"
            active={activeRoute === 'admin'}
            onPress={() => go('admin')}
          />
        </View>
      ) : null}

      <View style={{ flex: 1 }} />

      {/* Cerrar sesión: texto centrado y botón con ícono de assets */}
      <Pressable
        onPress={() => void signOut()}
        accessibilityRole="button"
        accessibilityLabel="Cerrar sesión"
        style={({ pressed }) => [
          sombras.suave,
          { borderRadius: radios.chip, marginTop: 18 },
          pressed ? { transform: [{ translateY: 2 }, { scale: 0.98 }] } : null,
        ]}>
        <ClaySurface
          colors={clay.fondoClaro}
          radius={radios.chip}
          border
          contentStyle={{
            minHeight: 50,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            paddingHorizontal: 16,
          }}>
          <IconoImagen nombre="salir" size={19} tintColor={paleta.fucsia.base} />
          <Text style={{ color: paleta.fucsia.base, fontSize: 14, fontWeight: '800' }}>
            Cerrar sesión
          </Text>
        </ClaySurface>
      </Pressable>
    </DrawerContentScrollView>
  );
}
