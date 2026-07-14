import AxeBuilder from '@axe-core/playwright';
import { expect } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { test, type Ctx } from '../../../__e2e__/test';

const { describe, use } = test;

const commands = {
  'im on the home page': ({ page }) => page.goto('/'),
  'it should have no wcag violations': async ({ page }) => {
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
  },
  'i focus the mobile nav toggle': ({ getByE2e }) =>
    getByE2e('home:nav-toggle').focus(),
  'i press enter': ({ page }) => page.keyboard.press('Enter'),
  'the mobile nav toggle should be collapsed': ({ getByE2e }) =>
    expect(getByE2e('home:nav-toggle')).toHaveAttribute(
      'aria-expanded',
      'false',
    ),
  'the mobile nav toggle should be expanded': ({ getByE2e }) =>
    expect(getByE2e('home:nav-toggle')).toHaveAttribute(
      'aria-expanded',
      'true',
    ),
  'the mobile nav menu should be hidden': ({ getByE2e }) =>
    expect(getByE2e('home:nav-menu-mobile')).toBeHidden(),
  'the mobile nav menu should be visible with focusable links': ({
    getByE2e,
  }) =>
    expect(
      getByE2e('home:nav-menu-mobile').getByRole('link').first(),
    ).toBeVisible(),
} satisfies CommandRegistry<Ctx>;

describe('home page accessibility', () => {
  test('has no automatic wcag violations', async ({ page, getByE2e }) => {
    await interpreter(commands, { page, getByE2e })(
      ['im on the home page'],
      ['it should have no wcag violations'],
    );
  });

  describe('mobile nav toggle', () => {
    use({ viewport: { width: 375, height: 812 } });

    test('exposes correct aria-expanded state and stays keyboard operable', async ({
      page,
      getByE2e,
    }) => {
      await interpreter(commands, { page, getByE2e })(
        ['im on the home page'],
        ['the mobile nav toggle should be collapsed'],
        ['the mobile nav menu should be hidden'],
        ['i focus the mobile nav toggle'],
        ['i press enter'],
        ['the mobile nav toggle should be expanded'],
        ['the mobile nav menu should be visible with focusable links'],
        ['i focus the mobile nav toggle'],
        ['i press enter'],
        ['the mobile nav toggle should be collapsed'],
        ['the mobile nav menu should be hidden'],
      );
    });
  });
});
