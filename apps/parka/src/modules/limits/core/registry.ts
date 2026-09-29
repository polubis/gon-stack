import type { Store } from './store';
import { load } from './handlers/load';
import { createLimit } from './handlers/create-limit';
import { updateLimit } from './handlers/update-limit';
import { createGoal } from './handlers/create-goal';
import { dismissNotice } from './handlers/dismiss-notice';
import { createBus } from './bus';

export const createRegistry = (store: Store) => {
  const bus = createBus();

  const register = bus.createRegistry(
    load(store, bus),
    createLimit(store, bus),
    updateLimit(store, bus),
    createGoal(store, bus),
    dismissNotice(store, bus),
  );

  return { trigger: bus.trigger, register };
};

export type Registry = ReturnType<typeof createRegistry>;
