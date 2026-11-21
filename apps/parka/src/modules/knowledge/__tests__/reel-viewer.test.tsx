import {
  act,
  fireEvent,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderKnowledge } from './render-knowledge';
import { reel, setupKnowledgeBackend, topic } from './knowledge-backend';

const backend = setupKnowledgeBackend();

afterEach(() => vi.useRealTimers());

const VIEWER = `?modal=${encodeURIComponent('knowledge:reel-viewer?topic=t-1')}`;

const seed = () => {
  backend.state.topics = [
    topic({ reelCount: 3 }),
    topic({ id: 't-2', title: 'Idioms', position: 1, reelCount: 1 }),
  ];
  backend.state.reels = [
    reel({ id: 'r-1', body: 'Pierwsza', position: 0 }),
    reel({ id: 'r-2', body: 'Druga', position: 1 }),
    reel({ id: 'r-3', body: 'Trzecia', position: 2 }),
    reel({ id: 'r-4', topicId: 't-2', body: 'Idiom', position: 0 }),
  ];
};

const status = () =>
  screen.findByText(/^Rolka \d z \d$|^Lekcja ukończona$/, {
    selector: '[data-e2e="knowledge:viewer-status"]',
  });

describe('reel viewer', () => {
  it('shows a skeleton and then the first reel', async () => {
    seed();
    backend.state.delayMs = 50;
    renderKnowledge(VIEWER);

    await screen.findByRole('dialog', { name: 'Phrasal verbs' });
    expect(await screen.findByText('Pierwsza')).toBeVisible();
    expect(await status()).toHaveTextContent('Rolka 1 z 3');
  });

  it('moves between reels with the arrow keys and the buttons', async () => {
    const user = userEvent.setup();
    seed();
    renderKnowledge(VIEWER);

    await screen.findByText('Pierwsza');
    await user.keyboard('{ArrowRight}');
    expect(await screen.findByText('Druga')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Następna rolka' }));
    expect(await screen.findByText('Trzecia')).toBeVisible();
    await user.keyboard('{ArrowLeft}');
    expect(await screen.findByText('Druga')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Poprzednia rolka' }));
    expect(await screen.findByText('Pierwsza')).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Poprzednia rolka' }),
    ).toBeDisabled();
  });

  it('swipes with a drag', async () => {
    seed();
    renderKnowledge(VIEWER);
    await screen.findByText('Pierwsza');
    const stage = screen.getByRole('region', { name: 'Rolki: Phrasal verbs' });
    stage.setPointerCapture = vi.fn();
    stage.hasPointerCapture = () => false;

    const swipe = (dx: number) => {
      fireEvent.pointerDown(stage, {
        clientX: 200,
        clientY: 100,
        pointerId: 1,
        isPrimary: true,
        button: 0,
      });
      fireEvent.pointerMove(stage, {
        clientX: 200 + dx / 2,
        clientY: 100,
        pointerId: 1,
        isPrimary: true,
      });
      fireEvent.pointerMove(stage, {
        clientX: 200 + dx,
        clientY: 100,
        pointerId: 1,
        isPrimary: true,
      });
      fireEvent.pointerUp(stage, {
        clientX: 200 + dx,
        clientY: 100,
        pointerId: 1,
        isPrimary: true,
      });
    };
    swipe(-120);
    expect(await screen.findByText('Druga')).toBeVisible();
    swipe(120);
    expect(await screen.findByText('Pierwsza')).toBeVisible();
  });

  it('marks a reel done once it is on screen', async () => {
    const user = userEvent.setup();
    seed();
    renderKnowledge(VIEWER);

    await screen.findByText('Pierwsza');
    await waitFor(() =>
      expect(backend.writes().map((w) => w.body)).toContainEqual({
        reelId: 'r-1',
        done: true,
      }),
    );
    await user.keyboard('{ArrowRight}');
    await waitFor(() =>
      expect(backend.writes().map((w) => w.body)).toContainEqual({
        reelId: 'r-2',
        done: true,
      }),
    );
  });

  it('resumes at the first reel that is not done', async () => {
    seed();
    backend.state.reels[0] = reel({ id: 'r-1', body: 'Pierwsza', done: true });
    renderKnowledge(VIEWER);

    expect(await screen.findByText('Druga')).toBeVisible();
    expect(await status()).toHaveTextContent('Rolka 2 z 3');
  });

  it('ends with a completed lesson and goes down to the next lesson', async () => {
    const user = userEvent.setup();
    seed();
    renderKnowledge(VIEWER);

    await screen.findByText('Pierwsza');
    await user.keyboard('{ArrowRight}{ArrowRight}');
    await screen.findByText('Trzecia');
    await user.keyboard('{ArrowRight}');
    expect(
      await screen.findByRole('heading', { name: 'Lekcja ukończona' }),
    ).toBeVisible();

    await user.click(
      screen.getByRole('button', { name: /Następna lekcja: Idioms/ }),
    );
    expect(await screen.findByText('Idiom')).toBeVisible();
    expect(screen.getByRole('dialog', { name: 'Idioms' })).toBeVisible();
  });

  it('keeps lesson buttons off the reel screen and offers them on the end screen', async () => {
    const user = userEvent.setup();
    seed();
    renderKnowledge(VIEWER);

    await screen.findByText('Pierwsza');
    expect(screen.queryByRole('button', { name: /lekcja/i })).toBeNull();
    await user.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}');
    expect(
      await screen.findByRole('button', { name: /Następna lekcja: Idioms/ }),
    ).toBeVisible();

    await user.click(
      screen.getByRole('button', { name: /Następna lekcja: Idioms/ }),
    );
    await screen.findByText('Idiom');
    await user.keyboard('{ArrowRight}');
    await user.click(
      await screen.findByRole('button', {
        name: /Poprzednia lekcja: Phrasal verbs/,
      }),
    );
    expect(
      await screen.findByRole('dialog', { name: 'Phrasal verbs' }),
    ).toBeVisible();
  });

  it('leaves text selectable and captures the pointer only once it is a swipe', async () => {
    seed();
    renderKnowledge(VIEWER);
    await screen.findByText('Pierwsza');
    const stage = screen.getByRole('region', { name: 'Rolki: Phrasal verbs' });
    const capture = vi.fn();
    stage.setPointerCapture = capture;
    stage.hasPointerCapture = () => false;
    const touch = { pointerId: 1, pointerType: 'touch', isPrimary: true };

    expect(stage).not.toHaveClass('select-none');
    fireEvent.pointerDown(stage, {
      ...touch,
      clientX: 200,
      clientY: 100,
      button: 0,
    });
    expect(capture).not.toHaveBeenCalled();
    fireEvent.pointerMove(stage, { ...touch, clientX: 120, clientY: 100 });
    expect(capture).toHaveBeenCalledTimes(1);
    fireEvent.pointerUp(stage, { ...touch, clientX: 120, clientY: 100 });
    expect(await screen.findByText('Druga')).toBeVisible();
  });

  it('goes to the next lesson with ArrowDown on the last reel and back with ArrowUp', async () => {
    const user = userEvent.setup();
    seed();
    backend.state.topics = [
      topic({ reelCount: 1 }),
      ...backend.state.topics.slice(1),
    ];
    backend.state.reels = backend.state.reels.filter(
      (r) => r.id !== 'r-2' && r.id !== 'r-3',
    );
    renderKnowledge(VIEWER);

    await screen.findByText('Pierwsza');
    await user.keyboard('{ArrowDown}');
    expect(await screen.findByText('Idiom')).toBeVisible();
    await user.keyboard('{ArrowUp}');
    expect(await screen.findByText('Pierwsza')).toBeVisible();
  });

  it('closes only the viewer with Escape', async () => {
    const user = userEvent.setup();
    seed();
    renderKnowledge(VIEWER);

    await screen.findByText('Pierwsza');
    await user.keyboard('{Escape}');
    await waitFor(() =>
      expect(
        screen.queryByRole('dialog', { name: 'Phrasal verbs' }),
      ).toBeNull(),
    );
    expect(window.location.search).not.toContain('reel-viewer');
  });

  it('announces the position for assistive tech', async () => {
    const user = userEvent.setup();
    seed();
    renderKnowledge(VIEWER);

    await screen.findByText('Pierwsza');
    await user.keyboard('{ArrowRight}');
    await act(async () => undefined);
    expect(await screen.findAllByText('Rolka 2 z 3')).not.toHaveLength(0);
  });

  it('shows the error pattern with retry when reels do not load', async () => {
    const user = userEvent.setup();
    seed();
    backend.state.failReelReads = true;
    renderKnowledge(VIEWER);

    const alert = within(
      await screen.findByRole('dialog', { name: 'Phrasal verbs' }),
    );
    expect(await alert.findByRole('alert')).toHaveTextContent(
      'KNOWLEDGE_REELS_LOAD_FAILED',
    );
    backend.state.failReelReads = false;
    await user.click(alert.getByRole('button', { name: 'Ponów' }));
    expect(await screen.findByText('Pierwsza')).toBeVisible();
  });

  it('shows the picture of a reel with a text alternative', async () => {
    seed();
    backend.state.reels[0] = reel({
      id: 'r-1',
      body: 'Pierwsza',
      media: { kind: 'image', url: 'https://cdn.test/a.png' },
    });
    renderKnowledge(VIEWER);

    const image = await screen.findByRole('img', {
      name: 'Ilustracja do rolki 1',
    });
    expect(image).toHaveAttribute('src', 'https://cdn.test/a.png');
  });
});
