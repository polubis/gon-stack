import { useListChanges } from '@/shared/ui/list-changes';
import { Card } from '@/shared/ui/layout';
import { isTimed, nowIndexOf, tasksOn } from '../domain/schedule';
import { useContext } from './context';
import { EmptyPeriod } from './empty-period';
import { TaskGroups } from './task-groups';

const taskKey = (task: { id: string }) => task.id;

/** Day view: regular and recurring tasks in two tiles, each split per category. */
export const Main = () => {
  const {
    visibleTasks: tasks,
    priorities,
    anchor,
    now,
    initializing,
    filters,
  } = useContext();
  const scope = `${anchor}:${initializing}`;
  const day = tasksOn(tasks, anchor, priorities, filters.sort);
  const nowTask =
    anchor === now.day && filters.sort === 'time'
      ? day.filter(isTimed)[nowIndexOf(day.filter(isTimed), now.time)]
      : undefined;
  const regular = useListChanges(
    day.filter((task) => task.recurringId === null),
    taskKey,
    scope,
  );
  const recurring = useListChanges(
    day.filter((task) => task.recurringId !== null),
    taskKey,
    scope,
  );
  // Rows include the one still leaving: the empty state waits for its exit.
  if (regular.length + recurring.length === 0)
    return <EmptyPeriod kind="day" />;

  return (
    <div className="flex w-full flex-col gap-3">
      {regular.length ? (
        <Card as="section" aria-labelledby="day-plan">
          <h2 id="day-plan" className="text-base font-semibold">
            {anchor === now.day ? 'Zadania na dziś' : 'Zadania na ten dzień'}
          </h2>
          <TaskGroups
            data-e2e="time:task-list:regular"
            rows={regular}
            nowId={nowTask?.id}
            firstStep={0}
          />
        </Card>
      ) : null}
      {recurring.length ? (
        <Card as="section" aria-labelledby="day-recurring">
          <h2 id="day-recurring" className="text-base font-semibold">
            Zadania cykliczne
          </h2>
          <TaskGroups
            data-e2e="time:task-list:recurring"
            rows={recurring}
            nowId={nowTask?.id}
            firstStep={regular.length}
          />
        </Card>
      ) : null}
    </div>
  );
};
