import { expect } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { test, type Ctx } from '@/__e2e__/test';
import { signInAsTestUser } from '@/__e2e__/session';
import {
  installBackend,
  type Seed,
} from '@/modules/dashboard/__e2e__/fake-backend';
import { APP_ROUTER } from '@/shared/router/routes';

const SEED: Seed = {
  categories: [
    { id: 'cat-1', name: 'Spożywcze', icon: 'cart', color: '#0f7a4f' },
    { id: 'cat-2', name: 'Rozrywka', icon: 'film', color: '#a02fa0' },
  ],
  expenses: [],
  limits: [],
  recurring: [],
};

/** Mimics in-browser page translation: text nodes, now and later, get wrapped in a `<font>`. */
const translate = (): void => {
  const wrap = (root: Node): void => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes: Text[] = [];
    while (walker.nextNode()) nodes.push(walker.currentNode as Text);
    for (const node of nodes) {
      if (!node.data.trim() || node.parentElement?.tagName === 'FONT') continue;
      const font = document.createElement('font');
      node.replaceWith(font);
      font.append(node);
    }
  };
  wrap(document.body);
  new MutationObserver((records) => {
    for (const record of records) record.addedNodes.forEach(wrap);
  }).observe(document.body, { childList: true, subtree: true });
};

const commands = {
  'i open the page for adding an expense': async ({ page }) => {
    await signInAsTestUser(page);
    await installBackend(page, SEED);
    await page.goto(APP_ROUTER.newExpense());
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(200);
  },
  'my browser translates the page': async ({ page }) => {
    await page.evaluate(translate);
  },
  'i pick the category "Rozrywka"': async ({ getByE2e, page }) => {
    await getByE2e('expense-form:category').click();
    await page.getByRole('option', { name: 'Rozrywka' }).click();
  },
  'i pick the category "Spożywcze"': async ({ getByE2e, page }) => {
    await getByE2e('expense-form:category').click();
    await page.getByRole('option', { name: 'Spożywcze' }).click();
  },
  'the form is still usable with category "Spożywcze"': async ({
    getByE2e,
    page,
  }) => {
    await expect(getByE2e('expense-form:form')).toBeVisible();
    await expect(getByE2e('expense-form:category')).toContainText('Spożywcze');
    await expect(
      page.getByRole('button', { name: 'Spróbuj ponownie' }),
    ).toHaveCount(0);
  },
  'the form is still usable with category "Rozrywka"': async ({
    getByE2e,
    page,
  }) => {
    await expect(getByE2e('expense-form:form')).toBeVisible();
    await expect(getByE2e('expense-form:category')).toContainText('Rozrywka');
    await expect(
      page.getByRole('button', { name: 'Spróbuj ponownie' }),
    ).toHaveCount(0);
  },
} satisfies CommandRegistry<Ctx>;

test.describe('adding an expense on a translated page', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('picking a category keeps the form working', async ({ e2e }) => {
    await interpreter(commands, e2e)(
      ['i open the page for adding an expense'],
      ['my browser translates the page'],
      ['i pick the category "Rozrywka"'],
      ['the form is still usable with category "Rozrywka"'],
      ['i pick the category "Spożywcze"'],
      ['the form is still usable with category "Spożywcze"'],
    );
  });
});
