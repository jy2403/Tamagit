import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { PixelBackground } from '@/components/PixelBackground';
import { PixelBadge } from '@/components/PixelBadge';
import { PixelButton } from '@/components/PixelButton';
import { PixelCatSprite } from '@/components/PixelCatSprite';
import { colors, fonts, radii } from '@/theme/tokens';
import React from 'react';

export default function LoginScreen() {
  const { token, isLoading, signIn } = useAuth();

  if (token) {
    return <Redirect href="/projects" />;
  }

  return (
    <PixelBackground>
      <SafeAreaView style={styles.safe}>
        <View style={styles.top}>
          <PixelBadge tone="mint" style={styles.logoBadge} textStyle={styles.logoText}>
            TAMAGIT
          </PixelBadge>

          <View style={styles.petCard}>
            <PixelCatSprite color={colors.ink} cell={6} />
          </View>

          <Text style={styles.tagline}>
            Conecta tu GitHub y cría una mascota por cada proyecto.
          </Text>
        </View>

        <View style={styles.bottom}>
          {isLoading ? (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color={colors.mint} />
            </View>
          ) : (
            <PixelButton
              title="CONECTAR GITHUB"
              onPress={() => void signIn()}
              style={styles.button}
            />
          )}
          <Text style={styles.hint}>Se abre una ventana de GitHub para autorizar tu cuenta.</Text>
        </View>
      </SafeAreaView>
    </PixelBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    paddingHorizontal: 24,
  },
  top: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBadge: {
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: radii.sm,
  },
  logoText: {
    fontSize: 18,
    lineHeight: 22,
  },
  petCard: {
    marginTop: 40,
    width: 190,
    height: 190,
    borderRadius: radii.lg,
    backgroundColor: colors.mint,
    borderWidth: 4,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
  },
  tagline: {
    marginTop: 28,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.mintSoft,
    textAlign: 'center',
    maxWidth: 280,
  },
  bottom: {
    paddingBottom: 24,
    gap: 14,
  },
  loading: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  button: {
    width: '100%',
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.mintDark,
    textAlign: 'center',
  },
});
