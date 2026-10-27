import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderTime } from './render-time';
import { setupTimeBackend, task } from './time-backend';

const backend = setupTimeBackend();

beforeEach(() =>
  vi.stubGlobal(
    'matchMedia',
    (query: string) =>
      ({
        matches: true,
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      }) as unknown as MediaQueryList,
  ),
);

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

const menuOf = (name: string) => screen.queryByRole('menu', { name });

describe('time menus on a phone', () => {
  it('closes the task menu on the system Back button', async () => {
    backend.state.tasks = [task()];
    renderTime();
    await userEvent.click(
      await screen.findByRole('button', { name: 'Więcej: Raport miesięczny' }),
    );
    expect(menuOf('Więcej: Raport miesięczny')).toBeTruthy();

    window.history.back();

    await waitFor(() => expect(menuOf('Więcej: Raport miesięczny')).toBeNull());
  });

  it('closes the add menu on the system Back button', async () => {
    renderTime();
    await userEvent.click(
      (await screen.findAllByRole('button', { name: 'Dodaj' }))[0]!,
    );
    expect(menuOf('Dodaj')).toBeTruthy();

    window.history.back();

    await waitFor(() => expect(menuOf('Dodaj')).toBeNull());
  });

  it('keeps the delete confirmation open after picking Usuń in the task menu', async () => {
    backend.state.tasks = [task()];
    renderTime();
    await userEvent.click(
      await screen.findByRole('button', { name: 'Więcej: Raport miesięczny' }),
    );

    await userEvent.click(
      screen.getByRole('menuitem', { name: 'Usuń: Raport miesięczny' }),
    );

    expect(await screen.findByText('Usunąć zadanie?')).toBeVisible();
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(screen.getByText('Usunąć zadanie?')).toBeVisible();
    expect(menuOf('Więcej: Raport miesięczny')).toBeNull();
  });

  it('closes the opened modal with one Back and lands on the page', async () => {
    backend.state.tasks = [task()];
    renderTime();
    await userEvent.click(
      await screen.findByRole('button', { name: 'Więcej: Raport miesięczny' }),
    );
    await userEvent.click(
      screen.getByRole('menuitem', { name: 'Usuń: Raport miesięczny' }),
    );
    await screen.findByText('Usunąć zadanie?');

    window.history.back();

    await waitFor(() =>
      expect(screen.queryByText('Usunąć zadanie?')).toBeNull(),
    );
    expect(new URL(window.location.href).searchParams.getAll('modal')).toEqual(
      [],
    );
  });

  it('keeps the form open after picking an option in the add menu', async () => {
    renderTime();
    await userEvent.click(
      (await screen.findAllByRole('button', { name: 'Dodaj' }))[0]!,
    );

    await userEvent.click(screen.getByRole('menuitem', { name: 'Kategoria' }));

    expect(await screen.findByRole('dialog')).toBeVisible();
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(screen.getByRole('dialog')).toBeVisible();
    expect(menuOf('Dodaj')).toBeNull();
  });

  it('opens only the pressed one of the two add buttons', async () => {
    renderTime();
    const [header, floating] = await screen.findAllByRole('button', {
      name: 'Dodaj',
    });

    await userEvent.click(floating!);

    expect(screen.getAllByRole('menu', { name: 'Dodaj' })).toHaveLength(1);
    expect(header).toHaveAttribute('aria-expanded', 'false');
    expect(floating).toHaveAttribute('aria-expanded', 'true');

    window.history.back();

    await waitFor(() => expect(menuOf('Dodaj')).toBeNull());
    expect(header).toHaveAttribute('aria-expanded', 'false');
  });
});
