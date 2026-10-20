import type { Priority } from './models';

const HIGH_FROM = 8;
const LOW_TO = 3;

export type PriorityLevel = 'low' | 'medium' | 'high';

export const priorityLabel = (priority: Priority): string =>
  `${priority.value} - ${priority.name}`;

/** high >= 8, low <= 3, medium in between. */
export const priorityLevel = (value: number): PriorityLevel =>
  value >= HIGH_FROM ? 'high' : value <= LOW_TO ? 'low' : 'medium';

/** Ascending by value, then by name. */
export const sortPriorities = (items: readonly Priority[]): Priority[] =>
  [...items].sort(
    (a, b) => a.value - b.value || a.name.localeCompare(b.name, 'pl'),
  );
