import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function Home() {
  // TODO: reemplazar con datos reales desde el backend (GitHub API / webhook)
  const mascota = {
    nombre: 'Nodex',
    imagen: require('../assets/mascota.png'),
  };
  const monedas = 240;

  return (
    <View style={styles.outer}>
      <View style={styles.frame}>
        <View style={styles.coinsBadge}>
          <Text style={styles.coinsText}>🪙 {monedas}</Text>
        </View>

        <View style={styles.mascotaWrap}>
          <Image source={mascota.imagen} style={styles.mascotaImage} resizeMode="contain" />
          <View style={styles.shadow} />
        </View>

        <Text style={styles.mascotaNombre}>{mascota.nombre}</Text>
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.secondaryButton} onPress={() => router.push('/store')}>
          <Text style={styles.secondaryButtonText}>Tienda de cosméticos</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  frame: {
    width: '100%',
    aspectRatio: 3 / 4,
    backgroundColor: '#809676',
    borderRadius: 4,
    borderWidth: 18,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  coinsBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  coinsText: {
    color: '#fff',
    fontWeight: '600',
  },
  mascotaWrap: {
    alignItems: 'center',
  },
  mascotaImage: {
    width: 180,
    height: 180,
  },
  shadow: {
    width: 100,
    height: 16,
    borderRadius: 50,
    backgroundColor: 'rgba(0,0,0,0.2)',
    marginTop: -8,
  },
  mascotaNombre: {
    color: '#0f0f0f',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 16,
  },
  mascotaInfo: {
    color: '#2e2e2e',
    fontSize: 13,
  },
  actions: {
    width: '100%',
  },
  primaryButton: {
    backgroundColor: '#809676',
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  primaryButtonText: {
    textAlign: 'center',
    fontWeight: '600',
    color: '#0f0f0f',
  },
  secondaryButton: {
    borderColor: '#809676',
    borderWidth: 1,
    paddingVertical: 14,
    borderRadius: 8,
  },
  secondaryButtonText: {
    textAlign: 'center',
    fontWeight: '600',
    color: '#809676',
  },
});