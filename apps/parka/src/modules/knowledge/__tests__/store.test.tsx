import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createMediator } from '../core/mediator';
import { NO_FILTERS } from '../domain/filters';
import type { CatalogId, CategoryId, ReelId, TopicId } from '../domain/models';
import { reel, setupKnowledgeBackend, topic } from './knowledge-backend';

const backend = setupKnowledgeBackend();

const VIEW = { from: '2026-10-01', to: '2026-10-31', filters: NO_FILTERS };

/** Mediator with its public selectors, loaded for October 2026. */
const open = async () => {
  const { facade, register } = createMediator();
  const hook = renderHook(() => ({
    all: facade.useAllTopics(),
    ranged: facade.useRanged(),
    backlog: facade.useBacklog(),
    catalogs: facade.useCatalogs(),
    categories: facade.useCategories(),
    reels: facade.useReels(),
    notice: facade.useNotice(),
  }));
  const unregister = register();
  act(() => facade.load(VIEW));
  await waitFor(() =>
    expect(hook.result.current.all.length).toBeGreaterThan(0),
  );
  return { facade, hook, unregister };
};

describe('knowledge store', () => {
  it('splits topics into the period list, the backlog and the whole set', async () => {
    backend.state.topics = [
      topic({ id: 't-1' }),
      topic({ id: 't-2', studyDay: null }),
      topic({ id: 't-3', studyDay: '2026-12-01' }),
    ];

    const { hook } = await open();

    await waitFor(() => expect(hook.result.current.backlog).toHaveLength(1));
    expect(hook.result.current.ranged.map((t) => t.id)).toEqual(['t-1']);
    expect(hook.result.current.all).toHaveLength(3);
  });

  it('puts a created topic where a reload would put it', async () => {
    backend.state.topics = [topic()];
    const { facade, hook } = await open();

    act(() =>
      facade.createTopic({
        id: 'tmp-1' as TopicId,
        catalogId: 'k-en' as CatalogId,
        title: 'Nowy',
        description: '',
        position: 5,
        studyDay: null,
        tagIds: [],
        reelCount: 0,
        doneCount: 0,
        createdAt: '2026-10-20T10:00:00.000Z',
      }),
    );

    expect(hook.result.current.backlog.map((t) => t.id)).toContain('tmp-1');
    expect(hook.result.current.ranged.map((t) => t.id)).not.toContain('tmp-1');
    await waitFor(() =>
      expect(hook.result.current.backlog.map((t) => t.id)).toContain('srv-1'),
    );
  });

  it('sends the server id of a category created a moment before its catalog', async () => {
    backend.state.topics = [topic()];
    backend.state.writeDelayMs = 30;
    const { facade } = await open();

    act(() => {
      facade.createCategory({
        id: 'tmp-cat' as CategoryId,
        name: 'Nauka',
        color: '#0f7a4f',
        position: 1,
      });
      facade.createCatalog({
        id: 'tmp-catalog' as CatalogId,
        categoryId: 'tmp-cat' as CategoryId,
        name: 'Fizyka',
        description: '',
        position: 1,
      });
    });

    await waitFor(() => expect(backend.writes()).toHaveLength(2));
    expect(backend.writes()[1]?.body).toMatchObject({ categoryId: 'srv-1' });
  });

  it('marks a reel done at once and counts it in the topic', async () => {
    backend.state.topics = [topic({ reelCount: 2 })];
    backend.state.reels = [reel(), reel({ id: 'r-2', position: 1 })];
    backend.state.writeDelayMs = 50;
    const { facade, hook } = await open();
    act(() => facade.loadReels('t-1' as TopicId));
    await waitFor(() =>
      expect(hook.result.current.reels['t-1' as TopicId]).toHaveLength(2),
    );

    act(() => facade.setProgress('r-1' as ReelId, true));

    expect(hook.result.current.reels['t-1' as TopicId]?.[0]?.done).toBe(true);
    expect(hook.result.current.all[0]?.doneCount).toBe(1);
    await waitFor(() => expect(backend.writes()).toHaveLength(1));
    expect(backend.writes()[0]?.body).toEqual({ reelId: 'r-1', done: true });
  });

  it('rolls progress back and reports it when the server refuses', async () => {
    backend.state.topics = [topic({ reelCount: 2 })];
    backend.state.reels = [reel(), reel({ id: 'r-2', position: 1 })];
    const { facade, hook } = await open();
    act(() => facade.loadReels('t-1' as TopicId));
    await waitFor(() =>
      expect(hook.result.current.reels['t-1' as TopicId]).toHaveLength(2),
    );
    backend.state.failWrites = true;

    act(() => facade.setProgress('r-1' as ReelId, true));

    await waitFor(() => expect(hook.result.current.notice?.tone).toBe('error'));
    expect(hook.result.current.reels['t-1' as TopicId]?.[0]?.done).toBe(false);
    expect(hook.result.current.all[0]?.doneCount).toBe(0);
  });

  it('adds and removes a reel with the topic counter following', async () => {
    backend.state.topics = [topic({ reelCount: 0 })];
    const { facade, hook } = await open();
    act(() => facade.loadReels('t-1' as TopicId));
    await waitFor(() =>
      expect(hook.result.current.reels['t-1' as TopicId]).toEqual([]),
    );

    act(() =>
      facade.createReel({
        id: 'tmp-r' as ReelId,
        topicId: 't-1' as TopicId,
        body: 'Treść',
        position: 0,
        media: null,
        done: false,
      }),
    );

    expect(hook.result.current.all[0]?.reelCount).toBe(1);
    await waitFor(() =>
      expect(hook.result.current.reels['t-1' as TopicId]?.[0]?.id).toBe(
        'srv-1',
      ),
    );
    act(() => facade.deleteReel('srv-1' as ReelId));
    expect(hook.result.current.all[0]?.reelCount).toBe(0);
  });

  it('restores everything a cascading delete took when it fails', async () => {
    backend.state.topics = [topic()];
    const { facade, hook } = await open();
    backend.state.failWrites = true;

    act(() => facade.deleteCatalog('k-en' as CatalogId));
    expect(hook.result.current.all).toHaveLength(0);

    await waitFor(() => expect(hook.result.current.notice?.tone).toBe('error'));
    expect(hook.result.current.all).toHaveLength(1);
    expect(hook.result.current.catalogs).toHaveLength(1);
  });
});
