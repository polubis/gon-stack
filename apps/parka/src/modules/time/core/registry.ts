import type { Store } from './store';
import { load } from './handlers/load';
import { createTask } from './handlers/create-task';
import { updateTask } from './handlers/update-task';
import { deleteTask } from './handlers/delete-task';
import { createCategory } from './handlers/create-category';
import { createPriority } from './handlers/create-priority';
import { dismissNotice } from './handlers/dismiss-notice';
import { createBus } from './bus';

export const createRegistry = (store: Store) => {
  const bus = createBus();

  const register = bus.createRegistry(
    load(store, bus),
    createTask(store, bus),
    updateTask(store, bus),
    deleteTask(store, bus),
    createCategory(store, bus),
    createPriority(store, bus),
    dismissNotice(store, bus),
  );

  return { trigger: bus.trigger, register };
};

export type Registry = ReturnType<typeof createRegistry>;
