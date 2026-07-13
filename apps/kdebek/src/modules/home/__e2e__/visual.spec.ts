import { expect, test, type Page } from '@playwright/test';
import { interpreter } from '@repo/vibe-test';

const commands = {
  'im on the home page': (page: Page) => page.goto('/'),
  'i should match the home page screenshot': (page: Page) =>
    expect(page).toHaveScreenshot('home.png', { fullPage: false }),
};

test('home page matches visual baseline', async ({ page }) => {
  await interpreter(commands)(
    ['im on the home page', page],
    ['i should match the home page screenshot', page],
  );
});
