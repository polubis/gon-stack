import type { Store } from './store';
import { load } from './handlers/load';
import { createTask } from './handlers/create-task';
import { createBacklogTask } from './handlers/create-backlog-task';
import { updateBacklogTask } from './handlers/update-backlog-task';
import { moveBacklogTask } from './handlers/move-backlog-task';
import { sendTaskToBacklog } from './handlers/send-task-to-backlog';
import { updateTask } from './handlers/update-task';
import { deleteTask } from './handlers/delete-task';
import { createRecurring } from './handlers/create-recurring';
import { stopRecurring } from './handlers/stop-recurring';
import { createCategory } from './handlers/create-category';
import { updateCategory } from './handlers/update-category';
import { deleteCategory } from './handlers/delete-category';
import { createPriority } from './handlers/create-priority';
import { dismissNotice } from './handlers/dismiss-notice';
import { createBus } from './bus';

export const createRegistry = (store: Store) => {
  const bus = createBus();

  const register = bus.createRegistry(
    load(store, bus),
    createTask(store, bus),
    createBacklogTask(store, bus),
    updateBacklogTask(store, bus),
    moveBacklogTask(store, bus),
    updateTask(store, bus),
    sendTaskToBacklog(store, bus),
    deleteTask(store, bus),
    createRecurring(store, bus),
    stopRecurring(store, bus),
    createCategory(store, bus),
    updateCategory(store, bus),
    deleteCategory(store, bus),
    createPriority(store, bus),
    dismissNotice(store, bus),
  );

  return { trigger: bus.trigger, register };
};

export type Registry = ReturnType<typeof createRegistry>;
