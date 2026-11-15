import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderTime } from './render-time';
import { setupTimeBackend, task } from './time-backend';

const backend = setupTimeBackend();

afterEach(() => vi.useRealTimers());

const seedTasks = () =>
  backend.seed([
    task({ id: 't-1', title: 'Zrobione', at: '09:00', done: true }),
    task({ id: 't-2', title: 'Otwarte', at: '10:00', priorityId: 'low' }),
    task({
      id: 't-3',
      title: 'Alfa domowe',
      at: null,
      categoryId: 'home',
      priorityId: 'high',
    }),
  ]);

const detailsOf = (title: string) => ({
  name: `Szczegóły zadania: ${title}`,
  hidden: true,
});

const openPanel = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(await screen.findByRole('button', { name: /^Filtry/ }));
  return within(
    await screen.findByRole('dialog', { name: 'Filtry i sortowanie' }),
  );
};

const params = () => new URLSearchParams(window.location.search);

describe('task filters', () => {
  it('opens the panel from the header and keeps it in the URL', async () => {
    const user = userEvent.setup();
    seedTasks();
    renderTime();

    await openPanel(user);

    expect(params().getAll('modal')).toEqual(['filters']);
  });

  it('hides done tasks once the status "Niezrobione" is picked', async () => {
    const user = userEvent.setup();
    seedTasks();
    renderTime();
    const panel = await openPanel(user);

    await user.click(panel.getByRole('button', { name: 'Niezrobione' }));

    expect(
      screen.queryByRole('button', detailsOf('Zrobione')),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', detailsOf('Otwarte'))).toBeVisible();
    expect(params().get('status')).toBe('open');
    expect(
      screen.getByRole('button', { name: 'Filtry, aktywne: 1', hidden: true }),
    ).toBeInTheDocument();
  });

  it('narrows the lists by category and by phrase', async () => {
    const user = userEvent.setup();
    seedTasks();
    renderTime();
    const panel = await openPanel(user);

    await user.click(panel.getByRole('button', { name: 'Dom' }));
    expect(screen.getByRole('button', detailsOf('Alfa domowe'))).toBeVisible();
    expect(
      screen.queryByRole('button', detailsOf('Otwarte')),
    ).not.toBeInTheDocument();

    await user.type(panel.getByLabelText('Szukaj w zadaniach'), 'xyz');
    expect(
      await screen.findByRole('heading', {
        name: /Brak wyników/,
        hidden: true,
      }),
    ).toBeVisible();
  });

  it('names the filters in the empty state and offers to clear them', async () => {
    const user = userEvent.setup();
    seedTasks();
    renderTime();
    const panel = await openPanel(user);
    await user.click(panel.getByRole('button', { name: 'Zdrowie' }));
    await user.click(panel.getByRole('button', { name: /^Pokaż zadania/ }));

    expect(
      await screen.findByRole('heading', { name: 'Brak wyników: Zdrowie' }),
    ).toBeVisible();
    expect(screen.getByRole('button', { name: 'Dodaj zadanie' })).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Wyczyść filtry' }));

    expect(
      await screen.findByRole('button', detailsOf('Otwarte')),
    ).toBeVisible();
    expect(params().get('cat')).toBeNull();
  });

  it('sorts by name instead of time', async () => {
    const user = userEvent.setup();
    backend.seed([
      task({ id: 't-1', title: 'Bravo', at: '08:00' }),
      task({ id: 't-2', title: 'Alfa', at: '09:00' }),
    ]);
    renderTime();
    const listed = () =>
      screen
        .getAllByRole('button', { name: /^Szczegóły zadania/, hidden: true })
        .map((button) => button.getAttribute('aria-label'));
    const panel = await openPanel(user);
    expect(listed()).toEqual([
      'Szczegóły zadania: Bravo',
      'Szczegóły zadania: Alfa',
    ]);

    await user.click(panel.getByRole('radio', { name: 'Nazwa' }));

    expect(listed()).toEqual([
      'Szczegóły zadania: Alfa',
      'Szczegóły zadania: Bravo',
    ]);
  });

  it('restores filters from the link', async () => {
    seedTasks();
    renderTime('day', '2026-10-20', '&status=done');

    expect(
      await screen.findByRole('button', detailsOf('Zrobione')),
    ).toBeVisible();
    expect(
      screen.queryByRole('button', detailsOf('Otwarte')),
    ).not.toBeInTheDocument();
  });

  it('clears all filters with one button', async () => {
    const user = userEvent.setup();
    seedTasks();
    renderTime('day', '2026-10-20', '&status=done&sort=title');
    const panel = await openPanel(user);

    await user.click(panel.getByRole('button', { name: 'Wyczyść' }));

    expect(
      await screen.findByRole('button', detailsOf('Otwarte')),
    ).toBeVisible();
    expect(params().get('status')).toBeNull();
    expect(params().get('sort')).toBeNull();
  });

  it('marks category chips with their icon in the category color', async () => {
    const user = userEvent.setup();
    seedTasks();
    renderTime();
    const panel = await openPanel(user);

    const chip = panel.getByRole('button', { name: 'Dom' });

    expect(chip.querySelector('svg')).toBeInTheDocument();
    expect(chip.querySelector<HTMLElement>('[style]')).toHaveStyle({
      color: '#c2410c',
    });
  });

  it('marks priority chips with the pips of their level', async () => {
    const user = userEvent.setup();
    seedTasks();
    renderTime();
    const panel = await openPanel(user);

    const chip = panel.getByRole('button', { name: 'Wysoki' });

    expect(chip.querySelector('[data-level="high"]')).toBeInTheDocument();
  });
});
