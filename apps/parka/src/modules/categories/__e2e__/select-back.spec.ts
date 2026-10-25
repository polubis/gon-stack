import { expect, type Page } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { test, type Ctx } from '@/__e2e__/test';
import { signInAsTestUser } from '@/__e2e__/session';
import { installBackend } from '@/modules/dashboard/__e2e__/fake-backend';
import { APP_ROUTER } from '@/shared/router/routes';
import { COLORS } from '../configuration/constraints';

const NEW_CATEGORY = `${APP_ROUTER.categories()}new/`;

const selects = (page: Page): string[] =>
  new URL(page.url()).searchParams
    .getAll('modal')
    .filter((id) => id.startsWith('select:'));

const openForm = async (page: Page, path: string): Promise<void> => {
  await signInAsTestUser(page);
  await installBackend(page, {
    categories: [],
    expenses: [],
    limits: [],
    recurring: [],
  });
  await page.goto(path);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(200);
};

const commands = {
  'i open the new category form': ({ page }) => openForm(page, NEW_CATEGORY),
  'i open the icon select': async ({ getByE2e }) => {
    await getByE2e('categories:form-icons').click();
  },
  'i press the browser Back button': async ({ page }) => {
    await page.goBack();
  },
  'i press Escape': async ({ page }) => {
    await page.keyboard.press('Escape');
  },
  'i click outside the select': async ({ page }) => {
    await page.mouse.click(5, 5);
  },
  'i pick the first color': async ({ getByE2e }) => {
    await getByE2e('categories:form-color').click();
    await getByE2e(`categories:form-color-option:${COLORS[1]}`).click();
  },

  'the select is a history entry': async ({ page }) => {
    expect(selects(page)).toHaveLength(1);
  },
  'the select is closed and the form stays': async ({ page, getByE2e }) => {
    await expect(getByE2e('categories:form-icon-search')).toHaveCount(0);
    await expect(getByE2e('categories:form-name')).toBeVisible();
    expect(selects(page)).toEqual([]);
    expect(new URL(page.url()).pathname).toBe(NEW_CATEGORY);
  },
  'focus is back on the select field': async ({ getByE2e }) => {
    await expect(getByE2e('categories:form-icons')).toBeFocused();
  },
  'the form is left by a second Back': async ({ page }) => {
    await page.goBack();
    await expect(page).toHaveURL(/\/app\/categories\/$/);
  },
  'the select stays out of the URL': async ({ page }) => {
    expect(selects(page)).toEqual([]);
  },
  'the select reopens after a reload': async ({ page, getByE2e }) => {
    await page.reload();
    await expect(getByE2e('categories:form-icon-search')).toBeVisible();
  },
} satisfies CommandRegistry<Ctx>;

test.describe('on a narrow screen', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('Back closes the select and stays on the form', async ({ e2e }) => {
    await interpreter(commands, e2e)(
      ['i open the new category form'],
      ['i open the icon select'],
      ['the select is a history entry'],
      ['i press the browser Back button'],
      ['the select is closed and the form stays'],
      ['focus is back on the select field'],
    );
  });

  test('a click outside, a choice and Esc close it without a double Back', async ({
    e2e,
  }) => {
    await interpreter(commands, e2e)(
      ['i open the new category form'],
      ['i open the icon select'],
      ['i click outside the select'],
      ['the select is closed and the form stays'],
      ['i pick the first color'],
      ['the select is closed and the form stays'],
      ['i open the icon select'],
      ['i press Escape'],
      ['the select is closed and the form stays'],
    );
  });

  test('a reload keeps the select open', async ({ e2e }) => {
    await interpreter(commands, e2e)(
      ['i open the new category form'],
      ['i open the icon select'],
      ['the select reopens after a reload'],
    );
  });
});

test.describe('on a wide screen', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('the select is a dropdown that does not touch history', async ({
    e2e,
  }) => {
    await interpreter(commands, e2e)(
      ['i open the new category form'],
      ['i open the icon select'],
      ['the select stays out of the URL'],
      ['i press Escape'],
      ['the select is closed and the form stays'],
    );
  });
});
