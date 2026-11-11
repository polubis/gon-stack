import { expect, type Page } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { test, type Ctx } from '@/__e2e__/test';
import { signInAsTestUser } from '@/__e2e__/session';
import { APP_ROUTER } from '@/shared/router/routes';
import { addDays, todayDay } from '@/shared/period/period';
import { installBackend, type Seed } from './fake-backend';

const FOOD = { id: 'cat-1', name: 'Spożywcze', icon: 'cart', color: '#0f7a4f' };

/** Five rules: two months out, so only the first three fit the panel. */
const SEED: Seed = {
  categories: [FOOD],
  expenses: [],
  limits: [],
  recurring: Array.from({ length: 5 }, (_, i) => ({
    id: `r-${i}`,
    name: `Abonament ${i}`,
    cost: 10 + i,
    interval: 'yearly' as const,
    startDate: addDays(todayDay(), 1 + i),
    endDate: null,
    lastMaterializedDate: null,
    active: true,
    paymentMethod: 'Karta',
    categoryId: FOOD.id,
    items: [],
  })),
};

const open = async (page: Page, path: string): Promise<void> => {
  await signInAsTestUser(page);
  await installBackend(page, SEED);
  await page.goto(path);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(200);
};

const commands = {
  'i open the dashboard': ({ page }) => open(page, APP_ROUTER.dashboard()),
  'i open the dashboard linked to the upcoming list': ({ page }) =>
    open(page, '/app/?modal=upcoming'),
  'i show all upcoming payments': async ({ getByE2e }) => {
    await getByE2e('dashboard:upcoming-toggle').click();
    await expect(getByE2e('dashboard:upcoming-dialog')).toBeVisible();
  },
  'the panel announces only the three nearest': async ({
    getByE2e,
    getByE2ePrefix,
  }) => {
    const panel = getByE2e('dashboard:upcoming');
    await panel.scrollIntoViewIfNeeded();
    await expect(getByE2ePrefix('dashboard:upcoming:', panel)).toHaveCount(3);
    await expect(
      getByE2ePrefix('dashboard:upcoming:', panel).filter({
        hasText: 'Abonament 4',
      }),
    ).toHaveCount(0);
  },
  'the list holds all five payments': async ({ getByE2e, getByE2ePrefix }) => {
    await expect(
      getByE2ePrefix(
        'dashboard:upcoming:',
        getByE2e('dashboard:upcoming-dialog'),
      ),
    ).toHaveCount(5);
  },
} satisfies CommandRegistry<Ctx>;

test.describe('upcoming payments', () => {
  test('the panel caps at three and the button lists them all', async ({
    e2e,
  }) => {
    await interpreter(commands, e2e)(
      ['i open the dashboard'],
      ['the panel announces only the three nearest'],
      ['i show all upcoming payments'],
      ['the list holds all five payments'],
    );
  });

  test('a link restores the list', async ({ e2e }) => {
    await interpreter(commands, e2e)(
      ['i open the dashboard linked to the upcoming list'],
      ['the list holds all five payments'],
    );
  });
});
