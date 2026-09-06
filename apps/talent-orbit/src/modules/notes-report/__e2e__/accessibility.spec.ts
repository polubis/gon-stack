import AxeBuilder from '@axe-core/playwright';
import { expect } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { test, type Ctx } from '@/__e2e__/test';

const { describe } = test;

const commands = {
  'im on the thank you page': ({ page }) =>
    page.goto('/notes-report-thank-you/'),
  'im on the add notes page': ({ page }) => page.goto('/notes-report-notes/'),
  'im on the add transcript page': ({ page }) =>
    page.goto('/notes-report-transcript/'),
  'im on the review submission page': ({ page }) =>
    page.goto('/notes-report-review/'),
  'im on the report page': ({ page }) => page.goto('/notes-report-report/'),
  'im on the candidate feedback page': ({ page }) =>
    page.goto('/notes-report-feedback/'),
  'the thank you root should be visible': ({ getByE2e }) =>
    expect(getByE2e('notes-report:thank-you-main')).toBeVisible(),
  'the add notes root should be visible': ({ getByE2e }) =>
    expect(getByE2e('notes-report:notes-main')).toBeVisible(),
  'the add transcript root should be visible': ({ getByE2e }) =>
    expect(getByE2e('notes-report:transcript-main')).toBeVisible(),
  'the review submission root should be visible': ({ getByE2e }) =>
    expect(getByE2e('notes-report:review-main')).toBeVisible(),
  'the report root should be visible': ({ getByE2e }) =>
    expect(getByE2e('notes-report:report-main')).toBeVisible(),
  'the candidate feedback root should be visible': ({ getByE2e }) =>
    expect(getByE2e('notes-report:feedback-main')).toBeVisible(),
  'it should have no wcag violations': async ({ page }) => {
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
  },
} satisfies CommandRegistry<Ctx>;

describe('thank you page accessibility', () => {
  test('has no automatic wcag violations', async ({ page, getByE2e }) => {
    await interpreter(commands, { page, getByE2e })(
      ['im on the thank you page'],
      ['the thank you root should be visible'],
      ['it should have no wcag violations'],
    );
  });
});

describe('add notes page accessibility', () => {
  test('has no automatic wcag violations', async ({ page, getByE2e }) => {
    await interpreter(commands, { page, getByE2e })(
      ['im on the add notes page'],
      ['the add notes root should be visible'],
      ['it should have no wcag violations'],
    );
  });
});

describe('add transcript page accessibility', () => {
  test('has no automatic wcag violations', async ({ page, getByE2e }) => {
    await interpreter(commands, { page, getByE2e })(
      ['im on the add transcript page'],
      ['the add transcript root should be visible'],
      ['it should have no wcag violations'],
    );
  });
});

describe('review submission page accessibility', () => {
  test('has no automatic wcag violations', async ({ page, getByE2e }) => {
    await interpreter(commands, { page, getByE2e })(
      ['im on the review submission page'],
      ['the review submission root should be visible'],
      ['it should have no wcag violations'],
    );
  });
});

describe('report page accessibility', () => {
  test('has no automatic wcag violations', async ({ page, getByE2e }) => {
    await interpreter(commands, { page, getByE2e })(
      ['im on the report page'],
      ['the report root should be visible'],
      ['it should have no wcag violations'],
    );
  });
});

describe('candidate feedback page accessibility', () => {
  test('has no automatic wcag violations', async ({ page, getByE2e }) => {
    await interpreter(commands, { page, getByE2e })(
      ['im on the candidate feedback page'],
      ['the candidate feedback root should be visible'],
      ['it should have no wcag violations'],
    );
  });
});
