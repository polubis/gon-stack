import type { Registry } from './registry';
import type { Store } from './store';
import type { Month, Range } from '../domain/models';

export const createFacade = (store: Store, trigger: Registry['trigger']) => {
  return {
    load: (month: Month, range: Range) =>
      trigger('[TRIGGER]_LOAD', { month, range }),
    useData: () => store.$data.use(),
    useInitializing: () => store.$initializing.use(),
    useIsLoading: () => store.$isLoading.use(),
    useError: () => store.$error.use(),
  };
};

export type Facade = ReturnType<typeof createFacade>;
