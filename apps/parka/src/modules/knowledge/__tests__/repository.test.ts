import { beforeEach, describe, expect, it } from 'vitest';
import type { KnowledgeNode, NodeId, FolderId } from '../domain/models';
import { createMockGateway } from '../integration/mock-gateway';
import {
  fetchKnowledge,
  postFolder,
  postNode,
  putNode,
  removeNode,
  useGateway,
} from '../integration/repository';

beforeEach(() => useGateway(createMockGateway()));

const firstNode = async () => (await fetchKnowledge()).nodes[0]!;

describe('knowledge repository', () => {
  it('reads categories, priorities, folders and nodes', async () => {
    const data = await fetchKnowledge();

    expect(data.categories.length).toBeGreaterThan(0);
    expect(data.priorities.map((p) => p.id)).toEqual(['low', 'medium', 'high']);
    expect(data.folders.length).toBeGreaterThan(0);
    expect(data.nodes.length).toBeGreaterThan(0);
  });

  it('returns a node created earlier on the next read', async () => {
    const base = await firstNode();
    const node: KnowledgeNode = {
      ...base,
      id: 'kn-new' as NodeId,
      title: 'Idiomy',
    };

    await postNode(node);

    expect((await fetchKnowledge()).nodes.map((n) => n.title)).toContain(
      'Idiomy',
    );
  });

  it('returns an updated node with its new status', async () => {
    const base = await firstNode();

    await putNode({ ...base, status: 'learned' });

    expect((await firstNode()).status).toBe('learned');
  });

  it('drops a removed node from the next read', async () => {
    const base = await firstNode();

    await removeNode(base.id);

    expect((await fetchKnowledge()).nodes.map((n) => n.id)).not.toContain(
      base.id,
    );
  });

  it('returns a created folder with its brain area', async () => {
    await postFolder({
      id: 'kf-new' as FolderId,
      name: 'Muzyka',
      areaId: 'occipital',
    });

    expect(
      (await fetchKnowledge()).folders.find((f) => f.name === 'Muzyka'),
    ).toMatchObject({ areaId: 'occipital' });
  });

  it('keeps data of one gateway apart from another', async () => {
    const base = await firstNode();
    await removeNode(base.id);

    useGateway(createMockGateway());

    expect((await fetchKnowledge()).nodes.map((n) => n.id)).toContain(base.id);
  });
});
