import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import type { Commit, Pet } from '@/lib/types';
import { PixelBackground } from '@/components/PixelBackground';
import { PixelBadge } from '@/components/PixelBadge';
import { PixelButton } from '@/components/PixelButton';
import { BackButton } from '@/components/BackButton';
import { ProgressRing } from '@/components/ProgressRing';
import { SpeechBubble, bubbleTextStyle } from '@/components/SpeechBubble';
import { PixelCatSprite } from '@/components/PixelCatSprite';
import { colors, fonts, radii } from '@/theme/tokens';

function petMessage(pet: Pet): string {
  if (pet.hunger >= 70) {
    return `Miau... tengo mucha hambre (${pet.hunger}). ¿Me das de comer, porfa?`;
  }
  if (pet.health <= 40) {
    return `No me siento muy bien (salud ${pet.health}). Cuídamelo, ¿sí?`;
  }
  if (pet.xp < 30) {
    return `¡Hola! Soy ${pet.name}, nivel ${pet.level}. ¡Entra mucho para que suba de nivel!`;
  }
  return `¡Mew! ${pet.name} al habla. Todo bien por aquí, sigue haciendo commits.`;
}

export default function ProjectDetailScreen() {
  const { id, fullName, name } = useLocalSearchParams<{
    id: string;
    fullName?: string;
    name?: string;
  }>();
  const { token } = useAuth();
  const router = useRouter();
  const [pet, setPet] = useState<Pet | null>(null);
  const [petLoading, setPetLoading] = useState(true);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [commitsLoading, setCommitsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pressedAction, setPressedAction] = useState<'feed' | 'train' | null>(null);

  useEffect(() => {
    if (!token) return;
    apiFetch<Pet>(`/projects/${id}/pet`, { token })
      .then(setPet)
      .catch(() => setPet(null))
      .finally(() => setPetLoading(false));
  }, [token, id]);

  useEffect(() => {
    if (!token || !fullName) return;
    apiFetch<Commit[]>(`/github/repos/${fullName}/commits`, { token })
      .then(setCommits)
      .catch(() => setCommits([]))
      .finally(() => setCommitsLoading(false));
  }, [token, fullName]);

  const createPet = useCallback(async () => {
    if (!token) return;
    setError(null);
    try {
      const data = await apiFetch<Pet>(`/projects/${id}/pet`, { token, method: 'POST', body: {} });
      setPet(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo crear la mascota');
    }
  }, [token, id]);

  const runAction = useCallback(
    async (action: 'feed' | 'train') => {
      if (!token || !pet) return;
      setError(null);
      setPressedAction(action);
      try {
        const body =
          action === 'feed' ? { hunger: Math.min(100, pet.hunger + 15) } : { xp: pet.xp + 10 };
        const data = await apiFetch<Pet>(`/pets/${pet.id}`, { token, method: 'PATCH', body });
        setPet(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'No se pudo actualizar a la mascota');
      } finally {
        setPressedAction(null);
      }
    },
    [token, pet]
  );

  if (!token) {
    return <Redirect href="/login" />;
  }

  const projectTitle = name || fullName || 'Proyecto';

  return (
    <PixelBackground showGlow>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <BackButton onPress={() => router.back()} />
          </View>

          <View style={styles.titleBlock}>
            <PixelBadge tone="dark" style={styles.projectBadge}>
              {`Proyecto: ${projectTitle}`}
            </PixelBadge>
          </View>

          <View style={styles.characterStage}>
            <View style={styles.characterFrame}>
              {petLoading ? (
                <ActivityIndicator color={colors.mint} />
              ) : pet?.imageUrl ? (
                <Image
                  source={{ uri: pet.imageUrl }}
                  style={styles.petImage}
                  resizeMode="contain"
                />
              ) : (
                <PixelCatSprite color={colors.mint} cell={9} />
              )}
            </View>

            {pet ? (
              <PixelBadge tone="dark" style={styles.petNameBadge}>
                {pet.name}
              </PixelBadge>
            ) : null}
            {pet ? (
              <PixelBadge tone="mint" style={styles.levelBadge}>
                {`NIVEL ${pet.level}`}
              </PixelBadge>
            ) : null}
          </View>

          {pet ? (
            <View style={styles.statsRow}>
              <ProgressRing label="SALUD" value={pet.health} />
              <ProgressRing label="HAMBRE" value={pet.hunger} />
              <ProgressRing label="XP" value={pet.xp} />
            </View>
          ) : null}

          {error ? (
            <Text style={styles.error} numberOfLines={2}>
              {error}
            </Text>
          ) : null}

          {pet ? (
            <>
              <SpeechBubble style={styles.bubble}>
                <Text style={bubbleTextStyle}>{petMessage(pet)}</Text>
              </SpeechBubble>

              <View style={styles.actionsRow}>
                <PixelButton
                  title="ALIMENTAR"
                  variant="secondary"
                  small
                  style={styles.actionButton}
                  onPress={() => void runAction('feed')}
                  disabled={pressedAction !== null}
                />
                <PixelButton
                  title="ENTRENAR"
                  variant="ghost"
                  small
                  style={styles.actionButton}
                  onPress={() => void runAction('train')}
                  disabled={pressedAction !== null}
                />
              </View>
            </>
          ) : petLoading ? null : (
            <SpeechBubble style={styles.bubble}>
              <Text style={bubbleTextStyle}>
                Este proyecto aún no tiene mascota. Crea una para empezar a cuidarla y verla crecer.
              </Text>
            </SpeechBubble>
          )}

          {!petLoading && !pet ? (
            <PixelButton
              title="CREAR MASCOTA"
              onPress={() => void createPet()}
              style={styles.createButton}
            />
          ) : null}

          {commitsLoading ? (
            <View style={styles.commitsBox}>
              <ActivityIndicator color={colors.mint} />
            </View>
          ) : null}

          {!commitsLoading && commits.length > 0 ? (
            <View style={styles.commitsBox}>
              <Text style={styles.commitsTitle}>COMMITS RECIENTES</Text>
              {commits.slice(0, 6).map((c) => (
                <View key={c.sha} style={styles.commitCard}>
                  <Text style={styles.commitMessage} numberOfLines={2}>
                    {c.message}
                  </Text>
                  <Text style={styles.commitAuthor}>{c.author}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {!commitsLoading && commits.length === 0 ? (
            <Text style={styles.noCommits}>Sin commits para mostrar.</Text>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </PixelBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingTop: 12,
    paddingBottom: 18,
  },
  titleBlock: {
    alignItems: 'center',
    marginBottom: 22,
  },
  projectBadge: {
    maxWidth: '100%',
    alignSelf: 'center',
  },
  characterStage: {
    alignItems: 'center',
    marginBottom: 24,
  },
  characterFrame: {
    width: 210,
    height: 210,
    borderRadius: 105,
    borderWidth: 4,
    borderColor: colors.mint,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 8,
  },
  petImage: {
    width: 178,
    height: 178,
  },
  petNameBadge: {
    marginTop: 16,
  },
  levelBadge: {
    marginTop: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingVertical: 6,
  },
  bubble: {
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    marginTop: 20,
  },
  actionButton: {
    flexGrow: 1,
    maxWidth: 160,
  },
  createButton: {
    marginTop: 20,
  },
  error: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: 8,
  },
  commitsBox: {
    marginTop: 32,
    gap: 10,
  },
  commitsTitle: {
    fontFamily: fonts.pixel,
    fontSize: 11,
    color: colors.mint,
    marginBottom: 2,
  },
  commitCard: {
    backgroundColor: colors.ink,
    borderWidth: 3,
    borderColor: colors.ink,
    borderRadius: radii.sm,
    padding: 12,
  },
  commitMessage: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.white,
  },
  commitAuthor: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.mintSoft,
    marginTop: 4,
  },
  noCommits: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.mintSoft,
    textAlign: 'center',
    marginTop: 28,
  },
});
