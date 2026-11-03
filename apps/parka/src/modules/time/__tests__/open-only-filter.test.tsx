import { fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { renderTime } from './render-time';
import { task, setupTimeBackend } from './time-backend';

const backend = setupTimeBackend();

afterEach(() => window.localStorage.clear());

const toggle = () => screen.findByRole('switch', { name: 'Tylko niezrobione' });

describe('open-only filter', () => {
  it('hides done tasks once only open tasks are wanted', async () => {
    backend.seed([
      task({ id: 't-1', title: 'Zrobione', at: '09:00', done: true }),
      task({ id: 't-2', title: 'Otwarte', at: '10:00' }),
    ]);
    renderTime();

    expect(await toggle()).toHaveAttribute('aria-checked', 'false');
    expect(
      screen.getByRole('button', { name: 'Szczegóły zadania: Zrobione' }),
    ).toBeVisible();

    fireEvent.click(await toggle());

    expect(await toggle()).toHaveAttribute('aria-checked', 'true');
    expect(
      screen.queryByRole('button', { name: 'Szczegóły zadania: Zrobione' }),
    ).toBeNull();
    expect(
      screen.getByRole('button', { name: 'Szczegóły zadania: Otwarte' }),
    ).toBeVisible();
  });

  it('names the filter in the empty state when all tasks are done', async () => {
    backend.seed([task({ id: 't-1', title: 'Gotowe', done: true })]);
    renderTime();

    fireEvent.click(await toggle());

    expect(await screen.findByText('Brak niezrobionych zadań')).toBeVisible();
  });

  it('remembers the filter on the next visit', async () => {
    window.localStorage.setItem('parka:time-open-only', '1');
    backend.seed([task({ id: 't-1', title: 'Gotowe', done: true })]);
    renderTime();

    expect(await toggle()).toHaveAttribute('aria-checked', 'true');
    expect(await screen.findByText('Brak niezrobionych zadań')).toBeVisible();
  });
});
