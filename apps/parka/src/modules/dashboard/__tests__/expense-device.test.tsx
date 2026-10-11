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

const expense = (id: string, merchant: string, device: object | null) => ({
  id,
  merchant,
  date: `${currentMonth()}-02T10:00:00Z`,
  amount: 3.2,
  categoryId: 'c-1',
  paymentMethod: 'Karta',
  isBill: false,
  source: 'manual',
  device,
  items: [],
});

describe('expense device in the list', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => ({
        json: async () =>
          readBody(url, {
            categories: [CATEGORY],
            expenses: [
              expense('e-1', 'Piekarnia', {
                id: 'device-1',
                name: 'Safari on iOS',
                type: 'mobile',
              }),
              expense('e-2', 'Kiosk', null),
            ],
          }),
      })),
    );
  });
  afterEach(() => vi.unstubAllGlobals());

  it('names the device on a row that has one', async () => {
    render(<Main />);
    const row = await screen.findByRole('button', { name: /Piekarnia/ });

    expect(within(row).getByText('Safari on iOS')).toBeInTheDocument();
  });

  it('shows no device on a row created before devices were tracked', async () => {
    render(<Main />);
    const row = await screen.findByRole('button', { name: /Kiosk/ });

    expect(within(row).queryByText(/ on /)).not.toBeInTheDocument();
  });
});
