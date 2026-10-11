import { expect, type Page } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { test, type Ctx } from '@/__e2e__/test';
import { registerAndConfirm } from '@/__e2e__/mailbox';
import { API_ROUTER } from '@/shared/router/routes';

/**
 * Integration coverage for the per-entity REST endpoints (categories,
 * expenses, limits, recurring, notifications, settings) added to
 * replace the aggregate `/api/state` GET/PUT. Registers a fresh Supabase user
 * (starting with no data) then drives each endpoint
 * directly through `page.request`, which shares the browser's auth cookies.
 */

const EMAIL = `e2e-rest-${Date.now()}@parka.test`;
const PASSWORD = 'secret123';

/** Astro's CSRF check treats a body-less DELETE as a cross-site form
 * submission; an explicit JSON content type keeps it in the API-request
 * path instead. */
const del = (page: Page, path: string) =>
  page.request.delete(path, {
    headers: { 'Content-Type': 'application/json' },
  });

/** Zone whose "today" the server charges recurring payments by. */
const ZONE = 'UTC';

/** `YYYY-MM-DD` of the UTC day `offset` days from today. */
const dayFromToday = (offset: number): string => {
  const day = new Date();
  day.setUTCDate(day.getUTCDate() + offset);
  return day.toISOString().slice(0, 10);
};

type Charged = {
  recurringId: string | null;
  occurrenceDate: string | null;
  merchant: string;
  amount: number;
};

/** Expenses a rule created, newest occurrence first. */
const chargedBy = (list: Charged[], recurringId: string): Charged[] =>
  list
    .filter((e) => e.recurringId === recurringId)
    .sort((a, b) => (a.occurrenceDate! < b.occurrenceDate! ? 1 : -1));

const categoryIdByPage = new WeakMap<Page, string>();
const settingsEmailByPage = new WeakMap<Page, string>();

