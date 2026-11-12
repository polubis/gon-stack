import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { currentPeriod, shiftPeriod, todayDay } from '@/shared/period/period';
import { currentMonth } from '../domain/format';
import { Main } from '../presentation/main';
import { answerApi, readBody, startBackend } from './dashboard-backend';

const month: string = currentMonth();
const previousMonth = shiftPeriod(
  currentPeriod('month', todayDay()),
  -1,
).from.slice(0, 7);

/** Noon UTC on the first: the same calendar day in every time zone. */
const spend = (
  id: string,
  amount: number,
  categoryId = 'c-1',
  at: string = month,
) => ({
  id,
  merchant: `Sklep ${id}`,
  date: `${at}-01T12:00:00Z`,
  amount,
  categoryId,
  paymentMethod: 'card',
  isBill: false,
  source: 'manual',
  items: [],
});

const LIMIT = { id: 'l-1', scope: 'total', amount: 100, alertAt: 80 };
const FOOD = { id: 'c-1', name: 'Jedzenie', icon: 'cart', color: 'green' };

const server = startBackend();

const stubApi = (failing = false, reads: Parameters<typeof readBody>[1] = {}) =>
  answerApi(server, ({ url }) =>
    failing
      ? { code: 500, message: 'boom' }
      : readBody(url, { categories: [FOOD], limits: [LIMIT], ...reads }),
  );

const legendOfCategories = async () => {
  const donut = await screen.findByRole('img', {
    name: /Rozkład wydatków wg kategorii/,
  });
  const figure = donut.closest('figure');
  if (!figure) throw new Error('No category figure.');
  return figure;
};

