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
import { ProfileEditModal } from '../presentation/profile-modal';

const SETTINGS = {
  profile: { name: 'Ada' },
  notifications: {
    push: false,
    email: true,
    limitWarnings: true,
    receiptConfirmations: true,
    limitAlerts: true,
  },
  devices: [],
};

const variants = (version: number) =>
  [32, 64, 128, 256].map((size) => ({
    size,
    url: `http://cdn/u/${size}.webp?v=${version}`,
  }));

const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  window.history.replaceState(null, '', '/app/');
  server.resetHandlers();
});
afterAll(() => server.close());

let uploads: Request[] = [];
let uploadResponse: object = { code: 200, data: { variants: variants(2) } };

const chooser = () =>
  document.querySelector<HTMLInputElement>('input[type="file"]')!;

const png = () =>
  new File([new Uint8Array(PNG)], 'me.png', { type: 'image/png' });

describe('profile avatar in the profile modal', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/app/?modal=profile');
    stubImageCanvas();
    uploads = [];
    uploadResponse = { code: 200, data: { variants: variants(2) } };
    URL.createObjectURL = () => 'blob:preview';
    URL.revokeObjectURL = () => {};
    server.use(
      http.get('/api/settings/', () =>
        HttpResponse.json({ code: 200, data: SETTINGS }),
      ),
      http.get('/api/avatar/', () =>
        HttpResponse.json({ code: 200, data: null }),
      ),
      http.post('/api/avatar/', ({ request }) => {
        uploads.push(request);
        return HttpResponse.json(uploadResponse);
      }),
    );
  });

  it('shows the default icon until a picture is uploaded', async () => {
    render(<ProfileEditModal />);

    await screen.findByRole('textbox', { name: 'Imię i nazwisko' });
    expect(
      screen.queryByRole('img', { name: /zdjęcie profilowe/i }),
    ).toBeNull();
  });

  it('shows the uploaded picture in place of the default icon', async () => {
    render(<ProfileEditModal />);
    await screen.findByRole('textbox', { name: 'Imię i nazwisko' });

    await userEvent.upload(chooser(), png());
    await userEvent.click(
      await screen.findByRole('button', { name: 'Zatwierdź' }),
    );

    const img = await screen.findByRole('img', { name: /zdjęcie profilowe/i });
    await waitFor(() =>
      expect(img).toHaveAttribute('src', expect.stringContaining('v=2')),
    );
    expect(img).toHaveAttribute('srcset', expect.stringContaining('32w'));
    expect(await screen.findByText('Zmieniono zdjęcie.')).toBeVisible();
    expect(uploads).toHaveLength(1);
  });

  it('uploads only after the crop is confirmed', async () => {
    render(<ProfileEditModal />);
    await screen.findByRole('textbox', { name: 'Imię i nazwisko' });

    await userEvent.upload(chooser(), png());
    await screen.findByRole('dialog', { name: 'Przytnij zdjęcie' });
    expect(uploads).toHaveLength(0);

    await userEvent.click(screen.getByRole('button', { name: 'Anuluj' }));

    expect(
      screen.queryByRole('dialog', { name: 'Przytnij zdjęcie' }),
    ).toBeNull();
    expect(uploads).toHaveLength(0);
  });

  it('rejects a file that is not an image without calling the server', async () => {
    render(<ProfileEditModal />);
    await screen.findByRole('textbox', { name: 'Imię i nazwisko' });

    await userEvent.upload(
      chooser(),
      new File(['hello'], 'notes.png', { type: 'image/png' }),
    );

    expect(
      await screen.findByText('File must be a JPEG, PNG, WebP or GIF image'),
    ).toBeVisible();
    expect(uploads).toHaveLength(0);
  });

  it('keeps the old picture and reports an error when the upload fails', async () => {
    uploadResponse = {
      code: 400,
      type: 'bad-request',
      message: 'Broken image',
    };
    render(<ProfileEditModal />);
    await screen.findByRole('textbox', { name: 'Imię i nazwisko' });

    await userEvent.upload(chooser(), png());
    await userEvent.click(
      await screen.findByRole('button', { name: 'Zatwierdź' }),
    );

    expect(await screen.findByText('Broken image')).toBeVisible();
    expect(
      screen.queryByRole('img', { name: /zdjęcie profilowe/i }),
    ).toBeNull();
  });
});
