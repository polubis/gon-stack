import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import type {
  CategoryId,
  ExpenseId,
  NewExpense,
  NewRecurring,
  ProductId,
  RecurringId,
  StoredExpense,
} from '../domain/models';
import {
  fetchCategories,
  fetchExpense,
  postExpense,
  postReceiptScan,
  postRecurring,
  putExpense,
} from '../integration/repository';

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const FOOD = 'c-1' as CategoryId;
const product = {
  id: 'p-1' as ProductId,
  name: 'Milk',
  unitPrice: 4,
  quantity: 2,
  discount: 1,
  categoryId: FOOD,
};
const expense: NewExpense = {
  id: 'e-1' as ExpenseId,
  merchant: 'Shop',
  date: '2026-11-15T10:00:00.000Z',
  amount: 7,
  categoryId: FOOD,
  paymentMethod: 'card',
  isBill: false,
  source: 'manual',
  device: null,
  items: [product],
};
const signal = () => new AbortController().signal;
const failure = (code: number) => HttpResponse.json({ code, message: 'Boom' });

describe('categories', () => {
  it('loads the user categories', async () => {
    server.use(
      http.get('/api/categories/', () =>
        HttpResponse.json({
          code: 200,
          data: [{ id: 'c-1', name: 'Food', icon: 'cart', color: '#0f7a4f' }],
        }),
      ),
    );

    await expect(fetchCategories(signal())).resolves.toEqual([
      { id: 'c-1', name: 'Food', icon: 'cart', color: '#0f7a4f' },
    ]);
  });

  it('fails with the server message', async () => {
    server.use(http.get('/api/categories/', () => failure(500)));

    await expect(fetchCategories(signal())).rejects.toThrow('Boom');
  });
});

describe('saving an expense', () => {
  it('sends the expense to the server', async () => {
    let sent: unknown;
    server.use(
      http.post('/api/expenses/', async ({ request }) => {
        sent = await request.json();
        return HttpResponse.json({ code: 201 });
      }),
    );

    await postExpense(expense);

    expect(sent).toMatchObject({ id: 'e-1', merchant: 'Shop', amount: 7 });
  });

  it('fails with the server message when it is rejected', async () => {
    server.use(http.post('/api/expenses/', () => failure(409)));

    await expect(postExpense(expense)).rejects.toThrow('Boom');
  });

  it('updates a stored expense under its own address', async () => {
    let sent: unknown;
    server.use(
      http.put('/api/expenses/e-1/', async ({ request }) => {
        sent = await request.json();
        return HttpResponse.json({ code: 200 });
      }),
    );
    const stored: StoredExpense = {
      ...expense,
      recurringId: null,
      occurrenceDate: null,
    };

    await putExpense({ ...stored, merchant: 'Other' });

    expect(sent).toMatchObject({ id: 'e-1', merchant: 'Other' });
  });

  it('fails with the server message when the update is rejected', async () => {
    server.use(http.put('/api/expenses/e-1/', () => failure(404)));

    await expect(
      putExpense({ ...expense, recurringId: null, occurrenceDate: null }),
    ).rejects.toThrow('Boom');
  });
});

describe('loading one expense', () => {
  const listed = (items: object[]) =>
    http.get('/api/expenses/', () =>
      HttpResponse.json({ code: 200, data: items }),
    );

  it('finds it among the listed ones', async () => {
    server.use(listed([{ ...expense, id: 'e-2' }, expense]));

    const found = await fetchExpense('e-1', signal());

    expect(found?.merchant).toBe('Shop');
  });

  it('gives nothing when no such expense exists', async () => {
    server.use(listed([]));

    await expect(fetchExpense('e-1', signal())).resolves.toBeNull();
  });

  it('asks in the browser time zone', async () => {
    let tz: string | null = null;
    server.use(
      http.get('/api/expenses/', ({ request }) => {
        tz = new URL(request.url).searchParams.get('tz');
        return HttpResponse.json({ code: 200, data: [] });
      }),
    );

    await fetchExpense('e-1', signal());

    expect(tz).toBe(Intl.DateTimeFormat().resolvedOptions().timeZone);
  });

  it('fails with the server message', async () => {
    server.use(http.get('/api/expenses/', () => failure(500)));

    await expect(fetchExpense('e-1', signal())).rejects.toThrow('Boom');
  });
});

describe('saving a recurring rule', () => {
  const recurring: NewRecurring = {
    id: 'r-1' as RecurringId,
    name: 'Rent',
    cost: 7,
    interval: 'monthly',
    startDate: '2026-11-01',
    endDate: null,
    active: true,
    paymentMethod: 'card',
    categoryId: FOOD,
    items: [product],
  };

  it('sends the rule to the server', async () => {
    let sent: unknown;
    server.use(
      http.post('/api/recurring/', async ({ request }) => {
        sent = await request.json();
        return HttpResponse.json({ code: 201 });
      }),
    );

    await postRecurring(recurring);

    expect(sent).toMatchObject({
      id: 'r-1',
      name: 'Rent',
      interval: 'monthly',
    });
  });

  it('fails with the server message when it is rejected', async () => {
    server.use(http.post('/api/recurring/', () => failure(400)));

    await expect(postRecurring(recurring)).rejects.toThrow('Boom');
  });
});

describe('scanning a receipt', () => {
  const photo = () => new File(['x'], 'r.png', { type: 'image/png' });

  it('uploads the photo and gives the draft back', async () => {
    let contentType: string | null = null;
    server.use(
      http.post('/api/receipts/scan/', async ({ request }) => {
        contentType = request.headers.get('content-type');
        return HttpResponse.json({
          code: 200,
          data: {
            merchant: 'Shop',
            date: '2026-11-15T10:00:00.000Z',
            amount: 7,
            paymentMethod: null,
            items: [],
          },
        });
      }),
    );

    const draft = await postReceiptScan(photo(), signal());

    expect(contentType).toMatch(/^multipart\/form-data/);
    expect(draft.merchant).toBe('Shop');
  });

  it('fails with the server message when the receipt cannot be read', async () => {
    server.use(http.post('/api/receipts/scan/', () => failure(422)));

    await expect(postReceiptScan(photo(), signal())).rejects.toThrow('Boom');
  });
});
