import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Main } from '../presentation/main';

const SUMMARY = {
  total: 10,
  change: 25,
  previousTotal: 8,
  rangeTotal: 42,
  trend: [{ month: '2026-09', total: 10 }],
  categories: [
    {
      categoryId: 'c-1',
      name: 'Jedzenie',
      color: 'green',
      amount: 42,
      pct: 100,
    },
  ],
  categoryChanges: [
    { categoryId: 'c-1', name: 'Jedzenie', color: 'green', changePct: 25 },
  ],
};

const stubApi = (failing = false) => {
  const fetchMock = vi.fn(async (_url: string) => ({
    json: async () =>
      failing ? { code: 500, message: 'boom' } : { code: 200, data: SUMMARY },
  }));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

describe('dashboard screen', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('shows range total, breakdown and month comparison together', async () => {
    stubApi();

    render(<Main />);

    await waitFor(() => expect(screen.getByText(/42,00/)).toBeTruthy());
    expect(screen.getByText('Rozkład wydatków')).toBeTruthy();
    expect(screen.getByText('Największe zmiany')).toBeTruthy();
    expect(screen.getByText(/8,00/)).toBeTruthy();
  });

  it('asks the backend for the chosen range', async () => {
    const fetchMock = stubApi();
    render(<Main />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());

    await userEvent.click(screen.getByRole('tab', { name: 'Rok' }));

    await waitFor(() =>
      expect(String(fetchMock.mock.calls.at(-1)?.[0])).toContain(
        'trendMonths=12',
      ),
    );
  });

  it('offers a retry when loading fails', async () => {
    stubApi(true);

    render(<Main />);

    await waitFor(() =>
      expect(
        screen.getByText('Nie udało się wczytać podsumowania'),
      ).toBeTruthy(),
    );
    expect(screen.getByText('DASHBOARD_LOAD')).toBeTruthy();
  });
});

describe('dashboard expenses section', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('lists expenses below the summary', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => ({
        json: async () => ({
          code: 200,
          data: url.includes('/api/expenses')
            ? [
                {
                  id: 'e-1',
                  merchant: 'Sklep Testowy',
                  date: '2026-09-02T10:00:00Z',
                  amount: 12,
                  categoryId: 'c-1',
                  paymentMethod: 'card',
                  isBill: false,
                  source: 'manual',
                  items: [],
                },
              ]
            : url.includes('/api/categories')
              ? []
              : SUMMARY,
        }),
      })),
    );

    render(<Main />);

    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /Sklep Testowy/ }),
      ).toBeTruthy(),
    );
    expect(screen.getByRole('heading', { name: 'Wydatki' })).toBeTruthy();
  });
});
