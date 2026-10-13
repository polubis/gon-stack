import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Main } from '../presentation/main';

const CREATED_AT = new Date().toISOString();

const expense = (merchant: string, amount: number) => ({
  merchant,
  amount,
  date: '2026-10-12T10:00:00.000Z',
  category: 'Spożywcze',
  paymentMethod: 'Karta',
  isBill: false,
});

const updated = (id = 'n-1', read = false) => ({
  id,
  kind: 'expense-updated',
  title: 'Zmieniono wydatek',
  body: 'Lidl',
  createdAt: CREATED_AT,
  read,
  payload: {
    before: expense('Biedronka', 45.2),
    after: expense('Lidl', 50),
  },
});

const created = (id = 'n-2', read = false) => ({
  id,
  kind: 'category-created',
  title: 'Dodano kategorię',
  body: 'Kawa',
  createdAt: CREATED_AT,
  read,
  payload: { category: { name: 'Kawa', icon: 'coffee', color: '#aabbcc' } },
});

type Item = ReturnType<typeof updated> | ReturnType<typeof created>;
type Page = {
  code: 200;
  data: Item[];
  nextCursor: string | null;
  unread: number;
};

const page = (data: Item[], patch: Partial<Page> = {}): Page => ({
  code: 200,
  data,
  nextCursor: null,
  unread: data.filter((n) => !n.read).length,
  ...patch,
});

type Reply = object | (() => object | Promise<object>);

/** Answers lists by cursor (`first` when none) and every PUT with `write`. */
const stubApi = ({
  pages,
  write = { code: 200, ok: true },
}: {
  pages: Record<string, Reply>;
  write?: object;
}) => {
  const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
    if (init?.method === 'PUT') return { json: async () => write };
    const cursor = new URL(url, 'http://x').searchParams.get('cursor');
    const reply = pages[cursor ?? 'first']!;
    return {
      json: async () => (typeof reply === 'function' ? reply() : reply),
    };
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

/** Lets a test play the browser: report the sentinel as scrolled into view. */
const stubObserver = () => {
  const callbacks: IntersectionObserverCallback[] = [];
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: IntersectionObserverCallback) {
        callbacks.push(callback);
      }
      observe() {}
      disconnect() {}
      unobserve() {}
    },
  );
  return () =>
    act(() => {
      callbacks.at(-1)?.(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });
};

const rows = () => screen.getAllByRole('listitem');

describe('notifications screen', () => {
  beforeEach(() => stubObserver());
  afterEach(() => vi.unstubAllGlobals());

  it('lists notifications fetched from the backend', async () => {
    stubApi({ pages: { first: page([updated(), created()]) } });

    render(<Main />);

    expect(await screen.findByText('Zmieniono wydatek')).toBeTruthy();
    expect(screen.getByText('Dodano kategorię')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Powiadomienia' })).toBeTruthy();
  });

  it('shows the old value struck through and the new one highlighted', async () => {
    stubApi({ pages: { first: page([updated()]) } });

    render(<Main />);

    const diff = await screen.findByRole('group', { name: /Zmiany:/ });
    expect(diff.querySelector('del')?.textContent).toContain('Biedronka');
    expect(diff.querySelector('ins')?.textContent).toContain('Lidl');
  });

  it('shows a created category as added values only', async () => {
    stubApi({ pages: { first: page([created()]) } });

    render(<Main />);

    const diff = await screen.findByRole('group', { name: /Zmiany:/ });
    expect(diff.querySelector('del')).toBeNull();
    expect(within(diff).getByText(/Kawa/)).toBeTruthy();
  });

  it('shows card placeholders while loading, not the empty state', async () => {
    const { promise, resolve: release } = Promise.withResolvers<Page>();
    stubApi({
      pages: {
        first: () => promise,
      },
    });

    render(<Main />);

    expect(screen.queryByText('Brak powiadomień')).toBeNull();
    expect(screen.queryByRole('list', { name: 'Powiadomienia' })).toBeNull();
    release(page([updated()]));
    expect(await screen.findByText('Zmieniono wydatek')).toBeTruthy();
  });

  it('explains an empty account with an icon, title and description', async () => {
    stubApi({ pages: { first: page([]) } });

    render(<Main />);

    expect(
      await screen.findByRole('heading', { name: 'Brak powiadomień' }),
    ).toBeTruthy();
    expect(screen.getByText(/pojawi się tu informacja o zmianie/)).toBeTruthy();
    expect(document.querySelector('svg[aria-hidden="true"]')).toBeTruthy();
  });

  it('shows an error with retry when loading fails', async () => {
    stubApi({
      pages: {
        first: { code: 500, type: 'internal-server', message: 'boom' },
      },
    });

    render(<Main />);

    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy());
    expect(screen.getByText('NOTIFICATIONS_LOAD')).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Spróbuj ponownie' }),
    ).toBeTruthy();
  });
});

