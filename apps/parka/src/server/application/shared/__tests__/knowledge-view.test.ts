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
  studyDay: null,
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

describe('filter knowledge topics by study day', () => {
  const planned = [
    topic('mon', { studyDay: '2026-11-16' }),
    topic('tue', { studyDay: '2026-11-17' }),
    topic('fri', { studyDay: '2026-11-20' }),
    topic('later'),
  ];

  it('keeps topics planned inside the range, ends included', () => {
    const result = filterTopics(planned, catalogs, {
      from: '2026-11-16',
      to: '2026-11-17',
    });

    expect(result.map((t) => t.id)).toEqual(['mon', 'tue']);
  });

  it('leaves out undated topics when a range is set', () => {
    const result = filterTopics(planned, catalogs, {
      from: '2026-11-01',
      to: '2026-11-30',
    });

    expect(result.map((t) => t.id)).not.toContain('later');
  });

  it('lists only the backlog for the undated scope', () => {
    const result = filterTopics(planned, catalogs, { scope: 'undated' });

    expect(result.map((t) => t.id)).toEqual(['later']);
  });

  it('lists every planned topic for the scheduled scope', () => {
    const result = filterTopics(planned, catalogs, { scope: 'scheduled' });

    expect(result.map((t) => t.id)).toEqual(['mon', 'tue', 'fri']);
  });

  it('shows everything without a range or scope', () => {
    const result = filterTopics(planned, catalogs, {});

    expect(result).toHaveLength(4);
  });
});

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
