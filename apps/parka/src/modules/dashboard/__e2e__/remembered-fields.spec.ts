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

const remembered = (
  field: 'merchant' | 'paymentMethod',
  value: string,
  patch: { useCount?: number } = {},
) => ({
  field,
  value,
  useCount: 1,
  lastUsed: null,
  ...patch,
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
  'i open the page for adding an expense with remembered shops': async ({
    page,
  }) => {
    await signInAsTestUser(page);
    await installBackend(page, {
      ...seed([FOOD, FUN]),
      suggestions: [
        remembered('merchant', 'Biedronka', { useCount: 9 }),
        remembered('merchant', 'Lidl', { useCount: 2 }),
        remembered('merchant', 'Bistro'),
      ],
    });
    await page.goto(APP_ROUTER.newExpense());
    await settle(page);
  },
  'i type "bi" in the shop': async ({ getByE2e }) => {
    await getByE2e('expense-form:merchant').fill('bi');
  },
  'i open the shop suggestions with the star': async ({ page }) => {
    await page.getByRole('button', { name: 'Podpowiedzi: Sklep' }).click();
  },
  'i type "Rossmann" in the shop': async ({ getByE2e }) => {
    await getByE2e('expense-form:merchant').fill('Rossmann');
  },
  'i pick the shop "Bistro" from the suggestions': async ({ page }) => {
    await page.getByRole('option', { name: /Bistro/ }).click();
  },
  'i add the expense for 20 in category "Spożywcze"': async ({
    getByE2e,
    page,
  }) => {
    await getByE2e('expense-form:amount').fill('20');
    await getByE2e('expense-form:category').click();
    await page.getByRole('option', { name: 'Spożywcze' }).click();
    await getByE2e('expense-form:save').click();
    await expect(getByE2e('dashboard:main')).toBeVisible();
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
    await installBackend(page, {
      ...seed([FUN]),
      suggestions: [remembered('paymentMethod', 'BLIK')],
    });
    await page.goto(APP_ROUTER.newExpense());
    await settle(page);
  },

  'the shop suggestions are "Biedronka" then "Bistro"': async ({ page }) => {
    await expect(page.getByRole('option')).toHaveText([
      /^Biedronka/,
      /^Bistro/,
    ]);
  },
  'the shop suggestions are "Biedronka", "Lidl" and "Bistro"': async ({
    page,
  }) => {
    await expect(page.getByRole('option')).toHaveText([
      /^Biedronka/,
      /^Lidl/,
      /^Bistro/,
    ]);
  },
  'the shop is "Rossmann"': async ({ getByE2e }) => {
    await expect(getByE2e('expense-form:merchant')).toHaveValue('Rossmann');
  },
  'the shop is "Bistro"': async ({ getByE2e }) => {
    await expect(getByE2e('expense-form:merchant')).toHaveValue('Bistro');
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

  test('a blank shop is filled with the most used one and typing narrows the remembered ones', async ({
    e2e,
  }) => {
    await interpreter(commands, e2e)(
      ['i open the page for adding an expense with remembered shops'],
      ['the shop is "Biedronka"'],
      ['i type "bi" in the shop'],
      ['the shop suggestions are "Biedronka" then "Bistro"'],
      ['i pick the shop "Bistro" from the suggestions'],
      ['the shop is "Bistro"'],
    );
  });

  test('the star in the shop field opens all remembered shops', async ({
    e2e,
  }) => {
    await interpreter(commands, e2e)(
      ['i open the page for adding an expense with remembered shops'],
      ['i open the shop suggestions with the star'],
      ['the shop suggestions are "Biedronka", "Lidl" and "Bistro"'],
      ['i pick the shop "Bistro" from the suggestions'],
      ['the shop is "Bistro"'],
    );
  });

  test('a shop typed for the first time is offered on the next new expense', async ({
    e2e,
  }) => {
    await interpreter(commands, e2e)(
      ['i open the page for adding an expense'],
      ['i type "Rossmann" in the shop'],
      ['i add the expense for 20 in category "Spożywcze"'],
      ['i open the page for adding an expense again'],
      ['the shop is "Rossmann"'],
    );
  });
});
