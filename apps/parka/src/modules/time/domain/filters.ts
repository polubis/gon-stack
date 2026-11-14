import type {
  Category,
  CategoryId,
  Priority,
  PriorityId,
  Task,
} from './models';

export const STATUS_FILTERS = ['open', 'started', 'done'] as const;
export type StatusFilter = (typeof STATUS_FILTERS)[number];

export const TIMING_FILTERS = ['all', 'timed', 'whole-day'] as const;
export type TimingFilter = (typeof TIMING_FILTERS)[number];

export const RECURRING_FILTERS = ['all', 'only', 'none'] as const;
export type RecurringFilter = (typeof RECURRING_FILTERS)[number];

export const TASK_SORTS = ['time', 'priority', 'title'] as const;
export type TaskSort = (typeof TASK_SORTS)[number];

export const STATUS_LABELS: Record<StatusFilter, string> = {
  open: 'Niezrobione',
  started: 'W trakcie',
  done: 'Zrobione',
};

/** What narrows the task lists and how they are ordered; lives in the URL. */
export type TaskFilters = {
  query: string;
  /** Empty means any status. */
  statuses: StatusFilter[];
  /** Empty means any category. */
  categoryIds: CategoryId[];
  /** Empty means any priority. */
  priorityIds: PriorityId[];
  timing: TimingFilter;
  recurring: RecurringFilter;
  sort: TaskSort;
};

export const NO_FILTERS: TaskFilters = {
  query: '',
  statuses: [],
  categoryIds: [],
  priorityIds: [],
  timing: 'all',
  recurring: 'all',
  sort: 'time',
};

/** Query params of the filters (see `filtersFromParams`). */
export const FILTER_PARAMS = {
  query: 'q',
  statuses: 'status',
  categoryIds: 'cat',
  priorityIds: 'prio',
  timing: 'timing',
  recurring: 'rec',
  sort: 'sort',
} as const;

const oneOf = <T extends string>(
  options: readonly T[],
  value: string | null,
  fallback: T,
): T => options.find((option) => option === value) ?? fallback;

const listOf = (value: string | null): string[] =>
  value ? value.split(',').filter(Boolean) : [];

export const filtersFromParams = (params: URLSearchParams): TaskFilters => ({
  query: params.get(FILTER_PARAMS.query) ?? '',
  statuses: STATUS_FILTERS.filter((status) =>
    listOf(params.get(FILTER_PARAMS.statuses)).includes(status),
  ),
  categoryIds: listOf(params.get(FILTER_PARAMS.categoryIds)) as CategoryId[],
  priorityIds: listOf(params.get(FILTER_PARAMS.priorityIds)) as PriorityId[],
  timing: oneOf(TIMING_FILTERS, params.get(FILTER_PARAMS.timing), 'all'),
  recurring: oneOf(
    RECURRING_FILTERS,
    params.get(FILTER_PARAMS.recurring),
    'all',
  ),
  sort: oneOf(TASK_SORTS, params.get(FILTER_PARAMS.sort), 'time'),
});

/** Param updates for the filters: defaults become `null` (param removed). */
export const filtersToParams = (
  filters: TaskFilters,
): Record<string, string | null> => ({
  [FILTER_PARAMS.query]: filters.query || null,
  [FILTER_PARAMS.statuses]: filters.statuses.join(',') || null,
  [FILTER_PARAMS.categoryIds]: filters.categoryIds.join(',') || null,
  [FILTER_PARAMS.priorityIds]: filters.priorityIds.join(',') || null,
  [FILTER_PARAMS.timing]: filters.timing === 'all' ? null : filters.timing,
  [FILTER_PARAMS.recurring]:
    filters.recurring === 'all' ? null : filters.recurring,
  [FILTER_PARAMS.sort]: filters.sort === 'time' ? null : filters.sort,
});

const normalized = (text: string): string =>
  text.trim().toLocaleLowerCase('pl');

/** Filters that narrow the lists (sorting does not hide anything). */
export const activeFilterCount = (filters: TaskFilters): number =>
  [
    normalized(filters.query) !== '',
    filters.statuses.length > 0,
    filters.categoryIds.length > 0,
    filters.priorityIds.length > 0,
    filters.timing !== 'all',
    filters.recurring !== 'all',
  ].filter(Boolean).length;

const statusOf = (task: Task): StatusFilter =>
  task.done ? 'done' : task.inProgress ? 'started' : 'open';

export const applyFilters = (
  tasks: readonly Task[],
  filters: TaskFilters,
): Task[] => {
  const query = normalized(filters.query);
  return tasks.filter(
    (task) =>
      (query === '' ||
        normalized(task.title).includes(query) ||
        normalized(task.description ?? '').includes(query)) &&
      (filters.statuses.length === 0 ||
        filters.statuses.includes(statusOf(task))) &&
      (filters.categoryIds.length === 0 ||
        filters.categoryIds.includes(task.categoryId)) &&
      (filters.priorityIds.length === 0 ||
        filters.priorityIds.includes(task.priorityId)) &&
      (filters.timing === 'all' ||
        (filters.timing === 'timed') === (task.at !== null)) &&
      (filters.recurring === 'all' ||
        (filters.recurring === 'only') === (task.recurringId !== null)),
  );
};

/** Names the narrowing in words, e.g. `„raport”, Niezrobione, Praca`. */
export const describeFilters = (
  filters: TaskFilters,
  categories: readonly Category[],
  priorities: readonly Priority[],
): string => {
  const names = <T extends { id: string; name: string }>(
    ids: readonly string[],
    items: readonly T[],
  ) => ids.map((id) => items.find((item) => item.id === id)?.name ?? id);
  const query = filters.query.trim();
  return [
    query ? `„${query}”` : null,
    ...filters.statuses.map((status) => STATUS_LABELS[status]),
    ...names(filters.categoryIds, categories),
    ...names(filters.priorityIds, priorities),
    filters.timing === 'timed' ? 'z godziną' : null,
    filters.timing === 'whole-day' ? 'na cały dzień' : null,
    filters.recurring === 'only' ? 'cykliczne' : null,
    filters.recurring === 'none' ? 'jednorazowe' : null,
  ]
    .filter((part): part is string => part !== null)
    .join(', ');
};

export const toggled = <T>(list: readonly T[], item: T): T[] =>
  list.includes(item)
    ? list.filter((entry) => entry !== item)
    : [...list, item];
