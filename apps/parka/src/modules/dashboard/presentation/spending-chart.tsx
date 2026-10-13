import { cn } from '@repo/react-kit/cn';
import { Card } from '@/shared/ui/layout';
import { shiftPeriod, type Period } from '@/shared/period/period';
import { CHART_TICKS } from '../configuration/constraints';
import { money } from '../domain/format';
import type { Summary } from '../domain/models';
import { labelledPoints, periodTitle, pointLabel } from '../domain/period';
import { niceStep } from './selectors';

const percentOf = (value: number, top: number): number => (value / top) * 100;

const Legend = ({ period }: { period: Period }) => (
  <ul className="flex flex-col gap-1 text-xs text-ink-soft xl:flex-row xl:items-center xl:gap-4">
    <li className="flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full bg-brand" aria-hidden="true" />
      {periodTitle(period)}
    </li>
    <li className="flex items-center gap-1.5">
      <span
        className="w-4 border-t-2 border-dashed border-ink-soft"
        aria-hidden="true"
      />
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
  const linePoints = previousSeries
    .map((d, i) => `${i + 0.5},${100 - percentOf(d.total, top)}`)
    .join(' ');

  return (
    <figure className="m-0">
      <figcaption className="sr-only">
        Wydatki w okresie {periodTitle(period)} na tle poprzedniego okresu
      </figcaption>
      <div className="flex gap-2" aria-hidden="true">
        <ul className="flex h-48 w-14 shrink-0 flex-col-reverse justify-between text-right text-xs text-ink-soft md:h-56">
          {ticks.map((tick) => (
            <li key={tick} className="-my-1.5 leading-3">
              {tick} zł
            </li>
          ))}
        </ul>

        <div className="min-w-0 flex-1">
          <div className="relative h-48 md:h-56">
            <ul className="absolute inset-0 flex flex-col-reverse justify-between">
              {ticks.map((tick) => (
                <li key={tick} className="border-t border-line" />
              ))}
            </ul>
            <div className="absolute inset-0 flex items-end gap-px">
              {series.map((d) => (
                <div
                  key={d.index}
                  className="group relative flex h-full flex-1 items-end"
                >
                  <div
                    className={cn(
                      d.total > 0 && 'min-h-0.5',
                      'w-full rounded-t-sm bg-brand/70 group-hover:bg-brand',
                      series.length <= 12 && 'mx-auto max-w-10',
                    )}
                    style={{ height: `${percentOf(d.total, top)}%` }}
                  />
                  <span className="pointer-events-none absolute bottom-full left-1/2 z-(--z-tooltip) mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-card px-2 py-1 text-xs shadow-popover group-hover:block">
                    <span className="block text-ink-soft">
                      {pointLabel(period, d.index)}
                    </span>
                    <span className="font-semibold">{money(d.total)}</span>
                  </span>
                </div>
              ))}
            </div>
            <svg
              viewBox={`0 0 ${previousSeries.length} 100`}
              preserveAspectRatio="none"
              className="pointer-events-none absolute inset-0 h-full w-full text-ink-soft"
            >
              <polyline
                points={linePoints}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="4 3"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
          <ul className="relative mt-1 h-4 text-xs text-ink-soft">
            {labelledPoints(period.kind, series.length).map((index) => (
              <li
                key={index}
                className="absolute -translate-x-1/2 whitespace-nowrap"
                style={{ left: `${percentOf(index - 0.5, series.length)}%` }}
              >
                {pointLabel(period, index)}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="sr-only">
        <table>
          <caption>Wydatki w czasie</caption>
          <thead>
            <tr>
              <th scope="col">Okres</th>
              <th scope="col">Wydatki</th>
            </tr>
          </thead>
          <tbody>
            {series.map((d) => (
              <tr key={d.index}>
                <th scope="row">{pointLabel(period, d.index)}</th>
                <td>{money(d.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
}) => (
  <Card className="space-y-4 xl:col-span-12 xl:row-start-4">
    <div className="flex flex-col items-start gap-2 xl:flex-row xl:items-center xl:justify-between">
      <h2 className="text-base font-semibold">Wydatki w czasie</h2>
      <Legend period={period} />
    </div>
    <Chart period={period} summary={summary} />
  </Card>
);
