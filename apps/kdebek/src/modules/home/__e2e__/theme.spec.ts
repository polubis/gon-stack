import { expect } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { seedAcceptedConsent } from '@/__e2e__/cookie-consent';
import { test, type Ctx } from '@/__e2e__/test';

const commands = {
  'i have already accepted cookies': ({ page }) => seedAcceptedConsent(page),
  'i prefer the dark color scheme': ({ page }) =>
    page.emulateMedia({ colorScheme: 'dark' }),
  'im on the home page': ({ page }) => page.goto('/'),
  'i reload the page': ({ page }) => page.reload(),
  'the page should use the dark theme': ({ page }) =>
    expect(page.locator('html')).toHaveAttribute('data-theme', 'dark'),
  'the page should use the light theme': ({ page }) =>
    expect(page.locator('html')).toHaveAttribute('data-theme', 'light'),
  'i activate the theme toggle by keyboard': async ({ getByE2e, page }) => {
    await getByE2e('home:theme-toggle').focus();
    await page.keyboard.press('Enter');
  },
  'the theme toggle should offer the dark theme': ({ getByE2e }) =>
    expect(getByE2e('home:theme-toggle')).toHaveAccessibleName(
      'Włącz ciemny motyw',
    ),
  'the navbar should be elevated after scrolling': async ({ page }) => {
    const navbar = page.locator('#navbar');
    await expect(navbar).not.toHaveAttribute('data-scrolled');
    await page.mouse.wheel(0, 900);
    await expect(navbar).toHaveAttribute('data-scrolled');
  },
} satisfies CommandRegistry<Ctx>;

test('system dark preference is respected by default', async ({
  page,
  getByE2e,
}) => {
  await interpreter(commands, { page, getByE2e })(
    ['i have already accepted cookies'],
    ['i prefer the dark color scheme'],
    ['im on the home page'],
    ['the page should use the dark theme'],
  );
});

test('chosen theme survives a reload', async ({ page, getByE2e }) => {
  await interpreter(commands, { page, getByE2e })(
    ['i have already accepted cookies'],
    ['i prefer the dark color scheme'],
    ['im on the home page'],
    ['i activate the theme toggle by keyboard'],
    ['the page should use the light theme'],
    ['i reload the page'],
    ['the page should use the light theme'],
  );
});

test('navbar gets elevated after scrolling', async ({ page, getByE2e }) => {
  await interpreter(commands, { page, getByE2e })(
    ['i have already accepted cookies'],
    ['im on the home page'],
    ['the navbar should be elevated after scrolling'],
  );
});
