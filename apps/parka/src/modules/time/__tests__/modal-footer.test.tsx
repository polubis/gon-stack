import { render, screen, within } from '@testing-library/react';
import { DeleteDialog } from '../presentation/delete-dialog';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderTime, TODAY } from './render-time';
import { setupTimeBackend } from './time-backend';

setupTimeBackend();

afterEach(() => vi.useRealTimers());

describe('modal footer', () => {
  it('ends the scrolled modal, so nothing shows below the actions', async () => {
    renderTime('day', TODAY, '&modal=backlog-new');

    const dialog = await screen.findByRole('dialog');
    const form = dialog.lastElementChild!;
    const footer = form.lastElementChild!;

    expect(
      within(footer as HTMLElement).getByRole('button', { name: 'Dodaj' }),
    ).toBeVisible();
    expect(footer.nextElementSibling).toBeNull();
  });
});

describe('confirm dialog footer', () => {
  it('ends the confirm dialog, so nothing shows below the actions', async () => {
    render(
      <DeleteDialog
        modal="task-delete:t1"
        task={{ title: 'Dentysta' }}
        onConfirm={() => {}}
      />,
    );

    const dialog = await screen.findByRole('dialog');
    const footer = dialog.lastElementChild as HTMLElement;

    expect(within(footer).getByRole('button', { name: 'Usuń' })).toBeVisible();
    expect(
      within(footer).getByRole('button', { name: 'Anuluj' }),
    ).toBeVisible();
    expect(footer.nextElementSibling).toBeNull();
  });
});
