import { Fragment } from 'react';
import { Card } from '@/shared/ui/layout';
import { isTimed, nowIndexOf, tasksOn } from '../domain/schedule';
import { useContext } from './context';
import { EmptyPeriod } from './empty-period';
import { NowMarker } from './now-marker';
import { TaskRow } from './task-row';

/** Day view: tasks with a time, then tasks without one. */
export const Main = () => {
  const { tasks, priorities, viewAnchor: anchor, now } = useContext();
  const day = tasksOn(tasks, anchor, priorities);
  if (day.length === 0) return <EmptyPeriod kind="day" />;

  const scheduled = day.filter(isTimed);
  const unscheduled = day.filter((task) => task.at === null);
  const nowIndex = anchor === now.day ? nowIndexOf(scheduled, now.time) : -1;

  return (
    <Card className="mx-auto flex w-full max-w-3xl flex-col gap-3 p-2 md:p-4">
      <section aria-labelledby="day-plan" className="flex flex-col gap-1">
        <h2 id="day-plan" className="px-2 pt-1 text-sm font-semibold">
          {anchor === now.day ? 'Zadania na dziś' : 'Zadania na ten dzień'}
        </h2>
        {scheduled.length ? (
          <ol className="flex flex-col">
            {scheduled.map((task, index) => (
              <Fragment key={task.id}>
                <TaskRow task={task} now={index === nowIndex} step={index} />
                {index === nowIndex ? <NowMarker time={now.time} /> : null}
              </Fragment>
            ))}
          </ol>
        ) : null}
      </section>
      {unscheduled.length ? (
        <section aria-labelledby="day-loose" className="flex flex-col gap-1">
          {scheduled.length ? (
            <h3
              id="day-loose"
              className="border-t border-line px-2 pt-3 text-xs font-medium text-ink-soft"
            >
              Bez godziny
            </h3>
          ) : (
            <h3 id="day-loose" className="sr-only">
              Bez godziny
            </h3>
          )}
          <ul className="flex flex-col">
            {unscheduled.map((task, index) => (
              <TaskRow
                key={task.id}
                task={task}
                step={scheduled.length + index}
              />
            ))}
          </ul>
        </section>
      ) : null}
    </Card>
  );
};
