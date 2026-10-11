import type { ReactNode } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { Card } from '@/shared/ui/layout';
import { ProgressBar } from '@/shared/ui/controls';
import { LIMITS_SECTION_ID } from '../configuration/constraints';
import { limitForPeriod, type Period } from '@/shared/period/period';
import { money, percent } from '../domain/format';
import type { Summary } from '../domain/models';
import { LIMIT_NOUN, PERIOD_NOUN } from '../domain/period';
import { focusSection } from './focus-section';
import { limitTone } from './selectors';

const Stat = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex min-w-0 flex-col items-center gap-0.5 px-2">
    <dt className="flex min-h-8 items-end text-center text-xs text-ink-soft">
      {label}
    </dt>
    <dd className="flex min-h-10 w-full flex-col items-center text-sm font-semibold tabular-nums md:text-base">
      {children}
    </dd>
  </div>
);

/** The monthly limit scaled to the shown period; `null` when none is set. */
const scaledLimit = (summary: Summary, period: Period): number | null =>
  summary.monthlyLimit === null
    ? null
    : limitForPeriod(summary.monthlyLimit, period);

/** Over: the overshoot; otherwise what is still left. Says what it covers. */
const limitLabel = (summary: Summary, period: Period): string => {
  const limit = scaledLimit(summary, period);
  const noun = LIMIT_NOUN[period.kind];
  if (limit === null) return 'Do limitu';
  const left = limit - summary.total;
  if (left < 0) return `Ponad limit na ${noun}`;
  if (left === 0) return `Limit na ${noun} wyczerpany`;
  return limitTone((summary.total / limit) * 100) === 'warn'
    ? `Blisko limitu na ${noun}`
    : `Do limitu na ${noun}`;
};

const Limit = ({ summary, period }: { summary: Summary; period: Period }) => {
  const limit = scaledLimit(summary, period);
  if (limit === null) {
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
  const left = limit - summary.total;
  const pct = (summary.total / limit) * 100;
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
          label={`Wykorzystano ${Math.round(pct)}% limitu na ${LIMIT_NOUN[period.kind]} (${money(limit)})`}
        />
      </span>
    </span>
  );
};

export const TotalHero = ({
  period,
  summary,
}: {
  period: Period;
  summary: Summary;
}) => {
  const shown = Math.round(summary.change) !== 0;
  const up = summary.change > 0;

  return (
    <Card className="flex flex-col items-center gap-1 py-6 text-center xl:h-full xl:justify-center">
      <p className="text-xs text-ink-soft md:text-sm">
        Wydatki {PERIOD_NOUN[period.kind]}
      </p>
      <p
        data-e2e="dashboard:total"
        className="text-4xl font-bold tracking-tight tabular-nums md:text-5xl"
      >
        {money(summary.total)}
      </p>
      {shown ? (
        <p
          data-e2e="dashboard:change"
          className="flex h-5 items-center gap-1 text-sm font-medium text-ink-soft md:h-6 md:text-base"
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
      ) : (
        // Same height as the change row: the card never jumps.
        <span className="block h-5 md:h-6" aria-hidden="true" />
      )}
      <dl className="mt-4 grid w-full max-w-md grid-cols-3 divide-x divide-line border-t border-line pt-4">
        <Stat label="Średnio dziennie">
          <span data-e2e="dashboard:daily-average">
            {money(summary.dailyAverage)}
          </span>
        </Stat>
        <Stat label="Transakcje">
          <span data-e2e="dashboard:transactions">{summary.transactions}</span>
        </Stat>
        <Stat label={limitLabel(summary, period)}>
          <Limit summary={summary} period={period} />
        </Stat>
      </dl>
    </Card>
  );
};
