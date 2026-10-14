import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { Main } from '../presentation/main';

const SETTINGS = {
  profile: { name: 'Ada', email: 'ada@example.com' },
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

describe('profile edit in settings', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => {
    server.resetHandlers();
    saved = [];
  });
  afterAll(() => server.close());

  it('shows the saved profile without an edit button', async () => {
    render(<Main />);

    expect(await nameField()).toHaveValue('Ada');
    expect(screen.getByRole('textbox', { name: 'E-mail' })).toHaveValue(
      'ada@example.com',
    );
    expect(screen.queryByRole('button', { name: 'Edytuj' })).toBeNull();
  });

  it('keeps saving disabled until the profile changes', async () => {
    const user = userEvent.setup();
    render(<Main />);
    const name = await nameField();
    expect(saveButton()).toBeDisabled();

    await user.type(name, 'm');

    expect(saveButton()).toBeEnabled();
  });

  it('blocks saving an empty name', async () => {
    const user = userEvent.setup();
    render(<Main />);

    await user.clear(await nameField());

    expect(saveButton()).toBeDisabled();
  });

  it('saves the trimmed profile on Enter', async () => {
    const user = userEvent.setup();
    render(<Main />);
    const name = await nameField();

    await user.clear(name);
    await user.type(name, '  Anna  {Enter}');

    await screen.findByRole('textbox', { name: 'Imię i nazwisko' });
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({
      profile: { name: 'Anna', email: 'ada@example.com' },
    });
  });

  it('shows notifications entry once', async () => {
    render(<Main />);
    await nameField();

    expect(screen.getAllByRole('link', { name: 'Powiadomienia' })).toHaveLength(
      1,
    );
  });
});
