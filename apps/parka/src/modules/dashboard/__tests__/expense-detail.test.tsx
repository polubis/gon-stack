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

const expense = () => ({
  id: 'e-1',
  merchant: 'Piekarnia',
  date: `${currentMonth()}-02T10:00:00Z`,
  amount: 3.2,
  categoryId: 'c-1',
  paymentMethod: 'Karta',
  isBill: false,
  source: 'manual',
  device: { id: 'device-abc-123', name: 'Chrome on Windows', type: 'desktop' },
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

const server = startBackend();

describe('expense popup', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/app/?modal=expense:e-1');
    answerApi(server, ({ url }) =>
      readBody(url, { expenses: [expense()], categories: [CATEGORY] }),
    );
  });

  it('only shows the expense and its products', async () => {
    render(<Main />);
    const dialog = within(await screen.findByRole('dialog'));

    expect(dialog.getByText('Chleb')).toBeVisible();
    expect(dialog.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('shows each product with its category icon and no repeated category', async () => {
    render(<Main />);
    const dialog = within(await screen.findByRole('dialog'));
    const row = dialog.getByText('Chleb').closest('li')!;

    expect(row.querySelector('svg')).not.toBeNull();
    expect(within(row).queryByText('Jedzenie')).not.toBeInTheDocument();
  });

  it('keeps only name and price per product when the expense mixes categories', async () => {
    answerApi(server, ({ url }) =>
      readBody(url, {
        expenses: [{ ...expense(), categoryId: null }],
        categories: [CATEGORY],
      }),
    );
    render(<Main />);
    const dialog = within(await screen.findByRole('dialog'));
    const row = dialog.getByText('Chleb').closest('li')!;

    expect(row.querySelector('svg')).not.toBeNull();
    expect(within(row).queryByText('Jedzenie')).not.toBeInTheDocument();
  });

  it('shows the device it was created from with its id', async () => {
    render(<Main />);
    const dialog = within(await screen.findByRole('dialog'));

    expect(dialog.getByText('Chrome on Windows')).toBeVisible();
    expect(dialog.getByText('device-abc-123')).toBeVisible();
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
