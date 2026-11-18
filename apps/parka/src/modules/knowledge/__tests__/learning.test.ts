import { describe, expect, it } from 'vitest';
import {
  areaFills,
  areaOfCategory,
  cortexSplit,
  fillOf,
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
    expect(fillOf([])).toBe(0);
    expect(fillOf([topic('a', 'k', 4), topic('b', 'k', 0)])).toBe(0.5);
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

  it('gives categories the brain areas in order, round and round', () => {
    expect(areaOfCategory('c0' as CategoryId, categories)).toBe('frontal');
    expect(areaOfCategory('c4' as CategoryId, categories)).toBe('cerebellum');
    expect(areaOfCategory('c6' as CategoryId, categories)).toBe('frontal');
    expect(areaOfCategory(null, categories)).toBe('frontal');
  });

  it('fills each area from the topics of its categories', () => {
    const catalogs = [catalog('k0', 'c0'), catalog('k1', 'c1')];
    const fills = areaFills(categories, catalogs, [
      topic('a', 'k0', 4),
      topic('b', 'k1', 2),
    ]);

    expect(fills.find((f) => f.id === 'frontal')?.fill).toBe(1);
    expect(fills.find((f) => f.id === 'parietal')?.fill).toBe(0.5);
    expect(fills.find((f) => f.id === 'brainstem')?.fill).toBe(0);
  });

  it('splits the fill between the cortex and the rest', () => {
    const catalogs = [catalog('k0', 'c0'), catalog('k4', 'c4')];
    const split = cortexSplit(categories, catalogs, [
      topic('a', 'k0', 4),
      topic('b', 'k4', 0),
    ]);

    expect(split).toEqual({ cortex: 1, rest: 0 });
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
