import { render, screen, waitFor } from '@testing-library/react';
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
} from 'vitest';
import { Main } from '../presentation/main';

const server = setupServer();
const saved: unknown[] = [];

const modalsInUrl = () =>
  new URLSearchParams(window.location.search).getAll('modal');

const mockState = (data: unknown, saveMessage?: string) =>
  server.use(
    http.get('/api/finance-tour/', () =>
      HttpResponse.json({ code: 200, data }),
    ),
    http.put('/api/finance-tour/', async ({ request }) => {
      saved.push(await request.json());
      return saveMessage
        ? HttpResponse.json(
            { code: 500, type: 'internal-server', message: saveMessage },
            { status: 500 },
          )
        : HttpResponse.json({ code: 200, ok: true });
    }),
  );

const due = { outcome: null, expiresAt: null };

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
beforeEach(() => window.history.replaceState(null, '', '/'));
afterEach(() => {
  server.resetHandlers();
  saved.length = 0;
});
afterAll(() => server.close());

describe('Finance tour edge cases', () => {
  it('stays closed when the answer has no state', async () => {
    mockState(null);
    render(<Main />);

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(saved).toEqual([]);
  });

  it('stays closed when the network is down', async () => {
    server.use(http.get('/api/finance-tour/', () => HttpResponse.error()));
    render(<Main />);

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(saved).toEqual([]);
  });

  it('drops a stale tour link of a finished tour from the URL', async () => {
    window.history.replaceState(null, '', '/?modal=tour');
    mockState({ outcome: 'completed', expiresAt: '2099-01-01T00:00:00.000Z' });
    render(<Main />);

    await waitFor(() => expect(modalsInUrl()).toEqual([]));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('walks the steps with the keyboard from the first render', async () => {
    const user = userEvent.setup();
    mockState(due);
    render(<Main />);
    await screen.findByRole('heading', { name: 'Witaj w Parce' });

    await user.keyboard('{Enter}');

    await screen.findByRole('heading', {
      name: 'Paragon zamiast przepisywania',
    });
  });

  it('turns off for good when Back closes it', async () => {
    mockState(due);
    render(<Main />);
    await screen.findByRole('dialog', { name: 'Przewodnik po finansach' });

    window.history.back();

    await waitFor(() => expect(saved).toEqual([{ outcome: 'skipped' }]));
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  });

  it('removes the tour from the URL once it is skipped', async () => {
    const user = userEvent.setup();
    mockState(due);
    render(<Main />);
    await screen.findByRole('dialog');

    await user.click(screen.getByRole('button', { name: 'Pomiń' }));

    await waitFor(() => expect(modalsInUrl()).toEqual([]));
  });

  it('explains why the choice was not saved and can be dismissed', async () => {
    const user = userEvent.setup();
    mockState(due, 'Boom');
    render(<Main />);
    await screen.findByRole('dialog');
    await user.click(screen.getByRole('button', { name: 'Pomiń' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Boom');

    await user.click(screen.getByRole('button', { name: 'Zamknij' }));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
