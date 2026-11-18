import { Card } from '@/shared/ui/layout';
import { useListChanges } from '@/shared/ui/list-changes';
import { addDays, daysBetween } from '@/shared/period/period';
import { fullDate } from '../domain/period-title';
import { rangeOf, tasksOn } from '../domain/schedule';
import { useContext } from './context';
import { EmptyPeriod } from './empty-period';
import { TaskRow } from './task-row';

const taskKey = (task: { id: string }) => task.id;

/** One day of the range: its tasks in the chosen order, changes animate in place. */
const DaySection = ({ day }: { day: string }) => {
  const {
    visibleTasks: tasks,
    priorities,
    now,
    initializing,
    filters,
  } = useContext();
  const rows = useListChanges(
    tasksOn(tasks, day, priorities, filters.sort),
    taskKey,
    `${day}:${initializing}`,
  );
  if (rows.length === 0) return null;
  return (
    <li
      aria-current={day === now.day ? 'date' : undefined}
      data-e2e={`time:range-day:${day}`}
      className="flex flex-col gap-1"
    >
      <h2 className="border-b border-line px-2 pb-1 text-sm font-semibold first-letter:uppercase">
        {fullDate(day)}
      </h2>
      <ul className="flex flex-col">
        {rows.map(({ key, item, phase, at }) => (
          <TaskRow key={key} task={item} step={at} phase={phase} />
        ))}
      </ul>
    </li>
  );
};

/** Own range view: every day of the range that has tasks, oldest first. */
export const Main = () => {
  const { visibleTasks: tasks, anchor, rangeTo } = useContext();
  const { from, to } = rangeOf('custom', anchor, rangeTo);
  const days = Array.from({ length: daysBetween(from, to) + 1 }, (_, i) =>
    addDays(from, i),
  ).filter((day) => tasks.some((task) => task.day === day));
  if (days.length === 0) return <EmptyPeriod kind="custom" />;
  return (
    <Card as="section" aria-label="Zadania zakresu">
      <ol className="flex flex-col gap-4">
        {days.map((day) => (
          <DaySection key={day} day={day} />
        ))}
      </ol>
    </Card>
  );
};
