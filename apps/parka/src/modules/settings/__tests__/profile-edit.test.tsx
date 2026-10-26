import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { Main } from '../presentation/main';
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

let saved: unknown[] = [];

const server = setupServer(
  http.get('/api/settings/', () =>
    HttpResponse.json({ code: 200, data: SETTINGS }),
  ),
  http.get('/api/avatar/', () => HttpResponse.json({ code: 200, data: null })),
  http.put('/api/settings/', async ({ request }) => {
    const body = await request.json();
    saved.push(body);
    return HttpResponse.json({ code: 200, data: body });
  }),
);

const nameField = () =>
  screen.findByRole('textbox', { name: 'Imię i nazwisko' });
const saveButton = () => screen.getByRole('button', { name: 'Zapisz' });

const openProfile = () => {
  window.history.replaceState(null, '', '/app/?modal=profile');
  render(<ProfileEditModal />);
};

describe('profile edit', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => {
    window.history.replaceState(null, '', '/app/');
    server.resetHandlers();
    saved = [];
  });
  afterAll(() => server.close());

  it('shows the saved profile', async () => {
    openProfile();

    expect(await nameField()).toHaveValue('Ada');
    expect(screen.queryByRole('textbox', { name: 'E-mail' })).toBeNull();
  });

  it('keeps saving disabled until the profile changes', async () => {
    const user = userEvent.setup();
    openProfile();
    const name = await nameField();
    expect(saveButton()).toBeDisabled();

    await user.type(name, 'm');

    expect(saveButton()).toBeEnabled();
  });

  it('blocks saving an empty name', async () => {
    const user = userEvent.setup();
    openProfile();

    await user.clear(await nameField());

    expect(saveButton()).toBeDisabled();
  });

  it('saves the trimmed profile on Enter', async () => {
    const user = userEvent.setup();
    openProfile();
    const name = await nameField();

    await user.clear(name);
    await user.type(name, '  Anna  {Enter}');

    await waitFor(() => expect(saved).toHaveLength(1));
    expect(saved[0]).toMatchObject({
      profile: { name: 'Anna' },
    });
  });

  it('shows notifications entry once', async () => {
    render(<Main />);
    await screen.findByText('Wygląd');

    expect(screen.getAllByRole('link', { name: 'Powiadomienia' })).toHaveLength(
      1,
    );
  });

  it('closes after saving', async () => {
    const user = userEvent.setup();
    openProfile();

    await user.type(await nameField(), 'm{Enter}');

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(saved).toHaveLength(1);
  });

  it('keeps the profile form off the settings page', async () => {
    render(<Main />);
    await screen.findByText('Wygląd');

    expect(
      screen.queryByRole('textbox', { name: 'Imię i nazwisko' }),
    ).toBeNull();
    expect(
      screen.queryByRole('button', { name: 'Zmień zdjęcie profilowe' }),
    ).toBeNull();
  });

  it('does not link to the expense categories from settings', async () => {
    render(<Main />);
    await screen.findByText('Wygląd');

    expect(screen.queryByRole('link', { name: 'Kategorie' })).toBeNull();
  });
});
