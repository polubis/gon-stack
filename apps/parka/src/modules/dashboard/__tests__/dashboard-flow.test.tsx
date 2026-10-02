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
  previousTransactions: 2,
  previousDailyAverage: 0.5,
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

const stubApi = (failing = false) => {
  const fetchMock = vi.fn(async (_url: string) => ({
    json: async () =>
      failing ? { code: 500, message: 'boom' } : { code: 200, data: SUMMARY },
  }));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

const kpi = (label: string) => {
  const card = screen.getByText(label).closest('li');
  if (!card) throw new Error(`No KPI card for "${label}".`);
  return within(card);
};

describe('dashboard screen', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('greets the user and shows the month kpis', async () => {
    stubApi();

    render(<Main />);

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: /Cześć, Anna/ })).toBeTruthy(),
    );
    expect(kpi('Liczba transakcji').getByText('3')).toBeTruthy();
    expect(kpi('Średnio dziennie').getByText(/1,50/)).toBeTruthy();
    expect(kpi('Pozostało do limitu').getByText(/90,00/)).toBeTruthy();
  });

  it('shows the breakdown and the previous month total in the spending kpi', async () => {
    stubApi();

    render(<Main />);

    await waitFor(() =>
      expect(screen.getByText('Kategorie wydatków')).toBeTruthy(),
    );
    expect(kpi('Wydatki w tym miesiącu').getByText(/8,00/)).toBeTruthy();
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
      expect(String(fetchMock.mock.calls.at(-1)?.[0])).toContain(
        `month=${previous}`,
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
              : SUMMARY,
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
