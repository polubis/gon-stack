import { useEffect } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { CategoriesDialog } from '../presentation/categories-dialog';
import { Provider, useContext } from '../presentation/context';

const FOOD = { id: 'c-1', name: 'Food', icon: 'cart', color: '#0f7a4f' };
const TRAVEL = { id: 'c-2', name: 'Travel', icon: 'plane', color: '#2563eb' };

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const Loader = () => {
  const { load } = useContext();
  useEffect(() => load(), [load]);
  return null;
};

const setup = async (response: () => Response) => {
  server.use(http.get('/api/categories/', response));
  window.history.replaceState(null, '', '/?modal=categories');
  render(
    <Provider>
      <Loader />
      <CategoriesDialog modal="categories" />
    </Provider>,
  );
};

describe('categories list dialog', () => {
  it('lists every category as a link to its editor', async () => {
    await setup(() => HttpResponse.json({ code: 200, data: [FOOD, TRAVEL] }));

    const food = await screen.findByRole('link', {
      name: 'Edytuj kategorię Food',
    });
    expect(food).toHaveAttribute('href', expect.stringContaining('c-1'));
    expect(
      screen.getByRole('link', { name: 'Edytuj kategorię Travel' }),
    ).toBeInTheDocument();
  });

  it('invites to add the first category when there are none', async () => {
    await setup(() => HttpResponse.json({ code: 200, data: [] }));

    expect(
      await screen.findByText('Nie masz jeszcze kategorii'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Dodaj/ })).toBeInTheDocument();
  });

  it('shows a retryable error when loading fails', async () => {
    await setup(() => HttpResponse.json({ code: 500, message: 'boom' }));

    expect(
      await screen.findByText('Nie udało się wczytać kategorii'),
    ).toBeInTheDocument();
    expect(screen.getByText('CATEGORIES_LOAD')).toBeInTheDocument();

    server.use(
      http.get('/api/categories/', () =>
        HttpResponse.json({ code: 200, data: [FOOD] }),
      ),
    );
    await userEvent.click(
      screen.getByRole('button', { name: /ponów|spróbuj/i }),
    );

    await waitFor(() =>
      expect(
        screen.getByRole('link', { name: 'Edytuj kategorię Food' }),
      ).toBeInTheDocument(),
    );
  });

  it('stacks the new category form in the URL when adding', async () => {
    await setup(() => HttpResponse.json({ code: 200, data: [FOOD] }));
    await screen.findByRole('link', { name: 'Edytuj kategorię Food' });

    await userEvent.click(screen.getByRole('button', { name: /Dodaj/ }));

    expect(window.location.search).toContain('modal=categories');
    expect(
      new URLSearchParams(window.location.search).getAll('modal'),
    ).toHaveLength(2);
  });
});
