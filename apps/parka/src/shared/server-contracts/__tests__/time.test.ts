import { describe, expect, it } from 'vitest';
import {
  createTimePrioritySchema,
  createTimeTaskSchema,
  listTimeSchema,
} from '../schemas/time';

const TASK = {
  id: 't-1',
  title: 'Raport',
  categoryId: 'work',
  priorityId: 'high',
  day: '2026-10-20',
  at: '09:00',
  done: false,
};

describe('time contracts', () => {
  it('trims the title of a task', () => {
    const parsed = createTimeTaskSchema().shape.in.parse({
      ...TASK,
      title: '  Raport ',
    });

    expect(parsed.title).toBe('Raport');
  });

  it('accepts a whole-day task', () => {
    expect(
      createTimeTaskSchema().shape.in.safeParse({ ...TASK, at: null }).success,
    ).toBe(true);
  });

  it.each([
    ['a blank title', { title: '   ' }],
    ['a too long title', { title: 'x'.repeat(41) }],
    ['a malformed day', { day: '20.10.2026' }],
    ['an hour out of range', { at: '24:00' }],
    ['a time with seconds', { at: '09:00:00' }],
  ])('rejects a task with %s', (_, patch) => {
    expect(
      createTimeTaskSchema().shape.in.safeParse({ ...TASK, ...patch }).success,
    ).toBe(false);
  });

  it.each([0, 11, 2.5])('rejects the priority value %s', (value) => {
    expect(
      createTimePrioritySchema().shape.in.safeParse({
        id: 'p-1',
        name: 'Pilny',
        value,
      }).success,
    ).toBe(false);
  });

  it('requires the range of a listing', () => {
    expect(
      listTimeSchema().shape.in.safeParse({ from: '2026-10-19' }).success,
    ).toBe(false);
  });
});
