import { expect, type Page } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { test, type Ctx } from '@/__e2e__/test';
import { signInAsTestUser } from '@/__e2e__/session';
import { API_ROUTER, APP_ROUTER } from '@/shared/router/routes';

const AT = new Date().toISOString();
const PAGE = 20;
const TOTAL = 45;

const expense = (merchant: string, amount: number) => ({
  merchant,
  amount,
  date: AT,
  category: 'Spożywcze',
  paymentMethod: 'Karta',
  isBill: false,
});

/** Newest first; every third one is an edit so a diff is always on screen. */
const notification = (i: number) =>
  i % 3 === 0
    ? {
        id: `n-${i}`,
        kind: 'expense-updated',
        title: 'Zmieniono wydatek',
        body: `Lidl ${i}`,
        createdAt: AT,
        read: false,
        payload: {
          before: expense('Biedronka', 45.2),
          after: expense(`Lidl ${i}`, 50),
        },
      }
    : {
        id: `n-${i}`,
        kind: 'category-created',
        title: 'Dodano kategorię',
        body: `Kawa ${i}`,
        createdAt: AT,
        read: false,
        payload: {
          category: { name: `Kawa ${i}`, icon: 'coffee', color: '#aabbcc' },
        },
      };

const json = (body: unknown, delay = 0) => ({
  status: 200,
  contentType: 'application/json',
  body: JSON.stringify(body),
  delay,
});

type Options = { total: number; listDelay?: number };

/** In-memory paginated notifications API: list by cursor, mark one, mark all. */
const installBackend = async (
  page: Page,
  { total, listDelay = 0 }: Options,
): Promise<{ pages: () => number }> => {
  const state = Array.from({ length: total }, (_, i) => notification(i));
  let served = 0;
  await page.route(`**${API_ROUTER.notifications()}**`, async (route) => {
    const url = new URL(route.request().url());
    if (route.request().method() === 'GET') {
      served += 1;
      const from = Number(url.searchParams.get('cursor') ?? 0);
      const items = state.slice(from, from + PAGE);
      const next = from + PAGE < state.length ? String(from + PAGE) : null;
      return new Promise<void>((resolve) =>
        setTimeout(() => {
          void route
            .fulfill(
              json({
                code: 200,
                data: items,
                nextCursor: next,
                unread: state.filter((n) => !n.read).length,
              }),
            )
            .then(resolve);
        }, listDelay),
      );
    }
    if (url.pathname === API_ROUTER.notificationsReadAll()) {
      state.forEach((n) => (n.read = true));
    } else {
      const id = url.pathname.split('/').filter(Boolean).at(-1);
      state.forEach((n) => {
        if (n.id === id) n.read = true;
      });
    }
    return route.fulfill(json({ code: 200, ok: true }));
  });
  return { pages: () => served };
};

const rows = (getByE2ePrefix: Ctx['getByE2ePrefix']) =>
  getByE2ePrefix('notifications:row:');

const open = async (page: Page, options: Options): Promise<void> => {
  await signInAsTestUser(page);
  await installBackend(page, options);
  await page.goto(APP_ROUTER.notifications());
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(200);
};

