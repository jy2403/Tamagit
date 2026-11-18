import { useCallback, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ClayBackground } from '@/components/clay/ClayBackground';
import { ClayButton } from '@/components/clay/ClayButton';
import { ClayField } from '@/components/clay/ClayField';
import { ClayHeader } from '@/components/clay/ClayHeader';
import { ClayInput } from '@/components/clay/ClayInput';
import { ClayRow } from '@/components/clay/ClayRow';
import { ClayEmptyState } from '@/components/clay/ClayStates';
import { ClaySurface } from '@/components/clay/ClaySurface';
import { FeedbackBanner, type Feedback } from '@/components/FeedbackBanner';
import { ConfirmModal } from '@/components/ConfirmModal';
import { useConfirmDelete } from '@/hooks/useConfirmDelete';
import { useCrudForm } from '@/hooks/useCrudForm';
import { useCrudSearch } from '@/hooks/useCrudSearch';
import { clay, radios, sombras } from '@/estilos';

export type CrudField = {
  key: string;
  label: string;
  placeholder?: string;
  isNumber?: boolean;
  maxLength?: number;
};

export type CrudRow = {
  id: string;
  [key: string]: string;
};

type AdminCrudListProps = {
  title: string;
  singular: string;
  emptyMessage: string;
  fields: CrudField[];
  rows: CrudRow[];
  onCreate: (data: Record<string, string>) => Promise<void>;
  onUpdate: (id: string, data: Record<string, string>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export function AdminCrudList({
  title,
  singular,
  emptyMessage,
  fields,
  rows,
  onCreate,
  onUpdate,
  onDelete,
}: AdminCrudListProps) {
  const insets = useSafeAreaInsets();
  const [feedback, setFeedback] = useState<Feedback>(null);
  const onFeedbackDone = useCallback(() => setFeedback(null), []);

  const { query, setQuery, filtered } = useCrudSearch(rows, fields);
  const { form, errors, saving, editing, openCreate, openEdit, close, updateField, save } =
    useCrudForm(fields, rows, async (data, isEditing, id) => {
      if (isEditing && id) {
        await onUpdate(id, data);
        setFeedback({ tipo: 'exito', texto: `${singular} actualizado correctamente` });
      } else {
        await onCreate(data);
        setFeedback({ tipo: 'exito', texto: `${singular} creado correctamente` });
      }
    });
  const {
    removing,
    deleting,
    start: remove,
    confirm: confirmRemove,
    cancel: cancelRemove,
  } = useConfirmDelete();

  const iconKey = fields.find((f) => f.key === 'icon')?.key;
  const nameKey = fields.find((f) => f.key === 'name')?.key;
  const extraKeys = nameKey
    ? fields.filter((f) => f.key !== nameKey && f.key !== iconKey).map((f) => f.key)
    : [];

  const handleConfirmRemove = async () => {
    setFeedback(null);
    await confirmRemove(
      async (id) => {
        await onDelete(id);
        setFeedback({ tipo: 'exito', texto: `${singular} eliminado correctamente.` });
      },
      (message) => setFeedback({ tipo: 'error', texto: message })
    );
  };

  const header = (
    <View style={{ gap: 12, marginBottom: 12 }}>
      {form ? (
        <View style={sombras.tarjeta}>
          <ClaySurface
            colors={clay.blanco}
            radius={radios.tarjetaGrande}
            border
            contentStyle={{ padding: 16, gap: 12 }}>
            <Text style={{ fontSize: 15, fontWeight: '900', color: clay.texto }}>
              {editing ? 'Editar' : 'Nuevo'} {singular}
            </Text>
            {fields.map((f) => (
              <ClayField
                key={f.key}
                label={f.label}
                placeholder={f.placeholder}
                required
                maxLength={f.maxLength}
                value={form[f.key]}
                onChangeText={(text) => updateField(f.key, text)}
                keyboardType={f.isNumber ? 'number-pad' : 'default'}
                error={errors[f.key]}
              />
            ))}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <ClayButton
                title={saving ? 'Guardando...' : 'Guardar'}
                onPress={() => void save()}
                disabled={saving}
                colors={clay.verde}
                textColor={clay.oscuro}
                pixel={false}
                size="md"
                style={{ flex: 1 }}
              />
              <ClayButton
                title="Cancelar"
                onPress={close}
                colors={clay.blanco}
                textColor={clay.texto}
                pixel={false}
                size="md"
                style={{ flex: 1 }}
              />
            </View>
          </ClaySurface>
        </View>
      ) : null}
      <ClayInput
        value={query}
        onChangeText={setQuery}
        placeholder={`Buscar ${title.toLowerCase()}...`}
        accessibilityLabel={`Buscar ${title.toLowerCase()}`}
      />
    </View>
  );

  return (
    <ClayBackground>
      <ClayHeader
        title={title}
        subtitle={`${rows.length} registrados`}
        right={
          <ClayButton
            title="Nuevo"
            onPress={openCreate}
            colors={clay.fucsia}
            pixel={false}
            size="md"
            style={{ alignSelf: 'center' }}
          />
        }
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom + 24, 36),
          gap: 12,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={header}
        renderItem={({ item }) => (
          <ClayRow
            icon={<Text style={{ fontSize: 22 }}>{iconKey ? (item[iconKey] ?? '❓') : '•'}</Text>}
            title={nameKey ? item[nameKey] : item[fields[0].key]}
            subtitle={
              extraKeys.length > 0
                ? extraKeys
                    .map((k) => item[k])
                    .filter(Boolean)
                    .join(' · ')
                : undefined
            }
            footer={
              <>
                <ClayButton
                  title="Editar"
                  onPress={() => openEdit(item)}
                  colors={clay.blanco}
                  textColor={clay.texto}
                  pixel={false}
                  size="md"
                  style={{ flex: 1 }}
                />
                <ClayButton
                  title="Eliminar"
                  onPress={() => remove(item)}
                  colors={clay.rojo}
                  pixel={false}
                  size="md"
                  style={{ flex: 1 }}
                />
              </>
            }
          />
        )}
        ListEmptyComponent={
          <ClayEmptyState
            title={rows.length === 0 ? emptyMessage : `Sin resultados para "${query}".`}
          />
        }
      />
      <FeedbackBanner feedback={feedback} onDone={onFeedbackDone} />

      <ConfirmModal
        visible={removing !== null}
        title={`¿Eliminar "${removing ? (nameKey ? removing[nameKey] : removing[fields[0].key]) : ''}"?`}
        message={`Se eliminará ${singular}. Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        loading={deleting}
        onConfirm={() => void handleConfirmRemove()}
        onCancel={cancelRemove}
      />
    </ClayBackground>
  );
}
