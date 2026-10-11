import { expect, type Page } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { test, type Ctx } from '@/__e2e__/test';
import { signInAsTestUser } from '@/__e2e__/session';
import { APP_ROUTER } from '@/shared/router/routes';
import { installBackend, type Seed } from './fake-backend';

const FOOD = { id: 'cat-1', name: 'Spożywcze', icon: 'cart', color: '#0f7a4f' };
const FUN = { id: 'cat-2', name: 'Rozrywka', icon: 'film', color: '#a02fa0' };

const seed = (categories: Seed['categories']): Seed => ({
  categories,
  expenses: [],
  limits: [],
  recurring: [],
});

const settle = async (page: Page): Promise<void> => {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(200);
};

const commands = {
  'i open the page for adding an expense': async ({ page }) => {
    await signInAsTestUser(page);
    await installBackend(page, seed([FOOD, FUN]));
    await page.goto(APP_ROUTER.newExpense());
    await settle(page);
  },
  'i add "  Biedronka " paid with "BLIK" in category "Spożywcze"': async ({
    getByE2e,
    page,
  }) => {
    await getByE2e('expense-form:merchant').fill('  Biedronka ');
    await getByE2e('expense-form:amount').fill('20');
    await getByE2e('expense-form:category').click();
    await page.getByRole('option', { name: 'Spożywcze' }).click();
    await getByE2e('expense-form:method').fill('BLIK');
    await getByE2e('expense-form:save').click();
    await expect(getByE2e('dashboard:main')).toBeVisible();
    await settle(page);
  },
  'i open the page for adding an expense again': async ({ page }) => {
    await page.goto(APP_ROUTER.newExpense());
    await settle(page);
  },
  'i open the page again after the category was deleted': async ({ page }) => {
    await installBackend(page, seed([FUN]));
    await page.goto(APP_ROUTER.newExpense());
    await settle(page);
  },

  'the shop is "Biedronka"': async ({ getByE2e }) => {
    await expect(getByE2e('expense-form:merchant')).toHaveValue('Biedronka');
  },
  'the payment method is "BLIK"': async ({ getByE2e }) => {
    await expect(getByE2e('expense-form:method')).toHaveValue('BLIK');
  },
  'the category is "Spożywcze"': async ({ getByE2e }) => {
    await expect(getByE2e('expense-form:category')).toHaveText('Spożywcze');
  },
  'the category is left on "Rozrywka"': async ({ getByE2e }) => {
    await expect(getByE2e('expense-form:category')).toHaveText('Rozrywka');
  },
} satisfies CommandRegistry<Ctx>;

test.describe('remembered expense form fields', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('the next new expense starts with the last shop, payment method and category', async ({
    e2e,
  }) => {
    await interpreter(commands, e2e)(
      ['i open the page for adding an expense'],
      ['i add "  Biedronka " paid with "BLIK" in category "Spożywcze"'],
      ['i open the page for adding an expense again'],
      ['the shop is "Biedronka"'],
      ['the payment method is "BLIK"'],
      ['the category is "Spożywcze"'],
    );
  });

  test('a remembered category that no longer exists is left unfilled', async ({
    e2e,
  }) => {
    await interpreter(commands, e2e)(
      ['i open the page for adding an expense'],
      ['i add "  Biedronka " paid with "BLIK" in category "Spożywcze"'],
      ['i open the page again after the category was deleted'],
      ['the payment method is "BLIK"'],
      ['the category is left on "Rozrywka"'],
    );
  });
});
