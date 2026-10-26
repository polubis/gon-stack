import { expect, type Page } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { test, type Ctx } from './test';
import { registerAndConfirm } from './mailbox';
import { API_ROUTER, APP_ROUTER } from '@/shared/router/routes';

/**
 * Multi-account against the real Supabase backend: two accounts signed in at
 * the same time in one browser, switching between them, per-account data, and
 * session cookies the page can never read.
 */

const STAMP = Date.now();
const PASSWORD = 'secret123';
const EMAIL_A = `e2e-acc-a-${STAMP}@parka.test`;
const EMAIL_B = `e2e-acc-b-${STAMP}@parka.test`;

type Account = { userId: string; email: string };
type Accounts = { activeId: string | null; accounts: Account[] };

const JSON_HEADERS = { 'Content-Type': 'application/json' };

const open = async (page: Page, path: string): Promise<void> => {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(150);
};

const listAccounts = async (page: Page): Promise<Accounts> =>
  (await page.request.get(API_ROUTER.authAccounts())).json();

const idOf = async (page: Page, email: string): Promise<string> =>
  (await listAccounts(page)).accounts.find((a) => a.email === email)!.userId;

const categoryNames = async (page: Page): Promise<string[]> =>
  (
    (await (await page.request.get(API_ROUTER.categories())).json()) as {
      data: { name: string }[];
    }
  ).data.map((c) => c.name);

const addCategory = async (page: Page, id: string, name: string) => {
  const res = await page.request.post(API_ROUTER.categories(), {
    data: { id, name, icon: 'star', color: '#ff0000' },
  });
  expect(res.status()).toBe(201);
};

type Json = ReturnType<typeof JSON.parse>;

const getJson = async (page: Page, path: string): Promise<Json> =>
  (await page.request.get(path)).json();

/** Zone whose "today" the server charges recurring payments and totals by. */
const ZONE = 'UTC';

/** `YYYY-MM-DD` of the UTC day `offset` days from today. */
const dayFromToday = (offset: number): string => {
  const day = new Date();
  day.setUTCDate(day.getUTCDate() + offset);
  return day.toISOString().slice(0, 10);
};

type Totals = { total: number; transactions: number };

/** What one account stored: a normal expense, a recurring rule and its feed. */
type Seed = {
  expenseId: string;
  merchant: string;
  ruleId: string;
  ruleName: string;
  chargeIds: string[];
  notificationIds: string[];
  totals: Totals;
};

const NORMAL_AMOUNT = 25.5;
const RULE_COST = 45;
const CHARGES = 3;

const totalsOf = async (page: Page): Promise<Totals> => {
  const { data } = await getJson(
    page,
    API_ROUTER.dashboard({
      kind: 'custom',
      from: dayFromToday(-30),
      to: dayFromToday(0),
      tz: ZONE,
    }),
  );
  return { total: data.total, transactions: data.transactions };
};

const expensesOf = async (page: Page): Promise<Json[]> =>
  (await getJson(page, API_ROUTER.expenses({ tz: ZONE }))).data;

const notificationsOf = async (page: Page): Promise<Json[]> =>
  (await getJson(page, API_ROUTER.notifications())).data;

const rulesOf = async (page: Page): Promise<Json[]> =>
  (await getJson(page, API_ROUTER.recurring({ tz: ZONE }))).data;

const ruleBody = (seed: Seed, categoryId: string) => ({
  id: seed.ruleId,
  name: seed.ruleName,
  cost: RULE_COST,
  interval: 'weekly',
  startDate: dayFromToday(-20),
  endDate: null,
  active: true,
  paymentMethod: 'card',
  categoryId,
});

const expenseBody = (seed: Seed, categoryId: string) => ({
  id: seed.expenseId,
  merchant: seed.merchant,
  date: dayFromToday(0),
  amount: NORMAL_AMOUNT,
  categoryId,
  paymentMethod: 'card',
  isBill: false,
  source: 'manual',
  items: [],
});

/**
 * Gives the signed-in account a normal expense and a weekly recurring rule
 * (charged three times on the first read), which also yields notifications.
 */
