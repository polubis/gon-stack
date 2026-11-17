import { useState } from 'react';
import { ExpenseForm } from '@/shared/expense-form/presentation/expense-form';
import { APP_ROUTER } from '@/shared/router/routes';
import { Button } from '@/shared/ui/controls';
import { ScopeNote } from '@/shared/ui/scope-note';
import { RecurringScopeDialog } from '@/shared/ui/recurring-scope-dialog';
import type { ExpenseFormValues } from '@/shared/expense-form/domain/models';
import type { StoredExpense } from '../domain/models';
import { useContext } from './context';

/** Edits a stored expense through the same shared form as adding one. */
export const EditExpenseForm = ({
  expense,
  month,
}: {
  expense: StoredExpense;
  month: string | null;
}) => {
  const ctx = useContext();
  const categories = ctx.useCategories();
  const saving = ctx.useSaving();
  // A recurring expense waits here while the user picks how far the edit reaches.
  const [pending, setPending] = useState<ExpenseFormValues | null>(null);

  return (
    <>
      {expense.recurringId !== null ? (
        <ScopeNote
          className="mb-4 max-w-xl"
          data-e2e="expenses-management:scope-note"
        >
          Ten wydatek należy do serii cyklicznej. Po zapisaniu wybierzesz, czy
          zmiana dotyczy wszystkich, tylko tego, tego i następnych, czy tylko
          następnych.
        </ScopeNote>
      ) : null}
      <ExpenseForm
        base={expense}
        categories={categories}
        saving={saving}
        submitLabel="Zapisz zmiany"
        actions={
          <Button
            variant="ghost"
            className="w-auto"
            href={APP_ROUTER.dashboard({ month: month ?? undefined })}
          >
            Anuluj
          </Button>
        }
        onSubmit={(values) =>
          expense.recurringId !== null
            ? setPending(values)
            : ctx.updateExpense({ ...expense, ...values })
        }
      />
      {pending ? (
        <RecurringScopeDialog
          action="edit"
          title={`Zapisać zmiany w „${pending.merchant}”?`}
          subject="Wybierz, które wydatki tej serii objąć zmianą. Samo naliczanie nie zmienia się."
          confirmLabel="Zapisz zmiany"
          onClose={() => setPending(null)}
          onConfirm={(scope) => {
            ctx.updateExpense({ ...expense, ...pending }, scope);
            setPending(null);
          }}
        />
      ) : null}
    </>
  );
};
