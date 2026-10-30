import { expect, test } from '@playwright/test';
import {
  createAccount,
  dayFromToday,
  insertRows,
  type Account,
} from './finance-api';

/**
 * Every reader past 1000 rows: the Data API answers at most 1000 rows per
 * request, so a reader that does not page silently drops the rest.
 */

const baseURL = (): string => test.info().project.use.baseURL!;
const MANY = 1200;

const withAccount = async (
  label: string,
  run: (account: Account) => Promise<void>,
) => {
  const account = await createAccount(baseURL(), label, label);
  try {
    await run(account);
  } finally {
    await account.remove();
  }
};

test.describe('readers past 1000 rows', () => {
  test.describe.configure({ timeout: 120_000 });

  const devices = (account: Account) =>
    account.seed({
      categories: [{ id: 'c', name: 'C' }],
      expenses: Array.from({ length: MANY }, (_, i) => ({
        id: `x${i}`,
        // The oldest expense is the only one from the old device.
        date: new Date(Date.UTC(2026, 0, 1) + i * 3_600_000).toISOString(),
        amount: 1,
        categoryId: 'c',
        deviceId: i === 0 ? 'dev-old' : 'dev-new',
        deviceName: i === 0 ? 'Old phone' : 'New phone',
      })),
    });

  test('settings list a device whose expenses are all old', async () => {
    await withAccount('devlist', async (account) => {
      await devices(account);

      const res = await account.http.get('/api/settings/');
      const { data } = await res.json();

      expect(res.status()).toBe(200);
      expect(data.devices.map((d: { id: string }) => d.id).sort()).toEqual([
        'dev-new',
        'dev-old',
      ]);
    });
  });

  test('settings save a name for a device whose expenses are all old', async () => {
    await withAccount('devsave', async (account) => {
      await devices(account);
      const current = (await (await account.http.get('/api/settings/')).json())
        .data;

      const put = await account.http.put('/api/settings/', {
        data: {
          ...current,
          devices: [
            {
              id: 'dev-old',
              name: 'Old phone',
              type: 'mobile',
              avatar: null,
              customName: 'Grandpa phone',
            },
          ],
        },
      });
      expect(put.ok()).toBe(true);

      const after = (await (await account.http.get('/api/settings/')).json())
        .data;
      expect(
        after.devices.find((d: { id: string }) => d.id === 'dev-old')
          ?.customName,
      ).toBe('Grandpa phone');
    });
  });

  test('a limit reached by more than 1000 expenses of the month alerts', async () => {
    await withAccount('limitcap', async (account) => {
      const month = dayFromToday(0).slice(0, 8);
      await account.seed({
        categories: [{ id: 'c', name: 'C' }],
        expenses: Array.from({ length: MANY }, (_, i) => ({
          id: `x${i}`,
          date: `${month}01T${String(i % 24).padStart(2, '0')}:00:00Z`,
          amount: 1,
          categoryId: 'c',
        })),
        limits: [{ id: 'lim', scope: 'total', amount: 1100, alertAt: 100 }],
      });

      const created = await account.http.post('/api/expenses/', {
        data: {
          id: 'trigger',
          merchant: 'Trigger',
          date: `${month}02T10:00:00Z`,
          amount: 1,
          categoryId: 'c',
          paymentMethod: 'card',
          isBill: false,
          source: 'manual',
          items: [],
        },
      });
      expect(created.status()).toBe(201);

      const { data } = await (
        await account.http.get('/api/notifications/')
      ).json();
      expect(data.map((n: { kind: string }) => n.kind)).toContain(
        'limit-reached',
      );
    });
  });

  test('the backlog lists every task', async () => {
    await withAccount('backlog', async (account) => {
      await insertRows(
        'time_tasks',
        Array.from({ length: MANY }, (_, i) => ({
          user_id: account.id,
          id: `t${i}`,
          title: `Task ${i}`,
          category_id: 'work',
          priority_id: 'low',
          day: null,
          at: null,
          done: false,
        })),
      );

      const res = await account.http.get(
        '/api/time/?from=2026-01-01&to=2026-01-31&tz=UTC',
      );
      const { data } = await res.json();

      expect(res.status()).toBe(200);
      expect(data.backlog).toHaveLength(MANY);
    });
  });

  test('categories list every category', async () => {
    await withAccount('manycats', async (account) => {
      await account.seed({
        categories: Array.from({ length: MANY }, (_, i) => ({
          id: `c${i}`,
          name: `Category ${i}`,
        })),
      });

      const { data } = await (
        await account.http.get('/api/categories/')
      ).json();

      expect(data).toHaveLength(MANY);
    });
  });

  test('recurring lists every rule', async () => {
    await withAccount('manyrules', async (account) => {
      await account.seed({
        categories: [{ id: 'c', name: 'C' }],
        recurring: Array.from({ length: MANY }, (_, i) => ({
          id: `r${i}`,
          name: `Rule ${i}`,
          cost: 1,
          categoryId: 'c',
          startDate: '2099-01-01',
        })),
      });

      const { data } = await (await account.http.get('/api/recurring/')).json();

      expect(data).toHaveLength(MANY);
    });
  });
});
