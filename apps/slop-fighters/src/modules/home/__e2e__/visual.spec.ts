import { expect, test, type Page } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { seedAcceptedConsent } from '@/__e2e__/cookie-consent';

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
      // pauseAt (not install alone) actually freezes time, so the
      // about-gallery carousel's autoplay setInterval never fires
      'i freeze time': (page) => page.clock.pauseAt(new Date()),
      'i have already accepted cookies': (page) => seedAcceptedConsent(page),
      'im on the home page': (page) => page.goto('/'),
      // decode() (unlike the load event) guarantees the browser has
      // actually rasterized the image and it's safe to paint - complete/
      // load only confirm fetch, not that a frame has landed. aria-hidden
      // filters out the about-gallery's inactive carousel slides, which
      // stay lazy/unfetched forever once time is frozen. page.waitForTimeout
      // (not a page-side setTimeout) is the safety cap, since page.clock
      // also fakes any in-page setTimeout.
      'all images should be loaded': (page) =>
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
      'i should match the home page screenshot': (page) =>
        expect(page).toHaveScreenshot(`home-${name}.png`, {
          fullPage: true,
          timeout: 15000,
        }),
    } satisfies CommandRegistry<Page>;

    test('home page matches visual baseline', async ({ page }) => {
      await interpreter(commands, page)(
        ['i freeze time'],
        ['i have already accepted cookies'],
        ['im on the home page'],
        ['all images should be loaded'],
        ['i should match the home page screenshot'],
      );
    });
  });
}
