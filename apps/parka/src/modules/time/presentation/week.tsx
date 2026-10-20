import { Fragment } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import {
  ALL_DAY_LABEL,
  NOW_HOUR_LABEL,
  NOW_HOUR_OFFSET,
  TONE_CLASS,
  WEEK_DAYS,
  WEEK_HOURS,
  type Task,
  type TimedTask,
} from '../configuration/constraints';
import { NowAxisLabel, NowLine, NowMarker, nowIndexOf } from './now-marker';
import { TaskRow } from './task-row';
import { TimeScreen } from './screen';
import { stagger } from './stagger';

type Day = (typeof WEEK_DAYS)[number];

const hourLabel = (hour: number) => `${String(hour).padStart(2, '0')}:00`;

const allDayOf = (day: Day) =>
  day.tasks.filter((task) => task.slot.kind === 'allDay');
const timedOf = (day: Day) =>
  day.tasks.filter((task): task is TimedTask => task.slot.kind === 'timed');

/** Short day name for sighted users, full name for screen readers. */
const DayName = ({ day }: { day: Day }) => (
  <>
    <span aria-hidden="true">{day.day}</span>
    <span className="sr-only">{day.name}</span>{' '}
    <span className="font-normal text-ink-soft">{day.date}</span>
  </>
);

/** Tinted block used inside the hour grid; tone + done state, never colour alone. */
const Chip = ({ task }: { task: Task }) => (
  <p
    className={cn(
      'flex items-start gap-1 rounded-lg px-2 py-1 text-xs font-medium',
      TONE_CLASS[task.tone],
      task.done && 'line-through',
    )}
  >
    {task.done ? (
      <>
        <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
        <span className="sr-only">Zrobione: </span>
      </>
    ) : null}
    <span className="min-w-0 break-words">{task.title}</span>
  </p>
);

/** Phone and tablet: one card per day, all-day chips first, then hour rows. */
const DayCards = () => (
  <ol className="grid gap-2 md:grid-cols-2 md:gap-3 xl:hidden">
    {WEEK_DAYS.map((day, dayIndex) => {
      const allDay = allDayOf(day);
      const timed = timedOf(day);
      const nowIndex = day.today ? nowIndexOf(timed) : -1;
      return (
        <li
          key={day.day}
          style={stagger(dayIndex)}
          aria-current={day.today ? 'date' : undefined}
          className={cn(
            'flex animate-item-in flex-col gap-3 rounded-2xl border bg-card p-3 shadow-card motion-reduce:animate-none',
            day.today ? 'border-brand' : 'border-line',
          )}
        >
          <h2
            className={cn('text-sm font-semibold', day.today && 'text-brand')}
          >
            <DayName day={day} />
          </h2>
          {allDay.length ? (
            <div className="flex flex-col gap-1">
              <h3
                id={`week-all-day-${day.day}`}
                className="text-xs font-medium text-ink-soft"
              >
                {ALL_DAY_LABEL}
              </h3>
              <ul
                aria-labelledby={`week-all-day-${day.day}`}
                className="flex flex-wrap gap-1"
              >
                {allDay.map((task) => (
                  <li key={task.title}>
                    <Chip task={task} />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {timed.length ? (
            <ul className="flex flex-col gap-2">
              {timed.map((task, index) => (
                <Fragment key={task.title}>
                  <TaskRow {...task} now={index === nowIndex} />
                  {index === nowIndex ? <NowMarker /> : null}
                </Fragment>
              ))}
            </ul>
          ) : null}
          {allDay.length + timed.length === 0 ? (
            <p className="text-xs text-ink-soft">Brak zadań.</p>
          ) : null}
        </li>
      );
    })}
  </ol>
);

/** Wide screens: all-day row on top, then an hour axis with tasks at their hour. */
const HourGrid = () => (
  <div className="hidden overflow-hidden rounded-2xl border border-line bg-card shadow-card xl:block">
    <table className="w-full table-fixed border-collapse text-left">
      <caption className="sr-only">Zadania w tygodniu według godzin</caption>
      <colgroup>
        <col className="w-20" />
        {WEEK_DAYS.map((day) => (
          <col key={day.day} />
        ))}
      </colgroup>
      <thead>
        <tr>
          <th scope="col" className="p-2">
            <span className="sr-only">Godzina</span>
          </th>
          {WEEK_DAYS.map((day) => (
            <th
              key={day.day}
              scope="col"
              aria-current={day.today ? 'date' : undefined}
              className={cn(
                'p-2 text-sm font-semibold',
                day.today && 'bg-brand-softer text-brand',
              )}
            >
              <DayName day={day} />
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
          {WEEK_DAYS.map((day) => (
            <td key={day.day} className="p-1 align-top">
              <ul className="flex min-h-9 flex-col gap-1">
                {allDayOf(day).map((task) => (
                  <li key={task.title}>
                    <Chip task={task} />
                  </li>
                ))}
              </ul>
            </td>
          ))}
        </tr>
        {WEEK_HOURS.map((hour) => (
          <tr key={hour} className="border-t border-line">
            <th
              scope="row"
              className="relative p-1 align-top text-xs font-normal tabular-nums text-ink-soft"
            >
              <time>{hourLabel(hour)}</time>
              {hourLabel(hour) === NOW_HOUR_LABEL ? (
                <NowAxisLabel offset={NOW_HOUR_OFFSET} />
              ) : null}
            </th>
            {WEEK_DAYS.map((day) => {
              const tasks = timedOf(day).filter(
                (task) => task.slot.at === hourLabel(hour),
              );
              return (
                <td
                  key={day.day}
                  className={cn(
                    'relative h-12 border-l border-line p-1 align-top',
                    day.today && 'bg-brand-softer',
                  )}
                >
                  {day.today && hourLabel(hour) === NOW_HOUR_LABEL ? (
                    <NowLine offset={NOW_HOUR_OFFSET} />
                  ) : null}
                  {tasks.length ? (
                    <ul className="flex flex-col gap-1">
                      {tasks.map((task) => (
                        <li key={task.title}>
                          <Chip task={task} />
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/** Week view: all-day tasks apart from tasks pinned to an hour. */
export const Main = () => (
  <TimeScreen kind="week">
    <DayCards />
    <HourGrid />
  </TimeScreen>
);
