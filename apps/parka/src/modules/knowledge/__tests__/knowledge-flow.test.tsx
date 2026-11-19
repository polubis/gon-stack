import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderKnowledge } from './render-knowledge';
import { catalog, setupKnowledgeBackend, topic } from './knowledge-backend';

const backend = setupKnowledgeBackend();

afterEach(() => vi.useRealTimers());

const seed = () => {
  backend.state.catalogs = [
    catalog(),
    catalog({ id: 'k-sql', name: 'SQL', position: 1 }),
    catalog({ id: 'k-go', name: 'Go', position: 2 }),
  ];
  backend.state.topics = [
    topic({ id: 't-1', title: 'Phrasal verbs', doneCount: 1 }),
    topic({ id: 't-2', title: 'Idiomy', position: 1, studyDay: '2026-10-21' }),
    topic({ id: 't-3', title: 'Zaległy temat', position: 2, studyDay: null }),
    topic({
      id: 't-sql',
      catalogId: 'k-sql',
      title: 'Joiny',
      reelCount: 2,
      doneCount: 2,
      studyDay: '2026-11-05',
    }),
    topic({ id: 't-go', catalogId: 'k-go', title: 'Gorutyny', reelCount: 0 }),
  ];
};

const row = async (title: string) =>
  within((await screen.findByText(title)).closest('li')!);

describe('knowledge screen', () => {
  it('shows finished against unfinished topics and the first catalog', async () => {
    seed();
    renderKnowledge();

    expect(await screen.findByText('1 z 5')).toBeVisible();
    expect(
      screen.getByText('Nieukończone').nextElementSibling,
    ).toHaveTextContent('4');
    const english = within(
      await screen.findByRole('region', { name: 'Katalog: Angielski' }),
    );
    expect(english.getByText('Phrasal verbs')).toBeVisible();
    // Any study day, dated or not, is listed; other catalogs stay out.
    expect(english.getByText('Idiomy')).toBeVisible();
    expect(english.getByText('Zaległy temat')).toBeVisible();
    expect(screen.queryByText('Joiny')).toBeNull();
    expect(screen.queryByRole('group', { name: 'Zakres czasu' })).toBeNull();
  });

  it('shows x/y reels and a progress bar on a topic', async () => {
    seed();
    renderKnowledge();

    const phrasal = await row('Phrasal verbs');

    expect(phrasal.getByText('1/4 rolek')).toBeVisible();
    expect(
      phrasal.getByRole('progressbar', {
        name: 'Postęp tematu: Phrasal verbs',
      }),
    ).toHaveAttribute('aria-valuenow', '25');
  });

  it('steps to the next catalog and round to the first, arrows never disabled', async () => {
    const user = userEvent.setup();
    seed();
    renderKnowledge();
    await screen.findByText('Phrasal verbs');
    const next = screen.getByRole('button', { name: 'Następny katalog' });

    await user.click(next);
    expect(await screen.findByText('Joiny')).toBeVisible();
    expect(screen.queryByText('Phrasal verbs')).toBeNull();
    await user.click(next);
    expect(await screen.findByText('Gorutyny')).toBeVisible();
    await user.click(next);

    expect(await screen.findByText('Phrasal verbs')).toBeVisible();
    expect(next).toBeEnabled();
    expect(
      screen.getByRole('button', { name: 'Poprzedni katalog' }),
    ).toBeEnabled();
  });

  it('steps back from the first catalog to the last', async () => {
    const user = userEvent.setup();
    seed();
    renderKnowledge();
    await screen.findByText('Phrasal verbs');

    await user.click(screen.getByRole('button', { name: 'Poprzedni katalog' }));

    expect(await screen.findByText('Gorutyny')).toBeVisible();
  });

  it('picks a catalog from the list', async () => {
    const user = userEvent.setup();
    seed();
    renderKnowledge();
    await screen.findByText('Phrasal verbs');

    await user.click(
      screen.getByRole('button', { name: /Wybierz katalog: Angielski/ }),
    );
    await user.click(await screen.findByRole('button', { name: 'SQL' }));

    expect(await screen.findByText('Joiny')).toBeVisible();
    expect(window.location.search).toContain('catalog=k-sql');
  });

  it('restores the picked catalog from the URL', async () => {
    seed();
    renderKnowledge('?catalog=k-sql');

    expect(await screen.findByText('Joiny')).toBeVisible();
    expect(screen.queryByText('Phrasal verbs')).toBeNull();
  });

  it('moves to the next catalog on a swipe left and back on a swipe right', async () => {
    seed();
    renderKnowledge();
    await screen.findByText('Phrasal verbs');
    const area = screen.getByRole('main');
    const swipe = (dx: number) => {
      fireEvent.touchStart(area, { touches: [{ clientX: 200, clientY: 100 }] });
      fireEvent.touchEnd(area, {
        changedTouches: [{ clientX: 200 + dx, clientY: 100 }],
      });
    };

    swipe(-120);
    expect(await screen.findByText('Joiny')).toBeVisible();
    swipe(120);

    expect(await screen.findByText('Phrasal verbs')).toBeVisible();
  });

  it('opens the backlog with undated topics and the count on its button', async () => {
    const user = userEvent.setup();
    seed();
    renderKnowledge();

    await user.click(
      await screen.findByRole('button', { name: 'Backlog, tematów: 1' }),
    );

    const dialog = within(
      await screen.findByRole('dialog', { name: 'Backlog' }),
    );
    expect(dialog.getByText('Zaległy temat')).toBeVisible();
  });

  it('opens a topic and offers Start or Continue that opens the viewer modal', async () => {
    const user = userEvent.setup();
    seed();
    renderKnowledge();

    await user.click(
      await screen.findByRole('button', { name: /^Phrasal verbs, rolki 1\/4/ }),
    );
    expect(screen.getByText('Czasowniki frazowe')).toBeVisible();
    await user.click(
      screen.getByRole('button', { name: 'Kontynuuj: Phrasal verbs' }),
    );

    expect(
      await screen.findByRole('dialog', { name: 'Phrasal verbs' }),
    ).toBeVisible();
    expect(window.location.search).toContain(
      encodeURIComponent('knowledge:reel-viewer?topic=t-1'),
    );
  });

  it('offers the demo course on an empty account and reloads after it', async () => {
    const user = userEvent.setup();
    backend.state.categories = [];
    backend.state.catalogs = [];
    renderKnowledge();

    await user.click(await screen.findByRole('button', { name: 'Wczytaj' }));

    expect(await screen.findByText('Lekcja 1')).toBeVisible();
    expect(backend.writes()[0]?.url).toContain('/api/knowledge/demo/');
  });

  it('shows an error state with retry when the load fails', async () => {
    const user = userEvent.setup();
    backend.state.failReads = true;
    renderKnowledge();

    expect(
      await screen.findByText('Nie udało się wczytać wiedzy'),
    ).toBeVisible();
    expect(screen.getByText('KNOWLEDGE_LOAD')).toBeVisible();
    backend.state.failReads = false;
    seed();
    await user.click(screen.getByRole('button', { name: 'Ponów' }));

    expect(await screen.findByText('Phrasal verbs')).toBeVisible();
  });
});

