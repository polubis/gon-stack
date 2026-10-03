import { categoryLabel } from '@/shared/i18n/category-label';
import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button, Field, inputClass } from '@/shared/ui/controls';
import { NumberInput } from '@/shared/ui/number-input';
import { CategoryAvatar } from '@/shared/ui/category-chip';
import { itemTotal, dateTimeLabel, money } from '../domain/format';
import type { CategoryId, Expense, Month } from '../domain/models';
import { useContext } from './context';
import { DetailDialog, DialogActions } from './detail-dialog';
import { categoryOf } from './selectors';

/** Popup of a stored expense: the fields are editable right away. */
export const ExpenseDetail = ({
  expense,
  month,
  onClose,
}: {
  expense: Expense;
  month: Month;
  onClose: () => void;
}) => {
  const ctx = useContext();
  const categories = ctx.useCategories();
  const category = categoryOf(categories, expense.categoryId);
  const [merchant, setMerchant] = useState(expense.merchant);
  const [amount, setAmount] = useState(expense.amount);
  const [categoryId, setCategoryId] = useState<CategoryId>(expense.categoryId);

  const save = () => {
    ctx.updateExpense({ ...expense, merchant, amount, categoryId }, month);
    onClose();
  };

  const remove = () => {
    ctx.removeExpense(expense.id, month);
    onClose();
  };

  return (
    <DetailDialog
      data-e2e="dashboard:detail"
      title={expense.merchant}
      description={dateTimeLabel(expense.date)}
      avatar={<CategoryAvatar category={category} />}
      onClose={onClose}
    >
      <div className="space-y-3">
        <Field label="Sklep">
          <input
            className={inputClass}
            value={merchant}
            data-e2e="dashboard:edit-merchant"
            onChange={(e) => setMerchant(e.target.value)}
          />
        </Field>
        <Field label="Kwota">
          <NumberInput
            value={amount}
            data-e2e="dashboard:edit-amount"
            onValueChange={setAmount}
          />
        </Field>
        <Field label="Kategoria">
          <select
            className={inputClass}
            value={categoryId}
            data-e2e="dashboard:edit-category"
            onChange={(e) =>
              setCategoryId(
                categories.find((c) => c.id === e.target.value)?.id ??
                  categoryId,
              )
            }
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {categoryLabel(c.name)}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-ink-soft">Metoda płatności</dt>
          <dd>{expense.paymentMethod}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-soft">Typ</dt>
          <dd>{expense.isBill ? 'Rachunek' : 'Zakup'}</dd>
        </div>
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
        <Button className="w-auto" data-e2e="dashboard:save" onClick={save}>
          Zapisz zmiany
        </Button>
      </DialogActions>
    </DetailDialog>
  );
};