describe('read state', () => {
  beforeEach(() => stubObserver());
  afterEach(() => vi.unstubAllGlobals());

  it('counts unread from the server total, not from loaded pages', async () => {
    stubApi({
      pages: { first: page([updated(), updated('n-3', true)], { unread: 30 }) },
    });

    render(<Main />);

    expect(await screen.findByText('30 nieprzeczytanych')).toBeTruthy();
  });

  it('keeps a notification visible, marked read, when it is marked as read', async () => {
    stubApi({
      pages: { first: page([updated(), created()], { unread: 12 }) },
    });
    const user = userEvent.setup();
    render(<Main />);
    await screen.findByText('Zmieniono wydatek');

    await user.click(
      screen.getAllByRole('button', { name: 'Oznacz jako przeczytane' })[0]!,
    );

    expect(await screen.findByText('11 nieprzeczytanych')).toBeTruthy();
    expect(rows()).toHaveLength(2);
    expect(screen.getByText('Przeczytane')).toBeTruthy();
    expect(
      screen.getAllByRole('button', { name: 'Oznacz jako przeczytane' }),
    ).toHaveLength(1);
  });

  it('keeps every notification visible when all are marked as read', async () => {
    stubApi({
      pages: { first: page([updated(), created()], { unread: 7 }) },
    });
    const user = userEvent.setup();
    render(<Main />);
    await screen.findByText('Zmieniono wydatek');

    await user.click(
      screen.getByRole('button', { name: 'Oznacz wszystkie jako przeczytane' }),
    );

    expect(await screen.findByText('Wszystko przeczytane')).toBeTruthy();
    expect(rows()).toHaveLength(2);
    expect(screen.getAllByText('Przeczytane')).toHaveLength(2);
    expect(
      screen.getByRole('button', { name: 'Oznacz wszystkie jako przeczytane' }),
    ).toBeDisabled();
  });

  it('brings the unread mark back when saving fails', async () => {
    stubApi({
      pages: { first: page([updated()]) },
      write: { code: 500, type: 'internal-server', message: 'boom' },
    });
    const user = userEvent.setup();
    render(<Main />);

    await user.click(
      await screen.findByRole('button', { name: 'Oznacz jako przeczytane' }),
    );

    expect(await screen.findByText('1 nieprzeczytane')).toBeTruthy();
    expect(screen.getByText('NOTIFICATION_MARK_READ_FAILED')).toBeTruthy();
    expect(rows()).toHaveLength(1);
  });
});

describe('infinite scroll', () => {
  afterEach(() => vi.unstubAllGlobals());

  const twoPages = () => ({
    first: page([updated('n-1'), updated('n-2')], {
      nextCursor: 'c1',
      unread: 4,
    }),
    c1: page([updated('n-3'), updated('n-4')], { unread: 4 }),
  });

  it('loads the next page when the end of the list scrolls into view', async () => {
    stubApi({ pages: twoPages() });
    const scrollToEnd = stubObserver();
    render(<Main />);
    await screen.findAllByText('Zmieniono wydatek');
    expect(rows()).toHaveLength(2);

    scrollToEnd();

    await waitFor(() => expect(rows()).toHaveLength(4));
    expect(screen.getByText('To wszystkie powiadomienia.')).toBeTruthy();
  });

  it('does not duplicate a notification that appears on two pages', async () => {
    stubApi({
      pages: {
        first: page([updated('n-1'), updated('n-2')], { nextCursor: 'c1' }),
        c1: page([updated('n-2'), updated('n-3')]),
      },
    });
    const scrollToEnd = stubObserver();
    render(<Main />);
    await screen.findAllByText('Zmieniono wydatek');

    scrollToEnd();

    await waitFor(() => expect(rows()).toHaveLength(3));
  });

  it('offers a load more button when scrolling cannot be observed', async () => {
    stubApi({ pages: twoPages() });
    vi.stubGlobal('IntersectionObserver', undefined);
    const user = userEvent.setup();
    render(<Main />);

    await user.click(
      await screen.findByRole('button', { name: 'Wczytaj więcej' }),
    );

    await waitFor(() => expect(rows()).toHaveLength(4));
  });

  it('shows card placeholders while the next page loads', async () => {
    const { promise, resolve: release } = Promise.withResolvers<Page>();
    stubApi({
      pages: {
        first: page([updated('n-1')], { nextCursor: 'c1' }),
        c1: () => promise,
      },
    });
    const scrollToEnd = stubObserver();
    render(<Main />);
    await screen.findByText('Zmieniono wydatek');

    scrollToEnd();

    expect(
      await screen.findByText('Wczytuję kolejne powiadomienia'),
    ).toBeTruthy();
    expect(rows()).toHaveLength(1);
    release(page([updated('n-2')]));
    await waitFor(() => expect(rows()).toHaveLength(2));
  });

  it('offers a retry when the next page fails and then continues', async () => {
    let calls = 0;
    stubApi({
      pages: {
        first: page([updated('n-1')], { nextCursor: 'c1' }),
        c1: () =>
          ++calls === 1
            ? { code: 500, type: 'internal-server', message: 'boom' }
            : page([updated('n-2')]),
      },
    });
    const scrollToEnd = stubObserver();
    const user = userEvent.setup();
    render(<Main />);
    await screen.findByText('Zmieniono wydatek');

    scrollToEnd();
    await screen.findByText('NOTIFICATIONS_LOAD_MORE');
    expect(rows()).toHaveLength(1);
    await user.click(screen.getByRole('button', { name: 'Spróbuj ponownie' }));

    await waitFor(() => expect(rows()).toHaveLength(2));
    expect(screen.getByText('To wszystkie powiadomienia.')).toBeTruthy();
  });

  it('marks unloaded pages read as well when all are marked as read', async () => {
    const fetchMock = stubApi({ pages: twoPages() });
    const scrollToEnd = stubObserver();
    const user = userEvent.setup();
    render(<Main />);
    await screen.findAllByText('Zmieniono wydatek');

    await user.click(
      screen.getByRole('button', { name: 'Oznacz wszystkie jako przeczytane' }),
    );
    scrollToEnd();

    await waitFor(() => expect(rows()).toHaveLength(4));
    expect(screen.getAllByText('Przeczytane')).toHaveLength(4);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/notifications/read-all/',
      expect.objectContaining({ method: 'PUT' }),
    );
  });
});
