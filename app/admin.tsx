import { Redirect, useRouter, type Href } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';

type AdminLinkProps = {
  href: Href;
  icon: string;
  title: string;
  description: string;
};

function AdminLink({ href, icon, title, description }: AdminLinkProps) {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push(href)}
      className="flex-row items-center rounded-2xl border border-neutral-800 bg-neutral-900 p-4 active:bg-neutral-800">
      <View className="mr-3 h-11 w-11 items-center justify-center rounded-full bg-white/10">
        <Text className="text-xl">{icon}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-white">{title}</Text>
        <Text className="text-xs text-neutral-400">{description}</Text>
      </View>
      <Text className="text-sm text-emerald-400">Ver</Text>
    </Pressable>
  );
}

export default function AdminScreen() {
  const { token, user, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-950">
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  if (!token) {
    return <Redirect href="/login" />;
  }

  if (!user?.isAdmin) {
    return (
      <View className="flex-1 bg-neutral-950">
        <View className="flex-row items-center px-5 pb-3 pt-16">
          <Pressable onPress={() => router.back()} className="pr-4">
            <Text className="text-emerald-400">Atras</Text>
          </Pressable>
          <Text className="flex-1 text-2xl font-bold text-white">Admin</Text>
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-lg text-neutral-400">
            No tienes permisos de administrador.
          </Text>
          <Text className="mt-2 text-center text-sm text-neutral-500">
            Contacta al administrador para obtener acceso.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-neutral-950">
      <View className="flex-row items-center px-5 pb-3 pt-16">
        <Pressable onPress={() => router.back()} className="pr-4">
          <Text className="text-emerald-400">Atras</Text>
        </Pressable>
        <Text className="flex-1 text-2xl font-bold text-white">Admin</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 20 }}>
        <View>
          <Text className="mb-2 text-lg font-semibold text-white">Gestión de contenido</Text>
          <View className="gap-2">
            <AdminLink
              href="/admin/items"
              icon="🎩"
              title="Items"
              description="Cosméticos para las mascotas"
            />
            <AdminLink
              href="/admin/foods"
              icon="🍎"
              title="Comidas"
              description="Alimentos para las mascotas"
            />
            <AdminLink
              href="/admin/users"
              icon="👤"
              title="Usuarios"
              description="Gestionar usuarios y baneos"
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
