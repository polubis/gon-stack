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
import { Main } from '../presentation/main';

const navigateTo = vi.hoisted(() => vi.fn());

vi.mock('@/shared/router/navigation', async (importActual) => ({
  ...(await importActual<typeof import('@/shared/router/navigation')>()),
  navigateTo,
}));

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  navigateTo.mockClear();
});
afterAll(() => server.close());

const login = (respond: () => Response | Promise<Response>) =>
  server.use(http.post('/api/auth/login/', respond));

const redirect = () =>
  new HttpResponse(null, { status: 302, headers: { Location: '/app/' } });

const rejection = (message: string) =>
  HttpResponse.json({ code: 400, type: 'bad-request', message });

describe('sign in view', () => {
  it('offers links to sign up and password recovery', () => {
    render(<Main />);

    expect(
      screen.getByRole('link', { name: 'Zarejestruj się' }),
    ).toHaveAttribute('href', '/sign-up/');
    expect(
      screen.getByRole('link', { name: 'Nie pamiętasz hasła?' }),
    ).toBeVisible();
  });

  it('keeps social sign in disabled as coming soon', () => {
    render(<Main />);

    expect(
      screen.getByRole('button', { name: /Zaloguj przez Google/ }),
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: /Zaloguj przez Apple/ }),
    ).toBeDisabled();
  });

  it('clears the email and refocuses it on the clear button', async () => {
    const user = userEvent.setup();
    render(<Main />);
    const email = screen.getByLabelText('E-mail');
    await user.type(email, 'a@b.co');

    await user.click(screen.getByRole('button', { name: 'Wyczyść: E-mail' }));

    expect(email).toHaveValue('');
    expect(email).toHaveFocus();
  });

  it('shows the clear button only when the password has a value', async () => {
    const user = userEvent.setup();
    render(<Main />);
    expect(
      screen.queryByRole('button', { name: 'Wyczyść: Hasło' }),
    ).not.toBeInTheDocument();

    await user.type(screen.getByLabelText('Hasło'), 'secret1');

    expect(
      screen.getByRole('button', { name: 'Wyczyść: Hasło' }),
    ).toBeVisible();
  });

  it('disables the submit button while signing in', async () => {
    let finish!: () => void;
    login(
      () =>
        new Promise<Response>((resolve) => {
          finish = () => resolve(redirect());
        }),
    );
    const user = userEvent.setup();
    render(<Main />);
    await user.type(screen.getByLabelText('E-mail'), 'a@b.co');
    await user.type(screen.getByLabelText('Hasło'), 'secret1');

    await user.click(screen.getByRole('button', { name: 'Zaloguj się' }));

    expect(
      await screen.findByRole('button', { name: 'Chwila…' }),
    ).toBeDisabled();

    finish();
    await waitFor(() => expect(navigateTo).toHaveBeenCalled());
  });

  it('opens the dashboard after a successful sign in', async () => {
    login(redirect);
    const user = userEvent.setup();
    render(<Main />);
    await user.type(screen.getByLabelText('E-mail'), 'a@b.co');
    await user.type(screen.getByLabelText('Hasło'), 'secret1');

    await user.click(screen.getByRole('button', { name: 'Zaloguj się' }));

    await waitFor(() => expect(navigateTo).toHaveBeenCalledWith('/app/'));
  });

  it('shows a default message when the server gives no reason', async () => {
    login(() => HttpResponse.json({ code: 303, location: '/' }));
    const user = userEvent.setup();
    render(<Main />);
    await user.type(screen.getByLabelText('E-mail'), 'a@b.co');
    await user.type(screen.getByLabelText('Hasło'), 'secret1');

    await user.click(screen.getByRole('button', { name: 'Zaloguj się' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Sign-in failed. Try again.',
    );
  });

  it('lets the user retry after a rejection and clears the old error', async () => {
    login(() => rejection('Invalid credentials'));
    const user = userEvent.setup();
    render(<Main />);
    await user.type(screen.getByLabelText('E-mail'), 'a@b.co');
    await user.type(screen.getByLabelText('Hasło'), 'wrong12');
    await user.click(screen.getByRole('button', { name: 'Zaloguj się' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Invalid credentials',
    );

    login(redirect);
    await user.click(screen.getByRole('button', { name: 'Zaloguj się' }));

    await waitFor(() => expect(navigateTo).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('drops the validation message once the input is valid', async () => {
    login(redirect);
    const user = userEvent.setup();
    render(<Main />);
    await user.type(screen.getByLabelText('E-mail'), 'nope');
    await user.type(screen.getByLabelText('Hasło'), '123');
    await user.click(screen.getByRole('button', { name: 'Zaloguj się' }));
    expect(await screen.findByRole('alert')).toBeVisible();

    await user.type(screen.getByLabelText('E-mail'), '@b.co');
    await user.type(screen.getByLabelText('Hasło'), '456');
    await user.click(screen.getByRole('button', { name: 'Zaloguj się' }));

    await waitFor(() => expect(navigateTo).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows the rejection as a titled error and retries from it', async () => {
    login(() => rejection('Taken'));
    const user = userEvent.setup();
    render(<Main />);
    await user.type(screen.getByLabelText('E-mail'), 'a@b.co');
    await user.type(screen.getByLabelText('Hasło'), 'secret1');
    await user.click(screen.getByRole('button', { name: 'Zaloguj się' }));
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Nie udało się');
    expect(alert).toHaveTextContent('Taken');
    expect(alert).toHaveTextContent(/SIGN_IN_REJECTED/);

    login(redirect);
    await user.click(screen.getByRole('button', { name: 'Spróbuj ponownie' }));

    await waitFor(() => expect(navigateTo).toHaveBeenCalledTimes(1));
  });
});
