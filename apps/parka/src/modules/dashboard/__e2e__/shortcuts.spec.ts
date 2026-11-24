import { expect } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { test, type Ctx } from '@/__e2e__/test';
import { signInAsTestUser } from '@/__e2e__/session';
import { APP_ROUTER } from '@/shared/router/routes';
import { installBackend } from './fake-backend';

const commands = {
  'i open the dashboard': async ({ page, getByE2e }) => {
    await signInAsTestUser(page);
    await installBackend(page, {
      categories: [
        { id: 'cat-1', name: 'Spożywcze', icon: 'cart', color: '#0f7a4f' },
      ],
      expenses: [],
      limits: [],
      recurring: [],
    });
    await page.goto(APP_ROUTER.dashboard());
    await page.waitForLoadState('networkidle');
    await expect(getByE2e('dashboard:expenses-empty')).toBeVisible();
  },
  'i press N': async ({ page }) => {
    await page.keyboard.press('n');
  },
  'i press C': async ({ page }) => {
    await page.keyboard.press('c');
  },
  'i open the add menu': async ({ getByE2e }) => {
    await getByE2e('dashboard:expense-new').click();
  },

  'the new expense page opens': async ({ page }) => {
    await expect(page).toHaveURL(/\/app\/expenses\/new\/?$/);
  },
  'the new recurring expense page opens': async ({ page }) => {
    await expect(page).toHaveURL(/type=recurring/);
  },
  'the dashboard stays': async ({ page }) => {
    await page.waitForTimeout(300);
    expect(new URL(page.url()).pathname).toBe(APP_ROUTER.dashboard());
  },
} satisfies CommandRegistry<Ctx>;

test.describe('on a desktop', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('N opens a new expense', async ({ e2e }) => {
    await interpreter(commands, e2e)(
      ['i open the dashboard'],
      ['i press N'],
      ['the new expense page opens'],
    );
  });

  test('C opens a new recurring expense', async ({ e2e }) => {
    await interpreter(commands, e2e)(
      ['i open the dashboard'],
      ['i press C'],
      ['the new recurring expense page opens'],
    );
  });

  test('shortcuts stay silent while the add menu is open', async ({ e2e }) => {
    await interpreter(commands, e2e)(
      ['i open the dashboard'],
      ['i open the add menu'],
      ['i press N'],
      ['the dashboard stays'],
    );
  });
});
