import type { Store } from './store';
import { load } from './handlers/load';
import { loadExpenses } from './handlers/load-expenses';
import { updateExpense } from './handlers/update-expense';
import { removeExpense } from './handlers/delete-expense';
import { dismissNotice } from './handlers/dismiss-notice';
import { createBus } from './bus';

export const createRegistry = (store: Store) => {
  const bus = createBus();

  const register = bus.createRegistry(
    load(store, bus),
    loadExpenses(store, bus),
    updateExpense(store, bus),
    removeExpense(store, bus),
    dismissNotice(store, bus),
  );

  return { trigger: bus.trigger, register };
};

export type Registry = ReturnType<typeof createRegistry>;
