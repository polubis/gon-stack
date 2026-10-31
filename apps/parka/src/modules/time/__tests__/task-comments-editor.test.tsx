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

const PICTURE = 'https://img.test/anna.png';

type User = ReturnType<typeof userEvent.setup>;
type Details = ReturnType<typeof within>;

const openDetails = async (user: User): Promise<Details> => {
  renderTime();
  await user.click(
    await screen.findByRole('button', {
      name: 'Szczegóły zadania: Raport miesięczny',
    }),
  );
  return within(await screen.findByRole('dialog'));
};

const startComposing = async (user: User, details: Details) => {
  await user.click(
    await details.findByRole('button', { name: 'Dodaj komentarz' }),
  );
  return details.getByLabelText('Nowy komentarz');
};

const startEditing = async (user: User, details: Details) => {
  await user.click(
    await details.findByRole('button', { name: /^Edytuj komentarz/ }),
  );
  return details.getByLabelText('Treść komentarza');
};

describe('task comment heading', () => {
  it('counts the comments', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    backend.state.comments['t-1'] = [OWN, BOT];

    const details = await openDetails(user);

    expect(
      await details.findByRole('heading', { name: /Komentarze \(2\)/ }),
    ).toBeVisible();
  });

  it('names the owner and the bot on an edited bot comment', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    backend.state.comments['t-1'] = [
      { ...BOT, editedAt: '2026-10-31T12:00:00.000Z' },
    ];

    const details = await openDetails(user);

    expect(
      await details.findByText('Anna Kowalska + Claude Desktop'),
    ).toBeVisible();
  });
});

describe('task comment keyboard', () => {
  it('saves a new comment with Ctrl+Enter', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    const details = await openDetails(user);

    await user.type(
      await startComposing(user, details),
      'Szybka notatka{Control>}{Enter}{/Control}',
    );

    expect(await details.findByText('Szybka notatka')).toBeVisible();
    expect(backend.writes()[0]?.body).toEqual({ body: 'Szybka notatka' });
  });

  it('saves a new comment with Cmd+Enter', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    const details = await openDetails(user);

    await user.type(
      await startComposing(user, details),
      'Z maca{Meta>}{Enter}{/Meta}',
    );

    expect(await details.findByText('Z maca')).toBeVisible();
  });

  it('keeps typing on a plain Enter instead of saving', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    const details = await openDetails(user);

    const input = await startComposing(user, details);
    await user.type(input, 'linia 1{Enter}linia 2');

    expect(input).toHaveValue('linia 1\nlinia 2');
    expect(backend.writes()).toHaveLength(0);
  });

  it('does not save a blank comment with Ctrl+Enter', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    const details = await openDetails(user);

    await user.type(
      await startComposing(user, details),
      '   {Control>}{Enter}{/Control}',
    );

    expect(backend.writes()).toHaveLength(0);
  });

  it('never saves what was typed when Escape is pressed', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    backend.state.comments['t-1'] = [OWN];
    const details = await openDetails(user);

    await user.type(await startEditing(user, details), ' zmiana{Escape}');

    expect(backend.writes()).toHaveLength(0);
    expect(backend.state.comments['t-1']).toEqual([OWN]);
  });

  it('cancels a new comment with Escape and keeps the details open', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    const details = await openDetails(user);

    await user.type(await startComposing(user, details), 'porzucone{Escape}');

    await waitFor(() =>
      expect(details.queryByLabelText('Nowy komentarz')).toBeNull(),
    );
    expect(screen.getByRole('dialog')).toBeVisible();
    expect(backend.writes()).toHaveLength(0);
  });

  it('cancels an edit with Escape and keeps the old text', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    backend.state.comments['t-1'] = [OWN];
    const details = await openDetails(user);

    await user.type(await startEditing(user, details), ' zmiana{Escape}');

    expect(await details.findByText('Zadzwonić do klienta')).toBeVisible();
    expect(details.queryByLabelText('Treść komentarza')).toBeNull();
    expect(backend.writes()).toHaveLength(0);
  });

  it('saves an edit with Ctrl+Enter', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    backend.state.comments['t-1'] = [OWN];
    const details = await openDetails(user);

    await user.type(
      await startEditing(user, details),
      ' dziś{Control>}{Enter}{/Control}',
    );

    expect(await details.findByText('Zadzwonić do klienta dziś')).toBeVisible();
    expect(await details.findByText('(edytowano)')).toBeVisible();
  });
});

