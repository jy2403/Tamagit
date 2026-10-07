import { useMemo, useState } from 'react';
import type { CrudField, CrudRow } from '@/components/AdminCrudList';

export function useCrudSearch(rows: CrudRow[], fields: CrudField[]) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => fields.some((f) => (row[f.key] ?? '').toLowerCase().includes(q)));
  }, [rows, query, fields]);

  return { query, setQuery, filtered };
}
