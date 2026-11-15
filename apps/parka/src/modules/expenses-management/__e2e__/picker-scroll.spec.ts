import { expect, type Locator, type Page } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { test, type Ctx } from '@/__e2e__/test';
import { signInAsTestUser } from '@/__e2e__/session';
import {
  installBackend,
  type Seed,
} from '@/modules/dashboard/__e2e__/fake-backend';
import { APP_ROUTER } from '@/shared/router/routes';

const SEED: Seed = {
  categories: Array.from({ length: 30 }, (_, i) => ({
    id: `cat-${i + 1}`,
    name: `Kategoria ${i + 1}`,
    icon: 'cart',
    color: '#0f7a4f',
  })),
  expenses: [],
  limits: [],
  recurring: [],
  suggestions: Array.from({ length: 30 }, (_, i) => ({
    field: 'paymentMethod' as const,
    value: `Metoda ${i + 1}`,
    useCount: 1,
    lastUsed: null,
  })),
};

/** Nearest scrollable ancestor of an element inside a dialog. */
const scrollerOf = (el: Locator) =>
  el.evaluateHandle((node) => {
    for (let p = node.parentElement; p; p = p.parentElement) {
      if (/auto|scroll/.test(getComputedStyle(p).overflowY)) return p;
    }
    return document.scrollingElement!;
  });

/** Scrolls over the element, like a thumb on a phone. */
const scrollDown = async (page: Page, target: Locator): Promise<void> => {
  const box = (await target.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.wheel(0, 300);
};

const scrolledDown = async (page: Page, last: Locator): Promise<void> => {
  const first = page.getByRole('option').first();
  const scroller = await scrollerOf(first);
  const before = await scroller.evaluate((el) => el.scrollTop);
  await scrollDown(page, first);
  await expect
    .poll(() => scroller.evaluate((el) => (el as Element).scrollTop))
    .toBeGreaterThan(before);
  await last.scrollIntoViewIfNeeded();
  await expect(last).toBeInViewport();
};

const commands = {
  'i open the page for adding an expense': async ({ page }) => {
    await signInAsTestUser(page);
    await installBackend(page, SEED);
    await page.goto(APP_ROUTER.newExpense());
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(200);
  },
  'i open the category select': async ({ getByE2e }) => {
    await getByE2e('expense-form:category').click();
  },
  'i open the payment method suggestions': async ({ getByE2e }) => {
    await getByE2e('form-memory:toggle:paymentMethod').click();
  },
  'the category list scrolls by thumb': async ({ page }) => {
    await scrolledDown(page, page.getByRole('option').last());
  },
  'the payment method list scrolls by thumb': async ({ page }) => {
    await scrolledDown(page, page.getByRole('option').last());
  },
} satisfies CommandRegistry<Ctx>;

test.describe('long pickers on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('the category list can be scrolled', async ({ e2e }) => {
    await interpreter(commands, e2e)(
      ['i open the page for adding an expense'],
      ['i open the category select'],
      ['the category list scrolls by thumb'],
    );
  });

  test('the payment method list can be scrolled', async ({ e2e }) => {
    await interpreter(commands, e2e)(
      ['i open the page for adding an expense'],
      ['i open the payment method suggestions'],
      ['the payment method list scrolls by thumb'],
    );
  });
});
