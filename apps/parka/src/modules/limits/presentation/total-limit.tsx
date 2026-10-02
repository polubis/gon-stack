import { useState } from 'react';
import { Button, Field, ProgressBar } from '@/shared/ui/controls';
import { Card } from '@/shared/ui/layout';
import { NumberInput } from '@/shared/ui/number-input';
import { money, monthLabel } from '../domain/format';
import type { Limit, Month, TotalProgress } from '../domain/models';
import { tone } from './selectors';
import { useContext } from './context';

export const TotalLimit = ({
  limit,
  progress,
  month,
}: {
  limit: Limit | undefined;
  progress: TotalProgress | null;
  month: Month;
}) => {
  const ctx = useContext();
  const [editing, setEditing] = useState(false);
  const [amount, setAmount] = useState(progress?.amount ?? 0);

  if (!limit || !progress)
    return <p className="text-sm text-ink-soft">Brak zdefiniowanego limitu.</p>;

  const save = () => {
    ctx.updateLimit({ ...limit, amount: amount || limit.amount });
    setEditing(false);
  };

  return (
    <Card
      className="space-y-3 md:max-w-2xl md:space-y-4 md:p-6"
      data-e2e="limits:total"
    >
      <div>
        <p className="text-sm text-ink-soft">
          Limit miesięczny · {monthLabel(month)}
        </p>
        <p className="text-2xl font-bold tabular-nums">
          {money(progress.amount)}
        </p>
      </div>
      <ProgressBar
        pct={progress.pct}
        tone={tone(progress.pct)}
        label={`Wykorzystano ${Math.round(progress.pct)}% limitu`}
      />
      <p className="text-sm tabular-nums text-ink-soft">
        {money(progress.spent)} · {Math.round(progress.pct)}%
      </p>

      {editing ? (
        <div className="space-y-2">
          <Field label="Nowy limit miesięczny">
            <NumberInput
              value={amount}
              data-e2e="limits:total-amount"
              onValueChange={setAmount}
            />
          </Field>
          <Button data-e2e="limits:total-save" onClick={save}>
            Zapisz
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          data-e2e="limits:total-edit"
          onClick={() => {
            setAmount(limit.amount);
            setEditing(true);
          }}
        >
          Zmień limit
        </Button>
      )}
    </Card>
  );
};
