const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://tama-git-backend.vercel.app';

type ApiOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  token?: string | null;
};

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    let message = `Error ${res.status}`;
    try {
      const data = (await res.json()) as { error?: string; details?: string };
      message = data.error ?? data.details ?? message;
    } catch {
      // keep default message
    }
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

export function buildLoginUrl(redirectUri: string): string {
  return `${API_URL}/auth/github/login?redirect_uri=${encodeURIComponent(redirectUri)}`;
}

export { API_URL };
