import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { Field } from '@/components/Field';
import { FeedbackBanner, type Feedback } from '@/components/FeedbackBanner';
import { ConfirmModal } from '@/components/ConfirmModal';
import { useConfirmDelete } from '@/hooks/useConfirmDelete';
import { useCrudForm } from '@/hooks/useCrudForm';
import { useCrudSearch } from '@/hooks/useCrudSearch';
import { Button } from '@/layout/Button';
import { boton, formulario, lista, pantalla, tarjeta, tipografia } from '@/estilos';

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
  const router = useRouter();
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
    <View>
      {form ? (
        <View className={`mb-4 gap-3 ${tarjeta.grande}`}>
          <Text className={tipografia.seccion}>
            {editing ? 'Editar' : 'Nuevo'} {singular}
          </Text>
          {fields.map((f) => (
            <Field
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
          <View className="flex-row gap-3">
            <Button
              title={saving ? 'Guardando...' : 'Guardar'}
              onPress={() => void save()}
              disabled={saving}
              style={{ flex: 1 }}
            />
            <Button title="Cancelar" onPress={close} variant="secondary" style={{ flex: 1 }} />
          </View>
        </View>
      ) : null}
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder={`Buscar ${title.toLowerCase()}...`}
        placeholderTextColor="#737373"
        className={formulario.busqueda}
      />
    </View>
  );

  return (
    <View className={pantalla.root}>
      <View className={pantalla.header}>
        <Pressable onPress={() => router.back()} className="pr-4">
          <Text className={tipografia.enlace}>Atras</Text>
        </Pressable>
        <Text className={tipografia.titulo}>{title}</Text>
        <Button title="Nuevo" onPress={openCreate} variant="secondary" />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={header}
        renderItem={({ item }) => (
          <View className={lista.fila}>
            <View className={lista.icono}>
              <Text className="text-xl">{iconKey ? (item[iconKey] ?? '❓') : '•'}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-white" numberOfLines={1}>
                {nameKey ? item[nameKey] : item[fields[0].key]}
              </Text>
              {extraKeys.length > 0 ? (
                <Text className={tipografia.subtitulo} numberOfLines={1}>
                  {extraKeys
                    .map((k) => item[k])
                    .filter(Boolean)
                    .join(' · ')}
                </Text>
              ) : null}
            </View>
            <Pressable className={boton.enlace} onPress={() => openEdit(item)}>
              <Text className={tipografia.enlace}>Editar</Text>
            </Pressable>
            <Pressable className={boton.enlace} onPress={() => remove(item)}>
              <Text className={tipografia.error}>Eliminar</Text>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          <Text className={lista.vacio}>
            {rows.length === 0 ? emptyMessage : `Sin resultados para "${query}".`}
          </Text>
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
    </View>
  );
}
