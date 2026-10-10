import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
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
const OTHER = { id: 'c-2', name: 'Rozrywka', icon: 'film', color: '#a0a' };
const DRAFT = {
  merchant: 'Biedronka',
  date: '2025-04-10T10:00:00.000Z',
  amount: 42.5,
  paymentMethod: 'Karta',
  items: [{ name: 'Chleb', unitPrice: 42.5, quantity: 1, discount: 0 }],
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

const open = async () => {
  // Let the tests pick any file type; the app validates it itself.
  const user = userEvent.setup({ applyAccept: false });
  render(<Main />);
  await screen.findByRole('tablist', { name: 'Rodzaj wydatku' });
  return user;
};

const photo = (type = 'image/jpeg', bytes = 8) =>
  new File([new Uint8Array(bytes)], 'receipt.jpg', { type });

const upload = async (
  user: Awaited<ReturnType<typeof open>>,
  file: File,
  label = 'Plik ze zdjęciem paragonu',
) => user.upload(screen.getByLabelText(label), file);

const msOfDay = (date: Date) =>
  ((date.getHours() * 60 + date.getMinutes()) * 60 + date.getSeconds()) * 1000 +
  date.getMilliseconds();

const localDay = (date: Date) =>
  [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((n) => String(n).padStart(2, '0'))
    .join('-');

const setDate = (value: string) =>
  fireEvent.change(screen.getByLabelText('Data'), { target: { value } });

describe('adding an expense on its own page', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  beforeEach(() => {
    window.history.replaceState(null, '', '/app/expenses/new/');
  });
  afterEach(() => {
    server.resetHandlers();
    navigateTo.mockClear();
  });
  afterAll(() => server.close());

  it('offers the expense type and receipt upload above the form', async () => {
    mockBackend();
    await open();

    expect(screen.getByRole('tab', { name: 'Normalny' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('tab', { name: 'Cykliczny' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Wgraj z pliku' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Zrób zdjęcie' })).toBeEnabled();
    expect(screen.getByLabelText('Sklep')).toBeVisible();
  });

  it('links back to the dashboard', async () => {
    mockBackend();
    await open();

    expect(screen.getByRole('link', { name: 'Wróć' })).toHaveAttribute(
      'href',
      '/app/',
    );
  });

  describe('manual expense', () => {
    it('saves the expense and opens the dashboard of its month', async () => {
      const written = mockBackend();
      const user = await open();

      await user.type(screen.getByLabelText('Sklep'), 'Piekarnia');
      await user.type(screen.getByLabelText('Kwota'), '25');
      setDate('2025-04-10');
      const before = new Date();
      await user.click(screen.getByRole('button', { name: /Dodaj wydatek/ }));

      await waitFor(() => expect(written).toHaveLength(1));
      const after = new Date();
      expect(written[0]!.body).toMatchObject({
        merchant: 'Piekarnia',
        amount: 25,
        categoryId: 'c-1',
        source: 'manual',
        isBill: false,
      });
      const saved = new Date(written[0]!.body.date as string);
      expect(localDay(saved)).toBe('2025-04-10');
      expect(msOfDay(saved)).toBeGreaterThanOrEqual(msOfDay(before));
      expect(msOfDay(saved)).toBeLessThanOrEqual(msOfDay(after));
    });

    it('redirects to the month of the saved expense', async () => {
      mockBackend();
      const user = await open();

      await user.type(screen.getByLabelText('Sklep'), 'Piekarnia');
      await user.type(screen.getByLabelText('Kwota'), '25');
      setDate('2025-04-15');
      await user.click(screen.getByRole('button', { name: /Dodaj wydatek/ }));

      await waitFor(() =>
        expect(navigateTo).toHaveBeenCalledWith('/app/?month=2025-04'),
      );
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
      await user.click(screen.getByRole('button', { name: /Dodaj produkt/ }));
      await user.type(screen.getByLabelText('Nazwa produktu'), 'Bułka');

      expect(screen.getByLabelText(/^Kwota/)).toHaveAttribute('readonly');
      expect(screen.getByText('Produkty (2)')).toBeVisible();
      await user.click(screen.getByRole('button', { name: /Dodaj wydatek/ }));

      await waitFor(() => expect(written).toHaveLength(1));
      expect(written[0]!.body).toMatchObject({ amount: 6.4 });
      expect(written[0]!.body.items).toHaveLength(2);
    });

    it('takes a removed product out of the amount', async () => {
      mockBackend();
      const user = await open();

      await user.click(screen.getByRole('button', { name: /Dodaj produkt/ }));
      await user.type(screen.getByLabelText('Cena'), '10');
      await user.click(screen.getByRole('button', { name: 'Usuń produkt' }));

      expect(screen.getByText('Produkty (0)')).toBeVisible();
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
        await user.selectOptions(
          screen.getByLabelText('Kategoria produktu'),
          'Rozrywka',
        );

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
        await user.selectOptions(
          screen.getAllByLabelText('Kategoria produktu')[0]!,
          'Spożywcze',
        );
        await user.click(screen.getByRole('button', { name: /Dodaj produkt/ }));
        await user.type(screen.getByLabelText('Nazwa produktu'), 'Kino');

        expect(screen.getByText('Wiele kategorii')).toBeVisible();
        await saveWithProducts(user);
        await waitFor(() => expect(written).toHaveLength(1));
        expect(written[0]!.body).toMatchObject({ categoryId: null });
      });

      it('lets the user pick again after removing every product', async () => {
        mockBackend([CATEGORY, OTHER]);
        const user = await open();

        await user.click(screen.getByRole('button', { name: /Dodaj produkt/ }));
        expect(
          screen.queryByRole('combobox', { name: 'Kategoria' }),
        ).toBeNull();
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

      expect(screen.getByLabelText('Koszt miesięczny')).toBeVisible();
      expect(
        screen.queryByRole('button', { name: 'Wgraj z pliku' }),
      ).not.toBeInTheDocument();
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

    it('saves the charge and opens the dashboard', async () => {
      const written = mockBackend();
      const user = await open();

      await user.click(screen.getByRole('tab', { name: 'Cykliczny' }));
      await user.type(screen.getByLabelText('Nazwa'), 'Netflix');
      await user.type(screen.getByLabelText('Koszt miesięczny'), '30');
      fireEvent.change(screen.getByLabelText(/^Pierwsza płatność/), {
        target: { value: '2025-05-15' },
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
          nextPaymentDate: '2025-05-15T00:00:00.000Z',
          history: [],
        },
      });
    });
  });

  describe('receipt photo', () => {
    beforeEach(() => mockBackend());

    it.each([
      ['Wgraj z pliku', 'Plik ze zdjęciem paragonu'],
      ['Zrób zdjęcie', 'Zdjęcie paragonu z aparatu'],
    ])('opens the file picker after clicking "%s"', async (button, input) => {
      const user = await open();
      const opened = vi.fn();
      screen.getByLabelText(input).addEventListener('click', opened);

      await user.click(screen.getByRole('button', { name: button }));

      expect(opened).toHaveBeenCalledTimes(1);
    });

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

    it('fills the form from a camera photo', async () => {
      mockScan();
      const user = await open();

      await upload(user, photo('image/png'), 'Zdjęcie paragonu z aparatu');

      await waitFor(() =>
        expect(screen.getByLabelText('Sklep')).toHaveValue('Biedronka'),
      );
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

    it('uses the current time when the scanned day is changed', async () => {
      mockScan();
      const written = mockBackend();
      const user = await open();

      await upload(user, photo());
      await screen.findByDisplayValue('Biedronka');
      setDate('2025-03-01');
      const before = new Date();
      await user.click(screen.getByRole('button', { name: /Dodaj wydatek/ }));

      await waitFor(() => expect(written).toHaveLength(1));
      const after = new Date();
      const saved = new Date(written[0]!.body.date as string);
      expect(localDay(saved)).toBe('2025-03-01');
      expect(msOfDay(saved)).toBeGreaterThanOrEqual(msOfDay(before));
      expect(msOfDay(saved)).toBeLessThanOrEqual(msOfDay(after));
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

    it('shows a retryable error when scanning fails', async () => {
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
      const user = await open();

      await upload(user, photo());

      const alert = await screen.findByRole('alert');
      expect(within(alert).getByText('RECEIPT_SCAN')).toBeVisible();
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

    it('opens the file picker again after retrying a rejected file', async () => {
      const user = await open();
      await upload(user, photo('application/pdf'));
      const alert = await screen.findByRole('alert');
      const opened = vi.fn();
      screen
        .getByLabelText('Plik ze zdjęciem paragonu')
        .addEventListener('click', opened);

      await user.click(
        within(alert).getByRole('button', { name: 'Spróbuj ponownie' }),
      );

      expect(opened).toHaveBeenCalledTimes(1);
    });
  });
});
