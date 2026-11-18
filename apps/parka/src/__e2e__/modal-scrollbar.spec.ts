import { expect } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { test, type Ctx } from './test';

const commands = {
  'i open the app on a phone': async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
  },
  'i open the app on a desktop': async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
  },
  'the modal scrollbar leaves the rounded corners free': async ({
    getByE2e,
  }) => {
    const banner = getByE2e('cookies:banner');
    await banner.waitFor();
    const { margin, buttons } = await banner.evaluate((el) => ({
      margin: parseFloat(
        getComputedStyle(el, '::-webkit-scrollbar-track').marginTop,
      ),
      buttons: getComputedStyle(el, '::-webkit-scrollbar-button').display,
    }));
    expect(margin).toBeGreaterThan(0);
    expect(buttons).toBe('none');
  },
} satisfies CommandRegistry<Ctx>;

test('modal scrollbar hides behind the rounded border on a phone', async ({
  e2e,
}) => {
  const run = interpreter(commands, e2e);
  await run(['i open the app on a phone']);
  await run(['the modal scrollbar leaves the rounded corners free']);
});

test('modal scrollbar hides behind the rounded border on a desktop', async ({
  e2e,
}) => {
  const run = interpreter(commands, e2e);
  await run(['i open the app on a desktop']);
  await run(['the modal scrollbar leaves the rounded corners free']);
});
