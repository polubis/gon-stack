import { describe, expect, it } from 'vitest';
import {
  dueOccurrences,
  MAX_CATCH_UP,
  upcomingOccurrences,
  type RecurringRule,
} from '../occurrences';

const rule = (over: Partial<RecurringRule> = {}): RecurringRule => ({
  id: 'r-1',
  name: 'Netflix',
  cost: 30,
  interval: 'monthly',
  startDate: '2025-05-15',
  endDate: null,
  lastMaterializedDate: null,
  active: true,
  categoryId: 'c-1',
  ...over,
});

describe('due occurrences', () => {
  it('has nothing due before the start date', () => {
    expect(dueOccurrences(rule(), '2025-05-14')).toEqual([]);
  });

  it('becomes due on the occurrence day itself', () => {
    expect(dueOccurrences(rule(), '2025-05-15')).toEqual(['2025-05-15']);
  });

  it('catches up every missed occurrence when the app stayed closed', () => {
    expect(dueOccurrences(rule(), '2025-08-20')).toEqual([
      '2025-05-15',
      '2025-06-15',
      '2025-07-15',
      '2025-08-15',
    ]);
  });

  it('continues after the last materialized day, never before it', () => {
    const due = dueOccurrences(
      rule({ lastMaterializedDate: '2025-06-15' }),
      '2025-08-20',
    );

    expect(due).toEqual(['2025-07-15', '2025-08-15']);
  });

  it('does not bring back an occurrence the user deleted', () => {
    const caughtUp = rule({ lastMaterializedDate: '2025-08-15' });

    expect(dueOccurrences(caughtUp, '2025-08-20')).toEqual([]);
  });

  it('stops at the end date', () => {
    expect(
      dueOccurrences(rule({ endDate: '2025-06-30' }), '2026-01-01'),
    ).toEqual(['2025-05-15', '2025-06-15']);
  });

  it('skips paused rules', () => {
    expect(dueOccurrences(rule({ active: false }), '2025-08-20')).toEqual([]);
  });

  it('repeats weekly', () => {
    const weekly = rule({ interval: 'weekly', startDate: '2025-05-01' });

    expect(dueOccurrences(weekly, '2025-05-20')).toEqual([
      '2025-05-01',
      '2025-05-08',
      '2025-05-15',
    ]);
  });

  it('repeats yearly', () => {
    const yearly = rule({ interval: 'yearly', startDate: '2023-03-10' });

    expect(dueOccurrences(yearly, '2025-04-01')).toEqual([
      '2023-03-10',
      '2024-03-10',
      '2025-03-10',
    ]);
  });

  it('keeps a late-month day within shorter months without drifting', () => {
    const late = rule({ startDate: '2025-01-31' });

    expect(dueOccurrences(late, '2025-04-30')).toEqual([
      '2025-01-31',
      '2025-02-28',
      '2025-03-31',
      '2025-04-30',
    ]);
  });

  it('keeps a leap day on the last day of February in other years', () => {
    const leap = rule({ interval: 'yearly', startDate: '2024-02-29' });

    expect(dueOccurrences(leap, '2025-12-31')).toEqual([
      '2024-02-29',
      '2025-02-28',
    ]);
  });

  it('caps one catch-up so a far past start cannot flood the account', () => {
    const weekly = rule({ interval: 'weekly', startDate: '1900-01-01' });

    expect(dueOccurrences(weekly, '2025-01-01')).toHaveLength(MAX_CATCH_UP);
  });
});

describe('upcoming occurrences', () => {
  it('projects the next three occurrences after today', () => {
    expect(upcomingOccurrences(rule(), '2025-06-20')).toEqual([
      '2025-07-15',
      '2025-08-15',
      '2025-09-15',
    ]);
  });

  it('does not count an occurrence that is due today', () => {
    expect(upcomingOccurrences(rule(), '2025-05-15', 1)).toEqual([
      '2025-06-15',
    ]);
  });

  it('shows the first occurrence of a rule that has not started', () => {
    expect(upcomingOccurrences(rule(), '2025-01-01', 1)).toEqual([
      '2025-05-15',
    ]);
  });

  it('stops at the end date', () => {
    const ending = rule({ endDate: '2025-08-31' });

    expect(upcomingOccurrences(ending, '2025-06-20')).toEqual([
      '2025-07-15',
      '2025-08-15',
    ]);
  });

  it('has nothing for a rule that already ended or is paused', () => {
    expect(
      upcomingOccurrences(rule({ endDate: '2025-06-01' }), '2025-07-01'),
    ).toEqual([]);
    expect(upcomingOccurrences(rule({ active: false }), '2025-01-01')).toEqual(
      [],
    );
  });
});
