import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { PixelBackground } from '@/components/PixelBackground';
import { PixelBadge } from '@/components/PixelBadge';
import { PixelButton } from '@/components/PixelButton';
import { PixelCatSprite } from '@/components/PixelCatSprite';
import { colors, radii } from '@/theme/tokens';
import React from 'react';

export default function LandingScreen() {
  const router = useRouter();
  const { token } = useAuth();

  const start = () => {
    router.replace(token ? '/projects' : '/login');
  };

  return (
    <PixelBackground>
      <View style={styles.container}>
        <PixelBadge tone="mint" style={styles.logoBadge} textStyle={styles.logoText}>
          TAMAGIT
        </PixelBadge>

        <View style={styles.petCard}>
          <PixelCatSprite color={colors.white} cell={8} />
        </View>

        <PixelButton title="START" onPress={start} style={styles.startButton} />
      </View>
    </PixelBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoBadge: {
    paddingHorizontal: 26,
    paddingVertical: 16,
    borderRadius: radii.md,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 0,
  },
  logoText: {
    fontSize: 20,
    lineHeight: 24,
  },
  petCard: {
    marginTop: 48,
    marginBottom: 56,
    width: 254,
    height: 254,
    borderRadius: radii.xl,
    backgroundColor: colors.mint,
    borderWidth: 4,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 4,
    elevation: 6,
  },
  startButton: {
    width: 220,
    borderRadius: radii.md,
  },
});
