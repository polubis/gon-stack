import { expect } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { test, type Ctx } from '@/__e2e__/test';
import { signInAsTestUser } from '@/__e2e__/session';
import { installBackend } from '@/modules/dashboard/__e2e__/fake-backend';
import { APP_ROUTER } from '@/shared/router/routes';

const commands = {
  'a newer version is deployed and the dashboard is open': async ({ page }) => {
    await signInAsTestUser(page);
    await installBackend(page, {
      categories: [],
      expenses: [],
      limits: [],
      recurring: [],
    });
    await page.route('**/version.json', (route) =>
      route.fulfill({ json: { version: 'newer-deploy' } }),
    );
    await page.goto(`${APP_ROUTER.dashboard()}?modal=expenses`);
    await page.waitForLoadState('networkidle');
  },
  'the update notice is shown over the open modal': async ({ getByE2e }) => {
    await expect(getByE2e('dashboard:expenses-dialog')).toBeVisible();
    await expect(getByE2e('app-update:banner')).toBeVisible();
  },
  'i dismiss the update notice': async ({ getByE2e }) => {
    await getByE2e('app-update:dismiss').click();
  },
  'the notice is gone and the modal still responds': async ({
    page,
    getByE2e,
  }) => {
    await expect(getByE2e('app-update:banner')).toHaveCount(0);
    await expect(getByE2e('dashboard:expenses-dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(getByE2e('dashboard:expenses-dialog')).toHaveCount(0);
  },
} satisfies CommandRegistry<Ctx>;

test.describe('update notice over a modal', () => {
  test('dismissing it keeps the modal below usable', async ({ e2e }) => {
    await interpreter(commands, e2e)(
      ['a newer version is deployed and the dashboard is open'],
      ['the update notice is shown over the open modal'],
      ['i dismiss the update notice'],
      ['the notice is gone and the modal still responds'],
    );
  });
});
