import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderTime } from './render-time';
import { setupTimeBackend, task } from './time-backend';

const backend = setupTimeBackend();

afterEach(() => vi.useRealTimers());

const OWN = {
  id: 'c-1',
  body: 'Zadzwonić do klienta',
  createdAt: '2026-10-31T10:00:00.000Z',
  editedAt: null,
  bot: null,
};

const BOT = {
  id: 'c-2',
  body: 'Raport gotowy',
  createdAt: '2026-10-31T11:30:00.000Z',
  editedAt: null,
  bot: { name: 'Claude Desktop', ref: '0b9a4a52' },
};

const openDetails = async (user: ReturnType<typeof userEvent.setup>) => {
  renderTime();
  await user.click(
    await screen.findByRole('button', {
      name: 'Szczegóły zadania: Raport miesięczny',
    }),
  );
  return within(await screen.findByRole('dialog'));
};

const startComposing = async (
  user: ReturnType<typeof userEvent.setup>,
  details: ReturnType<typeof within>,
) => {
  await user.click(
    await details.findByRole('button', { name: 'Dodaj komentarz' }),
  );
  return details.getByLabelText('Nowy komentarz');
};

describe('task comments', () => {
  it('says there are no comments yet', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);

    const details = await openDetails(user);

    expect(await details.findByText('Brak komentarzy')).toBeVisible();
  });

  it('shows content, time and author of a comment', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    backend.state.comments['t-1'] = [OWN];

    const details = await openDetails(user);

    expect(await details.findByText('Zadzwonić do klienta')).toBeVisible();
    expect(details.getByText('Anna Kowalska')).toBeVisible();
    expect(details.getByText(/31 paź 2026/)).toHaveAttribute(
      'datetime',
      '2026-10-31T10:00:00.000Z',
    );
    expect(
      details.getByRole('img', { name: 'Autor: Anna Kowalska' }),
    ).toBeVisible();
  });

  it('shows a bot comment with the token name and its identifier', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    backend.state.comments['t-1'] = [BOT];

    const details = await openDetails(user);

    expect(await details.findByText('Raport gotowy')).toBeVisible();
    expect(details.getByText('Claude Desktop')).toBeVisible();
    expect(details.getByText('Bot MCP · #0b9a4a52')).toBeVisible();
    expect(
      details.getByRole('img', { name: 'Autor: bot Claude Desktop' }),
    ).toHaveAttribute('data-kind', 'bot');
  });

  it('shows a split avatar for a bot comment the owner edited', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    backend.state.comments['t-1'] = [
      { ...BOT, editedAt: '2026-10-31T12:00:00.000Z' },
    ];

    const details = await openDetails(user);

    expect(
      await details.findByRole('img', {
        name: 'Autorzy: Anna Kowalska i bot Claude Desktop',
      }),
    ).toHaveAttribute('data-kind', 'split');
    expect(details.getByText('(edytowano)')).toBeVisible();
  });

  it('adds a comment and confirms it', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    const details = await openDetails(user);

    await user.type(await startComposing(user, details), 'Pierwsza notatka');
    await user.click(details.getByRole('button', { name: 'Dodaj' }));

    expect(await details.findByText('Pierwsza notatka')).toBeVisible();
    expect(await screen.findByText('Dodano komentarz')).toBeVisible();
    expect(backend.state.comments['t-1']).toHaveLength(1);
    expect(backend.writes()[0]?.body).toEqual({ body: 'Pierwsza notatka' });
  });

  it('does not let a blank comment be sent', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    const details = await openDetails(user);

    await user.type(await startComposing(user, details), '   ');

    expect(details.getByRole('button', { name: 'Dodaj' })).toBeDisabled();
  });

  it('drops the comment and offers a retry when adding fails', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    const details = await openDetails(user);
    const input = await startComposing(user, details);
    backend.state.failCommentWrites = true;

    await user.type(input, 'Nie wyjdzie');
    await user.click(details.getByRole('button', { name: 'Dodaj' }));

    expect(await screen.findByText('COMMENT_CREATE')).toBeVisible();
    expect(screen.getByRole('button', { name: /ponownie/i })).toBeVisible();
    await waitFor(() => expect(details.queryByText('Nie wyjdzie')).toBeNull());
  });

  it('edits a comment and marks it as edited', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    backend.state.comments['t-1'] = [OWN];
    const details = await openDetails(user);

    await user.click(
      await details.findByRole('button', { name: /^Edytuj komentarz/ }),
    );
    const input = details.getByLabelText('Treść komentarza');
    await user.clear(input);
    await user.type(input, 'Zadzwonić jutro');
    await user.click(details.getByRole('button', { name: 'Zapisz' }));

    expect(await details.findByText('Zadzwonić jutro')).toBeVisible();
    expect(await details.findByText('(edytowano)')).toBeVisible();
    expect(await screen.findByText('Zapisano komentarz')).toBeVisible();
  });

  it('splits the avatar after the owner edits a bot comment', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    backend.state.comments['t-1'] = [BOT];
    const details = await openDetails(user);

    await user.click(
      await details.findByRole('button', { name: /^Edytuj komentarz/ }),
    );
    await user.type(
      details.getByLabelText('Treść komentarza'),
      ' (sprawdzone)',
    );
    await user.click(details.getByRole('button', { name: 'Zapisz' }));

    expect(
      await details.findByRole('img', {
        name: 'Autorzy: Anna Kowalska i bot Claude Desktop',
      }),
    ).toBeVisible();
  });

  it('deletes a comment only after confirmation', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    backend.state.comments['t-1'] = [OWN];
    const details = await openDetails(user);

    await user.click(
      await details.findByRole('button', { name: /^Usuń komentarz/ }),
    );
    expect(backend.writes()).toHaveLength(0);

    const confirm = within(
      await screen.findByRole('dialog', { name: 'Usunąć komentarz?' }),
    );
    await user.click(confirm.getByRole('button', { name: 'Usuń' }));

    await waitFor(() =>
      expect(details.queryByText('Zadzwonić do klienta')).toBeNull(),
    );
    expect(backend.state.comments['t-1']).toEqual([]);
    expect(await screen.findByText('Usunięto komentarz')).toBeVisible();
  });

  it('keeps the comment when the confirmation is cancelled', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    backend.state.comments['t-1'] = [OWN];
    const details = await openDetails(user);

    await user.click(
      await details.findByRole('button', { name: /^Usuń komentarz/ }),
    );
    const confirm = within(
      await screen.findByRole('dialog', { name: 'Usunąć komentarz?' }),
    );
    await user.click(confirm.getByRole('button', { name: 'Anuluj' }));

    expect(await details.findByText('Zadzwonić do klienta')).toBeVisible();
    expect(backend.writes()).toHaveLength(0);
  });

  it('brings the comment back when deleting fails', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    backend.state.comments['t-1'] = [OWN];
    const details = await openDetails(user);
    backend.state.failCommentWrites = true;

    await user.click(
      await details.findByRole('button', { name: /^Usuń komentarz/ }),
    );
    const confirm = within(
      await screen.findByRole('dialog', { name: 'Usunąć komentarz?' }),
    );
    await user.click(confirm.getByRole('button', { name: 'Usuń' }));

    expect(await screen.findByText('COMMENT_DELETE')).toBeVisible();
    expect(await details.findByText('Zadzwonić do klienta')).toBeVisible();
  });

  it('offers a retry when the list cannot be loaded', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    backend.state.failCommentReads = true;
    backend.state.comments['t-1'] = [OWN];
    const details = await openDetails(user);

    expect(await details.findByText('COMMENTS_LOAD')).toBeVisible();
    backend.state.failCommentReads = false;
    await user.click(
      details.getAllByRole('button', { name: 'Spróbuj ponownie' })[0]!,
    );

    expect(await details.findByText('Zadzwonić do klienta')).toBeVisible();
  });
});
