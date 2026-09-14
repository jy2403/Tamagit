import { Redirect, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import type { User } from '@/lib/types';
import { Button } from '@/layout/Button';

export default function ProfileScreen() {
  const { token, user, signOut, isLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<User | null>(user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    apiFetch<User>('/users/me', { token })
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'No se pudo cargar tu perfil');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

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

  return (
    <View className="flex-1 bg-neutral-950">
      <View className="flex-row items-center px-5 pb-3 pt-16">
        <Pressable onPress={() => router.back()} className="pr-4">
          <Text className="text-emerald-400">Atras</Text>
        </Pressable>
        <Text className="flex-1 text-2xl font-bold text-white">Mi perfil</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 20 }}>
        {loading ? (
          <View className="items-center py-4">
            <ActivityIndicator color="#10b981" />
          </View>
        ) : null}

        {error ? <Text className="text-sm text-red-400">{error}</Text> : null}

        <View className="items-center rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
          <View className="h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-white/10">
            {profile?.avatarUrl ? (
              <Image
                source={{ uri: profile.avatarUrl }}
                className="h-full w-full"
                resizeMode="cover"
              />
            ) : (
              <Text className="text-5xl">🐙</Text>
            )}
          </View>
          <Text className="mt-4 text-xl font-bold text-white">
            {profile?.name ?? profile?.githubUsername ?? 'Sin nombre'}
          </Text>
          {profile?.githubUsername ? (
            <Text className="mt-1 text-sm text-emerald-400">@{profile.githubUsername}</Text>
          ) : null}
        </View>

        <View className="gap-2 rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
          <Row label="Email" value={profile?.email ?? '—'} />
          <Row label="Usuario GitHub" value={profile?.githubUsername ?? '—'} />
          <Row label="Nombre" value={profile?.name ?? '—'} />
          <Row
            label="ID de GitHub"
            value={profile?.githubId != null ? String(profile.githubId) : '—'}
          />
          <Row label="Miembro desde" value={formatDate(profile?.createdAt)} />
        </View>

        <Button title="Cerrar sesión" onPress={() => void signOut()} variant="secondary" />
      </ScrollView>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between border-b border-neutral-800 py-2 last:border-b-0">
      <Text className="text-sm text-neutral-400">{label}</Text>
      <Text className="ml-4 text-sm text-white" numberOfLines={1}>
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
