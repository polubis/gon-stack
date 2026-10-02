import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { Card } from '@/shared/ui/layout';
import { Skeleton } from '@/shared/ui/skeleton';
import { money, monthTitle, percent, prevMonth } from '../domain/format';
import type { Month, Summary } from '../domain/models';

const Column = ({
  label,
  value,
  max,
  current,
  'data-e2e': dataE2e,
}: {
  label: string;
  value: number;
  max: number;
  current: boolean;
  'data-e2e'?: 'dashboard:previous-total';
}) => (
  <div className="flex w-24 flex-col items-center gap-1 text-center">
    <p className="text-sm font-bold tabular-nums" data-e2e={dataE2e}>
      {money(value)}
    </p>
    <div className="flex h-24 w-full items-end">
      <div
        className={cn(
          'min-h-1 w-full rounded-t-md',
          current ? 'bg-brand' : 'bg-track-strong',
        )}
        style={{ height: `${(value / max) * 100}%` }}
      />
    </div>
    <p className="text-xs text-ink-soft">{label}</p>
  </div>
);

export const Comparison = ({
  month,
  summary,
}: {
  month: Month;
  summary: Summary | null;
}) => {
  const down = (summary?.change ?? 0) <= 0;
  const max = Math.max(1, summary?.total ?? 0, summary?.previousTotal ?? 0);

  return (
    <Card className="space-y-3">
      <h2 className="text-base font-semibold">Porównanie miesięcy</h2>
      {summary ? (
        <>
          <p
            className={cn(
              'mx-auto flex w-fit items-center gap-1 rounded-full bg-brand-softer px-3 py-1 text-sm font-semibold',
              down ? 'text-brand-dark' : 'text-danger-strong',
            )}
          >
            {down ? (
              <TrendingDown className="h-4 w-4" aria-hidden="true" />
            ) : (
              <TrendingUp className="h-4 w-4" aria-hidden="true" />
            )}
            {percent(summary.change)}
          </p>
          <div className="flex items-end justify-center gap-6">
            <Column
              label={monthTitle(month)}
              value={summary.total}
              max={max}
              current
            />
            <Column
              label={monthTitle(prevMonth(month))}
              value={summary.previousTotal}
              max={max}
              current={false}
              data-e2e="dashboard:previous-total"
            />
          </div>
        </>
      ) : (
        <Skeleton className="h-40 w-full" />
      )}
    </Card>
  );
};
