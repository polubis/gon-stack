type Topic = {
  id: string;
  catalogId: string;
  title: string;
  description: string;
  position: number;
  tagIds: string[];
  reelCount: number;
  doneCount: number;
  createdAt: string;
};

type Catalog = { id: string; categoryId: string | null };

export type KnowledgeFilters = {
  q?: string | undefined;
  categoryId?: string | undefined;
  catalogId?: string | undefined;
  tagId?: string | undefined;
  progress?: 'all' | 'untouched' | 'started' | 'done' | undefined;
  sort?: 'position' | 'title' | 'newest' | undefined;
};

const stateOf = (topic: Topic) =>
  topic.doneCount === 0
    ? 'untouched'
    : topic.doneCount === topic.reelCount
      ? 'done'
      : 'started';

/** Narrows and orders topics; the input order (position, creation) is the default. */
export const filterTopics = <T extends Topic>(
  topics: T[],
  catalogs: Catalog[],
  filters: KnowledgeFilters,
): T[] => {
  const phrase = filters.q?.toLowerCase();
  const catalogCategory = new Map(catalogs.map((c) => [c.id, c.categoryId]));
  const kept = topics.filter(
    (t) =>
      (!phrase ||
        t.title.toLowerCase().includes(phrase) ||
        t.description.toLowerCase().includes(phrase)) &&
      (!filters.catalogId || t.catalogId === filters.catalogId) &&
      (!filters.categoryId ||
        catalogCategory.get(t.catalogId) === filters.categoryId) &&
      (!filters.tagId || t.tagIds.includes(filters.tagId)) &&
      (!filters.progress ||
        filters.progress === 'all' ||
        stateOf(t) === filters.progress),
  );
  if (filters.sort === 'title')
    return kept.sort((a, b) => a.title.localeCompare(b.title));
  if (filters.sort === 'newest')
    return kept.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return kept;
};

/** Progress over all topics; a topic without reels counts as untouched. */
export const summarize = (topics: Topic[]) => ({
  topics: topics.length,
  startedTopics: topics.filter((t) => stateOf(t) === 'started').length,
  doneTopics: topics.filter((t) => t.reelCount > 0 && stateOf(t) === 'done')
    .length,
  reels: topics.reduce((sum, t) => sum + t.reelCount, 0),
  doneReels: topics.reduce((sum, t) => sum + t.doneCount, 0),
});
