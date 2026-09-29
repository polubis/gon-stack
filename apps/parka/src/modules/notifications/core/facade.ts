import type { Registry } from './registry';
import type { Store } from './store';

export const createFacade = (store: Store, trigger: Registry['trigger']) => {
  return {
    load: () => trigger('[TRIGGER]_LOAD'),
    useNotifications: () => store.$notifications.use(),
    useInitializing: () => store.$initializing.use(),
    useIsLoading: () => store.$isLoading.use(),
    useError: () => store.$error.use(),
  };
};

export type Facade = ReturnType<typeof createFacade>;