describe('task comment editor', () => {
  it('does not offer saving an unchanged or emptied edit', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    backend.state.comments['t-1'] = [OWN];
    const details = await openDetails(user);

    const input = await startEditing(user, details);
    const save = details.getByRole('button', { name: 'Zapisz' });
    expect(save).toBeDisabled();

    await user.clear(input);
    expect(save).toBeDisabled();
  });

  it('cancels an edit with the cancel button', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    backend.state.comments['t-1'] = [OWN];
    const details = await openDetails(user);

    await user.type(await startEditing(user, details), ' zmiana');
    await user.click(details.getByRole('button', { name: 'Anuluj' }));

    expect(await details.findByText('Zadzwonić do klienta')).toBeVisible();
    expect(backend.writes()).toHaveLength(0);
  });

  it('trims the text before sending', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    const details = await openDetails(user);

    await user.type(await startComposing(user, details), '  przycięte  ');
    await user.click(details.getByRole('button', { name: 'Dodaj' }));

    await details.findByText('przycięte');
    expect(backend.writes()[0]?.body).toEqual({ body: 'przycięte' });
  });

  it('counts characters up to the 2000 limit', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    const details = await openDetails(user);

    const input = await startComposing(user, details);
    expect(details.getByText(/^0\/2000/)).toBeVisible();
    await user.type(input, 'abc');

    expect(details.getByText(/^3\/2000/)).toBeVisible();
    expect(input).toHaveAttribute('maxlength', '2000');
  });

  it('shows the comment as saving until the server answers', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    const details = await openDetails(user);
    backend.state.commentDelayMs = 300;

    await user.type(await startComposing(user, details), 'Powoli');
    await user.click(details.getByRole('button', { name: 'Dodaj' }));

    expect(await details.findByText('Zapisywanie…')).toBeVisible();
    expect(details.getByText('Powoli')).toBeVisible();
    expect(
      details.queryByRole('button', { name: /^Edytuj komentarz/ }),
    ).toBeNull();
    await waitFor(() => expect(details.queryByText('Zapisywanie…')).toBeNull());
    expect(
      details.getByRole('button', { name: /^Edytuj komentarz/ }),
    ).toBeVisible();
  });
});

describe('task comment failures', () => {
  it('tells that a task takes at most 200 comments', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    const details = await openDetails(user);
    backend.state.failCommentWrites = true;
    backend.state.commentFailure = {
      code: 409,
      type: 'conflict',
      message: 'A task takes at most 200 comments',
    };

    await user.type(await startComposing(user, details), 'Dwusetny pierwszy');
    await user.click(details.getByRole('button', { name: 'Dodaj' }));

    expect(await screen.findByText('COMMENT_CREATE')).toBeVisible();
    expect(screen.getByText(/at most 200 comments/)).toBeVisible();
    await waitFor(() =>
      expect(details.queryByText('Dwusetny pierwszy')).toBeNull(),
    );
  });

  it('adds the comment after a retry from the error toast', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    const details = await openDetails(user);
    backend.state.failCommentWrites = true;

    await user.type(await startComposing(user, details), 'Za drugim razem');
    await user.click(details.getByRole('button', { name: 'Dodaj' }));
    await screen.findByText('COMMENT_CREATE');
    backend.state.failCommentWrites = false;
    // Radix marks the body pointer-events none while a modal is open; the toast
    // lifts it only through CSS, which jsdom does not load: use the keyboard.
    screen.getByRole('button', { name: /ponownie/i }).focus();
    await user.keyboard('{Enter}');

    expect(await details.findByText('Za drugim razem')).toBeVisible();
    expect(await screen.findByText('Dodano komentarz')).toBeVisible();
  });

  it('restores the old text and explains when saving an edit fails', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    backend.state.comments['t-1'] = [OWN];
    const details = await openDetails(user);
    backend.state.failCommentWrites = true;

    await user.type(await startEditing(user, details), ' zmiana');
    await user.click(details.getByRole('button', { name: 'Zapisz' }));

    expect(await screen.findByText('COMMENT_UPDATE')).toBeVisible();
    expect(await details.findByText('Zadzwonić do klienta')).toBeVisible();
    expect(details.queryByText('(edytowano)')).toBeNull();
  });
});

