import { ChartColumn } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { APP_ROUTER } from '@/shared/router/routes';
import { Button } from '@/shared/ui/controls';
import { EmptyState } from '@/shared/ui/empty-state';
import { Card } from '@/shared/ui/layout';
import { shiftPeriod, type Period } from '@/shared/period/period';
import { CHART_TICKS } from '../configuration/constraints';
import { money } from '../domain/format';
import type { Summary } from '../domain/models';
import {
  labelledPoints,
  periodTitle,
  pointLabel,
  pointTitle,
} from '../domain/period';
import { niceStep } from './selectors';

const percentOf = (value: number, top: number): number => (value / top) * 100;

const Legend = ({ period }: { period: Period }) => (
  <ul className="flex flex-col gap-1 text-xs text-ink-soft md:flex-row md:items-center md:gap-4">
    <li className="flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full bg-brand" aria-hidden="true" />
      {periodTitle(period)}
    </li>
    <li className="flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full bg-brand/25" aria-hidden="true" />
      {periodTitle(shiftPeriod(period, -1))}
    </li>
  </ul>
);

const Chart = ({ period, summary }: { period: Period; summary: Summary }) => {
  const { series, previousSeries } = summary;
  const step = niceStep(
    Math.max(
      ...series.map((d) => d.total),
      ...previousSeries.map((d) => d.total),
    ),
    CHART_TICKS,
  );
  const top = step * CHART_TICKS;
  const ticks = Array.from({ length: CHART_TICKS + 1 }, (_, i) => i * step);

  return (
    <figure className="m-0">
      <figcaption className="sr-only">
        Wydatki w okresie {periodTitle(period)} na tle poprzedniego okresu
      </figcaption>
      <div className="flex gap-2">
        <ul
          aria-hidden="true"
          className="flex h-48 w-14 shrink-0 flex-col-reverse justify-between text-right text-xs text-ink-soft md:h-56"
        >
          {ticks.map((tick) => (
            <li key={tick} className="-my-1.5 leading-3">
              {tick} zł
            </li>
          ))}
        </ul>

        <div className="min-w-0 flex-1">
          <div className="relative h-48 md:h-56">
            <ul
              aria-hidden="true"
              className="absolute inset-0 flex flex-col-reverse justify-between"
            >
              {ticks.map((tick) => (
                <li key={tick} className="border-t border-line" />
              ))}
            </ul>
            <div className="absolute inset-0 flex items-end gap-px">
              {series.map((d) => {
                const previous =
                  previousSeries.find((p) => p.index === d.index)?.total ?? 0;
                return (
                  <div
                    key={d.index}
                    tabIndex={0}
                    role="img"
                    aria-label={`${pointTitle(period, d.index)}: ${money(d.total)}, poprzednio ${money(previous)}`}
                    className="group relative flex h-full flex-1 items-end justify-center gap-px rounded-t-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    <div
                      className={cn(
                        d.total > 0 && 'min-h-0.5',
                        'w-full max-w-5 rounded-t-sm bg-brand/70 group-hover:bg-brand',
                      )}
                      style={{ height: `${percentOf(d.total, top)}%` }}
                    />
                    <div
                      className={cn(
                        previous > 0 && 'min-h-0.5',
                        'w-full max-w-5 rounded-t-sm bg-brand/25',
                      )}
                      style={{ height: `${percentOf(previous, top)}%` }}
                    />
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute bottom-full left-1/2 z-(--z-tooltip) mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-card px-2 py-1 text-xs shadow-popover group-focus-within:block group-hover:block"
                    >
                      <span className="block text-ink-soft">
                        {pointTitle(period, d.index)}
                      </span>
                      <span className="block font-semibold">
                        {money(d.total)}
                      </span>
                      <span className="block text-ink-soft">
                        {money(previous)}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <ul
            aria-hidden="true"
            className="relative mt-1 h-4 text-xs text-ink-soft"
          >
            {labelledPoints(period.kind, series.length).map((index, i) => (
              <li
                key={index}
                className={cn(
                  'absolute -translate-x-1/2 whitespace-nowrap',
                  // Narrow screens keep every other label so none touch.
                  i % 2 === 1 && 'max-sm:hidden',
                )}
                style={{ left: `${percentOf(index - 0.5, series.length)}%` }}
              >
                {pointLabel(period, index)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </figure>
  );
};

export const SpendingChart = ({
  period,
  summary,
}: {
  period: Period;
  summary: Summary;
}) => {
  const empty = [...summary.series, ...summary.previousSeries].every(
    (d) => d.total === 0,
  );
  return (
    <Card className="space-y-4 xl:col-span-12 xl:row-start-3">
      <div className="flex flex-col items-start gap-2 md:flex-row md:items-center md:justify-between">
        <h2 className="text-base font-semibold">Wydatki w czasie</h2>
        <Legend period={period} />
      </div>
      {empty ? (
        // Same height as the chart with its labels: the card never jumps.
        <EmptyState
          variant="card"
          data-e2e="dashboard:chart-empty"
          className="h-57 md:h-61"
          icon={ChartColumn}
          title="Brak danych do wykresu"
          description={`Wykres pojawi się po dodaniu wydatków: ${periodTitle(period)}.`}
          action={
            <Button
              href={APP_ROUTER.newExpense()}
              className="w-auto px-3 py-1.5"
            >
              Dodaj wydatek
            </Button>
          }
        />
      ) : (
        <Chart period={period} summary={summary} />
      )}
    </Card>
  );
};
