import type { Store } from './store';
import { load } from './handlers/load';
import { refresh } from './handlers/refresh';
import { create } from './handlers/create';
import { update } from './handlers/update';
import { remove } from './handlers/remove';
import { dismissNotice } from './handlers/dismiss-notice';
import { createBus } from './bus';

export const createRegistry = (store: Store) => {
  const bus = createBus();

  const register = bus.createRegistry(
    load(store, bus),
    refresh(store, bus),
    create(store, bus),
    update(store, bus),
    remove(store, bus),
    dismissNotice(store, bus),
  );

  return { trigger: bus.trigger, register };
};

export type Registry = ReturnType<typeof createRegistry>;
