import { categoryLabel } from '@/shared/i18n/category-label';
import { cn } from '@repo/react-kit/cn';
import { BarChart, Card, Donut } from '@/shared/ui';
import { RANGE_LABEL, RANGES } from '../configuration/constraints';
import { money, monthLabel } from '../domain/format';
import type { CategorySlice, Range, TrendPoint } from '../domain/models';

export const Spending = ({
  range,
  onRangeChange,
  total,
  points,
  slices,
}: {
  range: Range;
  onRangeChange: (range: Range) => void;
  total: number;
  points: TrendPoint[];
  slices: CategorySlice[];
}) => (
  <>
    <div
      className="flex gap-1 overflow-x-auto"
      role="tablist"
      aria-label="Zakres czasu"
    >
      {RANGES.map((r) => (
        <button
          key={r}
          type="button"
          role="tab"
          aria-selected={r === range}
          data-e2e={`statistics:range:${r}`}
          onClick={() => onRangeChange(r)}
          className={cn(
            'shrink-0 rounded-full px-3 py-1.5 text-sm font-medium',
            r === range
              ? 'bg-brand text-on-brand'
              : 'border border-line-strong bg-card text-ink-soft',
          )}
        >
          {RANGE_LABEL[r]}
        </button>
      ))}
    </div>

    <Card className="space-y-3">
      <div>
        <p className="text-sm text-ink-soft">
          Wydatki całkowite ({RANGE_LABEL[range]})
        </p>
        <p
          className="text-3xl font-bold tracking-tight"
          data-e2e="statistics:total"
        >
          {money(total)}
        </p>
      </div>
      <BarChart
        data={points.map((t) => ({
          label: monthLabel(t.month).slice(0, 3),
          value: t.total,
        }))}
        caption="Trend wydatków w wybranym zakresie"
        formatValue={money}
      />
    </Card>

    <Card className="space-y-3">
      <h2 className="text-sm font-semibold text-ink-soft">Kategorie</h2>
      {slices.length > 0 ? (
        <Donut
          caption="Udział kategorii w wydatkach"
          slices={slices.map((s) => ({
            label: categoryLabel(s.category.name),
            value: s.amount,
            color: s.category.color,
          }))}
        />
      ) : (
        <p className="text-sm text-ink-soft">Brak danych w tym zakresie.</p>
      )}
    </Card>
  </>
);
