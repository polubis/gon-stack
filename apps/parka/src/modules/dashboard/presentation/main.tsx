import {
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Plus,
  Camera,
  Target,
  Repeat,
} from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { AppShell, Card, BarChart, Donut } from '@/modules/shared/ui';
import {
  useParkaState,
  setState,
  monthTotal,
  changeVsPrevMonth,
  categoryBreakdown,
  trend,
  monthLabel,
  prevMonth,
  nextMonth,
  money,
  percent,
} from '@/modules/shared/data';

const QUICK_ACTIONS = [
  { label: 'Dodaj paragon', href: '/receipt-scan/', icon: Plus },
  { label: 'Zrób zdjęcie', href: '/receipt-scan/', icon: Camera },
  { label: 'Limity', href: '/limits/', icon: Target },
  { label: 'Cykliczne', href: '/recurring/', icon: Repeat },
];

export const Main = () => {
  const state = useParkaState();
  const month = state.selectedMonth;
  const total = monthTotal(state, month);
  const change = changeVsPrevMonth(state, month);
  const slices = categoryBreakdown(state, [month]);
  const bars = trend(state, month, 8).map((t) => ({
    label: monthLabel(t.month).slice(0, 3),
    value: t.total,
  }));
  const down = change <= 0;

  return (
    <AppShell e2e="dashboard:main" nav="start">
      <main className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-4">
        <div>
          <p className="text-sm text-ink-soft">Cześć,</p>
          <h1 className="text-2xl font-semibold tracking-tight">
            {state.settings.profile.name.split(' ')[0]} 👋
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            Oto Twoje wydatki w tym miesiącu.
          </p>
        </div>

        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <button
              type="button"
              aria-label="Poprzedni miesiąc"
              data-e2e="dashboard:prev-month"
              onClick={() =>
                setState((p) => ({
                  ...p,
                  selectedMonth: prevMonth(p.selectedMonth),
                }))
              }
              className="grid h-8 w-8 place-items-center rounded-full text-ink-soft hover:bg-black/5"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <span
              className="text-sm font-semibold capitalize"
              data-e2e="dashboard:month-label"
            >
              {monthLabel(month)}
            </span>
            <button
              type="button"
              aria-label="Następny miesiąc"
              data-e2e="dashboard:next-month"
              onClick={() =>
                setState((p) => ({
                  ...p,
                  selectedMonth: nextMonth(p.selectedMonth),
                }))
              }
              className="grid h-8 w-8 place-items-center rounded-full text-ink-soft hover:bg-black/5"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div>
            <p
              className="text-3xl font-bold tracking-tight"
              data-e2e="dashboard:total"
            >
              {money(total)}
            </p>
            <p
              className={cn(
                'mt-1 inline-flex items-center gap-1 text-sm font-medium',
                down ? 'text-brand-dark' : 'text-rose-600',
              )}
            >
              {down ? (
                <TrendingDown className="h-4 w-4" aria-hidden="true" />
              ) : (
                <TrendingUp className="h-4 w-4" aria-hidden="true" />
              )}
              {percent(change)} vs {monthLabel(prevMonth(month))}
            </p>
          </div>

          <BarChart
            data={bars}
            caption={`Wydatki w ostatnich miesiącach do ${monthLabel(month)}`}
          />
        </Card>

        <section aria-labelledby="quick-actions" className="space-y-2">
          <h2
            id="quick-actions"
            className="text-sm font-semibold text-ink-soft"
          >
            Szybkie akcje
          </h2>
          <ul className="grid grid-cols-4 gap-2">
            {QUICK_ACTIONS.map(({ label, href, icon: Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-black/5 bg-white p-2 text-center text-[11px] font-medium text-ink-soft hover:bg-brand-softer"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-soft text-brand">
                    <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                  </span>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <Card className="space-y-3">
          <h2 className="text-sm font-semibold text-ink-soft">
            Rozkład wydatków
          </h2>
          {slices.length > 0 ? (
            <Donut
              caption={`Rozkład wydatków wg kategorii w ${monthLabel(month)}`}
              slices={slices.map((s) => ({
                label: s.category.name,
                value: s.amount,
                color: s.category.color,
              }))}
            />
          ) : (
            <p className="text-sm text-ink-soft">
              Brak wydatków w tym miesiącu.
            </p>
          )}
        </Card>
      </main>
    </AppShell>
  );
};
