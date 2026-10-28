import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native';
import { DrawerContentScrollView, type DrawerContentComponentProps } from 'expo-router/drawer';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { ClayPill } from '@/components/clay/ClayPill';
import { ClaySurface } from '@/components/clay/ClaySurface';
import { clay, radios, sombras } from '@/estilos';

type ItemProps = {
  icon: string;
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
        { borderRadius: radios.chip, marginBottom: 10 },
        pressed ? { transform: [{ scale: 0.98 }] } : null,
      ]}>
      <ClaySurface
        colors={active ? clay.violeta : clay.fondoClaro}
        radius={radios.chip}
        shadow={active ? 'boton' : 'suave'}
        contentStyle={{
          minHeight: 52,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingHorizontal: 14,
        }}>
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: active ? 'rgba(255,255,255,0.2)' : '#EFEFF3',
          }}>
          <Text style={{ fontSize: 17 }}>{icon}</Text>
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
  const { user, token, signOut } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const activeRoute = props.state.routeNames[props.state.index];
  const role = user?.isAdmin ? 'Administrador' : 'Programador';

  const go = (route: string) => {
    props.navigation.navigate(route);
    props.navigation.closeDrawer();
  };

  const sync = async () => {
    if (!token || syncing) return;
    setSyncing(true);
    setMensaje(null);
    try {
      await apiFetch('/projects/sync', { token, method: 'POST', body: {} });
      setMensaje('Repositorios sincronizados.');
      go('projects');
    } catch (error) {
      setMensaje(error instanceof Error ? error.message : 'No se pudo sincronizar');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 14, paddingTop: 8 }}>
      <View style={sombras.suave}>
        <ClaySurface
          colors={clay.fondoClaro}
          radius={radios.tarjeta}
          contentStyle={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View
              style={{
                width: 54,
                height: 54,
                borderRadius: 27,
                overflow: 'hidden',
                backgroundColor: '#FFFFFF',
                borderWidth: 2,
                borderColor: '#FFFFFF',
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
                  colors={clay.negro}
                  textColor="#FFFFFF"
                  accessibilityLabel={`Rol: ${role}`}
                />
              </View>
            </View>
          </View>
        </ClaySurface>
      </View>

      <View style={{ marginTop: 22, gap: 2 }}>
        <Text
          style={{
            marginBottom: 8,
            marginLeft: 6,
            fontSize: 10,
            fontWeight: '900',
            letterSpacing: 1.4,
            color: clay.textoTenue,
            textTransform: 'uppercase',
          }}>
          Navegación
        </Text>
        <Item
          icon="🏠"
          label="Inicio"
          active={activeRoute === 'projects'}
          onPress={() => go('projects')}
        />
        <Item
          icon="👤"
          label="Mi perfil"
          active={activeRoute === 'profile'}
          onPress={() => go('profile')}
        />
        <Pressable
          onPress={() => void sync()}
          disabled={syncing}
          accessibilityRole="button"
          accessibilityLabel="Sincronizar repositorios de GitHub"
          accessibilityState={{ disabled: syncing }}
          style={({ pressed }) => [
            { borderRadius: radios.chip, marginBottom: 10 },
            pressed && !syncing ? { transform: [{ scale: 0.98 }] } : null,
          ]}>
          <ClaySurface
            colors={clay.menta}
            radius={radios.chip}
            shadow="suave"
            contentStyle={{
              minHeight: 52,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              paddingHorizontal: 14,
            }}>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255,255,255,0.35)',
              }}>
              {syncing ? (
                <ActivityIndicator size="small" color={clay.texto} />
              ) : (
                <Text style={{ fontSize: 17 }}>🔄</Text>
              )}
            </View>
            <Text style={{ flex: 1, color: clay.texto, fontSize: 15, fontWeight: '800' }}>
              {syncing ? 'Sincronizando…' : 'Sincronizar GitHub'}
            </Text>
          </ClaySurface>
        </Pressable>
        {mensaje ? (
          <Text
            style={{
              marginBottom: 10,
              marginHorizontal: 6,
              fontSize: 11,
              lineHeight: 15,
              color: clay.textoSuave,
            }}>
            {mensaje}
          </Text>
        ) : null}
      </View>

      {user?.isAdmin ? (
        <View style={{ marginTop: 18 }}>
          <View
            style={{
              height: 1,
              backgroundColor: '#C9C9D0',
              marginHorizontal: 8,
              marginBottom: 16,
            }}
          />
          <Text
            style={{
              marginBottom: 8,
              marginLeft: 6,
              fontSize: 10,
              fontWeight: '900',
              letterSpacing: 1.4,
              color: clay.textoTenue,
              textTransform: 'uppercase',
            }}>
            Administración
          </Text>
          <Item
            icon="🛠️"
            label="Panel de administrador"
            active={activeRoute === 'admin'}
            onPress={() => go('admin')}
          />
        </View>
      ) : null}

      <View style={{ flex: 1 }} />

      <Pressable
        onPress={() => void signOut()}
        accessibilityRole="button"
        accessibilityLabel="Cerrar sesión"
        style={({ pressed }) => [
          { borderRadius: radios.chip, marginTop: 16, marginBottom: 8 },
          pressed ? { transform: [{ scale: 0.98 }] } : null,
        ]}>
        <ClaySurface
          colors={clay.fondoClaro}
          radius={radios.chip}
          shadow="suave"
          contentStyle={{
            minHeight: 50,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            paddingHorizontal: 14,
          }}>
          <Text style={{ fontSize: 17 }}>🚪</Text>
          <Text style={{ flex: 1, color: '#B4221B', fontSize: 14, fontWeight: '800' }}>
            Cerrar sesión
          </Text>
        </ClaySurface>
      </Pressable>
    </DrawerContentScrollView>
  );
}
