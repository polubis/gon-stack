import type {
  Catalog,
  CatalogId,
  Category,
  CategoryId,
  Tag,
  TagId,
  Topic,
} from './models';

export const PROGRESS_FILTERS = [
  'all',
  'untouched',
  'started',
  'done',
] as const;
export type ProgressFilter = (typeof PROGRESS_FILTERS)[number];

export const SORTS = ['position', 'title', 'newest'] as const;
export type Sort = (typeof SORTS)[number];

export const PROGRESS_LABELS: Record<ProgressFilter, string> = {
  all: 'Wszystkie',
  untouched: 'Nieruszone',
  started: 'Rozpoczęte',
  done: 'Ukończone',
};

export const SORT_LABELS: Record<Sort, string> = {
  position: 'Kolejność',
  title: 'Nazwa',
  newest: 'Najnowsze',
};

/** What narrows the lists and how they are ordered; lives in the URL. */
export type KnowledgeFilters = {
  query: string;
  categoryId: CategoryId | null;
  catalogId: CatalogId | null;
  tagId: TagId | null;
  progress: ProgressFilter;
  sort: Sort;
};

export const NO_FILTERS: KnowledgeFilters = {
  query: '',
  categoryId: null,
  catalogId: null,
  tagId: null,
  progress: 'all',
  sort: 'position',
};

export const FILTER_PARAMS = {
  query: 'q',
  categoryId: 'cat',
  catalogId: 'catalog',
  tagId: 'tag',
  progress: 'progress',
  sort: 'sort',
} as const;

const oneOf = <T extends string>(
  options: readonly T[],
  value: string | null,
  fallback: T,
): T => options.find((option) => option === value) ?? fallback;

export const filtersFromParams = (
  params: URLSearchParams,
): KnowledgeFilters => ({
  query: params.get(FILTER_PARAMS.query) ?? '',
  categoryId: (params.get(FILTER_PARAMS.categoryId) ||
    null) as CategoryId | null,
  catalogId: (params.get(FILTER_PARAMS.catalogId) || null) as CatalogId | null,
  tagId: (params.get(FILTER_PARAMS.tagId) || null) as TagId | null,
  progress: oneOf(PROGRESS_FILTERS, params.get(FILTER_PARAMS.progress), 'all'),
  sort: oneOf(SORTS, params.get(FILTER_PARAMS.sort), 'position'),
});

/** Param updates for the filters: defaults become `null` (param removed). */
export const filtersToParams = (
  filters: KnowledgeFilters,
): Record<string, string | null> => ({
  [FILTER_PARAMS.query]: filters.query || null,
  [FILTER_PARAMS.categoryId]: filters.categoryId,
  [FILTER_PARAMS.catalogId]: filters.catalogId,
  [FILTER_PARAMS.tagId]: filters.tagId,
  [FILTER_PARAMS.progress]:
    filters.progress === 'all' ? null : filters.progress,
  [FILTER_PARAMS.sort]: filters.sort === 'position' ? null : filters.sort,
});

/** Trimmed phrase the server and the local matching both use. */
export const phraseOf = (query: string): string => query.trim();

/** Filters that narrow the lists (sorting does not hide anything). */
export const activeFilterCount = (filters: KnowledgeFilters): number =>
  [
    phraseOf(filters.query) !== '',
    filters.categoryId !== null,
    filters.catalogId !== null,
    filters.tagId !== null,
    filters.progress !== 'all',
  ].filter(Boolean).length;

/** Query of `GET /api/knowledge`, without the period. */
export type ListQuery = {
  q?: string;
  categoryId?: string;
  catalogId?: string;
  tagId?: string;
  progress?: ProgressFilter;
  sort?: Sort;
  from?: string;
  to?: string;
  scope?: 'all' | 'scheduled' | 'undated';
};

export const toListQuery = (filters: KnowledgeFilters): ListQuery => ({
  ...(phraseOf(filters.query) ? { q: phraseOf(filters.query) } : {}),
  ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
  ...(filters.catalogId ? { catalogId: filters.catalogId } : {}),
  ...(filters.tagId ? { tagId: filters.tagId } : {}),
  ...(filters.progress !== 'all' ? { progress: filters.progress } : {}),
  sort: filters.sort,
});

export type TopicState = 'untouched' | 'started' | 'done';

export const stateOf = (
  topic: Pick<Topic, 'doneCount' | 'reelCount'>,
): TopicState =>
  topic.doneCount === 0
    ? 'untouched'
    : topic.doneCount === topic.reelCount
      ? 'done'
      : 'started';

/** Same rules as the server: a topic written locally lands where a reload would put it. */
export const matchesFilters = (
  topic: Topic,
  filters: KnowledgeFilters,
  catalogs: readonly Catalog[],
): boolean => {
  const phrase = phraseOf(filters.query).toLowerCase();
  const categoryOf = catalogs.find((c) => c.id === topic.catalogId)?.categoryId;
  return (
    (phrase === '' ||
      topic.title.toLowerCase().includes(phrase) ||
      topic.description.toLowerCase().includes(phrase)) &&
    (!filters.catalogId || topic.catalogId === filters.catalogId) &&
    (!filters.categoryId || categoryOf === filters.categoryId) &&
    (!filters.tagId || topic.tagIds.includes(filters.tagId)) &&
    (filters.progress === 'all' || stateOf(topic) === filters.progress)
  );
};

/** Study day inside the inclusive range; `null` range = no days (backlog list). */
export const inRange = (
  topic: Topic,
  range: { from: string; to: string },
): boolean =>
  topic.studyDay !== null &&
  topic.studyDay >= range.from &&
  topic.studyDay <= range.to;

const byPosition = (a: Topic, b: Topic) =>
  a.position - b.position || a.createdAt.localeCompare(b.createdAt);

export const sortTopics = (topics: readonly Topic[], sort: Sort): Topic[] =>
  [...topics].sort(
    sort === 'title'
      ? (a, b) => a.title.localeCompare(b.title)
      : sort === 'newest'
        ? (a, b) => b.createdAt.localeCompare(a.createdAt)
        : byPosition,
  );

/** Names the narrowing in words, e.g. `„raport”, Nieruszone, Angielski`. */
export const describeFilters = (
  filters: KnowledgeFilters,
  categories: readonly Category[],
  catalogs: readonly Catalog[],
  tags: readonly Tag[],
): string =>
  [
    phraseOf(filters.query) ? `„${phraseOf(filters.query)}”` : null,
    categories.find((c) => c.id === filters.categoryId)?.name,
    catalogs.find((c) => c.id === filters.catalogId)?.name,
    tags.find((t) => t.id === filters.tagId)?.name,
    filters.progress !== 'all' ? PROGRESS_LABELS[filters.progress] : null,
  ]
    .filter((part): part is string => Boolean(part))
    .join(', ');

export const toggled = <T>(list: readonly T[], item: T): T[] =>
  list.includes(item)
    ? list.filter((entry) => entry !== item)
    : [...list, item];
