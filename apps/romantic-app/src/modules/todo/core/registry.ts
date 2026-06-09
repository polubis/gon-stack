import { createBus } from './bus';
import type { Store } from './store';
import { bootstrap } from './handlers/bootstrap';
import { selectThread } from './handlers/select-thread';
import { updateDraft } from './handlers/update-draft';
import { sendMessage } from './handlers/send-message';
import { retryConnection } from './handlers/retry-connection';
import { updateSearch } from './handlers/update-search';

export const createRegistry = (store: Store) => {
  const bus = createBus();

  const register = bus.createRegistry(
    bootstrap(store, bus),
    selectThread(store, bus),
    updateDraft(store, bus),
    sendMessage(store, bus),
    retryConnection(store, bus),
    updateSearch(store, bus),
  );

  return { trigger: bus.trigger, register };
};

export type Registry = ReturnType<typeof createRegistry>;