const commands = {
  'i open the notifications': async ({ page }) => {
    await open(page, { total: TOTAL });
  },
  'i open the notifications while they load': async ({ page }) => {
    await open(page, { total: TOTAL, listDelay: 1500 });
  },
  'i open the notifications of a fresh account': async ({ page }) => {
    await open(page, { total: 0 });
  },
  'a placeholder shaped like a notification card shows': async ({
    getByE2e,
  }) => {
    const skeleton = getByE2e('notifications:skeleton');
    await expect(skeleton).toBeVisible();
    await expect(skeleton.locator('li').first()).toBeVisible();
  },
  'the first page of 20 is listed': async ({ getByE2ePrefix }) => {
    await expect(rows(getByE2ePrefix)).toHaveCount(PAGE);
  },
  'i see 45 unread notifications': async ({ getByE2e }) => {
    await expect(getByE2e('notifications:unread-count')).toHaveText(
      '45 nieprzeczytanych',
    );
  },
  'i scroll to the end of the list': async ({ getByE2e }) => {
    await getByE2e('notifications:end')
      .or(getByE2e('notifications:sentinel'))
      .scrollIntoViewIfNeeded();
  },
  'the next pages load as i scroll down': async ({ page, getByE2ePrefix }) => {
    await expect
      .poll(
        async () => {
          await rows(getByE2ePrefix)
            .last()
            .scrollIntoViewIfNeeded()
            .catch(() => {});
          return rows(getByE2ePrefix).count();
        },
        { timeout: 15_000 },
      )
      .toBe(TOTAL);
    await page.waitForTimeout(300);
  },
  'the list ends with a closing line': async ({ getByE2e }) => {
    await expect(getByE2e('notifications:end')).toBeVisible();
  },
  'every notification appears once': async ({ page }) => {
    const ids = await page
      .locator('[data-e2e^="notifications:row:"]')
      .evaluateAll((nodes) => nodes.map((n) => n.getAttribute('data-e2e')));
    expect(new Set(ids).size).toBe(TOTAL);
  },
  'the edit shows "Biedronka" struck through and "Lidl 0" highlighted': async ({
    getByE2e,
  }) => {
    const diff = getByE2e('notifications:diff:n-0');
    await expect(diff.locator('del').first()).toContainText('Biedronka');
    await expect(diff.locator('ins').first()).toContainText('Lidl 0');
  },
  'i mark the first notification as read': async ({ getByE2e }) => {
    await getByE2e('notifications:mark-read:n-0').click();
  },
  'it stays in the list marked as read': async ({
    getByE2e,
    getByE2ePrefix,
  }) => {
    await expect(getByE2e('notifications:read:n-0')).toBeVisible();
    await expect(getByE2e('notifications:mark-read:n-0')).toHaveCount(0);
    await expect(rows(getByE2ePrefix)).toHaveCount(PAGE);
  },
  'i see 44 unread notifications': async ({ getByE2e }) => {
    await expect(getByE2e('notifications:unread-count')).toHaveText(
      '44 nieprzeczytanych',
    );
  },
  'i mark all as read': async ({ getByE2e }) => {
    await getByE2e('notifications:mark-all-read').click();
  },
  'everything is read and still listed': async ({
    getByE2e,
    getByE2ePrefix,
  }) => {
    await expect(getByE2e('notifications:unread-count')).toHaveText(
      'Wszystko przeczytane',
    );
    await expect(getByE2e('notifications:mark-all-read')).toBeDisabled();
    await expect(rows(getByE2ePrefix)).toHaveCount(PAGE);
  },
  'the empty state has an icon, a title and a description': async ({
    getByE2e,
  }) => {
    const empty = getByE2e('notifications:empty');
    await expect(empty.locator('svg')).toBeVisible();
    await expect(empty.getByRole('heading')).toHaveText('Brak powiadomień');
    await expect(empty.locator('p')).not.toBeEmpty();
  },
} satisfies CommandRegistry<Ctx>;

test.describe('notifications', () => {
  test('a user sees placeholders, then pages load while scrolling down', async ({
    e2e,
  }) => {
    await interpreter(commands, e2e)(
      ['i open the notifications while they load'],
      ['a placeholder shaped like a notification card shows'],
      ['the first page of 20 is listed'],
      ['i scroll to the end of the list'],
      ['the next pages load as i scroll down'],
      ['every notification appears once'],
      ['the list ends with a closing line'],
    );
  });

  test('a user reads what changed and marks one notification as read', async ({
    e2e,
  }) => {
    await interpreter(commands, e2e)(
      ['i open the notifications'],
      ['i see 45 unread notifications'],
      ['the edit shows "Biedronka" struck through and "Lidl 0" highlighted'],
      ['i mark the first notification as read'],
      ['it stays in the list marked as read'],
      ['i see 44 unread notifications'],
    );
  });

  test('a user marks all notifications as read and they stay listed', async ({
    e2e,
  }) => {
    await interpreter(commands, e2e)(
      ['i open the notifications'],
      ['i mark all as read'],
      ['everything is read and still listed'],
    );
  });

  test('a fresh account sees an explained empty state', async ({ e2e }) => {
    await interpreter(commands, e2e)(
      ['i open the notifications of a fresh account'],
      ['the empty state has an icon, a title and a description'],
    );
  });
});
