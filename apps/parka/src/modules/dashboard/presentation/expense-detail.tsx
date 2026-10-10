import { Pencil, Trash2 } from 'lucide-react';
import { APP_ROUTER } from '@/shared/router/routes';
import { categoryLabel } from '@/shared/i18n/category-label';
import { Button } from '@/shared/ui/controls';
import { CategoryAvatar } from '@/shared/ui/category-chip';
import { itemTotal, dateTimeLabel, money } from '../domain/format';
import type { Expense, Month } from '../domain/models';
import { useContext } from './context';
import { DetailDialog, DialogActions } from './detail-dialog';
import { categoryOf } from './selectors';

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between gap-3">
    <dt className="text-ink-soft">{label}</dt>
    <dd className="text-right">{value}</dd>
  </div>
);

/** Popup of a stored expense: read-only, editing opens the expense edit page. */
export const ExpenseDetail = ({
  modal,
  expense,
  month,
  onClose,
}: {
  modal: string;
  expense: Expense;
  month: Month;
  onClose: () => void;
}) => {
  const ctx = useContext();
  const categories = ctx.useCategories();
  const category = categoryOf(categories, expense.categoryId);

  const remove = () => {
    ctx.removeExpense(expense.id, month);
    onClose();
  };

  return (
    <DetailDialog
      modal={modal}
      data-e2e="dashboard:detail"
      title={expense.merchant}
      description={dateTimeLabel(expense.date)}
      avatar={<CategoryAvatar category={category} />}
      onClose={onClose}
    >
      <dl className="space-y-2 text-sm">
        <Row label="Kwota" value={money(expense.amount)} />
        <Row
          label="Kategoria"
          value={
            expense.categoryId
              ? categoryLabel(category.name)
              : 'Wiele kategorii'
          }
        />
        <Row label="Metoda płatności" value={expense.paymentMethod || '-'} />
        <Row label="Typ" value={expense.isBill ? 'Rachunek' : 'Zakup'} />
      </dl>

      {expense.items.length > 0 ? (
        <div className="mt-3 border-t border-line pt-3">
          <p className="mb-1 text-sm font-semibold">
            Produkty ({expense.items.length})
          </p>
          <ul className="space-y-1 text-sm">
            {expense.items.map((i) => (
              <li key={i.id} className="flex justify-between">
                <span className="text-ink-soft">
                  {i.name}
                  {i.quantity > 1 ? ` ×${i.quantity}` : ''}
                </span>
                <span className="tabular-nums">{money(itemTotal(i))}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <DialogActions
        danger={
          <Button
            variant="danger"
            className="w-auto"
            data-e2e="dashboard:delete"
            onClick={remove}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" /> Usuń
          </Button>
        }
      >
        <Button variant="ghost" className="w-auto" onClick={onClose}>
          Anuluj
        </Button>
        <Button
          className="w-auto"
          data-e2e="dashboard:edit"
          href={APP_ROUTER.expenseEdit({ id: expense.id, month })}
        >
          <Pencil className="h-4 w-4" aria-hidden="true" /> Edytuj
        </Button>
      </DialogActions>
    </DetailDialog>
  );
};
