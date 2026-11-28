import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { COLORS } from '../configuration/constraints';
import { CategoryModals } from '../presentation/category-modals';
import { NEW_CATEGORY_MODAL } from '../presentation/modal-ids';

const FOOD = { id: 'c-1', name: 'Food', icon: 'cart', color: '#0f7a4f' };

type Body = { name: string; icon: string; color: string };

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const setup = async (postStatus = 201) => {
  const created: Body[] = [];
  server.use(
    http.get('/api/categories/', () =>
      HttpResponse.json({ code: 200, data: [FOOD] }),
    ),
    http.post('/api/categories/', async ({ request }) => {
      const body = (await request.json()) as Body;
      created.push(body);
      return postStatus === 201
        ? HttpResponse.json({ code: 201, data: body })
        : HttpResponse.json({ code: postStatus, message: 'boom' });
    }),
  );
  window.history.replaceState(null, '', `/?modal=${NEW_CATEGORY_MODAL}`);
  render(<CategoryModals />);
  await screen.findByRole('dialog', { name: 'Nowa kategoria' });
  return created;
};

const nameInput = () => screen.getByRole('textbox', { name: /Nazwa/ });
const submit = () =>
  userEvent.click(screen.getByRole('button', { name: 'Dodaj kategorię' }));

describe('new category dialog', () => {
  it('asks for a name when submitted empty', async () => {
    const created = await setup();

    await submit();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Podaj nazwę kategorii.',
    );
    expect(nameInput()).toBeInvalid();
    expect(created).toHaveLength(0);
  });

  it('rejects a name that already exists', async () => {
    const created = await setup();
    await waitFor(() => expect(nameInput()).toBeEnabled());

    await userEvent.type(nameInput(), '  Food ');
    await userEvent.click(
      screen.getByRole('button', { name: 'Dodaj kategorię' }),
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Kategoria o takiej nazwie już istnieje.',
    );
    expect(created).toHaveLength(0);
  });

  it('creates the category with picked color and closes', async () => {
    const created = await setup();

    await userEvent.type(nameInput(), ' Kultura ');
    await userEvent.click(screen.getByRole('button', { name: /Kolor/ }));
    await userEvent.click(
      screen.getByRole('button', { name: `Kolor ${COLORS[1]}` }),
    );
    await submit();

    await waitFor(() => expect(created).toHaveLength(1));
    expect(created[0]).toMatchObject({
      name: 'Kultura',
      icon: 'cart',
      color: COLORS[1],
    });
    expect(screen.queryByRole('dialog', { name: 'Nowa kategoria' })).toBeNull();
    expect(window.location.search).not.toContain(NEW_CATEGORY_MODAL);
  });

  it('closes without saving when cancelled', async () => {
    const created = await setup();

    await userEvent.click(screen.getByRole('button', { name: 'Anuluj' }));

    expect(screen.queryByRole('dialog', { name: 'Nowa kategoria' })).toBeNull();
    expect(created).toHaveLength(0);
  });

  it('shows a retryable error when saving fails', async () => {
    await setup(500);

    await userEvent.type(nameInput(), 'Kultura');
    await submit();

    expect(
      await screen.findByText('Nie udało się dodać kategorii'),
    ).toBeInTheDocument();
    expect(screen.getByText('CATEGORY_CREATE_FAILED')).toBeInTheDocument();
  });
});
