import AxeBuilder from '@axe-core/playwright';
import { expect } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { test, type Ctx } from '@/__e2e__/test';

const { describe } = test;

const commands = {
  'im on the tests library page': ({ page }) => page.goto('/tests/'),
  'im on the name test page': ({ page }) => page.goto('/tests-name/'),
  'im on the select questions page': ({ page }) =>
    page.goto('/tests-select-questions/'),
  'im on the arrange test page': ({ page }) => page.goto('/tests-arrange/'),
  'im on the review test page': ({ page }) => page.goto('/tests-review/'),
  'im on the test details page': ({ page }) => page.goto('/tests-detail/'),
  'the tests library root should be visible': ({ getByE2e }) =>
    expect(getByE2e('tests:list-main')).toBeVisible(),
  'the name test root should be visible': ({ getByE2e }) =>
    expect(getByE2e('tests:name-main')).toBeVisible(),
  'the select questions root should be visible': ({ getByE2e }) =>
    expect(getByE2e('tests:select-questions-main')).toBeVisible(),
  'the arrange test root should be visible': ({ getByE2e }) =>
    expect(getByE2e('tests:arrange-main')).toBeVisible(),
  'the review test root should be visible': ({ getByE2e }) =>
    expect(getByE2e('tests:review-main')).toBeVisible(),
  'the test details root should be visible': ({ getByE2e }) =>
    expect(getByE2e('tests:detail-main')).toBeVisible(),
  'it should have no wcag violations': async ({ page }) => {
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
  },
} satisfies CommandRegistry<Ctx>;

describe('tests library page accessibility', () => {
  test('has no automatic wcag violations', async ({ page, getByE2e }) => {
    await interpreter(commands, { page, getByE2e })(
      ['im on the tests library page'],
      ['the tests library root should be visible'],
      ['it should have no wcag violations'],
    );
  });
});

describe('name test page accessibility', () => {
  test('has no automatic wcag violations', async ({ page, getByE2e }) => {
    await interpreter(commands, { page, getByE2e })(
      ['im on the name test page'],
      ['the name test root should be visible'],
      ['it should have no wcag violations'],
    );
  });
});

describe('select questions page accessibility', () => {
  test('has no automatic wcag violations', async ({ page, getByE2e }) => {
    await interpreter(commands, { page, getByE2e })(
      ['im on the select questions page'],
      ['the select questions root should be visible'],
      ['it should have no wcag violations'],
    );
  });
});

describe('arrange test page accessibility', () => {
  test('has no automatic wcag violations', async ({ page, getByE2e }) => {
    await interpreter(commands, { page, getByE2e })(
      ['im on the arrange test page'],
      ['the arrange test root should be visible'],
      ['it should have no wcag violations'],
    );
  });
});

describe('review test page accessibility', () => {
  test('has no automatic wcag violations', async ({ page, getByE2e }) => {
    await interpreter(commands, { page, getByE2e })(
      ['im on the review test page'],
      ['the review test root should be visible'],
      ['it should have no wcag violations'],
    );
  });
});

describe('test details page accessibility', () => {
  test('has no automatic wcag violations', async ({ page, getByE2e }) => {
    await interpreter(commands, { page, getByE2e })(
      ['im on the test details page'],
      ['the test details root should be visible'],
      ['it should have no wcag violations'],
    );
  });
});
