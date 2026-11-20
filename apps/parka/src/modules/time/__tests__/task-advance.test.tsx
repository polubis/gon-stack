import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderTime } from './render-time';
import { setupTimeBackend, task } from './time-backend';

const backend = setupTimeBackend();

const next = () =>
  screen.findByRole('button', { name: 'Następny krok: Raport miesięczny' });

describe('task row controls', () => {
  it('has no status tile on the left of the row', async () => {
    backend.seed([task()]);
    renderTime();
    const item = within((await next()).closest('li')!);

    expect(item.queryByRole('checkbox')).toBeNull();
    expect(item.getAllByRole('button').map((b) => b.ariaLabel)).toEqual([
      'Szczegóły zadania: Raport miesięczny',
      'Następny krok: Raport miesięczny',
      'Więcej: Raport miesięczny',
    ]);
  });

  it('moves the task to the next step from the keyboard', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    renderTime();
    const button = await next();
    button.focus();

    await user.keyboard('{Enter}');

    expect(within(button.closest('li')!).getByText('2/3')).toBeVisible();
    await waitFor(() => expect(backend.writes()).toHaveLength(1));
    expect(backend.writes()[0]!.body).toMatchObject({
      inProgress: true,
      done: false,
    });
  });

  it('offers to reopen a done task and starts over', async () => {
    const user = userEvent.setup();
    backend.seed([task({ done: true })]);
    renderTime();
    const button = await screen.findByRole('button', {
      name: 'Otwórz ponownie: Raport miesięczny',
    });

    await user.click(button);

    expect(button).toHaveAccessibleName('Następny krok: Raport miesięczny');
    expect(within(button.closest('li')!).getByText('1/3')).toBeVisible();
    await waitFor(() => expect(backend.writes()).toHaveLength(1));
    expect(backend.writes()[0]!.body).toMatchObject({
      inProgress: false,
      done: false,
    });
  });

  it('opens the edit form from the more menu', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    renderTime();
    await user.click(
      await screen.findByRole('button', { name: 'Więcej: Raport miesięczny' }),
    );

    await user.click(
      await screen.findByRole('menuitem', {
        name: 'Edytuj zadanie: Raport miesięczny',
      }),
    );

    expect(
      within(await screen.findByRole('dialog')).getByRole('textbox', {
        name: 'Nazwa',
      }),
    ).toHaveValue('Raport miesięczny');
  });
});
