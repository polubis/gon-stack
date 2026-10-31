import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { pickOption } from '@/__tests__/pick-option';
import { Main } from '../presentation/main';

const SECRET = 'parka_mcp_Zq8xKd3mN7vB2wRt5yHjLp9cFgAs4EuXoI1QhVnYb6k';

type Item = {
  id: string;
  name: string;
  hint: string;
  tail: string;
  status: 'active' | 'expired' | 'revoked';
  ttlDays: number | null;
  expiresAt: string | null;
  lastUsedAt: string | null;
  rotatedAt: string | null;
  createdAt: string;
};

const item = (patch: Partial<Item> = {}): Item => ({
  id: '0b9a4a52-6a9c-4f3c-8f0e-1d6f1c7a0001',
  name: 'Claude Desktop',
  hint: 'Zq8x',
  tail: 'Yb6k',
  status: 'active',
  ttlDays: 30,
  expiresAt: '2026-11-23T10:00:00.000Z',
  lastUsedAt: null,
  rotatedAt: null,
  createdAt: '2026-10-24T10:00:00.000Z',
  ...patch,
});

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

/** In-memory stand-in for the token endpoints. */
const stubApi = (
  initial: Item[],
  overrides: { createStatus?: number; renameStatus?: number } = {},
) => {
  let tokens = [...initial];
  const created: unknown[] = [];
  const renamed: unknown[] = [];

  server.use(
    http.get('/api/mcp-tokens/', () =>
      HttpResponse.json({ code: 200, data: tokens }),
    ),
    http.post('/api/mcp-tokens/', async ({ request }) => {
      const body = (await request.json()) as { name: string; ttlDays: number };
      created.push(body);
      if (overrides.createStatus && overrides.createStatus !== 201)
        return HttpResponse.json({
          code: overrides.createStatus,
          type: 'internal-server',
          message: 'boom',
        });
      const next = item({
        id: '0b9a4a52-6a9c-4f3c-8f0e-1d6f1c7a0002',
        name: body.name,
        ttlDays: body.ttlDays,
      });
      tokens = [next, ...tokens];
      return HttpResponse.json({
        code: 201,
        data: { token: SECRET, item: next },
      });
    }),
    http.post('/api/mcp-tokens/:id/rotate/', ({ params }) => {
      const rotated = item({ id: String(params.id), tail: 'Rt8n' });
      tokens = tokens.map((t) => (t.id === params.id ? rotated : t));
      return HttpResponse.json({
        code: 200,
        data: { token: SECRET, item: rotated },
      });
    }),
    http.post('/api/mcp-tokens/:id/revoke/', ({ params }) => {
      tokens = tokens.map((t) =>
        t.id === params.id ? { ...t, status: 'revoked' as const } : t,
      );
      return HttpResponse.json({
        code: 200,
        data: tokens.find((t) => t.id === params.id),
      });
    }),
    http.patch('/api/mcp-tokens/:id/', async ({ params, request }) => {
      const body = (await request.json()) as { name: string };
      renamed.push(body);
      if (overrides.renameStatus && overrides.renameStatus !== 200)
        return HttpResponse.json({
          code: overrides.renameStatus,
          type: 'internal-server',
          message: 'boom',
        });
      tokens = tokens.map((t) =>
        t.id === params.id ? { ...t, name: body.name } : t,
      );
      return HttpResponse.json({
        code: 200,
        data: tokens.find((t) => t.id === params.id),
      });
    }),
    http.delete('/api/mcp-tokens/:id/', ({ params }) => {
      tokens = tokens.filter((t) => t.id !== params.id);
      return HttpResponse.json({ code: 200, ok: true });
    }),
  );

  return { created, renamed };
};

const setup = async (initial: Item[], overrides = {}) => {
  const api = stubApi(initial, overrides);
  const user = userEvent.setup();
  render(<Main />);
  await waitFor(() =>
    expect(screen.queryByText('Serwer MCP')).toBeInTheDocument(),
  );
  return { user, ...api };
};

const generate = async (
  user: ReturnType<typeof userEvent.setup>,
  name: string,
) => {
  await user.click(screen.getAllByRole('button', { name: /Generuj/ })[0]!);
  const dialog = await screen.findByRole('dialog', { name: 'Nowy token' });
  await user.type(within(dialog).getByRole('textbox', { name: 'Nazwa' }), name);
  await user.click(
    within(dialog).getByRole('button', { name: 'Generuj token' }),
  );
};

