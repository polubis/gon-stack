import { categoryLabel } from '@/shared/i18n/category-label';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { Card } from '@/shared/ui';
import { money, monthLabel, percent, prevMonth } from '../domain/format';
import type { CategoryChange, Month } from '../domain/models';

export const Comparison = ({
  month,
  current,
  previous,
  monthChange,
  changes,
}: {
  month: Month;
  current: number;
  previous: number;
  monthChange: number;
  changes: CategoryChange[];
}) => (
  <>
    <Card className="space-y-3">
      <h2 className="text-sm font-semibold text-ink-soft">Wydatki całkowite</h2>
      <div className="flex items-end gap-4">
        <div>
          <p
            className="text-2xl font-bold tabular-nums"
            data-e2e="statistics:current"
          >
            {money(current)}
          </p>
          <p className="text-xs capitalize text-ink-soft">
            {monthLabel(month)}
          </p>
        </div>
        <div>
          <p className="text-2xl font-bold tabular-nums text-ink-soft">
            {money(previous)}
          </p>
          <p className="text-xs capitalize text-ink-soft">
            {monthLabel(prevMonth(month))}
          </p>
        </div>
        <p
          className={cn(
            'ml-auto inline-flex items-center gap-1 text-sm font-semibold',
            monthChange <= 0 ? 'text-brand-dark' : 'text-danger-strong',
          )}
        >
          {monthChange <= 0 ? (
            <TrendingDown className="h-4 w-4" aria-hidden="true" />
          ) : (
            <TrendingUp className="h-4 w-4" aria-hidden="true" />
          )}
          {percent(monthChange)}
        </p>
      </div>
    </Card>

    <Card className="space-y-2">
      <h2 className="text-sm font-semibold text-ink-soft">Największe zmiany</h2>
      <ul className="divide-y divide-line" data-e2e="statistics:changes">
        {changes.map(({ category, changePct }) => (
          <li
            key={category.id}
            className="flex items-center justify-between py-2 text-sm"
          >
            <span>{categoryLabel(category.name)}</span>
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
        {changes.length === 0 ? (
          <li className="py-2 text-sm text-ink-soft">Brak istotnych zmian.</li>
        ) : null}
      </ul>
    </Card>
  </>
);
