import { stateOf } from './filters';
import type { Topic } from './models';

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
