import { describe, expect, it } from 'vitest';
import { sortByUsage } from '../domain/category-usage';
import { periodTitle } from '../domain/period-title';
import type { Category, Priority, PriorityId, Task } from '../domain/models';
import {
  countsByMonth,
  gridHours,
  monthGrid,
  nowIndexOf,
  sortTasks,
  weekDays,
} from '../domain/schedule';
import { sortByPriority } from '../domain/priority';

const task = (title: string, day: string, at: string | null): Task =>
  ({ id: title, title, day, at }) as Task;

describe('period titles', () => {
  it.each([
    ['day', '2026-10-20', 'wtorek, 20 października 2026'],
    ['week', '2026-10-20', '19 – 25 października 2026'],
    ['week', '2026-10-01', '28 września – 4 października 2026'],
    ['week', '2026-12-31', '28 grudnia 2026 – 3 stycznia 2027'],
    ['month', '2026-10-20', 'październik 2026'],
    ['year', '2026-10-20', '2026'],
  ] as const)('titles a %s around %s', (kind, anchor, expected) => {
    expect(periodTitle(kind, anchor)).toBe(expected);
  });
});

describe('schedule', () => {
  it('orders timed tasks first by hour, then whole-day ones', () => {
    const sorted = sortTasks([
      task('c', '2026-10-20', null),
      task('b', '2026-10-20', '18:00'),
      task('a', '2026-10-20', '09:00'),
    ]);

    expect(sorted.map((t) => t.title)).toEqual(['a', 'b', 'c']);
  });

  it('finds the last task already started', () => {
    const tasks = [
      task('a', '2026-10-20', '09:00'),
      task('b', '2026-10-20', '13:00'),
      task('c', '2026-10-20', '15:00'),
    ];

    expect(nowIndexOf(tasks, '13:40')).toBe(1);
    expect(nowIndexOf(tasks, '08:00')).toBe(-1);
  });

  it('lists a week from Monday to Sunday', () => {
    expect(weekDays('2026-10-22')).toEqual([
      '2026-10-19',
      '2026-10-20',
      '2026-10-21',
      '2026-10-22',
      '2026-10-23',
      '2026-10-24',
      '2026-10-25',
    ]);
  });

  it('leads October 2026 with three blank cells', () => {
    const { leadingBlanks, days } = monthGrid('2026-10-20');

    expect(leadingBlanks).toBe(3);
    expect(days).toHaveLength(31);
    expect(days[0]).toBe('2026-10-01');
  });

  it('counts tasks per month of the year', () => {
    const counts = countsByMonth(
      [
        task('a', '2026-01-05', null),
        task('b', '2026-01-06', null),
        task('c', '2026-10-20', null),
        task('d', '2025-10-20', null),
      ],
      '2026-06-01',
    );

    expect(counts[0]).toBe(2);
    expect(counts[9]).toBe(1);
    expect(counts.reduce((a, b) => a + b, 0)).toBe(3);
  });

  it('widens the hour grid for tasks outside 08:00-20:00', () => {
    expect(gridHours([])).toEqual(Array.from({ length: 13 }, (_, i) => 8 + i));
    expect(gridHours([task('a', '2026-10-20', '06:30')])[0]).toBe(6);
    expect(gridHours([task('a', '2026-10-20', '22:00')]).at(-1)).toBe(22);
  });
});

describe('categories by usage', () => {
  const category = (name: string) => ({ id: name, name }) as Category;
  const used = (...ids: string[]) => ids.map((categoryId) => ({ categoryId }));

  it('puts the most used first and keeps the given order on ties', () => {
    const list = [category('Zakupy'), category('Dom'), category('Praca')];
    const sorted = sortByUsage(list, used('Praca', 'Zakupy', 'Praca') as never);
    expect(sorted.map((c) => c.name)).toEqual(['Praca', 'Zakupy', 'Dom']);
    expect(sortByUsage(list, []).map((c) => c.name)).toEqual([
      'Zakupy',
      'Dom',
      'Praca',
    ]);
  });
});

const PRIORITIES = [
  { id: 'low', name: 'Niski', value: 2 },
  { id: 'high', name: 'Wysoki', value: 9 },
] as Priority[];

const withPriority = (title: string, at: string | null, id: string): Task =>
  ({ ...task(title, '2026-10-20', at), priorityId: id }) as Task;

describe('priority order of tasks', () => {
  it('puts the highest priority first among whole-day tasks', () => {
    const sorted = sortTasks(
      [
        withPriority('a', null, 'low'),
        withPriority('b', null, 'high'),
        withPriority('c', null, 'gone'),
      ],
      PRIORITIES,
    );

    expect(sorted.map((t) => t.title)).toEqual(['b', 'a', 'c']);
  });

  it('keeps time order and ranks only within the same hour', () => {
    const sorted = sortTasks(
      [
        withPriority('late', '18:00', 'high'),
        withPriority('x', '09:00', 'low'),
        withPriority('y', '09:00', 'high'),
      ],
      PRIORITIES,
    );

    expect(sorted.map((t) => t.title)).toEqual(['y', 'x', 'late']);
  });

  it('orders equal priorities by title', () => {
    const sorted = sortTasks(
      [withPriority('b', null, 'high'), withPriority('a', null, 'high')],
      PRIORITIES,
    );

    expect(sorted.map((t) => t.title)).toEqual(['a', 'b']);
  });

  it('sorts any items by priority, ties keep their order', () => {
    const items = [
      { id: 1, priorityId: 'low' },
      { id: 2, priorityId: 'high' },
      { id: 3, priorityId: 'low' },
      { id: 4, priorityId: 'none' },
    ].map((item) => ({ ...item, priorityId: item.priorityId as PriorityId }));

    expect(sortByPriority(items, PRIORITIES).map((i) => i.id)).toEqual([
      2, 1, 3, 4,
    ]);
  });
});
