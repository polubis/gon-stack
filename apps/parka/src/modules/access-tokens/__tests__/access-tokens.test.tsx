import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
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
  overrides: { createStatus?: number } = {},
) => {
  let tokens = [...initial];
  const created: unknown[] = [];

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
    http.post('/api/mcp-tokens/:id/revoke/', ({ params }) => {
      tokens = tokens.map((t) =>
        t.id === params.id ? { ...t, status: 'revoked' as const } : t,
      );
      return HttpResponse.json({
        code: 200,
        data: tokens.find((t) => t.id === params.id),
      });
    }),
    http.post('/api/mcp-tokens/:id/resume/', ({ params }) => {
      tokens = tokens.map((t) =>
        t.id === params.id ? { ...t, status: 'active' as const } : t,
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

  return { created };
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

const manyTokens = (count: number): Item[] =>
  Array.from({ length: count }, (_, i) =>
    item({ id: `token-${i}`, name: `Client ${i}` }),
  );

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

  it('offers resume but no pause for a paused token', async () => {
    await setup([item({ status: 'revoked' })]);

    expect(screen.getByText('Wstrzymany')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Wstrzymaj token/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Wznów token/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Usuń token/ }),
    ).toBeInTheDocument();
  });

  it('marks an expired token', async () => {
    await setup([item({ status: 'expired' })]);

    expect(screen.getByText('Wygasł')).toBeInTheDocument();
  });

  it('shows when a token expires, expired or never does', async () => {
    await setup([
      item({ id: 'a', name: 'Soon', expiresAt: '2026-12-01T10:00:00.000Z' }),
      item({
        id: 'b',
        name: 'Old',
        status: 'expired',
        expiresAt: '2026-10-01T10:00:00.000Z',
      }),
      item({ id: 'c', name: 'Forever', ttlDays: null, expiresAt: null }),
    ]);

    const rows = within(
      screen.getByRole('list', { name: 'Tokeny' }),
    ).getAllByRole('listitem');
    expect(within(rows[0]!).getByText(/^Wygasa /)).toBeInTheDocument();
    expect(within(rows[1]!).getByText(/^Wygasł /)).toBeInTheDocument();
    expect(within(rows[2]!).getByText('Bez wygaśnięcia')).toBeInTheDocument();
  });

  it('shows when a token was last used instead of never', async () => {
    await setup([item({ lastUsedAt: '2026-11-20T09:30:00.000Z' })]);

    expect(screen.queryByText('Nigdy')).not.toBeInTheDocument();
  });

  it('lets one more token be generated below the limit', async () => {
    await setup(manyTokens(9));

    expect(screen.getAllByRole('button', { name: /Generuj/ })[0]).toBeEnabled();
    expect(screen.queryByText(/Limit 10 tokenów/)).not.toBeInTheDocument();
  });

  it('blocks generating at the token limit and says why', async () => {
    await setup(manyTokens(10));

    expect(
      screen.getAllByRole('button', { name: /Generuj/ })[0],
    ).toBeDisabled();
    expect(
      screen.getByText('Limit 10 tokenów. Usuń nieużywany, aby dodać nowy.'),
    ).toBeInTheDocument();
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
  it('shows the secret right after generating', async () => {
    const { user, created } = await setup([]);

    await generate(user, 'Cursor');

    const reveal = await screen.findByRole('dialog', {
      name: 'Twój nowy token',
    });
    expect(within(reveal).getByText(SECRET)).toBeInTheDocument();
    expect(created).toEqual([{ name: 'Cursor', ttlDays: 30 }]);
  });

  it('never shows the secret again once the dialog is done', async () => {
    const { user } = await setup([]);
    await generate(user, 'Cursor');
    const reveal = await screen.findByRole('dialog', {
      name: 'Twój nowy token',
    });

    await user.click(within(reveal).getByRole('button', { name: 'Gotowe' }));

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(screen.queryByText(SECRET)).not.toBeInTheDocument();
    expect(screen.getByText('Cursor')).toBeInTheDocument();
    expect(screen.getByText('parka_mcp_Zq8x…Yb6k')).toBeInTheDocument();
  });

  it('shows the address of the site it is opened on', async () => {
    await setup([]);
    const endpoint = `${window.location.origin}/api/mcp/`;

    expect(screen.getByText(endpoint)).toBeInTheDocument();
  });

  it('puts the address of the site in the command that adds the client', async () => {
    const { user } = await setup([]);
    const endpoint = `${window.location.origin}/api/mcp/`;

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

  it('stays silent on success, the secret dialog is the feedback', async () => {
    const { user } = await setup([]);

    await generate(user, 'Cursor');

    await screen.findByRole('dialog', { name: 'Twój nowy token' });
    expect(screen.queryByText('Utworzono token.')).not.toBeInTheDocument();
  });

  it('sends no expiry for a token that never expires', async () => {
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

  it('sends the name without surrounding spaces', async () => {
    const { user, created } = await setup([]);

    await generate(user, '  Cursor  ');

    await screen.findByRole('dialog', { name: 'Twój nowy token' });
    expect(created).toEqual([{ name: 'Cursor', ttlDays: 30 }]);
  });

  it('keeps the name within 60 characters', async () => {
    const { user } = await setup([]);
    await user.click(screen.getAllByRole('button', { name: /Generuj/ })[0]!);
    const dialog = await screen.findByRole('dialog', { name: 'Nowy token' });
    const name = within(dialog).getByRole('textbox', { name: /Nazwa/ });

    await user.type(name, 'x'.repeat(75));

    expect(name).toHaveValue('x'.repeat(60));
  });

  it('copies the secret to the clipboard on request', async () => {
    const { user } = await setup([]);
    await generate(user, 'Cursor');
    const reveal = await screen.findByRole('dialog', {
      name: 'Twój nowy token',
    });

    await user.click(
      within(reveal).getByRole('button', { name: 'Kopiuj token' }),
    );

    expect(
      await within(reveal).findByRole('button', { name: 'Skopiowano' }),
    ).toBeInTheDocument();
    expect(await navigator.clipboard.readText()).toBe(SECRET);
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
  it('keeps the token active until the pause is confirmed', async () => {
    const { user } = await setup([item()]);

    await user.click(
      screen.getByRole('button', { name: 'Wstrzymaj token Claude Desktop' }),
    );

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Aktywny')).toBeInTheDocument();
  });

  it('pauses a token after confirmation', async () => {
    const { user } = await setup([item()]);
    await user.click(
      screen.getByRole('button', { name: 'Wstrzymaj token Claude Desktop' }),
    );
    const dialog = await screen.findByRole('dialog');

    await user.click(within(dialog).getByRole('button', { name: 'Wstrzymaj' }));

    expect(screen.getByText('Wstrzymany')).toBeInTheDocument();
  });

  it('resumes a paused token without confirmation', async () => {
    const { user } = await setup([item({ status: 'revoked' })]);

    await user.click(
      screen.getByRole('button', { name: 'Wznów token Claude Desktop' }),
    );

    expect(screen.getByText('Aktywny')).toBeInTheDocument();
  });

  it('keeps the token active and explains when pausing fails', async () => {
    const { user } = await setup([item()]);
    server.use(
      http.post('/api/mcp-tokens/:id/revoke/', () =>
        HttpResponse.json({
          code: 500,
          type: 'internal-server',
          message: 'no',
        }),
      ),
    );

    await user.click(
      screen.getByRole('button', { name: 'Wstrzymaj token Claude Desktop' }),
    );
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Wstrzymaj' }));

    expect(
      await screen.findByText('ACCESS_TOKEN_PAUSE_FAILED'),
    ).toBeInTheDocument();
    expect(screen.getByText('Aktywny')).toBeInTheDocument();
  });

  it('keeps the token paused and explains when resuming fails', async () => {
    const { user } = await setup([item({ status: 'revoked' })]);
    server.use(
      http.post('/api/mcp-tokens/:id/resume/', () =>
        HttpResponse.json({
          code: 500,
          type: 'internal-server',
          message: 'no',
        }),
      ),
    );

    await user.click(
      screen.getByRole('button', { name: 'Wznów token Claude Desktop' }),
    );

    expect(
      await screen.findByText('ACCESS_TOKEN_RESUME_FAILED'),
    ).toBeInTheDocument();
    expect(screen.getByText('Wstrzymany')).toBeInTheDocument();
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

    expect(screen.queryByText('Claude Desktop')).not.toBeInTheDocument();
    expect(screen.getByText('Nie masz jeszcze tokenów')).toBeInTheDocument();
  });

  it('lets a deleted token leave the list before it disappears', async () => {
    vi.stubGlobal('matchMedia', () => ({ matches: false }));
    try {
      const { user } = await setup([item()]);

      await user.click(
        screen.getByRole('button', { name: 'Usuń token Claude Desktop' }),
      );
      const dialog = await screen.findByRole('dialog');
      await user.click(within(dialog).getByRole('button', { name: 'Usuń' }));

      expect(
        screen.queryByRole('button', { name: 'Usuń token Claude Desktop' }),
      ).not.toBeInTheDocument();
      expect(
        await screen.findByText('Nie masz jeszcze tokenów'),
      ).toBeInTheDocument();
      expect(screen.queryByText('Claude Desktop')).not.toBeInTheDocument();
    } finally {
      vi.unstubAllGlobals();
    }
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
