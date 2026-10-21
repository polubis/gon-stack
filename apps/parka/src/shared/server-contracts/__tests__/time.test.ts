import { describe, expect, it } from 'vitest';
import {
  createTimeBacklogTaskSchema,
  updateTimeBacklogTaskSchema,
  createTimePrioritySchema,
  createTimeRecurringSchema,
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

  it('defaults the device and the rule of a task to none', () => {
    const parsed = createTimeTaskSchema().shape.in.parse(TASK);

    expect(parsed).toMatchObject({
      device: null,
      recurringId: null,
      occurrenceDate: null,
    });
  });

  it('accepts a task with a device', () => {
    const parsed = createTimeTaskSchema().shape.in.parse({
      ...TASK,
      device: { id: 'device-1', name: 'Chrome on Windows', type: 'desktop' },
    });

    expect(parsed.device).toMatchObject({ id: 'device-1', type: 'desktop' });
  });
});

describe('time recurring contracts', () => {
  const RULE = {
    id: 'r-1',
    title: 'Siłownia',
    categoryId: 'health',
    priorityId: 'medium',
    at: '18:00',
    interval: 'weekly',
    startDate: '2026-10-20',
  };

  it('defaults a rule to active without an end', () => {
    const parsed = createTimeRecurringSchema().shape.in.parse(RULE);

    expect(parsed).toMatchObject({
      active: true,
      endDate: null,
      lastMaterializedDate: null,
    });
  });

  it.each([
    ['an unknown interval', { interval: 'daily' }],
    ['a blank title', { title: ' ' }],
    ['a malformed start', { startDate: '20.10.2026' }],
    ['an hour out of range', { at: '25:00' }],
  ])('rejects a rule with %s', (_, patch) => {
    expect(
      createTimeRecurringSchema().shape.in.safeParse({ ...RULE, ...patch })
        .success,
    ).toBe(false);
  });
});

describe('time backlog contract', () => {
  const BACKLOG_TASK = {
    id: 'b-1',
    title: 'Dentysta',
    categoryId: 'health',
    priorityId: 'medium',
  };

  it('accepts a task without a day or an hour', () => {
    expect(
      createTimeBacklogTaskSchema().shape.in.safeParse(BACKLOG_TASK).success,
    ).toBe(true);
  });

  it('accepts an edit of a backlog task', () => {
    expect(
      updateTimeBacklogTaskSchema().shape.in.safeParse(BACKLOG_TASK).success,
    ).toBe(true);
  });

  it.each([
    ['a blank title', { title: '  ' }],
    ['a too long title', { title: 'x'.repeat(41) }],
    ['a missing category', { categoryId: '' }],
  ])('rejects a backlog task with %s', (_, patch) => {
    expect(
      createTimeBacklogTaskSchema().shape.in.safeParse({
        ...BACKLOG_TASK,
        ...patch,
      }).success,
    ).toBe(false);
  });
});
