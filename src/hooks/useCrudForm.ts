import { useState } from 'react';
import type { CrudField, CrudRow } from '@/components/AdminCrudList';

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

export function useCrudForm(
  fields: CrudField[],
  rows: CrudRow[],
  onSave: (data: Record<string, string>, editing: boolean, id?: string) => Promise<void>
) {
  const [form, setForm] = useState<CrudRow | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const editing = form ? rows.some((r) => r.id === form.id) : false;

  const openCreate = () => {
    setForm({ ...Object.fromEntries(fields.map((f) => [f.key, ''])), id: 'new' });
    setErrors({});
  };

  const openEdit = (row: CrudRow) => {
    setForm({ ...row });
    setErrors({});
  };

  const close = () => setForm(null);

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
      await onSave(data, editing, editing ? form.id : undefined);
      setForm(null);
    } finally {
      setSaving(false);
    }
  };

  return {
    form,
    errors,
    saving,
    editing,
    openCreate,
    openEdit,
    close,
    updateField,
    save,
  };
}
