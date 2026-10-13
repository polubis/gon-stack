import type { Store } from './store';
import { load } from './handlers/load';
import { update } from './handlers/update';
import { loadAvatar } from './handlers/load-avatar';
import { uploadAvatar } from './handlers/upload-avatar';
import { signOut } from './handlers/sign-out';
import { dismissNotice } from './handlers/dismiss-notice';
import { createBus } from './bus';

export const createRegistry = (store: Store) => {
  const bus = createBus();

  const register = bus.createRegistry(
    load(store, bus),
    update(store, bus),
    loadAvatar(store, bus),
    uploadAvatar(store, bus),
    signOut(store, bus),
    dismissNotice(store, bus),
  );

  return { trigger: bus.trigger, register };
};

export type Registry = ReturnType<typeof createRegistry>;
