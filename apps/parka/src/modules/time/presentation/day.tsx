import { Fragment } from 'react';
import { Card } from '@/shared/ui/layout';
import { DAY_TASKS } from '../configuration/constraints';
import { NowMarker, nowIndexOf } from './now-marker';
import { TaskRow } from './task-row';
import { TimeScreen } from './screen';

const scheduled = DAY_TASKS.filter((task) => task.slot.kind === 'timed');
const unscheduled = DAY_TASKS.filter((task) => task.slot.kind === 'allDay');
const nowIndex = nowIndexOf(scheduled);

/** Day view: tasks with a time, then tasks without one. */
export const Main = () => (
  <TimeScreen kind="day">
    <div className="grid gap-4 lg:grid-cols-3 lg:items-start">
      <Card as="section" aria-labelledby="day-plan" className="lg:col-span-2">
        <h2 id="day-plan" className="mb-3 text-sm font-semibold">
          Zadania na dziś
        </h2>
        <ol className="flex flex-col gap-2">
          {scheduled.map((task, index) => (
            <Fragment key={task.title}>
              <TaskRow {...task} now={index === nowIndex} step={index} />
              {index === nowIndex ? <NowMarker /> : null}
            </Fragment>
          ))}
        </ol>
      </Card>
      <Card as="section" aria-labelledby="day-loose">
        <h2 id="day-loose" className="mb-1 text-sm font-semibold">
          Bez godziny
        </h2>
        <p className="mb-3 text-xs text-ink-soft">
          Do zrobienia kiedykolwiek w ciągu dnia.
        </p>
        <ul className="flex flex-col gap-2">
          {unscheduled.map((task, index) => (
            <TaskRow key={task.title} {...task} step={index} />
          ))}
        </ul>
      </Card>
    </div>
  </TimeScreen>
);
