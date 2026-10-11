import { describe, expect, it } from 'vitest';
import {
  periodContaining,
  shiftPeriod,
  type PeriodKind,
} from '@/shared/period/period';
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
  kind: PeriodKind,
  day: string,
  today: string,
  expenses: DashboardExpense[],
  monthlyLimit: number | null = null,
) => {
  const period = periodContaining(kind, day);
  return summarizeDashboard({
    expenses,
    categories,
    period,
    previous: shiftPeriod(period, -1),
    today,
    monthlyLimit,
  });
};

describe('dashboard summary', () => {
  const expenses = [
    expense('2026-08-31', 40),
    expense('2026-09-01', 30),
    expense('2026-09-10', 60, 'fun'),
  ];

  it('averages a past month over all its days', () => {
    expect(
      summarize('month', '2026-09-01', '2026-10-15', expenses).dailyAverage,
    ).toBe(3);
  });

  it('averages the current month over the days elapsed so far', () => {
    expect(
      summarize('month', '2026-09-01', '2026-09-10', expenses).dailyAverage,
    ).toBe(9);
  });

  it('reports a zero average for a future month', () => {
    expect(
      summarize('month', '2026-09-01', '2026-08-31', expenses).dailyAverage,
    ).toBe(0);
  });

  it('handles a month without expenses', () => {
    const summary = summarize('month', '2026-07-01', '2026-10-15', expenses);

    expect(summary.total).toBe(0);
    expect(summary.transactions).toBe(0);
    expect(summary.change).toBe(0);
    expect(summary.categories).toEqual([]);
  });

  it('compares with the previous month', () => {
    const summary = summarize('month', '2026-09-01', '2026-10-15', expenses);

    expect(summary.previousTotal).toBe(40);
    expect(summary.change).toBe(125);
  });

  it('counts transactions of the selected month only', () => {
    expect(
      summarize('month', '2026-09-01', '2026-10-15', expenses).transactions,
    ).toBe(2);
  });

  it('lists one point per day of the month', () => {
    const feb = summarize('month', '2026-02-01', '2026-10-15', []);
    const march = summarize('month', '2026-03-01', '2026-10-15', []);

    expect(feb.series).toHaveLength(28);
    expect(feb.series[0]).toEqual({ index: 1, total: 0 });
    expect(feb.series.at(-1)?.index).toBe(28);
    expect(feb.previousSeries).toHaveLength(31);
    expect(march.series).toHaveLength(31);
    expect(march.previousSeries).toHaveLength(28);
  });

  it('sums expenses into their day, also for the previous month', () => {
    const summary = summarize('month', '2026-09-01', '2026-10-15', expenses);

    expect(summary.series[0]).toEqual({ index: 1, total: 30 });
    expect(summary.series[9]).toEqual({ index: 10, total: 60 });
    expect(summary.previousSeries[30]).toEqual({ index: 31, total: 40 });
  });

  it('breaks the selected month down by category, biggest first', () => {
    const summary = summarize('month', '2026-09-01', '2026-10-15', expenses);

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
    const summary = summarize('month', '2026-09-01', '2026-10-15', [mixed]);

    expect(summary.total).toBe(50);
    expect(summary.transactions).toBe(1);
    expect(summary.categories.map((c) => [c.categoryId, c.amount])).toEqual([
      ['fun', 30],
      ['food', 20],
    ]);
  });

  it('passes the monthly limit through', () => {
    expect(
      summarize('month', '2026-09-01', '2026-10-15', [], 500).monthlyLimit,
    ).toBe(500);
    expect(
      summarize('month', '2026-09-01', '2026-10-15', []).monthlyLimit,
    ).toBeNull();
  });
});

describe('dashboard summary for other periods', () => {
  const expenses = [
    expense('2026-09-06', 5),
    expense('2026-09-07', 10),
    expense('2026-09-09', 20),
    expense('2026-09-13', 30),
    expense('2026-09-14', 99),
    expense('2025-03-02', 7),
    expense('2026-03-02', 70),
  ];

  it('totals one day', () => {
    const summary = summarize('day', '2026-09-09', '2026-10-15', expenses);

    expect(summary.total).toBe(20);
    expect(summary.transactions).toBe(1);
    expect(summary.series).toEqual([{ index: 1, total: 20 }]);
  });

  it('totals a Monday to Sunday week with a point per day', () => {
    const summary = summarize('week', '2026-09-09', '2026-10-15', expenses);

    expect(summary.total).toBe(60);
    expect(summary.series.map((p) => p.total)).toEqual([
      10, 0, 20, 0, 0, 0, 30,
    ]);
    expect(summary.previousTotal).toBe(5);
  });

  it('averages the running week over the days elapsed', () => {
    const summary = summarize(
      'week',
      '2026-09-09',
      '2026-09-09',
      expenses.slice(0, 3),
    );

    expect(summary.dailyAverage).toBe(10);
  });

  it('totals a year with a point per month', () => {
    const summary = summarize('year', '2026-03-02', '2026-10-15', expenses);

    expect(summary.series).toHaveLength(12);
    expect(summary.series[2]).toEqual({ index: 3, total: 70 });
    expect(summary.series[8]).toEqual({ index: 9, total: 164 });
    expect(summary.previousTotal).toBe(7);
    expect(summary.previousSeries[2]).toEqual({ index: 3, total: 7 });
  });
});
