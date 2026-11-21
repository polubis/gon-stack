import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { fetchCategories, fetchExpenses } from '../integration/repository';

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const signal = () => new AbortController().signal;

describe('data export repository', () => {
  it('lists expenses of the account', async () => {
    server.use(
      http.get('/api/expenses/', () =>
        HttpResponse.json({
          code: 200,
          data: [
            {
              id: 'e-1',
              merchant: 'Shop',
              date: '2025-04-09T12:00:00.000Z',
              amount: 5,
              categoryId: null,
              paymentMethod: 'cash',
            },
          ],
        }),
      ),
    );

    const expenses = await fetchExpenses(signal());

    expect(expenses.map((expense) => expense.merchant)).toEqual(['Shop']);
  });

  it('fails the expenses list with the server message', async () => {
    server.use(
      http.get('/api/expenses/', () =>
        HttpResponse.json({ code: 401, message: 'Sesja wygasła' }),
      ),
    );

    await expect(fetchExpenses(signal())).rejects.toThrow('Sesja wygasła');
  });

  it('lists categories of the account', async () => {
    server.use(
      http.get('/api/categories/', () =>
        HttpResponse.json({
          code: 200,
          data: [{ id: 'c-1', name: 'Food', color: 'red' }],
        }),
      ),
    );

    const categories = await fetchCategories(signal());

    expect(categories).toEqual([{ id: 'c-1', name: 'Food' }]);
  });

  it('fails the categories list with the server message', async () => {
    server.use(
      http.get('/api/categories/', () =>
        HttpResponse.json({ code: 500, message: 'Błąd serwera' }),
      ),
    );

    await expect(fetchCategories(signal())).rejects.toThrow('Błąd serwera');
  });
});
