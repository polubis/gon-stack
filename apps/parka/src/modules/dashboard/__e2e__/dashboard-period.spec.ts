import { expect, type Page } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { test, type Ctx } from '@/__e2e__/test';
import { signInAsTestUser } from '@/__e2e__/session';
import { APP_ROUTER } from '@/shared/router/routes';
import {
  currentPeriod,
  limitForPeriod,
  shiftPeriod,
  todayDay,
  type PeriodKind,
} from '@/shared/period/period';
import { installBackend, type Seed } from './fake-backend';

const FOOD = { id: 'cat-1', name: 'Spożywcze', icon: 'cart', color: '#0f7a4f' };

const expense = (id: string, amount: number, day: string) => ({
  id,
  merchant: `Sklep ${id}`,
  date: `${day}T10:00:00.000Z`,
  amount,
  categoryId: FOOD.id,
  paymentMethod: 'card',
  isBill: false,
  source: 'manual' as const,
  items: [],
});

const FUN = {
  id: 'cat-2',
  name: 'Rozrywka',
  icon: 'popcorn',
  color: '#1d4ed8',
};

const MONTHLY_LIMIT = 3000;

const lastYear = Number(todayDay().slice(0, 4)) - 1;

/** Today: 40 + 25. Mid June of last year: 70. Nothing in between. */
const SEED: Seed = {
  categories: [FOOD, FUN],
  expenses: [
    { ...expense('e-fun', 25, todayDay()), categoryId: FUN.id },
    expense('e-today', 40, todayDay()),
    expense('e-old', 70, `${lastYear}-06-15`),
  ],
  limits: [{ id: 'l-0', scope: 'total', amount: MONTHLY_LIMIT, alertAt: 80 }],
  recurring: [],
};

const open = async (page: Page, path: string): Promise<void> => {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(200);
};

/** Top and height of every block of the dashboard, in layout order. */
const layoutOf = (page: Page): Promise<string> =>
  page.evaluate(() => {
    const main = document.querySelector('[data-e2e="dashboard:main"] main');
    return [...(main?.children ?? [])]
      .map((el) => {
        const r = el.getBoundingClientRect();
        return `${Math.round(r.top + scrollY)}+${Math.round(r.height)}`;
      })
      .join(' | ');
  });

const baselines = new WeakMap<Page, string>();

const pln = new Intl.NumberFormat('pl-PL', {
  style: 'currency',
  currency: 'PLN',
});

/** Money left of the limit scaled to the present period of `kind`; 65 spent. */
const leftFor = (kind: PeriodKind, back = 0): string =>
  pln.format(
    limitForPeriod(
      MONTHLY_LIMIT,
      shiftPeriod(currentPeriod(kind, todayDay()), -back),
    ) - (back === 0 ? 65 : 0),
  );

type GetByE2e = Ctx['getByE2e'];

/** Opens the range list behind the icon and picks one kind. */
const pickKind = async (
  page: Page,
  getByE2e: GetByE2e,
  kind: PeriodKind,
): Promise<void> => {
  await getByE2e('period-control:kind').click();
  await getByE2e(`period-control:preset:${kind}`).click();
  await expect(page.getByRole('list', { name: 'Zakres' })).toBeHidden();
};

