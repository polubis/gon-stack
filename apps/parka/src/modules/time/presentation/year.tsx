import { cn } from '@repo/react-kit/cn';
import { Card } from '@/shared/ui/layout';
import { pluralTasks } from '../domain/plural';
import { monthName } from '../domain/period-title';
import { countsByMonth } from '../domain/schedule';
import { useContext } from './context';
import { EmptyPeriod } from './empty-period';
import { stagger } from './stagger';

/** Year view: twelve months, task count and density each. */
export const Main = () => {
  const { tasks, viewAnchor: anchor, now } = useContext();
  const counts = countsByMonth(tasks, anchor);
  const peak = Math.max(...counts);
  if (peak === 0) return <EmptyPeriod kind="year" />;

  const currentMonth =
    now.day.slice(0, 4) === anchor.slice(0, 4)
      ? Number(now.day.slice(5, 7)) - 1
      : -1;

  return (
    <ol className="grid gap-2 sm:grid-cols-2 md:gap-4 lg:grid-cols-3 xl:grid-cols-4">
      {counts.map((count, index) => {
        const current = index === currentMonth;
        return (
          <Card
            as="li"
            key={index}
            style={stagger(index)}
            aria-current={current ? 'date' : undefined}
            className={cn(
              'flex animate-item-in flex-col gap-2 motion-reduce:animate-none',
              current && 'border-brand bg-brand-softer',
            )}
          >
            <div className="flex items-baseline justify-between gap-2">
              <h2
                className={cn('text-sm font-semibold', current && 'text-brand')}
              >
                {monthName(index)}
              </h2>
              <p className="text-xs tabular-nums text-ink-soft">
                {pluralTasks(count)}
              </p>
            </div>
            <div
              aria-hidden="true"
              className="h-2 w-full overflow-hidden rounded-full bg-track"
            >
              <div
                className="h-full rounded-full bg-brand"
                style={{ width: `${(count / peak) * 100}%` }}
              />
            </div>
          </Card>
        );
      })}
    </ol>
  );
};
