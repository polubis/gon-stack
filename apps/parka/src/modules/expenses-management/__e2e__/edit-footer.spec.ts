import { expect } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { test, type Ctx } from '@/__e2e__/test';
import { signInAsTestUser } from '@/__e2e__/session';
import { APP_ROUTER } from '@/shared/router/routes';
import {
  installBackend,
  type Seed,
} from '@/modules/dashboard/__e2e__/fake-backend';

const FOOD = { id: 'cat-1', name: 'Spożywcze', icon: 'cart', color: '#0f7a4f' };
const items = Array.from({ length: 12 }, (_, i) => ({
  id: `p-${i}`,
  name: `Produkt ${i}`,
  unitPrice: 5,
  quantity: 1,
  discount: 0,
  categoryId: FOOD.id,
}));
const SEED: Seed = {
  categories: [FOOD],
  expenses: [
    {
      id: 'e-1',
      merchant: 'Sklep',
      date: new Date().toISOString(),
      amount: 60,
      categoryId: FOOD.id,
      items,
    },
  ],
  limits: [],
  recurring: [],
};

const commands = {
  'i open a long expense for editing on a phone': async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 700 });
    await signInAsTestUser(page);
    await installBackend(page, SEED);
    await page.goto(APP_ROUTER.expenseEdit({ id: 'e-1' }));
    await page.waitForLoadState('networkidle');
  },
  'the save and cancel buttons stay at the bottom of the popup': async ({
    getByE2e,
    page,
  }) => {
    const modal = getByE2e('expenses-management:modal');
    const save = getByE2e('expense-form:save');
    await expect(save).toBeVisible();
    const gap = async () =>
      modal.evaluate((el, s) => {
        const b = document.querySelector(s)!.getBoundingClientRect();
        return Math.round(el.getBoundingClientRect().bottom - b.bottom);
      }, '[data-e2e="expense-form:save"]');
    await expect(modal).toBeVisible();
    // Footer sits at the frame bottom both at the top and after scrolling.
    expect(await gap()).toBeLessThan(40);
    await modal.evaluate((el) => el.scrollTo(0, el.scrollHeight / 2));
    await page.waitForTimeout(100);
    expect(await gap()).toBeLessThan(40);
    await modal.evaluate((el) => el.scrollTo(0, el.scrollHeight));
    await page.waitForTimeout(100);
    expect(await gap()).toBeLessThan(40);
    await expect(save).toBeInViewport();
    // Cancel and save share one row, saved action flush right.
    const cancel = page.getByRole('link', { name: 'Anuluj' });
    const [c, v, m] = await Promise.all([
      cancel.boundingBox(),
      save.boundingBox(),
      modal.boundingBox(),
    ]);
    expect(Math.abs(c!.y - v!.y)).toBeLessThan(8);
    expect(c!.x).toBeLessThan(v!.x);
    expect(m!.x + m!.width - (v!.x + v!.width)).toBeLessThan(40);
  },
} satisfies CommandRegistry<Ctx>;

test('edit expense popup keeps its buttons sticky at the bottom', async ({
  e2e,
}) => {
  await interpreter(commands, e2e)(
    ['i open a long expense for editing on a phone'],
    ['the save and cancel buttons stay at the bottom of the popup'],
  );
});
