import { describe, expect, it } from 'vitest';
import type {
  BacklogTask,
  Category,
  CategoryId,
  Priority,
  PriorityId,
  RecurringId,
  Task,
  TaskId,
} from '../domain/models';
import { taskStats } from '../domain/stats';

const CATEGORIES = [
  { id: 'work', name: 'Praca', icon: 'briefcase', color: '#2563eb' },
  { id: 'home', name: 'Dom', icon: 'home', color: '#c2410c' },
] as Category[];

const PRIORITIES = [
  { id: 'low', name: 'Niski', value: 2 },
  { id: 'medium', name: 'Średni', value: 5 },
  { id: 'high', name: 'Wysoki', value: 9 },
] as Priority[];

const task = (id: string, overrides: Partial<Task> = {}): Task => ({
  id: id as TaskId,
  key: null,
  title: id,
  description: null,
  categoryId: 'work' as CategoryId,
  priorityId: 'medium' as PriorityId,
  day: '2026-10-20',
  at: '09:00',
  done: false,
  inProgress: false,
  statusId: null,
  device: null,
  recurringId: null,
  ...overrides,
});

const stats = (
  tasks: Task[],
  kind: 'day' | 'week' | 'month' | 'year' = 'week',
  today = '2026-10-21',
) =>
  taskStats({
    tasks,
    backlog: [{ id: 'b' }, { id: 'c' }] as BacklogTask[],
    categories: CATEGORIES,
    priorities: PRIORITIES,
    kind,
    anchor: '2026-10-20',
    today,
  });

describe('task statistics', () => {
  it('counts statuses and the completion share', () => {
    const result = stats([
      task('a', { done: true }),
      task('b', { inProgress: true }),
      task('c'),
      task('d'),
    ]);

    expect(result).toMatchObject({
      total: 4,
      done: 1,
      inProgress: 1,
      open: 2,
      completion: 25,
    });
    expect(result.active.map((t) => t.id)).toEqual(['b']);
  });

  it('never counts a done task as in progress', () => {
    const result = stats([task('a', { done: true, inProgress: true })]);

    expect(result).toMatchObject({ done: 1, inProgress: 0, open: 0 });
    expect(result.active).toEqual([]);
  });

  it('has no completion without tasks', () => {
    expect(stats([])).toMatchObject({ total: 0, completion: 0, busiest: null });
  });

  it('ignores tasks outside the period', () => {
    const result = stats([
      task('in', { day: '2026-10-25' }),
      task('out', { day: '2026-10-26' }),
    ]);

    expect(result.total).toBe(1);
  });

  it('includes tasks on the first and last day of the period only', () => {
    const result = stats([
      task('before', { day: '2026-10-18' }),
      task('first', { day: '2026-10-19' }),
      task('last', { day: '2026-10-25' }),
      task('after', { day: '2026-10-26' }),
    ]);

    expect(result.total).toBe(2);
  });

  it('has no overdue tasks when today lies before the period', () => {
    const result = stats(
      [task('a'), task('b', { day: '2026-10-25' })],
      'week',
      '2026-10-10',
    );

    expect(result.overdue).toBe(0);
  });

  it('counts every undone task overdue when today lies after the period', () => {
    const result = stats(
      [task('a'), task('b', { done: true }), task('c', { day: '2026-10-25' })],
      'week',
      '2026-12-01',
    );

    expect(result.overdue).toBe(2);
  });

  it('flags undone tasks of earlier days as overdue', () => {
    const result = stats([
      task('late', { day: '2026-10-19' }),
      task('doneLate', { day: '2026-10-19', done: true }),
      task('today', { day: '2026-10-21' }),
    ]);

    expect(result.overdue).toBe(1);
  });

  it('averages tasks per day of the period', () => {
    const tasks = Array.from({ length: 7 }, (_, i) => task(`t${i}`));

    expect(stats(tasks, 'week').perDay).toBe(1);
    expect(stats(tasks.slice(0, 3), 'week').perDay).toBe(0.4);
    expect(stats(tasks, 'day').perDay).toBe(7);
  });

  it('splits timed, all-day and recurring tasks and counts the backlog', () => {
    const result = stats([
      task('a'),
      task('b', { at: null }),
      task('c', { at: null, recurringId: 'r' as RecurringId }),
    ]);

    expect(result).toMatchObject({
      timed: 1,
      allDay: 2,
      recurring: 1,
      backlog: 2,
    });
  });

  it('ranks categories by tasks and drops unused ones', () => {
    const result = stats([
      task('a', { categoryId: 'home' as CategoryId }),
      task('b', { categoryId: 'home' as CategoryId }),
      task('c'),
    ]);

    expect(result.byCategory.map((c) => [c.name, c.count])).toEqual([
      ['Dom', 2],
      ['Praca', 1],
    ]);
    expect(stats([task('a')]).byCategory).toHaveLength(1);
  });

  it('groups priorities by level with their done part', () => {
    const result = stats([
      task('a', { priorityId: 'high' as PriorityId, done: true }),
      task('b', { priorityId: 'high' as PriorityId }),
      task('c', { priorityId: 'low' as PriorityId }),
      task('d', { priorityId: 'gone' as PriorityId }),
    ]);

    expect(result.byPriority).toEqual([
      { level: 'high', count: 2, done: 1 },
      { level: 'medium', count: 0, done: 0 },
      { level: 'low', count: 2, done: 0 },
    ]);
  });

  it('buckets a week by day and names the busiest one', () => {
    const result = stats([
      task('a', { day: '2026-10-21', done: true }),
      task('b', { day: '2026-10-21' }),
      task('c', { day: '2026-10-23' }),
    ]);

    expect(result.buckets).toHaveLength(7);
    expect(result.buckets[2]).toMatchObject({
      key: '2026-10-21',
      total: 2,
      done: 1,
    });
    expect(result.busiest).toEqual({ day: '2026-10-21', count: 2 });
  });

  it('buckets a month by day, a year by month and a day by hour', () => {
    const tasks = [task('a'), task('b', { day: '2026-03-02' })];

    expect(stats(tasks, 'month').buckets).toHaveLength(31);
    const year = stats(tasks, 'year');
    expect(year.buckets).toHaveLength(12);
    expect(year.buckets[2]?.total).toBe(1);
    expect(year.buckets[9]?.total).toBe(1);
    const day = stats([task('a'), task('b', { at: '10:15' })], 'day');
    expect(day.buckets.find((b) => b.key === '10')?.total).toBe(1);
    expect(day.busiest).toBeNull();
  });
});
