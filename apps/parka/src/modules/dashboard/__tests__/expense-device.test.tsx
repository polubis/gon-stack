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

const server = startBackend();

let custom: string | null = null;

describe('expense device in the list', () => {
  beforeEach(() => {
    custom = null;
    answerApi(server, ({ url }) =>
      readBody(url, {
        categories: [CATEGORY],
        expenses: [
          expense('e-1', 'Piekarnia', {
            id: 'device-1',
            name: 'Safari on iOS',
            type: 'mobile',
            avatar: 'rocket',
            model: 'SM-S918B',
            os: 'iOS 17',
            browser: 'Safari',
            screen: null,
            customName: custom,
          }),
          expense('e-2', 'Kiosk', null),
        ],
      }),
    );
  });

  it('names the device on a row that has one', async () => {
    render(<Main />);
    const row = await screen.findByRole('button', { name: /Piekarnia/ });

    expect(
      within(row).getByText('SM-S918B · iOS 17 · Safari'),
    ).toBeInTheDocument();
    expect(within(row).getByText('#ce-1')).toBeInTheDocument();
  });

  it('shows the custom name instead of the built one', async () => {
    custom = 'Telefon Ani';
    render(<Main />);
    const row = await screen.findByRole('button', { name: /Piekarnia/ });

    expect(within(row).getByText('Telefon Ani')).toBeInTheDocument();
  });

  it('colors the avatar by the device id', async () => {
    render(<Main />);
    const row = await screen.findByRole('button', { name: /Piekarnia/ });

    expect(row.querySelector('[data-device-color]')).not.toBeNull();
  });

  it('shows the avatar chosen for the device', async () => {
    render(<Main />);
    const row = await screen.findByRole('button', { name: /Piekarnia/ });

    expect(row.querySelector('[data-avatar="rocket"]')).not.toBeNull();
  });

  it('shows no device on a row created before devices were tracked', async () => {
    render(<Main />);
    const row = await screen.findByRole('button', { name: /Kiosk/ });

    expect(within(row).queryByText(/ on /)).not.toBeInTheDocument();
  });
});
