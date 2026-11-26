import { expect } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { test, type Ctx } from '@/__e2e__/test';
import { signInAsTestUser } from '@/__e2e__/session';
import { installBackend } from '@/modules/dashboard/__e2e__/fake-backend';
import { APP_ROUTER } from '@/shared/router/routes';

const VIEWS = {
  privacy: { path: APP_ROUTER.privacy(), e2e: 'privacy:main' },
  'ai info': { path: APP_ROUTER.aiInfo(), e2e: 'ai-info:main' },
} as const;

type View = keyof typeof VIEWS;

const commands = {
  'i prefer motion': async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
  },
  'i prefer reduced motion': async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
  },
  'i open the view': async ({ page }, view: View) => {
    await signInAsTestUser(page);
    await installBackend(page, {
      categories: [],
      expenses: [],
      limits: [],
      recurring: [],
    });
    await page.goto(VIEWS[view].path);
  },
  'the view fades in': async ({ getByE2e }, view: View) => {
    await expect(getByE2e(VIEWS[view].e2e)).toHaveCSS(
      'animation-name',
      'view-enter',
    );
  },
  'the view appears without animation': async ({ getByE2e }, view: View) => {
    await expect(getByE2e(VIEWS[view].e2e)).toHaveCSS('animation-name', 'none');
  },
} satisfies CommandRegistry<Ctx>;

test.use({ viewport: { width: 1440, height: 900 } });

test.describe('view entry animation', () => {
  for (const view of Object.keys(VIEWS) as View[]) {
    test(`${view} fades in`, async ({ e2e }) => {
      await interpreter(commands, e2e)(
        ['i prefer motion'],
        ['i open the view', view],
        ['the view fades in', view],
      );
    });
    test(`${view} stays still with reduced motion`, async ({ e2e }) => {
      await interpreter(commands, e2e)(
        ['i prefer reduced motion'],
        ['i open the view', view],
        ['the view appears without animation', view],
      );
    });
  }
});
