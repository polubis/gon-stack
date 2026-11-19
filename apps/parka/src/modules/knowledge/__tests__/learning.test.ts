import { describe, expect, it } from 'vitest';
import {
  groupTopics,
  progressLabel,
  summaryOf,
  topicFill,
} from '../domain/learning';
import type {
  Catalog,
  CatalogId,
  Category,
  CategoryId,
  Topic,
  TopicId,
} from '../domain/models';

const category = (id: string, position: number): Category => ({
  id: id as CategoryId,
  name: id,
  color: '#2563eb',
  position,
});
const catalog = (id: string, categoryId: string | null): Catalog => ({
  id: id as CatalogId,
  categoryId: categoryId as CategoryId | null,
  name: id,
  description: '',
  position: 0,
});
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

const categories = ['c0', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6'].map(category);

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

  it('groups topics by category then catalog and drops empty groups', () => {
    const catalogs = [
      catalog('k0', 'c0'),
      catalog('k1', 'c1'),
      catalog('kx', null),
    ];
    const groups = groupTopics(categories, catalogs, [
      topic('a', 'k0', 0),
      topic('b', 'kx', 0),
    ]);

    expect(groups.map((g) => g.category?.id ?? null)).toEqual(['c0', null]);
    expect(groups[0]?.catalogs[0]?.topics.map((t) => t.id)).toEqual(['a']);
  });
});
