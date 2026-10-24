import type { Registry } from './registry';
import type { Store } from './store';
import type {
  BacklogTask,
  Category,
  CategoryId,
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
    createBacklogTask: (task: BacklogTask) =>
      trigger('[TRIGGER]_CREATE_BACKLOG_TASK', { task }),
    updateBacklogTask: (task: BacklogTask) =>
      trigger('[TRIGGER]_UPDATE_BACKLOG_TASK', { task }),
    moveBacklogTask: (id: TaskId, day: string, label: string) =>
      trigger('[TRIGGER]_MOVE_BACKLOG_TASK', { id, day, label }),
    updateTask: (task: Task, message?: string) =>
      trigger('[TRIGGER]_UPDATE_TASK', { task, message }),
    sendTaskToBacklog: (id: TaskId) =>
      trigger('[TRIGGER]_SEND_TASK_TO_BACKLOG', { id }),
    deleteTask: (id: TaskId) => trigger('[TRIGGER]_DELETE_TASK', { id }),
    createRecurring: (recurring: Recurring) =>
      trigger('[TRIGGER]_CREATE_RECURRING', { recurring }),
    stopRecurring: (id: RecurringId) =>
      trigger('[TRIGGER]_STOP_RECURRING', { id }),
    createCategory: (category: Category) =>
      trigger('[TRIGGER]_CREATE_CATEGORY', { category }),
    updateCategory: (category: Category) =>
      trigger('[TRIGGER]_UPDATE_CATEGORY', { category }),
    deleteCategory: (id: CategoryId) =>
      trigger('[TRIGGER]_DELETE_CATEGORY', { id }),
    createPriority: (priority: Priority) =>
      trigger('[TRIGGER]_CREATE_PRIORITY', { priority }),
    dismissNotice: () => trigger('[TRIGGER]_DISMISS_NOTICE'),
    useTasks: () => store.$tasks.use(),
    useBacklog: () => store.$backlog.use(),
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
