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
} from 'vitest';
import { stubImageCanvas } from '@/__tests__/stub-image-canvas';
import { Main } from '../presentation/main';

const variants = (version: number) =>
  [32, 64, 128, 256].map((size) => ({
    size,
    url: `http://cdn/device-1/${size}.webp?v=${version}`,
  }));

const settings = () => ({
  profile: { name: 'Ada' },
  notifications: {
    push: false,
    email: true,
    limitWarnings: true,
    receiptConfirmations: true,
    limitAlerts: true,
  },
  devices: [
    {
      id: 'device-1',
      name: 'Safari on iOS',
      type: 'mobile',
      avatar: null,
      customName: 'Telefon Ani',
      photo: null,
    },
  ],
});

const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

/** Raw multipart bodies, the form fields stay readable in them. */
let uploads: string[] = [];
let uploadResponse: object = { code: 200, data: { variants: variants(2) } };

const chooser = () =>
  screen.getByLabelText<HTMLInputElement>(
    'Wybierz zdjęcie urządzenia Telefon Ani',
  );

const png = () =>
  new File([new Uint8Array(PNG)], 'phone.png', { type: 'image/png' });

describe('device photo in settings', () => {
  beforeEach(() => {
    stubImageCanvas();
    uploads = [];
    uploadResponse = { code: 200, data: { variants: variants(2) } };
    URL.createObjectURL = () => 'blob:preview';
    URL.revokeObjectURL = () => {};
    server.use(
      http.get('/api/settings/', () =>
        HttpResponse.json({ code: 200, data: settings() }),
      ),
      http.get('/api/avatar/', () =>
        HttpResponse.json({ code: 200, data: null }),
      ),
      http.post('/api/device-photo/', async ({ request }) => {
        uploads.push(await request.text());
        return HttpResponse.json(uploadResponse);
      }),
    );
  });

  const photo = () =>
    document.querySelector<HTMLImageElement>('img[data-device-photo]');

  it('offers to add a photo for a device without one', async () => {
    render(<Main />);

    expect(
      await screen.findByRole('button', { name: 'Dodaj zdjęcie' }),
    ).toBeVisible();
    expect(photo()).toBeNull();
  });

  it('shows the uploaded photo and sends it with the device id', async () => {
    render(<Main />);
    await screen.findByText('Wygląd');
    await screen.findByLabelText('Wybierz zdjęcie urządzenia Telefon Ani');

    await userEvent.upload(chooser(), png());
    await userEvent.click(
      await screen.findByRole('button', { name: 'Zatwierdź' }),
    );

    await waitFor(() =>
      expect(photo()).toHaveAttribute('src', expect.stringContaining('v=2')),
    );
    expect(photo()).toHaveAttribute('srcset', expect.stringContaining('32w'));
    expect(
      await screen.findByText('Zmieniono zdjęcie urządzenia.'),
    ).toBeVisible();
    expect(
      await screen.findByRole('button', { name: 'Zmień zdjęcie urządzenia' }),
    ).toBeVisible();
    expect(uploads).toHaveLength(1);
    expect(uploads[0]).toMatch(/name="deviceId"\r\n\r\ndevice-1\r\n/);
  });

  it('rejects a file that is not an image without calling the server', async () => {
    render(<Main />);
    await screen.findByLabelText('Wybierz zdjęcie urządzenia Telefon Ani');

    await userEvent.upload(
      chooser(),
      new File(['hello'], 'notes.png', { type: 'image/png' }),
    );

    expect(
      await screen.findByText('File must be a JPEG, PNG, WebP or GIF image'),
    ).toBeVisible();
    expect(uploads).toHaveLength(0);
    expect(photo()).toBeNull();
  });

  it('keeps the old picture and reports an error when the upload fails', async () => {
    uploadResponse = {
      code: 400,
      type: 'bad-request',
      message: 'Broken image',
    };
    render(<Main />);
    await screen.findByLabelText('Wybierz zdjęcie urządzenia Telefon Ani');

    await userEvent.upload(chooser(), png());
    await userEvent.click(
      await screen.findByRole('button', { name: 'Zatwierdź' }),
    );

    expect(await screen.findByText('Broken image')).toBeVisible();
    expect(photo()).toBeNull();
  });
});
