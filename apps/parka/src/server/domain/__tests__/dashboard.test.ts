import { describe, expect, it } from 'vitest';
import {
  summarizeDashboard,
  type DashboardCategory,
  type DashboardExpense,
} from '../dashboard';

const categories: DashboardCategory[] = [
  { id: 'food', name: 'Food', color: 'green' },
  { id: 'fun', name: 'Fun', color: 'red' },
];

const expense = (
  date: string,
  amount: number,
  categoryId = 'food',
): DashboardExpense => ({ date, amount, categoryId });

const summarize = (
  month: string,
  today: string,
  expenses: DashboardExpense[],
  monthlyLimit: number | null = null,
) => summarizeDashboard({ expenses, categories, month, today, monthlyLimit });

describe('dashboard summary', () => {
  const expenses = [
    expense('2026-08-31', 40),
    expense('2026-09-01', 30),
    expense('2026-09-10', 60, 'fun'),
  ];

  it('averages a past month over all its days', () => {
    expect(summarize('2026-09', '2026-10-15', expenses).dailyAverage).toBe(3);
  });

  it('averages the current month over the days elapsed so far', () => {
    expect(summarize('2026-09', '2026-09-10', expenses).dailyAverage).toBe(9);
  });

  it('reports a zero average for a future month', () => {
    expect(summarize('2026-09', '2026-08-31', expenses).dailyAverage).toBe(0);
  });

  it('handles a month without expenses', () => {
    const summary = summarize('2026-07', '2026-10-15', expenses);

    expect(summary.total).toBe(0);
    expect(summary.transactions).toBe(0);
    expect(summary.change).toBe(0);
    expect(summary.categories).toEqual([]);
  });

  it('compares with the previous month', () => {
    const summary = summarize('2026-09', '2026-10-15', expenses);

    expect(summary.previousTotal).toBe(40);
    expect(summary.change).toBe(125);
  });

  it('counts transactions of the selected month only', () => {
    expect(summarize('2026-09', '2026-10-15', expenses).transactions).toBe(2);
  });

  it('lists one daily point per day of the month', () => {
    const feb = summarize('2026-02', '2026-10-15', []);
    const march = summarize('2026-03', '2026-10-15', []);

    expect(feb.daily).toHaveLength(28);
    expect(feb.daily[0]).toEqual({ day: 1, total: 0 });
    expect(feb.daily.at(-1)?.day).toBe(28);
    expect(feb.previousDaily).toHaveLength(31);
    expect(march.daily).toHaveLength(31);
    expect(march.previousDaily).toHaveLength(28);
  });

  it('sums expenses into their day, also for the previous month', () => {
    const summary = summarize('2026-09', '2026-10-15', expenses);

    expect(summary.daily[0]).toEqual({ day: 1, total: 30 });
    expect(summary.daily[9]).toEqual({ day: 10, total: 60 });
    expect(summary.previousDaily[30]).toEqual({ day: 31, total: 40 });
  });

  it('breaks the selected month down by category, biggest first', () => {
    const summary = summarize('2026-09', '2026-10-15', expenses);

    expect(summary.categories.map((c) => [c.categoryId, c.amount])).toEqual([
      ['fun', 60],
      ['food', 30],
    ]);
    expect(summary.categories[0]?.pct).toBeCloseTo(66.67, 1);
  });

  it('splits a multi-category expense across its product categories', () => {
    const mixed: DashboardExpense = {
      date: '2026-09-12',
      amount: 50,
      categoryId: null,
      items: [
        { categoryId: 'food', unitPrice: 20, quantity: 1, discount: 0 },
        { categoryId: 'fun', unitPrice: 15, quantity: 2, discount: 0 },
      ],
    };
    const summary = summarize('2026-09', '2026-10-15', [mixed]);

    expect(summary.total).toBe(50);
    expect(summary.transactions).toBe(1);
    expect(summary.categories.map((c) => [c.categoryId, c.amount])).toEqual([
      ['fun', 30],
      ['food', 20],
    ]);
  });

  it('passes the monthly limit through', () => {
    expect(summarize('2026-09', '2026-10-15', [], 500).monthlyLimit).toBe(500);
    expect(summarize('2026-09', '2026-10-15', []).monthlyLimit).toBeNull();
  });
});
