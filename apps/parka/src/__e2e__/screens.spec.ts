import { expect, test, type Page } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { expectNoA11yViolations } from './axe';

type Screen = { path: string; root: string; heading: RegExp };

const SCREENS: Screen[] = [
  { path: '/', root: 'home:main', heading: /Parka/ },
  { path: '/sign-in/', root: 'auth:main', heading: /Witaj ponownie/ },
  { path: '/sign-up/', root: 'auth:main', heading: /Załóż konto/ },
  { path: '/dashboard/', root: 'dashboard:main', heading: /Cześć/ },
  {
    path: '/receipt-scan/',
    root: 'receipt:main',
    heading: /Zrób zdjęcie paragonu/,
  },
  { path: '/expenses/', root: 'expenses:main', heading: /Wydatki/ },
  { path: '/statistics/', root: 'statistics:main', heading: /Statystyki/ },
  { path: '/limits/', root: 'limits:main', heading: /Limity i cele/ },
  { path: '/recurring/', root: 'recurring:main', heading: /Wydatki cykliczne/ },
  { path: '/reports/', root: 'reports:main', heading: /Raport/ },
  {
    path: '/notifications/',
    root: 'notifications:main',
    heading: /Powiadomienia/,
  },
  { path: '/settings/', root: 'settings:main', heading: /Ustawienia/ },
  { path: '/categories/', root: 'categories:main', heading: /Kategorie/ },
  { path: '/privacy/', root: 'privacy:main', heading: /RODO \/ Prywatność/ },
  { path: '/ai-info/', root: 'ai-info:main', heading: /AI — jak to działa/ },
  {
    path: '/data-export/',
    root: 'data-export:main',
    heading: /Eksport danych/,
  },
];

const commands = {
  'i mock the dashboard': async (page) => {
    // Dashboard is backend-only (see modules/dashboard/AGENTS.md) — stub the
    // response so the a11y check doesn't depend on an authenticated session.
    await page.route('**/api/dashboard/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          data: { total: 0, change: 0, trend: [], categories: [] },
        }),
      });
    });
  },
  'the screen renders with no wcag violations': async (
    page: Page,
    screen: Screen,
  ) => {
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
    if (screen.path === '/dashboard/') await run(['i mock the dashboard']);
    await run(['the screen renders with no wcag violations', screen]);
  });
}
