import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { Field } from '@/components/Field';
import { FeedbackBanner, type Feedback } from '@/components/FeedbackBanner';
import { ConfirmModal } from '@/components/ConfirmModal';
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

function validateField(field: CrudField, value: string): string | null {
  const trimmed = (value ?? '').trim();
  if (!trimmed) {
    return `${field.label} es obligatorio`;
  }
  if (field.isNumber && !Number.isFinite(Number(trimmed))) {
    return `${field.label} debe ser un número`;
  }
  if (field.maxLength != null && trimmed.length > field.maxLength) {
    return `${field.label} no puede superar ${field.maxLength} caracteres`;
  }
  return null;
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
  const [query, setQuery] = useState('');
  const [form, setForm] = useState<CrudRow | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const onFeedbackDone = useCallback(() => setFeedback(null), []);
  const [removing, setRemoving] = useState<CrudRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const iconKey = fields.find((f) => f.key === 'icon')?.key;
  const nameKey = fields.find((f) => f.key === 'name')?.key;
  const extraKeys = nameKey
    ? fields.filter((f) => f.key !== nameKey && f.key !== iconKey).map((f) => f.key)
    : [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => fields.some((f) => (row[f.key] ?? '').toLowerCase().includes(q)));
  }, [rows, query, fields]);

  const editing = form ? rows.some((r) => r.id === form.id) : false;

  const openCreate = () => {
    setForm({ ...Object.fromEntries(fields.map((f) => [f.key, ''])), id: 'new' });
    setErrors({});
  };

  const openEdit = (row: CrudRow) => {
    setForm({ ...row });
    setErrors({});
  };

  const updateField = (key: string, text: string) => {
    if (!form) return;
    setForm({ ...form, [key]: text });
    const field = fields.find((f) => f.key === key);
    if (!field) return;
    const error = validateField(field, text);
    setErrors((prev) => {
      const next = { ...prev };
      if (error) {
        next[key] = error;
      } else {
        delete next[key];
      }
      return next;
    });
  };

  const save = async () => {
    if (!form || saving) return;

    const nextErrors: Record<string, string> = {};
    for (const f of fields) {
      const error = validateField(f, form[f.key] ?? '');
      if (error) nextErrors[f.key] = error;
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    let data: Record<string, string>;
    if (editing) {
      const original = rows.find((r) => r.id === form.id);
      data = {};
      for (const f of fields) {
        const newValue = (form[f.key] ?? '').trim();
        const oldValue = (original?.[f.key] ?? '').trim();
        if (newValue !== oldValue) {
          data[f.key] = newValue;
        }
      }
      if (Object.keys(data).length === 0) {
        setForm(null);
        return;
      }
    } else {
      data = Object.fromEntries(fields.map((f) => [f.key, (form[f.key] ?? '').trim()]));
    }

    setSaving(true);
    try {
      if (editing) {
        await onUpdate(form.id, data);
        setFeedback({ tipo: 'exito', texto: `${singular} actualizado correctamente` });
      } else {
        await onCreate(data);
        setFeedback({ tipo: 'exito', texto: `${singular} creado correctamente` });
      }
      setForm(null);
    } catch (e) {
      setFeedback({ tipo: 'error', texto: e instanceof Error ? e.message : 'No se pudo guardar' });
    } finally {
      setSaving(false);
    }
  };

  const remove = (row: CrudRow) => {
    setRemoving(row);
  };

  const confirmRemove = async () => {
    if (!removing || deleting) return;
    setDeleting(true);
    setFeedback(null);
    try {
      await onDelete(removing.id);
      setFeedback({ tipo: 'exito', texto: `${singular} eliminado correctamente.` });
      setRemoving(null);
    } catch (e) {
      setRemoving(null);
      setFeedback({ tipo: 'error', texto: e instanceof Error ? e.message : 'No se pudo eliminar' });
    } finally {
      setDeleting(false);
    }
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
            <Button
              title="Cancelar"
              onPress={() => setForm(null)}
              variant="secondary"
              style={{ flex: 1 }}
            />
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
        onConfirm={() => void confirmRemove()}
        onCancel={() => setRemoving(null)}
      />
    </View>
  );
}