const commands = {
  'i register and sign in': async (ctx) => {
    await registerAndConfirm(ctx, EMAIL, PASSWORD);
  },

  'a new account has no categories': async ({ page }) => {
    const res = await page.request.get(API_ROUTER.categories());
    expect(res.ok()).toBe(true);
    expect((await res.json()).data).toEqual([]);
  },
  'i create a category': async ({ page }) => {
    const res = await page.request.post(API_ROUTER.categories(), {
      data: {
        id: 'e2e-cat-1',
        name: 'Kultura',
        icon: 'star',
        color: '#ff0000',
      },
    });
    expect(res.status()).toBe(201);
    expect((await res.json()).data.name).toBe('Kultura');
    categoryIdByPage.set(page, 'e2e-cat-1');
  },
  'i rename the category': async ({ page }) => {
    const res = await page.request.put(API_ROUTER.categoryById('e2e-cat-1'), {
      data: { id: 'e2e-cat-1', name: 'Sztuka', icon: 'star', color: '#ff0000' },
    });
    expect(res.ok()).toBe(true);
    expect((await res.json()).data.name).toBe('Sztuka');
  },

  'i create an expense with items': async ({ page }) => {
    const categoryId = categoryIdByPage.get(page)!;
    const res = await page.request.post(API_ROUTER.expenses(), {
      data: {
        id: 'e2e-exp-1',
        merchant: 'Sklep E2E',
        date: '2025-04-10',
        amount: 12.5,
        categoryId,
        paymentMethod: 'card',
        isBill: false,
        source: 'manual',
        items: [
          {
            id: 'e2e-item-1',
            name: 'Chleb',
            unitPrice: 12.5,
            quantity: 1,
            discount: 0,
            categoryId,
          },
        ],
      },
    });
    expect(res.status()).toBe(201);
    expect((await res.json()).data.items).toHaveLength(1);
  },
  'i update the expense removing its items': async ({ page }) => {
    const categoryId = categoryIdByPage.get(page)!;
    const res = await page.request.put(API_ROUTER.expenseById('e2e-exp-1'), {
      data: {
        id: 'e2e-exp-1',
        merchant: 'Sklep E2E Zmieniony',
        date: '2025-04-10',
        amount: 20,
        categoryId,
        paymentMethod: 'card',
        isBill: false,
        source: 'manual',
        items: [],
      },
    });
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(body.data.merchant).toBe('Sklep E2E Zmieniony');
    expect(body.data.items).toHaveLength(0);
  },
  'the expense list reflects the update': async ({ page }) => {
    const body = await (await page.request.get(API_ROUTER.expenses())).json();
    expect(
      body.data.find((e: { id: string }) => e.id === 'e2e-exp-1').merchant,
    ).toBe('Sklep E2E Zmieniony');
  },
  'i delete the expense': async ({ page }) => {
    const res = await del(page, API_ROUTER.expenseById('e2e-exp-1'));
    expect(res.ok()).toBe(true);
  },
  'the expense is gone from the list': async ({ page }) => {
    const body = await (await page.request.get(API_ROUTER.expenses())).json();
    expect(body.data.some((e: { id: string }) => e.id === 'e2e-exp-1')).toBe(
      false,
    );
  },

  'i create a limit': async ({ page }) => {
    const res = await page.request.post(API_ROUTER.limits(), {
      data: {
        id: 'e2e-limit-1',
        scope: 'total',
        amount: 1000,
        alertAt80: true,
        delivery: 'push',
      },
    });
    expect(res.status()).toBe(201);
  },
  'i raise the limit amount': async ({ page }) => {
    const res = await page.request.put(API_ROUTER.limitById('e2e-limit-1'), {
      data: {
        id: 'e2e-limit-1',
        scope: 'total',
        amount: 1500,
        alertAt80: true,
        delivery: 'email',
      },
    });
    expect(res.ok()).toBe(true);
    expect((await res.json()).data.amount).toBe(1500);
  },
  'i delete the limit': async ({ page }) => {
    const res = await del(page, API_ROUTER.limitById('e2e-limit-1'));
    expect(res.ok()).toBe(true);
  },
  'deleting the limit again is not found': async ({ page }) => {
    const res = await del(page, API_ROUTER.limitById('e2e-limit-1'));
    expect(res.status()).toBe(404);
  },

  'i create a weekly recurring rule that started 20 days ago': async ({
    page,
  }) => {
    const categoryId = categoryIdByPage.get(page)!;
    const res = await page.request.post(API_ROUTER.recurring(), {
      data: {
        id: 'e2e-rec-1',
        name: 'Netflix',
        cost: 45,
        interval: 'weekly',
        startDate: dayFromToday(-20),
        endDate: null,
        active: true,
        paymentMethod: 'card',
        categoryId,
      },
    });
    expect(res.status()).toBe(201);
    expect((await res.json()).data.lastMaterializedDate).toBeNull();
  },
  'a new rule has charged nothing until it is read': async ({ page }) => {
    // The create call itself must not charge anything.
    const body = await (await page.request.get(API_ROUTER.expenses())).json();
    expect(chargedBy(body.data, 'e2e-rec-1')).toHaveLength(0);
  },
  'the first read catches up every payment that came due': async ({ page }) => {
    const body = await (
      await page.request.get(API_ROUTER.expenses({ tz: ZONE }))
    ).json();
    expect(
      chargedBy(body.data, 'e2e-rec-1').map((e) => e.occurrenceDate),
    ).toEqual([dayFromToday(-6), dayFromToday(-13), dayFromToday(-20)]);
    expect(chargedBy(body.data, 'e2e-rec-1')[0]).toMatchObject({
      merchant: 'Netflix',
      amount: 45,
      recurringId: 'e2e-rec-1',
    });
  },
  'reading again charges nothing twice': async ({ page }) => {
    await page.request.get(API_ROUTER.recurring({ tz: ZONE }));
    const body = await (
      await page.request.get(API_ROUTER.expenses({ tz: ZONE }))
    ).json();
    expect(chargedBy(body.data, 'e2e-rec-1')).toHaveLength(3);
  },
  'the dashboard counts the charged payments and not the upcoming one': async ({
    page,
  }) => {
    const body = await (
      await page.request.get(
        API_ROUTER.dashboard({
          kind: 'custom',
          from: dayFromToday(-30),
          to: dayFromToday(0),
          tz: ZONE,
        }),
      )
    ).json();
    expect(body.data.total).toBe(135);
    expect(body.data.transactions).toBe(3);
  },
  'i delete one charged payment': async ({ page }) => {
    const res = await del(
      page,
      API_ROUTER.expenseById(`e2e-rec-1:${dayFromToday(-13)}`),
    );
    expect(res.ok()).toBe(true);
  },
  'the deleted payment does not come back and the rule stays': async ({
    page,
  }) => {
    const expenses = await (
      await page.request.get(API_ROUTER.expenses({ tz: ZONE }))
    ).json();
    expect(
      chargedBy(expenses.data, 'e2e-rec-1').map((e) => e.occurrenceDate),
    ).toEqual([dayFromToday(-6), dayFromToday(-20)]);
    const rules = await (
      await page.request.get(API_ROUTER.recurring({ tz: ZONE }))
    ).json();
    expect(rules.data).toHaveLength(1);
    expect(rules.data[0].lastMaterializedDate).toBe(dayFromToday(-6));
  },
  'i edit the rule and cannot move its materialization mark': async ({
    page,
  }) => {
    const categoryId = categoryIdByPage.get(page)!;
    const res = await page.request.put(API_ROUTER.recurringById('e2e-rec-1'), {
      data: {
        id: 'e2e-rec-1',
        name: 'Netflix',
        cost: 50,
        interval: 'weekly',
        startDate: dayFromToday(-20),
        endDate: null,
        lastMaterializedDate: '2000-01-01',
        active: true,
        paymentMethod: 'card',
        categoryId,
      },
    });
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(body.data.cost).toBe(50);
    expect(body.data.lastMaterializedDate).toBe(dayFromToday(-6));
  },
  'the edit left the charged payments as they were': async ({ page }) => {
    const body = await (
      await page.request.get(API_ROUTER.expenses({ tz: ZONE }))
    ).json();
    expect(chargedBy(body.data, 'e2e-rec-1').map((e) => e.amount)).toEqual([
      45, 45,
    ]);
  },
  'i delete the rule': async ({ page }) => {
    const res = await del(page, API_ROUTER.recurringById('e2e-rec-1'));
    expect(res.ok()).toBe(true);
  },
  'the charged payments stay as ordinary expenses': async ({ page }) => {
    const body = await (
      await page.request.get(API_ROUTER.expenses({ tz: ZONE }))
    ).json();
    const kept = (
      body.data as { merchant: string; recurringId: string | null }[]
    ).filter((e) => e.merchant === 'Netflix');
    expect(kept).toHaveLength(2);
    expect(kept.every((e) => e.recurringId === null)).toBe(true);
  },

  'i create a notification': async ({ page }) => {
    const res = await page.request.post(API_ROUTER.notifications(), {
      data: {
        id: 'e2e-notif-1',
        kind: 'info',
        title: 'Test',
        body: 'Wiadomość testowa',
        ageDays: 0,
      },
    });
    expect(res.status()).toBe(201);
  },
  'i dismiss the notification': async ({ page }) => {
    const res = await del(page, API_ROUTER.notificationById('e2e-notif-1'));
    expect(res.ok()).toBe(true);
  },
  'the notification is gone from the list': async ({ page }) => {
    const body = await (
      await page.request.get(API_ROUTER.notifications())
    ).json();
    expect(body.data.some((n: { id: string }) => n.id === 'e2e-notif-1')).toBe(
      false,
    );
  },

  'settings are readable': async ({ page }) => {
    const body = await (await page.request.get(API_ROUTER.settings())).json();
    expect(body.data.profile.email).toBeDefined();
    settingsEmailByPage.set(page, body.data.profile.email);
    const putRes = await page.request.put(API_ROUTER.settings(), {
      data: {
        profile: { name: 'Anna REST', email: body.data.profile.email },
        notifications: body.data.notifications,
      },
    });
    expect(putRes.ok()).toBe(true);
  },
  'the settings profile name is updated': async ({ page }) => {
    const body = await (await page.request.get(API_ROUTER.settings())).json();
    expect(body.data.profile.name).toBe('Anna REST');
  },
} satisfies CommandRegistry<Ctx>;

test('REST endpoints CRUD each finance entity through Postgres', async ({
  e2e,
}) => {
  await interpreter(commands, e2e)(
    ['i register and sign in'],
    ['a new account has no categories'],
    ['i create a category'],
    ['i rename the category'],
    ['i create an expense with items'],
    ['i update the expense removing its items'],
    ['the expense list reflects the update'],
    ['i delete the expense'],
    ['the expense is gone from the list'],
    ['i create a limit'],
    ['i raise the limit amount'],
    ['i delete the limit'],
    ['deleting the limit again is not found'],
    ['i create a weekly recurring rule that started 20 days ago'],
    ['a new rule has charged nothing until it is read'],
    ['the first read catches up every payment that came due'],
    ['reading again charges nothing twice'],
    ['the dashboard counts the charged payments and not the upcoming one'],
    ['i delete one charged payment'],
    ['the deleted payment does not come back and the rule stays'],
    ['i edit the rule and cannot move its materialization mark'],
    ['the edit left the charged payments as they were'],
    ['i delete the rule'],
    ['the charged payments stay as ordinary expenses'],
    ['i create a notification'],
    ['i dismiss the notification'],
    ['the notification is gone from the list'],
    ['settings are readable'],
    ['the settings profile name is updated'],
  );
});
