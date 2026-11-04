import type { Store } from './store';
import { load } from './handlers/load';
import { create } from './handlers/create';
import { revoke } from './handlers/revoke';
import { resume } from './handlers/resume';
import { remove } from './handlers/remove';
import { dismissSecret } from './handlers/dismiss-secret';
import { dismissNotice } from './handlers/dismiss-notice';
import { createBus } from './bus';

export const createRegistry = (store: Store) => {
  const bus = createBus();

  const register = bus.createRegistry(
    load(store, bus),
    create(store, bus),
    revoke(store, bus),
    resume(store, bus),
    remove(store, bus),
    dismissSecret(store, bus),
    dismissNotice(store, bus),
  );

  return { trigger: bus.trigger, register };
};

export type Registry = ReturnType<typeof createRegistry>;
