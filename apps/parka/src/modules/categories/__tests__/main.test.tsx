import { useEffect } from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { Provider, useContext } from '../presentation/context';
import { Main } from '../presentation/main';

const GROCERIES = {
  id: 'groceries',
  name: 'category.groceries',
  icon: 'cart',
  color: '#0f7a4f',
};

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const Loader = () => {
  const { load } = useContext();
  useEffect(() => load(), [load]);
  return null;
};

const setup = (stored: object[]) => {
  const created: { name: string }[] = [];
  server.use(
    http.get('/api/categories/', () =>
      HttpResponse.json({ code: 200, data: stored }),
    ),
    http.post('/api/categories/', async ({ request }) => {
      const body = (await request.json()) as { name: string };
      created.push(body);
      return HttpResponse.json({ code: 201, data: body });
    }),
  );
  render(
    <Provider>
      <Loader />
      <Main />
    </Provider>,
  );
  return created;
};

describe('categories screen', () => {
  it('suggests only the defaults that are still missing', async () => {
    const created = setup([GROCERIES]);
    await screen.findByRole('link', { name: /Edytuj kategorię/ });

    await userEvent.click(screen.getByRole('button', { name: 'Dodaj' }));

    await waitFor(() => expect(created).toHaveLength(5));
    expect(created.map((c) => c.name)).not.toContain('category.groceries');
  });

  it('invites to add a category when there are none', async () => {
    setup([]);

    expect(
      await screen.findByText('Nie masz jeszcze kategorii'),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole('status')).getByRole('link', { name: 'Dodaj' }),
    ).toBeInTheDocument();
  });

  it('adds every suggested category with one click', async () => {
    const created = setup([]);
    await screen.findByText('Nie masz jeszcze kategorii');

    await userEvent.click(screen.getByRole('button', { name: 'Dodaj' }));

    await waitFor(() => expect(created).toHaveLength(6));
  });

  it('hides suggestions once every default exists', async () => {
    setup(
      ['groceries', 'transport', 'bills', 'fun', 'health', 'other'].map(
        (slug) => ({
          ...GROCERIES,
          id: slug,
          name: `category.${slug}`,
        }),
      ),
    );

    await screen.findAllByRole('link', { name: /Edytuj kategorię/ });

    expect(
      screen.queryByRole('heading', { name: 'Sugerowane kategorie' }),
    ).toBeNull();
  });
});
