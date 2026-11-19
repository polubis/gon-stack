import { stateOf } from './filters';
import type { Catalog, Category, Topic } from './models';

/** Mirrors the `summary` of the knowledge API; counted locally so writes update it at once. */
export type KnowledgeSummary = {
  topics: number;
  /** Touched: at least one finished reel, not all. */
  startedTopics: number;
  doneTopics: number;
  reels: number;
  doneReels: number;
};

/** 0..1: how much of a topic is finished (reels). */
export const topicFill = (
  topic: Pick<Topic, 'doneCount' | 'reelCount'>,
): number =>
  topic.reelCount === 0 ? 0 : Math.min(1, topic.doneCount / topic.reelCount);

export const summaryOf = (topics: readonly Topic[]): KnowledgeSummary => ({
  topics: topics.length,
  startedTopics: topics.filter((t) => stateOf(t) === 'started').length,
  doneTopics: topics.filter((t) => t.reelCount > 0 && stateOf(t) === 'done')
    .length,
  reels: topics.reduce((sum, t) => sum + t.reelCount, 0),
  doneReels: topics.reduce((sum, t) => sum + t.doneCount, 0),
});

/** Label of `x/y` reels. */
export const progressLabel = (
  topic: Pick<Topic, 'doneCount' | 'reelCount'>,
): string => `${topic.doneCount}/${topic.reelCount}`;

/** Topics by category then catalog, in the given orders; empty groups dropped. */
export type TopicGroup = {
  category: Category | null;
  catalogs: { catalog: Catalog; topics: Topic[] }[];
};

export const groupTopics = (
  categories: readonly Category[],
  catalogs: readonly Catalog[],
  topics: readonly Topic[],
): TopicGroup[] => {
  const groups = [...categories, null].map((category) => ({
    category,
    catalogs: catalogs
      .filter((c) => (c.categoryId ?? null) === (category?.id ?? null))
      .map((catalog) => ({
        catalog,
        topics: topics.filter((t) => t.catalogId === catalog.id),
      }))
      .filter((entry) => entry.topics.length > 0),
  }));
  return groups.filter((group) => group.catalogs.length > 0);
};
