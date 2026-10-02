import { useState, type FormEvent } from 'react';
import { Pencil } from 'lucide-react';
import { Button, Field, ProgressBar } from '@/shared/ui/controls';
import { NumberInput } from '@/shared/ui/number-input';
import { money, monthLabel } from '../domain/format';
import type { Limit, Month, TotalProgress } from '../domain/models';
import { limitTone } from './selectors';
import { useContext } from './context';

/** The always-visible headline of the limits card. */
export const TotalLimit = ({
  progress,
  month,
  onEdit,
}: {
  progress: TotalProgress | null;
  month: Month;
  onEdit: () => void;
}) => {
  if (!progress)
    return <p className="text-sm text-ink-soft">Brak zdefiniowanego limitu.</p>;

  return (
    <div className="space-y-2" data-e2e="dashboard:limit-total">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-ink-soft">Limit · {monthLabel(month)}</p>
          <p className="text-2xl font-bold tabular-nums">
            {money(progress.amount)}
          </p>
        </div>
        <Button
          variant="ghost"
          className="w-auto px-3 py-1.5"
          data-e2e="dashboard:limit-total-edit"
          onClick={onEdit}
        >
          <Pencil className="h-4 w-4" aria-hidden="true" /> Zmień
        </Button>
      </div>
      <ProgressBar
        pct={progress.pct}
        tone={limitTone(progress.pct)}
        label={`Wykorzystano ${Math.round(progress.pct)}% limitu`}
      />
      <p className="text-sm tabular-nums text-ink-soft">
        {money(progress.spent)} · {Math.round(progress.pct)}%
      </p>
    </div>
  );
};

export const TotalLimitForm = ({
  limit,
  onDone,
}: {
  limit: Limit;
  onDone: () => void;
}) => {
  const ctx = useContext();
  const [amount, setAmount] = useState(limit.amount);

  const save = (event: FormEvent) => {
    event.preventDefault();
    ctx.updateLimit({ ...limit, amount: amount || limit.amount });
    onDone();
  };

  return (
    <form onSubmit={save} className="space-y-3">
      <Field label="Nowy limit miesięczny">
        <NumberInput
          required
          value={amount}
          data-e2e="dashboard:limit-total-amount"
          onValueChange={setAmount}
        />
      </Field>
      <div className="flex gap-2">
        <Button variant="ghost" onClick={onDone}>
          Anuluj
        </Button>
        <Button type="submit" data-e2e="dashboard:limit-total-save">
          Zapisz
        </Button>
      </div>
    </form>
  );
};