const seedData = async (
  page: Page,
  tag: string,
  categoryId: string,
): Promise<Seed> => {
  const seed: Seed = {
    expenseId: `iso-exp-${tag}-${STAMP}`,
    merchant: `Sklep ${tag} ${STAMP}`,
    ruleId: `iso-rec-${tag}-${STAMP}`,
    ruleName: `Abonament ${tag} ${STAMP}`,
    chargeIds: [],
    notificationIds: [],
    totals: { total: 0, transactions: 0 },
  };
  const expense = await page.request.post(API_ROUTER.expenses(), {
    data: expenseBody(seed, categoryId),
  });
  expect(expense.status()).toBe(201);
  const rule = await page.request.post(API_ROUTER.recurring(), {
    data: ruleBody(seed, categoryId),
  });
  expect(rule.status()).toBe(201);

  seed.chargeIds = (await expensesOf(page))
    .filter((e) => e.recurringId === seed.ruleId)
    .map((e) => e.id);
  expect(seed.chargeIds).toHaveLength(CHARGES);
  const notifications = await notificationsOf(page);
  seed.notificationIds = notifications.map((n) => n.id);
  expect(
    notifications.some(
      (n) =>
        n.kind === 'expense-created' &&
        n.payload.expense.merchant === seed.merchant,
    ),
  ).toBe(true);
  seed.totals = await totalsOf(page);
  expect(seed.totals).toEqual({
    total: NORMAL_AMOUNT + CHARGES * RULE_COST,
    transactions: CHARGES + 1,
  });
  return seed;
};

const mentions = (value: unknown, seed: Seed): string[] =>
  [
    seed.expenseId,
    seed.merchant,
    seed.ruleId,
    seed.ruleName,
    ...seed.chargeIds,
    ...seed.notificationIds,
  ].filter((needle) => JSON.stringify(value).includes(needle));

/** The signed-in account holds exactly what `seed` stored, nothing more. */
const expectHolds = async (page: Page, seed: Seed): Promise<void> => {
  const expenses = await expensesOf(page);
  expect(expenses.map((e) => e.id).sort()).toEqual(
    [seed.expenseId, ...seed.chargeIds].sort(),
  );
  expect(expenses.find((e) => e.id === seed.expenseId)).toMatchObject({
    merchant: seed.merchant,
    amount: NORMAL_AMOUNT,
    recurringId: null,
  });
  expect(expenses.filter((e) => e.recurringId === seed.ruleId)).toHaveLength(
    CHARGES,
  );
  expect((await rulesOf(page)).map((r) => r.id)).toEqual([seed.ruleId]);
  const notifications = await notificationsOf(page);
  for (const id of seed.notificationIds)
    expect(notifications.map((n) => n.id)).toContain(id);
  expect(await totalsOf(page)).toEqual(seed.totals);
};

/** The signed-in account sees nothing of `other`, and cannot reach it by id. */
const expectNothingOf = async (
  page: Page,
  other: Seed,
  own: Seed | null,
): Promise<void> => {
  const expenses = await expensesOf(page);
  const rules = await rulesOf(page);
  const notifications = await notificationsOf(page);
  const totals = await totalsOf(page);
  for (const [name, value] of [
    ['expenses', expenses],
    ['recurring', rules],
    ['notifications', notifications],
    ['dashboard', totals],
  ] as const)
    expect(mentions(value, other), name).toEqual([]);

  if (own) await expectHolds(page, own);
  else {
    expect(expenses).toEqual([]);
    expect(rules).toEqual([]);
    expect(notifications).toEqual([]);
    expect(totals).toEqual({ total: 0, transactions: 0 });
  }

  // No API lists push subscriptions; the account's own push state stays off.
  const settings = await getJson(page, API_ROUTER.settings());
  expect(settings.data.notifications.push).toBe(false);

  const foreign = [
    [
      'PUT',
      API_ROUTER.expenseById(other.expenseId),
      expenseBody(other, 'any-category'),
    ],
    ['DELETE', API_ROUTER.expenseById(other.expenseId), undefined],
    ['DELETE', API_ROUTER.expenseById(other.chargeIds[0]!), undefined],
    ['PUT', API_ROUTER.recurringById(other.ruleId), ruleBody(other, 'x')],
    ['DELETE', API_ROUTER.recurringById(other.ruleId), undefined],
    ['PUT', API_ROUTER.notificationById(other.notificationIds[0]!), {}],
    [
      'DELETE',
      API_ROUTER.notificationById(other.notificationIds[0]!),
      undefined,
    ],
  ] as const;
  for (const [method, path, data] of foreign) {
    const res = await page.request.fetch(path, {
      method,
      headers: JSON_HEADERS,
      data,
    });
    expect(res.status(), `${method} ${path}`).toBe(404);
  }
};

