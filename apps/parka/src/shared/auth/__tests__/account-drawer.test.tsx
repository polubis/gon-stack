import { render, screen, waitFor, within } from '@testing-library/react';
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
import { Provider as OverlayNavProvider } from '@/shared/navigation/overlay-nav/presentation/context';
import { NavSlot } from '@/shared/navigation/overlay-nav/presentation/nav-slot';
import { AccountDrawer } from '../presentation/account-drawer';
import { AccountMenu } from '../presentation/account-menu';
import { setProfileSummary } from '../presentation/profile-summary';
import { AuthProvider } from '../presentation/context';
import { SWITCH_TOAST_KEY } from '../configuration/constraints';

const ID_A = '0a0a0a0a-0a0a-4a0a-8a0a-0a0a0a0a0a0a';
const ID_B = '0b0b0b0b-0b0b-4b0b-8b0b-0b0b0b0b0b0b';

const server = setupServer();
const assign = vi.fn();

const backend = (switchStatus = 200, avatarUrl: string | null = null) => {
  const switched: unknown[] = [];
  server.use(
    http.get('/api/auth/me/', () =>
      HttpResponse.json({
        code: 200,
        user: {
          id: ID_A,
          email: 'a@parka.test',
          displayName: 'Ada',
          avatarUrl,
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
      <AccountDrawer />
    </AuthProvider>,
  );
  await userEvent.click(
    await screen.findByRole('button', { name: 'Konto: a@parka.test' }),
  );
};

describe('account drawer', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  beforeAll(() => {
    const real = window.location;
    // Live getters: the modal stack reads the URL through `window.location`.
    vi.stubGlobal('location', {
      get href() {
        return real.href;
      },
      get origin() {
        return real.origin;
      },
      get pathname() {
        return real.pathname;
      },
      get search() {
        return real.search;
      },
      get hash() {
        return real.hash;
      },
      assign,
      reload: vi.fn(),
    });
  });
  afterEach(() => {
    window.history.replaceState(null, '', '/app/');
    setProfileSummary({ name: null, avatarUrl: null });
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
      await screen.findByRole('radio', { name: /a@parka.test/ }),
    ).toBeChecked();
    expect(
      screen.getByRole('radio', { name: /b@parka.test/ }),
    ).not.toBeChecked();
  });

  it('offers adding an account and signing out', async () => {
    backend();
    await openMenu();

    expect(
      await screen.findByRole('link', { name: 'Dodaj konto' }),
    ).toHaveAttribute('href', '/sign-in/');
    expect(
      screen.getByRole('button', { name: 'Wyloguj to konto' }),
    ).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Wyloguj ze wszystkich' }),
    ).toBeVisible();
  });

  it('opens a drawer with the user name, email and an edit button', async () => {
    backend();
    await openMenu();

    const drawer = await screen.findByRole('dialog', { name: 'Ada' });
    expect(drawer).toHaveTextContent('a@parka.test');
    expect(
      within(drawer).getByRole('button', { name: 'Edytuj profil' }),
    ).toBeVisible();
    expect(window.location.search).toBe('?modal=account');
  });

  it('shows the profile name once it is set', async () => {
    backend();
    setProfileSummary({ name: 'Ada Lovelace' });
    await openMenu();

    expect(
      await screen.findByRole('dialog', { name: 'Ada Lovelace' }),
    ).toBeVisible();
  });

  it('starts editing the profile on top of the drawer', async () => {
    backend();
    await openMenu();

    await userEvent.click(
      await screen.findByRole('button', { name: 'Edytuj profil' }),
    );

    expect(window.location.search).toBe('?modal=account&modal=profile');
    expect(screen.getByRole('dialog', { name: 'Ada' })).toBeInTheDocument();
  });

  it('closes on Escape', async () => {
    backend();
    await openMenu();
    await screen.findByRole('dialog', { name: 'Ada' });

    await userEvent.keyboard('{Escape}');

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('closes on browser Back like a modal', async () => {
    backend();
    await openMenu();
    await screen.findByRole('dialog', { name: 'Ada' });

    window.history.back();

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(window.location.search).toBe('');
  });

  it('reopens from a deep link', async () => {
    backend();
    window.history.replaceState(null, '', '/app/?modal=account');
    render(
      <AuthProvider>
        <AccountDrawer />
      </AuthProvider>,
    );

    expect(await screen.findByRole('dialog', { name: 'Ada' })).toBeVisible();
  });

  it('shows the picture in the nav button once one is set', async () => {
    backend(200, 'http://cdn/me.webp');
    render(
      <AuthProvider>
        <AccountMenu placement="bottom" />
      </AuthProvider>,
    );

    const button = await screen.findByRole('button', {
      name: 'Konto: a@parka.test',
    });
    await waitFor(() =>
      expect(button.querySelector('img')).toHaveAttribute(
        'src',
        'http://cdn/me.webp',
      ),
    );
  });

  it('shows the default icon in the nav button without a picture', async () => {
    backend();
    render(
      <AuthProvider>
        <AccountMenu placement="bottom" />
      </AuthProvider>,
    );

    const button = await screen.findByRole('button', {
      name: 'Konto: a@parka.test',
    });
    expect(button.querySelector('img')).toBeNull();
    expect(button.querySelector('svg')).not.toBeNull();
  });

  it('hides the bottom nav while the drawer is open', async () => {
    backend();
    render(
      <AuthProvider>
        <OverlayNavProvider>
          <NavSlot placement="bottom">
            <nav aria-label="Nawigacja dolna">
              <AccountMenu placement="bottom" />
            </nav>
          </NavSlot>
          <AccountDrawer />
        </OverlayNavProvider>
      </AuthProvider>,
    );
    await userEvent.click(
      await screen.findByRole('button', { name: 'Konto: a@parka.test' }),
    );
    await screen.findByRole('dialog', { name: 'Ada' });

    await waitFor(() =>
      expect(
        screen.queryByRole('navigation', { name: 'Nawigacja dolna' }),
      ).toBeNull(),
    );
  });

  it('switches account and leaves a toast for the reloaded page', async () => {
    const switched = backend();
    await openMenu();

    await userEvent.click(
      await screen.findByRole('radio', { name: /b@parka.test/ }),
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
      await screen.findByRole('radio', { name: /b@parka.test/ }),
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
      await screen.findByRole('button', { name: 'Wyloguj to konto' }),
    );

    await waitFor(() => expect(assign).toHaveBeenCalledWith('/sign-in/'));
  });
});
