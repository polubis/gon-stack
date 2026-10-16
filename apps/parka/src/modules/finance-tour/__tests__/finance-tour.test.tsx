import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { Main } from '../presentation/main';

const server = setupServer();
const saved: unknown[] = [];

/** Backend that answers how the account ended the tour, `null` = never. */
const mockBackend = (outcome: 'completed' | 'skipped' | null, saveOk = true) =>
  server.use(
    http.get('/api/finance-tour/', () =>
      HttpResponse.json({
        code: 200,
        data: {
          outcome,
          expiresAt: outcome ? '2099-01-01T00:00:00.000Z' : null,
        },
      }),
    ),
    http.put('/api/finance-tour/', async ({ request }) => {
      saved.push(await request.json());
      return saveOk
        ? HttpResponse.json({ code: 200, ok: true })
        : HttpResponse.json(
            { code: 500, type: 'internal-server', message: 'Boom' },
            { status: 500 },
          );
    }),
  );

const tourHeading = () =>
  screen.findByRole('heading', { name: 'Witaj w Parce' });

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  saved.length = 0;
});
afterAll(() => server.close());

describe('Finance tour works when', () => {
  it('opens by itself for an account that never finished it', async () => {
    mockBackend(null);
    render(<Main />);

    await tourHeading();
    screen.getByRole('dialog', { name: 'Przewodnik po finansach' });
    expect(new URLSearchParams(window.location.search).getAll('modal')).toEqual(
      ['tour'],
    );
  });

  it('stays closed once the account finished it', async () => {
    mockBackend('skipped');
    render(<Main />);

    await waitFor(() => expect(saved).toEqual([]));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('stays closed when the server cannot tell', async () => {
    server.use(
      http.get('/api/finance-tour/', () =>
        HttpResponse.json(
          { code: 401, type: 'unauthorized', message: 'No session' },
          { status: 401 },
        ),
      ),
    );
    render(<Main />);

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('walks every finance step and remembers it was completed', async () => {
    const user = userEvent.setup();
    mockBackend(null);
    render(<Main />);
    await tourHeading();

    for (const title of [
      'Paragon zamiast przepisywania',
      'Kategorie mówią, gdzie znikają pieniądze',
      'Limity, które pilnują budżetu',
      'Stałe płatności same się dopiszą',
      'Raport w jednym kliknięciu',
    ]) {
      await user.click(
        screen.getByRole('button', { name: /Pokaż więcej|Dalej/ }),
      );
      screen.getByRole('heading', { name: title });
    }
    await user.click(screen.getByRole('button', { name: 'Zaczynamy' }));

    await waitFor(() => expect(saved).toEqual([{ outcome: 'completed' }]));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('turns off for good with skip', async () => {
    const user = userEvent.setup();
    mockBackend(null);
    render(<Main />);
    await tourHeading();

    await user.click(screen.getByRole('button', { name: 'Pomiń' }));

    await waitFor(() => expect(saved).toEqual([{ outcome: 'skipped' }]));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('turns off for good with the close button', async () => {
    const user = userEvent.setup();
    mockBackend(null);
    render(<Main />);
    await tourHeading();

    await user.click(screen.getByRole('button', { name: 'Wyłącz przewodnik' }));

    await waitFor(() => expect(saved).toEqual([{ outcome: 'skipped' }]));
  });

  it('turns off for good with Escape', async () => {
    const user = userEvent.setup();
    mockBackend(null);
    render(<Main />);
    await tourHeading();

    await user.keyboard('{Escape}');

    await waitFor(() => expect(saved).toEqual([{ outcome: 'skipped' }]));
  });

  it('shows a retryable error when the choice cannot be saved', async () => {
    const user = userEvent.setup();
    mockBackend(null, false);
    render(<Main />);
    await tourHeading();

    await user.click(screen.getByRole('button', { name: 'Pomiń' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Nie udało się zapisać przewodnika');
    expect(alert).toHaveTextContent('FINANCE_TOUR_SAVE');
    mockBackend(null, true);
    await user.click(screen.getByRole('button', { name: 'Spróbuj ponownie' }));
    await waitFor(() => expect(saved).toHaveLength(2));
  });
});
