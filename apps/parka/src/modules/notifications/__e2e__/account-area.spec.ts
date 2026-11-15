import { expect } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { test, type Ctx } from '@/__e2e__/test';
import { signInAsTestUser } from '@/__e2e__/session';
import { API_ROUTER, APP_ROUTER } from '@/shared/router/routes';

const commands = {
  'i am on a desktop screen': async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
  },
  'i have 3 unread notifications': async ({ page }) => {
    await signInAsTestUser(page);
    await page.route(`**${API_ROUTER.notifications()}**`, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          data: [],
          nextCursor: null,
          unread: 3,
        }),
      }),
    );
  },
  'i open the time view': async ({ page }) => {
    await page.goto(APP_ROUTER.time());
  },
  'i see the unread count on my avatar': async ({ getByE2e }) => {
    await expect(
      getByE2e('account-menu:unread-badge').filter({ visible: true }),
    ).toHaveText('3');
  },
  'i do not see a bell or a more tab in the navigation': async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Więcej' })).toHaveCount(0);
    await expect(
      page
        .getByRole('navigation', { name: 'Nawigacja główna' })
        .getByRole('link'),
    ).toHaveCount(2);
  },
  'i open the user panel': async ({ getByE2e }) => {
    await getByE2e('account-menu:trigger').filter({ visible: true }).click();
    await getByE2e('account-menu:menu').waitFor();
  },
  'i see notifications with the count in the panel': async ({ getByE2e }) => {
    await expect(getByE2e('account-menu:notifications')).toContainText(
      'Nieprzeczytane: 3',
    );
  },
  'i open settings from the panel': async ({ page, getByE2e }) => {
    await getByE2e('account-menu:settings').click();
    await expect(page).toHaveURL(new RegExp(`${APP_ROUTER.settings()}$`));
    await expect(getByE2e('settings:main')).toBeVisible();
  },
  'i open notifications from the panel': async ({ page, getByE2e }) => {
    await getByE2e('account-menu:notifications').click();
    await expect(page).toHaveURL(new RegExp(`${APP_ROUTER.notifications()}$`));
    await expect(getByE2e('notifications:main')).toBeVisible();
  },
} satisfies CommandRegistry<Ctx>;

test('notifications live in the user area on every view', async ({ e2e }) => {
  const run = interpreter(commands, e2e);
  await run(['i am on a desktop screen']);
  await run(['i have 3 unread notifications']);
  await run(['i open the time view']);
  await run(['i see the unread count on my avatar']);
  await run(['i do not see a bell or a more tab in the navigation']);
  await run(['i open the user panel']);
  await run(['i see notifications with the count in the panel']);
  await run(['i open settings from the panel']);
  await run(['i see the unread count on my avatar']);
  await run(['i open the user panel']);
  await run(['i open notifications from the panel']);
});
