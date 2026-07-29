import { expect } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { seedAcceptedConsent } from '@/__e2e__/cookie-consent';
import { test, type Ctx } from '@/__e2e__/test';

const { describe } = test;

const viewports = {
  mobile: { width: 320, height: 568 },
  tablet: { width: 768, height: 1024 },
  laptop: { width: 1280, height: 800 },
  desktop: { width: 1920, height: 1080 },
};

for (const [name, viewport] of Object.entries(viewports)) {
  describe(name, () => {
    test.use({ viewport });

    const commands = {
      // setFixedTime (not pauseAt) - pauseAt installs fake timers that also
      // intercept requestIdleCallback, so its {timeout} fallback never
      // elapses while paused, leaving the reopen trigger's reveal to fire
      // only whenever the browser happens to hit real idle (flaky).
      'i freeze time': ({ page }) => page.clock.setFixedTime(new Date()),
      'i have already accepted cookies': ({ page }) =>
        seedAcceptedConsent(page),
      'im on the privacy policy page': ({ page }) =>
        page.goto('/polityka-prywatnosci/'),
      'the cookie dialog should not appear': ({ page }) =>
        expect(page.getByRole('dialog')).toHaveCount(0),
      'the cookie reopen trigger should be visible': ({ getByE2e }) =>
        expect(getByE2e('cookies:reopen')).toBeVisible({ timeout: 8000 }),
      'all images should be loaded': ({ page }) =>
        Promise.race([
          page.evaluate(() =>
            Promise.all(
              Array.from(document.images)
                .filter((img) => img.getAttribute('aria-hidden') !== 'true')
                .map((img) => img.decode().catch(() => undefined)),
            ),
          ),
          page.waitForTimeout(8000),
        ]),
      'i should match the privacy policy page screenshot': ({ page }) =>
        expect(page).toHaveScreenshot(`privacy-policy-${name}.png`, {
          fullPage: true,
          timeout: 15000,
        }),
    } satisfies CommandRegistry<Ctx>;

    test('privacy policy page matches visual baseline', async ({
      page,
      getByE2e,
    }) => {
      await interpreter(commands, { page, getByE2e })(
        ['i freeze time'],
        ['i have already accepted cookies'],
        ['im on the privacy policy page'],
        ['the cookie dialog should not appear'],
        ['the cookie reopen trigger should be visible'],
        ['all images should be loaded'],
        ['i should match the privacy policy page screenshot'],
      );
    });
  });
}
