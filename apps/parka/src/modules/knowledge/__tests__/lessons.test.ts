import { describe, expect, it } from 'vitest';
import { lessonOrder, neighbourLessons, resumeIndex } from '../domain/lessons';
import type { Catalog, Category, Reel, Topic } from '../domain/models';

const topic = (id: string, catalogId: string, position: number, reels = 2) =>
  ({
    id,
    catalogId,
    position,
    reelCount: reels,
  }) as unknown as Topic;
const catalog = (id: string, categoryId: string | null, position: number) =>
  ({ id, categoryId, position }) as unknown as Catalog;
const category = (id: string, position: number) =>
  ({ id, position }) as unknown as Category;

describe('lesson order', () => {
  it('goes by category, catalog and topic position and continues into the next catalog', () => {
    const order = lessonOrder(
      [topic('c', 'k2', 0), topic('b', 'k1', 1), topic('a', 'k1', 0)],
      [catalog('k1', 'g1', 0), catalog('k2', 'g1', 1)],
      [category('g1', 0)],
    );

    expect(order.map((t) => t.id)).toEqual(['a', 'b', 'c']);
    expect(neighbourLessons(order, 'b' as never).next?.id).toBe('c');
    expect(neighbourLessons(order, 'a' as never).prev).toBeNull();
  });

  it('skips lessons without reels', () => {
    const order = lessonOrder(
      [topic('a', 'k1', 0), topic('empty', 'k1', 1, 0), topic('b', 'k1', 2)],
      [catalog('k1', null, 0)],
      [],
    );

    expect(order.map((t) => t.id)).toEqual(['a', 'b']);
  });
});

describe('resume', () => {
  const reels = (...done: boolean[]) =>
    done.map((d) => ({ done: d }) as unknown as Reel);

  it('starts at the first reel not done', () => {
    expect(resumeIndex(reels(true, true, false, false))).toBe(2);
  });

  it('starts over when everything is done', () => {
    expect(resumeIndex(reels(true, true))).toBe(0);
  });
});
