import { describe, expect, it } from 'vitest';
import {
  ageLabel,
  formatDay,
  formatMoney,
  taskCount,
  unfinishedSummary,
} from '../domain/format';

const NOW = Date.parse('2026-10-12T12:00:00.000Z');
const ago = (ms: number) => new Date(NOW - ms).toISOString();
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe('notification age label', () => {
  it('says just now for a fresh notification', () => {
    expect(ageLabel(ago(10_000), NOW)).toBe('przed chwilą');
  });

  it('counts minutes', () => {
    expect(ageLabel(ago(5 * MINUTE), NOW)).toBe('5 min temu');
  });

  it('counts hours', () => {
    expect(ageLabel(ago(3 * HOUR), NOW)).toBe('3 godz. temu');
  });

  it('uses singular for one day', () => {
    expect(ageLabel(ago(DAY), NOW)).toBe('1 dzień temu');
  });

  it('uses plural for more days', () => {
    expect(ageLabel(ago(5 * DAY), NOW)).toBe('5 dni temu');
  });
});

describe('task count label', () => {
  it.each([
    [1, '1 zadanie'],
    [2, '2 zadania'],
    [4, '4 zadania'],
    [5, '5 zadań'],
    [12, '12 zadań'],
    [22, '22 zadania'],
    [0, '0 zadań'],
  ])('writes %i as "%s"', (count, label) => {
    expect(taskCount(count)).toBe(label);
  });
});

describe('unfinished tasks summary', () => {
  it('lists today titles and the total of open tasks', () => {
    expect(
      unfinishedSummary({
        tasks: [{ title: 'Raport' }, { title: 'Bank' }],
        totalOpen: 5,
      }),
    ).toBe('Dziś: Raport, Bank · Niezrobione łącznie: 5');
  });

  it('falls back to a count when an old row has no total', () => {
    expect(unfinishedSummary({ tasks: [{ title: 'A' }, { title: 'B' }] })).toBe(
      'Do zrobienia: 2 zadania',
    );
  });

  it('keeps a zero total instead of treating it as missing', () => {
    expect(unfinishedSummary({ tasks: [{ title: 'A' }], totalOpen: 0 })).toBe(
      'Dziś: A · Niezrobione łącznie: 0',
    );
  });
});

describe('money and day labels', () => {
  it('writes money in zloty with a decimal comma', () => {
    expect(formatMoney(12345.5).replace(/\s/g, ' ')).toBe('12 345,50 zł');
  });

  it('writes a plain day with its weekday', () => {
    expect(formatDay('2025-04-14')).toBe('pon. 14 kwi 2025');
  });

  it('writes an ISO instant as a day too', () => {
    expect(formatDay('2025-04-14T10:00:00.000Z')).toMatch(/14 kwi 2025$/);
  });
});
