import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderKnowledge } from './render-knowledge';
import { setupKnowledgeBackend, topic } from './knowledge-backend';

const backend = setupKnowledgeBackend();

afterEach(() => vi.useRealTimers());

const seed = () => {
  backend.state.topics = [
    topic({ id: 't-1', title: 'Phrasal verbs', doneCount: 1 }),
    topic({ id: 't-2', title: 'Idiomy', position: 1, studyDay: '2026-10-21' }),
    topic({ id: 't-3', title: 'Zaległy temat', position: 2, studyDay: null }),
    topic({ id: 't-far', title: 'Listopadowy', studyDay: '2026-11-05' }),
  ];
};

const row = async (title: string) =>
  within((await screen.findByText(title)).closest('li')!);

describe('knowledge screen', () => {
  it('shows the brain summary and the topics of the period under their catalog', async () => {
    seed();
    renderKnowledge();

    expect(
      await screen.findByRole('group', { name: /Mózg wypełniony wiedzą/ }),
    ).toBeVisible();
    const english = within(
      await screen.findByRole('region', { name: 'Katalog: Angielski' }),
    );
    expect(english.getByText('Phrasal verbs')).toBeVisible();
    expect(english.getByText('Idiomy')).toBeVisible();
    // Another month and the backlog stay out of the period list.
    expect(screen.queryByText('Listopadowy')).toBeNull();
    expect(screen.queryByText('Zaległy temat')).toBeNull();
    expect(
      screen.getByRole('region', { name: 'Kategoria: Języki' }),
    ).toBeVisible();
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

  it('asks the server for the period range and for the backlog', async () => {
    seed();
    renderKnowledge();
    await screen.findByText('Phrasal verbs');

    const urls = backend.lists().map((c) => new URL(c.url).searchParams);
    expect(
      urls.some(
        (q) => q.get('from') === '2026-10-01' && q.get('to') === '2026-10-31',
      ),
    ).toBe(true);
    expect(urls.some((q) => q.get('scope') === 'undated')).toBe(true);
  });

  it('moves to the next month and loads its topics', async () => {
    const user = userEvent.setup();
    seed();
    renderKnowledge();
    await screen.findByText('Phrasal verbs');

    await user.click(screen.getByRole('button', { name: /następn/i }));

    expect(await screen.findByText('Listopadowy')).toBeVisible();
    expect(screen.queryByText('Phrasal verbs')).toBeNull();
  });

  it('keeps the data on screen while a period reloads', async () => {
    const user = userEvent.setup();
    seed();
    renderKnowledge();
    await screen.findByText('Phrasal verbs');
    backend.state.delayMs = 150;

    await user.click(screen.getByRole('button', { name: /następn/i }));

    expect(screen.getByText('Phrasal verbs')).toBeVisible();
    expect(screen.queryByTestId('skeleton')).toBeNull();
    expect(await screen.findByText('Listopadowy')).toBeVisible();
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

    await user.click(
      await screen.findByRole('button', { name: 'Wczytaj kurs demo' }),
    );

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
    await user.click(screen.getByRole('button', { name: 'Spróbuj ponownie' }));

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
    await waitFor(() => expect(backend.state.topics).toHaveLength(5));
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
    expect(
      screen.getByRole('button', { name: 'Spróbuj ponownie' }),
    ).toBeVisible();
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
