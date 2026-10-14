import type { Page } from '@playwright/test';

const USER = {
  id: '00000000-0000-4000-8000-000000000001',
  email: 'e2e@parka.test',
  displayName: null,
  avatarUrl: null,
};

const signedIn = new WeakSet<Page>();

/**
 * Gives the page a signed-in session without a backend: the browser holds no
 * tokens, so it only needs the server answers about who is signed in. Stubs
 * `GET /api/auth/me/` and `GET /api/auth/accounts/`, so `/app/*` routes render
 * instead of showing the protected screen.
 */
export const signInAsTestUser = async (page: Page): Promise<void> => {
  if (signedIn.has(page)) return;
  signedIn.add(page);
  await page.route('**/api/auth/me/', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ code: 200, user: USER }),
    }),
  );
  await page.route('**/api/auth/accounts/', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 200,
        activeId: USER.id,
        accounts: [
          { userId: USER.id, email: USER.email, avatarUrl: USER.avatarUrl },
        ],
      }),
    }),
  );
};
