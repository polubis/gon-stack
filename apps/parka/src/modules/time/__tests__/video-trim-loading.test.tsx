import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderTime } from './render-time';
import { setupTimeBackend, task } from './time-backend';

const gate = vi.hoisted(() => ({ release: (_seconds: number) => {} }));

vi.mock('../integration/trim-video', async (original) => ({
  ...(await original<typeof import('../integration/trim-video')>()),
  previewUrl: () => 'blob:clip',
  readDuration: () =>
    new Promise<number>((resolve) => {
      gate.release = resolve;
    }),
}));

const backend = setupTimeBackend();

describe('video trim dialog loading', () => {
  it('shows a status placeholder, then the range sliders once the video is read', async () => {
    const user = userEvent.setup({ applyAccept: false });
    backend.seed([task()]);
    renderTime();
    await user.click(
      await screen.findByRole('button', {
        name: 'Szczegóły zadania: Raport miesięczny',
      }),
    );
    const details = within(await screen.findByRole('dialog'));
    await details.findByText('Brak załączników');

    await user.upload(
      details.getByLabelText('Wybierz pliki'),
      new File(['frames'], 'demo.mp4', { type: 'video/mp4' }),
    );
    const trim = within(
      await screen.findByRole('dialog', { name: 'Przytnij wideo' }),
    );

    expect(trim.getByRole('status')).toHaveTextContent('Wczytywanie wideo…');
    expect(trim.queryByRole('slider')).toBeNull();

    gate.release(12);

    expect(await trim.findAllByRole('slider')).toHaveLength(2);
    expect(trim.queryByRole('status')).toBeNull();
  });
});
