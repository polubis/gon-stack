import type {
  Category,
  Folder,
  KnowledgeNode,
  NodeId,
  Priority,
} from '../domain/models';
import { MOCK_LATENCY_MS } from '../configuration/constraints';
import type { KnowledgeGateway } from './contracts';
import { toCategory, toFolder, toNode, toPriority } from './mappers';
import { createMockGateway } from './mock-gateway';

export type KnowledgeData = {
  categories: Category[];
  priorities: Priority[];
  folders: Folder[];
  nodes: KnowledgeNode[];
};

/** Mock until the backend exists: replace this one line with a fetch gateway. */
let gateway: KnowledgeGateway = createMockGateway(MOCK_LATENCY_MS);

/** Swaps the backend (tests, or the real API later). */
export const useGateway = (next: KnowledgeGateway): void => {
  gateway = next;
};

/** Nothing else in this module talks to the backend. */
export const fetchKnowledge = async (): Promise<KnowledgeData> => {
  const dto = await gateway.read();
  return {
    categories: dto.categories.map(toCategory),
    priorities: dto.priorities.map(toPriority),
    folders: dto.folders.map(toFolder),
    nodes: dto.nodes.map(toNode),
  };
};

export const postNode = async (node: KnowledgeNode): Promise<KnowledgeNode> =>
  toNode(await gateway.createNode(node));

export const putNode = async (node: KnowledgeNode): Promise<KnowledgeNode> =>
  toNode(await gateway.updateNode(node));

export const removeNode = (id: NodeId): Promise<void> => gateway.deleteNode(id);

export const postFolder = async (folder: Folder): Promise<Folder> =>
  toFolder(await gateway.createFolder(folder));
