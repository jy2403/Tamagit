import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
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
import { ClayBackground } from '@/components/clay/ClayBackground';
import { ClayButton } from '@/components/clay/ClayButton';
import { ClayIconButton } from '@/components/clay/ClayIconButton';
import { ClayPill } from '@/components/clay/ClayPill';
import { ClaySurface } from '@/components/clay/ClaySurface';
import { ReasonPrompt } from '@/components/ReasonPrompt';
import { useAuth } from '@/context/AuthContext';
import { useAdminPet, usePetItems } from '@/hooks/useAdminPet';
import { useReasonedAction } from '@/hooks/useReasonedAction';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { apiFetch } from '@/lib/api';
import { clay, radios, sombras } from '@/estilos';

export default function AdminPetDetailScreen() {
  const { petId } = useLocalSearchParams<{ petId: string }>();
  const { token } = useAuth();
  const router = useRouter();
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

  if (authStatus === 'loading') {
    return (
      <ClayBackground>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={clay.violeta[0]} />
        </View>
      </ClayBackground>
    );
  }

  if (authStatus === 'anonymous') {
    return <Redirect href="/login" />;
  }

  if (authStatus === 'forbidden') {
    return (
      <ClayBackground>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Text style={{ textAlign: 'center', fontSize: 14, color: clay.textoSuave }}>
            Sin permisos de administrador.
          </Text>
        </View>
      </ClayBackground>
    );
  }

  return (
    <ClayBackground>
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 16,
          paddingBottom: 10,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}>
        <ClayIconButton
          icon="←"
          accessibilityLabel="Volver"
          onPress={() => router.back()}
          size={46}
        />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text numberOfLines={1} style={{ fontSize: 18, fontWeight: '900', color: clay.texto }}>
            {pet?.name ?? 'Mascota'}
          </Text>
          <Text style={{ marginTop: 2, fontSize: 10, color: clay.textoSuave }}>
            Gestión de mascota
          </Text>
        </View>
      </View>

      {error ? (
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 }}>
          <Text style={{ textAlign: 'center', fontSize: 13, color: '#B4221B' }}>{error}</Text>
          <ClayButton
            title="Reintentar"
            colors={clay.violeta}
            pixel={false}
            size="md"
            onPress={() => void load()}
          />
        </View>
      ) : pet ? (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: Math.max(insets.bottom + 24, 36),
            gap: 16,
          }}
          showsVerticalScrollIndicator={false}>
          <ClaySurface
            colors={clay.blanco}
            radius={radios.tarjetaGrande}
            border
            shadow="tarjeta"
            contentStyle={{ padding: 18 }}>
            <View
              style={{ width: 42, height: 5, borderRadius: 3, backgroundColor: clay.fucsia[0] }}
            />
            <Text style={{ marginTop: 12, fontSize: 16, fontWeight: '900', color: clay.texto }}>
              Mascota
            </Text>
            <Text style={{ marginTop: 4, fontSize: 12, color: clay.textoSuave }}>
              Especie: {pet.species}
            </Text>
            <Text style={{ marginTop: 2, fontSize: 12, color: clay.textoSuave }}>
              Proyecto: {pet.project.name}
            </Text>
            <View style={{ marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              <Pill label={`${pet.health} salud`} />
              <Pill label={`${pet.hunger} hambre`} />
              <Pill label={`felicidad ${pet.happiness}`} />
              <Pill label={`rama ${pet.lifeBranch}`} />
            </View>
            <ClayButton
              title="Eliminar mascota"
              colors={clay.rosa}
              textColor="#FFFFFF"
              pixel={false}
              size="md"
              onPress={() => start({ kind: 'deletePet' })}
              style={{ marginTop: 14 }}
            />
          </ClaySurface>

          <View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 10,
              }}>
              <View>
                <Text style={{ fontSize: 17, fontWeight: '900', color: clay.texto }}>
                  Items ({pet.items.length})
                </Text>
                <Text style={{ marginTop: 2, fontSize: 10, color: clay.textoSuave }}>
                  Inventario asignado
                </Text>
              </View>
              <ClayButton
                title="Añadir"
                colors={clay.fucsia}
                textColor="#FFFFFF"
                pixel={false}
                size="md"
                onPress={() => void openPicker()}
              />
            </View>

            {pet.items.length === 0 ? (
              <ClaySurface
                colors={clay.blanco}
                radius={radios.tarjeta}
                border
                contentStyle={{ padding: 22, alignItems: 'center' }}>
                <Text style={{ textAlign: 'center', fontSize: 13, color: clay.textoSuave }}>
                  Esta mascota no tiene items. Usa «Añadir» para darle uno.
                </Text>
              </ClaySurface>
            ) : (
              pet.items.map((pi) => (
                <ClaySurface
                  key={pi.id}
                  colors={clay.blanco}
                  radius={radios.tarjeta}
                  border
                  style={{ marginBottom: 10, ...sombras.suave }}
                  contentStyle={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 12,
                    gap: 10,
                  }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: 'rgba(139,79,248,0.10)',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Text style={{ fontSize: 15, fontWeight: '900', color: clay.violeta[0] }}>
                      {pi.item.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      numberOfLines={1}
                      style={{ fontSize: 14, fontWeight: '900', color: clay.texto }}>
                      {pi.item.name}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={{ marginTop: 2, fontSize: 11, color: clay.textoSuave }}>
                      {pi.item.category ?? 'General'} {pi.quantity > 1 ? `· x${pi.quantity}` : ''}
                    </Text>
                  </View>
                  <ClayButton
                    title="Quitar"
                    colors={clay.blanco}
                    textColor={clay.texto}
                    pixel={false}
                    size="md"
                    onPress={() =>
                      start({ kind: 'removeItem', itemId: pi.itemId, itemName: pi.item.name })
                    }
                  />
                </ClaySurface>
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
        onConfirm={(reason) => void confirmWithReason(reason)}
        onCancel={cancel}
      />

      <Modal visible={pickerOpen} transparent animationType="slide" onRequestClose={closePicker}>
        <Pressable
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(26,26,31,0.58)',
          }}
          onPress={closePicker}
          accessibilityRole="button"
          accessibilityLabel="Cerrar selector de items">
          <Pressable onPress={(event) => event.stopPropagation()}>
            <ClaySurface
              colors={clay.blanco}
              radius={radios.tarjetaGrande}
              border
              contentStyle={{
                maxHeight: '70%',
                padding: 16,
                paddingBottom: Math.max(insets.bottom + 16, 20),
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <Text style={{ fontSize: 16, fontWeight: '900', color: clay.texto }}>
                  Elegir item
                </Text>
                <ClayButton
                  title="Cerrar"
                  colors={clay.blanco}
                  textColor={clay.texto}
                  pixel={false}
                  size="md"
                  onPress={closePicker}
                />
              </View>
              {catalogLoading ? (
                <View style={{ paddingVertical: 32, alignItems: 'center' }}>
                  <ActivityIndicator size="large" color={clay.violeta[0]} />
                </View>
              ) : (
                <FlatList
                  data={catalog}
                  keyExtractor={(item) => String(item.id)}
                  contentContainerStyle={{ paddingTop: 12, gap: 8 }}
                  renderItem={({ item }) => (
                    <Pressable onPress={() => void addItem(item)}>
                      <ClaySurface
                        colors={clay.fondoClaro}
                        radius={radios.tarjeta}
                        border
                        contentStyle={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          padding: 10,
                          gap: 10,
                        }}>
                        <View
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 19,
                            backgroundColor: 'rgba(139,79,248,0.10)',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          <Text style={{ fontSize: 14, fontWeight: '900', color: clay.violeta[0] }}>
                            {item.name.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View style={{ flex: 1, minWidth: 0 }}>
                          <Text
                            numberOfLines={1}
                            style={{ fontSize: 13, fontWeight: '900', color: clay.texto }}>
                            {item.name}
                          </Text>
                          <Text
                            numberOfLines={1}
                            style={{ marginTop: 2, fontSize: 10, color: clay.textoSuave }}>
                            {item.category ?? 'General'} · {item.price} coins
                          </Text>
                        </View>
                        <Text style={{ fontSize: 11, fontWeight: '900', color: clay.fucsia[0] }}>
                          Añadir
                        </Text>
                      </ClaySurface>
                    </Pressable>
                  )}
                  ListEmptyComponent={
                    <Text
                      style={{
                        paddingVertical: 24,
                        textAlign: 'center',
                        fontSize: 13,
                        color: clay.textoSuave,
                      }}>
                      No hay items en el catálogo.
                    </Text>
                  }
                />
              )}
            </ClaySurface>
          </Pressable>
        </Pressable>
      </Modal>
    </ClayBackground>
  );
}

function Pill({ label }: { label: string }) {
  return <ClayPill label={label} colors={clay.blanco} textColor={clay.texto} />;
}
