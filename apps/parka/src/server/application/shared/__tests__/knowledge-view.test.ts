import { describe, expect, it } from 'vitest';
import { filterTopics, summarize } from '../knowledge-view';

const topic = (
  id: string,
  over: Partial<Parameters<typeof filterTopics>[0][number]> = {},
) => ({
  id,
  catalogId: 'c-1',
  title: id,
  description: '',
  position: 0,
  tagIds: [],
  reelCount: 4,
  doneCount: 0,
  createdAt: '2026-11-01T10:00:00.000Z',
  ...over,
});

const catalogs = [
  { id: 'c-1', categoryId: 'cat-1' },
  { id: 'c-2', categoryId: null },
];

describe('filter knowledge topics', () => {
  it('finds a phrase in title or description ignoring case', () => {
    const topics = [
      topic('RLS basics'),
      topic('Other', { description: 'about rls policies' }),
      topic('Auth'),
    ];

    const result = filterTopics(topics, catalogs, { q: 'rls' });

    expect(result.map((t) => t.id)).toEqual(['RLS basics', 'Other']);
  });

  it('keeps topics of a category through their catalog', () => {
    const topics = [topic('a'), topic('b', { catalogId: 'c-2' })];

    const result = filterTopics(topics, catalogs, { categoryId: 'cat-1' });

    expect(result.map((t) => t.id)).toEqual(['a']);
  });

  it('keeps topics with a tag', () => {
    const topics = [topic('a', { tagIds: ['t-1'] }), topic('b')];

    const result = filterTopics(topics, catalogs, { tagId: 't-1' });

    expect(result.map((t) => t.id)).toEqual(['a']);
  });

  it.each([
    ['untouched', ['n']],
    ['started', ['s']],
    ['done', ['d']],
    ['all', ['n', 's', 'd']],
  ] as const)('filters by %s progress', (progress, expected) => {
    const topics = [
      topic('n'),
      topic('s', { doneCount: 1 }),
      topic('d', { doneCount: 4 }),
    ];

    const result = filterTopics(topics, catalogs, { progress });

    expect(result.map((t) => t.id)).toEqual(expected);
  });

  it('sorts by title and by newest first', () => {
    const topics = [
      topic('b', { createdAt: '2026-11-02T10:00:00.000Z' }),
      topic('a', { createdAt: '2026-11-03T10:00:00.000Z' }),
    ];

    expect(
      filterTopics(topics, catalogs, { sort: 'title' }).map((t) => t.id),
    ).toEqual(['a', 'b']);
    expect(
      filterTopics(topics, catalogs, { sort: 'newest' }).map((t) => t.id),
    ).toEqual(['a', 'b']);
  });

  it('keeps stored order without a sort', () => {
    const topics = [topic('z'), topic('a')];

    const result = filterTopics(topics, catalogs, {});

    expect(result.map((t) => t.id)).toEqual(['z', 'a']);
  });
});

describe('summarize knowledge progress', () => {
  it('counts started and done topics and reels', () => {
    const topics = [
      topic('n'),
      topic('s', { doneCount: 1 }),
      topic('d', { doneCount: 4 }),
    ];

    expect(summarize(topics)).toEqual({
      topics: 3,
      startedTopics: 1,
      doneTopics: 1,
      reels: 12,
      doneReels: 5,
    });
  });

  it('does not count an empty topic as done', () => {
    const result = summarize([topic('e', { reelCount: 0 })]);

    expect(result).toMatchObject({ doneTopics: 0, startedTopics: 0 });
  });
});
