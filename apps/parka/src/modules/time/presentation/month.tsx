import { cn } from '@repo/react-kit/cn';
import { Card } from '@/shared/ui/layout';
import {
  MONTH_DAYS,
  MONTH_INDEX,
  MONTH_LEADING_BLANKS,
  MONTH_MARKS,
  MONTH_YEAR,
  MONTH_TODAY,
  TONE_DOT_CLASS,
  WEEKDAY_SHORT,
} from '../configuration/constraints';
import { pluralTasks } from '../domain/plural';
import { TimeScreen } from './screen';
import { stagger } from './stagger';

const blanks = Array.from({ length: MONTH_LEADING_BLANKS }, (_, i) => i);
const days = Array.from({ length: MONTH_DAYS }, (_, i) => i + 1);

const fullDate = new Intl.DateTimeFormat('pl', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

/** Month view: calendar grid, a dot per task. */
export const Main = () => (
  <TimeScreen kind="month">
    <Card as="section" aria-label="Kalendarz zadań" className="p-2 md:p-4">
      <ul className="grid grid-cols-7 gap-1 md:gap-2" aria-hidden="true">
        {WEEKDAY_SHORT.map((day) => (
          <li key={day} className="text-center text-xs text-ink-soft">
            {day}
          </li>
        ))}
      </ul>
      <ol className="mt-1 grid grid-cols-7 gap-1 md:mt-2 md:gap-2">
        {blanks.map((i) => (
          <li key={`blank-${i}`} aria-hidden="true" />
        ))}
        {days.map((day, index) => {
          const marks = MONTH_MARKS[day] ?? [];
          const today = day === MONTH_TODAY;
          return (
            <li
              key={day}
              style={stagger(Math.floor((index + MONTH_LEADING_BLANKS) / 7))}
              aria-current={today ? 'date' : undefined}
              aria-label={`${fullDate.format(new Date(MONTH_YEAR, MONTH_INDEX, day))}, ${marks.length ? pluralTasks(marks.length) : 'brak zadań'}`}
              className={cn(
                'flex min-h-14 animate-item-in flex-col items-center gap-1 rounded-lg border p-1 md:min-h-24 md:items-start md:p-2 motion-reduce:animate-none',
                today
                  ? 'border-brand bg-brand-softer font-semibold text-brand'
                  : 'border-line',
              )}
            >
              <span className="text-sm tabular-nums">{day}</span>
              <span
                className="flex flex-wrap justify-center gap-1"
                aria-hidden="true"
              >
                {marks.map((tone, i) => (
                  <span
                    key={i}
                    className={cn('h-2 w-2 rounded-full', TONE_DOT_CLASS[tone])}
                  />
                ))}
              </span>
            </li>
          );
        })}
      </ol>
    </Card>
  </TimeScreen>
);
