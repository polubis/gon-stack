import { expect } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { test, type Ctx } from '@/__e2e__/test';
import { signInAsTestUser } from '@/__e2e__/session';
import { APP_ROUTER } from '@/shared/router/routes';
import { installBackend, type Seed } from './fake-backend';

const month = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const FOOD = { id: 'cat-1', name: 'Spożywcze', icon: 'cart', color: '#0f7a4f' };

/** Eight expenses: the tile shows six, "show all" lists them all. */
const SEED: Seed = {
  categories: [FOOD],
  expenses: Array.from({ length: 8 }, (_, i) => ({
    id: `e-${i}`,
    merchant: `Sklep e-${i}`,
    date: `${month()}-0${i + 1}T10:00:00.000Z`,
    amount: 10 + i,
    categoryId: FOOD.id,
    paymentMethod: 'card',
    isBill: false,
    source: 'manual' as const,
    items: [],
  })),
  limits: [],
  recurring: [],
};

const commands = {
  'i open the full expenses list': async ({ page, getByE2e }) => {
    await signInAsTestUser(page);
    await installBackend(page, SEED);
    await page.goto(APP_ROUTER.dashboard());
    await page.waitForLoadState('networkidle');
    await getByE2e('dashboard:expenses-toggle').click();
    await expect(getByE2e('dashboard:expenses-dialog')).toBeVisible();
  },
  'i click More on an expense in the list': async ({ getByE2e }) => {
    await getByE2e('dashboard:expenses-dialog')
      .getByRole('button', { name: 'Więcej: Sklep e-0' })
      .click();
  },

  'one Duplicate action is shown': async ({ page }) => {
    await expect(
      page.getByRole('menuitem', { name: 'Duplikuj: Sklep e-0' }),
    ).toHaveCount(1);
  },
} satisfies CommandRegistry<Ctx>;

test('More in the full expenses list opens one menu', async ({ e2e }) => {
  await interpreter(commands, e2e)(
    ['i open the full expenses list'],
    ['i click More on an expense in the list'],
    ['one Duplicate action is shown'],
  );
});
