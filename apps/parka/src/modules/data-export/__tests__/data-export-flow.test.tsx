import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Main } from '../presentation/main';

const EXPENSE = {
  id: 'e-1',
  merchant: 'Shop',
  date: '2025-04-02T10:00:00Z',
  amount: 10,
  categoryId: 'c-1',
  paymentMethod: 'card',
  isBill: false,
  source: 'manual',
  items: [],
};

const stubApi = (ok: boolean) =>
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => ({
      json: async () =>
        !ok
          ? { code: 500, message: 'boom' }
          : url.includes('categories')
            ? { code: 200, data: [] }
            : { code: 200, data: [EXPENSE] },
    })),
  );

describe('data export page', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('enables export once data loaded and confirms the download', async () => {
    stubApi(true);
    URL.createObjectURL = vi.fn(() => 'blob:x');
    URL.revokeObjectURL = vi.fn();
    render(<Main />);
    const run = screen.getByRole('button', { name: 'Eksportuj' });

    await waitFor(() =>
      expect((run as HTMLButtonElement).disabled).toBe(false),
    );
    await userEvent.click(run);

    expect(await screen.findByText(/Plik został pobrany/)).toBeTruthy();
  });

  it('shows a retryable error when data cannot be loaded', async () => {
    stubApi(false);
    render(<Main />);

    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(screen.getByText('DATA_EXPORT_LOAD')).toBeTruthy();
    expect(
      (screen.getByRole('button', { name: 'Eksportuj' }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
  });
});
