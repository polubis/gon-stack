import { categoryLabel } from '@/shared/i18n/category-label';
import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Trash2, Pencil } from 'lucide-react';
import {
  Button,
  Field,
  inputClass,
  NumberInput,
  CategoryAvatar,
} from '@/shared/ui';
import { UNCATEGORIZED } from '../configuration/constraints';
import { itemTotal, dateTimeLabel, money } from '../domain/format';
import type { CategoryId, Expense } from '../domain/models';
import { useContext } from './context';

export const ExpenseDetail = ({
  expense,
  editing,
  onEdit,
  onClose,
}: {
  expense: Expense;
  editing: boolean;
  onEdit: () => void;
  onClose: () => void;
}) => {
  const ctx = useContext();
  const categories = ctx.useCategories();
  const category =
    categories.find((c) => c.id === expense.categoryId) ??
    categories[0] ??
    UNCATEGORIZED;
  const [merchant, setMerchant] = useState(expense.merchant);
  const [amount, setAmount] = useState(expense.amount);
  const [categoryId, setCategoryId] = useState<CategoryId>(expense.categoryId);

  const save = () => {
    ctx.updateExpense({
      ...expense,
      merchant,
      amount,
      categoryId,
    });
    onClose();
  };

  const remove = () => {
    ctx.removeExpense(expense.id);
    onClose();
  };

  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-(--z-modal) bg-overlay" />
        <Dialog.Content
          data-e2e="dashboard:detail"
          className="fixed inset-x-4 bottom-4 z-(--z-modal) mx-auto max-w-md rounded-2xl lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2 bg-card p-4 focus:outline-none"
        >
          <div className="mb-3 flex items-center gap-3">
            <CategoryAvatar category={category} />
            <div className="flex-1">
              <Dialog.Title className="text-base font-semibold">
                {expense.merchant}
              </Dialog.Title>
              <Dialog.Description className="text-xs text-ink-soft">
                {dateTimeLabel(expense.date)}
              </Dialog.Description>
            </div>
            <Dialog.Close className="rounded-full px-2 py-1 text-sm text-ink-soft hover:bg-hover">
              Zamknij
            </Dialog.Close>
          </div>

          {editing ? (
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
              <Button data-e2e="dashboard:save" onClick={save}>
                Zapisz zmiany
              </Button>
            </div>
          ) : (
            <>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-ink-soft">Kwota</dt>
                  <dd className="font-semibold tabular-nums">
                    {money(expense.amount)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-soft">Kategoria</dt>
                  <dd>{categoryLabel(category.name)}</dd>
                </div>
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
                        <span className="tabular-nums">
                          {money(itemTotal(i))}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="mt-4 flex gap-2">
                <Button
                  variant="ghost"
                  data-e2e="dashboard:edit"
                  onClick={onEdit}
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" /> Edytuj
                </Button>
                <Button
                  variant="danger"
                  data-e2e="dashboard:delete"
                  onClick={remove}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" /> Usuń
                </Button>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
