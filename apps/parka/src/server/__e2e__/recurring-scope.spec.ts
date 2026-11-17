import { expect, type Page } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { test, type Ctx } from '@/__e2e__/test';
import { registerAndConfirm } from '@/__e2e__/mailbox';
import { API_ROUTER } from '@/shared/router/routes';

/**
 * The four scopes of a change on one occurrence of a recurring series (all,
 * only this, this and the following, only the following), for finance and for
 * time, against the real Supabase backend. Counting the occurrences is the
 * same as before; only what an edit or a delete reaches differs.
 */

const EMAIL = `e2e-scope-${Date.now()}@parka.test`;
const PASSWORD = 'secret123';
const ZONE = 'UTC';

const del = (page: Page, path: string, data: object) =>
  page.request.delete(path, {
    headers: { 'Content-Type': 'application/json' },
    data,
  });

/** `YYYY-MM-DD` of the UTC day `offset` days from today. */
const day = (offset: number): string => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
};

type Charged = { id: string; amount: number; occurrenceDate: string | null };
type Rule = {
  id: string;
  name: string;
  cost: number;
  startDate: string;
  endDate: string | null;
  lastMaterializedDate: string | null;
};
type Task = Record<string, unknown> & {
  id: string;
  title: string;
  day: string;
  recurringId: string | null;
};

const categoryByPage = new WeakMap<Page, string>();

const charged = async (page: Page, rule: string): Promise<Charged[]> => {
  const body = (await (
    await page.request.get(API_ROUTER.expenses({ tz: ZONE }))
  ).json()) as { data: (Charged & { recurringId: string | null })[] };
  return body.data
    .filter((e) => e.recurringId === rule)
    .sort((a, b) => (a.occurrenceDate! < b.occurrenceDate! ? -1 : 1));
};

const days = (list: Charged[]) => list.map((e) => e.occurrenceDate);

const rules = async (page: Page): Promise<Rule[]> =>
  (
    (await (
      await page.request.get(API_ROUTER.recurring({ tz: ZONE }))
    ).json()) as { data: Rule[] }
  ).data;

const createRule = async (page: Page, id: string) => {
  const res = await page.request.post(API_ROUTER.recurring(), {
    data: {
      id,
      name: 'Netflix',
      cost: 45,
      interval: 'weekly',
      startDate: day(-20),
      endDate: null,
      active: true,
      paymentMethod: 'card',
      categoryId: categoryByPage.get(page)!,
    },
  });
  expect(res.status()).toBe(201);
};

const ruleBody = (page: Page, id: string, cost: number) => ({
  id,
  name: 'Netflix',
  cost,
  interval: 'weekly',
  startDate: day(-20),
  endDate: null,
  active: true,
  paymentMethod: 'card',
  categoryId: categoryByPage.get(page)!,
});

const expenseBody = (page: Page, e: Charged, amount: number) => ({
  id: e.id,
  merchant: 'Netflix',
  date: `${e.occurrenceDate}T12:00:00.000Z`,
  amount,
  categoryId: categoryByPage.get(page)!,
  paymentMethod: 'card',
  isBill: true,
  source: 'manual',
  items: [],
});

/** Three payments each: day(-20), day(-13), day(-6); the fourth is upcoming. */
const MIDDLE = day(-13);

const tasks = async (page: Page, to: number): Promise<Task[]> => {
  const body = (await (
    await page.request.get(
      API_ROUTER.time({ from: day(-5), to: day(to), tz: ZONE }),
    )
  ).json()) as { data: { tasks: Task[] } };
  return body.data.tasks.sort((a, b) => (a.day < b.day ? -1 : 1));
};

const createTaskRule = async (page: Page, id: string, title: string) => {
  const lists = (await (
    await page.request.get(API_ROUTER.time({ to: day(0), tz: ZONE }))
  ).json()) as {
    data: { categories: { id: string }[]; priorities: { id: string }[] };
  };
  const res = await page.request.post('/api/time/recurring/', {
    data: {
      id,
      title,
      description: null,
      categoryId: lists.data.categories[0]!.id,
      priorityId: lists.data.priorities[0]!.id,
      at: null,
      interval: 'daily',
      startDate: day(-2),
      endDate: null,
      active: true,
    },
  });
  expect(res.status()).toBe(201);
};

const titledDays = (list: Task[], title: string) =>
  list.filter((t) => t.title === title).map((t) => t.day);

