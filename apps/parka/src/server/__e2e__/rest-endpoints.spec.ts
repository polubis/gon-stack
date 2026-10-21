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

/** Same default as `.env.example`; the app reads it from `.env` at build time. */
type ListedNotification = {
  id: string;
  kind: string;
  read: boolean;
  createdAt: string;
  payload: unknown;
};

const notificationList = async (page: Page): Promise<ListedNotification[]> =>
  (await (await page.request.get(API_ROUTER.notifications())).json()).data;

type NotificationsPage = {
  data: ListedNotification[];
  nextCursor: string | null;
  unread: number;
};

const walkNotifications = async (
  page: Page,
  limit: number,
): Promise<NotificationsPage[]> => {
  const pages: NotificationsPage[] = [];
  let cursor: string | undefined;
  do {
    const body = (await (
      await page.request.get(API_ROUTER.notifications({ limit, cursor }))
    ).json()) as NotificationsPage;
    pages.push(body);
    cursor = body.nextCursor ?? undefined;
  } while (cursor);
  return pages;
};

const tourOf = async (page: Page) =>
  (await page.request.get(API_ROUTER.financeTour())).json();

const daysUntil = (iso: string): number =>
  (Date.parse(iso) - Date.now()) / (24 * 60 * 60 * 1000);

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

  'every write left a typed notification': async ({ page }) => {
    const list = await notificationList(page);
    const kinds = list.map((n) => n.kind);
    for (const kind of [
      'category-created',
      'category-updated',
      'expense-created',
      'expense-updated',
      'expense-deleted',
      'recurring-accrued',
    ]) {
      expect(kinds).toContain(kind);
    }
    expect(list.every((n) => n.read === false)).toBe(true);
    const edit = list.find((n) => n.kind === 'category-updated');
    expect(edit?.payload).toMatchObject({
      before: { name: 'Kultura' },
      after: { name: 'Sztuka' },
    });
  },
  'a charged recurring rule is reported once': async ({ page }) => {
    const accrued = (await notificationList(page)).filter(
      (n) => n.kind === 'recurring-accrued',
    );
    expect(accrued).toHaveLength(1);
  },
  'i mark one notification as read': async ({ page }) => {
    const [first, second] = await notificationList(page);
    const res = await page.request.put(API_ROUTER.notificationById(first!.id), {
      headers: { 'Content-Type': 'application/json' },
      data: {},
    });
    expect(res.ok()).toBe(true);
    const after = await notificationList(page);
    expect(after.find((n) => n.id === first!.id)?.read).toBe(true);
    expect(after.find((n) => n.id === second!.id)?.read).toBe(false);
  },
  'marking a missing notification is not found': async ({ page }) => {
    const res = await page.request.put(API_ROUTER.notificationById('nope'), {
      headers: { 'Content-Type': 'application/json' },
      data: {},
    });
    expect(res.status()).toBe(404);
  },
  'i mark all notifications as read': async ({ page }) => {
    const res = await page.request.put(API_ROUTER.notificationsReadAll(), {
      headers: { 'Content-Type': 'application/json' },
      data: {},
    });
    expect(res.ok()).toBe(true);
    expect((await notificationList(page)).every((n) => n.read)).toBe(true);
  },
  'there is no public route to create a notification': async ({ page }) => {
    const res = await page.request.post(API_ROUTER.notifications(), {
      data: { id: 'forged', kind: 'other', title: 'x', body: 'y' },
    });
    expect(res.status()).toBeGreaterThanOrEqual(400);
    expect((await notificationList(page)).some((n) => n.id === 'forged')).toBe(
      false,
    );
  },
  'i dismiss the notification': async ({ page }) => {
    const id = (await notificationList(page)).at(-1)!.id;
    categoryIdByPage.set(page, id);
    const res = await del(page, API_ROUTER.notificationById(id));
    expect(res.ok()).toBe(true);
  },
  'the notification is gone from the list': async ({ page }) => {
    const id = categoryIdByPage.get(page)!;
    expect((await notificationList(page)).some((n) => n.id === id)).toBe(false);
  },

  'i create 30 more categories, each leaving a notification': async ({
    page,
  }) => {
    for (let i = 0; i < 30; i += 1) {
      const res = await page.request.post(API_ROUTER.categories(), {
        data: {
          id: `seed-${i}`,
          name: `Seed ${i}`,
          icon: 'star',
          color: '#00ff00',
        },
      });
      expect(res.status()).toBe(201);
    }
  },
  'notifications come in pages, newest first, without gaps or repeats': async ({
    page,
  }) => {
    const pages = await walkNotifications(page, 12);
    const ids = pages.flatMap((p) => p.data.map((n) => n.id));
    expect(pages.length).toBeGreaterThan(2);
    expect(pages.slice(0, -1).every((p) => p.data.length === 12)).toBe(true);
    expect(pages.at(-1)!.nextCursor).toBeNull();
    expect(new Set(ids).size).toBe(ids.length);
    const times = pages.flatMap((p) => p.data.map((n) => n.createdAt));
    expect(times).toEqual([...times].sort().reverse());
    // The server total covers every page; read ones are listed too.
    expect(new Set(pages.map((p) => p.unread)).size).toBe(1);
    expect(pages[0]!.unread).toBe(30);
    expect(pages.flatMap((p) => p.data).some((n) => n.read)).toBe(true);
  },
  'a broken cursor is refused': async ({ page }) => {
    const res = await page.request.get(
      API_ROUTER.notifications({ cursor: 'nope' }),
    );
    expect((await res.json()).code).toBe(400);
  },
  'marking one as read keeps it listed and lowers the total': async ({
    page,
  }) => {
    const before = await walkNotifications(page, 50);
    const unread = before[0]!.data.find((n) => !n.read)!;
    const res = await page.request.put(API_ROUTER.notificationById(unread.id), {
      headers: { 'Content-Type': 'application/json' },
      data: {},
    });
    expect(res.ok()).toBe(true);
    const after = await walkNotifications(page, 50);
    expect(after[0]!.unread).toBe(before[0]!.unread - 1);
    expect(after.flatMap((p) => p.data)).toHaveLength(
      before.flatMap((p) => p.data).length,
    );
    expect(
      after.flatMap((p) => p.data).find((n) => n.id === unread.id)?.read,
    ).toBe(true);
  },
  'marking all as read reaches pages that were never loaded': async ({
    page,
  }) => {
    const first = await (
      await page.request.get(API_ROUTER.notifications({ limit: 5 }))
    ).json();
    expect(first.unread).toBeGreaterThan(5);
    const res = await page.request.put(API_ROUTER.notificationsReadAll(), {
      headers: { 'Content-Type': 'application/json' },
      data: {},
    });
    expect(res.ok()).toBe(true);
    const pages = await walkNotifications(page, 7);
    expect(pages[0]!.unread).toBe(0);
    expect(pages.flatMap((p) => p.data).every((n) => n.read)).toBe(true);
  },

  'i create a rule with products from two categories': async ({ page }) => {
    const categoryId = 'e2e-cat-1';
    const res = await page.request.post(API_ROUTER.recurring(), {
      data: {
        id: 'e2e-rec-2',
        name: 'Zakupy',
        cost: 1,
        interval: 'weekly',
        startDate: dayFromToday(-7),
        endDate: null,
        active: true,
        paymentMethod: 'card',
        categoryId,
        items: [
          {
            id: 'p-1',
            name: 'Chleb',
            unitPrice: 5,
            quantity: 2,
            discount: 1,
            categoryId,
          },
          {
            id: 'p-2',
            name: 'Mydlo',
            unitPrice: 3.5,
            quantity: 1,
            discount: 0,
            categoryId: 'seed-0',
          },
        ],
      },
    });
    expect(res.status()).toBe(201);
    const { data } = await res.json();
    expect(data.items).toHaveLength(2);
    // The cost follows the products and the mixed categories leave none.
    expect(data.cost).toBe(12.5);
    expect(data.categoryId).toBeNull();
  },
  'each charged payment carries its own copy of the products': async ({
    page,
  }) => {
    const body = await (
      await page.request.get(API_ROUTER.expenses({ tz: ZONE }))
    ).json();
    const charged = chargedBy(body.data, 'e2e-rec-2') as (Charged & {
      categoryId: string | null;
      items: { name: string }[];
    })[];
    expect(charged.map((e) => e.occurrenceDate)).toEqual([
      dayFromToday(0),
      dayFromToday(-7),
    ]);
    for (const expense of charged) {
      expect(expense.amount).toBe(12.5);
      expect(expense.categoryId).toBeNull();
      expect(expense.items.map((i) => i.name).sort()).toEqual([
        'Chleb',
        'Mydlo',
      ]);
    }
  },
  'editing the products changes only the next payments': async ({ page }) => {
    const categoryId = 'e2e-cat-1';
    const res = await page.request.put(API_ROUTER.recurringById('e2e-rec-2'), {
      data: {
        id: 'e2e-rec-2',
        name: 'Zakupy',
        cost: 1,
        interval: 'weekly',
        startDate: dayFromToday(-7),
        endDate: null,
        active: true,
        paymentMethod: 'card',
        categoryId,
        items: [
          {
            id: 'p-1',
            name: 'Chleb',
            unitPrice: 6,
            quantity: 1,
            discount: 0,
            categoryId,
          },
        ],
      },
    });
    expect(res.ok()).toBe(true);
    const { data } = await res.json();
    expect(data.cost).toBe(6);
    expect(data.categoryId).toBe(categoryId);
    const rules = await (
      await page.request.get(API_ROUTER.recurring({ tz: ZONE }))
    ).json();
    expect(rules.data[0].items).toHaveLength(1);
    const body = await (
      await page.request.get(API_ROUTER.expenses({ tz: ZONE }))
    ).json();
    const charged = chargedBy(body.data, 'e2e-rec-2');
    expect(charged.map((e) => e.amount)).toEqual([12.5, 12.5]);
  },
  'a rule without a category and without products is refused': async ({
    page,
  }) => {
    const res = await page.request.post(API_ROUTER.recurring(), {
      data: {
        id: 'e2e-rec-3',
        name: 'Nic',
        cost: 5,
        interval: 'monthly',
        startDate: dayFromToday(1),
        endDate: null,
        active: true,
        paymentMethod: 'card',
        categoryId: null,
      },
    });
    expect(res.status()).toBe(400);
  },

  'i use "Biedronka" twice and "Lidl" once as shops': async ({ page }) => {
    for (const value of ['Biedronka', ' biedronka ', 'Lidl']) {
      const res = await page.request.post(API_ROUTER.suggestions(), {
        data: { field: 'merchant', value },
      });
      expect(res.ok()).toBe(true);
    }
  },
  'the shops come back most used first': async ({ page }) => {
    const body = await (
      await page.request.get(API_ROUTER.suggestions())
    ).json();
    expect(
      body.data.map((s: { value: string; useCount: number }) => [
        s.value,
        s.useCount,
      ]),
    ).toEqual([
      ['biedronka', 2],
      ['Lidl', 1],
    ]);
  },
  'a blank value is refused': async ({ page }) => {
    const res = await page.request.post(API_ROUTER.suggestions(), {
      data: { field: 'merchant', value: '   ' },
    });
    expect(res.status()).toBe(400);
  },

  'renaming a shop keeps its use count': async ({ page }) => {
    const res = await page.request.put(API_ROUTER.suggestions(), {
      data: { field: 'merchant', value: 'Lidl', newValue: 'Lidl Plus' },
    });
    expect(res.ok()).toBe(true);
    const body = await (
      await page.request.get(API_ROUTER.suggestions())
    ).json();
    expect(
      body.data.map((s: { value: string; useCount: number }) => [
        s.value,
        s.useCount,
      ]),
    ).toEqual([
      ['biedronka', 2],
      ['Lidl Plus', 1],
    ]);
  },
  'renaming a shop to a taken name is a conflict': async ({ page }) => {
    const res = await page.request.put(API_ROUTER.suggestions(), {
      data: { field: 'merchant', value: 'Lidl Plus', newValue: ' BIEDRONKA ' },
    });
    expect(res.status()).toBe(409);
  },
  'renaming an unknown shop is not found': async ({ page }) => {
    const res = await page.request.put(API_ROUTER.suggestions(), {
      data: { field: 'merchant', value: 'Nieznany', newValue: 'Inny' },
    });
    expect(res.status()).toBe(404);
  },
  'deleting shops forgets them': async ({ page }) => {
    for (const value of ['Lidl Plus', ' BIEDRONKA ']) {
      const res = await page.request.delete(API_ROUTER.suggestions(), {
        data: { field: 'merchant', value },
      });
      expect(res.ok()).toBe(true);
    }
    const body = await (
      await page.request.get(API_ROUTER.suggestions())
    ).json();
    expect(body.data).toEqual([]);
  },
  'deleting a forgotten shop is not found': async ({ page }) => {
    const res = await page.request.delete(API_ROUTER.suggestions(), {
      data: { field: 'merchant', value: 'Lidl Plus' },
    });
    expect(res.status()).toBe(404);
  },

  'closing the finance tour on sign-up is remembered for 30 days': async ({
    page,
  }) => {
    const { data } = await tourOf(page);
    expect(data.outcome).toBe('skipped');
    expect(daysUntil(data.expiresAt)).toBeCloseTo(30, 0);
  },
  'finishing the tour again extends it': async ({ page }) => {
    const before = (await tourOf(page)).data.expiresAt;
    const res = await page.request.put(API_ROUTER.financeTour(), {
      data: { outcome: 'completed' },
    });
    expect(res.ok()).toBe(true);
    const { data } = await tourOf(page);
    expect(data.outcome).toBe('completed');
    expect(Date.parse(data.expiresAt)).toBeGreaterThan(Date.parse(before));
  },
  'an unknown finance tour outcome is refused': async ({ page }) => {
    const res = await page.request.put(API_ROUTER.financeTour(), {
      data: { outcome: 'later' },
    });
    expect(res.status()).toBe(400);
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
    ['every write left a typed notification'],
    ['a charged recurring rule is reported once'],
    ['i mark one notification as read'],
    ['marking a missing notification is not found'],
    ['i mark all notifications as read'],
    ['there is no public route to create a notification'],
    ['i dismiss the notification'],
    ['the notification is gone from the list'],
    ['i create 30 more categories, each leaving a notification'],
    ['notifications come in pages, newest first, without gaps or repeats'],
    ['a broken cursor is refused'],
    ['marking one as read keeps it listed and lowers the total'],
    ['marking all as read reaches pages that were never loaded'],
    ['i create a rule with products from two categories'],
    ['each charged payment carries its own copy of the products'],
    ['editing the products changes only the next payments'],
    ['a rule without a category and without products is refused'],
    ['i use "Biedronka" twice and "Lidl" once as shops'],
    ['the shops come back most used first'],
    ['a blank value is refused'],
    ['renaming a shop keeps its use count'],
    ['renaming a shop to a taken name is a conflict'],
    ['renaming an unknown shop is not found'],
    ['deleting shops forgets them'],
    ['deleting a forgotten shop is not found'],
    ['closing the finance tour on sign-up is remembered for 30 days'],
    ['finishing the tour again extends it'],
    ['an unknown finance tour outcome is refused'],
    ['settings are readable'],
    ['the settings profile name is updated'],
  );
});
