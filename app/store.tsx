import { View, Text, Image, Pressable, FlatList, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';

const cosmeticos = [
  { id: '1', nombre: 'Sombrero pixel', precio: 50, owned: false },
  { id: '2', nombre: 'Bufanda dev', precio: 80, owned: true },
  { id: '3', nombre: 'Lentes retro', precio: 60, owned: false },
  { id: '4', nombre: 'Capa git', precio: 120 , owned: false },
];

export default function Store() {
  const monedas = 240; // TODO: traer del estado global / backend

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cosméticos</Text>
        <View style={styles.coinsBadge}>
          <Text style={styles.coinsText}>🪙 {monedas}</Text>
        </View>
      </View>

      <FlatList
        data={cosmeticos}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>

            <Text style={styles.nombre} numberOfLines={1}>
              {item.nombre}
            </Text>

            {item.owned ? (
              <View style={styles.ownedButton}>
                <Text style={styles.ownedButtonText}>Equipar</Text>
              </View>
            ) : (
              <Pressable style={styles.buyButton} onPress={() => {/* TODO: comprar */}}>
                <Text style={styles.buyButtonText}>🪙 {item.precio}</Text>
              </Pressable>
            )}
          </View>
        )}
      />
    </View>
  );
}

const CARD_BG = '#1a1a1a';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  coinsBadge: {
    backgroundColor: CARD_BG,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  coinsText: {
    color: '#fff',
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  row: {
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  imageSlot: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#809676',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  image: {
    width: '70%',
    height: '70%',
  },
  nombre: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  buyButton: {
    backgroundColor: '#809676',
    paddingVertical: 8,
    borderRadius: 8,
    width: '100%',
  },
  buyButtonText: {
    textAlign: 'center',
    color: '#0f0f0f',
    fontWeight: '700',
  },
  ownedButton: {
    borderColor: '#809676',
    borderWidth: 1,
    paddingVertical: 8,
    borderRadius: 8,
    width: '100%',
  },
  ownedButtonText: {
    textAlign: 'center',
    color: '#809676',
    fontWeight: '700',
  },
});