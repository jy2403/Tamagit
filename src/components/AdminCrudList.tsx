import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ConfirmModal } from '@/components/ConfirmModal';
import { FeedbackBanner, type Feedback } from '@/components/FeedbackBanner';
import { ClayBackground } from '@/components/clay/ClayBackground';
import { ClayButton } from '@/components/clay/ClayButton';
import { ClayIconButton } from '@/components/clay/ClayIconButton';
import { ClaySurface } from '@/components/clay/ClaySurface';
import { useConfirmDelete } from '@/hooks/useConfirmDelete';
import { useCrudForm } from '@/hooks/useCrudForm';
import { useCrudSearch } from '@/hooks/useCrudSearch';
import { clay, radios, sombras } from '@/estilos';

export type CrudOption = {
  label: string;
  value: string;
};

export type CrudField = {
  key: string;
  label: string;
  placeholder?: string;
  isNumber?: boolean;
  maxLength?: number;
  options?: readonly CrudOption[];
  defaultValue?: string;
  optional?: boolean;
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

function FieldLabel({ label }: { label: string }) {
  return (
    <Text
      style={{
        marginBottom: 7,
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
        color: clay.textoTenue,
        textTransform: 'uppercase',
      }}>
      {label}
    </Text>
  );
}

function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <Text style={{ marginTop: 5, fontSize: 11, fontWeight: '700', color: '#B4221B' }}>{error}</Text>
  );
}

function TextField({
  field,
  value,
  error,
  onChange,
}: {
  field: CrudField;
  value: string;
  error?: string;
  onChange: (text: string) => void;
}) {
  return (
    <View>
      <FieldLabel label={field.label} />
      <ClaySurface
        colors={clay.blanco}
        radius={radios.input}
        border
        contentStyle={{ paddingHorizontal: 14, paddingVertical: 2 }}>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={field.placeholder}
          placeholderTextColor={clay.textoTenue}
          keyboardType={field.isNumber ? 'number-pad' : 'default'}
          maxLength={field.maxLength}
          style={{ minHeight: 48, color: clay.texto, fontSize: 14, fontWeight: '700' }}
        />
      </ClaySurface>
      <FieldError error={error} />
    </View>
  );
}

