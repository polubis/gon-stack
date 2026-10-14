import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {
  readRemembered,
  writeRemembered,
} from '@/shared/form-memory/integration/storage';
import { logoutAccount } from '../integration/repository';
import { useAuth } from '../presentation/use-auth';

const ID_A = '0a0a0a0a-0a0a-4a0a-8a0a-0a0a0a0a0a0a';
const ID_B = '0b0b0b0b-0b0b-4b0b-8b0b-0b0b0b0b0b0b';

const server = setupServer();
const reload = vi.fn();
const unsubscribe = vi.fn(async () => true);

const signedInAs = (id: string) =>
  server.use(
    http.get('/api/auth/me/', () =>
      HttpResponse.json({
        code: 200,
        user: {
          id,
          email: `${id}@parka.test`,
          displayName: null,
          avatarUrl: null,
        },
      }),
    ),
  );

describe('account isolation on a shared browser', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  beforeAll(() => {
    vi.stubGlobal('location', { ...window.location, reload });
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        getRegistration: async () => ({
          pushManager: { getSubscription: async () => ({ unsubscribe }) },
        }),
      },
    });
  });
  beforeEach(() => window.localStorage.clear());
  afterEach(() => {
    server.resetHandlers();
    reload.mockClear();
    unsubscribe.mockClear();
  });
  afterAll(() => {
    server.close();
    vi.unstubAllGlobals();
  });

  it('keeps remembered fields and push for the same account', async () => {
    signedInAs(ID_A);
    const first = renderHook(() => useAuth());
    await waitFor(() =>
      expect(first.result.current.status).toBe('authenticated'),
    );
    first.unmount();
    writeRemembered('merchant', 'Sklep A');
    unsubscribe.mockClear();

    const second = renderHook(() => useAuth());
    await waitFor(() =>
      expect(second.result.current.status).toBe('authenticated'),
    );

    expect(readRemembered('merchant')).toBe('Sklep A');
    expect(unsubscribe).not.toHaveBeenCalled();
  });

  it('forgets remembered fields and push when another account signs in', async () => {
    signedInAs(ID_A);
    const first = renderHook(() => useAuth());
    await waitFor(() =>
      expect(first.result.current.status).toBe('authenticated'),
    );
    first.unmount();
    writeRemembered('merchant', 'Sklep A');
    unsubscribe.mockClear();

    signedInAs(ID_B);
    const second = renderHook(() => useAuth());
    await waitFor(() =>
      expect(second.result.current.status).toBe('authenticated'),
    );

    expect(readRemembered('merchant')).toBeNull();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it('forgets leftovers of an unknown previous session', async () => {
    writeRemembered('merchant', 'Sklep sprzed aktualizacji');
    signedInAs(ID_B);

    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.status).toBe('authenticated'));

    expect(readRemembered('merchant')).toBeNull();
  });

  it('reloads a tab that shows another account than the server reports', async () => {
    signedInAs(ID_A);
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.status).toBe('authenticated'));

    signedInAs(ID_B);
    document.dispatchEvent(new Event('visibilitychange'));

    await waitFor(() => expect(reload).toHaveBeenCalledTimes(1));
  });

  it('drops the push subscription when an account signs out', async () => {
    server.use(
      http.post('/api/auth/logout/', () =>
        HttpResponse.json({ code: 200, location: '/sign-in/' }),
      ),
    );

    await expect(logoutAccount('active')).resolves.toBe('/sign-in/');

    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it('keeps the push subscription when sign out fails', async () => {
    server.use(
      http.post('/api/auth/logout/', () =>
        HttpResponse.json({ code: 500, type: 'internal', message: 'boom' }),
      ),
    );

    await expect(logoutAccount('active')).rejects.toThrow();

    expect(unsubscribe).not.toHaveBeenCalled();
  });
});
