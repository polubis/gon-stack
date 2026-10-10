import { useSortedCategories } from '@/shared/expense-category/sorted';
import type { Registry } from './registry';
import type { Store } from './store';
import type { Category, CategoryId } from '../domain/models';

export const createFacade = (store: Store, trigger: Registry['trigger']) => {
  return {
    load: () => trigger('[TRIGGER]_LOAD'),
    create: (category: Category) => trigger('[TRIGGER]_CREATE', { category }),
    update: (category: Category) => trigger('[TRIGGER]_UPDATE', { category }),
    remove: (id: CategoryId) => trigger('[TRIGGER]_REMOVE', { id }),
    dismissNotice: () => trigger('[TRIGGER]_DISMISS_NOTICE'),
    useCategories: () => useSortedCategories(store.$categories.use()),
    useInitializing: () => store.$initializing.use(),
    useIsLoading: () => store.$isLoading.use(),
    useError: () => store.$error.use(),
    useNotice: () => store.$notice.use(),
  };
};

export type Facade = ReturnType<typeof createFacade>;