const commands = {
  'i open a dashboard with a recent and a year old expense': async ({
    page,
  }) => {
    await signInAsTestUser(page);
    await installBackend(page, SEED);
    await open(page, APP_ROUTER.dashboard());
  },

  'i pick the day preset': ({ page, getByE2e }) =>
    pickKind(page, getByE2e, 'day'),
  'i pick the week preset': ({ page, getByE2e }) =>
    pickKind(page, getByE2e, 'week'),
  'i pick the month preset': ({ page, getByE2e }) =>
    pickKind(page, getByE2e, 'month'),
  'i pick the year preset': ({ page, getByE2e }) =>
    pickKind(page, getByE2e, 'year'),
  'i pick the last year preset': async ({ page, getByE2e }) => {
    await pickKind(page, getByE2e, 'year');
    await getByE2e('period-control:prev').click();
  },
  'i pick the own range': ({ page, getByE2e }) =>
    pickKind(page, getByE2e, 'custom'),
  'i choose the whole of June of last year': async ({ getByE2e }) => {
    const dialog = getByE2e('dashboard:period-range-dialog');
    await expect(dialog).toBeVisible();
    // Walk the calendar back to June of last year.
    for (let guard = 0; guard < 36; guard++) {
      const month = await getByE2e(
        'dashboard:period-range-month',
      ).textContent();
      if (month?.includes(String(lastYear)) && /czerwiec/i.test(month)) break;
      await getByE2e('dashboard:period-range-prev').click();
    }
    await getByE2e(`dashboard:period-range-day:${lastYear}-06-01`).click();
    await getByE2e(`dashboard:period-range-day:${lastYear}-06-30`).click();
    await getByE2e('dashboard:period-range-apply').click();
    await expect(dialog).toBeHidden();
  },
  'i jump in the calendar to June of last year': async ({ getByE2e, page }) => {
    await getByE2e('dashboard:period-range-month').click();
    await getByE2e('dashboard:period-range-year').click();
    await page.getByRole('option', { name: String(lastYear) }).click();
    await getByE2e(
      `dashboard:period-range-month-option:${lastYear}-06`,
    ).click();
    await expect(getByE2e('dashboard:period-range-month')).toContainText(
      String(lastYear),
    );
  },
  'i pick the first and the last day of June and apply': async ({
    getByE2e,
  }) => {
    await getByE2e(`dashboard:period-range-day:${lastYear}-06-01`).click();
    await getByE2e(`dashboard:period-range-day:${lastYear}-06-30`).click();
    await getByE2e('dashboard:period-range-apply').click();
    await expect(getByE2e('dashboard:period-range-dialog')).toBeHidden();
  },
  'the month grid has no future month': async ({ getByE2e }) => {
    await getByE2e('dashboard:period-range-month').click();
    const future = `${Number(todayDay().slice(0, 4)) + 1}-01`;
    await expect(
      getByE2e(`dashboard:period-range-month-option:${future}`),
    ).toHaveCount(0);
    await expect(getByE2e('dashboard:period-range-year-next')).toBeDisabled();
  },
  'the range modal is open': async ({ page, getByE2e }) => {
    await expect(getByE2e('dashboard:period-range-dialog')).toBeVisible();
    expect(new URL(page.url()).searchParams.getAll('modal')).toEqual([
      'period-range',
    ]);
  },
  'i go back in the browser': async ({ page }) => {
    await page.goBack();
  },
  'the range modal is closed': async ({ getByE2e }) => {
    await expect(getByE2e('dashboard:period-range-dialog')).toBeHidden();
  },
  'the label shows the June range': async ({ getByE2e }) => {
    await expect(getByE2e('period-control:label')).toContainText(
      `01.06.${lastYear} – 30.06.${lastYear}`,
    );
  },
  'i go back one period': ({ getByE2e }) =>
    getByE2e('period-control:prev').click(),
  'i go forward one period': ({ getByE2e }) =>
    getByE2e('period-control:next').click(),
  'i reload the page': async ({ page }) => {
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(200);
  },

  'i remember the layout': async ({ page, getByE2e }) => {
    await expect(getByE2e('dashboard:total')).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    baselines.set(page, await layoutOf(page));
  },
  'the layout is unchanged': async ({ page, getByE2e }) => {
    await expect(getByE2e('dashboard:total')).toBeVisible();
    await page.waitForTimeout(400);
    expect(await layoutOf(page)).toBe(baselines.get(page));
  },
  'i use a wide screen': ({ page }) =>
    page.setViewportSize({ width: 1280, height: 860 }),
  'the month range is selected': async ({ getByE2e }) => {
    await expect(getByE2e('period-control:kind')).toHaveAttribute(
      'aria-label',
      'Zakres: Miesiąc',
    );
  },
  'the period sits between the arrows next to the range icon': async ({
    getByE2e,
  }) => {
    const prev = await getByE2e('period-control:prev').boundingBox();
    const value = await getByE2e('period-control:value').boundingBox();
    const kind = await getByE2e('period-control:kind').boundingBox();
    const next = await getByE2e('period-control:next').boundingBox();
    if (!prev || !value || !kind || !next) throw new Error('Missing controls.');
    expect(value.x).toBeGreaterThan(prev.x + prev.width);
    expect(kind.x).toBeGreaterThan(value.x + value.width - 1);
    expect(next.x).toBeGreaterThan(kind.x + kind.width);
    // Three quarters for the period, one quarter for the range icon.
    expect(value.width / kind.width).toBeGreaterThan(2.8);
    expect(value.width / kind.width).toBeLessThan(3.2);
  },
  'i open the period picker': ({ getByE2e }) =>
    getByE2e('period-control:value').click(),
  'i jump to the first month of last year': ({ getByE2e }) =>
    getByE2e(`period-control:option:${lastYear}-03`).click(),
  'the label shows March of last year': async ({ getByE2e }) => {
    await expect(getByE2e('period-control:label')).toHaveText(`03.${lastYear}`);
  },
  'the picker cannot reach the future': async ({ page }) => {
    const values = await page
      .locator('[data-e2e^="period-control:option:"]')
      .evaluateAll((els) =>
        els.map((el) =>
          (el.getAttribute('data-e2e') ?? '').replace(
            'period-control:option:',
            '',
          ),
        ),
      );
    expect(values[0]).toBe(todayDay().slice(0, 7));
    expect(values.every((v) => v <= todayDay().slice(0, 7))).toBe(true);
  },
  'i jump to a year picked from the list': ({ getByE2e }) =>
    getByE2e(`period-control:option:${lastYear}`).click(),
  'the limit left is scaled to the day': async ({ getByE2e }) => {
    await expect(getByE2e('dashboard:limit-left')).toContainText(
      leftFor('day'),
    );
  },
  'the limit left is scaled to the week': async ({ getByE2e }) => {
    await expect(getByE2e('dashboard:limit-left')).toContainText(
      leftFor('week'),
    );
  },
  'the limit left is the whole monthly limit': async ({ getByE2e }) => {
    await expect(getByE2e('dashboard:limit-left')).toContainText(
      leftFor('month'),
    );
  },
  'the limit left is scaled to the year': async ({ getByE2e }) => {
    await expect(getByE2e('dashboard:limit-left')).toContainText(
      leftFor('year'),
    );
  },
  'the limit left of last year is the whole year limit': async ({
    getByE2e,
  }) => {
    await expect(getByE2e('dashboard:limit-left')).toContainText(
      pln.format(
        limitForPeriod(
          MONTHLY_LIMIT,
          shiftPeriod(currentPeriod('year', todayDay()), -1),
        ) - 70,
      ),
    );
  },
  'forward is blocked': async ({ getByE2e }) => {
    await expect(getByE2e('period-control:next')).toBeDisabled();
  },
  'forward is possible': async ({ getByE2e }) => {
    await expect(getByE2e('period-control:next')).toBeEnabled();
  },
  'the total is 65,00': async ({ getByE2e }) => {
    await expect(getByE2e('dashboard:total')).toContainText('65,00');
  },
  'the total is 70,00': async ({ getByE2e }) => {
    await expect(getByE2e('dashboard:total')).toContainText('70,00');
  },
  'the total is 0,00': async ({ getByE2e }) => {
    await expect(getByE2e('dashboard:total')).toContainText('0,00');
    await expect(getByE2e('dashboard:total')).not.toContainText('65,00');
  },
  'the label shows last year': async ({ getByE2e }) => {
    await expect(getByE2e('period-control:label')).toHaveText(String(lastYear));
  },
  'the week preset stays selected': async ({ getByE2e }) => {
    await expect(getByE2e('period-control:kind')).toHaveAttribute(
      'aria-label',
      'Zakres: Tydzień',
    );
  },
} satisfies CommandRegistry<Ctx>;

