import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { Main } from '../presentation/main';

const EXPENSE = {
  id: 'e-1',
  merchant: 'Shop',
  date: new Date().toISOString(),
  amount: 10,
  categoryId: 'c-1',
  paymentMethod: 'card',
  isBill: false,
  source: 'manual',
  items: [],
};

const CATEGORY = { id: 'c-1', name: 'Jedzenie', icon: 'cart', color: 'green' };

const RECURRING = {
  id: 'r-1',
  name: 'Netflix',
  cost: 10,
  nextPaymentDate: '2025-05-01',
  active: true,
  paymentMethod: 'card',
  categoryId: 'c-1',
  history: [],
};

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const FAILURE = { code: 500, message: 'boom' };

const stubApi = (failing = false) =>
  server.use(
    http.get('/api/categories/', () =>
      HttpResponse.json(failing ? FAILURE : { code: 200, data: [CATEGORY] }),
    ),
    http.get('/api/recurring/', () =>
      HttpResponse.json(failing ? FAILURE : { code: 200, data: [RECURRING] }),
    ),
    http.get('/api/expenses/', () =>
      HttpResponse.json(failing ? FAILURE : { code: 200, data: [EXPENSE] }),
    ),
  );

describe('report screen', () => {
  it('disables downloads until the data is loaded', async () => {
    stubApi();

    render(<Main />);

    const csv = screen.getByRole('button', { name: /Pobierz CSV/ });
    expect(csv).toHaveProperty('disabled', true);
    await waitFor(() => expect(csv).toHaveProperty('disabled', false));
  });

  it('shows the month total once loaded', async () => {
    stubApi();

    render(<Main />);

    await waitFor(() => expect(screen.getByText(/10,00/)).toBeTruthy());
    expect(screen.getByRole('heading', { name: 'Raport' })).toBeTruthy();
  });

  it('reports a load failure with a tech code', async () => {
    stubApi(true);

    render(<Main />);

    await waitFor(() => expect(screen.getByText('REPORTS_LOAD')).toBeTruthy());
  });
});
