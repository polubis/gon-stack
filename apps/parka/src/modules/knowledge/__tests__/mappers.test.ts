import { describe, expect, it } from 'vitest';
import { toFolder, toNode } from '../integration/mappers';

const nodeDto = (patch: Partial<Parameters<typeof toNode>[0]> = {}) => ({
  id: 'kn-1',
  folderId: 'kf-1',
  title: 'Grafy',
  notes: null,
  categoryId: 'kcat-code',
  priorityId: 'high',
  tags: ['algorytmy'],
  status: 'learning',
  ...patch,
});

describe('knowledge mappers', () => {
  it('keeps a known learning status of a node', () => {
    expect(toNode(nodeDto({ status: 'learned' })).status).toBe('learned');
  });

  it('falls back to "to learn" for a status from a newer backend', () => {
    expect(toNode(nodeDto({ status: 'mastered' })).status).toBe('to-learn');
  });

  it('keeps title, notes and tags of a node untouched', () => {
    const node = toNode(nodeDto({ notes: 'Dijkstra', tags: ['a', 'b'] }));

    expect(node).toMatchObject({
      title: 'Grafy',
      notes: 'Dijkstra',
      tags: ['a', 'b'],
    });
  });

  it('keeps a known brain area of a folder', () => {
    expect(
      toFolder({ id: 'kf-1', name: 'Sen', areaId: 'brainstem' }).areaId,
    ).toBe('brainstem');
  });

  it('falls back to the frontal lobe for an unknown brain area', () => {
    expect(
      toFolder({ id: 'kf-1', name: 'Sen', areaId: 'hippocampus' }).areaId,
    ).toBe('frontal');
  });
});
