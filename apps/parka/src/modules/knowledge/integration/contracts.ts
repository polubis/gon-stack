/**
 * Wire shapes of the future knowledge API (`/api/knowledge/**`). The backend
 * will answer exactly these; until then the mock gateway does.
 */
export type CategoryDto = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

export type PriorityDto = { id: string; name: string; value: number };

export type FolderDto = { id: string; name: string; areaId: string };

export type NodeDto = {
  id: string;
  folderId: string;
  title: string;
  notes: string | null;
  categoryId: string;
  priorityId: string;
  tags: string[];
  status: string;
};

export type KnowledgeDto = {
  categories: CategoryDto[];
  priorities: PriorityDto[];
  folders: FolderDto[];
  nodes: NodeDto[];
};

/** The one seam to the backend: swap the mock for a fetch-based one. */
export type KnowledgeGateway = {
  read: () => Promise<KnowledgeDto>;
  createNode: (node: NodeDto) => Promise<NodeDto>;
  updateNode: (node: NodeDto) => Promise<NodeDto>;
  deleteNode: (id: string) => Promise<void>;
  createFolder: (folder: FolderDto) => Promise<FolderDto>;
};
