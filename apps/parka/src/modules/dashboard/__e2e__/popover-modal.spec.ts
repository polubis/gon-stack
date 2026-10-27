import { expect, type Page } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { test, type Ctx } from '@/__e2e__/test';
import { signInAsTestUser } from '@/__e2e__/session';
import { APP_ROUTER } from '@/shared/router/routes';
import { installBackend } from './fake-backend';

const modals = (page: Page): string[] =>
  new URL(page.url()).searchParams.getAll('modal');

const commands = {
  'i open the dashboard': async ({ page }) => {
    await signInAsTestUser(page);
    await installBackend(page, {
      categories: [],
      expenses: [],
      limits: [],
      recurring: [],
    });
    await page.goto(APP_ROUTER.dashboard());
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(200);
  },
  'i open the add menu': async ({ page }) => {
    await page.getByRole('button', { name: 'Dodaj' }).first().click();
  },
  'i pick the category option': async ({ page }) => {
    await page.getByRole('menuitem', { name: 'Kategoria' }).click();
  },
  'i press the browser Back button': async ({ page }) => {
    await page.goBack();
  },

  'the category form stays open': async ({ page, getByE2e }) => {
    await page.waitForTimeout(500);
    await expect(getByE2e('categories:form-name')).toBeVisible();
    expect(modals(page)).toEqual(['category-new']);
  },
  'the add menu is closed': async ({ page }) => {
    await expect(page.getByRole('menu', { name: 'Dodaj' })).toHaveCount(0);
  },
  'the form is closed and the url is clean': async ({ page, getByE2e }) => {
    await expect(getByE2e('categories:form-name')).toHaveCount(0);
    expect(modals(page)).toEqual([]);
    expect(new URL(page.url()).pathname).toBe(APP_ROUTER.dashboard());
  },
} satisfies CommandRegistry<Ctx>;

test.describe('on a narrow screen', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('a modal opened from a popover action stays open', async ({ e2e }) => {
    await interpreter(commands, e2e)(
      ['i open the dashboard'],
      ['i open the add menu'],
      ['i pick the category option'],
      ['the category form stays open'],
      ['the add menu is closed'],
    );
  });

  test('one Back closes that modal and lands on the page', async ({ e2e }) => {
    await interpreter(commands, e2e)(
      ['i open the dashboard'],
      ['i open the add menu'],
      ['i pick the category option'],
      ['the category form stays open'],
      ['i press the browser Back button'],
      ['the form is closed and the url is clean'],
    );
  });
});
