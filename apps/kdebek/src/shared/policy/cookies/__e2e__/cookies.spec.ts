import { expect, type Page } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import {
  COOKIE_CONSENT_STORAGE_KEY,
  seedAcceptedConsent,
} from '@/__e2e__/cookie-consent';
import { test, type Ctx } from '@/__e2e__/test';

const { describe } = test;

const categoryLabel = {
  necessary: 'Niezbędne',
  performance: 'Wydajnościowe',
  functional: 'Funkcjonalne',
  marketing: 'Marketingowe',
} as const;

const readStoredPreferences = (page: Page) =>
  page.evaluate((key) => {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw).preferences : null;
  }, COOKIE_CONSENT_STORAGE_KEY);

const commands = {
  'im on the home page': ({ page }) => page.goto('/'),
  'i have already accepted all cookies': ({ page }) =>
    seedAcceptedConsent(page),

  'the cookie banner should be visible': ({ getByE2e }) =>
    expect(getByE2e('cookies:banner')).toBeVisible({ timeout: 8000 }),
  'the cookie preferences view should be visible': ({ getByE2e }) =>
    expect(getByE2e('cookies:preferences')).toBeVisible(),
  'the cookie policy view should be visible': ({ getByE2e }) =>
    expect(getByE2e('cookies:policy')).toBeVisible(),
  'the cookie dialog should be closed': ({ page }) =>
    expect(page.getByRole('dialog')).toHaveCount(0),
  'the cookie reopen trigger should be visible': ({ getByE2e }) =>
    expect(getByE2e('cookies:reopen')).toBeVisible({ timeout: 8000 }),

  'i click accept all': ({ getByE2e }) =>
    getByE2e('cookies:accept-all').click(),
  'i click customize': ({ getByE2e }) => getByE2e('cookies:customize').click(),
  'i click the policy link': ({ getByE2e }) =>
    getByE2e('cookies:policy-link').click(),
  'i click back': ({ getByE2e }) => getByE2e('cookies:back').click(),
  'i click save preferences': ({ getByE2e }) =>
    getByE2e('cookies:save-preferences').click(),
  'i click the reopen trigger': ({ getByE2e }) =>
    getByE2e('cookies:reopen').click(),

  'i toggle the performance category': ({ page }) =>
    page.getByRole('switch', { name: categoryLabel.performance }).click(),

  'the necessary category should be checked and disabled': async ({ page }) => {
    const toggle = page.getByRole('switch', {
      name: categoryLabel.necessary,
    });
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
    await expect(toggle).toBeDisabled();
  },
  'the performance category should be checked': ({ page }) =>
    expect(
      page.getByRole('switch', { name: categoryLabel.performance }),
    ).toHaveAttribute('aria-checked', 'true'),
  'the functional category should be unchecked': ({ page }) =>
    expect(
      page.getByRole('switch', { name: categoryLabel.functional }),
    ).toHaveAttribute('aria-checked', 'false'),
  'the marketing category should be unchecked': ({ page }) =>
    expect(
      page.getByRole('switch', { name: categoryLabel.marketing }),
    ).toHaveAttribute('aria-checked', 'false'),

  'all cookie categories should be stored as accepted': async ({ page }) => {
    expect(await readStoredPreferences(page)).toEqual({
      necessary: true,
      performance: true,
      functional: true,
      marketing: true,
    });
  },
  'only the performance category should be stored as accepted': async ({
    page,
  }) => {
    expect(await readStoredPreferences(page)).toEqual({
      necessary: true,
      performance: true,
      functional: false,
      marketing: false,
    });
  },
} satisfies CommandRegistry<Ctx>;

