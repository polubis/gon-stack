import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { Main } from '../presentation/main';
import { readHandlers, startBackend } from './dashboard-backend';

const server = startBackend();

const modalsInUrl = () =>
  new URLSearchParams(window.location.search).getAll('modal');

const openMenu = async (user: ReturnType<typeof userEvent.setup>) => {
  render(<Main />);
  await screen.findByRole('heading', { name: 'Kategorie' });
  await user.click(screen.getAllByRole('button', { name: /^Dodaj$/ })[0]!);
};

describe('dashboard add menu', () => {
  it('offers expense, recurring expense, photo, file and category', async () => {
    server.use(...readHandlers());
    const user = userEvent.setup();
    await openMenu(user);

    const menu = await screen.findByRole('menu', { name: 'Dodaj' });

    expect(menu.textContent).toBe(
      'WydatekWydatek cyklicznyZe zdjęciaZ plikuKategoria',
    );
    expect(
      screen.getByRole('menuitem', { name: 'Wydatek cykliczny' }),
    ).toHaveAttribute('href', expect.stringContaining('type=recurring'));
  });

  it('opens the category popup from the menu in the URL', async () => {
    server.use(...readHandlers());
    const user = userEvent.setup();
    await openMenu(user);

    await user.click(
      await screen.findByRole('menuitem', { name: 'Kategoria' }),
    );

    await screen.findByRole('dialog', { name: 'Nowa kategoria' });
    expect(modalsInUrl()).toEqual(['category-new']);
  });

  it('adds a category from a stacked popup', async () => {
    const posted: unknown[] = [];
    server.use(
      ...readHandlers(),
      http.post('/api/categories/', async ({ request }) => {
        const body = await request.json();
        posted.push(body);
        return HttpResponse.json({ code: 201, data: body });
      }),
    );
    const user = userEvent.setup();
    await openMenu(user);
    await user.click(
      await screen.findByRole('menuitem', { name: 'Kategoria' }),
    );
    const dialog = await screen.findByRole('dialog', {
      name: 'Nowa kategoria',
    });

    await user.type(screen.getByRole('textbox', { name: 'Nazwa' }), 'Kultura');
    await user.click(screen.getByRole('button', { name: 'Dodaj kategorię' }));

    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    expect(posted).toMatchObject([{ name: 'Kultura' }]);
  });

  const openCategoryList = async (user: ReturnType<typeof userEvent.setup>) => {
    server.use(
      ...readHandlers({
        categories: [
          { id: 'c-1', name: 'Spożywcze', icon: 'cart', color: '#0a0' },
        ],
      }),
    );
    render(<Main />);
    await screen.findByRole('heading', { name: 'Kategorie' });
    await user.click(screen.getByRole('button', { name: 'Zarządzaj' }));
  };

  it('lists the categories behind the manage button', async () => {
    const user = userEvent.setup();

    await openCategoryList(user);

    expect(
      await screen.findByRole('link', { name: 'Edytuj kategorię Spożywcze' }),
    ).toBeInTheDocument();
  });

  it('stacks the new category popup over the list', async () => {
    const user = userEvent.setup();
    await openCategoryList(user);
    await screen.findByRole('link', { name: 'Edytuj kategorię Spożywcze' });

    await user.click(
      screen.getByRole('button', { name: /Dodaj$/, hidden: false }),
    );

    await screen.findByRole('dialog', { name: 'Nowa kategoria' });
    expect(modalsInUrl()).toEqual(['categories-list', 'category-new']);
  });
});
