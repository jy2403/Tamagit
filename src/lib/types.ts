export type User = {
  id: number;
  email: string | null;
  name: string | null;
  githubId: number | null;
  githubUsername: string | null;
  avatarUrl: string | null;
  isAdmin: boolean;
  isBanned: boolean;
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

export type PetDetail = Pet & {
  project: {
    id: number;
    name: string;
    fullName: string | null;
    ownerId: number;
  };
  items: PetItem[];
};

export type PetItem = {
  id: number;
  petId: number;
  itemId: number;
  quantity: number;
  createdAt: string;
  item: Item;
};

export type Notification = {
  id: number;
  userId: number;
  type: string;
  message: string;
  createdAt: string;
  readAt: string | null;
};

export type UserPets = {
  user: {
    id: number;
    name: string | null;
    githubUsername: string | null;
    avatarUrl: string | null;
    isAdmin: boolean;
  };
  pets: {
    pet: Pet & { projectName: string; projectFullName: string | null; itemCount: number };
  }[];
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

export type Item = {
  id: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  price: number;
  category: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Food = {
  id: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  hungerRestore: number;
  price: number;
  createdAt: string;
  updatedAt: string;
};
