import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Toast, type ToastNotice } from '../toast';

const failure = (retry?: () => void): ToastNotice => ({
  tone: 'error',
  title: 'Nie udało się zapisać',
  code: 'THING_SAVE_FAILED',
  description: 'Zmiany nie zostały zapisane.',
  retry,
});

describe('Toast', () => {
  it('shows title, code and description of a failure', () => {
    render(<Toast notice={failure()} onClose={vi.fn()} />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Nie udało się zapisaćTHING_SAVE_FAILEDZmiany nie zostały zapisane.',
    );
  });

  it('closes a failure on request', async () => {
    const onClose = vi.fn();
    render(<Toast notice={failure()} onClose={onClose} />);

    await userEvent.click(screen.getByRole('button', { name: 'Zamknij' }));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('retries and closes a failure', async () => {
    const onClose = vi.fn();
    const retry = vi.fn();
    render(<Toast notice={failure(retry)} onClose={onClose} />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Spróbuj ponownie' }),
    );

    expect(retry).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('keeps a success as a plain message', () => {
    render(
      <Toast
        notice={{ tone: 'success', message: 'Zapisano zmiany.' }}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByRole('status')).toHaveTextContent('Zapisano zmiany.');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
