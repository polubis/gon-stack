import { render, screen, waitFor, within } from '@testing-library/react';
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
import { Provider, useContext } from '../presentation/context';
import { NewExpense } from '../presentation/new-expense';
import type { Month } from '../domain/models';
import { readHandlers } from './dashboard-backend';

const MONTH = '2025-04' as Month;
const CATEGORY = { id: 'c-1', name: 'Spożywcze', icon: 'cart', color: '#0a0' };
const DRAFT = {
  merchant: 'Biedronka',
  date: '2025-04-10T10:00:00.000Z',
  amount: 42.5,
  paymentMethod: 'Karta',
  items: [{ name: 'Chleb', unitPrice: 5.5, quantity: 1, discount: 0 }],
};

const server = setupServer();

const Harness = () => {
  const ctx = useContext();
  const loaded = ctx.useInitialized();
  return loaded ? (
    <NewExpense month={MONTH} onClose={() => undefined} />
  ) : (
    <button type="button" onClick={() => ctx.load(MONTH)}>
      load
    </button>
  );
};

const open = async () => {
  // Let the tests pick any file type; the app validates it itself.
  const user = userEvent.setup({ applyAccept: false });
  render(
    <Provider>
      <Harness />
    </Provider>,
  );
  await user.click(screen.getByRole('button', { name: 'load' }));
  await screen.findByRole('dialog', { name: 'Nowy wydatek' });
  return user;
};

const photo = (type = 'image/jpeg', bytes = 8) =>
  new File([new Uint8Array(bytes)], 'receipt.jpg', { type });

const mockScan = () =>
  server.use(
    http.post('/api/receipts/scan/', () =>
      HttpResponse.json({ code: 200, data: DRAFT }),
    ),
  );

const upload = async (
  user: Awaited<ReturnType<typeof open>>,
  file: File,
  label = 'Plik ze zdjęciem paragonu',
) => {
  await user.upload(screen.getByLabelText(label), file);
};

const useThisPhoto = async (user: Awaited<ReturnType<typeof open>>) =>
  user.click(await screen.findByRole('button', { name: 'Użyj zdjęcia' }));

describe('adding an expense from a receipt', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  beforeEach(() => {
    URL.createObjectURL = vi.fn(() => 'blob:receipt');
    URL.revokeObjectURL = vi.fn();
    server.use(...readHandlers({ categories: [CATEGORY] }));
  });
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('offers file, camera and manual options above the form', async () => {
    await open();

    expect(screen.getByRole('button', { name: 'Wgraj z pliku' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Zrób zdjęcie' })).toBeEnabled();
    expect(
      screen.getByRole('button', { name: 'Dodaj ręcznie' }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText('Sklep')).toBeVisible();
  });

  it('fills the form from an uploaded receipt', async () => {
    mockScan();
    const user = await open();

    await upload(user, photo());
    await useThisPhoto(user);

    await waitFor(() =>
      expect(screen.getByLabelText('Sklep')).toHaveValue('Biedronka'),
    );
  });

  it('fills the form from a camera photo', async () => {
    mockScan();
    const user = await open();

    await upload(user, photo('image/png'), 'Zdjęcie paragonu z aparatu');
    await useThisPhoto(user);

    await waitFor(() =>
      expect(screen.getByLabelText('Sklep')).toHaveValue('Biedronka'),
    );
  });

  it('sends the photo to the scan endpoint as multipart', async () => {
    let sent = '';
    server.use(
      http.post('/api/receipts/scan/', async ({ request }) => {
        sent = `${request.headers.get('content-type')}
${await request.text()}`;
        return HttpResponse.json({ code: 200, data: DRAFT });
      }),
    );
    const user = await open();

    await upload(user, photo());
    await useThisPhoto(user);

    await waitFor(() => expect(sent).toContain('multipart/form-data'));
    expect(sent).toContain('name="file"');
  });

  it('shows a retryable error when scanning fails', async () => {
    server.use(
      http.post('/api/receipts/scan/', () =>
        HttpResponse.json({ code: 500, type: 'internal-server', message: 'x' }),
      ),
    );
    const user = await open();

    await upload(user, photo());
    await useThisPhoto(user);

    const alert = await screen.findByRole('alert');
    expect(within(alert).getByText('RECEIPT_SCAN')).toBeVisible();
    expect(
      within(alert).getByRole('button', { name: 'Spróbuj ponownie' }),
    ).toBeVisible();
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

  it('returns to a blank form when the crop is cancelled', async () => {
    const user = await open();

    await upload(user, photo());
    await user.click(await screen.findByRole('button', { name: 'Anuluj' }));

    expect(screen.getByLabelText('Sklep')).toHaveValue('');
  });
});
