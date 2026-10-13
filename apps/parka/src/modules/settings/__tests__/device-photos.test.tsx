import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Main } from '../presentation/main';

const variants = (version: number) =>
  [32, 64, 128, 256].map((size) => ({
    size,
    url: `http://cdn/device-1/${size}.webp?v=${version}`,
  }));

const settings = () => ({
  profile: { name: 'Ada', email: 'ada@example.com' },
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

let uploads: FormData[] = [];
let uploadResponse: object = { code: 200, data: { variants: variants(2) } };

const chooser = () =>
  screen.getByLabelText<HTMLInputElement>(
    'Wybierz zdjęcie urządzenia Telefon Ani',
  );

const png = () =>
  new File([new Uint8Array(PNG)], 'phone.png', { type: 'image/png' });

describe('device photo in settings', () => {
  beforeEach(() => {
    uploads = [];
    uploadResponse = { code: 200, data: { variants: variants(2) } };
    URL.createObjectURL = () => 'blob:preview';
    URL.revokeObjectURL = () => {};
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init?: RequestInit) => ({
        json: async () => {
          if (url.includes('/api/device-photo')) {
            uploads.push(init?.body as FormData);
            return uploadResponse;
          }
          if (url.includes('/api/avatar')) return { code: 200, data: null };
          return { code: 200, data: settings() };
        },
      })),
    );
  });
  afterEach(() => vi.unstubAllGlobals());

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
    await screen.findByText('Ada');
    await screen.findByLabelText('Wybierz zdjęcie urządzenia Telefon Ani');

    await userEvent.upload(chooser(), png());

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
    expect(uploads[0]?.get('deviceId')).toBe('device-1');
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

    expect(await screen.findByText('Broken image')).toBeVisible();
    expect(photo()).toBeNull();
  });
});
