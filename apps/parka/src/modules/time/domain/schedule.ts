import { addDays, periodContaining } from '@/shared/period/period';
import type { Priority, Task, TimeKind } from './models';
import { priorityWeight } from './priority';

/**
 * Timed tasks first (by hour), then whole-day ones. Within the same hour (or
 * among whole-day tasks) the highest priority goes first, then title. Status
 * never affects order.
 */
export const sortTasks = (
  tasks: readonly Task[],
  priorities: readonly Priority[] = [],
): Task[] =>
  [...tasks].sort((a, b) => {
    if (a.at !== b.at) {
      if (a.at === null) return 1;
      if (b.at === null) return -1;
      return a.at.localeCompare(b.at);
    }
    return (
      priorityWeight(priorities, b.priorityId) -
        priorityWeight(priorities, a.priorityId) ||
      a.title.localeCompare(b.title, 'pl')
    );
  });

export const tasksOn = (
  tasks: readonly Task[],
  day: string,
  priorities: readonly Priority[],
): Task[] =>
  sortTasks(
    tasks.filter((task) => task.day === day),
    priorities,
  );

export const isTimed = (task: Task): task is Task & { at: string } =>
  task.at !== null;

/** Index of the last timed task already started at `time` (`HH:MM`), or -1. */
export const nowIndexOf = (tasks: readonly Task[], time: string): number =>
  tasks.findLastIndex((task) => task.at !== null && task.at <= time);

/** The seven days (Monday first) of the week containing `anchor`. */
export const weekDays = (anchor: string): string[] => {
  const { from } = periodContaining('week', anchor);
  return Array.from({ length: 7 }, (_, i) => addDays(from, i));
};

/** Leading empty cells and the days of the month containing `anchor`. */
export const monthGrid = (anchor: string) => {
  const { from, to } = periodContaining('month', anchor);
  const first = new Date(`${from}T00:00:00Z`);
  return {
    leadingBlanks: (first.getUTCDay() + 6) % 7,
    days: Array.from({ length: Number(to.slice(8)) }, (_, i) =>
      addDays(from, i),
    ),
  };
};

/** Task count per month (index 0 = January) of the year containing `anchor`. */
export const countsByMonth = (
  tasks: readonly Task[],
  anchor: string,
): number[] => {
  const year = anchor.slice(0, 4);
  const counts = Array.from({ length: 12 }, () => 0);
  for (const task of tasks)
    if (task.day.startsWith(year)) counts[Number(task.day.slice(5, 7)) - 1]++;
  return counts;
};

/** Hours (08..20) a week grid shows, widened by tasks outside them. */
export const gridHours = (tasks: readonly Task[]): number[] => {
  const hours = tasks
    .filter(isTimed)
    .map((task) => Number(task.at.slice(0, 2)));
  const first = Math.min(8, ...hours);
  const last = Math.max(20, ...hours);
  return Array.from({ length: last - first + 1 }, (_, i) => first + i);
};

/** First and last day (inclusive) of the period of `kind` around `anchor`. */
export const rangeOf = (kind: TimeKind, anchor: string) => {
  const { from, to } = periodContaining(kind, anchor);
  return { from, to };
};
