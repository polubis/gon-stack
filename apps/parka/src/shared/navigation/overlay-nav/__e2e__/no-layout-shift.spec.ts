import { expect, type Page } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { test, type Ctx } from '@/__e2e__/test';
import { signInAsTestUser } from '@/__e2e__/session';
import { installBackend } from '@/modules/dashboard/__e2e__/fake-backend';
import { APP_ROUTER } from '@/shared/router/routes';

type Geometry = {
  columnHeight: number;
  scrollHeight: number;
  scrollTop: number;
  navHeight: number;
  /** Space between the bottom of the add button and the top of the nav. */
  buttonToNav: number;
  /** Space between the bottom of the add button and the screen bottom. */
  buttonToScreen: number;
};

/** Distance the add button had from the nav before the nav stopped moving the layout. */
const REST_BUTTON_TO_NAV = 20;
const VIEWPORT = { width: 390, height: 844 };

let resting: Geometry;

const geometry = (page: Page): Promise<Geometry> =>
  page.evaluate(() => {
    const nav = [...document.querySelectorAll('nav')].find(
      (n) => n.offsetParent !== null,
    )!;
    let slot = nav as Element;
    while (
      slot.parentElement &&
      ![...slot.parentElement.children].some(
        (c) => c !== slot && getComputedStyle(c).overflowY === 'auto',
      )
    )
      slot = slot.parentElement;
    const column = [...slot.parentElement!.children].find(
      (c) => getComputedStyle(c).overflowY === 'auto',
    )!;
    const button = document
      .querySelector('[data-e2e="dashboard:expense-fab"]')!
      .getBoundingClientRect();
    return {
      columnHeight: column.getBoundingClientRect().height,
      scrollHeight: column.scrollHeight,
      scrollTop: column.scrollTop,
      navHeight: (slot as HTMLElement).offsetHeight,
      buttonToNav: nav.getBoundingClientRect().top - button.bottom,
      buttonToScreen: window.innerHeight - button.bottom,
    };
  });

const layoutOf = ({
  columnHeight,
  scrollHeight,
  scrollTop,
  navHeight,
}: Geometry) => ({ columnHeight, scrollHeight, scrollTop, navHeight });

const commands = {
  'i open the dashboard': async ({ page, getByE2e }) => {
    await signInAsTestUser(page);
    await installBackend(page, {
      categories: [],
      expenses: [],
      limits: [],
      recurring: [],
    });
    await page.goto(APP_ROUTER.dashboard());
    await page.waitForLoadState('networkidle');
    await expect(getByE2e('dashboard:expense-fab')).toBeVisible();
    await page.waitForTimeout(500);
    resting = await geometry(page);
  },
  'i open the add menu': async ({ getByE2e }) => {
    await getByE2e('dashboard:expense-fab').click();
    await expect(getByE2e('dashboard:add-menu')).toBeVisible();
  },
  'i close the add menu': async ({ page, getByE2e }) => {
    await page.keyboard.press('Escape');
    await expect(getByE2e('dashboard:add-menu')).toHaveCount(0);
  },
  'the layout is unchanged': async ({ page }) => {
    await expect
      .poll(async () => layoutOf(await geometry(page)))
      .toEqual(layoutOf(resting));
  },
  'the add button rests at its usual distance from the nav': async ({
    page,
  }) => {
    expect(resting.buttonToNav).toBeCloseTo(REST_BUTTON_TO_NAV, 0);
    await expect
      .poll(async () => (await geometry(page)).buttonToNav)
      .toBeCloseTo(REST_BUTTON_TO_NAV, 0);
  },
  'the add button sits in the nav corner': async ({ page }) => {
    await expect
      .poll(async () => (await geometry(page)).buttonToScreen)
      .toBeLessThanOrEqual(REST_BUTTON_TO_NAV);
  },
} satisfies CommandRegistry<Ctx>;

test.describe('on a narrow screen', () => {
  test.use({ viewport: VIEWPORT });

  test('the add button rests close above the nav', async ({ e2e }) => {
    await interpreter(commands, e2e)(
      ['i open the dashboard'],
      ['the add button rests at its usual distance from the nav'],
    );
  });

  test('opening the add menu does not move the layout', async ({ e2e }) => {
    await interpreter(commands, e2e)(
      ['i open the dashboard'],
      ['i open the add menu'],
      ['the layout is unchanged'],
    );
  });

  test('the add button moves to the corner while the menu is open', async ({
    e2e,
  }) => {
    await interpreter(commands, e2e)(
      ['i open the dashboard'],
      ['i open the add menu'],
      ['the add button sits in the nav corner'],
    );
  });

  test('closing the add menu restores layout and button place', async ({
    e2e,
  }) => {
    await interpreter(commands, e2e)(
      ['i open the dashboard'],
      ['i open the add menu'],
      ['i close the add menu'],
      ['the layout is unchanged'],
      ['the add button rests at its usual distance from the nav'],
    );
  });
});
