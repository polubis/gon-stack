import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

const { navigateTo } = vi.hoisted(() => ({ navigateTo: vi.fn() }));

vi.mock('@/shared/router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/router')>()),
  navigateTo,
}));

const { Main } = await import('../presentation/main');

const CATEGORY = { id: 'c-1', name: 'Food', icon: 'cart', color: '#123456' };

const stubApi = (expenseResponse: object) => {
  const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
    const body =
      init?.method === 'POST'
        ? url.includes('expenses')
          ? expenseResponse
          : { code: 201, data: {} }
        : { code: 200, data: [CATEGORY] };
    return { json: async () => body };
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

const posts = (fetchMock: ReturnType<typeof stubApi>) =>
  fetchMock.mock.calls.filter(([, init]) => init?.method === 'POST');

const fillManualReceipt = async () => {
  const user = userEvent.setup();
  render(<Main />);
  await user.click(await screen.findByRole('button', { name: /ręcznie/ }));
  await user.type(screen.getByRole('textbox', { name: 'Sklep' }), 'Biedronka');
  return user;
};

describe('receipt entry', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    navigateTo.mockClear();
  });

  it('saves the expense and its notification, then opens expenses', async () => {
    const fetchMock = stubApi({ code: 201, data: {} });
    const user = await fillManualReceipt();

    await user.click(screen.getByRole('button', { name: /Zapisz/ }));

    await waitFor(() => expect(navigateTo).toHaveBeenCalledWith('/app/'));
    expect(posts(fetchMock)).toHaveLength(2);
  });

  it('stays on the form and reports an error when saving fails', async () => {
    stubApi({ code: 500, type: 'internal-server', message: 'boom' });
    const user = await fillManualReceipt();

    await user.click(screen.getByRole('button', { name: /Zapisz/ }));

    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(navigateTo).not.toHaveBeenCalled();
    expect(screen.getByRole('textbox', { name: 'Sklep' })).toBeTruthy();
  });

  it('shows the load error with retry when categories fail to load', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        json: async () => ({
          code: 500,
          type: 'internal-server',
          message: 'x',
        }),
      })),
    );

    render(<Main />);

    expect(await screen.findByText('RECEIPT_LOAD')).toBeTruthy();
  });
});
