import {
  fireEvent,
  render,
  type RenderResult,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { pickOption } from '@/__tests__/pick-option';
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

const { navigateTo, handoff } = vi.hoisted(() => ({
  navigateTo: vi.fn(),
  handoff: { file: null as File | null },
}));

// jsdom cannot read the data URL the real hand-off stores in sessionStorage.
vi.mock('@/shared/receipt-handoff/receipt-handoff', () => ({
  takeReceipt: async () => handoff.file,
}));

vi.mock('@/shared/router/navigation', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/router/navigation')>()),
  navigateTo,
}));

const { Main } = await import('../presentation/main');

const CATEGORY = { id: 'c-1', name: 'Spożywcze', icon: 'cart', color: '#0a0' };
const OTHER = { id: 'c-2', name: 'Rozrywka', icon: 'film', color: '#a0a' };
const DRAFT = {
  merchant: 'Biedronka',
  date: '2025-04-10T10:00:00.000Z',
  amount: 42.5,
  paymentMethod: 'Karta',
  items: [
    {
      name: 'Chleb',
      unitPrice: 42.5,
      quantity: 1,
      discount: 0,
      category: { status: 'unknown', suggestion: null },
    },
  ],
};

const server = setupServer();

type Written = { url: string; body: Record<string, unknown> };

/** Backend with the given categories; every write is recorded and accepted. */
const mockBackend = (categories: object[] = [CATEGORY]) => {
  const written: Written[] = [];
  server.use(
    http.get('/api/categories/', () =>
      HttpResponse.json({ code: 200, data: categories }),
    ),
    http.post('/api/expenses/', async ({ request }) => {
      const body = (await request.json()) as Record<string, unknown>;
      written.push({ url: '/api/expenses/', body });
      return HttpResponse.json({ code: 201, data: body });
    }),
    http.post('/api/recurring/', async ({ request }) => {
      const body = (await request.json()) as Record<string, unknown>;
      written.push({ url: '/api/recurring/', body });
      return HttpResponse.json({ code: 201, data: body });
    }),
  );
  return written;
};

const mockScan = () =>
  server.use(
    http.post('/api/receipts/scan/', () =>
      HttpResponse.json({ code: 200, data: DRAFT }),
    ),
  );

let view: RenderResult;

const open = async () => {
  const user = userEvent.setup();
  view = render(<Main />);
  await screen.findByRole('tablist', { name: 'Rodzaj wydatku' });
  return user;
};

/** Closes the product popup and waits until the form is reachable again. */
const closeProduct = async (user: Awaited<ReturnType<typeof open>>) => {
  await user.click(screen.getByRole('button', { name: 'Gotowe' }));
  await waitFor(() =>
    expect(screen.queryByLabelText('Nazwa produktu')).not.toBeInTheDocument(),
  );
};

const photo = (type = 'image/jpeg', bytes = 8) =>
  new File([new Uint8Array(bytes)], 'receipt.jpg', { type });

/** A photo picked in the "Dodaj" menu reaches the page through the hand-off. */
const upload = async (_user: Awaited<ReturnType<typeof open>>, file: File) => {
  handoff.file = file;
  view.unmount();
  await open();
};

/** Local `YYYY-MM-DDTHH:mm`, the value a `datetime-local` input takes. */
const localInput = (date: Date) =>
  [
    [date.getFullYear(), date.getMonth() + 1, date.getDate()],
    [date.getHours(), date.getMinutes()],
  ]
    .map((part) => part.map((n) => String(n).padStart(2, '0')))
    .map((part, i) => part.join(i === 0 ? '-' : ':'))
    .join('T');

const setDate = (value: string) =>
  fireEvent.change(screen.getByLabelText('Data i godzina'), {
    target: { value },
  });

