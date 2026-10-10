import { render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { currentMonth } from '../domain/format';
import { Main } from '../presentation/main';
import { readBody } from './dashboard-backend';

const CATEGORY = {
  id: 'c-1',
  name: 'Jedzenie',
  icon: 'cart',
  color: '#16a34a',
};

const expense = () => ({
  id: 'e-1',
  merchant: 'Piekarnia',
  date: `${currentMonth()}-02T10:00:00Z`,
  amount: 3.2,
  categoryId: 'c-1',
  paymentMethod: 'Karta',
  isBill: false,
  source: 'manual',
  items: [
    {
      id: 'i-1',
      name: 'Chleb',
      unitPrice: 3.2,
      quantity: 1,
      discount: 0,
      categoryId: 'c-1',
    },
  ],
});

describe('expense popup', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/app/?modal=expense:e-1');
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => ({
        json: async () =>
          readBody(url, { expenses: [expense()], categories: [CATEGORY] }),
      })),
    );
  });
  afterEach(() => vi.unstubAllGlobals());

  it('only shows the expense and its products', async () => {
    render(<Main />);
    const dialog = within(await screen.findByRole('dialog'));

    expect(dialog.getByText('Chleb')).toBeVisible();
    expect(dialog.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('sends Edit to the edit page of that expense', async () => {
    render(<Main />);
    const dialog = within(await screen.findByRole('dialog'));

    expect(dialog.getByRole('link', { name: 'Edytuj' })).toHaveAttribute(
      'href',
      `/app/expenses/edit/?id=e-1&month=${currentMonth()}`,
    );
  });
});
