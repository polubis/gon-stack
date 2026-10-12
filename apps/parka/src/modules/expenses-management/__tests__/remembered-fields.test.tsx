import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { pickOption } from '@/__tests__/pick-option';
import { fakeSuggestions } from '@/__tests__/suggestions-backend';
import type { Suggestion } from '@/shared/form-memory/domain/suggestions';
import { delay, http, HttpResponse } from 'msw';
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

let suggestions = fakeSuggestions();

const saved = (value: string, patch: Partial<Suggestion> = {}): Suggestion => ({
  field: 'merchant',
  value,
  useCount: 1,
  lastUsed: null,
  ...patch,
});

const mockBackend = (categories: object[]) =>
  server.use(
    ...suggestions.handlers,
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
  await pickOption(user, screen.getByLabelText('Kategoria'), category);
  await user.clear(screen.getByLabelText('Metoda płatności'));
  if (method)
    await user.type(screen.getByLabelText('Metoda płatności'), method);
  await user.click(screen.getByRole('button', { name: 'Dodaj wydatek' }));
  await waitFor(() => expect(navigateTo).toHaveBeenCalled());
};

describe('remembered expense form fields', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  beforeEach(() => {
    window.localStorage.clear();
    suggestions = fakeSuggestions();
  });
  afterEach(() => {
    server.resetHandlers();
    navigateTo.mockClear();
  });
  afterAll(() => server.close());

  it('starts blank when nothing was remembered', async () => {
    mockBackend([FOOD, FUN]);
    await openNew();

    expect(screen.getByLabelText('Metoda płatności')).toHaveValue('');
    expect(screen.getByLabelText('Kategoria')).toHaveTextContent(FUN.name);
  });

  it('prefills payment method and category after an expense was added', async () => {
    mockBackend([FOOD, FUN]);
    const first = await openNew();
    await addExpense(first.user, 'BLIK', 'Spożywcze');
    first.view.unmount();

    await openNew();

    expect(await screen.findByDisplayValue('BLIK')).toBe(
      screen.getByLabelText('Metoda płatności'),
    );
    expect(screen.getByLabelText('Kategoria')).toHaveTextContent(FOOD.name);
  });

  it('prefills the shop trimmed after an expense was added', async () => {
    mockBackend([FOOD, FUN]);
    const first = await openNew();
    await addExpense(first.user, 'BLIK', 'Spożywcze', '  Biedronka ');
    first.view.unmount();

    await openNew();

    expect(await screen.findByDisplayValue('Biedronka')).toBe(
      screen.getByLabelText('Sklep'),
    );
  });

  it('prefills the most used shop rather than the last one', async () => {
    suggestions = fakeSuggestions([
      saved('Lidl', { useCount: 2, lastUsed: '2026-02-01T00:00:00Z' }),
      saved('Biedronka', { useCount: 9, lastUsed: '2026-01-01T00:00:00Z' }),
    ]);
    mockBackend([FOOD, FUN]);
    await openNew();

    expect(await screen.findByDisplayValue('Biedronka')).toBe(
      screen.getByLabelText('Sklep'),
    );
  });

  it('counts one more use of the shop and the payment method on save', async () => {
    suggestions = fakeSuggestions([
      saved('Kino', { useCount: 4 }),
      saved('BLIK', { field: 'paymentMethod', useCount: 4 }),
    ]);
    mockBackend([FOOD, FUN]);
    const { user } = await openNew();
    await screen.findByDisplayValue('Kino');
    await addExpense(user, 'BLIK', 'Spożywcze');

    await waitFor(() =>
      expect(
        suggestions.items().map((s) => [s.field, s.value, s.useCount]),
      ).toEqual([
        ['merchant', 'Kino', 5],
        ['paymentMethod', 'BLIK', 5],
      ]),
    );
  });

  it('does not count a blank payment method', async () => {
    mockBackend([FOOD, FUN]);
    const { user } = await openNew();
    await addExpense(user, '', 'Spożywcze');

    await waitFor(() =>
      expect(suggestions.items().map((s) => s.field)).toEqual(['merchant']),
    );
  });

  it('suggests remembered shops while typing', async () => {
    suggestions = fakeSuggestions([
      saved('Biedronka', { useCount: 9 }),
      saved('Lidl', { useCount: 2 }),
    ]);
    mockBackend([FOOD, FUN]);
    const { user } = await openNew();
    await screen.findByDisplayValue('Biedronka');

    await user.clear(screen.getByLabelText('Sklep'));
    await user.type(screen.getByLabelText('Sklep'), 'li');

    expect(screen.getAllByRole('option')).toHaveLength(1);
    await user.click(screen.getByRole('option', { name: /Lidl/ }));
    expect(screen.getByLabelText('Sklep')).toHaveValue('Lidl');
  });

  it('prefills the category from differently cased memory', async () => {
    window.localStorage.setItem(
      'parka:form-memory',
      JSON.stringify({ 'expense.categoryId': ' C-1 ' }),
    );
    mockBackend([FOOD, FUN]);
    await openNew();

    expect(screen.getByLabelText('Kategoria')).toHaveTextContent(FOOD.name);
  });

  it('leaves the category on its default when the remembered one was deleted', async () => {
    mockBackend([FOOD, FUN]);
    const first = await openNew();
    await addExpense(first.user, 'BLIK', 'Spożywcze');
    first.view.unmount();
    mockBackend([FUN]);

    await openNew();

    expect(screen.getByLabelText('Kategoria')).toHaveTextContent(FUN.name);
    expect(await screen.findByDisplayValue('BLIK')).toBeInTheDocument();
  });

  it('starts with the default category when the stored memory is corrupt', async () => {
    window.localStorage.setItem('parka:form-memory', '{oops');
    mockBackend([FOOD, FUN]);
    await openNew();

    expect(screen.getByLabelText('Sklep')).toHaveValue('');
    expect(screen.getByLabelText('Kategoria')).toHaveTextContent(FUN.name);
  });

  it('stays usable and blank when the remembered values cannot be loaded', async () => {
    mockBackend([FOOD, FUN]);
    server.use(http.get('/api/suggestions/', () => HttpResponse.error()));
    const { user } = await openNew();

    await user.type(screen.getByLabelText('Sklep'), 'Kino');

    expect(screen.getByLabelText('Metoda płatności')).toHaveValue('');
    expect(screen.getByLabelText('Sklep')).toHaveValue('Kino');
  });

  it('does not overwrite what the user typed when the values arrive late', async () => {
    suggestions = fakeSuggestions([saved('Biedronka', { useCount: 9 })]);
    mockBackend([FOOD, FUN]);
    server.use(
      http.get('/api/suggestions/', async () => {
        await delay(150);
        return HttpResponse.json({ code: 200, data: suggestions.items() });
      }),
    );
    const { user } = await openNew();

    await user.type(screen.getByLabelText('Sklep'), 'K');
    await new Promise((resolve) => setTimeout(resolve, 300));

    expect(screen.getByLabelText('Sklep')).toHaveValue('K');
  });

  it('does not prefill when editing an expense', async () => {
    suggestions = fakeSuggestions([
      saved('Lidl', { useCount: 9 }),
      saved('BLIK', { field: 'paymentMethod', useCount: 9 }),
    ]);
    window.localStorage.setItem(
      'parka:form-memory',
      JSON.stringify({ 'expense.categoryId': 'c-2' }),
    );
    mockBackend([FOOD, FUN]);
    window.history.replaceState(null, '', '/app/expenses/edit/?id=e-1');
    render(<Main />);

    expect(await screen.findByLabelText('Sklep')).toHaveValue('Piekarnia');
    expect(screen.getByLabelText('Metoda płatności')).toHaveValue('Karta');
    expect(screen.getByLabelText('Kategoria')).toHaveTextContent(FOOD.name);
  });
});