describe('knowledge filters', () => {
  it('narrows the list by phrase and names it in the empty message', async () => {
    const user = userEvent.setup();
    seed();
    renderKnowledge();
    await screen.findByText('Phrasal verbs');

    await user.click(screen.getByRole('button', { name: 'Filtry' }));
    const drawer = within(
      await screen.findByRole('dialog', { name: /Filtry/ }),
    );
    await user.type(
      drawer.getByRole('searchbox', { name: 'Szukaj w tematach' }),
      'idio',
    );
    await user.click(drawer.getByRole('button', { name: /Pokaż tematy/ }));

    expect(await screen.findByText('Idiomy')).toBeVisible();
    expect(screen.queryByText('Phrasal verbs')).toBeNull();

    await user.click(
      screen.getByRole('button', { name: /Filtry, aktywne: 1/ }),
    );
    const again = within(await screen.findByRole('dialog', { name: /Filtry/ }));
    await user.clear(
      again.getByRole('searchbox', { name: 'Szukaj w tematach' }),
    );
    await user.type(
      again.getByRole('searchbox', { name: 'Szukaj w tematach' }),
      'zzz',
    );
    await user.click(again.getByRole('button', { name: /Pokaż tematy/ }));

    expect(await screen.findByText('Brak wyników dla „zzz”')).toBeVisible();
  });

  it('filters by progress through the URL params', async () => {
    seed();
    renderKnowledge('?progress=untouched');

    expect(await screen.findByText('Idiomy')).toBeVisible();
    expect(screen.queryByText('Phrasal verbs')).toBeNull();
  });
});

