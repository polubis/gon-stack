import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderTime } from './render-time';
import { backlogTask, setupTimeBackend, task } from './time-backend';

const backend = setupTimeBackend();

afterEach(() => vi.useRealTimers());

const pickDuplicate = async (
  user: ReturnType<typeof userEvent.setup>,
  title: string,
) => {
  const [more] = await screen.findAllByRole('button', {
    name: `Więcej: ${title}`,
  });
  await user.click(more!);
  await user.click(
    await screen.findByRole('menuitem', { name: `Duplikuj: ${title}` }),
  );
};

describe('task duplication', () => {
  it('opens a new task form filled from the task', async () => {
    const user = userEvent.setup();
    backend.seed([task({ description: 'Opis raportu' })]);
    renderTime();

    await pickDuplicate(user, 'Raport miesięczny');

    const form = within(await screen.findByRole('dialog'));
    expect(form.getByRole('heading', { name: 'Nowe zadanie' })).toBeVisible();
    expect(form.getByRole('textbox', { name: /Nazwa/ })).toHaveValue(
      'Raport miesięczny',
    );
  });

  it('saves the copy next to the original', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    renderTime();
    await pickDuplicate(user, 'Raport miesięczny');

    const form = within(await screen.findByRole('dialog'));
    await user.click(form.getByRole('button', { name: 'Dodaj' }));

    await waitFor(() => expect(backend.writes()).toHaveLength(1));
    expect(backend.writes()[0]!.body).toMatchObject({
      title: 'Raport miesięczny',
      categoryId: 'work',
      priorityId: 'high',
      day: '2026-10-20',
      at: '09:00',
    });
    expect(backend.writes()[0]!.body).not.toMatchObject({ id: 't-1' });
    expect(await screen.findAllByText('Raport miesięczny')).toHaveLength(2);
  });

  it('copies a backlog task into the backlog', async () => {
    const user = userEvent.setup();
    backend.seedBacklog([backlogTask()]);
    renderTime();
    await user.click(await screen.findByRole('button', { name: /^Backlog/ }));
    await pickDuplicate(user, 'Umówić dentystę');

    const form = within(
      await screen.findByRole('dialog', { name: 'Do backlogu' }),
    );
    expect(form.getByRole('textbox', { name: /Nazwa/ })).toHaveValue(
      'Umówić dentystę',
    );
    await user.click(form.getByRole('button', { name: 'Dodaj' }));

    await waitFor(() => expect(backend.writes()).toHaveLength(1));
    expect(backend.writes()[0]!.body).toMatchObject({
      title: 'Umówić dentystę',
      categoryId: 'health',
    });
    expect(backend.writes()[0]!.body).not.toHaveProperty('day');
  });
});
