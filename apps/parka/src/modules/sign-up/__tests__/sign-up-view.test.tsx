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

const redirect = () =>
  new HttpResponse(null, { status: 302, headers: { Location: '/app/' } });

const rejection = (message?: string) =>
  HttpResponse.json({ code: 400, type: 'bad-request', message });

const serve = (respond: () => Response | Promise<Response>) =>
  server.use(http.post('/api/auth/register/', respond));

describe('sign up view', () => {
  it('links to the sign in page for existing users', () => {
    render(<Main />);

    expect(screen.getByRole('link', { name: 'Zaloguj' })).toHaveAttribute(
      'href',
      '/sign-in/',
    );
  });

  it('keeps social sign up disabled until it ships', () => {
    render(<Main />);

    expect(screen.getByRole('button', { name: /Google/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Apple/ })).toBeDisabled();
  });

  it('hides the typed password', () => {
    render(<Main />);

    expect(screen.getByLabelText('Hasło')).toHaveAttribute('type', 'password');
  });

  it('shows no message before anything is submitted', () => {
    render(<Main />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('locks the button while the request is in flight', async () => {
    let finish!: () => void;
    serve(
      () =>
        new Promise<Response>((resolve) => {
          finish = () => resolve(redirect());
        }),
    );
    const user = userEvent.setup();
    render(<Main />);
    await user.type(screen.getByLabelText('E-mail'), 'a@b.co');
    await user.type(screen.getByLabelText('Hasło'), 'secret1');

    await user.click(screen.getByRole('button', { name: 'Utwórz' }));

    expect(
      await screen.findByRole('button', { name: 'Chwila…' }),
    ).toBeDisabled();

    finish();
    await waitFor(() => expect(navigateTo).toHaveBeenCalled());
  });

  it('sends the typed credentials to the server', async () => {
    let body: unknown;
    server.use(
      http.post('/api/auth/register/', async ({ request }) => {
        body = await request.json();
        return redirect();
      }),
    );
    const user = userEvent.setup();
    render(<Main />);
    await user.type(screen.getByLabelText('E-mail'), 'a@b.co');
    await user.type(screen.getByLabelText('Hasło'), 'secret1');

    await user.click(screen.getByRole('button', { name: 'Utwórz' }));

    await waitFor(() => expect(navigateTo).toHaveBeenCalled());
    expect(body).toEqual({ email: 'a@b.co', password: 'secret1' });
  });

  it('shows a default message when the rejection has none', async () => {
    serve(() => rejection());
    const user = userEvent.setup();
    render(<Main />);
    await user.type(screen.getByLabelText('E-mail'), 'a@b.co');
    await user.type(screen.getByLabelText('Hasło'), 'secret1');

    await user.click(screen.getByRole('button', { name: 'Utwórz' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Sign-up failed. Try again.',
    );
  });

  it('shows an error when the server answers with garbage', async () => {
    serve(() => new HttpResponse('<html>oops</html>', { status: 500 }));
    const user = userEvent.setup();
    render(<Main />);
    await user.type(screen.getByLabelText('E-mail'), 'a@b.co');
    await user.type(screen.getByLabelText('Hasło'), 'secret1');

    await user.click(screen.getByRole('button', { name: 'Utwórz' }));

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(navigateTo).not.toHaveBeenCalled();
  });

  it('lets the user retry after a rejection and succeed', async () => {
    serve(() => rejection('Taken'));
    const user = userEvent.setup();
    render(<Main />);
    await user.type(screen.getByLabelText('E-mail'), 'a@b.co');
    await user.type(screen.getByLabelText('Hasło'), 'secret1');
    await user.click(screen.getByRole('button', { name: 'Utwórz' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Taken');

    serve(redirect);
    await user.click(screen.getByRole('button', { name: 'Utwórz' }));

    await waitFor(() => expect(navigateTo).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('drops the confirmation notice when the next attempt is rejected', async () => {
    serve(() => HttpResponse.json({ code: 200, ok: true }));
    const user = userEvent.setup();
    render(<Main />);
    await user.type(screen.getByLabelText('E-mail'), 'a@b.co');
    await user.type(screen.getByLabelText('Hasło'), 'secret1');
    await user.click(screen.getByRole('button', { name: 'Utwórz' }));
    expect(await screen.findByRole('status')).toBeInTheDocument();

    serve(() => rejection('Taken'));
    await user.click(screen.getByRole('button', { name: 'Utwórz' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Taken');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('clears a field with its clear button', async () => {
    const user = userEvent.setup();
    render(<Main />);
    const email = screen.getByLabelText('E-mail');
    await user.type(email, 'a@b.co');

    await user.click(screen.getByRole('button', { name: 'Wyczyść: E-mail' }));

    expect(email).toHaveValue('');
    expect(email).toHaveFocus();
    expect(
      screen.queryByRole('button', { name: 'Wyczyść: E-mail' }),
    ).not.toBeInTheDocument();
  });

  it('removes the validation error once the input becomes valid and is sent', async () => {
    serve(redirect);
    const user = userEvent.setup();
    render(<Main />);
    await user.type(screen.getByLabelText('E-mail'), 'nope');
    await user.click(screen.getByRole('button', { name: 'Utwórz' }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();

    await user.clear(screen.getByLabelText('E-mail'));
    await user.type(screen.getByLabelText('E-mail'), 'a@b.co');
    await user.type(screen.getByLabelText('Hasło'), 'secret1');
    await user.click(screen.getByRole('button', { name: 'Utwórz' }));

    await waitFor(() => expect(navigateTo).toHaveBeenCalled());
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
