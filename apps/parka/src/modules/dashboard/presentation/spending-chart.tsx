import { Card } from '@/shared/ui/layout';
import { Skeleton } from '@/shared/ui/skeleton';
import { CHART_LABEL_DAYS, CHART_TICKS } from '../configuration/constraints';
import { dayLabel, money, monthTitle, prevMonth } from '../domain/format';
import type { Month, Summary } from '../domain/models';
import { niceStep } from './selectors';

const percentOf = (value: number, top: number): number => (value / top) * 100;

const Legend = ({ month }: { month: Month }) => (
  <ul className="flex items-center gap-4 text-xs text-ink-soft">
    <li className="flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full bg-brand" aria-hidden="true" />
      {monthTitle(month)}
    </li>
    <li className="flex items-center gap-1.5">
      <span
        className="w-4 border-t-2 border-dashed border-ink-soft"
        aria-hidden="true"
      />
      {monthTitle(prevMonth(month))}
    </li>
  </ul>
);

const Chart = ({ month, summary }: { month: Month; summary: Summary }) => {
  const { daily, previousDaily } = summary;
  const step = niceStep(
    Math.max(
      ...daily.map((d) => d.total),
      ...previousDaily.map((d) => d.total),
    ),
    CHART_TICKS,
  );
  const top = step * CHART_TICKS;
  const ticks = Array.from({ length: CHART_TICKS + 1 }, (_, i) => i * step);
  const linePoints = previousDaily
    .map((d, i) => `${i + 0.5},${100 - percentOf(d.total, top)}`)
    .join(' ');

  return (
    <figure className="m-0">
      <figcaption className="sr-only">
        Wydatki dzienne w {monthTitle(month)} na tle poprzedniego miesiąca
      </figcaption>
      <div className="flex gap-2" aria-hidden="true">
        <ul className="flex h-48 w-14 shrink-0 flex-col-reverse justify-between text-right text-micro text-ink-soft md:h-56">
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
            <div className="absolute inset-0 flex items-end gap-[0.0625rem]">
              {daily.map((d) => (
                <div
                  key={d.day}
                  className="group relative flex h-full flex-1 items-end"
                >
                  <div
                    className="min-h-0.5 w-full rounded-t-sm bg-brand/70 group-hover:bg-brand"
                    style={{ height: `${percentOf(d.total, top)}%` }}
                  />
                  <span className="pointer-events-none absolute bottom-full left-1/2 z-(--z-tooltip) mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-card px-2 py-1 text-xs shadow-popover group-hover:block">
                    <span className="block text-ink-soft">
                      {dayLabel(month, d.day)}
                    </span>
                    <span className="font-semibold">{money(d.total)}</span>
                  </span>
                </div>
              ))}
            </div>
            <svg
              viewBox={`0 0 ${previousDaily.length} 100`}
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
          <ul className="relative mt-1 h-4 text-micro text-ink-soft">
            {CHART_LABEL_DAYS.filter((day) => day <= daily.length).map(
              (day) => (
                <li
                  key={day}
                  className="absolute -translate-x-1/2 whitespace-nowrap"
                  style={{ left: `${percentOf(day - 0.5, daily.length)}%` }}
                >
                  {dayLabel(month, day)}
                </li>
              ),
            )}
          </ul>
        </div>
      </div>

      <div className="sr-only">
        <table>
          <caption>Wydatki dzienne</caption>
          <thead>
            <tr>
              <th scope="col">Dzień</th>
              <th scope="col">Wydatki</th>
            </tr>
          </thead>
          <tbody>
            {daily.map((d) => (
              <tr key={d.day}>
                <th scope="row">{dayLabel(month, d.day)}</th>
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
  month,
  summary,
}: {
  month: Month;
  summary: Summary | null;
}) => (
  <Card className="space-y-4 xl:col-span-8">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="text-base font-semibold">Wydatki w czasie</h2>
      <Legend month={month} />
    </div>
    {summary ? (
      <Chart month={month} summary={summary} />
    ) : (
      <div aria-hidden="true">
        <Skeleton className="h-48 w-full md:h-56" />
        <Skeleton className="mt-1 h-4 w-full" />
      </div>
    )}
  </Card>
);
