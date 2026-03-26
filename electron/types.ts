export type FileRecord = {
  id: string;
  name: string;
  path: string;
  extension: string;
  type: string;
  size: number;
  createdAt: string;
  modifiedAt: string;
  tags: string[];
  favorite: boolean;
  parentFolder: string;
};

export type Settings = {
  scanRoots: string[];
  theme: 'light' | 'dark';
  viewMode: 'table' | 'grid';
};

export type AutoOrganizeRule = {
  mode: 'type' | 'extension' | 'month' | 'year';
  destination: string;
};

export type MovePlanItem = {
  source: string;
  destination: string;
};

export type UndoOperation = {
  moves: MovePlanItem[];
  timestamp: string;
};
