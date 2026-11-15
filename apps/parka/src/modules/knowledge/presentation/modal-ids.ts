import type { FolderId, NodeId } from '../domain/models';

/** URL ids of the knowledge modals (see `shared/router/modal-stack`). */
export const NEW_NODE_MODAL = 'node-new';
export const NEW_FOLDER_MODAL = 'folder-new';

const NEW_IN_PREFIX = 'node-new:';
const EDIT_PREFIX = 'node-edit:';
const DELETE_PREFIX = 'node-delete:';

const after = (modal: string, prefix: string): string | null =>
  modal.startsWith(prefix) ? modal.slice(prefix.length) : null;

/** Add-node form with the folder already chosen. */
export const newNodeInModal = (id: FolderId): string => `${NEW_IN_PREFIX}${id}`;
export const editNodeModal = (id: NodeId): string => `${EDIT_PREFIX}${id}`;
export const deleteNodeModal = (id: NodeId): string => `${DELETE_PREFIX}${id}`;

export const newNodeFolderOf = (modal: string): FolderId | null =>
  after(modal, NEW_IN_PREFIX) as FolderId | null;
export const editedNodeOf = (modal: string): NodeId | null =>
  after(modal, EDIT_PREFIX) as NodeId | null;
export const deletedNodeOf = (modal: string): NodeId | null =>
  after(modal, DELETE_PREFIX) as NodeId | null;
