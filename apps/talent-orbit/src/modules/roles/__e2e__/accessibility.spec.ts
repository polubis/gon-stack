import AxeBuilder from '@axe-core/playwright';
import { expect } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { test, type Ctx } from '@/__e2e__/test';

const { describe } = test;

const commands = {
  'im on the users page': ({ page }) => page.goto('/roles/'),
  'im on the assign role page': ({ page }) => page.goto('/roles-assign/'),
  'im on the role confirmation page': ({ page }) =>
    page.goto('/roles-confirmation/'),
  'the users list root should be visible': ({ getByE2e }) =>
    expect(getByE2e('roles:list-main')).toBeVisible(),
  'the assign role root should be visible': ({ getByE2e }) =>
    expect(getByE2e('roles:assign-main')).toBeVisible(),
  'the role confirmation root should be visible': ({ getByE2e }) =>
    expect(getByE2e('roles:confirmation-main')).toBeVisible(),
  'it should have no wcag violations': async ({ page }) => {
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
  },
} satisfies CommandRegistry<Ctx>;

describe('users list page accessibility', () => {
  test('has no automatic wcag violations', async ({ page, getByE2e }) => {
    await interpreter(commands, { page, getByE2e })(
      ['im on the users page'],
      ['the users list root should be visible'],
      ['it should have no wcag violations'],
    );
  });
});

describe('assign role page accessibility', () => {
  test('has no automatic wcag violations', async ({ page, getByE2e }) => {
    await interpreter(commands, { page, getByE2e })(
      ['im on the assign role page'],
      ['the assign role root should be visible'],
      ['it should have no wcag violations'],
    );
  });
});

describe('role confirmation page accessibility', () => {
  test('has no automatic wcag violations', async ({ page, getByE2e }) => {
    await interpreter(commands, { page, getByE2e })(
      ['im on the role confirmation page'],
      ['the role confirmation root should be visible'],
      ['it should have no wcag violations'],
    );
  });
});
