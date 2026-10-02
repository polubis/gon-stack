import type { ReactNode } from 'react';
import {
  ChartColumn,
  ReceiptText,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { Card } from '@/shared/ui/layout';
import { Skeleton } from '@/shared/ui/skeleton';
import { LIMITS_SECTION_ID } from '../configuration/constraints';
import { money, monthLabel, percent, prevMonth } from '../domain/format';
import type { Month, Summary } from '../domain/models';
import { focusSection } from './focus-section';

const Kpi = ({
  icon: Icon,
  label,
  loading,
  skeletonClassName = 'h-7 md:h-8',
  children,
}: {
  icon: LucideIcon;
  label: string;
  loading: boolean;
  skeletonClassName?: string;
  children: ReactNode;
}) => (
  <Card className="flex h-full items-center gap-3 xl:gap-4">
    <span className="hidden h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-soft text-brand sm:grid xl:h-14 xl:w-14">
      <Icon className="h-5 w-5 xl:h-6 xl:w-6" aria-hidden="true" />
    </span>
    <div className="min-w-0">
      <p className="text-xs text-ink-soft md:text-sm">{label}</p>
      {loading ? (
        <Skeleton className={cn('mt-1 w-24', skeletonClassName)} />
      ) : (
        <div className="text-base font-bold tracking-tight tabular-nums sm:text-lg xl:text-2xl">
          {children}
        </div>
      )}
    </div>
  </Card>
);

/** Relative change vs a previous value; the base's sign is ignored. */
const changeFrom = (current: number, previous: number): number =>
  previous === 0 ? 0 : ((current - previous) / Math.abs(previous)) * 100;

/** Arrow, percent change and the previous month's value. */
const Trend = ({
  month,
  change,
  previous,
  higherIsBetter = false,
  'data-e2e': dataE2e,
}: {
  month: Month;
  change: number;
  previous: string;
  higherIsBetter?: boolean;
  'data-e2e'?: 'dashboard:previous-total';
}) => {
  const down = change <= 0;
  const good = higherIsBetter ? change >= 0 : down;
  return (
    <p
      className={cn(
        'flex items-center gap-1 text-xs font-medium md:text-sm',
        good ? 'text-brand-dark' : 'text-danger-strong',
      )}
    >
      {down ? (
        <TrendingDown className="h-4 w-4" aria-hidden="true" />
      ) : (
        <TrendingUp className="h-4 w-4" aria-hidden="true" />
      )}
      {percent(change)} vs {monthLabel(prevMonth(month)).split(' ')[0]}:{' '}
      <span data-e2e={dataE2e}>{previous}</span>
    </p>
  );
};

export const Kpis = ({
  month,
  summary,
}: {
  month: Month;
  summary: Summary | null;
}) => {
  const loading = !summary;
  const left = summary?.monthlyLimit
    ? summary.monthlyLimit - summary.total
    : null;
  const previousLeft = summary?.monthlyLimit
    ? summary.monthlyLimit - summary.previousTotal
    : null;

  return (
    <ul className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
      <li>
        <Kpi
          icon={Wallet}
          label="Wydatki w tym miesiącu"
          loading={loading}
          skeletonClassName="h-10 sm:h-11 md:h-12 xl:h-13"
        >
          <p data-e2e="dashboard:total">{money(summary?.total ?? 0)}</p>
          <Trend
            month={month}
            change={summary?.change ?? 0}
            previous={money(summary?.previousTotal ?? 0)}
            data-e2e="dashboard:previous-total"
          />
        </Kpi>
      </li>
      <li>
        <Kpi icon={ReceiptText} label="Liczba transakcji" loading={loading}>
          <p data-e2e="dashboard:transactions">{summary?.transactions}</p>
          <Trend
            month={month}
            change={changeFrom(
              summary?.transactions ?? 0,
              summary?.previousTransactions ?? 0,
            )}
            previous={String(summary?.previousTransactions ?? 0)}
          />
        </Kpi>
      </li>
      <li>
        <Kpi icon={ChartColumn} label="Średnio dziennie" loading={loading}>
          <p data-e2e="dashboard:daily-average">
            {money(summary?.dailyAverage ?? 0)}
          </p>
          <Trend
            month={month}
            change={changeFrom(
              summary?.dailyAverage ?? 0,
              summary?.previousDailyAverage ?? 0,
            )}
            previous={money(summary?.previousDailyAverage ?? 0)}
          />
        </Kpi>
      </li>
      <li>
        <Kpi icon={Target} label="Pozostało do limitu" loading={loading}>
          {left === null ? (
            <a
              href={`#${LIMITS_SECTION_ID}`}
              onClick={focusSection}
              className="text-sm font-semibold text-brand-dark underline"
            >
              Ustaw limit
            </a>
          ) : (
            <p
              data-e2e="dashboard:limit-left"
              className={cn(left < 0 && 'text-danger-strong')}
            >
              {money(left)}
            </p>
          )}
          {left !== null && previousLeft !== null ? (
            <Trend
              month={month}
              change={changeFrom(left, previousLeft)}
              previous={money(previousLeft)}
              higherIsBetter
            />
          ) : null}
        </Kpi>
      </li>
    </ul>
  );
};
