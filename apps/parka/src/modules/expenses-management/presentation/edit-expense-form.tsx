import { ExpenseForm } from '@/shared/expense-form/presentation/expense-form';
import { APP_ROUTER } from '@/shared/router/routes';
import { Button } from '@/shared/ui/controls';
import { ScopeNote } from '@/shared/ui/scope-note';
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

  return (
    <>
      {expense.recurringId !== null ? (
        <ScopeNote
          className="mb-4 max-w-xl"
          data-e2e="expenses-management:scope-note"
        >
          Ten wydatek został już naliczony z wydatku cyklicznego. Edytujesz
          tylko jego – reguła i pozostałe wydatki zostają bez zmian.
        </ScopeNote>
      ) : null}
      <ExpenseForm
        base={expense}
        categories={categories}
        saving={saving}
        layout="page"
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
        onSubmit={(values) => ctx.updateExpense({ ...expense, ...values })}
      />
    </>
  );
};
