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

export const Kpis = ({
  month,
  summary,
}: {
  month: Month;
  summary: Summary | null;
}) => {
  const loading = !summary;
  const down = (summary?.change ?? 0) <= 0;
  const left = summary?.monthlyLimit
    ? summary.monthlyLimit - summary.total
    : null;

  return (
    <ul className="grid grid-cols-2 gap-3 md:gap-4 xl:h-full xl:grid-cols-1 xl:grid-rows-4">
      <li>
        <Kpi
          icon={Wallet}
          label="Wydatki w tym miesiącu"
          loading={loading}
          skeletonClassName="h-10 sm:h-11 md:h-12 xl:h-13"
        >
          <p data-e2e="dashboard:total">{money(summary?.total ?? 0)}</p>
          <p
            className={cn(
              'flex items-center gap-1 text-xs font-medium md:text-sm',
              down ? 'text-brand-dark' : 'text-danger-strong',
            )}
          >
            {down ? (
              <TrendingDown className="h-4 w-4" aria-hidden="true" />
            ) : (
              <TrendingUp className="h-4 w-4" aria-hidden="true" />
            )}
            {percent(summary?.change ?? 0)} vs{' '}
            {monthLabel(prevMonth(month)).split(' ')[0]}
          </p>
        </Kpi>
      </li>
      <li>
        <Kpi icon={ReceiptText} label="Liczba transakcji" loading={loading}>
          <p data-e2e="dashboard:transactions">{summary?.transactions}</p>
        </Kpi>
      </li>
      <li>
        <Kpi icon={ChartColumn} label="Średnio dziennie" loading={loading}>
          <p data-e2e="dashboard:daily-average">
            {money(summary?.dailyAverage ?? 0)}
          </p>
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
        </Kpi>
      </li>
    </ul>
  );
};
