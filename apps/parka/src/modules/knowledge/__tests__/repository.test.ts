import { describe, expect, it } from 'vitest';
import type { CategoryId, ReelId, TopicId } from '../domain/models';
import {
  fetchKnowledge,
  fetchTopic,
  postCategory,
  postDemo,
  putProgress,
  putTopic,
  removeCategory,
  resetKnowledgeReads,
  uploadReelMedia,
} from '../integration/repository';
import {
  category,
  catalog,
  reel,
  setupKnowledgeBackend,
  topic,
} from './knowledge-backend';

const backend = setupKnowledgeBackend();

describe('knowledge repository', () => {
  it('reads the lists with the query and maps them to the domain', async () => {
    backend.state.topics = [topic({ studyDay: null })];
    resetKnowledgeReads();

    const data = await fetchKnowledge({ q: 'phrasal', scope: 'undated' });

    expect(data.categories[0]).toMatchObject({ id: 'c-lang', name: 'Języki' });
    expect(data.catalogs[0]).toMatchObject({ categoryId: 'c-lang' });
    expect(data.topics[0]).toMatchObject({
      title: 'Phrasal verbs',
      studyDay: null,
    });
    const [read] = backend.lists();
    expect(new URL(read!.url).searchParams.get('scope')).toBe('undated');
    expect(new URL(read!.url).searchParams.get('q')).toBe('phrasal');
  });

  it('shares equal reads and drops them after a write', async () => {
    resetKnowledgeReads();

    await Promise.all([fetchKnowledge({}), fetchKnowledge({})]);
    expect(backend.lists()).toHaveLength(1);

    await postCategory({ name: 'Nauka', color: '#0f7a4f' });
    await fetchKnowledge({});
    expect(backend.lists()).toHaveLength(2);
  });

  it('turns a failed read into an error with the server message', async () => {
    backend.state.failReads = true;
    resetKnowledgeReads();

    await expect(fetchKnowledge({})).rejects.toThrow('Database unavailable');
  });

  it('creates and removes a category', async () => {
    const saved = await postCategory({ name: 'Nauka', color: '#0f7a4f' });

    expect(saved).toMatchObject({ id: 'srv-1', name: 'Nauka' });
    await removeCategory(saved.id);
    expect(backend.writes().map((w) => w.method)).toEqual(['POST', 'DELETE']);
  });

  it('throws the server message when a write fails', async () => {
    backend.state.failWrites = true;

    await expect(removeCategory('c-lang' as CategoryId)).rejects.toThrow(
      'Database unavailable',
    );
  });

  it('puts a topic with its id and clears the day on null', async () => {
    backend.state.topics = [topic()];

    await putTopic('t-1' as TopicId, {
      catalogId: topic().catalogId as never,
      title: 'Nowy',
      description: '',
      tagIds: [],
      studyDay: null,
    });

    expect(backend.writes()[0]?.body).toMatchObject({
      id: 't-1',
      title: 'Nowy',
      studyDay: null,
    });
  });

  it('reads a topic with its reels in order', async () => {
    backend.state.topics = [topic()];
    backend.state.reels = [reel({ id: 'r-2', position: 1 }), reel()];

    const { topic: read, reels } = await fetchTopic('t-1' as TopicId);

    expect(read.id).toBe('t-1');
    expect(reels.map((r) => r.id)).toEqual(['r-1', 'r-2']);
  });

  it('sends progress of a reel', async () => {
    await putProgress('r-1' as ReelId, true);

    expect(backend.writes()[0]?.body).toEqual({ reelId: 'r-1', done: true });
  });

  it('uploads reel media as multipart and maps the reel', async () => {
    backend.state.reels = [reel()];

    const saved = await uploadReelMedia(
      'r-1' as ReelId,
      new File(['x'], 'a.png', { type: 'image/png' }),
    );

    expect(saved.media).toEqual({
      kind: 'image',
      url: 'https://cdn.test/a.png',
    });
    expect(new URL(backend.calls[0]!.url).pathname).toBe(
      '/api/knowledge/reels/r-1/media/',
    );
  });

  it('creates the demo course with the browser time zone', async () => {
    await postDemo();

    expect(backend.writes()[0]?.body).toHaveProperty('tz');
    expect(catalog()).toBeDefined();
    expect(category()).toBeDefined();
  });
});
