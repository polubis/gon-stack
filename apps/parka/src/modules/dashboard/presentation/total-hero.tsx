import type { ReactNode } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { Card } from '@/shared/ui/layout';
import { ProgressBar } from '@/shared/ui/controls';
import { Skeleton } from '@/shared/ui/skeleton';
import { LIMITS_SECTION_ID } from '../configuration/constraints';
import { money, percent } from '../domain/format';
import type { Summary } from '../domain/models';
import { focusSection } from './focus-section';
import { limitTone } from './selectors';

const Stat = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex min-w-0 flex-col items-center gap-0.5 px-2">
    <dt className="text-xs text-ink-soft">{label}</dt>
    <dd className="text-sm font-semibold tabular-nums md:text-base">
      {children}
    </dd>
  </div>
);

/** Over: the overshoot; otherwise what is still left. */
const limitLabel = (summary: Summary): string => {
  if (summary.monthlyLimit === null) return 'Do limitu';
  const left = summary.monthlyLimit - summary.total;
  if (left < 0) return 'Ponad limit';
  if (left === 0) return 'Limit wyczerpany';
  return limitTone((summary.total / summary.monthlyLimit) * 100) === 'warn'
    ? 'Blisko limitu'
    : 'Do limitu';
};

const Limit = ({ summary }: { summary: Summary }) => {
  if (summary.monthlyLimit === null) {
    return (
      <a
        href={`#${LIMITS_SECTION_ID}`}
        onClick={focusSection}
        className="font-semibold text-brand-dark underline"
      >
        Ustaw limit
      </a>
    );
  }
  const left = summary.monthlyLimit - summary.total;
  const pct = (summary.total / summary.monthlyLimit) * 100;
  return (
    <span className="flex w-full flex-col items-center gap-1.5">
      <span
        data-e2e="dashboard:limit-left"
        className={cn(left < 0 && 'text-danger-strong')}
      >
        {money(Math.abs(left))}
      </span>
      <span className="block w-full max-w-24">
        <ProgressBar
          pct={pct}
          tone={limitTone(pct)}
          label={`Wykorzystano ${Math.round(pct)}% limitu`}
        />
      </span>
    </span>
  );
};

export const TotalHero = ({ summary }: { summary: Summary | null }) => {
  if (!summary) {
    return (
      <Card className="flex flex-col items-center gap-2 py-6">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-12 w-56 md:h-14" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-52" />
      </Card>
    );
  }

  const shown = Math.round(summary.change) !== 0;
  const up = summary.change > 0;

  return (
    <Card className="flex flex-col items-center gap-1 py-6 text-center">
      <p className="text-xs text-ink-soft md:text-sm">Wydatki w tym miesiącu</p>
      <p
        data-e2e="dashboard:total"
        className="text-4xl font-bold tracking-tight tabular-nums md:text-5xl"
      >
        {money(summary.total)}
      </p>
      {shown ? (
        <p
          data-e2e="dashboard:change"
          className="flex items-center gap-1 text-sm font-medium text-ink-soft md:text-base"
        >
          {up ? (
            <TrendingUp
              className="h-4 w-4 text-danger-strong"
              aria-hidden="true"
            />
          ) : (
            <TrendingDown
              className="h-4 w-4 text-brand-dark"
              aria-hidden="true"
            />
          )}
          {percent(summary.change)}
        </p>
      ) : null}
      <dl className="mt-4 grid w-full max-w-md grid-cols-3 divide-x divide-line border-t border-line pt-4">
        <Stat label="Średnio dziennie">
          <span data-e2e="dashboard:daily-average">
            {money(summary.dailyAverage)}
          </span>
        </Stat>
        <Stat label="Transakcje">
          <span data-e2e="dashboard:transactions">{summary.transactions}</span>
        </Stat>
        <Stat label={limitLabel(summary)}>
          <Limit summary={summary} />
        </Stat>
      </dl>
    </Card>
  );
};
