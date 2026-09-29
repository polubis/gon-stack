import type { Registry } from './registry';
import type { Store } from './store';
import type { Credentials } from '../domain/models';

export const createFacade = (store: Store, trigger: Registry['trigger']) => {
  return {
    submit: (credentials: Credentials) =>
      trigger('[TRIGGER]_SUBMIT', { credentials }),
    usePending: () => store.$pending.use(),
    useError: () => store.$error.use(),
    useRedirected: () => store.$redirected.use(),
    useAwaitingConfirmation: () => store.$awaitingConfirmation.use(),
  };
};

export type Facade = ReturnType<typeof createFacade>;
