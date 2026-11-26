import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import type { UserId } from '../domain/models';
import {
  fetchAccounts,
  fetchAuth,
  logoutAccount,
  switchAccount,
} from '../integration/repository';

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const ada = 'user-ada' as UserId;

describe('auth repository', () => {
  it('maps the signed in user', async () => {
    server.use(
      http.get('/api/auth/me/', () =>
        HttpResponse.json({
          code: 200,
          user: {
            id: 'user-ada',
            email: 'ada@example.com',
            displayName: null,
            avatarUrl: null,
          },
        }),
      ),
    );

    await expect(fetchAuth()).resolves.toEqual({
      status: 'authenticated',
      user: {
        id: 'user-ada',
        email: 'ada@example.com',
        displayName: null,
        avatarUrl: null,
      },
    });
  });

  it('treats a rejected session as signed out', async () => {
    server.use(
      http.get('/api/auth/me/', () =>
        HttpResponse.json({ code: 401, message: 'No session' }),
      ),
    );

    await expect(fetchAuth()).resolves.toEqual({ status: 'unauthenticated' });
  });

  it('treats a network failure as signed out', async () => {
    server.use(http.get('/api/auth/me/', () => HttpResponse.error()));

    await expect(fetchAuth()).resolves.toEqual({ status: 'unauthenticated' });
  });

  it('lists the accounts of this browser', async () => {
    server.use(
      http.get('/api/auth/accounts/', () =>
        HttpResponse.json({
          code: 200,
          activeId: 'user-ada',
          accounts: [
            { userId: 'user-ada', email: 'ada@example.com', avatarUrl: null },
          ],
        }),
      ),
    );

    await expect(fetchAccounts()).resolves.toEqual({
      activeId: 'user-ada',
      items: [{ id: 'user-ada', email: 'ada@example.com', avatarUrl: null }],
    });
  });

  it('fails with the server message when accounts cannot be listed', async () => {
    server.use(
      http.get('/api/auth/accounts/', () =>
        HttpResponse.json({ code: 500, message: 'Boom' }),
      ),
    );

    await expect(fetchAccounts()).rejects.toThrow('Boom');
  });

  it('sends the chosen account when switching', async () => {
    let body: unknown;
    server.use(
      http.post('/api/auth/switch/', async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ code: 200 });
      }),
    );

    await switchAccount(ada);

    expect(body).toEqual({ userId: 'user-ada' });
  });

  it('fails with the server message when switching is refused', async () => {
    server.use(
      http.post('/api/auth/switch/', () =>
        HttpResponse.json({ code: 403, message: 'Not yours' }),
      ),
    );

    await expect(switchAccount(ada)).rejects.toThrow('Not yours');
  });

  it.each([
    ['active', {}],
    ['all', { all: true }],
    [ada, { userId: 'user-ada' }],
  ] as const)(
    'signs out %s with the matching request',
    async (target, expected) => {
      let body: unknown;
      server.use(
        http.post('/api/auth/logout/', async ({ request }) => {
          body = await request.json();
          return HttpResponse.json({ code: 200, location: '/sign-in/' });
        }),
      );

      await expect(logoutAccount(target)).resolves.toBe('/sign-in/');

      expect(body).toEqual(expected);
    },
  );

  it('fails with the server message when sign out is refused', async () => {
    server.use(
      http.post('/api/auth/logout/', () =>
        HttpResponse.json({ code: 500, message: 'Try later' }),
      ),
    );

    await expect(logoutAccount('active')).rejects.toThrow('Try later');
  });
});
