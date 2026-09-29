import type { Registry } from './registry';
import type { Store } from './store';
import type { Goal, Limit } from '../domain/models';

export const createFacade = (store: Store, trigger: Registry['trigger']) => {
  return {
    load: () => trigger('[TRIGGER]_LOAD'),
    createLimit: (limit: Limit) => trigger('[TRIGGER]_CREATE_LIMIT', { limit }),
    updateLimit: (limit: Limit) => trigger('[TRIGGER]_UPDATE_LIMIT', { limit }),
    createGoal: (goal: Goal) => trigger('[TRIGGER]_CREATE_GOAL', { goal }),
    dismissNotice: () => trigger('[TRIGGER]_DISMISS_NOTICE'),
    useLimits: () => store.$limits.use(),
    useGoals: () => store.$goals.use(),
    useCategories: () => store.$categories.use(),
    useExpenses: () => store.$expenses.use(),
    useInitializing: () => store.$initializing.use(),
    useIsLoading: () => store.$isLoading.use(),
    useError: () => store.$error.use(),
    useNotice: () => store.$notice.use(),
  };
};

export type Facade = ReturnType<typeof createFacade>;
