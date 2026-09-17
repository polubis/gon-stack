import type { Store } from './store';
import { load } from './handlers/load';
import { createBus } from './bus';

export const createRegistry = (store: Store) => {
  const bus = createBus();

  const register = bus.createRegistry(load(store, bus));

  return { trigger: bus.trigger, register };
};

export type Registry = ReturnType<typeof createRegistry>;
