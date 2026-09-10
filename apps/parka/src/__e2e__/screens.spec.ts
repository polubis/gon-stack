import { expect, test } from '@playwright/test';
import { expectNoA11yViolations } from './axe';

type Screen = { path: string; root: string; heading: RegExp };

const SCREENS: Screen[] = [
  { path: '/', root: 'home:main', heading: /Parka/ },
  { path: '/sign-in/', root: 'auth:main', heading: /Witaj ponownie/ },
  { path: '/sign-up/', root: 'auth:main', heading: /Załóż konto/ },
  { path: '/dashboard/', root: 'dashboard:main', heading: /Anna/ },
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

for (const screen of SCREENS) {
  test(`${screen.path} renders and has no WCAG violations`, async ({
    page,
  }) => {
    await page.goto(screen.path);
    await expect(page.getByTestId(screen.root)).toBeVisible();
    await expect(
      page.getByRole('heading', { name: screen.heading }).first(),
    ).toBeVisible();
    await expectNoA11yViolations(page);
  });
}
