import { expect } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { test, type Ctx } from './test';
import { APP_ROUTER } from '@/shared/router/routes';
import { signInAsTestUser } from './session';
import type { E2eId } from './selectors';

type Screen = { path: string; root: E2eId };

const SCREENS: Screen[] = [
  { path: APP_ROUTER.aiInfo(), root: 'ai-info:main' },
  { path: APP_ROUTER.privacy(), root: 'privacy:main' },
];

const animationOf = (root: ReturnType<Ctx['getByE2e']>) =>
  root.evaluate((el) => getComputedStyle(el).animationName);

const commands = {
  'i prefer reduced motion': async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
  },
  'i allow motion': async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
  },
  'the view enters with an animation': async (
    { page, getByE2e }: Ctx,
    screen: Screen,
  ) => {
    await signInAsTestUser(page);
    await page.goto(screen.path);
    await expect(getByE2e(screen.root)).toBeVisible();
    expect(await animationOf(getByE2e(screen.root))).not.toBe('none');
  },
  'the view enters without an animation': async (
    { page, getByE2e }: Ctx,
    screen: Screen,
  ) => {
    await signInAsTestUser(page);
    await page.goto(screen.path);
    await expect(getByE2e(screen.root)).toBeVisible();
    expect(await animationOf(getByE2e(screen.root))).toBe('none');
  },
} satisfies CommandRegistry<Ctx>;

for (const screen of SCREENS) {
  test(`${screen.root} fades in as a whole`, async ({ e2e }) => {
    await interpreter(commands, e2e)(
      ['i allow motion'],
      ['the view enters with an animation', screen],
    );
  });

  test(`${screen.root} skips the entry animation for reduced motion`, async ({
    e2e,
  }) => {
    await interpreter(commands, e2e)(
      ['i prefer reduced motion'],
      ['the view enters without an animation', screen],
    );
  });
}
