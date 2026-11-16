import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FabLayer } from '@/shared/navigation/overlay-nav/presentation/fab-rail';
import type { KnowledgeGateway } from '../integration/contracts';
import { createMockGateway } from '../integration/mock-gateway';
import { useGateway } from '../integration/repository';
import { Main } from '../presentation/main';

const renderKnowledge = (search = '') => {
  window.history.replaceState(null, '', `/app/knowledge/${search}`);
  return render(
    <>
      <Main />
      <FabLayer />
    </>,
  );
};

const folder = async (name: string) =>
  within(
    (
      await screen.findByRole('button', { name: new RegExp(`^${name}`) })
    ).closest('li')!,
  );

beforeEach(() => useGateway(createMockGateway()));
afterEach(() => vi.restoreAllMocks());

describe('knowledge module', () => {
  it('shows the brain summary, the folders and their nodes', async () => {
    renderKnowledge();

    expect(
      await screen.findByRole('heading', { name: 'Foldery wiedzy' }),
    ).toBeVisible();
    expect(
      screen.getByRole('group', { name: /Mózg wypełniony wiedzą/ }),
    ).toBeVisible();
    const english = await folder('Angielski');
    expect(english.getByText('Słownictwo biznesowe B2')).toBeVisible();
    expect(screen.getByText('Postęp nauki')).toBeVisible();
  });

  it('lists the most urgent node of a folder first', async () => {
    renderKnowledge();

    const english = await folder('Angielski');
    const titles = english
      .getAllByRole('checkbox')
      .map((box) => box.getAttribute('aria-label'));

    expect(titles[0]).toContain('Słownictwo biznesowe B2');
  });

  it('cycles the learning status of a node', async () => {
    const user = userEvent.setup();
    renderKnowledge();

    const english = await folder('Angielski');
    await user.click(english.getByRole('checkbox', { name: /Phrasal verbs/ }));

    expect(
      await english.findByRole('checkbox', {
        name: /W nauce: Phrasal verbs/,
      }),
    ).toBeVisible();
  });

  it('adds a node to a folder through the dialog', async () => {
    const user = userEvent.setup();
    renderKnowledge();

    await user.click(
      await screen.findByRole('button', {
        name: 'Dodaj węzeł do folderu: Angielski',
      }),
    );
    const dialog = within(await screen.findByRole('dialog'));
    await user.type(dialog.getByLabelText(/Tytuł/), 'Idiomy');
    await user.click(dialog.getByRole('button', { name: 'Dodaj węzeł' }));

    expect(await screen.findByText('Idiomy')).toBeVisible();
  });

  it('does not let a node without a title be saved', async () => {
    const user = userEvent.setup();
    renderKnowledge('?modal=node-new');

    const dialog = within(await screen.findByRole('dialog'));

    expect(dialog.getByRole('button', { name: 'Dodaj węzeł' })).toBeDisabled();
    await user.type(dialog.getByLabelText(/Tytuł/), 'x');
    expect(dialog.getByRole('button', { name: 'Dodaj węzeł' })).toBeEnabled();
  });

  it('asks before deleting a node', async () => {
    const user = userEvent.setup();
    renderKnowledge();

    await user.click(
      await screen.findByRole('button', { name: 'Usuń węzeł: Higiena snu' }),
    );
    const dialog = within(await screen.findByRole('dialog'));
    expect(dialog.getByText(/Higiena snu/)).toBeVisible();
    await user.click(dialog.getByRole('button', { name: 'Usuń' }));

    await waitFor(() => expect(screen.queryByText('Higiena snu')).toBeNull());
  });

  it('adds a folder bound to a brain area', async () => {
    const user = userEvent.setup();
    renderKnowledge();

    await user.click(
      await screen.findByRole('button', { name: 'Nowy folder' }),
    );
    const dialog = within(await screen.findByRole('dialog'));
    await user.type(dialog.getByLabelText(/Nazwa/), 'Muzyka');
    await user.click(dialog.getByRole('button', { name: 'Dodaj folder' }));

    expect((await folder('Muzyka')).getByText(/Płat czołowy/)).toBeVisible();
  });

  it('names the phrase when a search finds nothing', async () => {
    const user = userEvent.setup();
    renderKnowledge();

    await user.type(
      await screen.findByRole('searchbox', { name: 'Szukaj w wiedzy' }),
      'zzz',
    );

    expect(await screen.findByText('Brak wyników dla „zzz”.')).toBeVisible();
  });

  it('narrows the list to the folders of a chosen brain area', async () => {
    const user = userEvent.setup();
    renderKnowledge();

    await folder('Angielski');
    await user.click(
      screen.getByRole('button', { name: /Obszar: Płat skroniowy/ }),
    );

    expect(await screen.findByText('Obszar: Płat skroniowy')).toBeVisible();
    expect(
      screen.queryByRole('button', { name: /^Algorytmy i logika/ }),
    ).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Pokaż wszystkie' }));
    expect(
      await screen.findByRole('button', { name: /^Algorytmy i logika/ }),
    ).toBeVisible();
  });

  it('shows an error with retry when loading fails, then recovers', async () => {
    const user = userEvent.setup();
    const healthy = createMockGateway();
    let fail = true;
    const gateway: KnowledgeGateway = {
      ...healthy,
      read: () =>
        fail ? Promise.reject(new Error('Brak połączenia')) : healthy.read(),
    };
    useGateway(gateway);
    renderKnowledge();

    expect(
      await screen.findByText('Nie udało się wczytać wiedzy'),
    ).toBeVisible();
    expect(screen.getByText('KNOWLEDGE_LOAD')).toBeVisible();
    fail = false;
    await user.click(
      screen.getByRole('button', { name: /Spróbuj ponownie|Ponów/ }),
    );

    expect(
      await screen.findByRole('heading', { name: 'Foldery wiedzy' }),
    ).toBeVisible();
  });

  it('rolls a node back and shows an error toast when saving fails', async () => {
    const user = userEvent.setup();
    const healthy = createMockGateway();
    useGateway({
      ...healthy,
      updateNode: () => Promise.reject(new Error('Serwer padł')),
    });
    renderKnowledge();

    const english = await folder('Angielski');
    await user.click(english.getByRole('checkbox', { name: /Phrasal verbs/ }));

    expect(
      await screen.findByText('Nie udało się zapisać węzła'),
    ).toBeVisible();
    expect(
      await english.findByRole('checkbox', { name: /Do nauki: Phrasal verbs/ }),
    ).toBeVisible();
  });
  it('removes a node again and offers a retry when adding it fails', async () => {
    const user = userEvent.setup();
    let fail = true;
    const healthy = createMockGateway();
    useGateway({
      ...healthy,
      createNode: (dto) =>
        fail
          ? Promise.reject(new Error('Serwer padł'))
          : healthy.createNode(dto),
    });
    renderKnowledge('?modal=node-new');

    const dialog = within(await screen.findByRole('dialog'));
    await user.type(dialog.getByLabelText(/Tytuł/), 'Idiomy');
    await user.click(dialog.getByRole('button', { name: 'Dodaj węzeł' }));

    expect(await screen.findByText('Nie udało się dodać węzła')).toBeVisible();
    expect(screen.getByText('NODE_CREATE_FAILED')).toBeVisible();
    expect(screen.queryByText('Idiomy')).toBeNull();
    fail = false;
    await user.click(screen.getByRole('button', { name: 'Spróbuj ponownie' }));

    expect(await screen.findByText('Idiomy')).toBeVisible();
  });

  it('brings a node back and shows an error toast when deleting fails', async () => {
    const user = userEvent.setup();
    useGateway({
      ...createMockGateway(),
      deleteNode: () => Promise.reject(new Error('Serwer padł')),
    });
    renderKnowledge();

    await user.click(
      await screen.findByRole('button', { name: 'Usuń węzeł: Higiena snu' }),
    );
    await user.click(
      within(await screen.findByRole('dialog')).getByRole('button', {
        name: 'Usuń',
      }),
    );

    expect(await screen.findByText('Nie udało się usunąć węzła')).toBeVisible();
    expect(screen.getByText('Higiena snu')).toBeVisible();
  });
});
