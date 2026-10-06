import { Redirect, useRouter, type Href } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { pantalla, tarjeta, tipografia } from '@/estilos';

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
      className={`flex-row items-center ${tarjeta.presionable}`}>
      <View className="mr-3 h-11 w-11 items-center justify-center rounded-full bg-white/10">
        <Text className="text-xl">{icon}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-white">{title}</Text>
        <Text className={tipografia.subtitulo}>{description}</Text>
      </View>
      <Text className={tipografia.enlace}>Ver</Text>
    </Pressable>
  );
}

export default function AdminScreen() {
  const { token, user, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <View className={pantalla.rootCentered}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  if (!token) return <Redirect href="/login" />;

  if (!user?.isAdmin) {
    return (
      <View className={pantalla.root}>
        <View className={pantalla.header}>
          <Pressable onPress={() => router.back()} className="pr-4">
            <Text className={tipografia.enlace}>Atras</Text>
          </Pressable>
          <Text className={tipografia.titulo}>Admin</Text>
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
    <View className={pantalla.root}>
      <View className={pantalla.header}>
        <Pressable onPress={() => router.back()} className="pr-4">
          <Text className={tipografia.enlace}>Atras</Text>
        </Pressable>
        <Text className={tipografia.titulo}>Admin</Text>
      </View>

      <ScrollView contentContainerStyle={pantalla.contenido}>
        <View>
          <Text className="mb-2 text-lg font-semibold text-white">Gestión de contenido</Text>
          <View className="gap-2">
            <AdminLink href="/admin/items" icon="🎩" title="Items" description="Cosméticos para las mascotas" />
            <AdminLink href="/admin/foods" icon="🍎" title="Comidas" description="Alimentos para las mascotas" />
            <AdminLink href="/admin/users" icon="👤" title="Usuarios" description="Gestionar usuarios y baneos" />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}