import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { addDays, periodContaining, todayDay } from '@/shared/period/period';
import { Main } from '../presentation/main';
import { readBody } from './dashboard-backend';

const CATEGORY = {
  id: 'c-1',
  name: 'Rozrywka',
  icon: 'cart',
  color: '#16a34a',
};

const rule = () => ({
  id: 'r-1',
  name: 'Netflix',
  cost: 30,
  interval: 'monthly',
  startDate: addDays(todayDay(), 5),
  endDate: null,
  lastMaterializedDate: null,
  active: true,
  paymentMethod: 'Karta',
  categoryId: 'c-1',
});

const charged = () => ({
  id: 'r-1:charged',
  merchant: 'Netflix',
  date: new Date().toISOString(),
  amount: 30,
  categoryId: 'c-1',
  paymentMethod: 'Karta',
  isBill: true,
  source: 'manual',
  device: null,
  recurringId: 'r-1',
  occurrenceDate: todayDay(),
  items: [],
});

let calls: { method: string; url: string }[] = [];

const stubApi = (reads: Parameters<typeof readBody>[1]) =>
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      calls.push({ method: init?.method ?? 'GET', url });
      return {
        json: async () =>
          init?.method === 'DELETE'
            ? { code: 200, ok: true }
            : readBody(url, reads),
      };
    }),
  );

const deletes = () => calls.filter((c) => c.method === 'DELETE');

describe('upcoming payment', () => {
  beforeEach(() => {
    calls = [];
    window.history.replaceState(null, '', '/app/');
    stubApi({ recurring: [rule()], categories: [CATEGORY] });
  });
  afterEach(() => vi.unstubAllGlobals());

  it('is announced apart from the expenses and counted nowhere', async () => {
    render(<Main />);
    const upcoming = within(
      await screen.findByRole('region', { name: /Nadchodzące/ }),
    );
    const expenses = within(screen.getByRole('region', { name: 'Wydatki' }));

    expect(upcoming.getByText('Netflix')).toBeVisible();
    expect(upcoming.getByText('Nadchodzący')).toBeVisible();
    expect(expenses.getByText('Brak wydatków w tym okresie.')).toBeVisible();
    expect(expenses.getByText(/^0 · /)).toBeVisible();
  });

  it('stays hidden when its date falls beyond the selected range', async () => {
    const nextMonth = addDays(periodContaining('month', todayDay()).to, 1);
    stubApi({
      recurring: [{ ...rule(), startDate: nextMonth }],
      categories: [CATEGORY],
    });
    render(<Main />);
    const expenses = within(
      await screen.findByRole('region', { name: 'Wydatki' }),
    );

    expect(expenses.getByText('Brak wydatków w tym okresie.')).toBeVisible();
    expect(screen.queryByRole('region', { name: /Nadchodzące/ })).toBeNull();
  });
  it('says that editing reaches this and the following payments', async () => {
    const user = userEvent.setup();
    render(<Main />);
    await user.click(await screen.findByRole('button', { name: /Netflix/ }));
    const dialog = within(await screen.findByRole('dialog'));

    expect(dialog.getByText(/Edytujesz ten i kolejne wydatki/)).toBeVisible();
  });

  it('asks before deleting and says the rule goes, not the history', async () => {
    const user = userEvent.setup();
    render(<Main />);
    await user.click(await screen.findByRole('button', { name: /Netflix/ }));
    await user.click(
      within(await screen.findByRole('dialog')).getByRole('button', {
        name: 'Usuń',
      }),
    );
    const confirm = within(
      await screen.findByRole('dialog', { name: /Usunąć wydatek cykliczny/ }),
    );

    expect(deletes()).toHaveLength(0);
    expect(confirm.getByText(/Usuniesz regułę/)).toBeVisible();
    expect(confirm.getByText(/zostają w historii/)).toBeVisible();

    await user.click(confirm.getByRole('button', { name: 'Usuń regułę' }));

    await waitFor(() => expect(deletes()).toHaveLength(1));
    expect(deletes()[0]!.url).toBe('/api/recurring/r-1/');
    // Closing steps Back asynchronously: let it land before the next test.
    await waitFor(() => expect(window.location.search).toBe(''));
  });
});

describe('charged recurring expense', () => {
  beforeEach(() => {
    calls = [];
    window.history.replaceState(null, '', '/app/?modal=expense:r-1:charged');
    stubApi({
      recurring: [{ ...rule(), lastMaterializedDate: todayDay() }],
      expenses: [charged()],
      categories: [CATEGORY],
    });
  });
  afterEach(() => vi.unstubAllGlobals());

  it('says that editing touches only this expense', async () => {
    render(<Main />);
    const dialog = within(await screen.findByRole('dialog'));

    expect(
      dialog.getByText(/Edycja i usunięcie dotyczą tylko jego/),
    ).toBeVisible();
    expect(dialog.getByRole('link', { name: 'Edytuj' })).toBeVisible();
  });

  it('asks before deleting and says the rule and the others stay', async () => {
    const user = userEvent.setup();
    render(<Main />);
    await user.click(
      within(await screen.findByRole('dialog')).getByRole('button', {
        name: 'Usuń',
      }),
    );
    const confirm = within(
      await screen.findByRole('dialog', { name: /Usunąć wydatek „Netflix”/ }),
    );

    expect(deletes()).toHaveLength(0);
    expect(confirm.getByText(/Usuniesz tylko ten wydatek/)).toBeVisible();
    expect(
      confirm.getByText(/Reguła cykliczna i pozostałe wydatki zostają/),
    ).toBeVisible();

    await user.click(confirm.getByRole('button', { name: 'Usuń wydatek' }));

    await waitFor(() => expect(deletes()).toHaveLength(1));
    expect(deletes()[0]!.url).toBe('/api/expenses/r-1:charged/');
    expect(deletes().some((c) => c.url.includes('/api/recurring/'))).toBe(
      false,
    );
    await waitFor(() => expect(window.location.search).toBe(''));
  });

  it('leaves the expense alone when the confirmation is cancelled', async () => {
    const user = userEvent.setup();
    render(<Main />);
    await user.click(
      within(await screen.findByRole('dialog')).getByRole('button', {
        name: 'Usuń',
      }),
    );
    const confirm = within(
      await screen.findByRole('dialog', { name: /Usunąć wydatek „Netflix”/ }),
    );
    await user.click(confirm.getByRole('button', { name: 'Anuluj' }));

    await waitFor(() =>
      expect(
        screen.queryByRole('dialog', { name: /Usunąć wydatek/ }),
      ).not.toBeInTheDocument(),
    );
    expect(deletes()).toHaveLength(0);
  });
});
