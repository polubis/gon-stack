import { useEffect, useLayoutEffect, useState } from 'react';
import { context } from '@repo/react-kit/context';
import { readQueryParam, writeQueryParam } from '@/shared/router/navigation';
import { isDay, todayDay } from '@/shared/period/period';
import { createMediator } from '../core/mediator';
import { DATE_PARAM, FEATURE_NAME } from '../configuration/constraints';
import { sortByUsage } from '../domain/category-usage';
import { newCategoryId, newPriorityId } from '../domain/ids';
import type { Category, Priority } from '../domain/models';
import { useClock } from './clock';

const dateFromUrl = (): string => {
  const value = readQueryParam(DATE_PARAM);
  return value !== null && isDay(value) ? value : todayDay();
};

/**
 * The module store plus the viewed day (`anchor`, mirrored in the `date`
 * query param) and the clock. `newCategory` / `newPriority` hold the last
 * created item so the task form below its stacked dialog can select it.
 */
export const [Provider, useContext] = context(FEATURE_NAME, () => {
  const [{ facade, register }] = useState(createMediator);
  const [anchor, setAnchorState] = useState(dateFromUrl);
  const [newCategory, setNewCategory] = useState<Category>();
  const [newPriority, setNewPriority] = useState<Priority>();
  const now = useClock();
  const loaded = facade.useLoaded();
  const tasks = facade.useTasks();
  const backlog = facade.useBacklog();
  const categories = facade.useCategories();

  useLayoutEffect(() => {
    const unsub = register();
    return () => unsub();
  }, [register]);

  // Back / Forward may land on another `date`.
  useEffect(() => {
    const onPop = () => setAnchorState(dateFromUrl());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  return {
    anchor,
    /** Day the shown data belongs to: lags behind `anchor` while a reload runs. */
    viewAnchor:
      loaded && (anchor < loaded.from || anchor > loaded.to)
        ? loaded.from
        : anchor,
    setAnchor: (day: string) => {
      setAnchorState(day);
      writeQueryParam(DATE_PARAM, day);
    },
    now,
    newCategory,
    newPriority,
    tasks,
    backlog,
    /** Most used first (loaded tasks and backlog), ties keep stored order. */
    categories: sortByUsage(categories, [...tasks, ...backlog]),
    priorities: facade.usePriorities(),
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
    createRecurring: facade.createRecurring,
    stopRecurring: facade.stopRecurring,
    updateCategory: facade.updateCategory,
    deleteCategory: facade.deleteCategory,
    dismissNotice: facade.dismissNotice,
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
