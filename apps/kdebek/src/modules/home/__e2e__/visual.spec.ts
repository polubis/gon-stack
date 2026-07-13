import { expect, test, type Page } from '@playwright/test';
import { interpreter } from '@repo/vibe-test';

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
      'i freeze time': (page: Page) => page.clock.pauseAt(new Date()),
      'im on the home page': (page: Page) => page.goto('/'),
      // decode() (unlike the load event) guarantees the browser has
      // actually rasterized the image and it's safe to paint - complete/
      // load only confirm fetch, not that a frame has landed. aria-hidden
      // filters out the about-gallery's inactive carousel slides, which
      // stay lazy/unfetched forever once time is frozen. page.waitForTimeout
      // (not a page-side setTimeout) is the safety cap, since page.clock
      // also fakes any in-page setTimeout.
      'all images should be loaded': (page: Page) =>
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
      'i should match the home page screenshot': (page: Page) =>
        expect(page).toHaveScreenshot(`home-${name}.png`, {
          fullPage: true,
          timeout: 15000,
        }),
    };

    test('home page matches visual baseline', async ({ page }) => {
      await interpreter(commands)(
        ['i freeze time', page],
        ['im on the home page', page],
        ['all images should be loaded', page],
        ['i should match the home page screenshot', page],
      );
    });
  });
}
