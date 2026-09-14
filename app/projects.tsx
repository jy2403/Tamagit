import { Redirect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import type { Project } from '@/lib/types';
import { PixelBackground } from '@/components/PixelBackground';
import { PixelButton } from '@/components/PixelButton';
import { PixelCatSprite } from '@/components/PixelCatSprite';
import { colors, fonts, radii } from '@/theme/tokens';

export default function ProjectsScreen() {
  const { token, user, signOut, isLoading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    if (!token) return [] as Project[];
    return apiFetch<Project[]>('/projects', { token });
  }, [token]);

  const applyProjects = useCallback((data: Project[]) => {
    setProjects(data);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!token) return;
    fetchProjects()
      .then(applyProjects)
      .catch((e) => {
        setError(e instanceof Error ? e.message : 'No se pudieron cargar los proyectos');
        setLoading(false);
      });
  }, [token, fetchProjects, applyProjects]);

  const sync = useCallback(async () => {
    if (!token) return;
    setSyncing(true);
    setError(null);
    try {
      await apiFetch('/projects/sync', { token, method: 'POST', body: {} });
      const data = await fetchProjects();
      applyProjects(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo sincronizar');
    } finally {
      setSyncing(false);
    }
  }, [token, fetchProjects, applyProjects]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProjects()
      .then(applyProjects)
      .catch((e) => {
        setError(e instanceof Error ? e.message : 'No se pudieron cargar los proyectos');
      })
      .finally(() => setRefreshing(false));
  }, [fetchProjects, applyProjects]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.mint} />
      </View>
    );
  }

  if (!token) {
    return <Redirect href="/login" />;
  }

  const firstPet = projects.find((p) => p.pet)?.pet;

  return (
    <PixelBackground>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>MIS PROYECTOS</Text>
            <Text style={styles.subtitle}>
              {user?.githubUsername ? `@${user.githubUsername}` : 'Conectado con GitHub'}
            </Text>
          </View>
          <Pressable
            onPress={() => void signOut()}
            style={({ pressed }) => [styles.signOut, pressed && styles.pressed]}>
            <Text style={styles.signOutText}>SALIR</Text>
          </Pressable>
        </View>

        {firstPet ? (
          <View style={styles.featuredCard}>
            <View style={styles.featuredSprite}>
              {firstPet.imageUrl ? (
                <Image
                  source={{ uri: firstPet.imageUrl }}
                  style={styles.featuredImage}
                  resizeMode="contain"
                />
              ) : (
                <PixelCatSprite color={colors.mint} cell={5} />
              )}
            </View>
            <View style={styles.featuredInfo}>
              <Text style={styles.featuredName}>{firstPet.name}</Text>
              <Text style={styles.featuredMeta}>
                {firstPet.species} · Nivel {firstPet.level}
              </Text>
            </View>
          </View>
        ) : null}

        <View style={styles.syncRow}>
          <PixelButton
            title={syncing ? 'SINCRONIZANDO...' : 'SINCRONIZAR GITHUB'}
            small
            onPress={() => void sync()}
            disabled={syncing}
            style={styles.syncButton}
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={colors.mint} />
          </View>
        ) : (
          <FlatList
            data={projects}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.mint}
              />
            }
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyText}>
                  Aún no hay proyectos. Presiona Sincronizar GitHub para empezar.
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                onPress={() =>
                  router.push({
                    pathname: '/project/[id]',
                    params: { id: String(item.id), fullName: item.fullName ?? '', name: item.name },
                  })
                }>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  {item.mainLanguage ? (
                    <View style={styles.languageChip}>
                      <Text style={styles.languageText}>{item.mainLanguage}</Text>
                    </View>
                  ) : null}
                </View>
                {item.fullName ? (
                  <Text style={styles.cardFullName} numberOfLines={1}>
                    {item.fullName}
                  </Text>
                ) : null}

                {item.tools.length > 0 ? (
                  <View style={styles.toolsRow}>
                    {item.tools.slice(0, 4).map((tool) => (
                      <View key={tool} style={styles.toolChip}>
                        <Text style={styles.toolText}>{tool}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}

                <View style={styles.cardFooter}>
                  {item.pet ? (
                    <Text style={styles.cardPet}>
                      {item.pet.name} · {item.pet.species} · Nivel {item.pet.level}
                    </Text>
                  ) : (
                    <Text style={styles.cardPetMuted}>Sin mascota aún</Text>
                  )}
                  <Text style={styles.cardCta}>VER MÁS →</Text>
                </View>
              </Pressable>
            )}
          />
        )}
      </SafeAreaView>
    </PixelBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerText: {
    flexShrink: 1,
  },
  title: {
    fontFamily: fonts.pixel,
    fontSize: 16,
    color: colors.white,
  },
  subtitle: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.mint,
    marginTop: 6,
  },
  signOut: {
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: radii.sm,
    backgroundColor: colors.ink,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  signOutText: {
    fontFamily: fonts.pixel,
    fontSize: 10,
    color: colors.mint,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ translateY: 1 }],
  },
  featuredCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 14,
    backgroundColor: colors.ink,
    borderWidth: 3,
    borderColor: colors.mint,
    borderRadius: radii.md,
    padding: 12,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 4,
  },
  featuredSprite: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.inkSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredImage: {
    width: 48,
    height: 48,
  },
  featuredInfo: {
    marginLeft: 12,
    flex: 1,
  },
  featuredName: {
    fontFamily: fonts.pixel,
    fontSize: 12,
    color: colors.white,
  },
  featuredMeta: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.mintSoft,
    marginTop: 5,
  },
  syncRow: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  syncButton: {
    alignSelf: 'flex-start',
  },
  error: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.danger,
    paddingHorizontal: 20,
    marginBottom: 6,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.mintSoft,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.ink,
    borderWidth: 3,
    borderColor: colors.ink,
    borderRadius: radii.md,
    padding: 14,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 4,
  },
  cardPressed: {
    backgroundColor: colors.inkSoft,
    transform: [{ translateY: 1 }],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardName: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.white,
    flexShrink: 1,
  },
  languageChip: {
    backgroundColor: colors.mint,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  languageText: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: colors.ink,
  },
  cardFullName: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.mintSoft,
    marginTop: 4,
  },
  toolsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  toolChip: {
    backgroundColor: colors.inkSoft,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  toolText: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    color: colors.dialog,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 8,
  },
  cardPet: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.white,
    flexShrink: 1,
  },
  cardPetMuted: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.mintDark,
  },
  cardCta: {
    fontFamily: fonts.pixel,
    fontSize: 9,
    color: colors.mint,
  },
});
