import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { Field } from '@/components/Field';
import { Button } from '@/layout/Button';

export type CrudField = {
  key: string;
  label: string;
  placeholder?: string;
  isNumber?: boolean;
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
  initial: CrudRow[];
};

export function AdminCrudList({
  title,
  singular,
  emptyMessage,
  fields,
  initial,
}: AdminCrudListProps) {
  const router = useRouter();
  const [rows, setRows] = useState<CrudRow[]>(initial);
  const [query, setQuery] = useState('');
  const [form, setForm] = useState<CrudRow | null>(null);

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

  const isFormValid = useMemo(() => {
    if (!form) return false;
    return fields.every((f) => {
      const value = (form[f.key] ?? '').trim();
      if (!value) return false;
      return !f.isNumber || Number.isFinite(Number(value));
    });
  }, [form, fields]);

  const openCreate = () => {
    setForm({ ...Object.fromEntries(fields.map((f) => [f.key, ''])), id: 'new' });
  };

  const openEdit = (row: CrudRow) => setForm({ ...row });

  const save = () => {
    if (!form || !isFormValid) return;
    const values = Object.fromEntries(fields.map((f) => [f.key, (form[f.key] ?? '').trim()]));
    setRows((prev) => {
      if (editing) {
        return prev.map((r) => (r.id === form.id ? { ...values, id: form.id } : r));
      }
      return [{ ...values, id: String(Date.now()) }, ...prev];
    });
    setForm(null);
  };

  const remove = (row: CrudRow) => {
    const label = (nameKey ? row[nameKey] : row[fields[0].key]) ?? singular;
    Alert.alert('Eliminar', `¿Seguro que quieres eliminar "${label}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => setRows((prev) => prev.filter((r) => r.id !== row.id)),
      },
    ]);
  };

  const header = (
    <View>
      {form ? (
        <View className="mb-4 gap-3 rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
          <Text className="text-base font-semibold text-white">
            {editing ? 'Editar' : 'Nuevo'} {singular}
          </Text>
          {fields.map((f) => (
            <Field
              key={f.key}
              label={f.label}
              placeholder={f.placeholder}
              value={form[f.key]}
              onChangeText={(text) => setForm({ ...form, [f.key]: text })}
              keyboardType={f.isNumber ? 'number-pad' : 'default'}
            />
          ))}
          <View className="flex-row gap-3">
            <Button title="Guardar" onPress={save} disabled={!isFormValid} style={{ flex: 1 }} />
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
        className="mb-4 rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-white"
      />
    </View>
  );

  return (
    <View className="flex-1 bg-neutral-950">
      <View className="flex-row items-center px-5 pb-3 pt-16">
        <Pressable onPress={() => router.back()} className="pr-4">
          <Text className="text-emerald-400">Atras</Text>
        </Pressable>
        <Text className="flex-1 text-2xl font-bold text-white">{title}</Text>
        <Button title="Nuevo" onPress={openCreate} variant="secondary" />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={header}
        renderItem={({ item }) => (
          <View className="mb-2 flex-row items-center rounded-xl border border-neutral-800 bg-neutral-900 p-3">
            <View className="mr-3 h-11 w-11 items-center justify-center rounded-full bg-white/10">
              <Text className="text-xl">{iconKey ? (item[iconKey] ?? '❓') : '•'}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-white" numberOfLines={1}>
                {nameKey ? item[nameKey] : item[fields[0].key]}
              </Text>
              {extraKeys.length > 0 ? (
                <Text className="text-xs text-neutral-400" numberOfLines={1}>
                  {extraKeys
                    .map((k) => item[k])
                    .filter(Boolean)
                    .join(' · ')}
                </Text>
              ) : null}
            </View>
            <Pressable className="rounded-lg bg-white/10 px-3 py-2" onPress={() => openEdit(item)}>
              <Text className="text-sm text-emerald-400">Editar</Text>
            </Pressable>
            <Pressable
              className="ml-2 rounded-lg bg-white/10 px-3 py-2"
              onPress={() => remove(item)}>
              <Text className="text-sm text-red-400">Eliminar</Text>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          <Text className="py-8 text-center text-sm text-neutral-500">
            {rows.length === 0 ? emptyMessage : `Sin resultados para "${query}".`}
          </Text>
        }
      />
    </View>
  );
}
