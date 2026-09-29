import type { Store } from './store';
import { load } from './handlers/load';
import { save } from './handlers/save';
import { dismissNotice } from './handlers/dismiss-notice';
import { createBus } from './bus';

export const createRegistry = (store: Store) => {
  const bus = createBus();

  const register = bus.createRegistry(
    load(store, bus),
    save(store, bus),
    dismissNotice(store, bus),
  );

  return { trigger: bus.trigger, register };
};

export type Registry = ReturnType<typeof createRegistry>;
