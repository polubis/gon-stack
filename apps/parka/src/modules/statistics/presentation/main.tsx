import { useState } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import {
  AppShell,
  Card,
  Segmented,
  BarChart,
  Donut,
} from '@/modules/shared/ui';
import {
  useParkaState,
  monthTotal,
  changeVsPrevMonth,
  categoryBreakdown,
  biggestChanges,
  trend,
  monthsEndingAt,
  monthLabel,
  prevMonth,
  money,
  percent,
} from '@/modules/shared/data';

type Range = '1' | '3' | '6' | '12';
type Tab = 'spending' | 'comparison';

const RANGE_LABEL: Record<Range, string> = {
  '1': 'Miesiąc',
  '3': '3 miesiące',
  '6': '6 miesięcy',
  '12': 'Rok',
};

export const Main = () => {
  const state = useParkaState();
  const month = state.selectedMonth;
  const [tab, setTab] = useState<Tab>('spending');
  const [range, setRange] = useState<Range>('3');

  const count = Number(range);
  const months = monthsEndingAt(month, count);
  const rangeTotal = months.reduce((s, m) => s + monthTotal(state, m), 0);
  const slices = categoryBreakdown(state, months);
  const bars = trend(state, month, count).map((t) => ({
    label: monthLabel(t.month).slice(0, 3),
    value: t.total,
  }));

  const current = monthTotal(state, month);
  const previous = monthTotal(state, prevMonth(month));
  const monthChange = changeVsPrevMonth(state, month);
  const changes = biggestChanges(state, month);

  return (
    <AppShell e2e="statistics:main" nav="stats" title="Statystyki">
      <main className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-2">
        <Segmented<Tab>
          label="Widok statystyk"
          value={tab}
          onChange={setTab}
          options={[
            { value: 'spending', label: 'Wydatki' },
            { value: 'comparison', label: 'Porównanie' },
          ]}
        />

        {tab === 'spending' ? (
          <>
            <div
              className="flex gap-1 overflow-x-auto"
              role="tablist"
              aria-label="Zakres czasu"
            >
              {(Object.keys(RANGE_LABEL) as Range[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  role="tab"
                  aria-selected={r === range}
                  data-e2e="statistics:range"
                  onClick={() => setRange(r)}
                  className={cn(
                    'shrink-0 rounded-full px-3 py-1.5 text-sm font-medium',
                    r === range
                      ? 'bg-brand text-white'
                      : 'bg-white text-ink-soft border border-black/10',
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
                  {money(rangeTotal)}
                </p>
              </div>
              <BarChart
                data={bars}
                caption="Trend wydatków w wybranym zakresie"
              />
            </Card>

            <Card className="space-y-3">
              <h2 className="text-sm font-semibold text-ink-soft">Kategorie</h2>
              {slices.length > 0 ? (
                <Donut
                  caption="Udział kategorii w wydatkach"
                  slices={slices.map((s) => ({
                    label: s.category.name,
                    value: s.amount,
                    color: s.category.color,
                  }))}
                />
              ) : (
                <p className="text-sm text-ink-soft">
                  Brak danych w tym zakresie.
                </p>
              )}
            </Card>
          </>
        ) : (
          <>
            <Card className="space-y-3">
              <h2 className="text-sm font-semibold text-ink-soft">
                Wydatki całkowite
              </h2>
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
                    monthChange <= 0 ? 'text-brand-dark' : 'text-rose-600',
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
              <h2 className="text-sm font-semibold text-ink-soft">
                Największe zmiany
              </h2>
              <ul
                className="divide-y divide-black/5"
                data-e2e="statistics:changes"
              >
                {changes.map(({ category, changePct }) => (
                  <li
                    key={category.id}
                    className="flex items-center justify-between py-2 text-sm"
                  >
                    <span>{category.name}</span>
                    <span
                      className={cn(
                        'font-semibold tabular-nums',
                        changePct <= 0 ? 'text-brand-dark' : 'text-rose-600',
                      )}
                    >
                      {percent(changePct)}
                    </span>
                  </li>
                ))}
                {changes.length === 0 ? (
                  <li className="py-2 text-sm text-ink-soft">
                    Brak istotnych zmian.
                  </li>
                ) : null}
              </ul>
            </Card>
          </>
        )}
      </main>
    </AppShell>
  );
};
