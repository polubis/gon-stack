import type { Store } from './store';
import { load } from './handlers/load';
import { createExpense } from './handlers/create-expense';
import { createRecurring } from './handlers/create-recurring';
import { scanReceipt } from './handlers/scan-receipt';
import { dismissScan } from './handlers/dismiss-scan';
import { dismissNotice } from './handlers/dismiss-notice';
import { createBus } from './bus';

export const createRegistry = (store: Store) => {
  const bus = createBus();

  const register = bus.createRegistry(
    load(store, bus),
    createExpense(store, bus),
    createRecurring(store, bus),
    scanReceipt(store, bus),
    dismissScan(store, bus),
    dismissNotice(store, bus),
  );

  return { trigger: bus.trigger, register };
};

export type Registry = ReturnType<typeof createRegistry>;
