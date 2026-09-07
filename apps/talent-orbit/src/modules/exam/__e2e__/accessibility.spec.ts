import AxeBuilder from '@axe-core/playwright';
import { expect } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { test, type Ctx } from '@/__e2e__/test';

const { describe } = test;

const commands = {
  'im on the exams list page': ({ page }) => page.goto('/exams/'),
  'im on the choose test page': ({ page }) => page.goto('/exams-choose-test/'),
  'im on the configure exam page': ({ page }) => page.goto('/exams-configure/'),
  'im on the share exam page': ({ page }) => page.goto('/exams-share/'),
  'im on the join exam page': ({ page }) => page.goto('/exams-join/'),
  'im on the take exam page': ({ page }) => page.goto('/exams-question/'),
  'im on the attempt submitted page': ({ page }) =>
    page.goto('/exams-submitted/'),
  'im on the exam details page': ({ page }) => page.goto('/exams-detail/'),
  'im on the exam statistics page': ({ page }) =>
    page.goto('/exams-statistics/'),
  'the exams list root should be visible': ({ getByE2e }) =>
    expect(getByE2e('exam:list-main')).toBeVisible(),
  'the choose test root should be visible': ({ getByE2e }) =>
    expect(getByE2e('exam:choose-test-main')).toBeVisible(),
  'the configure exam root should be visible': ({ getByE2e }) =>
    expect(getByE2e('exam:configure-main')).toBeVisible(),
  'the share exam root should be visible': ({ getByE2e }) =>
    expect(getByE2e('exam:share-main')).toBeVisible(),
  'the join exam root should be visible': ({ getByE2e }) =>
    expect(getByE2e('exam:join-main')).toBeVisible(),
  'the take exam root should be visible': ({ getByE2e }) =>
    expect(getByE2e('exam:question-main')).toBeVisible(),
  'the attempt submitted root should be visible': ({ getByE2e }) =>
    expect(getByE2e('exam:submitted-main')).toBeVisible(),
  'the exam details root should be visible': ({ getByE2e }) =>
    expect(getByE2e('exam:detail-main')).toBeVisible(),
  'the exam statistics root should be visible': ({ getByE2e }) =>
    expect(getByE2e('exam:statistics-main')).toBeVisible(),
  'it should have no wcag violations': async ({ page }) => {
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
  },
} satisfies CommandRegistry<Ctx>;

describe('exams list page accessibility', () => {
  test('has no automatic wcag violations', async ({ page, getByE2e }) => {
    await interpreter(commands, { page, getByE2e })(
      ['im on the exams list page'],
      ['the exams list root should be visible'],
      ['it should have no wcag violations'],
    );
  });
});

describe('choose test page accessibility', () => {
  test('has no automatic wcag violations', async ({ page, getByE2e }) => {
    await interpreter(commands, { page, getByE2e })(
      ['im on the choose test page'],
      ['the choose test root should be visible'],
      ['it should have no wcag violations'],
    );
  });
});

describe('configure exam page accessibility', () => {
  test('has no automatic wcag violations', async ({ page, getByE2e }) => {
    await interpreter(commands, { page, getByE2e })(
      ['im on the configure exam page'],
      ['the configure exam root should be visible'],
      ['it should have no wcag violations'],
    );
  });
});

describe('share exam page accessibility', () => {
  test('has no automatic wcag violations', async ({ page, getByE2e }) => {
    await interpreter(commands, { page, getByE2e })(
      ['im on the share exam page'],
      ['the share exam root should be visible'],
      ['it should have no wcag violations'],
    );
  });
});

describe('join exam page accessibility', () => {
  test('has no automatic wcag violations', async ({ page, getByE2e }) => {
    await interpreter(commands, { page, getByE2e })(
      ['im on the join exam page'],
      ['the join exam root should be visible'],
      ['it should have no wcag violations'],
    );
  });
});

describe('take exam page accessibility', () => {
  test('has no automatic wcag violations', async ({ page, getByE2e }) => {
    await interpreter(commands, { page, getByE2e })(
      ['im on the take exam page'],
      ['the take exam root should be visible'],
      ['it should have no wcag violations'],
    );
  });
});

describe('attempt submitted page accessibility', () => {
  test('has no automatic wcag violations', async ({ page, getByE2e }) => {
    await interpreter(commands, { page, getByE2e })(
      ['im on the attempt submitted page'],
      ['the attempt submitted root should be visible'],
      ['it should have no wcag violations'],
    );
  });
});

describe('exam details page accessibility', () => {
  test('has no automatic wcag violations', async ({ page, getByE2e }) => {
    await interpreter(commands, { page, getByE2e })(
      ['im on the exam details page'],
      ['the exam details root should be visible'],
      ['it should have no wcag violations'],
    );
  });
});

describe('exam statistics page accessibility', () => {
  test('has no automatic wcag violations', async ({ page, getByE2e }) => {
    await interpreter(commands, { page, getByE2e })(
      ['im on the exam statistics page'],
      ['the exam statistics root should be visible'],
      ['it should have no wcag violations'],
    );
  });
});
