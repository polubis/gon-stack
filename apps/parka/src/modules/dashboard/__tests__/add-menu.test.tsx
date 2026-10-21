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
  await screen.findByText('Kategorie wydatków');
  await user.click(screen.getAllByRole('button', { name: /^Dodaj$/ })[0]!);
};

describe('dashboard add menu', () => {
  it('offers expense, recurring expense and category', async () => {
    server.use(...readHandlers());
    const user = userEvent.setup();
    await openMenu(user);

    const menu = await screen.findByRole('menu', { name: 'Dodaj' });

    expect(menu.textContent).toBe('WydatekWydatek cyklicznyKategoria');
    expect(
      screen.getByRole('menuitem', { name: 'Wydatek cykliczny' }),
    ).toHaveAttribute('href', expect.stringContaining('type=recurring'));
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
    expect(modalsInUrl()).toEqual(['category-new']);

    await user.type(screen.getByRole('textbox', { name: 'Nazwa' }), 'Kultura');
    await user.click(screen.getByRole('button', { name: 'Dodaj kategorię' }));

    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    expect(await screen.findByText('Dodano kategorię.')).toBeInTheDocument();
    expect(posted).toMatchObject([{ name: 'Kultura' }]);
  });

  it('lists categories and stacks the new category popup over them', async () => {
    server.use(
      ...readHandlers({
        categories: [
          { id: 'c-1', name: 'Spożywcze', icon: 'cart', color: '#0a0' },
        ],
      }),
    );
    const user = userEvent.setup();
    render(<Main />);
    await screen.findByText('Kategorie wydatków');

    await user.click(screen.getByRole('button', { name: 'Kategorie' }));
    expect(
      await screen.findByRole('link', { name: 'Edytuj kategorię Spożywcze' }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /Dodaj$/, hidden: false }),
    );
    await screen.findByRole('dialog', { name: 'Nowa kategoria' });
    expect(modalsInUrl()).toEqual(['categories-list', 'category-new']);
  });
});
