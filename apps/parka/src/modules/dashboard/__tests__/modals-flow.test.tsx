import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { currentMonth } from '../domain/format';
import { Main } from '../presentation/main';
import { readBody } from './dashboard-backend';

const modalsInUrl = () =>
  new URLSearchParams(window.location.search).getAll('modal');

const stubExpenses = () => {
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
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => ({
      json: async () => readBody(url, { expenses }),
    })),
  );
};

const openAllExpenses = async (user: ReturnType<typeof userEvent.setup>) => {
  await screen.findByText('Sklep 2');
  await user.click(screen.getByRole('button', { name: 'Pokaż wszystkie' }));
  return within(await screen.findByRole('dialog'));
};

const dialogs = () => screen.queryAllByRole('dialog', { hidden: true });

describe('dashboard modals', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('stacks an expense popup over the open expenses list', async () => {
    stubExpenses();
    const user = userEvent.setup();
    render(<Main />);

    const list = await openAllExpenses(user);
    await user.click(list.getByRole('button', { name: /Sklep 0/ }));

    await waitFor(() => expect(dialogs()).toHaveLength(2));
    expect(modalsInUrl()).toEqual(['expenses', 'expense:e-0']);
  });

  it('closes only the top popup on browser Back', async () => {
    stubExpenses();
    const user = userEvent.setup();
    render(<Main />);
    const list = await openAllExpenses(user);
    await user.click(list.getByRole('button', { name: /Sklep 0/ }));
    await waitFor(() => expect(dialogs()).toHaveLength(2));

    window.history.back();

    await waitFor(() => expect(dialogs()).toHaveLength(1));
    expect(modalsInUrl()).toEqual(['expenses']);
    window.history.back();
    await waitFor(() => expect(dialogs()).toHaveLength(0));
    expect(modalsInUrl()).toEqual([]);
  });

  it('closing with the X button acts like Back', async () => {
    stubExpenses();
    const user = userEvent.setup();
    render(<Main />);
    const list = await openAllExpenses(user);
    await user.click(list.getByRole('button', { name: /Sklep 0/ }));
    await waitFor(() => expect(dialogs()).toHaveLength(2));

    const top = within(screen.getByRole('dialog', { name: 'Sklep 0' }));
    await user.click(top.getByRole('button', { name: 'Zamknij' }));

    await waitFor(() => expect(dialogs()).toHaveLength(1));
    expect(modalsInUrl()).toEqual(['expenses']);
  });

  it('closing with Escape removes only the top popup', async () => {
    stubExpenses();
    const user = userEvent.setup();
    render(<Main />);
    const list = await openAllExpenses(user);
    await user.click(list.getByRole('button', { name: /Sklep 0/ }));
    await waitFor(() => expect(dialogs()).toHaveLength(2));

    await user.keyboard('{Escape}');

    await waitFor(() => expect(dialogs()).toHaveLength(1));
    expect(modalsInUrl()).toEqual(['expenses']);
  });

  it('opens the stack from the URL on load', async () => {
    stubExpenses();
    window.history.replaceState(null, '', '/?modal=expenses&modal=expense:e-3');

    render(<Main />);

    expect(await screen.findByRole('dialog', { name: 'Sklep 3' })).toBeTruthy();
    expect(dialogs()).toHaveLength(2);
  });

  it('closes a deep-linked popup without leaving the page', async () => {
    stubExpenses();
    window.history.replaceState(null, '', '/?modal=expenses');
    const user = userEvent.setup();
    render(<Main />);

    const list = within(await screen.findByRole('dialog'));
    await user.click(list.getByRole('button', { name: 'Zamknij' }));

    await waitFor(() => expect(dialogs()).toHaveLength(0));
    expect(modalsInUrl()).toEqual([]);
  });
});
