import type { Store } from './store';
import { requestLoad } from './handlers/request-load';
import { load } from './handlers/load';
import { updateExpense } from './handlers/update-expense';
import { removeExpense } from './handlers/delete-expense';
import { createLimit } from './handlers/create-limit';
import { updateLimit } from './handlers/update-limit';
import { removeLimit } from './handlers/delete-limit';
import { updateRecurring } from './handlers/update-recurring';
import { removeRecurring } from './handlers/delete-recurring';
import { dismissNotice } from './handlers/dismiss-notice';
import { reloadOnRecurringChange } from './handlers/reload-on-recurring-change';
import { reloadOnExpenseChange } from './handlers/reload-on-expense-change';
import { createBus } from './bus';

export const createRegistry = (store: Store) => {
  const bus = createBus();

  const register = bus.createRegistry(
    requestLoad(store, bus),
    load(store, bus),
    updateExpense(store, bus),
    removeExpense(store, bus),
    createLimit(store, bus),
    updateLimit(store, bus),
    removeLimit(store, bus),
    updateRecurring(store, bus),
    removeRecurring(store, bus),
    dismissNotice(store, bus),
    reloadOnRecurringChange(store, bus),
    reloadOnExpenseChange(store, bus),
  );

  return { trigger: bus.trigger, register };
};

export type Registry = ReturnType<typeof createRegistry>;
