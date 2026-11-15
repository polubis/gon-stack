import type { Registry } from './registry';
import type { Store } from './store';
import type { Folder, KnowledgeNode, NodeId } from '../domain/models';

export const createFacade = (store: Store, trigger: Registry['trigger']) => ({
  load: () => trigger('[TRIGGER]_LOAD'),
  createNode: (node: KnowledgeNode) =>
    trigger('[TRIGGER]_CREATE_NODE', { node }),
  updateNode: (node: KnowledgeNode, message?: string) =>
    trigger('[TRIGGER]_UPDATE_NODE', { node, message }),
  deleteNode: (id: NodeId) => trigger('[TRIGGER]_DELETE_NODE', { id }),
  createFolder: (folder: Folder) =>
    trigger('[TRIGGER]_CREATE_FOLDER', { folder }),
  dismissNotice: () => trigger('[TRIGGER]_DISMISS_NOTICE'),
  useNodes: () => store.$nodes.use(),
  useFolders: () => store.$folders.use(),
  useCategories: () => store.$categories.use(),
  usePriorities: () => store.$priorities.use(),
  useInitializing: () => store.$initializing.use(),
  useIsLoading: () => store.$isLoading.use(),
  useError: () => store.$error.use(),
  useNotice: () => store.$notice.use(),
});

export type Facade = ReturnType<typeof createFacade>;
