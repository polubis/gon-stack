import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { currentMonth } from '../domain/format';
import { Main } from '../presentation/main';
import { answerApi, readBody, startBackend } from './dashboard-backend';

const CATEGORY = {
  id: 'c-1',
  name: 'Jedzenie',
  icon: 'cart',
  color: '#16a34a',
};

const expense = (
  id: string,
  merchant: string,
  day: string,
  amount: number,
) => ({
  id,
  merchant,
  date: `${currentMonth()}-${day}T10:00:00`,
  amount,
  categoryId: 'c-1',
  paymentMethod: 'Karta',
  isBill: false,
  source: 'manual',
  device: null,
  recurringId: null,
  occurrenceDate: null,
  items: [],
});

const server = startBackend();

describe('expenses list grouped by day', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/app/');
    answerApi(server, ({ url }) =>
      readBody(url, {
        expenses: [
          expense('e-1', 'Biedronka', '02', 62.1),
          expense('e-2', 'Piekarnia', '02', 22.1),
          expense('e-3', 'Stacja', '01', 210),
        ],
        categories: [CATEGORY],
      }),
    );
  });

  it('shows one heading per day with the day total', async () => {
    render(<Main />);
    const list = within(await screen.findByRole('region', { name: 'Wydatki' }));

    const headings = await list.findAllByRole('heading', { level: 3 });

    expect(headings).toHaveLength(2);
    expect(headings[0].closest('li')).toHaveTextContent('-84,20');
    expect(headings[1].closest('li')).toHaveTextContent('-210,00');
  });

  it('shows the amount as outflow with the category under the title', async () => {
    render(<Main />);
    const list = within(await screen.findByRole('region', { name: 'Wydatki' }));

    const row = (await list.findByText('Biedronka')).closest('li')!;

    expect(within(row).getByText('-62,10', { exact: false })).toBeVisible();
    expect(within(row).getByText('Jedzenie')).toBeVisible();
    expect(
      within(row).getByRole('button', { name: 'Więcej: Biedronka' }),
    ).toBeVisible();
  });
});
