import { expect, test, type Page } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { registerAndConfirm } from '@/__e2e__/mailbox';
import { API_ROUTER } from '@/shared/router';

/**
 * Integration coverage for the per-entity REST endpoints (categories,
 * expenses, limits, goals, recurring, notifications, settings) added to
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

const categoryIdByPage = new WeakMap<Page, string>();
const settingsEmailByPage = new WeakMap<Page, string>();

const commands = {
  'i register and sign in': async (page) => {
    await registerAndConfirm(page, EMAIL, PASSWORD);
  },

  'a new account has no categories': async (page) => {
    const res = await page.request.get(API_ROUTER.categories());
    expect(res.ok()).toBe(true);
    expect((await res.json()).data).toEqual([]);
  },
  'i create a category': async (page) => {
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
  'i rename the category': async (page) => {
    const res = await page.request.put(API_ROUTER.categoryById('e2e-cat-1'), {
      data: { id: 'e2e-cat-1', name: 'Sztuka', icon: 'star', color: '#ff0000' },
    });
    expect(res.ok()).toBe(true);
    expect((await res.json()).data.name).toBe('Sztuka');
  },

  'i create an expense with items': async (page) => {
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
  'i update the expense removing its items': async (page) => {
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
  'the expense list reflects the update': async (page) => {
    const body = await (await page.request.get(API_ROUTER.expenses())).json();
    expect(
      body.data.find((e: { id: string }) => e.id === 'e2e-exp-1').merchant,
    ).toBe('Sklep E2E Zmieniony');
  },
  'i delete the expense': async (page) => {
    const res = await del(page, API_ROUTER.expenseById('e2e-exp-1'));
    expect(res.ok()).toBe(true);
  },
  'the expense is gone from the list': async (page) => {
    const body = await (await page.request.get(API_ROUTER.expenses())).json();
    expect(body.data.some((e: { id: string }) => e.id === 'e2e-exp-1')).toBe(
      false,
    );
  },

  'i create a limit': async (page) => {
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
  'i raise the limit amount': async (page) => {
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
  'i delete the limit': async (page) => {
    const res = await del(page, API_ROUTER.limitById('e2e-limit-1'));
    expect(res.ok()).toBe(true);
  },
  'deleting the limit again is not found': async (page) => {
    const res = await del(page, API_ROUTER.limitById('e2e-limit-1'));
    expect(res.status()).toBe(404);
  },

  'i create a savings goal': async (page) => {
    const res = await page.request.post(API_ROUTER.goals(), {
      data: {
        id: 'e2e-goal-1',
        name: 'Wakacje',
        target: 5000,
        saved: 100,
        months: 12,
      },
    });
    expect(res.status()).toBe(201);
  },
  'i add savings to the goal': async (page) => {
    const res = await page.request.put(API_ROUTER.goalById('e2e-goal-1'), {
      data: {
        id: 'e2e-goal-1',
        name: 'Wakacje',
        target: 5000,
        saved: 500,
        months: 12,
      },
    });
    expect(res.ok()).toBe(true);
    expect((await res.json()).data.saved).toBe(500);
  },
  'i delete the goal': async (page) => {
    const res = await del(page, API_ROUTER.goalById('e2e-goal-1'));
    expect(res.ok()).toBe(true);
  },

  'i create a recurring expense with history': async (page) => {
    const categoryId = categoryIdByPage.get(page)!;
    const res = await page.request.post(API_ROUTER.recurring(), {
      data: {
        id: 'e2e-rec-1',
        name: 'Netflix',
        cost: 45,
        nextPaymentDate: '2025-05-01',
        active: true,
        paymentMethod: 'card',
        categoryId,
        history: [{ date: '2025-04-01', amount: 45 }],
      },
    });
    expect(res.status()).toBe(201);
    expect((await res.json()).data.history).toHaveLength(1);
  },
  'i deactivate the recurring expense and clear history': async (page) => {
    const categoryId = categoryIdByPage.get(page)!;
    const res = await page.request.put(API_ROUTER.recurringById('e2e-rec-1'), {
      data: {
        id: 'e2e-rec-1',
        name: 'Netflix',
        cost: 45,
        nextPaymentDate: '2025-06-01',
        active: false,
        paymentMethod: 'card',
        categoryId,
        history: [],
      },
    });
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(body.data.active).toBe(false);
    expect(body.data.history).toHaveLength(0);
  },
  'i delete the recurring expense': async (page) => {
    const res = await del(page, API_ROUTER.recurringById('e2e-rec-1'));
    expect(res.ok()).toBe(true);
  },

  'i create a notification': async (page) => {
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
  'i dismiss the notification': async (page) => {
    const res = await del(page, API_ROUTER.notificationById('e2e-notif-1'));
    expect(res.ok()).toBe(true);
  },
  'the notification is gone from the list': async (page) => {
    const body = await (
      await page.request.get(API_ROUTER.notifications())
    ).json();
    expect(body.data.some((n: { id: string }) => n.id === 'e2e-notif-1')).toBe(
      false,
    );
  },

  'settings are readable': async (page) => {
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
  'the settings profile name is updated': async (page) => {
    const body = await (await page.request.get(API_ROUTER.settings())).json();
    expect(body.data.profile.name).toBe('Anna REST');
  },
} satisfies CommandRegistry<Page>;

test('REST endpoints CRUD each finance entity through Postgres', async ({
  page,
}) => {
  await interpreter(commands, page)(
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
    ['i create a savings goal'],
    ['i add savings to the goal'],
    ['i delete the goal'],
    ['i create a recurring expense with history'],
    ['i deactivate the recurring expense and clear history'],
    ['i delete the recurring expense'],
    ['i create a notification'],
    ['i dismiss the notification'],
    ['the notification is gone from the list'],
    ['settings are readable'],
    ['the settings profile name is updated'],
  );
});
