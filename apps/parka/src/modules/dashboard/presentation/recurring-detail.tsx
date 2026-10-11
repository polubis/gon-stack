import { CategoryAvatar } from '@/shared/ui/category-chip';
import {
  closeModalThen,
  openModal,
  useModal,
} from '@/shared/router/modal-stack';
import { ScopeNote } from '@/shared/ui/scope-note';
import { money, plainDateLabel } from '../domain/format';
import type { Period } from '@/shared/period/period';
import type { Upcoming } from '../domain/models';
import { ConfirmDeleteDialog } from './confirm-delete-dialog';
import { useContext } from './context';
import { DetailDialog } from './detail-dialog';
import { deleteModal } from './modal-ids';
import { RecurringBadge, UpcomingBadge } from './recurring-badge';
import { RecurringForm } from './recurring-form';
import { categoryOf, intervalLabel } from './selectors';

/**
 * Popup of an upcoming (not yet charged) payment. It stands for its rule, so
 * editing or deleting reaches this payment and the following ones; what was
 * already charged is an ordinary expense and stays untouched.
 */
export const RecurringDetail = ({
  modal,
  upcoming,
  period,
  onClose,
}: {
  modal: string;
  upcoming: Upcoming;
  period: Period;
  onClose: () => void;
}) => {
  const ctx = useContext();
  const categories = ctx.useCategories();
  const { recurring } = upcoming;
  const charged = ctx
    .useExpenses()
    .filter((e) => e.recurringId === recurring.id)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  const confirmId = deleteModal(upcoming.id);
  const confirming = useModal(confirmId);

  return (
    <DetailDialog
      modal={modal}
      data-e2e="dashboard:recurring-dialog"
      title={recurring.name}
      description={`${intervalLabel(recurring.interval)} · płatność ${plainDateLabel(upcoming.date)}`}
      badge={
        <>
          <RecurringBadge />
          <UpcomingBadge />
        </>
      }
      avatar={
        <CategoryAvatar
          category={categoryOf(categories, recurring.categoryId)}
        />
      }
      onClose={onClose}
    >
      <ScopeNote className="mb-3" data-e2e="dashboard:scope-note">
        Edytujesz ten i kolejne wydatki. Zmiana obejmie tę płatność oraz
        następne; wydatki naliczone wcześniej zostają bez zmian.
      </ScopeNote>
      <RecurringForm
        recurring={recurring}
        period={period}
        onDone={onClose}
        onRemove={() => openModal(confirmId)}
      >
        {charged.length > 0 ? (
          <div
            className="border-t border-line pt-3"
            data-e2e="dashboard:recurring-detail"
          >
            <p className="mb-1 text-sm font-semibold">Historia płatności</p>
            <ul className="space-y-1 text-sm">
              {charged.map((e) => (
                <li key={e.id} className="flex justify-between">
                  <span className="text-ink-soft">
                    {plainDateLabel(e.occurrenceDate ?? e.date.slice(0, 10))}
                  </span>
                  <span className="tabular-nums">{money(e.amount)}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </RecurringForm>
      {confirming.isOpen ? (
        <ConfirmDeleteDialog
          modal={confirmId}
          title={`Usunąć wydatek cykliczny „${recurring.name}”?`}
          description="Usuniesz regułę: ta płatność i kolejne nie zostaną naliczone. Wydatki naliczone wcześniej zostają w historii."
          confirmLabel="Usuń regułę"
          onClose={confirming.close}
          onConfirm={() =>
            closeModalThen(confirmId, () => {
              ctx.removeRecurring(recurring.id, period);
              onClose();
            })
          }
        />
      ) : null}
    </DetailDialog>
  );
};
