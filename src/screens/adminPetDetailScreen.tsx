import { Redirect, useLocalSearchParams } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { ReasonPrompt } from '@/components/ReasonPrompt';
import { ClayBackground } from '@/components/clay/ClayBackground';
import { ClayButton } from '@/components/clay/ClayButton';
import { ClayHeader } from '@/components/clay/ClayHeader';
import { ClayIconButton } from '@/components/clay/ClayIconButton';
import { ClayPill } from '@/components/clay/ClayPill';
import { ClayRow } from '@/components/clay/ClayRow';
import {
  ClayEmptyState,
  ClayErrorState,
  ClayForbiddenScreen,
  ClayLoadingScreen,
} from '@/components/clay/ClayStates';
import { ClaySurface } from '@/components/clay/ClaySurface';
import { useAdminPet, usePetItems } from '@/hooks/useAdminPet';
import { useReasonedAction } from '@/hooks/useReasonedAction';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { apiFetch } from '@/lib/api';
import { clay, fuentes, radios, sombras, textoClay } from '@/estilos';

// imageUrl de los items puede ser un emoji o una URL; solo los textos cortos se pintan como glifo.
const itemGlyph = (imageUrl: string | null) => (imageUrl && imageUrl.length <= 4 ? imageUrl : '🎁');

