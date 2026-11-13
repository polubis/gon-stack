import { expect } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { test, type Ctx } from '@/__e2e__/test';
import { signInAsTestUser } from '@/__e2e__/session';
import { stashReceiptPhoto } from '@/__e2e__/stash-receipt';
import {
  installBackend,
  type Seed,
} from '@/modules/dashboard/__e2e__/fake-backend';
import { APP_ROUTER } from '@/shared/router/routes';

const SEED: Seed = {
  categories: [
    { id: 'cat-1', name: 'Spożywcze', icon: 'cart', color: '#0f7a4f' },
  ],
  expenses: [],
  limits: [],
  recurring: [],
};

const commands = {
  'i open the recurring expense form': async ({ page }) => {
    await signInAsTestUser(page);
    await installBackend(page, SEED);
    await stashReceiptPhoto(page);
    await page.goto(APP_ROUTER.newExpense({ type: 'recurring' }));
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(200);
  },
  'the rule is filled from the receipt': async ({ getByE2e }) => {
    await expect(getByE2e('expenses-management:recurring-name')).toHaveValue(
      'Biedronka',
    );
    await expect(getByE2e('expenses-management:recurring-method')).toHaveValue(
      'Karta',
    );
    await expect(getByE2e('expenses-management:recurring-cost')).toHaveValue(
      '42.5',
    );
    await expect(
      getByE2e('expenses-management:recurring-cost'),
    ).toHaveAttribute('readonly', '');
  },
} satisfies CommandRegistry<Ctx>;

test.describe('recurring expense from a receipt', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('an uploaded receipt fills the rule and its products', async ({
    e2e,
  }) => {
    await interpreter(commands, e2e)(
      ['i open the recurring expense form'],
      ['the rule is filled from the receipt'],
    );
  });
});
