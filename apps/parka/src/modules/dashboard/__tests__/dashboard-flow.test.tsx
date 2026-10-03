import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { currentMonth, monthTitle, prevMonth } from '../domain/format';
import { Main } from '../presentation/main';

const SUMMARY = {
  userName: 'Anna Kowalska',
  total: 10,
  change: 25,
  previousTotal: 8,
  transactions: 3,
  dailyAverage: 1.5,
  daily: [
    { day: 1, total: 4 },
    { day: 2, total: 6 },
  ],
  previousDaily: [
    { day: 1, total: 8 },
    { day: 2, total: 0 },
  ],
  monthlyLimit: 100,
  categories: [
    {
      categoryId: 'c-1',
      name: 'Jedzenie',
      color: 'green',
      amount: 42,
      pct: 100,
    },
  ],
};

const stubApi = (failing = false, overrides: Partial<typeof SUMMARY> = {}) => {
  const fetchMock = vi.fn(async (url: string) => ({
    json: async () =>
      failing
        ? { code: 500, message: 'boom' }
        : {
            code: 200,
            data: url.includes('/api/dashboard')
              ? { ...SUMMARY, ...overrides }
              : [],
          },
  }));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

describe('dashboard screen', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('greets the user and shows the month total with its change', async () => {
    stubApi();

    render(<Main />);

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: /Cześć, Anna/ })).toBeTruthy(),
    );
    expect(screen.getByText(/10,00/)).toBeTruthy();
    expect(screen.getByText('+25%')).toBeTruthy();
    expect(screen.getByText('Średnio dziennie')).toBeTruthy();
    expect(screen.getByText(/1,50/)).toBeTruthy();
    expect(screen.getByText('3')).toBeTruthy();
    expect(screen.getByText(/90,00/)).toBeTruthy();
    expect(
      screen.getByRole('progressbar', { name: 'Wykorzystano 10% limitu' }),
    ).toBeTruthy();
  });

  it('says how far over the limit spending went', async () => {
    stubApi(false, { total: 130 });

    render(<Main />);

    expect(await screen.findByText('Ponad limit')).toBeTruthy();
    expect(screen.getByText(/^30,00/)).toBeTruthy();
  });

  it('warns when spending is close to the limit', async () => {
    stubApi(false, { total: 85 });

    render(<Main />);

    expect(await screen.findByText('Blisko limitu')).toBeTruthy();
    expect(screen.getByText(/^15,00/)).toBeTruthy();
  });

  it('hides the change when spending did not move', async () => {
    stubApi(false, { change: 0 });

    render(<Main />);

    await screen.findByText('Kategorie wydatków');
    expect(screen.queryByText(/^[+-]d+%$/)).toBeNull();
  });

  it('lists each category with its amount and share', async () => {
    stubApi();

    render(<Main />);

    const donut = await screen.findByRole('img', {
      name: /Rozkład wydatków wg kategorii/,
    });
    const figure = donut.closest('figure');
    if (!figure) throw new Error('No category figure.');
    const legend = within(figure);
    expect(legend.getByText('Jedzenie')).toBeTruthy();
    expect(legend.getByText(/42,00/)).toBeTruthy();
    expect(legend.getByText('100%')).toBeTruthy();
  });

  it('asks the backend for the chosen month', async () => {
    const fetchMock = stubApi();
    render(<Main />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const previous = prevMonth(currentMonth());

    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: 'Miesiąc' }),
      monthTitle(previous),
    );

    await waitFor(() =>
      expect(
        fetchMock.mock.calls.some(([url]) =>
          String(url).includes(`month=${previous}`),
        ),
      ).toBe(true),
    );
  });

  it('shows a skeleton until all the data arrived', async () => {
    stubApi();

    render(<Main />);

    expect(screen.queryByText('Wydatki w tym miesiącu')).toBeNull();
    expect(await screen.findByText('Wydatki w tym miesiącu')).toBeTruthy();
    expect(screen.getByText('Limity')).toBeTruthy();
  });

  it('loads everything in one go, once', async () => {
    const fetchMock = stubApi();

    render(<Main />);

    await screen.findByText('Limity');
    expect(fetchMock).toHaveBeenCalledTimes(5);
  });

  it('shows only the failure screen when any part fails to load', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => ({
        json: async () =>
          url.includes('/api/limits')
            ? { code: 500, message: 'boom' }
            : {
                code: 200,
                data: url.includes('/api/dashboard') ? SUMMARY : [],
              },
      })),
    );

    render(<Main />);

    expect(
      await screen.findByText('Nie udało się wczytać podsumowania'),
    ).toBeTruthy();
    expect(screen.queryByText('Wydatki w tym miesiącu')).toBeNull();
    expect(screen.queryByText('Limity')).toBeNull();
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

describe('dashboard month expenses', () => {
  afterEach(() => vi.unstubAllGlobals());

  const expense = (id: string, merchant: string, categoryId: string) => ({
    id,
    merchant,
    date: '2026-09-02T10:00:00Z',
    amount: 12,
    categoryId,
    paymentMethod: 'card',
    isBill: false,
    source: 'manual',
    items: [],
  });

  const stubWithExpenses = () =>
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => ({
        json: async () => ({
          code: 200,
          data: url.includes('/api/expenses')
            ? [
                expense('e-1', 'Sklep Testowy', 'c-1'),
                expense('e-2', 'Kino Testowe', 'c-2'),
                {
                  ...expense('e-3', 'Stary Sklep', 'c-1'),
                  date: '2026-08-02T10:00:00Z',
                },
              ]
            : url.includes('/api/categories')
              ? [
                  { id: 'c-1', name: 'Jedzenie', icon: 'cart', color: 'green' },
                  {
                    id: 'c-2',
                    name: 'Rozrywka',
                    icon: 'popcorn',
                    color: 'red',
                  },
                ]
              : url.includes('/api/dashboard')
                ? SUMMARY
                : [],
        }),
      })),
    );

  const openSeptember = async () => {
    render(<Main />);
    const select = await screen.findByRole('combobox', { name: 'Miesiąc' });
    await userEvent.selectOptions(select, '2026-09');
  };

  it('lists only the expenses of the selected month', async () => {
    stubWithExpenses();

    await openSeptember();

    await screen.findByRole('button', { name: /Sklep Testowy/ });
    expect(screen.getByRole('button', { name: /Kino Testowe/ })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Stary Sklep/ })).toBeNull();
  });

  it('narrows the list to the chosen category', async () => {
    stubWithExpenses();
    await openSeptember();
    await screen.findByRole('button', { name: /Sklep Testowy/ });

    await userEvent.click(screen.getByRole('button', { name: /^Rozrywka 1/ }));

    expect(screen.getByRole('button', { name: /Kino Testowe/ })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Sklep Testowy/ })).toBeNull();

    await userEvent.click(screen.getByRole('button', { name: /^Wszystkie 2/ }));

    expect(screen.getByRole('button', { name: /Sklep Testowy/ })).toBeTruthy();
  });
});