const commands = {
  'i register and create a category': async (ctx) => {
    await registerAndConfirm(ctx, EMAIL, PASSWORD);
    await ctx.page.goto('about:blank');
    const res = await ctx.page.request.post(API_ROUTER.categories(), {
      data: { id: 'sc-cat', name: 'Kultura', icon: 'star', color: '#ff0000' },
    });
    expect(res.status()).toBe(201);
    categoryByPage.set(ctx.page, 'sc-cat');
  },

  'i create series and read them so the due payments are charged': async ({
    page,
  }) => {
    for (const id of ['sc-all', 'sc-this', 'sc-from', 'sc-next', 'sc-up'])
      await createRule(page, id);
    for (const id of ['sc-all', 'sc-this', 'sc-from', 'sc-next', 'sc-up'])
      expect(days(await charged(page, id))).toEqual([
        day(-20),
        MIDDLE,
        day(-6),
      ]);
  },

  'deleting all removes every payment and the rule': async ({ page }) => {
    const middle = (await charged(page, 'sc-all'))[1]!;
    const res = await del(page, API_ROUTER.expenseById(middle.id), {
      scope: 'all',
    });
    expect(res.ok()).toBe(true);
    expect(await charged(page, 'sc-all')).toEqual([]);
    expect((await rules(page)).some((r) => r.id === 'sc-all')).toBe(false);
  },

  'deleting only this keeps the others and the rule': async ({ page }) => {
    const middle = (await charged(page, 'sc-this'))[1]!;
    const res = await del(page, API_ROUTER.expenseById(middle.id), {
      scope: 'this',
    });
    expect(res.ok()).toBe(true);
    expect(days(await charged(page, 'sc-this'))).toEqual([day(-20), day(-6)]);
    expect(
      (await rules(page)).find((r) => r.id === 'sc-this')!.endDate,
    ).toBeNull();
  },

  'deleting this and the following ends the series before it': async ({
    page,
  }) => {
    const middle = (await charged(page, 'sc-from'))[1]!;
    const res = await del(page, API_ROUTER.expenseById(middle.id), {
      scope: 'thisAndFollowing',
    });
    expect(res.ok()).toBe(true);
    expect(days(await charged(page, 'sc-from'))).toEqual([day(-20)]);
    expect((await rules(page)).find((r) => r.id === 'sc-from')!.endDate).toBe(
      day(-20),
    );
  },

  'deleting only the following keeps the opened payment': async ({ page }) => {
    const middle = (await charged(page, 'sc-next'))[1]!;
    const res = await del(page, API_ROUTER.expenseById(middle.id), {
      scope: 'following',
    });
    expect(res.ok()).toBe(true);
    expect(days(await charged(page, 'sc-next'))).toEqual([day(-20), MIDDLE]);
    expect((await rules(page)).find((r) => r.id === 'sc-next')!.endDate).toBe(
      MIDDLE,
    );
  },

  'a deleted series is not charged again': async ({ page }) => {
    expect(days(await charged(page, 'sc-next'))).toEqual([day(-20), MIDDLE]);
    expect(days(await charged(page, 'sc-from'))).toEqual([day(-20)]);
  },

  'editing this and the following changes them and the rule': async ({
    page,
  }) => {
    const [first, middle] = await charged(page, 'sc-up');
    const res = await page.request.put(API_ROUTER.expenseById(middle!.id), {
      data: {
        ...expenseBody(page, middle!, 99),
        scope: 'thisAndFollowing',
      },
    });
    expect(res.ok()).toBe(true);
    expect((await charged(page, 'sc-up')).map((e) => e.amount)).toEqual([
      first!.amount,
      99,
      99,
    ]);
    expect((await rules(page)).find((r) => r.id === 'sc-up')!.cost).toBe(99);
  },

  'editing only the following leaves the opened payment as it is': async ({
    page,
  }) => {
    const middle = (await charged(page, 'sc-this'))[0]!;
    const res = await page.request.put(API_ROUTER.expenseById(middle.id), {
      data: { ...expenseBody(page, middle, 70), scope: 'following' },
    });
    expect(res.ok()).toBe(true);
    expect((await charged(page, 'sc-this')).map((e) => e.amount)).toEqual([
      45, 70,
    ]);
  },

  'editing without a scope still changes only the opened payment': async ({
    page,
  }) => {
    const first = (await charged(page, 'sc-next'))[0]!;
    const res = await page.request.put(API_ROUTER.expenseById(first.id), {
      data: expenseBody(page, first, 12),
    });
    expect(res.ok()).toBe(true);
    expect((await charged(page, 'sc-next')).map((e) => e.amount)).toEqual([
      12, 45,
    ]);
  },

  'editing an upcoming payment only splits off that payment': async ({
    page,
  }) => {
    await createRule(page, 'sc-split');
    expect(await charged(page, 'sc-split')).toHaveLength(3);
    const upcoming = day(1);
    const res = await page.request.put(API_ROUTER.recurringById('sc-split'), {
      data: {
        ...ruleBody(page, 'sc-split', 77),
        scope: 'this',
        occurrenceDate: upcoming,
      },
    });
    expect(res.ok()).toBe(true);

    const all = await rules(page);
    const old = all.find((r) => r.id === 'sc-split')!;
    expect(old.endDate).toBe(day(-6));
    const single = all.find((r) => r.cost === 77)!;
    expect([single.startDate, single.endDate]).toEqual([upcoming, upcoming]);
    const rest = all.find(
      (r) =>
        r.id !== 'sc-split' &&
        r.cost === 45 &&
        r.lastMaterializedDate === upcoming,
    );
    expect(rest).toBeDefined();
    // Nothing is charged early: the upcoming payment is still ahead.
    expect(await charged(page, 'sc-split')).toHaveLength(3);
  },

  'deleting the upcoming payment only drops that payment': async ({ page }) => {
    await createRule(page, 'sc-gone');
    expect(await charged(page, 'sc-gone')).toHaveLength(3);
    const res = await del(page, API_ROUTER.recurringById('sc-gone'), {
      scope: 'this',
      occurrenceDate: day(1),
    });
    expect(res.ok()).toBe(true);
    const all = await rules(page);
    expect(all.find((r) => r.id === 'sc-gone')!.endDate).toBe(day(-6));
    expect(
      all.some(
        (r) =>
          r.id !== 'sc-gone' &&
          r.startDate === day(-20) &&
          r.lastMaterializedDate === day(1),
      ),
    ).toBe(true);
  },

  'i create a daily task series and read it ahead': async ({ page }) => {
    for (const [id, title] of [
      ['st-all', 'Seria A'],
      ['st-from', 'Seria B'],
      ['st-next', 'Seria C'],
      ['st-edit', 'Seria D'],
    ] as const)
      await createTaskRule(page, id, title);
    const list = await tasks(page, 5);
    for (const title of ['Seria A', 'Seria B', 'Seria C', 'Seria D'])
      expect(titledDays(list, title)).toEqual(
        [-2, -1, 0, 1, 2, 3, 4, 5].map(day),
      );
  },

  'deleting all tasks of a series removes them and the rule': async ({
    page,
  }) => {
    const task = (await tasks(page, 5)).find(
      (t) => t.title === 'Seria A' && t.day === day(0),
    )!;
    const res = await del(page, API_ROUTER.timeTaskById(task.id), {
      scope: 'all',
    });
    expect(res.ok()).toBe(true);
    const list = await tasks(page, 9);
    expect(titledDays(list, 'Seria A')).toEqual([]);
  },

  'deleting this and the following ends the task series before it': async ({
    page,
  }) => {
    const task = (await tasks(page, 5)).find(
      (t) => t.title === 'Seria B' && t.day === day(0),
    )!;
    const res = await del(page, API_ROUTER.timeTaskById(task.id), {
      scope: 'thisAndFollowing',
    });
    expect(res.ok()).toBe(true);
    const list = await tasks(page, 9);
    expect(titledDays(list, 'Seria B')).toEqual([-2, -1].map(day));
  },

  'deleting only the following tasks keeps the opened one': async ({
    page,
  }) => {
    const task = (await tasks(page, 5)).find(
      (t) => t.title === 'Seria C' && t.day === day(0),
    )!;
    const res = await del(page, API_ROUTER.timeTaskById(task.id), {
      scope: 'following',
    });
    expect(res.ok()).toBe(true);
    const list = await tasks(page, 9);
    expect(titledDays(list, 'Seria C')).toEqual([-2, -1, 0].map(day));
  },

  'editing this and the following renames them and the later ones': async ({
    page,
  }) => {
    const task = (await tasks(page, 5)).find(
      (t) => t.title === 'Seria D' && t.day === day(0),
    )!;
    const res = await page.request.put(API_ROUTER.timeTaskById(task.id), {
      data: { ...task, title: 'Zmieniona', scope: 'thisAndFollowing' },
    });
    expect(res.ok()).toBe(true);
    const list = await tasks(page, 9);
    expect(titledDays(list, 'Seria D')).toEqual([-2, -1].map(day));
    expect(titledDays(list, 'Zmieniona')).toEqual(
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(day),
    );
  },
} satisfies CommandRegistry<Ctx>;

test('the four scopes of a recurring change reach finance and time', async ({
  e2e,
}) => {
  await interpreter(commands, e2e)(
    ['i register and create a category'],
    ['i create series and read them so the due payments are charged'],
    ['deleting all removes every payment and the rule'],
    ['deleting only this keeps the others and the rule'],
    ['deleting this and the following ends the series before it'],
    ['deleting only the following keeps the opened payment'],
    ['a deleted series is not charged again'],
    ['editing this and the following changes them and the rule'],
    ['editing only the following leaves the opened payment as it is'],
    ['editing without a scope still changes only the opened payment'],
    ['editing an upcoming payment only splits off that payment'],
    ['deleting the upcoming payment only drops that payment'],
    ['i create a daily task series and read it ahead'],
    ['deleting all tasks of a series removes them and the rule'],
    ['deleting this and the following ends the task series before it'],
    ['deleting only the following tasks keeps the opened one'],
    ['editing this and the following renames them and the later ones'],
  );
});
