import { createHmac } from 'node:crypto';
import { expect, type Page } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { test, type Ctx } from '@/__e2e__/test';
import { registerAndConfirm } from '@/__e2e__/mailbox';
import { API_ROUTER } from '@/shared/router/routes';

/**
 * VYB-242: PostgREST refuses a token issued ahead of its own clock
 * (`PGRST303 JWT issued at future`). Runs against the real local Supabase
 * (GoTrue, PostgREST, Postgres) through the built worker: a real account is
 * registered, then its session cookie is re-signed with a future `iat`.
 */

const EMAIL = `e2e-skew-${Date.now()}@parka.test`;
const PASSWORD = 'secret123';
/** Public demo secret every local Supabase signs its tokens with. */
const JWT_SECRET = 'super-secret-jwt-token-with-at-least-32-characters-long';
const AHEAD_SECONDS = 3600;
const ACCOUNT_COOKIE = /^parka-acct\.[0-9a-f-]{36}(\.\d+)?$/;
const ENCODING_PREFIX = 'base64-';

const encode = (value: object) =>
  Buffer.from(JSON.stringify(value)).toString('base64url');

const tokenIssuedAhead = (userId: string, aheadSeconds: number): string => {
  const now = Math.floor(Date.now() / 1000);
  const head = encode({ alg: 'HS256', typ: 'JWT' });
  const body = encode({
    iss: 'supabase-demo',
    role: 'authenticated',
    aud: 'authenticated',
    sub: userId,
    iat: now + aheadSeconds,
    exp: now + 3600,
  });
  const sign = createHmac('sha256', JWT_SECRET)
    .update(`${head}.${body}`)
    .digest('base64url');
  return `${head}.${body}.${sign}`;
};

/** Swaps the access token inside the signed-in account's session cookie. */
const reissueSessionAhead = async (page: Page): Promise<void> => {
  const context = page.context();
  const cookies = (await context.cookies()).filter(({ name }) =>
    ACCOUNT_COOKIE.test(name),
  );
  expect(cookies, 'session fits one cookie').toHaveLength(1);

  const cookie = cookies[0]!;
  const session = JSON.parse(
    Buffer.from(
      cookie.value.slice(ENCODING_PREFIX.length),
      'base64url',
    ).toString('utf8'),
  ) as { access_token: string; user: { id: string } };
  session.access_token = tokenIssuedAhead(session.user.id, AHEAD_SECONDS);

  await context.addCookies([
    { ...cookie, value: `${ENCODING_PREFIX}${encode(session)}` },
  ]);
};

const commands = {
  'i register and sign in': async (ctx) => {
    await registerAndConfirm(ctx, EMAIL, PASSWORD);
  },

  'my recurring rules load': async ({ page }) => {
    const res = await page.request.get(API_ROUTER.recurring({ tz: 'UTC' }));
    expect(res.status()).toBe(200);
    expect((await res.json()).data).toEqual([]);
  },
  'my session token is issued ahead of the database clock': async ({
    page,
  }) => {
    await reissueSessionAhead(page);
  },
  'my recurring rules are refused as unauthorized, not a server error': async ({
    page,
  }) => {
    const res = await page.request.get(API_ROUTER.recurring({ tz: 'UTC' }));
    expect(res.status()).toBe(401);
    expect(await res.json()).toEqual({
      code: 401,
      type: 'unauthorized',
      message: 'Session expired. Sign in again',
    });
  },
} satisfies CommandRegistry<Ctx>;

test('A token issued ahead of the database clock is unauthorized', async ({
  e2e,
}) => {
  await interpreter(commands, e2e)(
    ['i register and sign in'],
    ['my recurring rules load'],
    ['my session token is issued ahead of the database clock'],
    ['my recurring rules are refused as unauthorized, not a server error'],
  );
});
