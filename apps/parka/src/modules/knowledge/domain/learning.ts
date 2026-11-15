import { BRAIN_AREAS, type BrainAreaId } from './brain-area';
import type {
  Category,
  Folder,
  KnowledgeNode,
  LearnStatus,
  Priority,
  PriorityId,
} from './models';

export const STATUS_ORDER: readonly LearnStatus[] = [
  'to-learn',
  'learning',
  'learned',
];

export const STATUS_NAMES: Record<LearnStatus, string> = {
  'to-learn': 'Do nauki',
  learning: 'W nauce',
  learned: 'Opanowane',
};

/** How much of a node already sits in the brain. */
const WEIGHT: Record<LearnStatus, number> = {
  'to-learn': 0,
  learning: 0.5,
  learned: 1,
};

/** The next step of learning, then back to the first. */
export const nextStatus = (status: LearnStatus): LearnStatus =>
  STATUS_ORDER[(STATUS_ORDER.indexOf(status) + 1) % STATUS_ORDER.length]!;

export type PriorityLevel = 'low' | 'medium' | 'high';

/** high >= 8, low <= 3, medium in between. */
export const priorityLevel = (value: number): PriorityLevel =>
  value >= 8 ? 'high' : value <= 3 ? 'low' : 'medium';

export const priorityLabel = (priority: Priority): string =>
  `${priority.value} - ${priority.name}`;

const weightOf = (priorities: readonly Priority[], id: PriorityId): number =>
  priorities.find((p) => p.id === id)?.value ?? -Infinity;

/** Most urgent to learn first; ties keep the stored order. */
export const sortByPriority = (
  nodes: readonly KnowledgeNode[],
  priorities: readonly Priority[],
): KnowledgeNode[] =>
  [...nodes].sort(
    (a, b) =>
      weightOf(priorities, b.priorityId) - weightOf(priorities, a.priorityId),
  );

/** 0..1: how full the given nodes make a brain (mastered 1, studying half). */
export const fillOf = (nodes: readonly KnowledgeNode[]): number =>
  nodes.length === 0
    ? 0
    : nodes.reduce((sum, n) => sum + WEIGHT[n.status], 0) / nodes.length;

/** Fill of each brain area: its folders' nodes together. Empty area stays 0. */
export const areaFills = (
  folders: readonly Folder[],
  nodes: readonly KnowledgeNode[],
): { id: BrainAreaId; fill: number }[] =>
  BRAIN_AREAS.map(({ id }) => {
    const folderIds = new Set(
      folders.filter((f) => f.areaId === id).map((f) => f.id),
    );
    return {
      id,
      fill: fillOf(nodes.filter((n) => folderIds.has(n.folderId))),
    };
  });

export type KnowledgeStats = {
  total: number;
  /** 0..100 */
  progress: number;
  byStatus: Record<LearnStatus, number>;
  byCategory: { name: string; color: string; count: number }[];
  byPriority: { level: PriorityLevel; count: number; learned: number }[];
  topTags: { tag: string; count: number }[];
};

export const knowledgeStats = (
  nodes: readonly KnowledgeNode[],
  categories: readonly Category[],
  priorities: readonly Priority[],
): KnowledgeStats => {
  const byStatus: Record<LearnStatus, number> = {
    'to-learn': 0,
    learning: 0,
    learned: 0,
  };
  nodes.forEach((n) => (byStatus[n.status] += 1));
  const levels: PriorityLevel[] = ['high', 'medium', 'low'];
  const tags = new Map<string, number>();
  nodes.forEach((n) =>
    n.tags.forEach((tag) => tags.set(tag, (tags.get(tag) ?? 0) + 1)),
  );
  return {
    total: nodes.length,
    progress: Math.round(fillOf(nodes) * 100),
    byStatus,
    byCategory: categories
      .map(({ id, name, color }) => ({
        name,
        color,
        count: nodes.filter((n) => n.categoryId === id).length,
      }))
      .filter((c) => c.count > 0),
    byPriority: levels.map((level) => {
      const inLevel = nodes.filter(
        (n) =>
          priorityLevel(
            priorities.find((p) => p.id === n.priorityId)?.value ?? 5,
          ) === level,
      );
      return {
        level,
        count: inLevel.length,
        learned: inLevel.filter((n) => n.status === 'learned').length,
      };
    }),
    topTags: [...tags]
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
      .slice(0, 6),
  };
};

/** Lower-cased text a search looks through. */
const haystack = (node: KnowledgeNode): string =>
  [node.title, node.notes ?? '', ...node.tags].join(' ').toLowerCase();

/** Nodes matching the phrase and (when set) living in the given area. */
export const filterNodes = (
  nodes: readonly KnowledgeNode[],
  query: string,
): KnowledgeNode[] => {
  const phrase = query.trim().toLowerCase();
  return phrase
    ? nodes.filter((n) => haystack(n).includes(phrase))
    : [...nodes];
};

/** Splits a comma list into clean, unique, bounded tags. */
export const parseTags = (value: string, max: number, length: number) =>
  [
    ...new Set(
      value
        .split(',')
        .map((tag) => tag.trim().toLowerCase().slice(0, length))
        .filter(Boolean),
    ),
  ].slice(0, max);
