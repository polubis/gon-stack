import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderKnowledge } from './render-knowledge';
import { reel, setupKnowledgeBackend, topic } from './knowledge-backend';

const backend = setupKnowledgeBackend();

afterEach(() => vi.useRealTimers());

const open = () => {
  backend.state.topics = [topic({ reelCount: 2 })];
  backend.state.reels = [
    reel({ body: 'Pierwsza' }),
    reel({ id: 'r-2', body: 'Druga', position: 1 }),
  ];
  return renderKnowledge('?modal=topic-reels:t-1');
};

describe('reels editor', () => {
  it('lists the reels of a topic and adds a new one', async () => {
    const user = userEvent.setup();
    open();

    const dialog = within(
      await screen.findByRole('dialog', { name: 'Rolki: Phrasal verbs' }),
    );
    expect(await dialog.findByDisplayValue('Pierwsza')).toBeVisible();
    expect(dialog.getByDisplayValue('Druga')).toBeVisible();
    await user.type(dialog.getByLabelText('Nowa rolka'), 'Trzecia');
    await user.click(dialog.getByRole('button', { name: 'Dodaj' }));

    expect(await dialog.findByDisplayValue('Trzecia')).toBeVisible();
    await waitFor(() => expect(backend.state.reels).toHaveLength(3));
  });

  it('saves an edited body only once it changed', async () => {
    const user = userEvent.setup();
    open();

    const dialog = within(
      await screen.findByRole('dialog', { name: 'Rolki: Phrasal verbs' }),
    );
    const save = await dialog.findByRole('button', { name: 'Zapisz rolkę 1' });
    expect(save).toBeDisabled();
    await user.type(dialog.getByLabelText('Rolka 1'), ' bis');
    await user.click(save);

    await waitFor(() => expect(backend.writes()).toHaveLength(1));
    expect(backend.writes()[0]?.body).toMatchObject({
      id: 'r-1',
      body: 'Pierwsza bis',
    });
  });

  it('asks before deleting a reel', async () => {
    const user = userEvent.setup();
    open();

    const dialog = within(
      await screen.findByRole('dialog', { name: 'Rolki: Phrasal verbs' }),
    );
    await user.click(
      await dialog.findByRole('button', { name: 'Usuń rolkę 2' }),
    );
    expect(backend.writes()).toHaveLength(0);
    const confirm = within(
      await screen.findByRole('dialog', { name: 'Usunąć rolkę?' }),
    );
    await user.click(confirm.getByRole('button', { name: 'Usuń' }));

    await waitFor(() => expect(backend.writes()[0]?.method).toBe('DELETE'));
    await waitFor(() => expect(dialog.queryByDisplayValue('Druga')).toBeNull());
  });

  it('uploads a picture to a reel and shows it', async () => {
    const user = userEvent.setup();
    URL.createObjectURL = vi.fn(() => 'blob:preview');
    URL.revokeObjectURL = vi.fn();
    open();

    const dialog = within(
      await screen.findByRole('dialog', { name: 'Rolki: Phrasal verbs' }),
    );
    await user.upload(
      await dialog.findByLabelText('Plik rolki 1'),
      new File(['x'], 'cat.png', { type: 'image/png' }),
    );

    expect(
      await dialog.findByRole('img', { name: 'Podgląd mediów rolki 1' }),
    ).toBeVisible();
    await waitFor(() =>
      expect(backend.writes().map((c) => c.method)).toContain('POST'),
    );
    await waitFor(() =>
      expect(
        dialog.getByRole('img', { name: 'Podgląd mediów rolki 1' }),
      ).toHaveAttribute('src', 'https://cdn.test/cat.png'),
    );
  });

  it('rejects a file of an unsupported type without sending it', async () => {
    const user = userEvent.setup({ applyAccept: false });
    open();

    const dialog = within(
      await screen.findByRole('dialog', { name: 'Rolki: Phrasal verbs' }),
    );
    await user.upload(
      await dialog.findByLabelText('Plik rolki 1'),
      new File(['x'], 'doc.pdf', { type: 'application/pdf' }),
    );

    expect(
      await screen.findByText('KNOWLEDGE_REEL_MEDIA_REJECTED'),
    ).toBeVisible();
    expect(backend.writes()).toHaveLength(0);
  });

  it('removes the media of a reel after confirmation', async () => {
    const user = userEvent.setup();
    open();
    backend.state.reels[0] = reel({
      body: 'Pierwsza',
      media: { kind: 'image', url: 'https://cdn.test/a.png' },
    });

    const dialog = within(
      await screen.findByRole('dialog', { name: 'Rolki: Phrasal verbs' }),
    );
    await user.click(
      await dialog.findByRole('button', { name: 'Usuń media rolki 1' }),
    );
    expect(backend.writes()).toHaveLength(0);
    const confirm = within(
      await screen.findByRole('dialog', { name: 'Usunąć media rolki?' }),
    );
    await user.click(confirm.getByRole('button', { name: 'Usuń' }));

    await waitFor(() => expect(backend.writes()[0]?.method).toBe('DELETE'));
    await waitFor(() =>
      expect(
        dialog.queryByRole('img', { name: 'Podgląd mediów rolki 1' }),
      ).toBeNull(),
    );
  });

  it('previews the Markdown of a reel', async () => {
    const user = userEvent.setup();
    open();
    backend.state.reels[0] = reel({ body: '**Mocne**' });

    const dialog = within(
      await screen.findByRole('dialog', { name: 'Rolki: Phrasal verbs' }),
    );
    await user.click(
      await dialog.findByRole('button', { name: 'Podgląd Markdown rolki 1' }),
    );

    expect(dialog.getByText('Mocne').tagName).toBe('STRONG');
  });
});
