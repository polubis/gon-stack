import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Main } from '../presentation/main';

const EXPENSE = {
  id: 'e-1',
  merchant: 'Shop',
  date: new Date().toISOString(),
  amount: 10,
  categoryId: 'c-1',
  paymentMethod: 'card',
  isBill: false,
  source: 'manual',
  items: [],
};

const CATEGORY = { id: 'c-1', name: 'Jedzenie', icon: 'cart', color: 'green' };

const stubApi = (failing = false) =>
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      const body = failing
        ? { code: 500, message: 'boom' }
        : url.includes('categories')
          ? { code: 200, data: [CATEGORY] }
          : { code: 200, data: [EXPENSE] };
      return { json: async () => body };
    }),
  );

describe('statistics screen', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('shows the heading right away and the total once loaded', async () => {
    stubApi();

    render(<Main />);

    expect(
      screen.getByRole('heading', { name: 'Statystyki', level: 1 }),
    ).toBeTruthy();
    await waitFor(() => expect(screen.getByText(/10,00/)).toBeTruthy());
  });

  it('switches to the comparison view', async () => {
    stubApi();
    render(<Main />);
    await waitFor(() => expect(screen.getByText(/10,00/)).toBeTruthy());

    await userEvent.click(screen.getByRole('tab', { name: 'Porównanie' }));

    expect(screen.getByText('Największe zmiany')).toBeTruthy();
  });

  it('offers a retry when loading fails', async () => {
    stubApi(true);

    render(<Main />);

    await waitFor(() =>
      expect(screen.getByText('Nie udało się wczytać statystyk')).toBeTruthy(),
    );
    expect(screen.getByText('STATISTICS_LOAD')).toBeTruthy();
  });
});