describe('access tokens list', () => {
  it('invites to generate the first token when there are none', async () => {
    await setup([]);

    expect(screen.getByText('Nie masz jeszcze tokenów')).toBeInTheDocument();
  });

  it('lists a token by its masked form only', async () => {
    await setup([item()]);

    expect(screen.getByText('Claude Desktop')).toBeInTheDocument();
    expect(screen.getByText('parka_mcp_Zq8x…Yb6k')).toBeInTheDocument();
    expect(screen.getByText('Aktywny')).toBeInTheDocument();
    expect(screen.getByText('Nigdy')).toBeInTheDocument();
    expect(screen.queryByText(SECRET)).not.toBeInTheDocument();
  });

  it('offers no rotate or disable for a disabled token', async () => {
    await setup([item({ status: 'revoked' })]);

    expect(screen.getByText('Wyłączony')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Zmień token/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Wyłącz token/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Usuń token/ }),
    ).toBeInTheDocument();
  });

  it('marks an expired token', async () => {
    await setup([item({ status: 'expired' })]);

    expect(screen.getByText('Wygasł')).toBeInTheDocument();
  });

  it('explains a failed load and offers a retry', async () => {
    server.use(
      http.get('/api/mcp-tokens/', () =>
        HttpResponse.json({
          code: 500,
          type: 'internal-server',
          message: 'db',
        }),
      ),
    );
    render(<Main />);

    expect(
      await screen.findByText('Nie udało się wczytać tokenów'),
    ).toBeInTheDocument();
    expect(screen.getByText('ACCESS_TOKENS_LOAD')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Spróbuj ponownie' }),
    ).toBeInTheDocument();
  });
});

describe('access token creation', () => {
  it('shows the secret once and never again', async () => {
    const { user, created } = await setup([]);

    await generate(user, 'Cursor');

    const reveal = await screen.findByRole('dialog', {
      name: 'Twój nowy token',
    });
    expect(within(reveal).getByText(SECRET)).toBeInTheDocument();
    expect(created).toEqual([{ name: 'Cursor', ttlDays: 30 }]);

    await user.click(within(reveal).getByRole('button', { name: 'Gotowe' }));

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(screen.queryByText(SECRET)).not.toBeInTheDocument();
    expect(screen.getByText('Cursor')).toBeInTheDocument();
    expect(screen.getByText('parka_mcp_Zq8x…Yb6k')).toBeInTheDocument();
  });

  it('points the client at the address of the site it is opened on', async () => {
    const { user } = await setup([]);
    const endpoint = `${window.location.origin}/api/mcp/`;

    expect(screen.getByText(endpoint)).toBeInTheDocument();

    await generate(user, 'Cursor');
    const reveal = await screen.findByRole('dialog', {
      name: 'Twój nowy token',
    });

    expect(
      within(reveal).getByText(
        `claude mcp add --transport http parka ${endpoint} --header "Authorization: Bearer ${SECRET}"`,
      ),
    ).toBeInTheDocument();
  });

  it('confirms with a plain toast', async () => {
    const { user } = await setup([]);

    await generate(user, 'Cursor');

    expect(await screen.findByText('Utworzono token.')).toBeInTheDocument();
  });

  it('sends no expiry when the token should never expire', async () => {
    const { user, created } = await setup([]);
    await user.click(screen.getAllByRole('button', { name: /Generuj/ })[0]!);
    const dialog = await screen.findByRole('dialog', { name: 'Nowy token' });
    await user.type(
      within(dialog).getByRole('textbox', { name: 'Nazwa' }),
      'Forever',
    );

    await pickOption(
      user,
      within(dialog).getByRole('combobox', { name: 'Ważność' }),
      'Bez wygaśnięcia',
    );
    await user.click(
      within(dialog).getByRole('button', { name: 'Generuj token' }),
    );

    await screen.findByRole('dialog', { name: 'Twój nowy token' });
    expect(created).toEqual([{ name: 'Forever', ttlDays: null }]);
  });

  it('does not submit a blank name', async () => {
    const { user } = await setup([]);
    await user.click(screen.getAllByRole('button', { name: /Generuj/ })[0]!);
    const dialog = await screen.findByRole('dialog', { name: 'Nowy token' });

    expect(
      within(dialog).getByRole('button', { name: 'Generuj token' }),
    ).toBeDisabled();
  });

  it('reports a failure with its code and a retry', async () => {
    const { user } = await setup([], { createStatus: 500 });

    await generate(user, 'Cursor');

    expect(
      await screen.findByText('Nie udało się utworzyć tokenu'),
    ).toBeInTheDocument();
    expect(screen.getByText('boom')).toBeInTheDocument();
    expect(screen.getByText('ACCESS_TOKEN_CREATE_FAILED')).toBeInTheDocument();
    expect(screen.queryByText(SECRET)).not.toBeInTheDocument();
  });
});