describe('cookies consent navigation', () => {
  test('shows the consent banner on first visit', async ({
    page,
    getByE2e,
  }) => {
    await interpreter(commands, { page, getByE2e })(
      ['im on the home page'],
      ['the cookie banner should be visible'],
    );
  });

  test('lets a visitor read the privacy policy from the banner and return', async ({
    page,
    getByE2e,
  }) => {
    await interpreter(commands, { page, getByE2e })(
      ['im on the home page'],
      ['the cookie banner should be visible'],
      ['i click the policy link'],
      ['the cookie policy view should be visible'],
      ['i click back'],
      ['the cookie banner should be visible'],
    );
  });

  test('lets a visitor open preferences from the banner and return without consenting', async ({
    page,
    getByE2e,
  }) => {
    await interpreter(commands, { page, getByE2e })(
      ['im on the home page'],
      ['the cookie banner should be visible'],
      ['i click customize'],
      ['the cookie preferences view should be visible'],
      ['i click back'],
      ['the cookie banner should be visible'],
    );
  });

  test('always keeps the necessary category on and disabled', async ({
    page,
    getByE2e,
  }) => {
    await interpreter(commands, { page, getByE2e })(
      ['im on the home page'],
      ['the cookie banner should be visible'],
      ['i click customize'],
      ['the cookie preferences view should be visible'],
      ['the necessary category should be checked and disabled'],
    );
  });

  test('lets a visitor toggle optional categories independently', async ({
    page,
    getByE2e,
  }) => {
    await interpreter(commands, { page, getByE2e })(
      ['im on the home page'],
      ['the cookie banner should be visible'],
      ['i click customize'],
      ['i toggle the performance category'],
      ['the performance category should be checked'],
      ['the functional category should be unchecked'],
      ['the marketing category should be unchecked'],
    );
  });

  test('accepts all cookies from the banner and reveals the reopen trigger', async ({
    page,
    getByE2e,
  }) => {
    await interpreter(commands, { page, getByE2e })(
      ['im on the home page'],
      ['the cookie banner should be visible'],
      ['i click accept all'],
      ['the cookie dialog should be closed'],
      ['the cookie reopen trigger should be visible'],
      ['all cookie categories should be stored as accepted'],
    );
  });

  test('saves only the selected cookie categories', async ({
    page,
    getByE2e,
  }) => {
    await interpreter(commands, { page, getByE2e })(
      ['im on the home page'],
      ['the cookie banner should be visible'],
      ['i click customize'],
      ['i toggle the performance category'],
      ['i click save preferences'],
      ['the cookie dialog should be closed'],
      ['the cookie reopen trigger should be visible'],
      ['only the performance category should be stored as accepted'],
    );
  });

  test('skips the banner when consent was already given', async ({
    page,
    getByE2e,
  }) => {
    await interpreter(commands, { page, getByE2e })(
      ['i have already accepted all cookies'],
      ['im on the home page'],
      ['the cookie reopen trigger should be visible'],
      ['the cookie dialog should be closed'],
    );
  });

  test('reopens preferences from the trigger and closes fully instead of falling back to the banner', async ({
    page,
    getByE2e,
  }) => {
    await interpreter(commands, { page, getByE2e })(
      ['i have already accepted all cookies'],
      ['im on the home page'],
      ['the cookie reopen trigger should be visible'],
      ['i click the reopen trigger'],
      ['the cookie preferences view should be visible'],
      ['i click back'],
      ['the cookie dialog should be closed'],
    );
  });
});

const viewports = {
  mobile: { width: 320, height: 568 },
  tablet: { width: 768, height: 1024 },
  laptop: { width: 1280, height: 800 },
  desktop: { width: 1920, height: 1080 },
};

for (const [name, viewport] of Object.entries(viewports)) {
  describe(`cookies consent visuals - ${name}`, () => {
    test.use({ viewport });

    // Screenshotting the dialog locator itself (not the full page) crops
    // the capture to the modal's own bounding box, so whatever page content
    // sits behind the overlay never leaks into the baseline image.
    const visualCommands = {
      ...commands,
      'the cookie banner should match its visual baseline': ({ page }) =>
        expect(page.getByRole('dialog')).toHaveScreenshot(
          `cookies-banner-${name}.png`,
        ),
      'the cookie preferences view should match its visual baseline': ({
        page,
      }) =>
        expect(page.getByRole('dialog')).toHaveScreenshot(
          `cookies-preferences-${name}.png`,
        ),
      'the cookie policy view should match its visual baseline': ({ page }) =>
        expect(page.getByRole('dialog')).toHaveScreenshot(
          `cookies-policy-${name}.png`,
        ),
    } satisfies CommandRegistry<Ctx>;

    test('cookie banner matches visual baseline', async ({
      page,
      getByE2e,
    }) => {
      await interpreter(visualCommands, { page, getByE2e })(
        ['im on the home page'],
        ['the cookie banner should be visible'],
        ['the cookie banner should match its visual baseline'],
      );
    });

    test('cookie preferences view matches visual baseline', async ({
      page,
      getByE2e,
    }) => {
      await interpreter(visualCommands, { page, getByE2e })(
        ['im on the home page'],
        ['the cookie banner should be visible'],
        ['i click customize'],
        ['the cookie preferences view should be visible'],
        ['the cookie preferences view should match its visual baseline'],
      );
    });

    test('cookie policy view matches visual baseline', async ({
      page,
      getByE2e,
    }) => {
      await interpreter(visualCommands, { page, getByE2e })(
        ['im on the home page'],
        ['the cookie banner should be visible'],
        ['i click the policy link'],
        ['the cookie policy view should be visible'],
        ['the cookie policy view should match its visual baseline'],
      );
    });
  });
}