function OptionField({
  field,
  value,
  error,
  onChange,
}: {
  field: CrudField;
  value: string;
  error?: string;
  onChange: (text: string) => void;
}) {
  return (
    <View>
      <FieldLabel label={field.label} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {field.options?.map((option) => {
          const active = value === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`${field.label}: ${option.label}`}
              style={({ pressed }) => [
                { borderRadius: radios.chip },
                pressed ? { transform: [{ scale: 0.96 }] } : null,
              ]}>
              <ClaySurface
                colors={active ? clay.fucsia : clay.blanco}
                radius={radios.chip}
                border={!active}
                shadow={active ? 'suave' : false}
                contentStyle={{
                  minHeight: 44,
                  paddingHorizontal: 15,
                  paddingVertical: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    color: active ? '#FFFFFF' : clay.texto,
                    fontSize: 12,
                    fontWeight: '900',
                  }}>
                  {option.label}
                </Text>
              </ClaySurface>
            </Pressable>
          );
        })}
      </View>
      <FieldError error={error} />
    </View>
  );
}

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
  const router = useRouter();
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

  const displayValue = (key: string, value: string) => {
    const field = fields.find((item) => item.key === key);
    return field?.options?.find((option) => option.value === value)?.label ?? value;
  };

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
    <View style={{ gap: 12, paddingBottom: 4 }}>
      {form ? (
        <ClaySurface
          colors={clay.blanco}
          radius={radios.tarjetaGrande}
          glass
          border
          shadow="tarjeta"
          contentStyle={{ padding: 18, gap: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View
              style={{ width: 5, height: 22, borderRadius: 3, backgroundColor: clay.fucsia[0] }}
            />
            <Text style={{ flex: 1, fontSize: 17, fontWeight: '900', color: clay.texto }}>
              {editing ? 'Editar' : 'Nuevo'} {singular}
            </Text>
          </View>
          {fields.map((f) =>
            f.options ? (
              <OptionField
                key={f.key}
                field={f}
                value={form[f.key] ?? ''}
                error={errors[f.key]}
                onChange={(text) => updateField(f.key, text)}
              />
            ) : (
              <TextField
                key={f.key}
                field={f}
                value={form[f.key] ?? ''}
                error={errors[f.key]}
                onChange={(text) => updateField(f.key, text)}
              />
            )
          )}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <ClayButton
              title={saving ? 'Guardando...' : 'Guardar'}
              colors={clay.violeta}
              textColor="#FFFFFF"
              pixel={false}
              size="md"
              onPress={() => void save()}
              disabled={saving}
              style={{ flex: 1 }}
            />
            <ClayButton
              title="Cancelar"
              colors={clay.blanco}
              textColor={clay.texto}
              pixel={false}
              size="md"
              onPress={close}
              disabled={saving}
              style={{ flex: 1 }}
            />
          </View>
        </ClaySurface>
      ) : null}

      <ClaySurface
        colors={clay.blanco}
        radius={radios.input}
        border
        contentStyle={{ paddingHorizontal: 12, paddingVertical: 2 }}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={`Buscar ${title.toLowerCase()}...`}
          placeholderTextColor={clay.textoTenue}
          style={{ minHeight: 48, color: clay.texto, fontSize: 14, fontWeight: '700' }}
        />
      </ClaySurface>
    </View>
  );

  return (
    <ClayBackground>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
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
            accessibilityLabel="Volver al panel de administrador"
            onPress={() => router.back()}
            size={46}
          />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontSize: 18, fontWeight: '900', color: clay.texto }}>{title}</Text>
            <Text style={{ marginTop: 2, fontSize: 10, color: clay.textoSuave }}>
              Panel de administrador
            </Text>
          </View>
          <ClayButton
            title="Nuevo"
            colors={clay.fucsia}
            textColor="#FFFFFF"
            pixel={false}
            size="md"
            onPress={openCreate}
            style={{ minWidth: 88 }}
          />
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 4,
            paddingBottom: Math.max(insets.bottom + 24, 36),
          }}
          ListHeaderComponent={header}
          renderItem={({ item }) => (
            <ClaySurface
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
                  width: 42,
                  height: 42,
                  borderRadius: 21,
                  backgroundColor: 'rgba(139,79,248,0.10)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text style={{ fontSize: 19 }}>{iconKey ? item[iconKey] || '•' : '•'}</Text>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text
                  numberOfLines={1}
                  style={{ fontSize: 14, fontWeight: '900', color: clay.texto }}>
                  {nameKey ? item[nameKey] : item[fields[0].key]}
                </Text>
                {extraKeys.length > 0 ? (
                  <Text
                    numberOfLines={1}
                    style={{ marginTop: 2, fontSize: 11, color: clay.textoSuave }}>
                    {extraKeys
                      .map((key) => displayValue(key, item[key]))
                      .filter(Boolean)
                      .join(' · ')}
                  </Text>
                ) : null}
              </View>
              <ClayIconButton
                icon="editar"
                accessibilityLabel={`Editar ${nameKey ? item[nameKey] : singular}`}
                onPress={() => openEdit(item)}
                size={38}
                colors={clay.menta}
              />
              <Pressable
                onPress={() => remove(item)}
                accessibilityRole="button"
                accessibilityLabel={`Eliminar ${nameKey ? item[nameKey] : singular}`}
                style={({ pressed }) => [
                  { borderRadius: 19 },
                  pressed ? { transform: [{ scale: 0.94 }] } : null,
                ]}>
                <ClaySurface
                  colors={clay.rosa}
                  radius={19}
                  contentStyle={{
                    width: 38,
                    height: 38,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '900' }}>{'✕'}</Text>
                </ClaySurface>
              </Pressable>
            </ClaySurface>
          )}
          ListEmptyComponent={
            <ClaySurface
              colors={clay.blanco}
              radius={radios.tarjeta}
              border
              contentStyle={{ padding: 24, alignItems: 'center' }}>
              <Text style={{ textAlign: 'center', fontSize: 13, color: clay.textoSuave }}>
                {rows.length === 0 ? emptyMessage : `Sin resultados para "${query}".`}
              </Text>
            </ClaySurface>
          }
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />
      </KeyboardAvoidingView>
      <FeedbackBanner feedback={feedback} onDone={onFeedbackDone} placement="top" />

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
