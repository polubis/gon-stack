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
afterAll(() => server.close());

const redirect = () =>
  new HttpResponse(null, { status: 302, headers: { Location: '/app/' } });

const stubServer = (respond: () => Response | Promise<Response>) => {
  const received = vi.fn();
  server.use(
    http.post('/api/auth/register/', () => {
      received();
      return respond();
    }),
  );
  return received;
};

const fillAndSubmit = async (email: string, password: string) => {
  const user = userEvent.setup();
  render(<Main />);
  await user.type(screen.getByLabelText('E-mail'), email);
  await user.type(screen.getByLabelText('Hasło'), password);
  await user.click(screen.getByRole('button', { name: 'Utwórz konto' }));
};

describe('sign up', () => {
  afterEach(() => {
    server.resetHandlers();
    navigateTo.mockClear();
  });

  it('asks for valid input without calling the server', async () => {
    const received = stubServer(() => HttpResponse.json({}));

    await fillAndSubmit('nope', '123');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Enter a valid email and password',
    );
    expect(received).not.toHaveBeenCalled();
  });

  it('goes to the dashboard after a successful sign up', async () => {
    stubServer(redirect);

    await fillAndSubmit('a@b.co', 'secret1');

    await waitFor(() => expect(navigateTo).toHaveBeenCalledTimes(1));
  });

  it('shows the server message when credentials are rejected', async () => {
    stubServer(() =>
      HttpResponse.json({
        code: 400,
        type: 'bad-request',
        message: 'Invalid credentials',
      }),
    );

    await fillAndSubmit('a@b.co', 'secret1');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Invalid credentials',
    );
    expect(navigateTo).not.toHaveBeenCalled();
  });

  it('tells the user when the server is unreachable', async () => {
    stubServer(() => HttpResponse.error());

    await fillAndSubmit('a@b.co', 'secret1');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Failed to fetch',
    );
  });

  it('sends only one request when the form is submitted twice', async () => {
    let finishRequest!: () => void;
    const received = stubServer(
      () =>
        new Promise<Response>((resolve) => {
          finishRequest = () => resolve(redirect());
        }),
    );
    const user = userEvent.setup();
    render(<Main />);
    await user.type(screen.getByLabelText('E-mail'), 'a@b.co');
    await user.type(screen.getByLabelText('Hasło'), 'secret1{Enter}{Enter}');

    await waitFor(() => expect(received).toHaveBeenCalledTimes(1));
    expect(received).toHaveBeenCalledTimes(1);

    finishRequest();
    await waitFor(() => expect(navigateTo).toHaveBeenCalled());
  });

  it('asks the user to confirm the e-mail when registration needs it', async () => {
    stubServer(() => HttpResponse.json({ code: 200, ok: true }));

    await fillAndSubmit('a@b.co', 'secret1');

    expect(await screen.findByRole('status')).toHaveTextContent(
      'potwierdź rejestrację',
    );
    expect(navigateTo).not.toHaveBeenCalled();
  });
});
