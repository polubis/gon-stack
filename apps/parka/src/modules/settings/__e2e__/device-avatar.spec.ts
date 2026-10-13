import { expect } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { test, type Ctx } from '@/__e2e__/test';
import { signInAsTestUser } from '@/__e2e__/session';
import {
  installBackend,
  type Seed,
} from '@/modules/dashboard/__e2e__/fake-backend';
import { APP_ROUTER } from '@/shared/router/routes';

const SEED: Seed = {
  categories: [
    { id: 'cat-1', name: 'Spożywcze', icon: 'cart', color: '#0f7a4f' },
  ],
  expenses: [
    {
      id: 'e-1',
      merchant: 'Kawiarnia',
      date: new Date().toISOString(),
      amount: 25,
      categoryId: 'cat-1',
      paymentMethod: 'Karta',
      source: 'manual',
      device: { id: 'device-1', name: 'Chrome on Windows', type: 'desktop' },
      items: [],
    },
  ],
  limits: [],
  recurring: [],
};

const commands = {
  'i open the settings': async ({ page }) => {
    await signInAsTestUser(page);
    await installBackend(page, SEED);
    await page.goto(APP_ROUTER.settings());
  },
  'i choose the rocket for "Chrome on Windows"': async ({ getByE2e }) => {
    await getByE2e('settings:device-avatar:device-1:rocket').click();
    await expect(
      getByE2e('settings:device-avatar:device-1:rocket'),
    ).toBeChecked();
  },
  'i open the expenses': async ({ page, getByE2e }) => {
    await page.goto(APP_ROUTER.dashboard());
    await expect(getByE2e('dashboard:main')).toBeVisible();
  },
  'the "Kawiarnia" row shows the rocket': async ({ getByE2ePrefix }) => {
    await expect(
      getByE2ePrefix('dashboard:expense:')
        .filter({ hasText: 'Kawiarnia' })
        .locator('[data-avatar="rocket"]'),
    ).toBeVisible();
  },
} satisfies CommandRegistry<Ctx>;

test.describe('device avatar', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('an avatar chosen in settings shows next to the expense', async ({
    e2e,
  }) => {
    await interpreter(commands, e2e)(
      ['i open the settings'],
      ['i choose the rocket for "Chrome on Windows"'],
      ['i open the expenses'],
      ['the "Kawiarnia" row shows the rocket'],
    );
  });
});
