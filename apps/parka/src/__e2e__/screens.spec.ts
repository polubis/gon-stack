import { expect } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { test, type Ctx } from './test';
import { API_ROUTER, APP_ROUTER } from '@/shared/router/routes';
import { expectNoA11yViolations } from './axe';
import { signInAsTestUser } from './session';
import type { E2eId } from './selectors';

type Screen = { path: string; root: E2eId; heading: RegExp };

const SCREENS: Screen[] = [
  { path: APP_ROUTER.home(), root: 'home:main', heading: /Parka/ },
  { path: APP_ROUTER.signIn(), root: 'auth:main', heading: /Witaj ponownie/ },
  { path: APP_ROUTER.signUp(), root: 'auth:main', heading: /Załóż konto/ },
  { path: APP_ROUTER.dashboard(), root: 'dashboard:main', heading: /Cześć/ },
  {
    path: APP_ROUTER.dashboard(),
    root: 'dashboard:limits',
    heading: /Limity/,
  },
  {
    path: APP_ROUTER.dashboard(),
    root: 'dashboard:goals',
    heading: /Cele/,
  },
  {
    path: APP_ROUTER.dashboard(),
    root: 'dashboard:recurring',
    heading: /Wydatki cykliczne/,
  },
  {
    path: APP_ROUTER.receiptScan(),
    root: 'receipt:main',
    heading: /Zrób zdjęcie paragonu/,
  },
  { path: APP_ROUTER.reports(), root: 'reports:main', heading: /Raport/ },
  {
    path: APP_ROUTER.notifications(),
    root: 'notifications:main',
    heading: /Powiadomienia/,
  },
  { path: APP_ROUTER.settings(), root: 'settings:main', heading: /Ustawienia/ },
  {
    path: APP_ROUTER.categories(),
    root: 'categories:main',
    heading: /Kategorie/,
  },
  {
    path: APP_ROUTER.privacy(),
    root: 'privacy:main',
    heading: /RODO \/ Prywatność/,
  },
  {
    path: APP_ROUTER.aiInfo(),
    root: 'ai-info:main',
    heading: /AI — jak to działa/,
  },
  {
    path: APP_ROUTER.dataExport(),
    root: 'data-export:main',
    heading: /Eksport danych/,
  },
];

const commands = {
  'i mock the dashboard': async ({ page }) => {
    // The dashboard loads every list together with the summary.
    for (const url of [
      API_ROUTER.expenses(),
      API_ROUTER.categories(),
      API_ROUTER.limits(),
      API_ROUTER.goals(),
      API_ROUTER.recurring(),
    ])
      await page.route(`**${url}**`, (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ code: 200, data: [] }),
        }),
      );
    // Dashboard is backend-only (see modules/dashboard/AGENTS.md) — stub the
    // response so the a11y check doesn't depend on an authenticated session.
    await page.route(
      `**${API_ROUTER.dashboard({ month: '' })}**`,
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 200,
            data: {
              total: 0,
              change: 0,
              previousTotal: 0,
              userName: 'Anna',
              transactions: 0,
              dailyAverage: 0,
              daily: [],
              previousDaily: [],
              monthlyLimit: null,
              categories: [],
            },
          }),
        });
      },
    );
  },
  'the screen renders with no wcag violations': async (
    { page, getByE2e }: Ctx,
    screen: Screen,
  ) => {
    if (screen.path.startsWith(APP_ROUTER.dashboard()))
      await signInAsTestUser(page);
    await page.goto(screen.path);
    await expect(getByE2e(screen.root)).toBeVisible();
    await expect(
      page.getByRole('heading', { name: screen.heading }).first(),
    ).toBeVisible();
    await expectNoA11yViolations(page);
  },
} satisfies CommandRegistry<Ctx>;

for (const screen of SCREENS) {
  test(`${screen.path} ${screen.root} renders and has no WCAG violations`, async ({
    e2e,
  }) => {
    const run = interpreter(commands, e2e);
    if (screen.path === APP_ROUTER.dashboard())
      await run(['i mock the dashboard']);
    await run(['the screen renders with no wcag violations', screen]);
  });
}
