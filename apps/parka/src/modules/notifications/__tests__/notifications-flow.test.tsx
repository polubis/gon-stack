import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Main } from '../presentation/main';

const stubFetch = (body: object) =>
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ json: async () => body })),
  );

describe('notifications screen', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('lists notifications fetched from the backend', async () => {
    stubFetch({
      code: 200,
      data: [
        {
          id: 'n-1',
          kind: 'receipt-confirmation',
          title: 'Nowy paragon',
          body: 'Shop',
          ageDays: 0,
        },
      ],
    });

    render(<Main />);

    expect(await screen.findByText('Nowy paragon')).toBeTruthy();
    expect(screen.getByText('dziś')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Powiadomienia' })).toBeTruthy();
  });

  it('shows an empty message when there are none', async () => {
    stubFetch({ code: 200, data: [] });

    render(<Main />);

    expect(await screen.findByText('Brak powiadomień.')).toBeTruthy();
  });

  it('shows an error with retry when loading fails', async () => {
    stubFetch({ code: 500, type: 'internal-server', message: 'boom' });

    render(<Main />);

    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy());
    expect(screen.getByText('NOTIFICATIONS_LOAD')).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Spróbuj ponownie' }),
    ).toBeTruthy();
  });
});
