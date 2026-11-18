import { BRAIN_AREA_IDS, isCortex, type BrainAreaId } from './brain-area';
import { stateOf } from './filters';
import type { Catalog, Category, CategoryId, Topic } from './models';

/** Mirrors the `summary` of the knowledge API; counted locally so writes update it at once. */
export type KnowledgeSummary = {
  topics: number;
  /** Touched: at least one finished reel, not all. */
  startedTopics: number;
  doneTopics: number;
  reels: number;
  doneReels: number;
};

/** 0..1: how much of a topic sits in the brain (finished reels). */
export const topicFill = (
  topic: Pick<Topic, 'doneCount' | 'reelCount'>,
): number =>
  topic.reelCount === 0 ? 0 : Math.min(1, topic.doneCount / topic.reelCount);

/** 0..1: mean fill of topics; no topics = 0. */
export const fillOf = (topics: readonly Topic[]): number =>
  topics.length === 0
    ? 0
    : topics.reduce((sum, t) => sum + topicFill(t), 0) / topics.length;

export const summaryOf = (topics: readonly Topic[]): KnowledgeSummary => ({
  topics: topics.length,
  startedTopics: topics.filter((t) => stateOf(t) === 'started').length,
  doneTopics: topics.filter((t) => t.reelCount > 0 && stateOf(t) === 'done')
    .length,
  reels: topics.reduce((sum, t) => sum + t.reelCount, 0),
  doneReels: topics.reduce((sum, t) => sum + t.doneCount, 0),
});

/**
 * Brain area of a category: categories take the areas in their order, round
 * and round. Uncategorised catalogs sit in the first area.
 */
export const areaOfCategory = (
  categoryId: CategoryId | null,
  categories: readonly Category[],
): BrainAreaId => {
  const at = categories.findIndex((c) => c.id === categoryId);
  return BRAIN_AREA_IDS[at < 0 ? 0 : at % BRAIN_AREA_IDS.length]!;
};

const areaOfTopic = (
  topic: Topic,
  catalogs: readonly Catalog[],
  categories: readonly Category[],
): BrainAreaId =>
  areaOfCategory(
    catalogs.find((c) => c.id === topic.catalogId)?.categoryId ?? null,
    categories,
  );

/** Fill of each brain area: its categories' topics together. Empty area stays 0. */
export const areaFills = (
  categories: readonly Category[],
  catalogs: readonly Catalog[],
  topics: readonly Topic[],
): { id: BrainAreaId; fill: number }[] =>
  BRAIN_AREA_IDS.map((id) => ({
    id,
    fill: fillOf(
      topics.filter((t) => areaOfTopic(t, catalogs, categories) === id),
    ),
  }));

/** Fill of the cortex (four lobes) vs the rest (cerebellum, brainstem). */
export const cortexSplit = (
  categories: readonly Category[],
  catalogs: readonly Catalog[],
  topics: readonly Topic[],
): { cortex: number; rest: number } => {
  const inCortex = (t: Topic) => isCortex(areaOfTopic(t, catalogs, categories));
  return {
    cortex: fillOf(topics.filter(inCortex)),
    rest: fillOf(topics.filter((t) => !inCortex(t))),
  };
};

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
