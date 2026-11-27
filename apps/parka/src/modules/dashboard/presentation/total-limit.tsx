import { Gauge, Plus } from 'lucide-react';
import { Button, ProgressBar } from '@/shared/ui/controls';
import { EmptyState } from '@/shared/ui/empty-state';
import type { Period } from '@/shared/period/period';
import { money } from '../domain/format';
import type { TotalProgress } from '../domain/models';
import { LIMIT_NOUN } from '../domain/period';
import { limitTone } from './selectors';

/** The always-visible headline of the limits card. */
export const TotalLimit = ({
  progress,
  period,
  monthly,
  onSet,
}: {
  progress: TotalProgress | null;
  period: Period;
  /** The limit as set, per month; `progress` holds it scaled to the period. */
  monthly: number | undefined;
  onSet: () => void;
}) => {
  if (!progress)
    return (
      <EmptyState
        variant="card"
        data-e2e="dashboard:limit-total"
        icon={Gauge}
        title="Brak limitu miesięcznego"
        description="Ustaw łączny limit, by śledzić wszystkie wydatki."
        action={
          <Button
            variant="ghost"
            className="w-auto px-3 py-1.5"
            data-e2e="dashboard:limit-total-set"
            onClick={onSet}
          >
            <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
            Ustaw limit miesięczny
          </Button>
        }
      />
    );

  return (
    <div className="space-y-2" data-e2e="dashboard:limit-total">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-ink-soft">
            Limit na {LIMIT_NOUN[period.kind]}
          </p>
          <p className="text-2xl font-bold tabular-nums">
            {money(progress.amount)}
          </p>
          <p className="h-4 text-xs text-ink-soft">
            {period.kind !== 'month' && monthly !== undefined
              ? `z limitu miesięcznego ${money(monthly)}`
              : null}
          </p>
        </div>
      </div>
      <ProgressBar
        pct={progress.pct}
        tone={limitTone(progress.pct)}
        label={`Wykorzystano ${Math.round(progress.pct)}% limitu na ${LIMIT_NOUN[period.kind]}`}
      />
      <p className="text-sm tabular-nums text-ink-soft">
        {money(progress.spent)} · {Math.round(progress.pct)}%
      </p>
    </div>
  );
};