/** Nobody is signed in: every per-account endpoint refuses and shows no data. */
const expectNoAccess = async (page: Page, seeds: Seed[]): Promise<void> => {
  for (const path of [
    API_ROUTER.expenses({ tz: ZONE }),
    API_ROUTER.recurring({ tz: ZONE }),
    API_ROUTER.notifications(),
    API_ROUTER.categories(),
    API_ROUTER.settings(),
    API_ROUTER.dashboard({
      kind: 'custom',
      from: dayFromToday(-30),
      to: dayFromToday(0),
      tz: ZONE,
    }),
  ]) {
    const res = await page.request.get(path);
    expect(res.status(), path).toBe(401);
    expect(await res.text(), path).not.toMatch(/Sklep|Abonament/);
  }
  for (const seed of seeds) {
    for (const method of ['PUT', 'DELETE'] as const) {
      const path = API_ROUTER.expenseById(seed.expenseId);
      const res = await page.request.fetch(path, {
        method,
        headers: JSON_HEADERS,
        data: method === 'PUT' ? expenseBody(seed, 'any-category') : undefined,
      });
      expect(res.status(), `${method} ${path}`).toBe(401);
    }
  }
};

let seedA: Seed;
let seedB: Seed;
let userIdA: string;

const commands = {
  'i register account A and give it a category': async (ctx) => {
    await registerAndConfirm(ctx, EMAIL_A, PASSWORD);
    await addCategory(ctx.page, 'cat-a', 'Konto A');
  },
  'account A stores an expense, a recurring rule and a notification': async ({
    page,
  }) => {
    userIdA = await idOf(page, EMAIL_A);
    seedA = await seedData(page, 'a', 'cat-a');
  },
  'i register account B while A stays signed in': async (ctx) => {
    await registerAndConfirm(ctx, EMAIL_B, PASSWORD);
    await addCategory(ctx.page, 'cat-b', 'Konto B');
  },

  'both accounts are listed and B is active': async ({ page }) => {
    const { activeId, accounts } = await listAccounts(page);
    expect(accounts.map((a) => a.email).sort()).toEqual([EMAIL_A, EMAIL_B]);
    expect(activeId).toBe(await idOf(page, EMAIL_B));
  },
  'the account list carries no tokens': async ({ page }) => {
    const body = await (
      await page.request.get(API_ROUTER.authAccounts())
    ).text();
    expect(body).not.toMatch(/token/i);
    expect(Object.keys(JSON.parse(body).accounts[0]).sort()).toEqual([
      'avatarUrl',
      'email',
      'userId',
    ]);
  },
  'every session cookie is httpOnly and lax': async ({ page }) => {
    const cookies = (await page.context().cookies()).filter((c) =>
      c.name.startsWith('parka-'),
    );
    expect(cookies.length).toBeGreaterThanOrEqual(3);
    for (const cookie of cookies) {
      expect(cookie.httpOnly, cookie.name).toBe(true);
      expect(cookie.sameSite, cookie.name).toBe('Lax');
    }
  },
  'the page cannot read any session cookie': async ({ page }) => {
    await open(page, APP_ROUTER.dashboard());
    expect(await page.evaluate(() => document.cookie)).not.toContain('parka-');
  },

  'account B stores its own expense, recurring rule and notification': async ({
    page,
  }) => {
    seedB = await seedData(page, 'b', 'cat-b');
  },
  'account B holds nothing of account A and cannot reach it': async ({
    page,
  }) => {
    await expectNothingOf(page, seedA, seedB);
  },
  'account A holds all of its own data and nothing of account B': async ({
    page,
  }) => {
    await expectNothingOf(page, seedB, seedA);
  },
  'account A can no longer be switched to': async ({ page }) => {
    const res = await page.request.post(API_ROUTER.authSwitch(), {
      headers: JSON_HEADERS,
      data: { userId: userIdA },
    });
    expect(res.status()).toBe(404);
  },
  'nothing of any account is reachable any more': async ({ page }) => {
    await expectNoAccess(page, [seedA, seedB]);
  },
  'only the data of account B is visible': async ({ page }) => {
    expect(await categoryNames(page)).toEqual(['Konto B']);
  },
  'only the data of account A is visible': async ({ page }) => {
    expect(await categoryNames(page)).toEqual(['Konto A']);
  },

  'i switch to account A from the account menu': async ({ page, getByE2e }) => {
    const idA = await idOf(page, EMAIL_A);
    await open(page, APP_ROUTER.dashboard());
    await getByE2e('account-menu:trigger').filter({ visible: true }).click();
    const item = getByE2e(`account-menu:account:${idA}`);
    await expect(item).toHaveAttribute('aria-checked', 'false');
    await item.click();
    // The dashboard URL is already current, so only the toast shown after the
    // switch reload proves the new account is active.
    await getByE2e('account-menu:switched-toast').waitFor();
    await page.waitForLoadState('networkidle');
  },
  'the switch is confirmed with a toast': async ({ getByE2e }) => {
    await expect(getByE2e('account-menu:switched-toast')).toContainText(
      EMAIL_A,
    );
  },
  'the menu marks A as the active account': async ({ page, getByE2e }) => {
    await getByE2e('account-menu:trigger').filter({ visible: true }).click();
    await expect(
      getByE2e(`account-menu:account:${await idOf(page, EMAIL_A)}`),
    ).toHaveAttribute('aria-checked', 'true');
    await page.keyboard.press('Escape');
  },

  'an unknown account cannot be switched to': async ({ page }) => {
    const res = await page.request.post(API_ROUTER.authSwitch(), {
      headers: JSON_HEADERS,
      data: { userId: '11111111-1111-4111-8111-111111111111' },
    });
    expect(res.status()).toBe(404);
  },

  'i log out the active account from the menu': async ({ page, getByE2e }) => {
    await getByE2e('account-menu:trigger').filter({ visible: true }).click();
    await Promise.all([
      page.waitForResponse((r) => r.url().includes(API_ROUTER.authLogout())),
      getByE2e('account-menu:logout').click(),
    ]);
    await page.waitForLoadState('networkidle');
    await expect
      .poll(async () => (await listAccounts(page)).accounts.length)
      .toBe(1);
  },
  'account B took over and A is gone': async ({ page }) => {
    const { activeId, accounts } = await listAccounts(page);
    expect(accounts.map((a) => a.email)).toEqual([EMAIL_B]);
    expect(activeId).toBe(accounts[0]!.userId);
    expect(await categoryNames(page)).toEqual(['Konto B']);
  },
  'logging out everywhere leaves nobody signed in': async ({ page }) => {
    const res = await page.request.post(API_ROUTER.authLogout(), {
      headers: JSON_HEADERS,
      data: { all: true },
    });
    expect((await res.json()).location).toBe(APP_ROUTER.signIn());
    expect((await listAccounts(page)).accounts).toEqual([]);
    const me = await (await page.request.get(API_ROUTER.authMe())).json();
    expect(me.user).toBeNull();
  },
} satisfies CommandRegistry<Ctx>;

