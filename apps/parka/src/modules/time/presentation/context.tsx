import { useEffect, useLayoutEffect, useState } from 'react';
import { context } from '@repo/react-kit/context';
import {
  readQueryParam,
  writeQueryParam,
  writeQueryParams,
} from '@/shared/router/navigation';
import { isDay, todayDay } from '@/shared/period/period';
import { createMediator } from '../core/mediator';
import {
  DATE_PARAM,
  FEATURE_NAME,
  VIEW_PARAM,
  type TimeView,
} from '../configuration/constraints';
import { sortByUsage } from '../domain/category-usage';
import { newCategoryId, newPriorityId } from '../domain/ids';
import type { Category, Priority } from '../domain/models';
import { resetTimeReads } from '../integration/repository';
import { useDataChanges } from '@/shared/data-sync/presentation/use-data-changes';
import { useClock } from './clock';

const dateFromUrl = (): string => {
  const value = readQueryParam(DATE_PARAM);
  return value !== null && isDay(value) ? value : todayDay();
};

const viewFromUrl = (): TimeView =>
  readQueryParam(VIEW_PARAM) === 'stats' ? 'stats' : 'tasks';

/** Per-viewer preference: remembered across visits, safe to lose. */
const OPEN_ONLY_KEY = 'parka:time-open-only';

const openOnlyFromStorage = (): boolean => {
  try {
    return window.localStorage.getItem(OPEN_ONLY_KEY) === '1';
  } catch {
    return false;
  }
};

const saveOpenOnly = (value: boolean) => {
  try {
    window.localStorage.setItem(OPEN_ONLY_KEY, value ? '1' : '0');
  } catch {
    // Storage blocked: the filter still works for this visit.
  }
};

/**
 * The module store plus the viewed day (`anchor`, mirrored in the `date`
 * query param) and the clock. `newCategory` / `newPriority` hold the last
 * created item so the task form below its stacked dialog can select it.
 */
export const [Provider, useContext] = context(FEATURE_NAME, () => {
  const [{ facade, register }] = useState(createMediator);
  const [anchor, setAnchorState] = useState(dateFromUrl);
  const [view, setViewState] = useState(viewFromUrl);
  const [openOnly, setOpenOnlyState] = useState(openOnlyFromStorage);
  const [newCategory, setNewCategory] = useState<Category>();
  const [newPriority, setNewPriority] = useState<Priority>();
  const now = useClock();
  const loaded = facade.useLoaded();
  const tasks = facade.useTasks();
  const backlog = facade.useBacklog();
  const categories = facade.useCategories();

  useLayoutEffect(() => {
    const unsub = register();
    return () => {
      unsub();
      // Leaving the view drops what it read: the next visit starts clean.
      resetTimeReads();
    };
  }, [register]);

  // MCP changed the data: reload quietly.
  useDataChanges('time', facade.refresh);

  // Back / Forward may land on another `date`.
  useEffect(() => {
    const onPop = () => {
      setAnchorState(dateFromUrl());
      setViewState(viewFromUrl());
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  return {
    anchor,
    setAnchor: (day: string) => {
      setAnchorState(day);
      writeQueryParam(DATE_PARAM, day);
    },
    /** Tab of the screen: the task lists or their statistics (`view` param). */
    view,
    setView: (next: TimeView) => {
      setViewState(next);
      writeQueryParams({ [VIEW_PARAM]: next === 'stats' ? 'stats' : null });
    },
    now,
    newCategory,
    newPriority,
    tasks,
    /** Tasks the lists show: `tasks` minus done ones while `openOnly` is on. */
    visibleTasks: openOnly ? tasks.filter((task) => !task.done) : tasks,
    openOnly,
    setOpenOnly: (next: boolean) => {
      setOpenOnlyState(next);
      saveOpenOnly(next);
    },
    backlog,
    /** Most used first (all tasks and backlog), ties keep stored order. */
    categories: sortByUsage(categories, [...tasks, ...backlog]),
    priorities: facade.usePriorities(),
    statuses: facade.useStatuses(),
    initializing: facade.useInitializing(),
    loaded,
    isLoading: facade.useIsLoading(),
    error: facade.useError(),
    notice: facade.useNotice(),
    load: facade.load,
    createTask: facade.createTask,
    createBacklogTask: facade.createBacklogTask,
    updateBacklogTask: facade.updateBacklogTask,
    moveBacklogTask: facade.moveBacklogTask,
    updateTask: facade.updateTask,
    sendTaskToBacklog: facade.sendTaskToBacklog,
    deleteTask: facade.deleteTask,
    saveStatuses: facade.saveStatuses,
    createRecurring: facade.createRecurring,
    stopRecurring: facade.stopRecurring,
    updateCategory: facade.updateCategory,
    deleteCategory: facade.deleteCategory,
    dismissNotice: facade.dismissNotice,
    notify: facade.notify,
    createCategory: (input: Omit<Category, 'id'>) => {
      const category = { ...input, id: newCategoryId() };
      facade.createCategory(category);
      setNewCategory(category);
    },
    createPriority: (input: Omit<Priority, 'id'>) => {
      const priority = { ...input, id: newPriorityId() };
      facade.createPriority(priority);
      setNewPriority(priority);
    },
  };
});
