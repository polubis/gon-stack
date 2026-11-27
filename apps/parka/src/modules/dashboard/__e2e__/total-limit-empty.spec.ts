import { expect } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { test, type Ctx } from '@/__e2e__/test';
import { signInAsTestUser } from '@/__e2e__/session';
import { APP_ROUTER } from '@/shared/router/routes';
import { installBackend, type Seed } from './fake-backend';

const FOOD = { id: 'cat-1', name: 'Spożywcze', icon: 'cart', color: '#0f7a4f' };

/** Category limit only: the monthly (total) limit is missing. */
const SEED: Seed = {
  categories: [FOOD, { ...FOOD, id: 'cat-2', name: 'Transport' }],
  expenses: [],
  limits: [
    {
      id: 'l-1',
      scope: 'category',
      categoryId: FOOD.id,
      amount: 300,
      alertAt: 80,
    },
  ],
  recurring: [],
};

const commands = {
  'i open the dashboard with only a category limit': async ({ page }) => {
    await signInAsTestUser(page);
    await installBackend(page, SEED);
    await page.goto(APP_ROUTER.dashboard());
    await page.waitForLoadState('networkidle');
  },
  'i set the monthly limit from the empty state': async ({ getByE2e }) => {
    await getByE2e('dashboard:limit-total-set').click();
  },
  'the missing monthly limit is an empty state with an action': async ({
    getByE2e,
  }) => {
    const empty = getByE2e('dashboard:limit-total');
    await expect(empty).toBeVisible();
    await expect(getByE2e('dashboard:limit-total-set')).toBeVisible();
  },
  'the new limit form opens': async ({ getByE2e }) => {
    await expect(getByE2e('dashboard:limit-dialog')).toBeVisible();
  },
} satisfies CommandRegistry<Ctx>;

test.describe('missing monthly limit', () => {
  test('empty state lets me set it', async ({ e2e }) => {
    await interpreter(commands, e2e)(
      ['i open the dashboard with only a category limit'],
      ['the missing monthly limit is an empty state with an action'],
      ['i set the monthly limit from the empty state'],
      ['the new limit form opens'],
    );
  });
});
