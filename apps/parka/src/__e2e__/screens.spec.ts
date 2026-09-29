import { expect, test, type Page } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { API_ROUTER, APP_ROUTER } from '@/shared/router';
import { expectNoA11yViolations } from './axe';
import { signInAsTestUser } from './session';

type Screen = { path: string; root: string; heading: RegExp };

const SCREENS: Screen[] = [
  { path: APP_ROUTER.home(), root: 'home:main', heading: /Parka/ },
  { path: APP_ROUTER.signIn(), root: 'auth:main', heading: /Witaj ponownie/ },
  { path: APP_ROUTER.signUp(), root: 'auth:main', heading: /Załóż konto/ },
  { path: APP_ROUTER.dashboard(), root: 'dashboard:main', heading: /Cześć/ },
  {
    path: APP_ROUTER.receiptScan(),
    root: 'receipt:main',
    heading: /Zrób zdjęcie paragonu/,
  },
  { path: APP_ROUTER.expenses(), root: 'expenses:main', heading: /Wydatki/ },
  {
    path: APP_ROUTER.statistics(),
    root: 'statistics:main',
    heading: /Statystyki/,
  },
  { path: APP_ROUTER.limits(), root: 'limits:main', heading: /Limity i cele/ },
  {
    path: APP_ROUTER.recurring(),
    root: 'recurring:main',
    heading: /Wydatki cykliczne/,
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
  'i mock the dashboard': async (page) => {
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
            data: { total: 0, change: 0, trend: [], categories: [] },
          }),
        });
      },
    );
  },
  'the screen renders with no wcag violations': async (
    page: Page,
    screen: Screen,
  ) => {
    if (screen.path.startsWith(APP_ROUTER.dashboard()))
      await signInAsTestUser(page);
    await page.goto(screen.path);
    await expect(page.getByTestId(screen.root)).toBeVisible();
    await expect(
      page.getByRole('heading', { name: screen.heading }).first(),
    ).toBeVisible();
    await expectNoA11yViolations(page);
  },
} satisfies CommandRegistry<Page>;

for (const screen of SCREENS) {
  test(`${screen.path} renders and has no WCAG violations`, async ({
    page,
  }) => {
    const run = interpreter(commands, page);
    if (screen.path === APP_ROUTER.dashboard())
      await run(['i mock the dashboard']);
    await run(['the screen renders with no wcag violations', screen]);
  });
}
