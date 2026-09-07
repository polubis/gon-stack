import AxeBuilder from '@axe-core/playwright';
import { expect } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { test, type Ctx } from '@/__e2e__/test';

const { describe } = test;

const commands = {
  'im on the knowledge banks page': ({ page }) => page.goto('/knowledge-bank/'),
  'im on the create bank page': ({ page }) =>
    page.goto('/knowledge-bank-create/'),
  'im on the frontend engineering bank page': ({ page }) =>
    page.goto('/knowledge-bank/frontend-engineering/'),
  'the knowledge banks list root should be visible': ({ getByE2e }) =>
    expect(getByE2e('knowledge-bank:list-main')).toBeVisible(),
  'the create bank root should be visible': ({ getByE2e }) =>
    expect(getByE2e('knowledge-bank:create-main')).toBeVisible(),
  'the bank detail root should be visible': ({ getByE2e }) =>
    expect(getByE2e('knowledge-bank:detail-main')).toBeVisible(),
  'it should have no wcag violations': async ({ page }) => {
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
  },
} satisfies CommandRegistry<Ctx>;

describe('knowledge banks list page accessibility', () => {
  test('has no automatic wcag violations', async ({ page, getByE2e }) => {
    await interpreter(commands, { page, getByE2e })(
      ['im on the knowledge banks page'],
      ['the knowledge banks list root should be visible'],
      ['it should have no wcag violations'],
    );
  });
});

describe('create bank page accessibility', () => {
  test('has no automatic wcag violations', async ({ page, getByE2e }) => {
    await interpreter(commands, { page, getByE2e })(
      ['im on the create bank page'],
      ['the create bank root should be visible'],
      ['it should have no wcag violations'],
    );
  });
});

describe('bank detail page accessibility', () => {
  test('has no automatic wcag violations', async ({ page, getByE2e }) => {
    await interpreter(commands, { page, getByE2e })(
      ['im on the frontend engineering bank page'],
      ['the bank detail root should be visible'],
      ['it should have no wcag violations'],
    );
  });
});