test.describe('dashboard period', () => {
  test('an own from-to range sums only its days', async ({ e2e }) => {
    await interpreter(commands, e2e)(
      ['i open a dashboard with a recent and a year old expense'],
      ['i pick the own range'],
      ['the range modal is open'],
      ['i choose the whole of June of last year'],
      ['the label shows the June range'],
      ['the total is 70,00'],
      ['forward is possible'],
      ['i reload the page'],
      ['the label shows the June range'],
      ['the total is 70,00'],
    );
  });

  test('a month of another year is one jump away in the calendar', async ({
    e2e,
  }) => {
    await interpreter(commands, e2e)(
      ['i open a dashboard with a recent and a year old expense'],
      ['i pick the own range'],
      ['the month grid has no future month'],
      ['i go back in the browser'],
      ['i pick the own range'],
      ['i jump in the calendar to June of last year'],
      ['i pick the first and the last day of June and apply'],
      ['the label shows the June range'],
      ['the total is 70,00'],
    );
  });

  test('the own range modal closes with Back', async ({ e2e }) => {
    await interpreter(commands, e2e)(
      ['i open a dashboard with a recent and a year old expense'],
      ['i pick the own range'],
      ['the range modal is open'],
      ['i go back in the browser'],
      ['the range modal is closed'],
    );
  });

  test('forward stops at the present period', async ({ e2e }) => {
    await interpreter(commands, e2e)(
      ['i open a dashboard with a recent and a year old expense'],
      ['forward is blocked'],
      ['i go back one period'],
      ['forward is possible'],
      ['the total is 0,00'],
      ['i go forward one period'],
      ['forward is blocked'],
      ['the total is 65,00'],
    );
  });

  test('every preset shows the numbers of its own span', async ({ e2e }) => {
    await interpreter(commands, e2e)(
      ['i open a dashboard with a recent and a year old expense'],
      ['i pick the day preset'],
      ['the total is 65,00'],
      ['forward is blocked'],
      ['i pick the week preset'],
      ['the total is 65,00'],
      ['i pick the year preset'],
      ['the total is 65,00'],
      ['i pick the last year preset'],
      ['the label shows last year'],
      ['the total is 70,00'],
      ['forward is possible'],
      ['i go forward one period'],
      ['the total is 65,00'],
      ['forward is blocked'],
    );
  });

  test('going back through days leaves the present day empty', async ({
    e2e,
  }) => {
    await interpreter(commands, e2e)(
      ['i open a dashboard with a recent and a year old expense'],
      ['i pick the day preset'],
      ['i go back one period'],
      ['the total is 0,00'],
      ['i go forward one period'],
      ['the total is 65,00'],
      ['forward is blocked'],
    );
  });

  test('the chosen period survives a reload', async ({ e2e }) => {
    await interpreter(commands, e2e)(
      ['i open a dashboard with a recent and a year old expense'],
      ['i pick the week preset'],
      ['i reload the page'],
      ['the week preset stays selected'],
      ['the total is 65,00'],
      ['forward is blocked'],
    );
  });

  test('opens on the current month by default', async ({ e2e }) => {
    await interpreter(commands, e2e)(
      ['i open a dashboard with a recent and a year old expense'],
      ['the month range is selected'],
      ['forward is blocked'],
      ['the total is 65,00'],
    );
  });

  test('switching periods does not move anything', async ({ e2e }) => {
    await interpreter(commands, e2e)(
      ['i open a dashboard with a recent and a year old expense'],
      ['i remember the layout'],
      ['i pick the day preset'],
      ['the layout is unchanged'],
      ['i pick the week preset'],
      ['the layout is unchanged'],
      ['i pick the year preset'],
      ['the layout is unchanged'],
      ['i pick the last year preset'],
      ['the layout is unchanged'],
      ['i pick the month preset'],
      ['i go back one period'],
      ['the layout is unchanged'],
    );
  });

  test('the period sits between the arrows with a range icon', async ({
    e2e,
  }) => {
    await interpreter(commands, e2e)(
      ['i use a wide screen'],
      ['i open a dashboard with a recent and a year old expense'],
      ['the period sits between the arrows next to the range icon'],
    );
  });

  test('a month can be picked straight away, never a future one', async ({
    e2e,
  }) => {
    await interpreter(commands, e2e)(
      ['i open a dashboard with a recent and a year old expense'],
      ['i open the period picker'],
      ['the picker cannot reach the future'],
      ['i jump to the first month of last year'],
      ['the label shows March of last year'],
      ['forward is possible'],
    );
  });

  test('a year can be picked from the list', async ({ e2e }) => {
    await interpreter(commands, e2e)(
      ['i open a dashboard with a recent and a year old expense'],
      ['i pick the year preset'],
      ['i open the period picker'],
      ['i jump to a year picked from the list'],
      ['the label shows last year'],
      ['the total is 70,00'],
    );
  });

  test('the limit follows the span of the selected period', async ({ e2e }) => {
    await interpreter(commands, e2e)(
      ['i open a dashboard with a recent and a year old expense'],
      ['the limit left is the whole monthly limit'],
      ['i pick the day preset'],
      ['the limit left is scaled to the day'],
      ['i pick the week preset'],
      ['the limit left is scaled to the week'],
      ['i pick the year preset'],
      ['the limit left is scaled to the year'],
      ['i pick the last year preset'],
      ['the limit left of last year is the whole year limit'],
    );
  });
});
