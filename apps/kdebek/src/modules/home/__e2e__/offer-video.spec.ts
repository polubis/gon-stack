import AxeBuilder from '@axe-core/playwright';
import { expect } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { seedAcceptedConsent } from '@/__e2e__/cookie-consent';
import { test, type Ctx } from '@/__e2e__/test';

const { describe, use } = test;

const viewports = [320, 480, 640, 768, 1024, 1280, 1440, 1920];

const isYoutube = (url: URL) => /youtube|google|ytimg|ggpht/.test(url.href);

const createCommands = () => {
  const youtubeRequests: string[] = [];

  return {
    'i have already accepted cookies': ({ page }) => seedAcceptedConsent(page),
    'i track requests to youtube': async ({ page }) => {
      // Stub the embed so the suite never depends on the network, but
      // still records that a request was attempted.
      await page.route(isYoutube, (route) => {
        youtubeRequests.push(route.request().url());
        return route.fulfill({ status: 200, body: '<html></html>' });
      });
    },
    'im on the home page': ({ page }) => page.goto('/'),
    'i open the company offer': async ({ page }) => {
      await page.getByRole('tab', { name: 'Dla firm' }).click();
      await expect(
        page.getByRole('button', { name: /Zwiń Masaż biurowy/ }),
      ).toBeVisible();
    },
    'i see the video placeholder': ({ getByE2e }) =>
      expect(getByE2e('home:offer-video-placeholder')).toBeVisible(),
    'the placeholder should be fully visible': async ({ getByE2e }) => {
      const placeholder = getByE2e('home:offer-video-placeholder');
      const container = placeholder.locator('..');
      await placeholder.scrollIntoViewIfNeeded();
      const [p, c] = await Promise.all([
        placeholder.boundingBox(),
        container.boundingBox(),
      ]);
      expect(p).not.toBeNull();
      expect(c).not.toBeNull();
      // Content must sit inside the box, never clipped by it
      expect(p!.height).toBeGreaterThanOrEqual(c!.height - 1);
      const overflow = await placeholder.evaluate(
        (el) =>
          el.scrollHeight > el.clientHeight + 1 ||
          el.scrollWidth > el.clientWidth + 1,
      );
      expect(overflow).toBe(false);
      await expect(getByE2e('home:offer-video-load')).toBeInViewport();
    },
    'no iframe should exist': ({ page }) =>
      expect(page.locator('iframe')).toHaveCount(0),
    'no request should go to youtube': async ({ page }) => {
      await page.waitForTimeout(500);
      expect(youtubeRequests).toEqual([]);
    },
    'i load the video': ({ getByE2e }) =>
      getByE2e('home:offer-video-load').click(),
    'the video iframe should appear': ({ getByE2e }) =>
      expect(getByE2e('home:offer-video-frame')).toHaveAttribute(
        'src',
        /^https:\/\/www\.youtube-nocookie\.com\/embed\//,
      ),
    'the placeholder should be gone': ({ getByE2e }) =>
      expect(getByE2e('home:offer-video-placeholder')).toHaveCount(0),
    'it should have no wcag violations': async ({ page }) => {
      const { violations } = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
    },
  } satisfies CommandRegistry<Ctx>;
};

describe('home offer video consent', () => {
  test('loads nothing from youtube until the visitor clicks', async ({
    page,
    getByE2e,
  }) => {
    await interpreter(createCommands(), { page, getByE2e })(
      ['i have already accepted cookies'],
      ['i track requests to youtube'],
      ['im on the home page'],
      ['i open the company offer'],
      ['i see the video placeholder'],
      ['no iframe should exist'],
      ['no request should go to youtube'],
      ['i load the video'],
      ['the video iframe should appear'],
      ['the placeholder should be gone'],
    );
  });

  test('placeholder has no wcag violations', async ({ page, getByE2e }) => {
    await interpreter(createCommands(), { page, getByE2e })(
      ['i have already accepted cookies'],
      ['im on the home page'],
      ['i open the company offer'],
      ['i see the video placeholder'],
      ['it should have no wcag violations'],
    );
  });

  for (const width of viewports) {
    describe(`at ${width}px`, () => {
      use({ viewport: { width, height: 900 } });

      test('placeholder is fully visible', async ({ page, getByE2e }) => {
        await interpreter(createCommands(), { page, getByE2e })(
          ['i have already accepted cookies'],
          ['im on the home page'],
          ['i open the company offer'],
          ['the placeholder should be fully visible'],
        );
      });
    });
  }
});