describe('adding an expense on its own page', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  beforeEach(() => {
    window.localStorage.clear();
    window.history.replaceState(null, '', '/app/expenses/new/');
  });
  afterEach(() => {
    server.resetHandlers();
    handoff.file = null;
    navigateTo.mockClear();
  });
  afterAll(() => server.close());

  it('offers the expense type above the form and no receipt upload', async () => {
    mockBackend();
    await open();

    expect(screen.getByRole('tab', { name: 'Normalny' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('tab', { name: 'Cykliczny' })).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Wgraj z pliku' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Zrób zdjęcie' }),
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText('Sklep')).toBeVisible();
  });

  it('shows the total next to the save button', async () => {
    mockBackend();
    await open();

    const bar = screen.getByRole('button', { name: 'Dodaj wydatek' })
      .parentElement as HTMLElement;

    expect(bar).toHaveTextContent('Razem');
  });

  it('shows the form in a popup that closes back to the dashboard', async () => {
    mockBackend();
    const user = await open();

    const popup = screen.getByRole('dialog', { name: 'Nowy wydatek' });
    await user.click(within(popup).getByRole('button', { name: 'Zamknij' }));

    expect(navigateTo).toHaveBeenCalledWith('/app/');
  });

  describe('manual expense', () => {
    it('saves the expense and opens the dashboard of its month', async () => {
      const written = mockBackend();
      const user = await open();

      await user.type(screen.getByLabelText('Sklep'), 'Piekarnia');
      await user.type(screen.getByLabelText('Kwota'), '25');
      setDate('2025-04-10T14:30');
      await user.click(screen.getByRole('button', { name: /Dodaj wydatek/ }));

      await waitFor(() => expect(written).toHaveLength(1));
      expect(written[0]!.body).toMatchObject({
        merchant: 'Piekarnia',
        amount: 25,
        categoryId: 'c-1',
        source: 'manual',
        isBill: false,
        date: new Date(2025, 3, 10, 14, 30).toISOString(),
      });
    });

    it('prefills the date and time with the current moment', async () => {
      mockBackend();
      const before = localInput(new Date());
      await open();

      const input = screen.getByLabelText('Data i godzina');
      expect(input).toHaveAttribute('type', 'datetime-local');
      expect((input as HTMLInputElement).value >= before).toBe(true);
      expect((input as HTMLInputElement).value <= localInput(new Date())).toBe(
        true,
      );
    });

    it('saves the current moment in UTC when the date is left alone', async () => {
      const written = mockBackend();
      const user = await open();

      await user.type(screen.getByLabelText('Sklep'), 'Piekarnia');
      await user.type(screen.getByLabelText('Kwota'), '25');
      const before = Date.now();
      await user.click(screen.getByRole('button', { name: /Dodaj wydatek/ }));

      await waitFor(() => expect(written).toHaveLength(1));
      const saved = written[0]!.body.date as string;
      expect(saved).toMatch(/Z$/);
      // Prefilled with the minute of opening, so never later than the save.
      expect(Date.parse(saved)).toBeLessThanOrEqual(before);
      expect(before - Date.parse(saved)).toBeLessThan(5 * 60_000);
    });

    it('requires a date and time', async () => {
      mockBackend();
      await open();

      setDate('');

      expect(screen.getByLabelText('Data i godzina')).toBeRequired();
    });

    it('does not save without a date and time', async () => {
      const written = mockBackend();
      const user = await open();
      await user.type(screen.getByLabelText('Sklep'), 'Piekarnia');
      await user.type(screen.getByLabelText('Kwota'), '25');
      setDate('');

      await user.click(screen.getByRole('button', { name: /Dodaj wydatek/ }));

      expect(written).toHaveLength(0);
    });

    it('saves which device the expense was created from', async () => {
      const written = mockBackend();
      const user = await open();

      await user.type(screen.getByLabelText('Sklep'), 'Piekarnia');
      await user.type(screen.getByLabelText('Kwota'), '25');
      await user.click(screen.getByRole('button', { name: /Dodaj wydatek/ }));

      await waitFor(() => expect(written).toHaveLength(1));
      expect(written[0]!.body.device).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        type: expect.stringMatching(/^(mobile|desktop|tablet)$/),
        avatar: null,
      });
    });

    it('keeps the same device id for the next expense', async () => {
      const written = mockBackend();
      const user = await open();

      for (const merchant of ['Piekarnia', 'Kiosk']) {
        await user.clear(screen.getByLabelText('Sklep'));
        await user.type(screen.getByLabelText('Sklep'), merchant);
        await user.clear(screen.getByLabelText('Kwota'));
        await user.type(screen.getByLabelText('Kwota'), '5');
        await user.click(screen.getByRole('button', { name: /Dodaj wydatek/ }));
        await waitFor(() => expect(written.length).toBeGreaterThan(0));
        window.history.replaceState(null, '', '/app/expenses/new/');
      }

      const ids = written.map((w) => (w.body.device as { id: string }).id);
      expect(new Set(ids).size).toBe(1);
    });

    it('redirects to the month of the saved expense', async () => {
      mockBackend();
      const user = await open();

      await user.type(screen.getByLabelText('Sklep'), 'Piekarnia');
      await user.type(screen.getByLabelText('Kwota'), '25');
      setDate('2025-04-15T09:00');
      await user.click(screen.getByRole('button', { name: /Dodaj wydatek/ }));

      await waitFor(() =>
        expect(navigateTo).toHaveBeenCalledWith('/app/?month=2025-04'),
      );
    });

    it('locks the amount and counts the products once there are some', async () => {
      mockBackend();
      const user = await open();
      await user.type(screen.getByLabelText('Sklep'), 'Piekarnia');

      await user.click(screen.getByRole('button', { name: /Dodaj produkt/ }));
      await closeProduct(user);
      await user.click(screen.getByRole('button', { name: /Dodaj produkt/ }));
      await closeProduct(user);

      expect(screen.getByLabelText(/^Kwota/)).toHaveAttribute('readonly');
      expect(screen.getByText('Produkty (2)')).toBeVisible();
    });

    it('sums products into the amount', async () => {
      const written = mockBackend();
      const user = await open();
      await user.type(screen.getByLabelText('Sklep'), 'Piekarnia');
      await user.click(screen.getByRole('button', { name: /Dodaj produkt/ }));
      await user.type(screen.getByLabelText('Nazwa produktu'), 'Chleb');
      await user.type(screen.getByLabelText('Cena'), '3,20');
      await user.clear(screen.getByLabelText('Ilość'));
      await user.type(screen.getByLabelText('Ilość'), '2');
      await closeProduct(user);
      await user.click(screen.getByRole('button', { name: /Dodaj produkt/ }));
      await user.type(screen.getByLabelText('Nazwa produktu'), 'Bułka');
      await closeProduct(user);

      await user.click(screen.getByRole('button', { name: /Dodaj wydatek/ }));

      await waitFor(() => expect(written).toHaveLength(1));
      expect(written[0]!.body).toMatchObject({ amount: 6.4 });
      expect(written[0]!.body.items).toHaveLength(2);
    });

    it('edits a product in a popup over the form', async () => {
      mockBackend();
      const user = await open();

      await user.click(screen.getByRole('button', { name: /Dodaj produkt/ }));
      await user.type(screen.getByLabelText('Nazwa produktu'), 'Chleb');
      const popup = screen.getByRole('dialog', { name: 'Chleb' });
      await user.click(within(popup).getByRole('button', { name: 'Gotowe' }));

      expect(
        await screen.findByRole('button', { name: /Chleb/ }),
      ).toBeVisible();
      expect(screen.queryByLabelText('Nazwa produktu')).not.toBeInTheDocument();
    });

    it('reopens a product popup from its row', async () => {
      mockBackend();
      const user = await open();
      await user.click(screen.getByRole('button', { name: /Dodaj produkt/ }));
      await user.type(screen.getByLabelText('Nazwa produktu'), 'Chleb');
      await closeProduct(user);

      await user.click(screen.getByRole('button', { name: /Chleb/ }));

      expect(screen.getByLabelText('Nazwa produktu')).toHaveValue('Chleb');
    });

    it('takes a removed product out of the amount', async () => {
      mockBackend();
      const user = await open();

      await user.click(screen.getByRole('button', { name: /Dodaj produkt/ }));
      await user.type(screen.getByLabelText('Cena'), '10');
      await user.click(screen.getByRole('button', { name: 'Usuń produkt' }));

      expect(await screen.findByText('Produkty (0)')).toBeVisible();
      expect(screen.getByLabelText('Kwota')).not.toHaveAttribute('readonly');
    });

    describe('category', () => {
      const saveWithProducts = async (
        user: Awaited<ReturnType<typeof open>>,
      ) => {
        await user.type(screen.getByLabelText('Sklep'), 'Sklep');
        await user.click(screen.getByRole('button', { name: /Dodaj wydatek/ }));
      };

      it('takes the category of the only product', async () => {
        const written = mockBackend([CATEGORY, OTHER]);
        const user = await open();

        await user.click(screen.getByRole('button', { name: /Dodaj produkt/ }));
        await user.type(screen.getByLabelText('Nazwa produktu'), 'Kino');
        await pickOption(
          user,
          screen.getByLabelText('Kategoria produktu'),
          'Rozrywka',
        );
        await closeProduct(user);

        expect(screen.getByText('Rozrywka', { selector: 'p' })).toBeVisible();
        await saveWithProducts(user);
        await waitFor(() => expect(written).toHaveLength(1));
        expect(written[0]!.body).toMatchObject({ categoryId: 'c-2' });
      });

      it('has no category when products differ', async () => {
        const written = mockBackend([CATEGORY, OTHER]);
        const user = await open();

        await user.click(screen.getByRole('button', { name: /Dodaj produkt/ }));
        await user.type(screen.getByLabelText('Nazwa produktu'), 'Chleb');
        await pickOption(
          user,
          screen.getByLabelText('Kategoria produktu'),
          'Spożywcze',
        );
        await closeProduct(user);
        await user.click(screen.getByRole('button', { name: /Dodaj produkt/ }));
        await user.type(screen.getByLabelText('Nazwa produktu'), 'Kino');
        await closeProduct(user);

        expect(screen.getByText('Wiele kategorii')).toBeVisible();
        await saveWithProducts(user);
        await waitFor(() => expect(written).toHaveLength(1));
        expect(written[0]!.body).toMatchObject({ categoryId: null });
      });

      it('hides the category picker while a product is added', async () => {
        mockBackend([CATEGORY, OTHER]);
        const user = await open();

        await user.click(screen.getByRole('button', { name: /Dodaj produkt/ }));

        expect(
          screen.queryByRole('combobox', { name: 'Kategoria' }),
        ).toBeNull();
      });

      it('lets the user pick again after removing every product', async () => {
        mockBackend([CATEGORY, OTHER]);
        const user = await open();
        await user.click(screen.getByRole('button', { name: /Dodaj produkt/ }));

        await user.click(screen.getByRole('button', { name: 'Usuń produkt' }));

        expect(
          screen.getByRole('combobox', { name: 'Kategoria' }),
        ).toBeVisible();
      });
    });

    it('stays on the page and reports an error when saving fails', async () => {
      mockBackend();
      server.use(
        http.post('/api/expenses/', () =>
          HttpResponse.json({
            code: 500,
            type: 'internal-server',
            message: 'x',
          }),
        ),
      );
      const user = await open();

      await user.type(screen.getByLabelText('Sklep'), 'Piekarnia');
      await user.type(screen.getByLabelText('Kwota'), '25');
      await user.click(screen.getByRole('button', { name: /Dodaj wydatek/ }));

      const toast = await screen.findByRole('alert');
      expect(toast).toHaveTextContent('Nie udało się dodać wydatku');
      expect(toast).toHaveTextContent('EXPENSE_CREATE_FAILED');
      expect(toast).toHaveTextContent('x');
      expect(
        within(toast).getByRole('button', { name: 'Spróbuj ponownie' }),
      ).toBeVisible();
      expect(navigateTo).not.toHaveBeenCalled();
      expect(screen.getByLabelText('Sklep')).toHaveValue('Piekarnia');
    });

    it('cannot be saved before any category exists', async () => {
      mockBackend([]);
      await open();

      expect(
        screen.getByRole('link', { name: 'Dodaj kategorię' }),
      ).toBeVisible();
      expect(
        screen.getByRole('button', { name: /Dodaj wydatek/ }),
      ).toBeDisabled();
    });
  });

  describe('recurring expense', () => {
    it('switches the form with the type tab', async () => {
      mockBackend();
      const user = await open();

      await user.click(screen.getByRole('tab', { name: 'Cykliczny' }));

      expect(screen.getByLabelText('Koszt płatności')).toBeVisible();
      expect(window.location.search).toBe('?type=recurring');
    });

    it('opens on the recurring tab when the link asks for it', async () => {
      window.history.replaceState(
        null,
        '',
        '/app/expenses/new/?type=recurring',
      );
      mockBackend();
      await open();

      expect(screen.getByRole('tab', { name: 'Cykliczny' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
    });

    it('saves the rule and opens the dashboard', async () => {
      const written = mockBackend();
      const user = await open();

      await user.click(screen.getByRole('tab', { name: 'Cykliczny' }));
      await user.type(screen.getByLabelText('Nazwa'), 'Netflix');
      await user.type(screen.getByLabelText('Koszt płatności'), '30');
      await pickOption(
        user,
        screen.getByLabelText('Częstotliwość'),
        'Co tydzień',
      );
      fireEvent.change(screen.getByLabelText(/^Pierwsza płatność/), {
        target: { value: '2025-05-15' },
      });
      fireEvent.change(screen.getByLabelText(/^Koniec/), {
        target: { value: '2025-12-31' },
      });
      await user.click(
        screen.getByRole('button', { name: 'Dodaj wydatek cykliczny' }),
      );

      await waitFor(() =>
        expect(navigateTo).toHaveBeenCalledWith('/app/?month=2025-05'),
      );
      expect(written[0]).toMatchObject({
        url: '/api/recurring/',
        body: {
          name: 'Netflix',
          cost: 30,
          active: true,
          interval: 'weekly',
          startDate: '2025-05-15',
          endDate: '2025-12-31',
        },
      });
    });
  });

  describe('recurring expense with products', () => {
    const addProduct = async (
      user: ReturnType<typeof userEvent.setup>,
      name: string,
      price: string,
    ) => {
      await user.click(screen.getByRole('button', { name: /Dodaj produkt/ }));
      await user.type(screen.getByLabelText('Nazwa produktu'), name);
      await user.type(screen.getByLabelText('Cena'), price);
      await closeProduct(user);
    };

    it('takes the cost and category from the products', async () => {
      mockBackend();
      const user = await open();

      await user.click(screen.getByRole('tab', { name: 'Cykliczny' }));
      await addProduct(user, 'Chleb', '12');

      expect(screen.getByLabelText('Koszt płatności')).toHaveValue('12');
      expect(screen.getByLabelText('Koszt płatności')).toHaveAttribute(
        'readonly',
      );
    });

    it('saves the products with the rule', async () => {
      const written = mockBackend();
      const user = await open();

      await user.click(screen.getByRole('tab', { name: 'Cykliczny' }));
      await user.type(screen.getByLabelText('Nazwa'), 'Zakupy');
      await addProduct(user, 'Chleb', '12');
      await user.click(
        screen.getByRole('button', { name: 'Dodaj wydatek cykliczny' }),
      );

      await waitFor(() => expect(written).toHaveLength(1));
      expect(written[0]).toMatchObject({
        url: '/api/recurring/',
        body: {
          name: 'Zakupy',
          cost: 12,
          categoryId: 'c-1',
          items: [{ name: 'Chleb', unitPrice: 12, quantity: 1, discount: 0 }],
        },
      });
    });

    it('does not save a product without a name', async () => {
      const written = mockBackend();
      const user = await open();

      await user.click(screen.getByRole('tab', { name: 'Cykliczny' }));
      await user.type(screen.getByLabelText('Nazwa'), 'Zakupy');
      await user.click(screen.getByRole('button', { name: /Dodaj produkt/ }));
      await closeProduct(user);
      await user.click(
        screen.getByRole('button', { name: 'Dodaj wydatek cykliczny' }),
      );

      expect(screen.getByLabelText('Nazwa produktu')).toBeInvalid();
      expect(written).toHaveLength(0);
    });
  });

  describe('recurring expense from a receipt photo', () => {
    const openRecurring = async () => {
      const user = await open();
      await user.click(screen.getByRole('tab', { name: 'Cykliczny' }));
      return user;
    };

    it('fills the name, method and products from an uploaded receipt', async () => {
      mockBackend();
      mockScan();
      const user = await openRecurring();

      await upload(user, photo());

      expect(await screen.findByLabelText('Nazwa')).toHaveValue('Biedronka');
      expect(screen.getByLabelText('Metoda płatności')).toHaveValue('Karta');
      expect(screen.getByText('Produkty (1)')).toBeVisible();
      expect(screen.getByLabelText('Koszt płatności')).toHaveValue('42.5');
      expect(screen.getByLabelText('Koszt płatności')).toHaveAttribute(
        'readonly',
      );
    });

    it('saves the scanned products with the rule', async () => {
      const written = mockBackend();
      mockScan();
      const user = await openRecurring();

      await upload(user, photo());
      await screen.findByLabelText('Nazwa');
      await user.click(
        screen.getByRole('button', { name: 'Dodaj wydatek cykliczny' }),
      );

      await waitFor(() => expect(written).toHaveLength(1));
      expect(written[0]).toMatchObject({
        url: '/api/recurring/',
        body: {
          name: 'Biedronka',
          cost: 42.5,
          categoryId: 'c-1',
          items: [{ name: 'Chleb', unitPrice: 42.5 }],
        },
      });
    });

    it('shows a retryable error when scanning fails', async () => {
      mockBackend();
      server.use(
        http.post('/api/receipts/scan/', () =>
          HttpResponse.json({ code: 500, message: 'boom' }),
        ),
      );
      const user = await openRecurring();

      await upload(user, photo());

      const alert = await screen.findByRole('alert');
      expect(within(alert).getByText('RECEIPT_SCAN')).toBeVisible();
      expect(
        within(alert).getByRole('button', { name: 'Spróbuj ponownie' }),
      ).toBeVisible();
    });
  });

  describe('receipt photo', () => {
    beforeEach(() => mockBackend());

    it('fills the form from an uploaded receipt without extra steps', async () => {
      mockScan();
      const user = await open();

      await upload(user, photo());

      await waitFor(() =>
        expect(screen.getByLabelText('Sklep')).toHaveValue('Biedronka'),
      );
      expect(screen.getByText('Produkty (1)')).toBeVisible();
      expect(screen.getByLabelText(/^Kwota/)).toHaveValue('42.5');
    });

    it('saves a scanned expense as a receipt expense', async () => {
      mockScan();
      const written = mockBackend();
      const user = await open();

      await upload(user, photo());
      await screen.findByDisplayValue('Biedronka');
      await user.click(screen.getByRole('button', { name: /Dodaj wydatek/ }));

      await waitFor(() => expect(written).toHaveLength(1));
      expect(written[0]!.body).toMatchObject({
        merchant: 'Biedronka',
        amount: 42.5,
        source: 'receipt',
      });
    });

    it('saves each scanned item under the category matched from the user own', async () => {
      server.use(
        http.post('/api/receipts/scan/', () =>
          HttpResponse.json({
            code: 200,
            data: {
              ...DRAFT,
              items: [
                {
                  name: 'Kino',
                  unitPrice: 20,
                  quantity: 1,
                  discount: 0,
                  category: { status: 'assigned', categoryId: 'c-2' },
                },
                {
                  name: 'Chleb',
                  unitPrice: 5,
                  quantity: 1,
                  discount: 0,
                  category: { status: 'assigned', categoryId: 'c-1' },
                },
              ],
            },
          }),
        ),
      );
      const written = mockBackend([CATEGORY, OTHER]);
      const user = await open();

      await upload(user, photo());
      await screen.findByDisplayValue('Biedronka');
      await user.click(screen.getByRole('button', { name: /Dodaj wydatek/ }));

      await waitFor(() => expect(written).toHaveLength(1));
      const items = written[0]!.body.items as { categoryId: string }[];
      expect(items.map((i) => i.categoryId)).toEqual(['c-2', 'c-1']);
    });

    it('saves a scanned item under the user category when no own match', async () => {
      server.use(
        http.post('/api/receipts/scan/', () =>
          HttpResponse.json({
            code: 200,
            data: {
              ...DRAFT,
              items: [
                {
                  name: 'Kino',
                  unitPrice: 20,
                  quantity: 1,
                  discount: 0,
                  category: { status: 'assigned', categoryId: 'foreign' },
                },
              ],
            },
          }),
        ),
      );
      const written = mockBackend([CATEGORY]);
      const user = await open();

      await upload(user, photo());
      await screen.findByDisplayValue('Biedronka');
      await user.click(screen.getByRole('button', { name: /Dodaj wydatek/ }));

      await waitFor(() => expect(written).toHaveLength(1));
      const items = written[0]!.body.items as { categoryId: string }[];
      expect(items.map((i) => i.categoryId)).toEqual(['c-1']);
    });

    it('explains that a category is needed when the user has none', async () => {
      server.use(
        http.post('/api/receipts/scan/', () =>
          HttpResponse.json({
            code: 409,
            type: 'conflict',
            message: 'Add a category before scanning receipts',
          }),
        ),
      );
      mockBackend([]);
      const user = await open();

      await upload(user, photo());

      const alert = await screen.findByRole('alert');
      expect(alert).toHaveTextContent(
        'Add a category before scanning receipts',
      );
    });

    it('keeps the scanned timestamp when the day is unchanged', async () => {
      mockScan();
      const written = mockBackend();
      const user = await open();

      await upload(user, photo());
      await screen.findByDisplayValue('Biedronka');
      await user.click(screen.getByRole('button', { name: /Dodaj wydatek/ }));

      await waitFor(() => expect(written).toHaveLength(1));
      expect(written[0]!.body.date).toBe(DRAFT.date);
    });

    it('saves the scanned date and time after they are changed', async () => {
      mockScan();
      const written = mockBackend();
      const user = await open();

      await upload(user, photo());
      await screen.findByDisplayValue('Biedronka');
      setDate('2025-03-01T18:45');
      await user.click(screen.getByRole('button', { name: /Dodaj wydatek/ }));

      await waitFor(() => expect(written).toHaveLength(1));
      expect(written[0]!.body.date).toBe(
        new Date(2025, 2, 1, 18, 45).toISOString(),
      );
    });

    it('prefills a day-only scanned date with the current local time', async () => {
      server.use(
        http.post('/api/receipts/scan/', () =>
          HttpResponse.json({
            code: 200,
            data: { ...DRAFT, date: '2025-03-01' },
          }),
        ),
      );
      mockBackend();
      const user = await open();
      const before = localInput(new Date());

      await upload(user, photo());
      await screen.findByDisplayValue('Biedronka');

      const value = (
        screen.getByLabelText('Data i godzina') as HTMLInputElement
      ).value;
      expect(value.slice(0, 10)).toBe('2025-03-01');
      expect(value.slice(11) >= before.slice(11)).toBe(true);
      expect(value.slice(11) <= localInput(new Date()).slice(11)).toBe(true);
    });

    it('sends the photo to the scan endpoint as multipart', async () => {
      let sent = '';
      server.use(
        http.post('/api/receipts/scan/', async ({ request }) => {
          sent = `${request.headers.get('content-type')}\n${await request.text()}`;
          return HttpResponse.json({ code: 200, data: DRAFT });
        }),
      );
      const user = await open();

      await upload(user, photo());

      await waitFor(() => expect(sent).toContain('multipart/form-data'));
      expect(sent).toContain('name="file"');
    });

    const failFirstScan = () => {
      let attempts = 0;
      server.use(
        http.post('/api/receipts/scan/', () => {
          attempts += 1;
          return attempts === 1
            ? HttpResponse.json({
                code: 500,
                type: 'internal-server',
                message: 'x',
              })
            : HttpResponse.json({ code: 200, data: DRAFT });
        }),
      );
    };

    it('shows an error with its code when scanning fails', async () => {
      failFirstScan();
      const user = await open();

      await upload(user, photo());

      const alert = await screen.findByRole('alert');
      expect(within(alert).getByText('RECEIPT_SCAN')).toBeVisible();
    });

    it('scans again after the retry', async () => {
      failFirstScan();
      const user = await open();
      await upload(user, photo());
      const alert = await screen.findByRole('alert');

      await user.click(
        within(alert).getByRole('button', { name: 'Spróbuj ponownie' }),
      );

      await waitFor(() =>
        expect(screen.getByLabelText('Sklep')).toHaveValue('Biedronka'),
      );
    });

    it('goes back to a blank form after a failed scan', async () => {
      server.use(
        http.post('/api/receipts/scan/', () =>
          HttpResponse.json({
            code: 500,
            type: 'internal-server',
            message: 'x',
          }),
        ),
      );
      const user = await open();

      await upload(user, photo());
      const alert = await screen.findByRole('alert');
      await user.click(within(alert).getByRole('button', { name: 'Wróć' }));

      expect(screen.getByLabelText('Sklep')).toHaveValue('');
    });

    it('rejects a file that is not an image', async () => {
      const user = await open();

      await upload(user, photo('application/pdf'));

      expect(await screen.findByRole('alert')).toHaveTextContent(
        'Wybierz plik ze zdjęciem paragonu.',
      );
    });

    it('rejects a photo over 10 MB', async () => {
      const user = await open();

      await upload(user, photo('image/jpeg', 10 * 1024 * 1024 + 1));

      expect(await screen.findByRole('alert')).toHaveTextContent(
        'Maksymalny rozmiar to 10 MB.',
      );
    });

    it('goes back to a blank form when retrying a rejected file', async () => {
      const user = await open();
      await upload(user, photo('application/pdf'));
      const alert = await screen.findByRole('alert');

      await user.click(
        within(alert).getByRole('button', { name: 'Spróbuj ponownie' }),
      );

      expect(screen.getByLabelText('Sklep')).toHaveValue('');
    });
  });
});
