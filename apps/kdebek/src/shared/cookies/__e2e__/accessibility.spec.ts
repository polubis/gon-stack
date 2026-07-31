import AxeBuilder from '@axe-core/playwright';
import { expect } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { seedAcceptedConsent } from '@/__e2e__/cookie-consent';
import { test, type Ctx } from '@/__e2e__/test';

const { describe } = test;

const commands = {
  'im on the home page': ({ page }) => page.goto('/'),
  'i have already accepted all cookies': ({ page }) =>
    seedAcceptedConsent(page),

  'the cookie banner should be visible': ({ getByE2e }) =>
    expect(getByE2e('cookies:banner')).toBeVisible({ timeout: 8000 }),
  'the cookie preferences view should be visible': ({ getByE2e }) =>
    expect(getByE2e('cookies:preferences')).toBeVisible(),
  'the cookie reopen trigger should be visible': ({ getByE2e }) =>
    expect(getByE2e('cookies:reopen')).toBeVisible({ timeout: 8000 }),

  'i click customize': ({ getByE2e }) => getByE2e('cookies:customize').click(),
  'the policy link should point to the privacy policy page': ({ getByE2e }) =>
    expect(getByE2e('cookies:policy-link')).toHaveAttribute(
      'href',
      '/polityka-prywatnosci/',
    ),

  'it should have no wcag violations': async ({ page }) => {
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
  },
} satisfies CommandRegistry<Ctx>;

describe('cookies consent accessibility', () => {
  test('consent banner has no automatic wcag violations', async ({
    page,
    getByE2e,
  }) => {
    await interpreter(commands, { page, getByE2e })(
      ['im on the home page'],
      ['the cookie banner should be visible'],
      ['it should have no wcag violations'],
    );
  });

  test('preferences view has no automatic wcag violations', async ({
    page,
    getByE2e,
  }) => {
    await interpreter(commands, { page, getByE2e })(
      ['im on the home page'],
      ['the cookie banner should be visible'],
      ['i click customize'],
      ['the cookie preferences view should be visible'],
      ['it should have no wcag violations'],
    );
  });

  test('policy link points to the privacy policy page', async ({
    page,
    getByE2e,
  }) => {
    await interpreter(commands, { page, getByE2e })(
      ['im on the home page'],
      ['the cookie banner should be visible'],
      ['the policy link should point to the privacy policy page'],
    );
  });

  test('reopen trigger has no automatic wcag violations', async ({
    page,
    getByE2e,
  }) => {
    await interpreter(commands, { page, getByE2e })(
      ['i have already accepted all cookies'],
      ['im on the home page'],
      ['the cookie reopen trigger should be visible'],
      ['it should have no wcag violations'],
    );
  });
});
