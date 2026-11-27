import { describe, expect, it } from 'vitest';
import { progressLabel, summaryOf, topicFill } from '../domain/learning';
import type { CatalogId, Topic, TopicId } from '../domain/models';

const topic = (
  id: string,
  catalogId: string,
  doneCount: number,
  reelCount = 4,
): Topic => ({
  id: id as TopicId,
  catalogId: catalogId as CatalogId,
  title: id,
  description: '',
  position: 0,
  studyDay: null,
  tagIds: [],
  reelCount,
  doneCount,
  createdAt: '',
});

describe('knowledge learning', () => {
  it('fills a topic with its finished reels, empty topic stays 0', () => {
    expect(topicFill({ doneCount: 1, reelCount: 4 })).toBe(0.25);
    expect(topicFill({ doneCount: 0, reelCount: 0 })).toBe(0);
  });

  it('counts untouched, started and done topics and reels', () => {
    const summary = summaryOf([
      topic('a', 'k', 0),
      topic('b', 'k', 2),
      topic('c', 'k', 4),
      topic('d', 'k', 0, 0),
    ]);

    expect(summary).toEqual({
      topics: 4,
      startedTopics: 1,
      doneTopics: 1,
      reels: 12,
      doneReels: 6,
    });
  });

  it('labels progress as done/total', () => {
    expect(progressLabel({ doneCount: 2, reelCount: 5 })).toBe('2/5');
  });
});
