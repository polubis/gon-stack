import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

const { navigateTo } = vi.hoisted(() => ({ navigateTo: vi.fn() }));

vi.mock('@/shared/router/navigation', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/router/navigation')>()),
  navigateTo,
}));

const { Main } = await import('../presentation/main');

const CATEGORY = { id: 'c-1', name: 'Spożywcze', icon: 'cart', color: '#0a0' };

const STORED = {
  id: 'e-1',
  merchant: 'Piekarnia',
  date: '2025-04-10T10:00:00.000Z',
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
};

const server = setupServer();

const mockBackend = (stored: object[] = [STORED], putStatus = 200) => {
  const written: Record<string, unknown>[] = [];
  server.use(
    http.get('/api/categories/', () =>
      HttpResponse.json({ code: 200, data: [CATEGORY] }),
    ),
    http.get('/api/expenses/', () =>
      HttpResponse.json({ code: 200, data: stored }),
    ),
    http.put('/api/expenses/:id/', async ({ request }) => {
      const body = (await request.json()) as Record<string, unknown>;
      written.push(body);
      return putStatus === 200
        ? HttpResponse.json({ code: 200, data: body })
        : HttpResponse.json({ code: 500, message: 'boom' });
    }),
  );
  return written;
};

const open = async (query = '?id=e-1&month=2025-04') => {
  window.history.replaceState(null, '', `/app/expenses/edit/${query}`);
  const user = userEvent.setup();
  render(<Main />);
  return user;
};

describe('editing an expense on its own page', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  beforeEach(() => navigateTo.mockClear());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('shows the same form as adding, filled with the expense', async () => {
    mockBackend();
    await open();

    expect(await screen.findByLabelText('Sklep')).toHaveValue('Piekarnia');
    expect(screen.getByLabelText('Metoda płatności')).toHaveValue('Karta');
    expect(screen.getByText('Produkty (1)')).toBeVisible();
    expect(screen.getByRole('button', { name: /Chleb/ })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Dodaj produkt' })).toBeEnabled();
    expect(
      screen.queryByRole('tab', { name: 'Cykliczny' }),
    ).not.toBeInTheDocument();
  });

  it('saves a product added while editing and returns to the month', async () => {
    const written = mockBackend();
    const user = await open();
    await screen.findByLabelText('Sklep');

    await user.click(screen.getByRole('button', { name: 'Dodaj produkt' }));
    await user.type(screen.getByLabelText('Nazwa produktu'), 'Masło');
    await user.type(screen.getByLabelText('Cena'), '7');
    await user.click(screen.getByRole('button', { name: 'Zapisz zmiany' }));

    await waitFor(() => expect(written).toHaveLength(1));
    expect(written[0]).toMatchObject({
      id: 'e-1',
      amount: 10.2,
      items: [{ name: 'Chleb' }, { name: 'Masło', unitPrice: 7 }],
    });
    await waitFor(() =>
      expect(navigateTo).toHaveBeenCalledWith('/app/?month=2025-04'),
    );
  });

  it('saves a removed product', async () => {
    const written = mockBackend();
    const user = await open();

    await user.click(await screen.findByRole('button', { name: /Chleb/ }));
    await user.click(screen.getByRole('button', { name: 'Usuń produkt' }));
    await user.click(screen.getByRole('button', { name: 'Zapisz zmiany' }));

    await waitFor(() => expect(written).toHaveLength(1));
    expect(written[0]).toMatchObject({ items: [] });
  });

  it('stays on the page and reports an error when saving fails', async () => {
    mockBackend([STORED], 500);
    const user = await open();

    await user.click(
      await screen.findByRole('button', { name: 'Zapisz zmiany' }),
    );

    expect(await screen.findByText(/boom/)).toBeVisible();
    expect(navigateTo).not.toHaveBeenCalled();
  });

  it('links Cancel back to the month', async () => {
    mockBackend();
    await open();

    expect(await screen.findByRole('link', { name: 'Anuluj' })).toHaveAttribute(
      'href',
      '/app/?month=2025-04',
    );
  });

  it('says so when the expense does not exist', async () => {
    mockBackend([]);
    await open('?id=gone&month=2025-04');

    expect(await screen.findByText('Nie znaleziono wydatku')).toBeVisible();
  });
});
