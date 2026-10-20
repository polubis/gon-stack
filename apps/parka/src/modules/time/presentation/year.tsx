import { cn } from '@repo/react-kit/cn';
import { Card } from '@/shared/ui/layout';
import { MONTH_INDEX, YEAR_MONTHS } from '../configuration/constraints';
import { pluralTasks } from '../domain/plural';
import { TimeScreen } from './screen';
import { stagger } from './stagger';

const peak = Math.max(...YEAR_MONTHS.map(({ count }) => count));

/** Year view: twelve months, task count and density each. */
export const Main = () => (
  <TimeScreen kind="year">
    <ol className="grid gap-2 sm:grid-cols-2 md:gap-4 lg:grid-cols-3 xl:grid-cols-4">
      {YEAR_MONTHS.map(({ name, count }, index) => {
        const current = index === MONTH_INDEX;
        return (
          <Card
            as="li"
            key={name}
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
                {name}
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
  </TimeScreen>
);
