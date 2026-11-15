import { screen, within } from '@testing-library/react';
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
