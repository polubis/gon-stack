import type { Store } from './store';
import { submit } from './handlers/submit';
import { createBus } from './bus';

export const createRegistry = (store: Store) => {
  const bus = createBus();

  const register = bus.createRegistry(submit(store, bus));

  return { trigger: bus.trigger, register };
};

export type Registry = ReturnType<typeof createRegistry>;
