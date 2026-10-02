import { ProgressBar } from '@/shared/ui/controls';
import { money } from '../domain/format';
import type { Goal } from '../domain/models';
import { goalPct } from './selectors';

export const GoalsTab = ({ goals }: { goals: Goal[] }) =>
  goals.length === 0 ? (
    <p className="text-sm text-ink-soft">Brak celów oszczędnościowych.</p>
  ) : (
    <ul
      className="grid gap-3 md:grid-cols-2 xl:grid-cols-1"
      data-e2e="dashboard:goal-list"
    >
      {goals.map((g) => {
        const pct = goalPct(g);
        return (
          <li
            key={g.id}
            className="space-y-2 rounded-xl border border-line p-3"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium">{g.name}</span>
              <span className="shrink-0 text-sm tabular-nums">
                {money(g.saved)} / {money(g.target)}
              </span>
            </div>
            <ProgressBar pct={pct} label={`${g.name}: ${Math.round(pct)}%`} />
            <p className="text-xs text-ink-soft">
              {Math.round(pct)}% · {g.months} mies.
            </p>
          </li>
        );
      })}
    </ul>
  );
