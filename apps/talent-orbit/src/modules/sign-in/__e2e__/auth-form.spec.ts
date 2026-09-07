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
  'im on the sign in page': async ({ page, getByE2e }) => {
    await page.goto('/sign-in/');
    await waitForPasswordToggle({
      toggle: getByE2e('sign-in:toggle-password'),
      password: getByE2e('sign-in:password'),
    });
  },
  'the sign in form should post to login api': ({ getByE2e }) =>
    expect(getByE2e('sign-in:form')).toHaveAttribute(
      'action',
      '/api/auth/login',
    ),
  'the sign in form should use post method': ({ getByE2e }) =>
    expect(getByE2e('sign-in:form')).toHaveAttribute('method', 'post'),
  'the email field should be required': ({ getByE2e }) =>
    expect(getByE2e('sign-in:email')).toHaveAttribute('required', ''),
  'the password field should be required': ({ getByE2e }) =>
    expect(getByE2e('sign-in:password')).toHaveAttribute('required', ''),
  'i fill in valid credentials': async ({ getByE2e }) => {
    await getByE2e('sign-in:email').fill('test@example.com');
    await getByE2e('sign-in:password').fill('password123');
  },
  'toggling password visibility reveals the password': async ({ getByE2e }) => {
    await getByE2e('sign-in:password').fill('secret');
    await expect(getByE2e('sign-in:password')).toHaveAttribute(
      'type',
      'password',
    );
    await getByE2e('sign-in:toggle-password').click();
    await expect(getByE2e('sign-in:password')).toHaveAttribute('type', 'text');
  },
  'the sso button should submit google provider': async ({ getByE2e }) => {
    const ssoForm = getByE2e('sign-in:sso').locator('xpath=ancestor::form');
    await expect(ssoForm).toHaveAttribute('action', '/api/auth/login');
    await expect(ssoForm.locator('input[name="provider"]')).toHaveValue(
      'google',
    );
  },
} satisfies CommandRegistry<Ctx>;

describe('sign in form', () => {
  test('wires fields to the login api', async ({ page, getByE2e }) => {
    await interpreter(commands, { page, getByE2e })(
      ['im on the sign in page'],
      ['the sign in form should post to login api'],
      ['the sign in form should use post method'],
      ['the email field should be required'],
      ['the password field should be required'],
    );
  });

  test('supports password visibility toggle', async ({ page, getByE2e }) => {
    await interpreter(commands, { page, getByE2e })(
      ['im on the sign in page'],
      ['toggling password visibility reveals the password'],
    );
  });

  test('sso form posts google provider', async ({ page, getByE2e }) => {
    await interpreter(commands, { page, getByE2e })(
      ['im on the sign in page'],
      ['the sso button should submit google provider'],
    );
  });
});
