import type { FolderId, NodeId } from './models';

/** Client-generated ids, valid for any backend (`min(1)`). */
export const newNodeId = (): NodeId => `knode-${crypto.randomUUID()}` as NodeId;

export const newFolderId = (): FolderId =>
  `kfolder-${crypto.randomUUID()}` as FolderId;