test('one browser holds several accounts and switches between them', async ({
  e2e,
}) => {
  await interpreter(commands, e2e)(
    ['i register account A and give it a category'],
    ['account A stores an expense, a recurring rule and a notification'],
    ['i register account B while A stays signed in'],
    ['both accounts are listed and B is active'],
    ['the account list carries no tokens'],
    ['every session cookie is httpOnly and lax'],
    ['the page cannot read any session cookie'],
    ['only the data of account B is visible'],
    ['account B stores its own expense, recurring rule and notification'],
    ['account B holds nothing of account A and cannot reach it'],
    ['i switch to account A from the account menu'],
    ['the switch is confirmed with a toast'],
    ['only the data of account A is visible'],
    ['account A holds all of its own data and nothing of account B'],
    ['the menu marks A as the active account'],
    ['an unknown account cannot be switched to'],
    ['i log out the active account from the menu'],
    ['account B took over and A is gone'],
    ['account B holds nothing of account A and cannot reach it'],
    ['account A can no longer be switched to'],
    ['logging out everywhere leaves nobody signed in'],
    ['nothing of any account is reachable any more'],
  );
});

/**
 * Isolation: what one account stores must never show up for another account
 * of the same browser, and a switch must leave nothing of the old account on
 * the device (remembered form values) or in another open tab.
 */

