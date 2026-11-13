import { expect, type Page } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { test, type Ctx } from '@/__e2e__/test';

const BEACON_URL = 'https://static.cloudflareinsights.com/beacon.min.js';

const isYoutube = (url: URL) => /youtube|google|ytimg|ggpht/.test(url.href);

const violationsByPage = new WeakMap<Page, string[]>();
const consoleErrorsByPage = new WeakMap<Page, string[]>();

const commands = {
  'i watch for csp violations': async ({ page }) => {
    const violations: string[] = [];
    const consoleErrors: string[] = [];
    violationsByPage.set(page, violations);
    consoleErrorsByPage.set(page, consoleErrors);

    await page.exposeFunction('reportCspViolation', (message: string) =>
      violations.push(message),
    );
    await page.addInitScript(() => {
      document.addEventListener('securitypolicyviolation', (event) => {
        (
          window as unknown as {
            reportCspViolation: (message: string) => void;
          }
        ).reportCspViolation(
          `${event.violatedDirective} blocked ${event.blockedURI}`,
        );
      });
    });
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
  },
  'i stub the analytics beacon and youtube': async ({ page }) => {
    await page.route(BEACON_URL, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/javascript',
        body: 'export default {};',
      }),
    );
    await page.route(isYoutube, (route) =>
      route.fulfill({ status: 200, body: '<html></html>' }),
    );
  },
  'im on the home page': ({ page }) => page.goto('/'),
  'im on the privacy policy page': ({ page }) =>
    page.goto('/polityka-prywatnosci/'),
  'the cookie banner should be visible': ({ getByE2e }) =>
    expect(getByE2e('cookies:banner')).toBeVisible({ timeout: 8000 }),
  'i click accept all': ({ getByE2e }) =>
    getByE2e('cookies:accept-all').click(),
  'the analytics script should be injected': ({ page }) =>
    expect(page.locator('script#cloudflare-web-analytics')).toHaveCount(1),
  'i open the company offer and load the video': async ({ page, getByE2e }) => {
    await page.getByRole('tab', { name: 'Dla firm' }).click();
    await getByE2e('home:offer-video-load').click();
    await expect(getByE2e('home:offer-video-frame')).toHaveAttribute(
      'src',
      /^https:\/\/www\.youtube-nocookie\.com\/embed\//,
    );
  },
  'the page should have no csp violations': async ({ page }) => {
    await page.waitForTimeout(500);
    expect(violationsByPage.get(page)).toEqual([]);
    expect(consoleErrorsByPage.get(page)).toEqual([]);
  },
} satisfies CommandRegistry<Ctx>;

test('home page raises no csp violations through consent and video load', async ({
  page,
  getByE2e,
}) => {
  await interpreter(commands, { page, getByE2e })(
    ['i watch for csp violations'],
    ['i stub the analytics beacon and youtube'],
    ['im on the home page'],
    ['the cookie banner should be visible'],
    ['i click accept all'],
    ['the analytics script should be injected'],
    ['i open the company offer and load the video'],
    ['the page should have no csp violations'],
  );
});

test('privacy policy page raises no csp violations', async ({
  page,
  getByE2e,
}) => {
  await interpreter(commands, { page, getByE2e })(
    ['i watch for csp violations'],
    ['im on the privacy policy page'],
    ['the page should have no csp violations'],
  );
});
