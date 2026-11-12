import { expect } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { test, type Ctx } from './test';
import { APP_ROUTER } from '@/shared/router/routes';
import { signInAsTestUser } from './session';

const commands = {
  'i am on a desktop screen': async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
  },
  'i open the account menu from the side nav': async ({ page, getByE2e }) => {
    await signInAsTestUser(page);
    await page.goto(APP_ROUTER.settings());
    await getByE2e('account-menu:trigger').filter({ visible: true }).click();
    await getByE2e('account-menu:menu').waitFor();
  },
  'the menu sits next to the avatar button, not on the right edge': async ({
    page,
    getByE2e,
  }) => {
    const trigger = (await getByE2e('account-menu:trigger')
      .filter({ visible: true })
      .boundingBox())!;
    const menu = (await getByE2e('account-menu:menu').boundingBox())!;
    expect(menu.x).toBeGreaterThanOrEqual(trigger.x + trigger.width);
    expect(menu.x).toBeLessThan(trigger.x + trigger.width + 100);
    expect(menu.y + menu.height).toBeCloseTo(trigger.y + trigger.height, -1);
    await page.screenshot({
      path: '../../.evidences/VYB-257/account-menu-desktop.png',
    });
  },
} satisfies CommandRegistry<Ctx>;

test('account menu opens beside the avatar button on desktop', async ({
  e2e,
}) => {
  const run = interpreter(commands, e2e);
  await run(['i am on a desktop screen']);
  await run(['i open the account menu from the side nav']);
  await run(['the menu sits next to the avatar button, not on the right edge']);
});
