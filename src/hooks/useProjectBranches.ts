import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import type { Branch } from '@/lib/types';

export function useProjectBranches(
  fullName: string | null | undefined,
  defaultBranch: string | null | undefined,
  enabled: boolean = true
) {
  const { token } = useAuth();
  const [branches, setBranches] = useState<string[] | null>(null);
  const [lifeBranch, setLifeBranch] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !fullName || !enabled) return;
    apiFetch<Branch[]>(`/github/repos/${fullName}/branches`, { token })
      .then((data) => {
        const names = data.map((b) => b.name);
        setBranches(names);
        setLifeBranch((prev) => prev ?? defaultBranch ?? names[0] ?? 'main');
      })
      .catch(() => setBranches([]));
  }, [token, fullName, enabled, defaultBranch]);

  return { branches, lifeBranch, setLifeBranch };
}
