import { Fragment } from 'react';
import { cn } from '@repo/react-kit/cn';
import { ALL_DAY_LABEL } from '../configuration/constraints';
import { weekdayLong, weekdayShort } from '../domain/period-title';
import {
  gridHours,
  isTimed,
  nowIndexOf,
  tasksOn,
  weekDays,
} from '../domain/schedule';
import { AddDayButton } from './add-day-button';
import { useContext } from './context';
import { EmptyPeriod } from './empty-period';
import { hourOffset, NowAxisLabel, NowLine, NowMarker } from './now-marker';
import { TaskRow } from './task-row';
import { stagger } from './stagger';

const hourLabel = (hour: number) => `${String(hour).padStart(2, '0')}:00`;

/** Short day name for sighted users, full name for screen readers. */
const DayName = ({ day }: { day: string }) => (
  <>
    <span aria-hidden="true">{weekdayShort(day)}</span>
    <span className="sr-only">{weekdayLong(day)}</span>{' '}
    <span className="font-normal text-ink-soft">{Number(day.slice(8))}</span>
  </>
);

/** Phone and tablet: one card per day, all-day chips first, then hour rows. */
const DayCards = ({ days }: { days: string[] }) => {
  const { tasks, now } = useContext();
  return (
    <ol className="grid gap-2 md:grid-cols-2 md:gap-3 xl:hidden">
      {days.map((day, dayIndex) => {
        const today = day === now.day;
        const ofDay = tasksOn(tasks, day);
        const allDay = ofDay.filter((task) => task.at === null);
        const timed = ofDay.filter(isTimed);
        const nowIndex = today ? nowIndexOf(timed, now.time) : -1;
        return (
          <li
            key={day}
            style={stagger(dayIndex)}
            aria-current={today ? 'date' : undefined}
            className={cn(
              'flex animate-item-in flex-col gap-3 rounded-2xl border bg-card p-3 shadow-card motion-reduce:animate-none',
              today ? 'border-brand' : 'border-line',
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <h2
                className={cn('text-sm font-semibold', today && 'text-brand')}
              >
                <DayName day={day} />
              </h2>
              <AddDayButton day={day} />
            </div>
            {allDay.length ? (
              <div className="flex flex-col gap-1">
                <h3
                  id={`week-all-day-${day}`}
                  className="text-xs font-medium text-ink-soft"
                >
                  {ALL_DAY_LABEL}
                </h3>
                <ul
                  aria-labelledby={`week-all-day-${day}`}
                  className="flex flex-col gap-2"
                >
                  {allDay.map((task) => (
                    <TaskRow key={task.id} task={task} />
                  ))}
                </ul>
              </div>
            ) : null}
            {timed.length ? (
              <ul className="flex flex-col gap-2">
                {timed.map((task, index) => (
                  <Fragment key={task.id}>
                    <TaskRow task={task} now={index === nowIndex} />
                    {index === nowIndex ? <NowMarker time={now.time} /> : null}
                  </Fragment>
                ))}
              </ul>
            ) : null}
            {ofDay.length === 0 ? (
              <p className="text-xs text-ink-soft">Brak zadań.</p>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
};

/** Wide screens: all-day row on top, then an hour axis with tasks at their hour. */
const HourGrid = ({ days }: { days: string[] }) => {
  const { tasks, now } = useContext();
  const timedOf = (day: string) => tasksOn(tasks, day).filter(isTimed);
  const nowHour = hourLabel(Number(now.time.slice(0, 2)));
  return (
    <div className="hidden overflow-hidden rounded-2xl border border-line bg-card shadow-card xl:block">
      <table className="w-full table-fixed border-collapse text-left">
        <caption className="sr-only">Zadania w tygodniu według godzin</caption>
        <colgroup>
          <col className="w-20" />
          {days.map((day) => (
            <col key={day} />
          ))}
        </colgroup>
        <thead>
          <tr>
            <th scope="col" className="p-2">
              <span className="sr-only">Godzina</span>
            </th>
            {days.map((day) => (
              <th
                key={day}
                scope="col"
                aria-current={day === now.day ? 'date' : undefined}
                className={cn(
                  'p-2 text-sm font-semibold',
                  day === now.day && 'bg-brand-softer text-brand',
                )}
              >
                <span className="flex items-center justify-between gap-1">
                  <span>
                    <DayName day={day} />
                  </span>
                  <AddDayButton day={day} />
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-t border-line-strong bg-hover-soft">
            <th
              scope="row"
              className="whitespace-nowrap p-1 align-top text-xs font-medium text-ink-soft"
            >
              {ALL_DAY_LABEL}
            </th>
            {days.map((day) => (
              <td key={day} className="p-1 align-top">
                <ul className="flex min-h-9 flex-col gap-2">
                  {tasksOn(tasks, day)
                    .filter((task) => task.at === null)
                    .map((task) => (
                      <TaskRow key={task.id} task={task} />
                    ))}
                </ul>
              </td>
            ))}
          </tr>
          {gridHours(tasks.filter((task) => days.includes(task.day))).map(
            (hour) => (
              <tr key={hour} className="border-t border-line">
                <th
                  scope="row"
                  className="relative p-1 align-top text-xs font-normal tabular-nums text-ink-soft"
                >
                  <time>{hourLabel(hour)}</time>
                  {hourLabel(hour) === nowHour ? (
                    <NowAxisLabel
                      offset={hourOffset(now.time)}
                      time={now.time}
                    />
                  ) : null}
                </th>
                {days.map((day) => {
                  const ofHour = timedOf(day).filter(
                    (task) =>
                      task.at.slice(0, 2) === hourLabel(hour).slice(0, 2),
                  );
                  return (
                    <td
                      key={day}
                      className={cn(
                        'relative h-12 border-l border-line p-1 align-top',
                        day === now.day && 'bg-brand-softer',
                      )}
                    >
                      {day === now.day && hourLabel(hour) === nowHour ? (
                        <NowLine offset={hourOffset(now.time)} />
                      ) : null}
                      {ofHour.length ? (
                        <ul className="flex flex-col gap-2">
                          {ofHour.map((task) => (
                            <TaskRow key={task.id} task={task} />
                          ))}
                        </ul>
                      ) : null}
                    </td>
                  );
                })}
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  );
};

/** Week view: all-day tasks apart from tasks pinned to an hour. */
export const Main = () => {
  const { tasks, viewAnchor: anchor } = useContext();
  const days = weekDays(anchor);
  if (!tasks.some((task) => days.includes(task.day)))
    return <EmptyPeriod kind="week" />;
  return (
    <>
      <DayCards days={days} />
      <HourGrid days={days} />
    </>
  );
};
