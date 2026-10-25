import { cn } from '@repo/react-kit/cn';
import { Card } from '@/shared/ui/layout';
import { WEEKDAY_SHORT } from '../configuration/constraints';
import { pluralTasks } from '../domain/plural';
import { fullDate } from '../domain/period-title';
import { monthGrid, tasksOn } from '../domain/schedule';
import { AddDayButton } from './add-day-button';
import { useContext } from './context';
import { EmptyPeriod } from './empty-period';
import { stagger } from './stagger';

const MAX_DOTS = 4;

/** Month view: calendar grid, a dot in the category colour per task. */
export const Main = () => {
  const {
    tasks,
    categories,
    priorities,
    viewAnchor: anchor,
    now,
  } = useContext();
  const { leadingBlanks, days } = monthGrid(anchor);
  if (!tasks.some((task) => days.includes(task.day)))
    return <EmptyPeriod kind="month" />;

  const colorOf = (id: string) =>
    categories.find((item) => item.id === id)?.color;

  return (
    <Card as="section" aria-label="Kalendarz zadań" className="p-2 md:p-4">
      <ul className="grid grid-cols-7 gap-1 md:gap-2" aria-hidden="true">
        {WEEKDAY_SHORT.map((day) => (
          <li key={day} className="text-center text-xs text-ink-soft">
            {day}
          </li>
        ))}
      </ul>
      <ol className="mt-1 grid grid-cols-7 gap-1 md:mt-2 md:gap-2">
        {Array.from({ length: leadingBlanks }, (_, i) => (
          <li key={`blank-${i}`} aria-hidden="true" />
        ))}
        {days.map((day, index) => {
          const marks = tasksOn(tasks, day, priorities);
          const today = day === now.day;
          return (
            <li
              key={day}
              style={stagger(Math.floor((index + leadingBlanks) / 7))}
              aria-current={today ? 'date' : undefined}
              aria-label={`${fullDate(day)}, ${marks.length ? pluralTasks(marks.length) : 'brak zadań'}`}
              className={cn(
                'flex min-h-14 min-w-0 animate-item-in flex-col items-center gap-1 rounded-lg border p-1 md:min-h-24 md:items-start md:p-2 motion-reduce:animate-none',
                today
                  ? 'border-brand bg-brand-softer font-semibold text-brand'
                  : 'border-transparent bg-hover-soft',
              )}
            >
              <span className="flex w-full items-center justify-center gap-1 md:justify-between">
                <span className="text-sm tabular-nums">
                  {Number(day.slice(8))}
                </span>
                <span className="max-md:hidden">
                  <AddDayButton day={day} />
                </span>
              </span>
              <span
                className="flex flex-wrap items-center justify-center gap-1"
                aria-hidden="true"
              >
                {marks.slice(0, MAX_DOTS).map((task) => (
                  <span
                    key={task.id}
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: colorOf(task.categoryId) }}
                  />
                ))}
                {marks.length > MAX_DOTS ? (
                  <span className="text-xs font-normal tabular-nums text-ink-soft">
                    +{marks.length - MAX_DOTS}
                  </span>
                ) : null}
              </span>
            </li>
          );
        })}
      </ol>
    </Card>
  );
};
