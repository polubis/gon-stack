import { dayLabel, monthNameLabel, weekdayLabel } from '@/shared/date/date';
import { daysBetween } from '@/shared/period/period';
import type { BacklogTask, Category, Priority, Task, TimeKind } from './models';
import { priorityLevel, priorityWeight, type PriorityLevel } from './priority';
import { gridHours, isTimed, monthGrid, rangeOf, weekDays } from './schedule';

export type StatsInput = {
  tasks: readonly Task[];
  backlog: readonly BacklogTask[];
  categories: readonly Category[];
  priorities: readonly Priority[];
  kind: TimeKind;
  /** Any day inside the viewed period. */
  anchor: string;
  today: string;
};

export type CategoryShare = {
  id: string;
  name: string;
  color: string;
  count: number;
};

export type PriorityShare = {
  level: PriorityLevel;
  count: number;
  done: number;
};

/** One bar of the chart: the day, hour or month with its tasks. */
export type Bucket = {
  key: string;
  label: string;
  title: string;
  total: number;
  done: number;
};

export type TaskStats = {
  total: number;
  done: number;
  inProgress: number;
  open: number;
  /** Not done and planned for a day before today. */
  overdue: number;
  /** Share of done tasks, whole percent (0 when there are none). */
  completion: number;
  /** Tasks per day of the period, one decimal. */
  perDay: number;
  timed: number;
  allDay: number;
  recurring: number;
  backlog: number;
  byCategory: CategoryShare[];
  byPriority: PriorityShare[];
  buckets: Bucket[];
  busiest: { day: string; count: number } | null;
  active: Task[];
};

const LEVELS: readonly PriorityLevel[] = ['high', 'medium', 'low'];

const share = (part: number, whole: number): number =>
  whole === 0 ? 0 : Math.round((part / whole) * 100);

const countBy = (tasks: readonly Task[], pick: (task: Task) => string) => {
  const counts = new Map<string, number>();
  for (const task of tasks) {
    const key = pick(task);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
};

const bucketsOf = (
  tasks: readonly Task[],
  kind: TimeKind,
  anchor: string,
): Bucket[] => {
  const fill = (
    entries: { key: string; label: string; title: string }[],
    keyOf: (task: Task) => string | null,
  ): Bucket[] =>
    entries.map((entry) => {
      const own = tasks.filter((task) => keyOf(task) === entry.key);
      return {
        ...entry,
        total: own.length,
        done: own.filter((task) => task.done).length,
      };
    });

  switch (kind) {
    case 'day':
      return fill(
        gridHours(tasks).map((hour) => {
          const key = String(hour).padStart(2, '0');
          return { key, label: key, title: `${key}:00` };
        }),
        (task) => (isTimed(task) ? task.at.slice(0, 2) : null),
      );
    case 'week':
      return fill(
        weekDays(anchor).map((day) => ({
          key: day,
          label: weekdayLabel(day),
          title: dayLabel(day, 'long', false),
        })),
        (task) => task.day,
      );
    case 'month':
      return fill(
        monthGrid(anchor).days.map((day) => ({
          key: day,
          label: String(Number(day.slice(8))),
          title: dayLabel(day, 'long', false),
        })),
        (task) => task.day,
      );
    case 'year':
      return fill(
        Array.from({ length: 12 }, (_, index) => ({
          key: String(index + 1).padStart(2, '0'),
          label: monthNameLabel(index, 'short'),
          title: monthNameLabel(index),
        })),
        (task) => task.day.slice(5, 7),
      );
  }
};

/** Everything the statistics view shows, derived from the loaded tasks. */
export const taskStats = ({
  tasks: all,
  backlog,
  categories,
  priorities,
  kind,
  anchor,
  today,
}: StatsInput): TaskStats => {
  const { from, to } = rangeOf(kind, anchor);
  const tasks = all.filter((task) => task.day >= from && task.day <= to);
  const total = tasks.length;
  const done = tasks.filter((task) => task.done).length;
  // Done wins over a stale in-progress flag: the statuses stay disjoint.
  const active = tasks.filter((task) => !task.done && task.inProgress);
  const inProgress = active.length;

  const categoryCounts = countBy(tasks, (task) => task.categoryId);
  const byCategory = categories
    .map((category) => ({
      id: category.id,
      name: category.name,
      color: category.color,
      count: categoryCounts.get(category.id) ?? 0,
    }))
    .filter((entry) => entry.count > 0)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'pl'));

  const levelOf = (task: Task): PriorityLevel => {
    const weight = priorityWeight(priorities, task.priorityId);
    return Number.isFinite(weight) ? priorityLevel(weight) : 'low';
  };
  const byPriority = LEVELS.map((level) => {
    const own = tasks.filter((task) => levelOf(task) === level);
    return {
      level,
      count: own.length,
      done: own.filter((task) => task.done).length,
    };
  });

  const dayCounts = countBy(tasks, (task) => task.day);
  const busiest = [...dayCounts.entries()].reduce<TaskStats['busiest']>(
    (best, [day, count]) =>
      !best || count > best.count || (count === best.count && day < best.day)
        ? { day, count }
        : best,
    null,
  );

  return {
    total,
    done,
    inProgress,
    open: total - done - inProgress,
    overdue: tasks.filter((task) => !task.done && task.day < today).length,
    completion: share(done, total),
    perDay: Math.round((total / (daysBetween(from, to) + 1)) * 10) / 10,
    timed: tasks.filter(isTimed).length,
    allDay: tasks.filter((task) => !isTimed(task)).length,
    recurring: tasks.filter((task) => task.recurringId !== null).length,
    backlog: backlog.length,
    byCategory,
    byPriority,
    buckets: bucketsOf(tasks, kind, anchor),
    busiest: kind === 'day' ? null : busiest,
    active,
  };
};
