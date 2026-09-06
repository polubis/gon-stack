import AxeBuilder from '@axe-core/playwright';
import { expect } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { test, type Ctx } from '@/__e2e__/test';

const { describe } = test;

const commands = {
  'im on the questions library page': ({ page }) =>
    page.goto('/questions-library/'),
  'im on the link concept page': ({ page }) =>
    page.goto('/questions-library-link-concept/'),
  'im on the choose type page': ({ page }) =>
    page.goto('/questions-library-choose-type/'),
  'im on the compose question page': ({ page }) =>
    page.goto('/questions-library-compose/'),
  'im on the review question page': ({ page }) =>
    page.goto('/questions-library-review/'),
  'im on the question details page': ({ page }) =>
    page.goto('/questions-library-detail/'),
  'the questions library list root should be visible': ({ getByE2e }) =>
    expect(getByE2e('questions-library:list-main')).toBeVisible(),
  'the link concept root should be visible': ({ getByE2e }) =>
    expect(getByE2e('questions-library:link-concept-main')).toBeVisible(),
  'the choose type root should be visible': ({ getByE2e }) =>
    expect(getByE2e('questions-library:choose-type-main')).toBeVisible(),
  'the compose question root should be visible': ({ getByE2e }) =>
    expect(getByE2e('questions-library:compose-main')).toBeVisible(),
  'the review question root should be visible': ({ getByE2e }) =>
    expect(getByE2e('questions-library:review-main')).toBeVisible(),
  'the question details root should be visible': ({ getByE2e }) =>
    expect(getByE2e('questions-library:detail-main')).toBeVisible(),
  'it should have no wcag violations': async ({ page }) => {
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
  },
} satisfies CommandRegistry<Ctx>;

describe('questions library list page accessibility', () => {
  test('has no automatic wcag violations', async ({ page, getByE2e }) => {
    await interpreter(commands, { page, getByE2e })(
      ['im on the questions library page'],
      ['the questions library list root should be visible'],
      ['it should have no wcag violations'],
    );
  });
});

describe('link concept page accessibility', () => {
  test('has no automatic wcag violations', async ({ page, getByE2e }) => {
    await interpreter(commands, { page, getByE2e })(
      ['im on the link concept page'],
      ['the link concept root should be visible'],
      ['it should have no wcag violations'],
    );
  });
});

describe('choose type page accessibility', () => {
  test('has no automatic wcag violations', async ({ page, getByE2e }) => {
    await interpreter(commands, { page, getByE2e })(
      ['im on the choose type page'],
      ['the choose type root should be visible'],
      ['it should have no wcag violations'],
    );
  });
});

describe('compose question page accessibility', () => {
  test('has no automatic wcag violations', async ({ page, getByE2e }) => {
    await interpreter(commands, { page, getByE2e })(
      ['im on the compose question page'],
      ['the compose question root should be visible'],
      ['it should have no wcag violations'],
    );
  });
});

describe('review question page accessibility', () => {
  test('has no automatic wcag violations', async ({ page, getByE2e }) => {
    await interpreter(commands, { page, getByE2e })(
      ['im on the review question page'],
      ['the review question root should be visible'],
      ['it should have no wcag violations'],
    );
  });
});

describe('question details page accessibility', () => {
  test('has no automatic wcag violations', async ({ page, getByE2e }) => {
    await interpreter(commands, { page, getByE2e })(
      ['im on the question details page'],
      ['the question details root should be visible'],
      ['it should have no wcag violations'],
    );
  });
});
