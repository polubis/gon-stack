import { expect, test } from '@playwright/test';
import { createAccount, type Account, type SeedExpense } from './finance-api';

/**
 * A long history must be read whole: the Data API answers at most 1000 rows
 * per request, and a silent cut would drop expenses from lists and totals.
 */

const baseURL = (): string => test.info().project.use.baseURL!;

const EXPENSES = 2500;
const FOOD = { id: 'food', name: 'Food', color: '#aa0000' };
const FUN = { id: 'fun', name: 'Fun', color: '#00aa00' };

/** Even ones: 2.00 in food. Odd ones: 2.00 made of a food and a fun product. */
const history = (): SeedExpense[] =>
  Array.from({ length: EXPENSES }, (_, i): SeedExpense => {
    const day = String((i % 28) + 1).padStart(2, '0');
    const date = `2026-03-${day}T${String(i % 24).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}:00Z`;
    return i % 2 === 0
      ? { id: `h${i}`, date, amount: 2, categoryId: 'food' }
      : {
          id: `h${i}`,
          date,
          amount: 2,
          categoryId: null,
          items: [
            { id: `h${i}-a`, unitPrice: 1, categoryId: 'food' },
            { id: `h${i}-b`, unitPrice: 1, categoryId: 'fun' },
          ],
        };
  });

test.describe('a history past 1000 rows', () => {
  test.describe.configure({ timeout: 120_000 });
  let account: Account;

  test.beforeAll(async () => {
    account = await createAccount(baseURL(), 'long', 'Long History');
    await account.seed({ categories: [FOOD, FUN], expenses: history() });
  });
  test.afterAll(async () => {
    await account.remove();
  });

  test('the expense list returns every expense with every product', async () => {
    const res = await account.http.get('/api/expenses/?tz=UTC');
    const { data } = (await res.json()) as {
      data: { id: string; items: unknown[] }[];
    };

    expect(res.status()).toBe(200);
    expect(data.length).toBe(EXPENSES);
    expect(new Set(data.map((e) => e.id)).size).toBe(EXPENSES);
    expect(data.reduce((n, e) => n + e.items.length, 0)).toBe(EXPENSES);
  });

  test('the dashboard totals include every expense and product', async () => {
    const res = await account.http.get(
      '/api/dashboard/?kind=month&from=2026-03-10&tz=UTC',
    );
    const { data } = await res.json();

    expect(res.status()).toBe(200);
    expect(data.total).toBe(EXPENSES * 2);
    expect(data.transactions).toBe(EXPENSES);
    expect(
      data.series.reduce(
        (sum: number, p: { total: number }) => sum + p.total,
        0,
      ),
    ).toBe(EXPENSES * 2);
    expect(
      data.categories.map((c: { categoryId: string; amount: number }) => [
        c.categoryId,
        c.amount,
      ]),
    ).toEqual([
      ['food', 3750],
      ['fun', 1250],
    ]);
  });
});