const ISO_EMAIL_A = `e2e-iso-a-${STAMP}@parka.test`;
const ISO_EMAIL_B = `e2e-iso-b-${STAMP}@parka.test`;
const FORM_MEMORY_KEY = 'parka:form-memory';

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);

const switchTo = async (ctx: Ctx, email: string): Promise<void> => {
  const { page, getByE2e } = ctx;
  const id = await idOf(page, email);
  await open(page, APP_ROUTER.dashboard());
  await getByE2e('account-menu:trigger').filter({ visible: true }).click();
  await getByE2e(`account-menu:account:${id}`).click();
  // The dashboard URL is already current, so only the toast shown after the
  // switch reload proves the new account is active.
  await getByE2e('account-menu:switched-toast').waitFor();
  await page.waitForLoadState('networkidle');
};

let secondTab: Page;
let isoSeedA: Seed;

const isolation = {
  'i register account A with a name, suggestion, avatar and push': async (
    ctx,
  ) => {
    const { page } = ctx;
    await registerAndConfirm(ctx, ISO_EMAIL_A, PASSWORD);
    const settings = await getJson(page, API_ROUTER.settings());
    const put = await page.request.put(API_ROUTER.settings(), {
      headers: JSON_HEADERS,
      data: {
        ...settings.data,
        profile: { ...settings.data.profile, name: 'Alicja' },
      },
    });
    expect(put.status()).toBe(200);
    expect(
      (
        await page.request.post(API_ROUTER.suggestions(), {
          headers: JSON_HEADERS,
          data: { field: 'merchant', value: 'Sklep Alicji' },
        })
      ).status(),
    ).toBe(200);
    const avatar = await page.request.post(API_ROUTER.avatar(), {
      multipart: {
        file: { name: 'a.png', mimeType: 'image/png', buffer: PNG },
      },
    });
    expect(avatar.status()).toBe(200);
    const push = await page.request.put(API_ROUTER.push(), {
      headers: JSON_HEADERS,
      data: {
        endpoint: `https://push.example.test/a-${STAMP}`,
        keys: { p256dh: 'p256dh-a', auth: 'auth-a' },
      },
    });
    expect(push.status()).toBe(200);
  },
  'account A stores an expense, a recurring rule and a notification too':
    async ({ page }) => {
      await addCategory(page, `iso-cat-a-${STAMP}`, 'Iso A');
      isoSeedA = await seedData(page, 'iso-a', `iso-cat-a-${STAMP}`);
    },
  'account B sees no expense, dashboard total or notification of account A':
    async ({ page }) => {
      await expectNothingOf(page, isoSeedA, null);
    },
  'account A still holds its expense, recurring rule and notification': async ({
    page,
  }) => {
    await expectHolds(page, isoSeedA);
  },
  'i register account B while A stays signed in too': async (ctx) => {
    await registerAndConfirm(ctx, ISO_EMAIL_B, PASSWORD);
  },

  'account B sees no data of account A': async ({ page }) => {
    const settings = await getJson(page, API_ROUTER.settings());
    expect(settings.data.profile.name).not.toBe('Alicja');
    const suggestions = await getJson(page, API_ROUTER.suggestions());
    expect(JSON.stringify(suggestions.data)).not.toContain('Sklep Alicji');
    expect((await getJson(page, API_ROUTER.avatar())).data).toBeNull();
    const me = await getJson(page, API_ROUTER.authMe());
    expect(me.user.email).toBe(ISO_EMAIL_B);
    expect(me.user.avatarUrl).toBeNull();
  },
  'account A still sees its own data': async ({ page }) => {
    const settings = await getJson(page, API_ROUTER.settings());
    expect(settings.data.profile.name).toBe('Alicja');
    expect(
      JSON.stringify((await getJson(page, API_ROUTER.suggestions())).data),
    ).toContain('Sklep Alicji');
    const avatar = await getJson(page, API_ROUTER.avatar());
    const idA = await idOf(page, ISO_EMAIL_A);
    expect(avatar.data.variants.length).toBeGreaterThan(0);
    for (const variant of avatar.data.variants) {
      expect(variant.url).toContain(`/${idA}/`);
    }
  },
  'per-account responses are never cacheable': async ({ page }) => {
    for (const path of [
      API_ROUTER.authMe(),
      API_ROUTER.authAccounts(),
      API_ROUTER.avatar(),
      API_ROUTER.settings(),
      API_ROUTER.suggestions(),
      API_ROUTER.categories(),
    ]) {
      const res = await page.request.get(path);
      expect(res.headers()['cache-control'], path).toBe('private, no-store');
    }
  },

  'i remember a form value as account A': async ({ page }) => {
    await open(page, APP_ROUTER.dashboard());
    await page.evaluate(
      (key) => window.localStorage.setItem(key, '{"merchant":"Sklep Alicji"}'),
      FORM_MEMORY_KEY,
    );
  },
  'i switch to account B from the account menu': (ctx) =>
    switchTo(ctx, ISO_EMAIL_B),
  'i switch back to account A from the account menu': (ctx) =>
    switchTo(ctx, ISO_EMAIL_A),
  'nothing remembered by account A is left on the device': async ({ page }) => {
    expect(
      await page.evaluate(
        (key) => window.localStorage.getItem(key),
        FORM_MEMORY_KEY,
      ),
    ).toBeNull();
  },

  'a second tab shows the dashboard of account A': async ({ page }) => {
    secondTab = await page.context().newPage();
    await open(secondTab, APP_ROUTER.dashboard());
    await secondTab.evaluate(() => {
      (window as unknown as { staleMarker: boolean }).staleMarker = true;
    });
  },
  'the second tab reloads itself onto account B': async ({ page }) => {
    await secondTab.waitForFunction(
      () => !(window as unknown as { staleMarker?: boolean }).staleMarker,
    );
    await secondTab.waitForLoadState('networkidle');
    const me = await getJson(secondTab, API_ROUTER.authMe());
    expect(me.user.email).toBe(ISO_EMAIL_B);
    await secondTab.close();
    expect(page.isClosed()).toBe(false);
  },
} satisfies CommandRegistry<Ctx>;

test('switching accounts leaks nothing between them', async ({ e2e }) => {
  await interpreter(isolation, e2e)(
    ['i register account A with a name, suggestion, avatar and push'],
    ['account A stores an expense, a recurring rule and a notification too'],
    ['i register account B while A stays signed in too'],
    ['account B sees no data of account A'],
    ['account B sees no expense, dashboard total or notification of account A'],
    ['per-account responses are never cacheable'],
    ['i switch back to account A from the account menu'],
    ['account A still sees its own data'],
    ['account A still holds its expense, recurring rule and notification'],
    ['i remember a form value as account A'],
    ['i switch to account B from the account menu'],
    ['nothing remembered by account A is left on the device'],
    ['i switch back to account A from the account menu'],
    ['a second tab shows the dashboard of account A'],
    ['i switch to account B from the account menu'],
    ['the second tab reloads itself onto account B'],
  );
});
