import { expect, type Locator } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { test, type Ctx } from '@/__e2e__/test';

const { describe } = test;

// client:load islands render before React attaches handlers — retry until click works.
const waitForPasswordToggle = async ({
  toggle,
  password,
}: {
  toggle: Locator;
  password: Locator;
}) => {
  await expect(async () => {
    await toggle.click();
    await expect(password).toHaveAttribute('type', 'text');
  }).toPass();

  await toggle.click();
  await expect(password).toHaveAttribute('type', 'password');
};

const commands = {
  'im on the sign up page': async ({ page, getByE2e }) => {
    await page.goto('/sign-up/');
    await waitForPasswordToggle({
      toggle: getByE2e('sign-up:toggle-password'),
      password: getByE2e('sign-up:password'),
    });
  },
  'the sign up form should post to register api': ({ getByE2e }) =>
    expect(getByE2e('sign-up:form')).toHaveAttribute(
      'action',
      '/api/auth/register',
    ),
  'the sign up form should use post method': ({ getByE2e }) =>
    expect(getByE2e('sign-up:form')).toHaveAttribute('method', 'post'),
  'i fill in mismatched passwords': async ({ getByE2e }) => {
    await getByE2e('sign-up:email').fill('new@example.com');
    await getByE2e('sign-up:password').fill('password123');
    await getByE2e('sign-up:confirm-password').fill('different456');
    await getByE2e('sign-up:agree-to-terms').check();
  },
  'i submit the sign up form': ({ getByE2e }) =>
    getByE2e('sign-up:submit').click(),
  'a password mismatch error should appear': ({ getByE2e }) =>
    expect(getByE2e('sign-up:form-error')).toBeVisible(),
  'i fill in matching passwords without agreeing to terms': async ({
    getByE2e,
  }) => {
    await getByE2e('sign-up:email').fill('new@example.com');
    await getByE2e('sign-up:password').fill('password123');
    await getByE2e('sign-up:confirm-password').fill('password123');
    await getByE2e('sign-up:agree-to-terms').uncheck();
  },
  'a terms required error should appear': ({ getByE2e }) =>
    expect(getByE2e('sign-up:form-error')).toBeVisible(),
  'the sso button should submit google provider': async ({ getByE2e }) => {
    const ssoForm = getByE2e('sign-up:sso').locator('xpath=ancestor::form');
    await expect(ssoForm).toHaveAttribute('action', '/api/auth/login');
    await expect(ssoForm.locator('input[name="provider"]')).toHaveValue(
      'google',
    );
  },
} satisfies CommandRegistry<Ctx>;

describe('sign up form', () => {
  test('wires fields to the register api', async ({ page, getByE2e }) => {
    await interpreter(commands, { page, getByE2e })(
      ['im on the sign up page'],
      ['the sign up form should post to register api'],
      ['the sign up form should use post method'],
    );
  });

  test('blocks submit when passwords do not match', async ({
    page,
    getByE2e,
  }) => {
    await interpreter(commands, { page, getByE2e })(
      ['im on the sign up page'],
      ['i fill in mismatched passwords'],
      ['i submit the sign up form'],
      ['a password mismatch error should appear'],
    );
  });

  test('blocks submit when terms are not accepted', async ({
    page,
    getByE2e,
  }) => {
    await interpreter(commands, { page, getByE2e })(
      ['im on the sign up page'],
      ['i fill in matching passwords without agreeing to terms'],
      ['i submit the sign up form'],
      ['a terms required error should appear'],
    );
  });

  test('sso form posts google provider', async ({ page, getByE2e }) => {
    await interpreter(commands, { page, getByE2e })(
      ['im on the sign up page'],
      ['the sso button should submit google provider'],
    );
  });
});