export default function AdminPetDetailScreen() {
  const { petId } = useLocalSearchParams<{ petId: string }>();
  const { token } = useAuth();
  const insets = useSafeAreaInsets();
  const { pet, loading, error, load, deletePet } = useAdminPet(petId);
  const { pickerOpen, catalog, catalogLoading, openPicker, closePicker, addItem } = usePetItems(
    petId,
    load
  );
  const { prompt, submitting, start, cancel, confirm } = useReasonedAction();
  const authStatus = useRequireAuth({ admin: true, extraLoading: loading });

  const confirmWithReason = async (reason: string) => {
    if (!token || !petId || !prompt) return;
    const r = reason || 'Sin motivo indicado';
    await confirm(async () => {
      if (prompt.kind === 'removeItem' && prompt.itemId) {
        await apiFetch(`/pets/${petId}/items/${prompt.itemId}`, {
          token,
          method: 'DELETE',
          body: { reason: r },
        });
        await load();
      } else if (prompt.kind === 'deletePet') {
        await deletePet(r);
      }
    });
  };

  if (authStatus === 'loading') return <ClayLoadingScreen />;
  if (authStatus === 'anonymous') return <Redirect href="/login" />;
  if (authStatus === 'forbidden') return <ClayForbiddenScreen title="Mascota" />;

  return (
    <ClayBackground>
      <ClayHeader title={pet?.name ?? 'Mascota'} subtitle="Gestión de mascota" />

      {error ? (
        <ClayErrorState message={error} onRetry={() => void load()} />
      ) : pet ? (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: Math.max(insets.bottom + 24, 36),
            gap: 14,
          }}
          showsVerticalScrollIndicator={false}>
          <View style={sombras.tarjeta}>
            <ClaySurface
              colors={clay.blanco}
              radius={radios.tarjetaGrande}
              border
              contentStyle={{ padding: 16, gap: 10 }}>
              <Text style={{ fontSize: 15, fontWeight: '900', color: clay.texto }}>Mascota</Text>
              <View>
                <Text style={{ fontSize: 12, color: clay.textoSuave }}>Especie: {pet.species}</Text>
                <Text style={{ fontSize: 12, color: clay.textoSuave }}>
                  Proyecto: {pet.project.name}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                <ClayPill
                  label={`${pet.health} salud`}
                  colors={clay.fondoClaro}
                  textColor={clay.texto}
                />
                <ClayPill
                  label={`${pet.hunger} hambre`}
                  colors={clay.fondoClaro}
                  textColor={clay.texto}
                />
                <ClayPill
                  label={`felicidad ${pet.happiness}`}
                  colors={clay.fondoClaro}
                  textColor={clay.texto}
                />
                <ClayPill
                  label={`rama ${pet.lifeBranch}`}
                  colors={clay.fondoClaro}
                  textColor={clay.texto}
                />
              </View>
              <ClayButton
                title="Eliminar mascota"
                onPress={() => start({ kind: 'deletePet' })}
                colors={clay.rojo}
                pixel={false}
                size="md"
              />
            </ClaySurface>
          </View>

          <View style={{ gap: 12 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <Text style={{ fontSize: 18, fontWeight: '900', color: clay.texto }}>
                Items ({pet.items.length})
              </Text>
              <ClayButton
                title="Añadir"
                onPress={() => void openPicker()}
                colors={clay.verde}
                textColor={clay.oscuro}
                pixel={false}
                size="md"
                style={{ alignSelf: 'center' }}
              />
            </View>

            {pet.items.length === 0 ? (
              <ClayEmptyState
                emoji="🎁"
                title="Esta mascota no tiene items."
                message="Usa «Añadir» para darle uno."
              />
            ) : (
              pet.items.map((pi) => (
                <ClayRow
                  key={pi.id}
                  icon={<Text style={{ fontSize: 22 }}>{itemGlyph(pi.item.imageUrl)}</Text>}
                  title={pi.item.name}
                  subtitle={`${pi.item.category ?? 'General'}${pi.quantity > 1 ? ` · x${pi.quantity}` : ''}`}
                  footer={
                    <ClayButton
                      title="Quitar"
                      onPress={() =>
                        start({ kind: 'removeItem', itemId: pi.itemId, itemName: pi.item.name })
                      }
                      colors={clay.rojo}
                      pixel={false}
                      size="md"
                      style={{ flex: 1 }}
                    />
                  }
                />
              ))
            )}
          </View>
        </ScrollView>
      ) : null}

      <ReasonPrompt
        visible={prompt !== null}
        title={
          prompt?.kind === 'deletePet'
            ? `Eliminar a ${pet?.name}`
            : `Quitar item ${prompt?.itemName ? `"${prompt.itemName}"` : ''}`
        }
        placeholder={
          prompt?.kind === 'deletePet'
            ? 'Motivo que verá el usuario (ej: uso de trucos)...'
            : 'Motivo que verá el usuario (ej: item obtenido con trampa)...'
        }
        loading={submitting}
        onConfirm={confirmWithReason}
        onCancel={cancel}
      />

      <Modal visible={pickerOpen} transparent animationType="slide" onRequestClose={closePicker}>
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(26,26,31,0.58)', justifyContent: 'flex-end' }}
          onPress={closePicker}
          accessibilityRole="button"
          accessibilityLabel="Cerrar selector de items">
          <Pressable
            onPress={(event) => event.stopPropagation()}
            style={{ width: '100%', paddingHorizontal: 12, paddingBottom: 12 }}
            accessibilityViewIsModal>
            <ClaySurface
              colors={clay.fondoClaro}
              radius={radios.tarjetaGrande}
              border
              style={sombras.tarjeta}
              contentStyle={{ padding: 18, gap: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: fuentes.pixel,
                      fontSize: 15,
                      color: clay.texto,
                      letterSpacing: 1,
                    }}
                    accessibilityRole="header">
                    ELEGIR ITEM
                  </Text>
                  <Text
                    style={{ marginTop: 6, color: clay.textoSuave, fontSize: textoClay.etiqueta }}>
                    Toca un item para añadirlo a la mascota.
                  </Text>
                </View>
                <ClayIconButton
                  icon="✕"
                  iconColor={clay.texto}
                  size={44}
                  onPress={closePicker}
                  accessibilityLabel="Cerrar selector de items"
                />
              </View>
              {catalogLoading ? (
                <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                  <ActivityIndicator color={clay.violeta[0]} size="large" />
                </View>
              ) : (
                <FlatList
                  data={catalog}
                  keyExtractor={(item) => String(item.id)}
                  style={{ maxHeight: 340 }}
                  contentContainerStyle={{ paddingVertical: 4, gap: 8 }}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <ClayRow
                      icon={<Text style={{ fontSize: 22 }}>{itemGlyph(item.imageUrl)}</Text>}
                      title={item.name}
                      subtitle={`${item.category ?? 'General'} · ${item.price} coins`}
                      onPress={() => void addItem(item)}
                      accessibilityLabel={`Añadir ${item.name}`}
                      right={
                        <Text style={{ fontSize: 10, fontWeight: '900', color: clay.textoSuave }}>
                          Añadir
                        </Text>
                      }
                    />
                  )}
                  ListEmptyComponent={<ClayEmptyState title="No hay items en el catálogo." />}
                />
              )}
            </ClaySurface>
          </Pressable>
        </Pressable>
      </Modal>
    </ClayBackground>
  );
}
