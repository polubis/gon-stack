import { expect } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { test, type Ctx } from '@/__e2e__/test';
import { signInAsTestUser } from '@/__e2e__/session';
import { installBackend } from '@/modules/dashboard/__e2e__/fake-backend';
import { APP_ROUTER } from '@/shared/router/routes';

const HOUR_MS = 60 * 60 * 1000;

const THEME_TABS = ['Auto', 'Ciemny', 'Jasny'] as const;

const MODES = { Auto: 'auto', Ciemny: 'dark', Jasny: 'light' } as const;

const commands = {
  'it is 12:00 in the afternoon': async ({ page }) => {
    await page.clock.install({ time: new Date(2026, 10, 5, 12, 0) });
  },
  'it becomes 19:00': async ({ page }) => {
    await page.clock.runFor(7 * HOUR_MS);
  },
  'i open the settings': async ({ page }) => {
    await signInAsTestUser(page);
    await installBackend(page, {
      categories: [],
      expenses: [],
      limits: [],
      recurring: [],
    });
    await page.goto(APP_ROUTER.settings());
  },
  'each theme tab shows its icon': async ({ getByE2e }) => {
    for (const name of THEME_TABS) {
      await expect(
        getByE2e(`settings:theme-icon:${MODES[name]}`),
      ).toBeVisible();
    }
  },
  'i choose the theme': async (
    { getByE2e },
    name: (typeof THEME_TABS)[number],
  ) => {
    await getByE2e(`settings:theme:${MODES[name]}`).click();
    await expect(getByE2e(`settings:theme:${MODES[name]}`)).toHaveAttribute(
      'aria-selected',
      'true',
    );
  },
  'the page is light': async ({ getByE2e }) => {
    await expect(getByE2e('theme:root')).not.toHaveAttribute('data-theme');
  },
  'the page is dark': async ({ getByE2e }) => {
    await expect(getByE2e('theme:root')).toHaveAttribute('data-theme', 'dark');
  },
} satisfies CommandRegistry<Ctx>;

test.use({ viewport: { width: 1440, height: 900 }, video: 'on' });

test.describe('theme tabs', () => {
  test('the theme tabs show icons and each mode applies', async ({ e2e }) => {
    await interpreter(commands, e2e)(
      ['it is 12:00 in the afternoon'],
      ['i open the settings'],
      ['each theme tab shows its icon'],
      ['i choose the theme', 'Ciemny'],
      ['the page is dark'],
      ['i choose the theme', 'Jasny'],
      ['the page is light'],
      ['i choose the theme', 'Auto'],
      ['the page is light'],
      ['it becomes 19:00'],
      ['the page is dark'],
      ['i choose the theme', 'Jasny'],
      ['the page is light'],
    );
  });
});
