import { describe, expect, it } from 'vitest';
import {
  activeFilterCount,
  applyFilters,
  filtersFromParams,
  filtersToParams,
  NO_FILTERS,
} from '../domain/filters';
import type { CategoryId, PriorityId, Task, TaskId } from '../domain/models';

const make = (overrides: Partial<Task>): Task => ({
  id: 't' as TaskId,
  key: null,
  title: 'Raport',
  description: null,
  categoryId: 'work' as CategoryId,
  priorityId: 'high' as PriorityId,
  day: '2026-10-20',
  at: '09:00',
  done: false,
  inProgress: false,
  statusId: null,
  device: null,
  recurringId: null,
  ...overrides,
});

describe('task filters', () => {
  it('keeps every task when nothing is picked', () => {
    const tasks = [make({}), make({ done: true })];

    expect(applyFilters(tasks, NO_FILTERS)).toHaveLength(2);
  });

  it('matches the phrase in title and description regardless of case', () => {
    const tasks = [
      make({ title: 'Umówić DENTYSTĘ' }),
      make({ description: 'zadzwonić do dentysty' }),
      make({ title: 'Inne' }),
    ];

    const found = applyFilters(tasks, { ...NO_FILTERS, query: 'dentyst' });

    expect(found).toHaveLength(2);
  });

  it('combines status, timing and recurring as AND', () => {
    const tasks = [
      make({ title: 'a', done: true, at: null }),
      make({ title: 'b', done: true, at: '10:00' }),
      make({ title: 'c', inProgress: true }),
    ];

    const found = applyFilters(tasks, {
      ...NO_FILTERS,
      statuses: ['done'],
      timing: 'whole-day',
    });

    expect(found.map((task) => task.title)).toEqual(['a']);
  });

  it('counts only filters that narrow, not the sort', () => {
    expect(activeFilterCount({ ...NO_FILTERS, sort: 'title' })).toBe(0);
    expect(
      activeFilterCount({ ...NO_FILTERS, query: ' ', statuses: ['done'] }),
    ).toBe(1);
  });

  it('survives a round trip through the query params', () => {
    const filters = {
      ...NO_FILTERS,
      query: 'raport',
      statuses: ['open', 'done'] as const,
      categoryIds: ['work' as CategoryId],
      timing: 'timed' as const,
      sort: 'priority' as const,
    };
    const params = new URLSearchParams();
    for (const [name, value] of Object.entries(
      filtersToParams({ ...filters, statuses: [...filters.statuses] }),
    ))
      if (value !== null) params.set(name, value);

    expect(filtersFromParams(params)).toEqual({
      ...filters,
      statuses: ['open', 'done'],
    });
  });

  it('falls back to defaults for unknown params', () => {
    const params = new URLSearchParams('status=zzz&timing=zzz&sort=zzz');

    expect(filtersFromParams(params)).toEqual(NO_FILTERS);
  });
});