describe('knowledge writes', () => {
  const addTopic = async (
    user: ReturnType<typeof userEvent.setup>,
    title: string,
  ) => {
    await user.click(
      await screen.findByRole('button', {
        name: 'Dodaj temat do katalogu: Angielski',
      }),
    );
    const form = within(
      await screen.findByRole('dialog', { name: 'Nowy temat' }),
    );
    await user.type(form.getByLabelText(/Tytuł/), title);
    await user.click(form.getByRole('button', { name: 'Dodaj' }));
  };

  it('shows a created topic at once, then keeps it with the server id', async () => {
    const user = userEvent.setup();
    seed();
    backend.state.writeDelayMs = 100;
    renderKnowledge();

    await addTopic(user, 'Conditionals');

    expect(await screen.findByText('Conditionals')).toBeVisible();
    await waitFor(() => expect(backend.writes()).toHaveLength(1));
    expect(backend.writes()[0]?.body).toMatchObject({
      title: 'Conditionals',
      catalogId: 'k-en',
      studyDay: '2026-10-20',
    });
    await waitFor(() => expect(backend.state.topics).toHaveLength(6));
    expect(screen.getByText('Conditionals')).toBeVisible();
  });

  it('rolls a created topic back and shows an error toast with retry', async () => {
    const user = userEvent.setup();
    seed();
    backend.state.failWrites = true;
    renderKnowledge();

    await addTopic(user, 'Conditionals');

    expect(await screen.findByText('Nie udało się dodać tematu')).toBeVisible();
    expect(screen.getByText('KNOWLEDGE_TOPIC_CREATE_FAILED')).toBeVisible();
    expect(screen.getByText('Database unavailable')).toBeVisible();
    expect(screen.queryByText('Conditionals')).toBeNull();
    expect(screen.getByRole('button', { name: 'Ponów' })).toBeVisible();
  });

  it('asks before deleting and removes the topic at once', async () => {
    const user = userEvent.setup();
    seed();
    renderKnowledge();

    await user.click(
      await screen.findByRole('button', { name: /^Idiomy, rolki/ }),
    );
    await user.click(
      screen.getByRole('button', { name: 'Usuń temat: Idiomy' }),
    );
    const dialog = within(
      await screen.findByRole('dialog', { name: 'Usunąć temat?' }),
    );
    expect(backend.writes()).toHaveLength(0);
    await user.click(dialog.getByRole('button', { name: 'Usuń' }));

    await waitFor(() => expect(screen.queryByText('Idiomy')).toBeNull());
    await waitFor(() => expect(backend.writes()).toHaveLength(1));
    expect(backend.writes()[0]?.method).toBe('DELETE');
  });

  it('brings a deleted topic back when the server refuses', async () => {
    const user = userEvent.setup();
    seed();
    backend.state.failWrites = true;
    renderKnowledge();

    await user.click(
      await screen.findByRole('button', { name: /^Idiomy, rolki/ }),
    );
    await user.click(
      screen.getByRole('button', { name: 'Usuń temat: Idiomy' }),
    );
    const dialog = within(
      await screen.findByRole('dialog', { name: 'Usunąć temat?' }),
    );
    await user.click(dialog.getByRole('button', { name: 'Usuń' }));

    expect(
      await screen.findByText('Nie udało się usunąć tematu'),
    ).toBeVisible();
    expect(await screen.findByText('Idiomy')).toBeVisible();
  });

  it('adds a category from the structure list', async () => {
    const user = userEvent.setup();
    seed();
    renderKnowledge();

    await user.click(await screen.findByRole('button', { name: 'Kategorie' }));
    const list = within(
      await screen.findByRole('dialog', { name: 'Kategorie' }),
    );
    await user.click(list.getByRole('button', { name: 'Dodaj' }));
    const form = within(
      await screen.findByRole('dialog', { name: 'Nowa kategoria' }),
    );
    await user.type(form.getByLabelText(/Nazwa/), 'Nauka');
    await user.click(form.getByRole('button', { name: 'Dodaj' }));

    expect(
      await screen.findByRole('button', { name: 'Edytuj kategorię: Nauka' }),
    ).toBeVisible();
    await waitFor(() => expect(backend.writes()).toHaveLength(1));
    expect(backend.writes()[0]?.body).toMatchObject({ name: 'Nauka' });
  });

  it('refuses an empty title with a message and sends nothing', async () => {
    const user = userEvent.setup();
    seed();
    renderKnowledge();

    await user.click(
      await screen.findByRole('button', {
        name: 'Dodaj temat do katalogu: Angielski',
      }),
    );
    const form = within(
      await screen.findByRole('dialog', { name: 'Nowy temat' }),
    );
    await user.click(form.getByRole('button', { name: 'Dodaj' }));

    expect(await form.findByText('Podaj tytuł tematu.')).toBeVisible();
    expect(backend.writes()).toHaveLength(0);
  });
});
