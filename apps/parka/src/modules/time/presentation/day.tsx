import { Fragment } from 'react';
import { useListChanges } from '@/shared/ui/list-changes';
import { Card } from '@/shared/ui/layout';
import { isTimed, nowIndexOf, tasksOn } from '../domain/schedule';
import { useContext } from './context';
import { EmptyPeriod } from './empty-period';
import { NowMarker } from './now-marker';
import { TaskRow } from './task-row';

const taskKey = (task: { id: string }) => task.id;

/** Day view: tasks with a time, then tasks without one. */
export const Main = () => {
  const {
    tasks,
    priorities,
    viewAnchor: anchor,
    now,
    initializing,
  } = useContext();
  const scope = `${anchor}:${initializing}`;
  const day = tasksOn(tasks, anchor, priorities);
  const scheduled = day.filter(isTimed);
  const unscheduled = day.filter((task) => task.at === null);
  const scheduledRows = useListChanges(scheduled, taskKey, scope);
  const unscheduledRows = useListChanges(unscheduled, taskKey, scope);
  if (day.length === 0) return <EmptyPeriod kind="day" />;

  const nowIndex = anchor === now.day ? nowIndexOf(scheduled, now.time) : -1;

  return (
    <Card className="mx-auto flex w-full max-w-3xl flex-col gap-3 p-2 md:p-4">
      <section aria-labelledby="day-plan" className="flex flex-col gap-1">
        <h2 id="day-plan" className="px-2 pt-1 text-sm font-semibold">
          {anchor === now.day ? 'Zadania na dziś' : 'Zadania na ten dzień'}
        </h2>
        {scheduledRows.length ? (
          <ol className="flex flex-col">
            {scheduledRows.map(({ key, item, phase, at }) => (
              <Fragment key={key}>
                <TaskRow
                  task={item}
                  now={at >= 0 && at === nowIndex}
                  step={at}
                  phase={phase}
                />
                {at >= 0 && at === nowIndex ? (
                  <NowMarker time={now.time} />
                ) : null}
              </Fragment>
            ))}
          </ol>
        ) : null}
      </section>
      {unscheduledRows.length ? (
        <section aria-labelledby="day-loose" className="flex flex-col gap-1">
          {scheduledRows.length ? (
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
            {unscheduledRows.map(({ key, item, phase, at }) => (
              <TaskRow
                key={key}
                task={item}
                step={scheduled.length + at}
                phase={phase}
              />
            ))}
          </ul>
        </section>
      ) : null}
    </Card>
  );
};
