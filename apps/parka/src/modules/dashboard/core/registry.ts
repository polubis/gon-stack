import type { Store } from './store';
import { load } from './handlers/load';
import { loadExpenses } from './handlers/load-expenses';
import { updateExpense } from './handlers/update-expense';
import { removeExpense } from './handlers/delete-expense';
import { loadLimits } from './handlers/load-limits';
import { createLimit } from './handlers/create-limit';
import { updateLimit } from './handlers/update-limit';
import { removeLimit } from './handlers/delete-limit';
import { createGoal } from './handlers/create-goal';
import { loadRecurring } from './handlers/load-recurring';
import { createRecurring } from './handlers/create-recurring';
import { updateRecurring } from './handlers/update-recurring';
import { removeRecurring } from './handlers/delete-recurring';
import { dismissNotice } from './handlers/dismiss-notice';
import { createBus } from './bus';

export const createRegistry = (store: Store) => {
  const bus = createBus();

  const register = bus.createRegistry(
    load(store, bus),
    loadExpenses(store, bus),
    updateExpense(store, bus),
    removeExpense(store, bus),
    loadLimits(store, bus),
    createLimit(store, bus),
    updateLimit(store, bus),
    removeLimit(store, bus),
    createGoal(store, bus),
    loadRecurring(store, bus),
    createRecurring(store, bus),
    updateRecurring(store, bus),
    removeRecurring(store, bus),
    dismissNotice(store, bus),
  );

  return { trigger: bus.trigger, register };
};

export type Registry = ReturnType<typeof createRegistry>;
