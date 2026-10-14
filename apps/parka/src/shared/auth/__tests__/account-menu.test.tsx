import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { APP_ROUTER } from '@/shared/router/routes';
import { AccountMenu } from '../presentation/account-menu';
import { AuthProvider } from '../presentation/context';
import { SWITCH_TOAST_KEY } from '../configuration/constraints';

const ID_A = '0a0a0a0a-0a0a-4a0a-8a0a-0a0a0a0a0a0a';
const ID_B = '0b0b0b0b-0b0b-4b0b-8b0b-0b0b0b0b0b0b';

const server = setupServer();
const assign = vi.fn();

const backend = (switchStatus = 200) => {
  const switched: unknown[] = [];
  server.use(
    http.get('/api/auth/me/', () =>
      HttpResponse.json({
        code: 200,
        user: {
          id: ID_A,
          email: 'a@parka.test',
          displayName: null,
          avatarUrl: null,
        },
      }),
    ),
    http.get('/api/auth/accounts/', () =>
      HttpResponse.json({
        code: 200,
        activeId: ID_A,
        accounts: [
          { userId: ID_A, email: 'a@parka.test', avatarUrl: null },
          { userId: ID_B, email: 'b@parka.test', avatarUrl: null },
        ],
      }),
    ),
    http.post('/api/auth/switch/', async ({ request }) => {
      switched.push(await request.json());
      return HttpResponse.json(
        switchStatus === 200
          ? { code: 200, activeId: ID_B }
          : { code: 401, type: 'unauthorized', message: 'expired' },
      );
    }),
    http.post('/api/auth/logout/', () =>
      HttpResponse.json({ code: 200, location: '/sign-in/' }),
    ),
  );
  return switched;
};

const openMenu = async () => {
  render(
    <AuthProvider>
      <AccountMenu placement="side" />
    </AuthProvider>,
  );
  await userEvent.click(
    await screen.findByRole('button', { name: 'Konto: a@parka.test' }),
  );
};

describe('account menu', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  beforeAll(() => {
    vi.stubGlobal('location', { ...window.location, assign, reload: vi.fn() });
  });
  afterEach(() => {
    server.resetHandlers();
    assign.mockClear();
    window.sessionStorage.clear();
    window.localStorage.clear();
  });
  afterAll(() => {
    server.close();
    vi.unstubAllGlobals();
  });

  it('lists the signed-in accounts with the active one checked', async () => {
    backend();
    await openMenu();

    expect(
      await screen.findByRole('menuitemradio', { name: /a@parka.test/ }),
    ).toBeChecked();
    expect(
      screen.getByRole('menuitemradio', { name: /b@parka.test/ }),
    ).not.toBeChecked();
  });

  it('offers adding an account and signing out', async () => {
    backend();
    await openMenu();

    expect(
      await screen.findByRole('menuitem', { name: 'Dodaj konto' }),
    ).toHaveAttribute('href', '/sign-in/');
    expect(
      screen.getByRole('menuitem', { name: 'Wyloguj to konto' }),
    ).toBeVisible();
    expect(
      screen.getByRole('menuitem', { name: 'Wyloguj ze wszystkich' }),
    ).toBeVisible();
  });

  it('moves focus through the items with the arrow keys', async () => {
    backend();
    await openMenu();
    await screen.findByRole('menuitemradio', { name: /a@parka.test/ });

    await userEvent.keyboard('{ArrowDown}');

    expect(
      screen.getByRole('menuitemradio', { name: /b@parka.test/ }),
    ).toHaveFocus();
  });

  it('switches account and leaves a toast for the reloaded page', async () => {
    const switched = backend();
    await openMenu();

    await userEvent.click(
      await screen.findByRole('menuitemradio', { name: /b@parka.test/ }),
    );

    await waitFor(() =>
      expect(assign).toHaveBeenCalledWith(APP_ROUTER.dashboard()),
    );
    expect(switched).toEqual([{ userId: ID_B }]);
    expect(window.sessionStorage.getItem(SWITCH_TOAST_KEY)).toBe(
      'b@parka.test',
    );
  });

  it('reports a failed switch and stays on the current account', async () => {
    backend(401);
    await openMenu();

    await userEvent.click(
      await screen.findByRole('menuitemradio', { name: /b@parka.test/ }),
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Nie udało się przełączyć kontaACCOUNT_SWITCH_FAILED',
    );
    expect(assign).not.toHaveBeenCalled();
  });

  it('follows the server after signing out', async () => {
    backend();
    await openMenu();

    await userEvent.click(
      await screen.findByRole('menuitem', { name: 'Wyloguj to konto' }),
    );

    await waitFor(() => expect(assign).toHaveBeenCalledWith('/sign-in/'));
  });
});
