import { describe, expect, it } from 'vitest';
import { money, monthOf } from '../domain/format';
import { newExpenseId, newRecurringId } from '../domain/ids';

describe('money format', () => {
  it('shows amount in zloty with two decimals', () => {
    expect(money(12.5).replace(/\s/g, ' ')).toBe('12,50 zł');
  });

  it('groups thousands', () => {
    expect(money(1234567.891).replace(/\s/g, ' ')).toBe('1 234 567,89 zł');
  });

  it('shows zero as a price', () => {
    expect(money(0).replace(/\s/g, ' ')).toBe('0,00 zł');
  });
});

describe('month of a date', () => {
  it('gives the month of a plain day', () => {
    expect(monthOf('2026-03-15')).toBe('2026-03');
  });

  it('gives the month of an instant at midday', () => {
    expect(monthOf('2026-11-15T12:00:00')).toBe('2026-11');
  });
});

describe('new ids', () => {
  it('prefixes an expense id so it is told apart from a rule id', () => {
    expect(newExpenseId()).toMatch(/^expense-/);
    expect(newRecurringId()).toMatch(/^recurring-/);
  });

  it('never repeats an id', () => {
    expect(newExpenseId()).not.toBe(newExpenseId());
  });
});
