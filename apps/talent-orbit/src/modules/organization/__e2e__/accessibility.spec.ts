import AxeBuilder from '@axe-core/playwright';
import { expect } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { test, type Ctx } from '@/__e2e__/test';

const { describe } = test;

const commands = {
  'im on the organizations page': ({ page }) => page.goto('/organization/'),
  'im on the create organization page': ({ page }) =>
    page.goto('/organization-create/'),
  'im on the orbit labs organization page': ({ page }) =>
    page.goto('/organization/orbit-labs/'),
  'im on the share resource page': ({ page }) =>
    page.goto('/organization-share/'),
  'im on the shared resources page': ({ page }) =>
    page.goto('/organization-shared/'),
  'im on the sharing confirmation page': ({ page }) =>
    page.goto('/organization-share-confirmation/'),
  'the organizations list root should be visible': ({ getByE2e }) =>
    expect(getByE2e('organization:list-main')).toBeVisible(),
  'the create organization root should be visible': ({ getByE2e }) =>
    expect(getByE2e('organization:create-main')).toBeVisible(),
  'the organization detail root should be visible': ({ getByE2e }) =>
    expect(getByE2e('organization:detail-main')).toBeVisible(),
  'the share resource root should be visible': ({ getByE2e }) =>
    expect(getByE2e('organization:share-main')).toBeVisible(),
  'the shared resources root should be visible': ({ getByE2e }) =>
    expect(getByE2e('organization:shared-main')).toBeVisible(),
  'the sharing confirmation root should be visible': ({ getByE2e }) =>
    expect(getByE2e('organization:confirmation-main')).toBeVisible(),
  'it should have no wcag violations': async ({ page }) => {
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
  },
} satisfies CommandRegistry<Ctx>;

describe('organizations list page accessibility', () => {
  test('has no automatic wcag violations', async ({ page, getByE2e }) => {
    await interpreter(commands, { page, getByE2e })(
      ['im on the organizations page'],
      ['the organizations list root should be visible'],
      ['it should have no wcag violations'],
    );
  });
});

describe('create organization page accessibility', () => {
  test('has no automatic wcag violations', async ({ page, getByE2e }) => {
    await interpreter(commands, { page, getByE2e })(
      ['im on the create organization page'],
      ['the create organization root should be visible'],
      ['it should have no wcag violations'],
    );
  });
});

describe('organization detail page accessibility', () => {
  test('has no automatic wcag violations', async ({ page, getByE2e }) => {
    await interpreter(commands, { page, getByE2e })(
      ['im on the orbit labs organization page'],
      ['the organization detail root should be visible'],
      ['it should have no wcag violations'],
    );
  });
});

describe('share resource page accessibility', () => {
  test('has no automatic wcag violations', async ({ page, getByE2e }) => {
    await interpreter(commands, { page, getByE2e })(
      ['im on the share resource page'],
      ['the share resource root should be visible'],
      ['it should have no wcag violations'],
    );
  });
});

describe('shared resources page accessibility', () => {
  test('has no automatic wcag violations', async ({ page, getByE2e }) => {
    await interpreter(commands, { page, getByE2e })(
      ['im on the shared resources page'],
      ['the shared resources root should be visible'],
      ['it should have no wcag violations'],
    );
  });
});

describe('sharing confirmation page accessibility', () => {
  test('has no automatic wcag violations', async ({ page, getByE2e }) => {
    await interpreter(commands, { page, getByE2e })(
      ['im on the sharing confirmation page'],
      ['the sharing confirmation root should be visible'],
      ['it should have no wcag violations'],
    );
  });
});
