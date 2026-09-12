import { type Store } from './store';
import { init } from './handlers/init';
import { next } from './handlers/next';
import { prev } from './handlers/prev';
import { skip } from './handlers/skip';
import { createBus } from './bus';

export const createRegistry = (store: Store) => {
  const bus = createBus();

  const register = bus.createRegistry(
    init(store, bus),
    next(store, bus),
    prev(store, bus),
    skip(store, bus),
  );

  return { trigger: bus.trigger, register };
};

export type Registry = ReturnType<typeof createRegistry>;
