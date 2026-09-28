import { Drawer } from 'expo-router/drawer';

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        swipeEnabled: true,
        drawerStyle: { backgroundColor: '#1a1a1a', width: 260 },
        drawerActiveTintColor: '#a78bfa',
        drawerInactiveTintColor: '#e5e5e5',
        drawerActiveBackgroundColor: '#2a2a2a',
        drawerLabelStyle: { fontSize: 14, fontFamily: 'PressStart2P_400Regular' },
      }}>
      <Drawer.Screen name="projects" options={{ title: 'Proyectos' }} />
      <Drawer.Screen name="profile" options={{ title: 'Perfil' }} />
      <Drawer.Screen name="admin" options={{ title: 'Admin' }} />
    </Drawer>
  );
}
