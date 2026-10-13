import type { Store } from './store';
import { load } from './handlers/load';
import { loadMore } from './handlers/load-more';
import { markRead } from './handlers/mark-read';
import { markAllRead } from './handlers/mark-all-read';
import { dismissNotice } from './handlers/dismiss-notice';
import { createBus } from './bus';

export const createRegistry = (store: Store) => {
  const bus = createBus();

  const register = bus.createRegistry(
    load(store, bus),
    loadMore(store, bus),
    markRead(store, bus),
    markAllRead(store, bus),
    dismissNotice(store, bus),
  );

  return { trigger: bus.trigger, register };
};

export type Registry = ReturnType<typeof createRegistry>;
