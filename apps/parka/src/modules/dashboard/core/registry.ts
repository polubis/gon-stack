import type { Store } from './store';
import { loadSummary } from './handlers/load-summary';
import { createBus } from './bus';

export const createRegistry = (store: Store) => {
  const bus = createBus();

  const register = bus.createRegistry(loadSummary(store, bus));

  return { trigger: bus.trigger, register };
};

export type Registry = ReturnType<typeof createRegistry>;
