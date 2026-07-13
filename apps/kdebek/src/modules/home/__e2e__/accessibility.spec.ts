import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { interpreter } from '@repo/vibe-test';

const { describe, use } = test;

const navToggle = (page: Page) => page.locator('[data-e2e="home:nav-toggle"]');
const navMenuMobile = (page: Page) =>
  page.locator('[data-e2e="home:nav-menu-mobile"]');

const commands = {
  'im on the home page': (page: Page) => page.goto('/'),
  'it should have no wcag violations': async (page: Page) => {
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
  },
  'i focus the mobile nav toggle': (page: Page) => navToggle(page).focus(),
  'i press enter': (page: Page) => page.keyboard.press('Enter'),
  'the mobile nav toggle should be collapsed': (page: Page) =>
    expect(navToggle(page)).toHaveAttribute('aria-expanded', 'false'),
  'the mobile nav toggle should be expanded': (page: Page) =>
    expect(navToggle(page)).toHaveAttribute('aria-expanded', 'true'),
  'the mobile nav menu should be hidden': (page: Page) =>
    expect(navMenuMobile(page)).toBeHidden(),
  'the mobile nav menu should be visible with focusable links': (page: Page) =>
    expect(navMenuMobile(page).getByRole('link').first()).toBeVisible(),
};

describe('home page accessibility', () => {
  test('has no automatic wcag violations', async ({ page }) => {
    await interpreter(commands)(
      ['im on the home page', page],
      ['it should have no wcag violations', page],
    );
  });

  describe('mobile nav toggle', () => {
    use({ viewport: { width: 375, height: 812 } });

    test('exposes correct aria-expanded state and stays keyboard operable', async ({
      page,
    }) => {
      await interpreter(commands)(
        ['im on the home page', page],
        ['the mobile nav toggle should be collapsed', page],
        ['the mobile nav menu should be hidden', page],
        ['i focus the mobile nav toggle', page],
        ['i press enter', page],
        ['the mobile nav toggle should be expanded', page],
        ['the mobile nav menu should be visible with focusable links', page],
        ['i focus the mobile nav toggle', page],
        ['i press enter', page],
        ['the mobile nav toggle should be collapsed', page],
        ['the mobile nav menu should be hidden', page],
      );
    });
  });
});
