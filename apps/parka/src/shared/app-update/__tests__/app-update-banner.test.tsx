import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
import { AppUpdateBanner } from '../presentation/app-update-banner';

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  vi.unstubAllGlobals();
});
afterAll(() => server.close());
beforeEach(() => vi.stubEnv('PUBLIC_PARKA_APP_VERSION', '1.0.0+aaa'));

const deployed = (version: string) =>
  server.use(http.get('/version.json', () => HttpResponse.json({ version })));

const BANNER = /nowa wersja/i;

describe('app update banner', () => {
  it('stays hidden when the app is up to date', async () => {
    deployed('1.0.0+aaa');
    render(<AppUpdateBanner />);

    await act(() => new Promise((resolve) => setTimeout(resolve, 50)));

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('stays hidden when the version cannot be read', async () => {
    server.use(http.get('/version.json', () => HttpResponse.error()));
    render(<AppUpdateBanner />);

    await act(() => new Promise((resolve) => setTimeout(resolve, 50)));

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('offers a reload when a newer version is deployed', async () => {
    deployed('1.0.0+bbb');
    const reload = vi.fn();
    vi.stubGlobal('location', { ...window.location, reload });
    render(<AppUpdateBanner />);

    expect(await screen.findByRole('status')).toHaveTextContent(BANNER);
    await userEvent.click(screen.getByRole('button', { name: 'Odśwież' }));

    expect(reload).toHaveBeenCalledOnce();
  });

  it('comes back after dismissing when the tab is shown again', async () => {
    deployed('1.0.0+bbb');
    render(<AppUpdateBanner />);
    await screen.findByRole('status');

    await userEvent.click(
      screen.getByRole('button', { name: /zamknij informację/i }),
    );
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    document.dispatchEvent(new Event('visibilitychange'));

    await waitFor(() => expect(screen.getByRole('status')).toBeInTheDocument());
  });
});
