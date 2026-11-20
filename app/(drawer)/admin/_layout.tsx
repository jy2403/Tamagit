import { Stack } from 'expo-router';
import { clay } from '@/estilos';

// Own stack so back navigation between admin screens returns to the previous admin
// screen instead of falling back to the drawer's first route (home).
export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: clay.fondo[0] },
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="items" />
      <Stack.Screen name="foods" />
      <Stack.Screen name="users" />
      <Stack.Screen name="users/[id]" />
      <Stack.Screen name="pets/[petId]" />
    </Stack>
  );
}
