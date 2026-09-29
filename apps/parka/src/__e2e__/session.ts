import type { Page } from '@playwright/test';

const SUPABASE_URL =
  process.env.PUBLIC_PARKA_SUPABASE_URL ?? 'http://localhost:54321';

const base64url = (value: string): string =>
  Buffer.from(value).toString('base64url');

const USER = {
  id: '00000000-0000-4000-8000-000000000001',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'e2e@parka.test',
  app_metadata: {},
  user_metadata: {},
  created_at: '2025-01-01T00:00:00Z',
};

const EXPIRES_AT = 4_102_444_800;

const session = () => ({
  access_token: [
    base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' })),
    base64url(JSON.stringify({ sub: USER.id, exp: EXPIRES_AT })),
    'e2e',
  ].join('.'),
  refresh_token: 'e2e-refresh',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: EXPIRES_AT,
  user: USER,
});

const signedIn = new WeakSet<Page>();

/**
 * Gives the page a signed-in Supabase browser session without a backend:
 * seeds the auth cookie the client reads and stubs the user lookup the
 * `AuthGuard` performs, so `/app/*` routes render instead of redirecting.
 */
export const signInAsTestUser = async (page: Page): Promise<void> => {
  if (signedIn.has(page)) return;
  signedIn.add(page);
  const projectRef = new URL(SUPABASE_URL).hostname.split('.')[0];
  await page.context().addCookies([
    {
      name: `sb-${projectRef}-auth-token`,
      value: `base64-${base64url(JSON.stringify(session()))}`,
      domain: new URL(SUPABASE_URL).hostname,
      path: '/',
    },
  ]);
  await page.route(`${SUPABASE_URL}/auth/v1/user`, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(USER),
    }),
  );
};
