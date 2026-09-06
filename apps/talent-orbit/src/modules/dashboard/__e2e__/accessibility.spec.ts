import AxeBuilder from '@axe-core/playwright';
import { expect } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { test, type Ctx } from '@/__e2e__/test';

const { describe } = test;

const commands = {
  'im on the dashboard page': ({ page }) => page.goto('/dashboard/'),
  'the dashboard root should be visible': ({ getByE2e }) =>
    expect(getByE2e('dashboard:main')).toBeVisible(),
  'it should have no wcag violations': async ({ page }) => {
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
  },
} satisfies CommandRegistry<Ctx>;

describe('dashboard page accessibility', () => {
  test('has no automatic wcag violations', async ({ page, getByE2e }) => {
    await interpreter(commands, { page, getByE2e })(
      ['im on the dashboard page'],
      ['the dashboard root should be visible'],
      ['it should have no wcag violations'],
    );
  });
});
