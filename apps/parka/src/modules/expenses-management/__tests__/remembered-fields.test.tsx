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

const FOOD = { id: 'c-1', name: 'Spożywcze', icon: 'cart', color: '#0a0' };
const FUN = { id: 'c-2', name: 'Rozrywka', icon: 'film', color: '#a0a' };
const STORED = {
  id: 'e-1',
  merchant: 'Piekarnia',
  date: '2025-04-10T10:00:00.000Z',
  amount: 3.2,
  categoryId: 'c-1',
  paymentMethod: 'Karta',
  isBill: false,
  source: 'manual',
  items: [],
};

const server = setupServer();

const mockBackend = (categories: object[]) =>
  server.use(
    http.get('/api/categories/', () =>
      HttpResponse.json({ code: 200, data: categories }),
    ),
    http.get('/api/expenses/', () =>
      HttpResponse.json({ code: 200, data: [STORED] }),
    ),
    http.post('/api/expenses/', async ({ request }) =>
      HttpResponse.json({ code: 201, data: await request.json() }),
    ),
  );

const openNew = async () => {
  window.history.replaceState(null, '', '/app/expenses/new/');
  const user = userEvent.setup();
  const view = render(<Main />);
  await screen.findByLabelText('Sklep');
  return { user, view };
};

const addExpense = async (
  user: Awaited<ReturnType<typeof openNew>>['user'],
  method: string,
  category: string,
  merchant = 'Kino',
) => {
  await user.clear(screen.getByLabelText('Sklep'));
  await user.type(screen.getByLabelText('Sklep'), merchant);
  await user.type(screen.getByLabelText('Kwota'), '20');
  await user.selectOptions(screen.getByLabelText('Kategoria'), category);
  await user.clear(screen.getByLabelText('Metoda płatności'));
  if (method)
    await user.type(screen.getByLabelText('Metoda płatności'), method);
  await user.click(screen.getByRole('button', { name: 'Dodaj wydatek' }));
  await waitFor(() => expect(navigateTo).toHaveBeenCalled());
};

describe('remembered expense form fields', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  beforeEach(() => window.localStorage.clear());
  afterEach(() => {
    server.resetHandlers();
    navigateTo.mockClear();
  });
  afterAll(() => server.close());

  it('starts blank when nothing was remembered', async () => {
    mockBackend([FOOD, FUN]);
    await openNew();

    expect(screen.getByLabelText('Metoda płatności')).toHaveValue('');
    expect(screen.getByLabelText('Kategoria')).toHaveValue('c-2');
  });

  it('prefills payment method and category after an expense was added', async () => {
    mockBackend([FOOD, FUN]);
    const first = await openNew();
    await addExpense(first.user, 'BLIK', 'Spożywcze');
    first.view.unmount();

    await openNew();

    expect(screen.getByLabelText('Metoda płatności')).toHaveValue('BLIK');
    expect(screen.getByLabelText('Kategoria')).toHaveValue('c-1');
  });

  it('prefills the shop trimmed after an expense was added', async () => {
    mockBackend([FOOD, FUN]);
    const first = await openNew();
    await addExpense(first.user, 'BLIK', 'Spożywcze', '  Biedronka ');
    first.view.unmount();

    await openNew();

    expect(screen.getByLabelText('Sklep')).toHaveValue('Biedronka');
  });

  it('prefills the category and method from differently cased memory', async () => {
    window.localStorage.setItem(
      'parka:form-memory',
      JSON.stringify({
        'expense.categoryId': ' C-1 ',
        'expense.paymentMethod': '  BLIK ',
      }),
    );
    mockBackend([FOOD, FUN]);
    await openNew();

    expect(screen.getByLabelText('Kategoria')).toHaveValue('c-1');
    expect(screen.getByLabelText('Metoda płatności')).toHaveValue('BLIK');
  });

  it('leaves the category on its default when the remembered one was deleted', async () => {
    mockBackend([FOOD, FUN]);
    const first = await openNew();
    await addExpense(first.user, 'BLIK', 'Spożywcze');
    first.view.unmount();
    mockBackend([FUN]);

    await openNew();

    expect(screen.getByLabelText('Kategoria')).toHaveValue('c-2');
    expect(screen.getByLabelText('Metoda płatności')).toHaveValue('BLIK');
  });

  it('forgets a payment method saved empty', async () => {
    mockBackend([FOOD, FUN]);
    const first = await openNew();
    await addExpense(first.user, 'BLIK', 'Spożywcze');
    first.view.unmount();
    const second = await openNew();
    await addExpense(second.user, '', 'Spożywcze');
    second.view.unmount();

    await openNew();

    expect(screen.getByLabelText('Metoda płatności')).toHaveValue('');
  });

  it('starts blank when the stored memory is corrupt', async () => {
    window.localStorage.setItem('parka:form-memory', '{oops');
    mockBackend([FOOD, FUN]);
    await openNew();

    expect(screen.getByLabelText('Sklep')).toHaveValue('');
    expect(screen.getByLabelText('Metoda płatności')).toHaveValue('');
    expect(screen.getByLabelText('Kategoria')).toHaveValue('c-2');
  });

  it('does not prefill when editing an expense', async () => {
    window.localStorage.setItem(
      'parka:form-memory',
      JSON.stringify({
        'expense.paymentMethod': 'BLIK',
        'expense.categoryId': 'c-2',
        'expense.merchant': 'Lidl',
      }),
    );
    mockBackend([FOOD, FUN]);
    window.history.replaceState(null, '', '/app/expenses/edit/?id=e-1');
    render(<Main />);

    expect(await screen.findByLabelText('Sklep')).toHaveValue('Piekarnia');
    expect(screen.getByLabelText('Metoda płatności')).toHaveValue('Karta');
    expect(screen.getByLabelText('Kategoria')).toHaveValue('c-1');
  });
});
