import { expect, type Page } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { test, type Ctx } from '@/__e2e__/test';
import { signInAsTestUser } from '@/__e2e__/session';
import { installBackend } from '@/modules/dashboard/__e2e__/fake-backend';
import { APP_ROUTER } from '@/shared/router/routes';

type Box = { x: number; y: number; width: number; height: number };

let resting: Box[];

const visibleNav = (page: Page) =>
  page
    .getByRole('navigation', { name: 'Nawigacja główna' })
    .locator('visible=true');

const linkBoxes = (page: Page): Promise<Box[]> =>
  visibleNav(page)
    .getByRole('link')
    .evaluateAll((links) =>
      links.map((l) => {
        const { x, y, width, height } = l.getBoundingClientRect();
        return { x, y, width, height };
      }),
    );

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
    await expect(
      visibleNav(page).getByRole('link', { name: 'Finanse' }),
    ).toHaveAttribute('aria-current', 'page');
    resting = await linkBoxes(page);
  },
  'i go to time': async ({ page }) => {
    await visibleNav(page).getByRole('link', { name: 'Czas' }).click();
    await expect(
      visibleNav(page).getByRole('link', { name: 'Czas' }),
    ).toHaveAttribute('aria-current', 'page');
  },
  'every nav item keeps its place and size': async ({ page }) => {
    await expect.poll(() => linkBoxes(page)).toEqual(resting);
  },
  'the highlight settles exactly under the current item': async ({ page }) => {
    const link = visibleNav(page).getByRole('link', { name: 'Czas' });
    const pill = visibleNav(page).locator('[data-e2e="app-nav:indicator"]');
    await expect
      .poll(async () => {
        const [a, b] = await Promise.all([
          link.boundingBox(),
          pill.boundingBox(),
        ]);
        return [a!.x - b!.x, a!.y - b!.y, a!.width - b!.width].map((n) =>
          Math.round(n),
        );
      })
      .toEqual([0, 0, 0]);
  },
} satisfies CommandRegistry<Ctx>;

for (const [name, viewport] of [
  ['narrow', { width: 390, height: 844 }],
  ['wide', { width: 1280, height: 800 }],
] as const) {
  test.describe(`on a ${name} screen`, () => {
    test.use({ viewport });

    test('navigating moves only the highlight', async ({ e2e }) => {
      await interpreter(commands, e2e)(
        ['i open the dashboard'],
        ['i go to time'],
        ['every nav item keeps its place and size'],
        ['the highlight settles exactly under the current item'],
      );
    });
  });
}
