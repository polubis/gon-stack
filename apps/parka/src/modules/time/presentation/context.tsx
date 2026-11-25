import { useEffect, useLayoutEffect, useState } from 'react';
import { context } from '@repo/react-kit/context';
import {
  readQueryParam,
  writeQueryParam,
  writeQueryParams,
} from '@/shared/router/navigation';
import { APP_ROUTER, normalizePath } from '@/shared/router/routes';
import { isDay, periodContaining, todayDay } from '@/shared/period/period';
import { createMediator } from '../core/mediator';
import { DATE_PARAM, FEATURE_NAME } from '../configuration/constraints';
import {
  applyFilters,
  FILTER_PARAMS,
  filtersFromParams,
  filtersToParams,
  type TaskFilters,
} from '../domain/filters';
import { sortByUsage } from '../domain/category-usage';
import { newCategoryId, newPriorityId } from '../domain/ids';
import type { Category, Priority } from '../domain/models';
import { resetTimeReads } from '../integration/repository';
import { useDataChanges } from '@/shared/data-sync/presentation/use-data-changes';
import {
  readFilterMemory,
  writeFilterMemory,
} from '@/shared/filter-memory/integration/storage';
import { useClock } from './clock';

const dayParam = (name: string): string | null => {
  const value = readQueryParam(name);
  return value !== null && isDay(value) ? value : null;
};

/** The viewed day, or the first and last day of the own range route. */
const viewFromUrl = (): { anchor: string; to?: string } => {
  if (normalizePath(window.location.pathname) !== APP_ROUTER.timeRange())
    return { anchor: dayParam(DATE_PARAM) ?? todayDay(), to: undefined };
  const fallback = periodContaining('custom', todayDay());
  const from = dayParam('from') ?? fallback.from;
  const to = dayParam('to') ?? fallback.to;
  return from <= to ? { anchor: from, to } : { anchor: to, to: from };
};

/** Filters of the URL; without any, the ones remembered on this device. */
const filtersFromUrl = (): TaskFilters => {
  const url = new URLSearchParams(window.location.search);
  const given = Object.values(FILTER_PARAMS).some((name) => url.has(name));
  return filtersFromParams(given ? url : readFilterMemory('time'));
};

/**
 * The module store plus the viewed day (`anchor`, mirrored in the `date`
 * query param; an own range keeps `from` and `to` instead) and the clock. `newCategory` / `newPriority` hold the last
 * created item so the task form below its stacked dialog can select it.
 */
export const [Provider, useContext] = context(FEATURE_NAME, () => {
  const [{ facade, register }] = useState(createMediator);
  const [view, setView] = useState(viewFromUrl);
  const { anchor, to: rangeTo } = view;
  const [filters, setFiltersState] = useState(filtersFromUrl);
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
      setView(viewFromUrl());
      setFiltersState(filtersFromUrl());
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  return {
    /** Viewed day; the first day of an own range. */
    anchor,
    /** Last day of an own range, `undefined` in the other views. */
    rangeTo,
    setAnchor: (day: string) => {
      setView({ anchor: day, to: undefined });
      writeQueryParam(DATE_PARAM, day);
    },
    setRange: (from: string, to: string) => {
      setView({ anchor: from, to });
      writeQueryParams({ from, to });
    },
    /** Takes a view the route change already put in the URL. */
    settle: (day: string, to?: string) => setView({ anchor: day, to }),
    now,
    newCategory,
    newPriority,
    tasks,
    /** Tasks the lists show: `tasks` narrowed by the filters. */
    visibleTasks: applyFilters(tasks, filters),
    /** Filters and sort of the lists; mirrored in the query params. */
    filters,
    setFilters: (next: TaskFilters) => {
      setFiltersState(next);
      writeQueryParams(filtersToParams(next));
      writeFilterMemory('time', filtersToParams(next));
    },
    backlog,
    /** Most used first (all tasks and backlog), ties keep stored order. */
    categories: sortByUsage(categories, [...tasks, ...backlog]),
    priorities: facade.usePriorities(),
    statuses: facade.useStatuses(),
    initializing: facade.useInitializing(),
    loaded,
    /** Writes in flight. */
    pending: facade.usePending(),
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
    updateCategory: facade.updateCategory,
    deleteCategory: facade.deleteCategory,
    updatePriority: facade.updatePriority,
    deletePriority: facade.deletePriority,
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
