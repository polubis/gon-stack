import { Fragment } from 'react';
import { Card } from '@/shared/ui/layout';
import { isTimed, nowIndexOf, tasksOn } from '../domain/schedule';
import { useContext } from './context';
import { EmptyPeriod } from './empty-period';
import { NowMarker } from './now-marker';
import { TaskRow } from './task-row';

/** Day view: tasks with a time, then tasks without one. */
export const Main = () => {
  const { tasks, viewAnchor: anchor, now } = useContext();
  const day = tasksOn(tasks, anchor);
  if (day.length === 0) return <EmptyPeriod kind="day" />;

  const scheduled = day.filter(isTimed);
  const unscheduled = day.filter((task) => task.at === null);
  const nowIndex = anchor === now.day ? nowIndexOf(scheduled, now.time) : -1;

  return (
    <div className="grid gap-4 lg:grid-cols-3 lg:items-start">
      <Card as="section" aria-labelledby="day-plan" className="lg:col-span-2">
        <h2 id="day-plan" className="mb-3 text-sm font-semibold">
          {anchor === now.day ? 'Zadania na dziś' : 'Zadania na ten dzień'}
        </h2>
        {scheduled.length ? (
          <ol className="flex flex-col gap-2">
            {scheduled.map((task, index) => (
              <Fragment key={task.id}>
                <TaskRow task={task} now={index === nowIndex} step={index} />
                {index === nowIndex ? <NowMarker time={now.time} /> : null}
              </Fragment>
            ))}
          </ol>
        ) : (
          <p className="text-xs text-ink-soft">Brak zadań z godziną.</p>
        )}
      </Card>
      <Card as="section" aria-labelledby="day-loose">
        <h2 id="day-loose" className="mb-1 text-sm font-semibold">
          Bez godziny
        </h2>
        <p className="mb-3 text-xs text-ink-soft">
          Do zrobienia kiedykolwiek w ciągu dnia.
        </p>
        {unscheduled.length ? (
          <ul className="flex flex-col gap-2">
            {unscheduled.map((task, index) => (
              <TaskRow key={task.id} task={task} step={index} />
            ))}
          </ul>
        ) : (
          <p className="text-xs text-ink-soft">Brak zadań bez godziny.</p>
        )}
      </Card>
    </div>
  );
};
