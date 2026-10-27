import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderTime } from './render-time';
import { backlogTask, setupTimeBackend, task } from './time-backend';

const backend = setupTimeBackend();

afterEach(() => vi.useRealTimers());

describe('task key', () => {
  it('shows the key of a task in the list', async () => {
    backend.state.tasks = [task({ key: 'QXT-7' })];
    renderTime();

    expect(
      await screen.findByLabelText('Identyfikator zadania: QXT-7'),
    ).toBeVisible();
  });

  it('shows the key in the task details', async () => {
    const user = userEvent.setup();
    backend.state.tasks = [task({ key: 'QXT-7' })];
    renderTime();

    await user.click(
      await screen.findByRole('button', {
        name: 'Szczegóły zadania: Raport miesięczny',
      }),
    );

    const details = within(
      await screen.findByRole('dialog', { name: 'Szczegóły zadania' }),
    );
    expect(
      details.getByLabelText('Identyfikator zadania: QXT-7'),
    ).toBeVisible();
  });

  it('shows the key of a backlog task in the backlog', async () => {
    const user = userEvent.setup();
    backend.state.backlog = [backlogTask({ key: 'QXT-3' })];
    renderTime();

    await user.click(await screen.findByRole('button', { name: /^Backlog/ }));

    const backlog = within(
      await screen.findByRole('dialog', { name: 'Backlog' }),
    );
    expect(
      backlog.getByLabelText('Identyfikator zadania: QXT-3'),
    ).toBeVisible();
  });

  it('keeps the place of the key while a new task waits for the server', async () => {
    const user = userEvent.setup();
    backend.state.createDelayMs = 300;
    renderTime();
    await screen.findByRole('heading', { name: 'Brak zadań' });

    await user.click(screen.getAllByRole('button', { name: /^Dodaj$/ })[0]!);
    await user.click(await screen.findByRole('menuitem', { name: 'Zadanie' }));
    const form = within(await screen.findByRole('dialog'));
    await user.type(form.getByLabelText('Nazwa'), 'Raport');
    await user.click(form.getByRole('button', { name: 'Dodaj' }));

    const row = (await screen.findByText('Raport')).closest('li')!;
    expect(within(row).queryByLabelText(/^Identyfikator zadania/)).toBeNull();
    expect(
      row.querySelector('[aria-hidden="true"].animate-pulse'),
    ).not.toBeNull();
    expect(
      await within(row).findByLabelText('Identyfikator zadania: TST-1'),
    ).toBeVisible();
    expect(row.querySelector('.animate-pulse')).toBeNull();
  });

  it('shows the key the server gave to a new task', async () => {
    const user = userEvent.setup();
    renderTime();
    await screen.findByRole('heading', { name: 'Brak zadań' });

    await user.click(screen.getAllByRole('button', { name: /^Dodaj$/ })[0]!);
    await user.click(await screen.findByRole('menuitem', { name: 'Zadanie' }));
    const form = within(await screen.findByRole('dialog'));
    await user.type(form.getByLabelText('Nazwa'), 'Raport');
    await user.click(form.getByRole('button', { name: 'Dodaj' }));

    expect(
      await screen.findByLabelText('Identyfikator zadania: TST-1'),
    ).toBeVisible();
  });
});
