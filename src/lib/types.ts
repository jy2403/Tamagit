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
  happiness: number;
  lifeBranch: string;
  imageUrl: string | null;
  projectId: number;
  createdAt: string;
  updatedAt: string;
};

export type PetDetail = Pet & {
  project: {
    id: number;
    name: string;
    fullName: string | null;
    defaultBranch: string | null;
    ownerId: number;
  };
  items: PetItem[];
};

export type ProjectPet = {
  pet: Pet | null;
  project: {
    id: number;
    name: string;
    fullName: string | null;
    defaultBranch: string | null;
    ownerId: number;
  };
  hiddenByUser: boolean;
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
  defaultBranch: string | null;
  mainLanguage: string | null;
  tools: string[];
  lastSyncedAt: string | null;
  pet: Pet | null;
};

export type Branch = {
  name: string;
  default?: boolean;
};

export type CommitAnalysis = {
  id: number;
  sha: string;
  message: string;
  author: string | null;
  date: string | null;
  commitUrl: string | null;
  branch: string | null;
  score: number;
  findings: string[];
  summary: string | null;
  fedAt: string | null;
};

export type AnalyzeResult = {
  analyzed: number;
  newCommits: number;
  latest: {
    sha: string;
    branch: string;
    score: number;
    message: string;
    date: string | null;
    summary?: string | null;
  } | null;
};

export type Dish = {
  commitId: number;
  sha: string;
  message: string;
  summary: string | null;
  date: string | null;
  branch: string | null;
  score: number;
  tier: 'small' | 'medium' | 'large';
  fed: boolean;
  food: {
    id: number;
    name: string;
    imageUrl: string | null;
    size: string;
    hungerRestore: number;
  } | null;
};

export type FeedResult = {
  pet: Pet;
  dish: {
    commitId: number;
    tier: 'small' | 'medium' | 'large';
    healed: { hungerRestore: number; health: number };
  };
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
  size: string;
  hungerRestore: number;
  price: number;
  createdAt: string;
  updatedAt: string;
};
