import { describe, expect, it } from 'vitest';
import {
  areaFills,
  filterNodes,
  fillOf,
  knowledgeStats,
  nextStatus,
  parseTags,
  priorityLevel,
  sortByPriority,
} from '../domain/learning';
import type {
  Category,
  Folder,
  KnowledgeNode,
  Priority,
} from '../domain/models';

const node = (overrides: Partial<KnowledgeNode> = {}): KnowledgeNode => ({
  id: 'n-1' as KnowledgeNode['id'],
  folderId: 'f-1' as Folder['id'],
  title: 'Grafy',
  notes: null,
  categoryId: 'c-1' as Category['id'],
  priorityId: 'p-mid' as Priority['id'],
  tags: [],
  status: 'to-learn',
  ...overrides,
});

const priorities: Priority[] = [
  { id: 'p-low' as Priority['id'], name: 'Niski', value: 2 },
  { id: 'p-mid' as Priority['id'], name: 'Średni', value: 5 },
  { id: 'p-high' as Priority['id'], name: 'Wysoki', value: 9 },
];

describe('learning progress', () => {
  it('walks the statuses and wraps back to the first', () => {
    expect(nextStatus('to-learn')).toBe('learning');
    expect(nextStatus('learning')).toBe('learned');
    expect(nextStatus('learned')).toBe('to-learn');
  });

  it('counts mastered fully and studying by half', () => {
    expect(
      fillOf([node({ status: 'learned' }), node({ status: 'learning' })]),
    ).toBe(0.75);
    expect(fillOf([])).toBe(0);
  });

  it('fills only the area whose folders hold the knowledge', () => {
    const folders: Folder[] = [
      { id: 'f-1' as Folder['id'], name: 'A', areaId: 'frontal' },
      { id: 'f-2' as Folder['id'], name: 'B', areaId: 'temporal' },
    ];
    const fills = areaFills(folders, [
      node({ status: 'learned' }),
      node({ folderId: 'f-2' as Folder['id'], status: 'to-learn' }),
    ]);

    expect(fills.find((a) => a.id === 'frontal')?.fill).toBe(1);
    expect(fills.find((a) => a.id === 'temporal')?.fill).toBe(0);
    expect(fills.find((a) => a.id === 'cerebellum')?.fill).toBe(0);
  });
});

describe('priorities', () => {
  it('reads the level from the weight', () => {
    expect(priorityLevel(9)).toBe('high');
    expect(priorityLevel(5)).toBe('medium');
    expect(priorityLevel(2)).toBe('low');
  });

  it('puts the most urgent node first and keeps ties in order', () => {
    const sorted = sortByPriority(
      [
        node({
          id: 'a' as KnowledgeNode['id'],
          priorityId: 'p-low' as Priority['id'],
        }),
        node({
          id: 'b' as KnowledgeNode['id'],
          priorityId: 'p-high' as Priority['id'],
        }),
        node({
          id: 'c' as KnowledgeNode['id'],
          priorityId: 'p-high' as Priority['id'],
        }),
      ],
      priorities,
    );

    expect(sorted.map((n) => n.id)).toEqual(['b', 'c', 'a']);
  });
});

describe('search and tags', () => {
  it('finds a node by title, notes or tag, ignoring case', () => {
    const nodes = [
      node({ title: 'Grafy' }),
      node({
        id: 'n-2' as KnowledgeNode['id'],
        title: 'Inne',
        tags: ['react'],
      }),
      node({
        id: 'n-3' as KnowledgeNode['id'],
        title: 'Trzecie',
        notes: 'o REACT',
      }),
    ];

    expect(filterNodes(nodes, ' REACT ').map((n) => n.id)).toEqual([
      'n-2',
      'n-3',
    ]);
    expect(filterNodes(nodes, '')).toHaveLength(3);
  });

  it('cleans, de-duplicates and bounds tags', () => {
    expect(parseTags(' React, react ,, UX,abcdefghij', 2, 5)).toEqual([
      'react',
      'ux',
    ]);
  });
});

describe('statistics', () => {
  it('summarizes progress, categories, priorities and tags', () => {
    const categories: Category[] = [
      {
        id: 'c-1' as Category['id'],
        name: 'Kod',
        icon: 'laptop',
        color: '#000',
      },
      {
        id: 'c-2' as Category['id'],
        name: 'Puste',
        icon: 'book',
        color: '#111',
      },
    ];
    const stats = knowledgeStats(
      [
        node({ status: 'learned', tags: ['a', 'b'] }),
        node({
          id: 'n-2' as KnowledgeNode['id'],
          priorityId: 'p-high' as Priority['id'],
          tags: ['a'],
        }),
      ],
      categories,
      priorities,
    );

    expect(stats.total).toBe(2);
    expect(stats.progress).toBe(50);
    expect(stats.byStatus).toEqual({ 'to-learn': 1, learning: 0, learned: 1 });
    expect(stats.byCategory).toEqual([
      { name: 'Kod', color: '#000', count: 2 },
    ]);
    expect(stats.byPriority.find((p) => p.level === 'high')?.count).toBe(1);
    expect(stats.topTags[0]).toEqual({ tag: 'a', count: 2 });
  });
});
