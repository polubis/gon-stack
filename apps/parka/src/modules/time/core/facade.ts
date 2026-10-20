import type { Registry } from './registry';
import type { Store } from './store';
import type {
  Category,
  Priority,
  Recurring,
  RecurringId,
  Task,
  TaskId,
} from '../domain/models';

export const createFacade = (store: Store, trigger: Registry['trigger']) => {
  return {
    load: (from: string, to: string) => trigger('[TRIGGER]_LOAD', { from, to }),
    createTask: (task: Task) => trigger('[TRIGGER]_CREATE_TASK', { task }),
    updateTask: (task: Task) => trigger('[TRIGGER]_UPDATE_TASK', { task }),
    deleteTask: (id: TaskId) => trigger('[TRIGGER]_DELETE_TASK', { id }),
    createRecurring: (recurring: Recurring) =>
      trigger('[TRIGGER]_CREATE_RECURRING', { recurring }),
    stopRecurring: (id: RecurringId) =>
      trigger('[TRIGGER]_STOP_RECURRING', { id }),
    createCategory: (category: Category) =>
      trigger('[TRIGGER]_CREATE_CATEGORY', { category }),
    createPriority: (priority: Priority) =>
      trigger('[TRIGGER]_CREATE_PRIORITY', { priority }),
    dismissNotice: () => trigger('[TRIGGER]_DISMISS_NOTICE'),
    useTasks: () => store.$tasks.use(),
    useCategories: () => store.$categories.use(),
    usePriorities: () => store.$priorities.use(),
    useLoaded: () => store.$loaded.use(),
    useInitializing: () => store.$initializing.use(),
    useIsLoading: () => store.$isLoading.use(),
    useError: () => store.$error.use(),
    useNotice: () => store.$notice.use(),
  };
};

export type Facade = ReturnType<typeof createFacade>;
