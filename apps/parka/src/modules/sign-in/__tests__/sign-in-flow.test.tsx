import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Main } from '../presentation/main';

const navigateTo = vi.hoisted(() => vi.fn());

vi.mock('@/shared/router/navigation', async (importActual) => ({
  ...(await importActual<typeof import('@/shared/router/navigation')>()),
  navigateTo,
}));

const stubFetch = (impl: () => Promise<object>) => {
  const fetchMock = vi.fn(impl);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

const fillAndSubmit = async (email: string, password: string) => {
  const user = userEvent.setup();
  render(<Main />);
  await user.type(screen.getByLabelText('E-mail'), email);
  await user.type(screen.getByLabelText('Hasło'), password);
  await user.click(screen.getByRole('button', { name: 'Zaloguj się' }));
};

describe('sign in', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    navigateTo.mockClear();
  });

  it('asks for valid input without calling the server', async () => {
    const fetchMock = stubFetch(async () => ({}));

    await fillAndSubmit('nope', '123');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Enter a valid email and password',
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('goes to the dashboard after a successful sign in', async () => {
    stubFetch(async () => ({ type: 'opaqueredirect' }));

    await fillAndSubmit('a@b.co', 'secret1');

    await waitFor(() => expect(navigateTo).toHaveBeenCalledTimes(1));
  });

  it('shows the server message when credentials are rejected', async () => {
    stubFetch(async () => ({
      json: async () => ({
        code: 400,
        type: 'bad-request',
        message: 'Invalid credentials',
      }),
    }));

    await fillAndSubmit('a@b.co', 'secret1');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Invalid credentials',
    );
    expect(navigateTo).not.toHaveBeenCalled();
  });

  it('tells the user when the server is unreachable', async () => {
    stubFetch(async () => {
      throw new Error('offline');
    });

    await fillAndSubmit('a@b.co', 'secret1');

    expect(await screen.findByRole('alert')).toHaveTextContent('offline');
  });

  it('sends only one request when the form is submitted twice', async () => {
    let finishFetch!: (value: { type: string }) => void;
    const fetchMock = stubFetch(
      () =>
        new Promise<{ type: string }>((resolve) => {
          finishFetch = resolve;
        }),
    );
    const user = userEvent.setup();
    render(<Main />);
    await user.type(screen.getByLabelText('E-mail'), 'a@b.co');
    await user.type(screen.getByLabelText('Hasło'), 'secret1{Enter}{Enter}');

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(fetchMock).toHaveBeenCalledTimes(1);

    finishFetch({ type: 'opaqueredirect' });
    await waitFor(() => expect(navigateTo).toHaveBeenCalled());
  });
});