describe('task comment avatars', () => {
  it('shows the owner picture on an own comment', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    backend.state.owner = { name: 'Anna Kowalska', avatarUrl: PICTURE };
    backend.state.comments['t-1'] = [OWN];

    const details = await openDetails(user);
    const avatar = await details.findByRole('img', {
      name: 'Autor: Anna Kowalska',
    });

    expect(avatar.querySelector('img')).toHaveAttribute('src', PICTURE);
  });

  it('falls back to an icon when the owner has no picture', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    backend.state.comments['t-1'] = [OWN];

    const details = await openDetails(user);
    const avatar = await details.findByRole('img', {
      name: 'Autor: Anna Kowalska',
    });

    expect(avatar.querySelector('img')).toBeNull();
    expect(avatar.querySelector('svg')).not.toBeNull();
  });

  it('shows the bot icon instead of the owner picture on a bot comment', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    backend.state.owner = { name: 'Anna Kowalska', avatarUrl: PICTURE };
    backend.state.comments['t-1'] = [BOT];

    const details = await openDetails(user);
    const avatar = await details.findByRole('img', {
      name: 'Autor: bot Claude Desktop',
    });

    expect(avatar.querySelector('img')).toBeNull();
    expect(avatar.querySelector('svg')).not.toBeNull();
  });

  it('shows the owner picture and the bot icon after an owner edit', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    backend.state.owner = { name: 'Anna Kowalska', avatarUrl: PICTURE };
    backend.state.comments['t-1'] = [
      { ...BOT, editedAt: '2026-10-31T12:00:00.000Z' },
    ];

    const details = await openDetails(user);
    const avatar = await details.findByRole('img', {
      name: /^Autorzy: Anna Kowalska i bot/,
    });

    expect(avatar.querySelector('img')).toHaveAttribute('src', PICTURE);
    expect(avatar.querySelector('svg')).not.toBeNull();
  });

  it('shows a comment of a deleted token under the name it was written with', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    backend.state.comments['t-1'] = [
      { ...BOT, bot: { name: 'Usunięty bot', ref: '0b9a4a52' } },
    ];

    const details = await openDetails(user);

    expect(await details.findByText('Usunięty bot')).toBeVisible();
    expect(details.getByText('Bot MCP · #0b9a4a52')).toBeVisible();
  });
});

describe('task comment deep links', () => {
  it('restores the delete confirmation of an existing comment', async () => {
    backend.seed([task()]);
    backend.state.comments['t-1'] = [OWN];

    renderTime(
      'day',
      '2026-10-20',
      '&modal=task-view:t-1&modal=comment-delete:c-1',
    );

    expect(
      await screen.findByRole('dialog', { name: 'Usunąć komentarz?' }),
    ).toBeVisible();
  });

  it('drops a delete link to a comment that is gone', async () => {
    backend.seed([task()]);

    renderTime(
      'day',
      '2026-10-20',
      '&modal=task-view:t-1&modal=comment-delete:ghost',
    );

    await waitFor(() =>
      expect(window.location.search).not.toContain('comment-delete'),
    );
    expect(
      screen.queryByRole('dialog', { name: 'Usunąć komentarz?' }),
    ).toBeNull();
  });
});
