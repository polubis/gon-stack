import type { Priority, PriorityId } from './models';

const HIGH_FROM = 8;
const LOW_TO = 3;

export type PriorityLevel = 'low' | 'medium' | 'high';

export const priorityLabel = (priority: Priority): string =>
  `${priority.value} - ${priority.name}`;

/** high >= 8, low <= 3, medium in between. */
export const priorityLevel = (value: number): PriorityLevel =>
  value >= HIGH_FROM ? 'high' : value <= LOW_TO ? 'low' : 'medium';

/** Descending by value; ties keep the incoming order (stable sort). */
export const sortPriorities = (items: readonly Priority[]): Priority[] =>
  [...items].sort((a, b) => b.value - a.value);

/** Weight of a priority id; unknown ids weigh least. */
export const priorityWeight = (
  priorities: readonly Priority[],
  id: PriorityId,
): number => priorities.find((p) => p.id === id)?.value ?? -Infinity;

/** Highest priority first; ties keep the incoming order (stable sort). */
export const sortByPriority = <T extends { priorityId: PriorityId }>(
  items: readonly T[],
  priorities: readonly Priority[],
): T[] =>
  [...items].sort(
    (a, b) =>
      priorityWeight(priorities, b.priorityId) -
      priorityWeight(priorities, a.priorityId),
  );
