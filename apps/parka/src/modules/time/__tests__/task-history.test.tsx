import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderTime } from './render-time';
import { setupTimeBackend, task } from './time-backend';

const backend = setupTimeBackend();

const entry = (id: string, patch: Record<string, unknown>) => ({
  id,
  kind: 'updated',
  field: null,
  from: null,
  to: null,
  at: '2026-11-10T10:00:00.000Z',
  bot: null,
  ...patch,
});

const openDetails = async (user: ReturnType<typeof userEvent.setup>) => {
  renderTime();
  await user.click(
    await screen.findByRole('button', {
      name: 'Szczegóły zadania: Raport miesięczny',
    }),
  );
  return within(await screen.findByRole('dialog'));
};

const openHistory = async (user: ReturnType<typeof userEvent.setup>) => {
  const details = await openDetails(user);
  await user.click(details.getByRole('button', { name: /Historia zmian/ }));
  return details;
};

describe('task history', () => {
  it('stays closed and loads nothing until asked', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);

    const details = await openDetails(user);

    expect(
      details.getByRole('button', { name: /Historia zmian/ }),
    ).toHaveAttribute('aria-expanded', 'false');
    expect(backend.calls.some((c) => c.url.includes('/history/'))).toBe(false);
  });

  it('lists what happened, newest first, with its time', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    backend.state.history['t-1'] = [
      entry('h-2', { field: 'title', from: 'Stary', to: 'Raport miesięczny' }),
      entry('h-1', {
        kind: 'created',
        to: 'Stary',
        at: '2026-11-09T08:00:00.000Z',
      }),
    ];

    const details = await openHistory(user);

    const items = await details.findAllByRole('listitem');
    expect(items[0]).toHaveTextContent(
      'Zmieniono tytuł: „Stary” → „Raport miesięczny”',
    );
    expect(items[1]).toHaveTextContent('Utworzono zadanie „Stary”');
    expect(items[1]).toHaveTextContent(/9 lis 2026/);
  });

  it('signs a change made by a bot with its name and short id', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    backend.state.history['t-1'] = [
      entry('h-1', {
        kind: 'comment_added',
        to: 'Raport gotowy',
        bot: { name: 'Claude Desktop', ref: '0b9a4a52' },
      }),
    ];

    const details = await openHistory(user);

    expect(
      await details.findByText('Claude Desktop · #0b9a4a52'),
    ).toBeVisible();
    expect(
      details.getByText('Dodano komentarz: „Raport gotowy”'),
    ).toBeVisible();
  });

  it('offers no way to change an entry', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    backend.state.history['t-1'] = [entry('h-1', { kind: 'created', to: 'X' })];

    const details = await openHistory(user);
    await details.findByRole('listitem');

    const section = details.getByRole('region', { name: 'Historia zmian' });
    expect(within(section).queryByRole('textbox')).not.toBeInTheDocument();
    expect(
      within(section).queryByRole('button', { name: /Edytuj|Usuń/ }),
    ).not.toBeInTheDocument();
  });

  it('says there is no history yet', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);

    const details = await openHistory(user);

    expect(await details.findByText('Brak historii')).toBeVisible();
  });

  const openFailedHistory = async (
    user: ReturnType<typeof userEvent.setup>,
  ) => {
    backend.seed([task()]);
    backend.state.history['t-1'] = [entry('h-1', { kind: 'created', to: 'X' })];
    backend.state.failHistoryReads = true;
    return openHistory(user);
  };

  it('shows an error when the history cannot be loaded', async () => {
    const user = userEvent.setup();

    const details = await openFailedHistory(user);

    expect(await details.findByRole('alert')).toHaveTextContent('HISTORY_LOAD');
  });

  it('loads the history after the retry', async () => {
    const user = userEvent.setup();
    const details = await openFailedHistory(user);
    await details.findByRole('alert');
    backend.state.failHistoryReads = false;

    await user.click(details.getByRole('button', { name: 'Spróbuj ponownie' }));

    expect(await details.findByText('Utworzono zadanie „X”')).toBeVisible();
  });

  it('refreshes the list when it is reopened', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    backend.state.history['t-1'] = [entry('h-1', { kind: 'created', to: 'X' })];
    const details = await openHistory(user);
    await details.findByText('Utworzono zadanie „X”');
    const toggle = details.getByRole('button', { name: /Historia zmian/ });

    await user.click(toggle);
    backend.state.history['t-1'] = [
      entry('h-2', { kind: 'attachment_added', to: 'plan.pdf' }),
      ...backend.state.history['t-1'],
    ];
    await user.click(toggle);

    expect(
      await details.findByText('Dodano załącznik „plan.pdf”'),
    ).toBeVisible();
  });
});
