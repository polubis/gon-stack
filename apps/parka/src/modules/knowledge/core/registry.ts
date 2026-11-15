import type { Store } from './store';
import { createBus } from './bus';
import { createFolder } from './handlers/create-folder';
import { createNode } from './handlers/create-node';
import { deleteNode } from './handlers/delete-node';
import { dismissNotice } from './handlers/dismiss-notice';
import { load } from './handlers/load';
import { updateNode } from './handlers/update-node';

export const createRegistry = (store: Store) => {
  const bus = createBus();

  const register = bus.createRegistry(
    load(store, bus),
    createNode(store, bus),
    updateNode(store, bus),
    deleteNode(store, bus),
    createFolder(store, bus),
    dismissNotice(store, bus),
  );

  return { trigger: bus.trigger, register };
};

export type Registry = ReturnType<typeof createRegistry>;