describe('dashboard screen', () => {
  it('shows the month total with its change', async () => {
    stubApi(false, {
      expenses: [
        spend('a', 4),
        spend('b', 6),
        spend('c', 8, 'c-1', previousMonth),
      ],
    });

    render(<Main />);

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Finanse' })).toBeTruthy(),
    );
    expect(screen.getAllByText(/10,00/).length).toBeGreaterThan(0);
    expect(screen.getByText('+25%')).toBeTruthy();
    expect(screen.getByText('Średnio dziennie')).toBeTruthy();
    expect(screen.getByText(/90,00/)).toBeTruthy();
    expect(
      screen.getAllByRole('progressbar', {
        name: /Wykorzystano 10% limitu na miesiąc/,
      }).length,
    ).toBeGreaterThan(0);
  });

  it('says how far over the limit spending went', async () => {
    stubApi(false, { expenses: [spend('a', 130)] });

    render(<Main />);

    expect(await screen.findByText('Ponad limit na miesiąc')).toBeTruthy();
    expect(screen.getByText(/^30,00/)).toBeTruthy();
  });

  it('warns when spending is close to the limit', async () => {
    stubApi(false, { expenses: [spend('a', 85)] });

    render(<Main />);

    expect(await screen.findByText('Blisko limitu na miesiąc')).toBeTruthy();
    expect(screen.getByText(/^15,00/)).toBeTruthy();
  });

  it('hides the change when spending did not move', async () => {
    stubApi();

    render(<Main />);

    await screen.findByRole('heading', { name: 'Kategorie' });
    expect(screen.queryByText(/^[+-]d+%$/)).toBeNull();
  });

  it('lists each category with its amount and share', async () => {
    stubApi(false, { expenses: [spend('a', 42)] });

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

  it('shows only six categories on the card', async () => {
    const categories = Array.from({ length: 8 }, (_, i) => ({
      id: `c-${i}`,
      name: `Kat ${i}`,
      icon: 'cart',
      color: 'green',
    }));
    stubApi(false, {
      categories,
      expenses: categories.map((c, i) => spend(`e-${i}`, 10, c.id)),
    });

    render(<Main />);

    const legend = within(await legendOfCategories());
    expect(legend.getByText('Kat 5')).toBeTruthy();
    expect(legend.queryByText('Kat 6')).toBeNull();
  });

  it('lists all categories in a dialog', async () => {
    const categories = Array.from({ length: 8 }, (_, i) => ({
      id: `c-${i}`,
      name: `Kat ${i}`,
      icon: 'cart',
      color: 'green',
    }));
    stubApi(false, {
      categories,
      expenses: categories.map((c, i) => spend(`e-${i}`, 10, c.id)),
    });
    const user = userEvent.setup();
    render(<Main />);
    const legend = within(await legendOfCategories());

    await user.click(legend.getByRole('button', { name: 'Pokaż wszystkie' }));

    const dialog = within(await screen.findByRole('dialog'));
    expect(dialog.getByText('Kat 7')).toBeTruthy();
    expect(dialog.getByText('Kat 0')).toBeTruthy();
  });

  it('shows only six expenses on the card', async () => {
    const month = currentMonth();
    const expenses = Array.from({ length: 8 }, (_, i) => ({
      id: `e-${i}`,
      merchant: `Sklep ${i}`,
      date: `${month}-02T1${i}:00:00Z`,
      amount: 10,
      categoryId: 'c-1',
      paymentMethod: 'card',
      isBill: false,
      source: 'manual',
      items: [],
    }));
    answerApi(server, ({ url }) => readBody(url, { expenses }));

    render(<Main />);

    expect(await screen.findByText('Sklep 2')).toBeTruthy();
    expect(screen.queryByText('Sklep 1')).toBeNull();
  });

  it('lists all expenses in a dialog', async () => {
    const month = currentMonth();
    const expenses = Array.from({ length: 8 }, (_, i) => ({
      id: `e-${i}`,
      merchant: `Sklep ${i}`,
      date: `${month}-02T1${i}:00:00Z`,
      amount: 10,
      categoryId: 'c-1',
      paymentMethod: 'card',
      isBill: false,
      source: 'manual',
      items: [],
    }));
    answerApi(server, ({ url }) => readBody(url, { expenses }));
    const user = userEvent.setup();
    render(<Main />);
    await screen.findByText('Sklep 2');

    await user.click(screen.getByRole('button', { name: 'Pokaż wszystkie' }));

    const dialog = within(await screen.findByRole('dialog'));
    expect(dialog.getByText('Sklep 1')).toBeTruthy();
    expect(dialog.getByText('Sklep 0')).toBeTruthy();
  });

  it('closes the list of all expenses with the close button', async () => {
    const month = currentMonth();
    const expenses = Array.from({ length: 8 }, (_, i) => ({
      id: `e-${i}`,
      merchant: `Sklep ${i}`,
      date: `${month}-02T1${i}:00:00Z`,
      amount: 10,
      categoryId: 'c-1',
      paymentMethod: 'card',
      isBill: false,
      source: 'manual',
      items: [],
    }));
    answerApi(server, ({ url }) => readBody(url, { expenses }));
    const user = userEvent.setup();
    render(<Main />);
    await screen.findByText('Sklep 2');
    await user.click(screen.getByRole('button', { name: 'Pokaż wszystkie' }));
    const dialog = within(await screen.findByRole('dialog'));

    await user.click(dialog.getByRole('button', { name: 'Zamknij' }));

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('hides the show-all button when six expenses or fewer', async () => {
    stubApi();

    render(<Main />);

    await screen.findByText('Limity');
    expect(
      screen.queryByRole('button', { name: 'Pokaż wszystkie' }),
    ).toBeNull();
  });

  it('shows the previous month after going back without asking again', async () => {
    const calls = stubApi(false, {
      expenses: [spend('a', 4), spend('b', 7, 'c-1', previousMonth)],
    });
    render(<Main />);
    await screen.findByRole('button', { name: /^Sklep a/ });
    const asked = calls.length;

    await userEvent.click(
      screen.getByRole('button', { name: 'Poprzedni okres' }),
    );

    expect(
      await screen.findByRole('button', { name: /^Sklep b/ }),
    ).toBeTruthy();
    expect(
      calls
        .map(({ url }) => url)
        .slice(asked)
        .filter((url) => !url.includes('/api/avatar')),
    ).toEqual([]);
  });

  it('shows a skeleton until all the data arrived', async () => {
    stubApi();

    render(<Main />);

    expect(screen.queryByText('Wydatki w tym miesiącu')).toBeNull();
    expect(await screen.findByText('Wydatki w tym miesiącu')).toBeTruthy();
    expect(screen.getByText('Limity')).toBeTruthy();
  });

  it('loads everything in one go, once', async () => {
    const calls = stubApi();

    render(<Main />);

    await screen.findByText('Limity');
    const dashboardCalls = calls.filter(
      ({ url }) => !url.includes('/api/notifications'),
    );
    expect(dashboardCalls.map(({ url }) => url.split('?')[0]).sort()).toEqual([
      '/api/avatar/',
      '/api/categories/',
      '/api/expenses/',
      '/api/limits/',
      '/api/recurring/',
    ]);
  });

  it('shows only the failure screen when any part fails to load', async () => {
    answerApi(server, ({ url }) =>
      url.includes('/api/limits')
        ? { code: 500, message: 'boom' }
        : readBody(url),
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
    answerApi(server, ({ url }) => ({
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
          : [],
    }));

  const openSeptember = async () => {
    window.history.replaceState(null, '', '/app/?month=2026-09');
    render(<Main />);
  };

  it('lists only the expenses of the selected month', async () => {
    stubWithExpenses();

    await openSeptember();

    await screen.findByRole('button', { name: /^Sklep Testowy/ });
    expect(screen.getByRole('button', { name: /^Kino Testowe/ })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Stary Sklep/ })).toBeNull();
  });

  it('narrows the list to the chosen category', async () => {
    stubWithExpenses();
    await openSeptember();
    await screen.findByRole('button', { name: /^Sklep Testowy/ });

    await userEvent.click(screen.getByRole('button', { name: /^Rozrywka 1/ }));

    expect(screen.getByRole('button', { name: /^Kino Testowe/ })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /^Sklep Testowy/ })).toBeNull();
  });

  it('brings every expense back with the all filter', async () => {
    stubWithExpenses();
    await openSeptember();
    await screen.findByRole('button', { name: /^Sklep Testowy/ });
    await userEvent.click(screen.getByRole('button', { name: /^Rozrywka 1/ }));

    await userEvent.click(screen.getByRole('button', { name: /^Wszystkie 2/ }));

    expect(screen.getByRole('button', { name: /^Sklep Testowy/ })).toBeTruthy();
  });
});
