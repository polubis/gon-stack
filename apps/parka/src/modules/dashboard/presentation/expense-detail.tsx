import { localMonth } from '@/shared/date/date';
import { Pencil, Trash2 } from 'lucide-react';
import { APP_ROUTER } from '@/shared/router/routes';
import { categoryLabel } from '@/shared/i18n/category-label';
import { DeviceIcon } from '@/shared/device/presentation/device-icon';
import {
  closeModalThen,
  openModal,
  useModal,
} from '@/shared/router/modal-stack';
import { Button } from '@/shared/ui/controls';
import { ScopeNote } from '@/shared/ui/scope-note';
import { CategoryAvatar } from '@/shared/ui/category-chip';
import { itemTotal, dateTimeLabel, money } from '../domain/format';
import type { Period } from '@/shared/period/period';
import type { Expense } from '../domain/models';
import { useContext } from './context';
import { ConfirmDeleteDialog } from './confirm-delete-dialog';
import { DetailDialog, DialogActions } from './detail-dialog';
import { deleteModal } from './modal-ids';
import { RecurringBadge } from './recurring-badge';
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
  period,
  onClose,
}: {
  modal: string;
  expense: Expense;
  period: Period;
  onClose: () => void;
}) => {
  const ctx = useContext();
  const categories = ctx.useCategories();
  const category = categoryOf(categories, expense.categoryId);

  const confirmId = deleteModal(expense.id);
  const confirming = useModal(confirmId);
  const fromRule = expense.recurringId !== null;

  return (
    <DetailDialog
      modal={modal}
      data-e2e="dashboard:detail"
      title={expense.merchant}
      description={dateTimeLabel(expense.date)}
      badge={fromRule ? <RecurringBadge /> : undefined}
      avatar={<CategoryAvatar category={category} />}
      onClose={onClose}
    >
      {fromRule ? (
        <ScopeNote className="mb-3" data-e2e="dashboard:scope-note">
          Ten wydatek został już naliczony. Edycja i usunięcie dotyczą tylko
          jego – reguła cykliczna i pozostałe wydatki zostają bez zmian.
        </ScopeNote>
      ) : null}
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
        {expense.device ? (
          <>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-soft">Urządzenie</dt>
              <dd className="flex min-w-0 items-center gap-1.5 text-right">
                <DeviceIcon
                  type={expense.device.type}
                  className="h-4 w-4 shrink-0"
                />
                <span data-e2e="dashboard:detail-device-name">
                  {expense.device.name}
                </span>
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="shrink-0 text-ink-soft">ID urządzenia</dt>
              <dd
                className="min-w-0 text-right font-mono text-xs break-all"
                data-e2e="dashboard:detail-device-id"
              >
                {expense.device.id}
              </dd>
            </div>
          </>
        ) : null}
      </dl>

      {expense.items.length > 0 ? (
        <div className="mt-3 border-t border-line pt-3">
          <p className="mb-1 text-sm font-semibold">
            Produkty ({expense.items.length})
          </p>
          <ul className="space-y-2 text-sm">
            {expense.items.map((i) => (
              <li key={i.id} className="flex items-center gap-3">
                <CategoryAvatar
                  category={categoryOf(categories, i.categoryId)}
                  className="h-7 w-7"
                />
                <span className="min-w-0 flex-1 truncate font-medium">
                  {i.name}
                </span>
                <span className="font-semibold tabular-nums">
                  {money(itemTotal(i))}
                </span>
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
            onClick={() => openModal(confirmId)}
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
          href={APP_ROUTER.expenseEdit({
            id: expense.id,
            month: localMonth(expense.date),
          })}
        >
          <Pencil className="h-4 w-4" aria-hidden="true" /> Edytuj
        </Button>
      </DialogActions>
      {confirming.isOpen ? (
        <ConfirmDeleteDialog
          modal={confirmId}
          title={`Usunąć wydatek „${expense.merchant}”?`}
          description={
            fromRule
              ? 'Usuniesz tylko ten wydatek. Reguła cykliczna i pozostałe wydatki zostają, a usunięty wydatek nie pojawi się ponownie.'
              : 'Wydatek zostanie usunięty z listy i podsumowania.'
          }
          confirmLabel="Usuń wydatek"
          onClose={confirming.close}
          onConfirm={() =>
            closeModalThen(confirmId, () => {
              ctx.removeExpense(expense.id, period);
              onClose();
            })
          }
        />
      ) : null}
    </DetailDialog>
  );
};
