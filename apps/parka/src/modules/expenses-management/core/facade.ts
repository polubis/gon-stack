import type { Registry } from './registry';
import type { Store } from './store';
import type { NewExpense, NewRecurring } from '../domain/models';

export const createFacade = (store: Store, trigger: Registry['trigger']) => {
  return {
    load: () => trigger('[TRIGGER]_LOAD'),
    createExpense: (expense: NewExpense) =>
      trigger('[TRIGGER]_CREATE_EXPENSE', { expense }),
    createRecurring: (recurring: NewRecurring) =>
      trigger('[TRIGGER]_CREATE_RECURRING', { recurring }),
    scanReceipt: (file: File) => trigger('[TRIGGER]_SCAN_RECEIPT', { file }),
    dismissScan: () => trigger('[TRIGGER]_DISMISS_SCAN'),
    dismissNotice: () => trigger('[TRIGGER]_DISMISS_NOTICE'),
    useCategories: () => store.$categories.use(),
    useInitializing: () => store.$initializing.use(),
    useIsLoading: () => store.$isLoading.use(),
    useError: () => store.$error.use(),
    useSaving: () => store.$saving.use(),
    useSaved: () => store.$saved.use(),
    useScan: () => store.$scan.use(),
    useScanned: () => store.$scanned.use(),
    useNotice: () => store.$notice.use(),
  };
};

export type Facade = ReturnType<typeof createFacade>;
