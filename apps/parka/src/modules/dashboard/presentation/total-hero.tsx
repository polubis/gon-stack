import type { ReactNode } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { Ring } from '@/shared/ui/ring';
import { LIMITS_SECTION_ID } from '../configuration/constraints';
import { limitForPeriod, type Period } from '@/shared/period/period';
import { money, percent } from '../domain/format';
import type { Summary } from '../domain/models';
import { LIMIT_NOUN, PERIOD_NOUN } from '../domain/period';
import { focusSection } from './focus-section';
import { limitTone } from './selectors';

const Stat = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex min-w-0 items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
    <dt className="min-w-0 text-xs text-on-hero-soft md:text-sm">{label}</dt>
    <dd className="shrink-0 text-sm font-semibold tabular-nums md:text-base">
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
        className="font-semibold text-accent underline"
      >
        Ustaw limit
      </a>
    );
  }
  const left = limit - summary.total;
  return (
    <span
      data-e2e="dashboard:limit-left"
      className={cn(left < 0 && 'text-hero-danger')}
    >
      {money(Math.abs(left))}
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
  const limit = scaledLimit(summary, period);
  const pct = limit === null ? null : (summary.total / limit) * 100;

  return (
    <div className="hero-card flex flex-col gap-5 rounded-4xl p-5 shadow-popover md:p-7 xl:h-full xl:justify-between">
      <div className="flex flex-col gap-1">
        <div className="flex min-h-7 items-center justify-between gap-3">
          <p className="text-sm text-on-hero-soft">
            Wydatki {PERIOD_NOUN[period.kind]}
          </p>
          {shown ? (
            <p
              data-e2e="dashboard:change"
              className="flex items-center gap-1 rounded-full bg-hero-track px-2.5 py-1 text-xs font-medium"
            >
              {up ? (
                <TrendingUp
                  className="h-3.5 w-3.5 text-hero-danger"
                  aria-hidden="true"
                />
              ) : (
                <TrendingDown
                  className="h-3.5 w-3.5 text-accent"
                  aria-hidden="true"
                />
              )}
              {percent(summary.change)}
            </p>
          ) : null}
        </div>
        <p
          data-e2e="dashboard:total"
          className="animate-rise text-5xl font-semibold tracking-tight tabular-nums motion-reduce:animate-none md:text-6xl"
        >
          {money(summary.total)}
        </p>
      </div>
      <div className="flex items-center gap-4 md:gap-6">
        {pct === null ? null : (
          <Ring
            surface="hero"
            pct={pct}
            tone={limitTone(pct)}
            label={`Wykorzystano ${Math.round(pct)}% limitu na ${LIMIT_NOUN[period.kind]} (${money(limit ?? 0)})`}
            className="size-22 md:size-28"
          />
        )}
        <dl className="min-w-0 flex-1 divide-y divide-hero-line">
          <Stat label="Średnio dziennie">
            <span data-e2e="dashboard:daily-average">
              {money(summary.dailyAverage)}
            </span>
          </Stat>
          <Stat label="Transakcje">
            <span data-e2e="dashboard:transactions">
              {summary.transactions}
            </span>
          </Stat>
          <Stat label={limitLabel(summary, period)}>
            <Limit summary={summary} period={period} />
          </Stat>
        </dl>
      </div>
    </div>
  );
};
