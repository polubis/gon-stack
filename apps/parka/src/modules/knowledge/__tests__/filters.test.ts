import { describe, expect, it } from 'vitest';
import {
  activeFilterCount,
  describeFilters,
  filtersFromParams,
  filtersToParams,
  matchesFilters,
  NO_FILTERS,
  sortTopics,
  stateOf,
  toListQuery,
} from '../domain/filters';
import type {
  Catalog,
  CatalogId,
  Category,
  CategoryId,
  Tag,
  TagId,
  Topic,
  TopicId,
} from '../domain/models';

const topic = (overrides: Partial<Topic> = {}): Topic => ({
  id: 't-1' as TopicId,
  catalogId: 'k-1' as CatalogId,
  title: 'Phrasal verbs',
  description: 'Czasowniki frazowe',
  position: 0,
  studyDay: '2026-10-20',
  tagIds: [],
  reelCount: 4,
  doneCount: 0,
  createdAt: '2026-10-01T10:00:00.000Z',
  ...overrides,
});

const catalogs: Catalog[] = [
  {
    id: 'k-1' as CatalogId,
    categoryId: 'c-1' as CategoryId,
    name: 'Angielski',
    description: '',
    position: 0,
  },
];
const categories: Category[] = [
  { id: 'c-1' as CategoryId, name: 'Języki', color: '#2563eb', position: 0 },
];
const tags: Tag[] = [{ id: 'g-1' as TagId, name: 'sql' }];

describe('knowledge filters', () => {
  it('reads filters from the URL and falls back to defaults', () => {
    const filters = filtersFromParams(
      new URLSearchParams('q=sql&cat=c-1&progress=done&sort=title'),
    );

    expect(filters).toEqual({
      ...NO_FILTERS,
      query: 'sql',
      categoryId: 'c-1',
      progress: 'done',
      sort: 'title',
    });
    expect(
      filtersFromParams(new URLSearchParams('progress=nope&sort=x')),
    ).toEqual(NO_FILTERS);
  });

  it('writes defaults as removed params', () => {
    expect(filtersToParams(NO_FILTERS)).toEqual({
      q: null,
      cat: null,
      catalog: null,
      tag: null,
      progress: null,
      sort: null,
    });
    expect(
      filtersToParams({ ...NO_FILTERS, progress: 'started' }).progress,
    ).toBe('started');
  });

  it('counts only filters that narrow, not the sort', () => {
    expect(activeFilterCount({ ...NO_FILTERS, sort: 'title' })).toBe(0);
    expect(
      activeFilterCount({ ...NO_FILTERS, query: ' x ', progress: 'done' }),
    ).toBe(2);
    expect(activeFilterCount({ ...NO_FILTERS, query: '   ' })).toBe(0);
  });

  it('builds the server query from the filters', () => {
    expect(toListQuery(NO_FILTERS)).toEqual({ sort: 'position' });
    expect(
      toListQuery({ ...NO_FILTERS, query: ' sql ', tagId: 'g-1' as TagId }),
    ).toEqual({ q: 'sql', tagId: 'g-1', sort: 'position' });
  });

  it('tells where a topic stands by its finished reels', () => {
    expect(stateOf({ doneCount: 0, reelCount: 3 })).toBe('untouched');
    expect(stateOf({ doneCount: 1, reelCount: 3 })).toBe('started');
    expect(stateOf({ doneCount: 3, reelCount: 3 })).toBe('done');
  });

  it('matches by phrase in title or description, ignoring case', () => {
    const filters = { ...NO_FILTERS, query: 'FRAZOWE' };

    expect(matchesFilters(topic(), filters, catalogs)).toBe(true);
    expect(
      matchesFilters(topic(), { ...NO_FILTERS, query: 'sql' }, catalogs),
    ).toBe(false);
  });

  it('matches by category through its catalog, by tag and by progress', () => {
    const tagged = topic({ tagIds: ['g-1' as TagId], doneCount: 4 });

    expect(
      matchesFilters(
        tagged,
        { ...NO_FILTERS, categoryId: 'c-1' as CategoryId },
        catalogs,
      ),
    ).toBe(true);
    expect(
      matchesFilters(
        tagged,
        { ...NO_FILTERS, categoryId: 'c-2' as CategoryId },
        catalogs,
      ),
    ).toBe(false);
    expect(
      matchesFilters(
        tagged,
        { ...NO_FILTERS, tagId: 'g-1' as TagId },
        catalogs,
      ),
    ).toBe(true);
    expect(
      matchesFilters(
        tagged,
        { ...NO_FILTERS, progress: 'untouched' },
        catalogs,
      ),
    ).toBe(false);
  });

  it('sorts by position, title and newest', () => {
    const a = topic({
      id: 'a' as TopicId,
      title: 'B',
      position: 1,
      createdAt: '2026-01-01',
    });
    const b = topic({
      id: 'b' as TopicId,
      title: 'A',
      position: 2,
      createdAt: '2026-03-01',
    });

    expect(sortTopics([b, a], 'position').map((t) => t.id)).toEqual(['a', 'b']);
    expect(sortTopics([a, b], 'title').map((t) => t.id)).toEqual(['b', 'a']);
    expect(sortTopics([a, b], 'newest').map((t) => t.id)).toEqual(['b', 'a']);
  });

  it('names the narrowing in words', () => {
    expect(
      describeFilters(
        {
          ...NO_FILTERS,
          query: 'sql',
          categoryId: 'c-1' as CategoryId,
          tagId: 'g-1' as TagId,
          progress: 'untouched',
        },
        categories,
        catalogs,
        tags,
      ),
    ).toBe('„sql”, Języki, sql, Nieruszone');
  });
});
