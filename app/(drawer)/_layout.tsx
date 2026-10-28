import { Drawer } from 'expo-router/drawer';
import { ClayDrawerContent } from '@/components/clay/ClayDrawerContent';
import { clay } from '@/estilos';

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={(props) => <ClayDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        swipeEnabled: true,
        drawerStyle: { backgroundColor: clay.fondo[0], width: 286 },
        drawerActiveTintColor: clay.texto,
        drawerInactiveTintColor: clay.texto,
        overlayColor: 'rgba(20,20,22,0.38)',
      }}>
      <Drawer.Screen name="projects" options={{ title: 'Inicio' }} />
      <Drawer.Screen name="profile" options={{ title: 'Mi perfil' }} />
      <Drawer.Screen name="admin" options={{ title: 'Admin' }} />
    </Drawer>
  );
}
