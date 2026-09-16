import type { Registry } from './registry';
import type { Store } from './store';

export const createFacade = (store: Store, trigger: Registry['trigger']) => {
  return {
    loadSummary: (month: string) =>
      trigger('[TRIGGER]_LOAD_SUMMARY', { month }),
    useFetchedSummary: () => store.$fetchedSummary.use(),
  };
};

export type Facade = ReturnType<typeof createFacade>;