describe('access token management', () => {
  it('renames a token so its comments sign with the new name', async () => {
    const { user, renamed } = await setup([item()]);

    await user.click(
      screen.getByRole('button', { name: 'Zmień nazwę tokenu Claude Desktop' }),
    );
    const dialog = await screen.findByRole('dialog', { name: 'Nazwa tokenu' });
    const input = within(dialog).getByRole('textbox', { name: 'Nazwa' });
    await user.clear(input);
    await user.type(input, 'Asystent domowy');
    await user.click(
      within(dialog).getByRole('button', { name: 'Zapisz nazwę' }),
    );

    expect(
      await screen.findByText('Zmieniono nazwę tokenu.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Asystent domowy' }),
    ).toBeInTheDocument();
    expect(renamed).toEqual([{ name: 'Asystent domowy' }]);
  });

  it('does not submit an unchanged or blank name', async () => {
    const { user } = await setup([item()]);

    await user.click(
      screen.getByRole('button', { name: 'Zmień nazwę tokenu Claude Desktop' }),
    );
    const dialog = await screen.findByRole('dialog', { name: 'Nazwa tokenu' });
    const save = within(dialog).getByRole('button', { name: 'Zapisz nazwę' });
    expect(save).toBeDisabled();

    await user.clear(within(dialog).getByRole('textbox', { name: 'Nazwa' }));
    expect(save).toBeDisabled();
  });

  it('restores the name and explains when renaming fails', async () => {
    const { user } = await setup([item()], { renameStatus: 500 });

    await user.click(
      screen.getByRole('button', { name: 'Zmień nazwę tokenu Claude Desktop' }),
    );
    const dialog = await screen.findByRole('dialog', { name: 'Nazwa tokenu' });
    const input = within(dialog).getByRole('textbox', { name: 'Nazwa' });
    await user.clear(input);
    await user.type(input, 'Nowa');
    await user.click(
      within(dialog).getByRole('button', { name: 'Zapisz nazwę' }),
    );

    expect(
      await screen.findByText('ACCESS_TOKEN_RENAME_FAILED'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Claude Desktop' }),
    ).toBeInTheDocument();
  });

  it('disables a token only after confirmation', async () => {
    const { user } = await setup([item()]);

    await user.click(
      screen.getByRole('button', { name: 'Wyłącz token Claude Desktop' }),
    );
    const dialog = await screen.findByRole('dialog');
    expect(screen.getByText('Aktywny')).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Wyłącz' }));

    expect(await screen.findByText('Wyłączono token.')).toBeInTheDocument();
    expect(screen.getByText('Wyłączony')).toBeInTheDocument();
  });

  it('keeps the token when the confirmation is cancelled', async () => {
    const { user } = await setup([item()]);

    await user.click(
      screen.getByRole('button', { name: 'Usuń token Claude Desktop' }),
    );
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Anuluj' }));

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(screen.getByText('Claude Desktop')).toBeInTheDocument();
  });

  it('deletes a token after confirmation', async () => {
    const { user } = await setup([item()]);

    await user.click(
      screen.getByRole('button', { name: 'Usuń token Claude Desktop' }),
    );
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Usuń' }));

    expect(await screen.findByText('Usunięto token.')).toBeInTheDocument();
    expect(screen.queryByText('Claude Desktop')).not.toBeInTheDocument();
    expect(screen.getByText('Nie masz jeszcze tokenów')).toBeInTheDocument();
  });

  it('rotates a token and reveals its new secret once', async () => {
    const { user } = await setup([item()]);

    await user.click(
      screen.getByRole('button', { name: 'Zmień token Claude Desktop' }),
    );
    const confirm = await screen.findByRole('dialog');
    await user.click(within(confirm).getByRole('button', { name: 'Zmień' }));

    const reveal = await screen.findByRole('dialog', {
      name: 'Token zmieniony',
    });
    expect(within(reveal).getByText(SECRET)).toBeInTheDocument();
    await user.click(within(reveal).getByRole('button', { name: 'Gotowe' }));
    await waitFor(() =>
      expect(screen.queryByText(SECRET)).not.toBeInTheDocument(),
    );
    expect(screen.getByText('parka_mcp_Zq8x…Rt8n')).toBeInTheDocument();
  });

  it('restores the token and explains when deleting fails', async () => {
    const { user } = await setup([item()]);
    server.use(
      http.delete('/api/mcp-tokens/:id/', () =>
        HttpResponse.json({
          code: 500,
          type: 'internal-server',
          message: 'no',
        }),
      ),
    );

    await user.click(
      screen.getByRole('button', { name: 'Usuń token Claude Desktop' }),
    );
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Usuń' }));

    expect(
      await screen.findByText('Nie udało się usunąć tokenu'),
    ).toBeInTheDocument();
    expect(screen.getByText('Claude Desktop')).toBeInTheDocument();
  });
});
