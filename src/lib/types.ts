export type User = {
  id: number;
  email: string | null;
  name: string | null;
  githubId: number | null;
  githubUsername: string | null;
  avatarUrl: string | null;
  createdAt?: string;
};

export type Pet = {
  id: number;
  name: string;
  species: string;
  health: number;
  hunger: number;
  xp: number;
  level: number;
  imageUrl: string | null;
  projectId: number;
  createdAt: string;
};

export type Project = {
  id: number;
  githubRepoId: number;
  name: string;
  fullName: string | null;
  mainLanguage: string | null;
  tools: string[];
  lastSyncedAt: string | null;
  pet: Pet | null;
};

export type Commit = {
  sha: string;
  message: string;
  author: string;
  date: string;
};

export type SyncResult = {
  synced: number;
  detail: {
    repo: string;
    status: 'ok' | 'error';
    tools?: string[];
    language?: string;
    error?: string;
  }[];
};
