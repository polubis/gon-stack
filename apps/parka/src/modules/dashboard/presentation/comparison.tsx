import { categoryLabel } from '@/shared/i18n/category-label';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { money, monthLabel, percent, prevMonth } from '../domain/format';
import type { Month, Summary } from '../domain/models';
import { Card } from './layout';

export const Comparison = ({
  month,
  summary,
}: {
  month: Month;
  summary: Summary;
}) => (
  <>
    <Card className="space-y-3 lg:col-span-2">
      <h2 className="text-sm font-semibold text-ink-soft">
        Porównanie z poprzednim miesiącem
      </h2>
      <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
        <div>
          <p className="text-2xl font-bold tabular-nums">
            {money(summary.total)}
          </p>
          <p className="text-xs capitalize text-ink-soft">
            {monthLabel(month)}
          </p>
        </div>
        <div>
          <p
            className="text-2xl font-bold tabular-nums text-ink-soft"
            data-e2e="dashboard:previous-total"
          >
            {money(summary.previousTotal)}
          </p>
          <p className="text-xs capitalize text-ink-soft">
            {monthLabel(prevMonth(month))}
          </p>
        </div>
        <p
          className={cn(
            'ml-auto inline-flex items-center gap-1 text-sm font-semibold',
            summary.change <= 0 ? 'text-brand-dark' : 'text-danger-strong',
          )}
        >
          {summary.change <= 0 ? (
            <TrendingDown className="h-4 w-4" aria-hidden="true" />
          ) : (
            <TrendingUp className="h-4 w-4" aria-hidden="true" />
          )}
          {percent(summary.change)}
        </p>
      </div>
    </Card>

    <Card className="space-y-2">
      <h2 className="text-sm font-semibold text-ink-soft">Największe zmiany</h2>
      <ul className="divide-y divide-line" data-e2e="dashboard:changes">
        {summary.categoryChanges.map(({ id, name, changePct }) => (
          <li
            key={id}
            className="flex items-center justify-between py-2 text-sm"
          >
            <span>{categoryLabel(name)}</span>
            <span
              className={cn(
                'font-semibold tabular-nums',
                changePct <= 0 ? 'text-brand-dark' : 'text-danger-strong',
              )}
            >
              {percent(changePct)}
            </span>
          </li>
        ))}
        {summary.categoryChanges.length === 0 ? (
          <li className="py-2 text-sm text-ink-soft">Brak istotnych zmian.</li>
        ) : null}
      </ul>
    </Card>
  </>
);
